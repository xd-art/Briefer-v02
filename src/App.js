import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Card from './components/Card';
import ActionButtons from './components/ActionButtons';
import ArticleGenerator from './components/ArticleGenerator';
import { optimizedLocalStorage } from './utils/performance';
import { convertToHtml } from './utils/markdown';

// Lazy load the CardEditor component
const CardEditor = lazy(() => import('./components/CardEditor'));

function App() {
  const [cards, setCards] = useState([]);
  const [articleTitle, setArticleTitle] = useState('');
  const [view, setView] = useState('loading'); // 'loading', 'generator', 'editor'
  const [showNotification, setShowNotification] = useState({ show: false, message: '', type: 'info' });
  const [isGenerating, setIsGenerating] = useState(false);
  const cardEditorRef = useRef();
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = optimizedLocalStorage.getItem('cardEditorData');
    const savedTitle = optimizedLocalStorage.getItem('articleTitle');

    if (savedData && Object.keys(savedData).length > 0) {
      try {
        const cardArray = Object.entries(savedData).map(([id, content]) => ({
          id,
          content
        }));
        setCards(cardArray);
        setArticleTitle(savedTitle || 'Untitled Article');
        setView('editor');
      } catch (error) {
        console.error('Error loading saved data:', error);
        setView('generator');
      }
    } else {
      setView('generator');
    }
  }, []);

  // Handle edit link clicks
  const handleEditCard = (card) => {
    // Dispatch custom event to open the editor
    const event = new CustomEvent('openEditModal', { detail: card });
    window.dispatchEvent(event);
  };

  const showNotificationMessage = (message, type = 'info') => {
    setShowNotification({ show: true, message, type });
    setTimeout(() => {
      setShowNotification({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  const saveAllData = () => {
    const cardsData = {};
    cards.forEach(card => {
      cardsData[card.id] = card.content;
    });
    optimizedLocalStorage.setItem('cardEditorData', cardsData);
    optimizedLocalStorage.setItem('articleTitle', articleTitle);
    optimizedLocalStorage.setItem('cardEditorTimestamp', new Date().toISOString());
    showNotificationMessage('All edits saved locally!', 'success');
  };

  const reloadPage = () => {
    if (window.confirm('Are you sure you want to start over? All unsaved changes will be lost.')) {
      optimizedLocalStorage.removeItem('cardEditorData');
      optimizedLocalStorage.removeItem('articleTitle');
      window.location.reload();
    }
  };

  const addNewCard = () => {
    // Instead of directly adding a new card, open the editor for a new card
    const newCard = {
      id: 'card-' + Date.now(),
      content: ''
    };

    // Dispatch custom event to open the editor for a new card
    const event = new CustomEvent('openEditModal', { detail: newCard });
    window.dispatchEvent(event);
  };

  const handleGenerate = async (topic, detailedPrompt) => {
    setIsGenerating(true);

    try {
      const systemPrompt = `You are an expert technical writer and content creator.
      Create a comprehensive, detailed guide on the topic: "${topic}".
      
      ${detailedPrompt ? `Additional instructions: ${detailedPrompt}` : ''}
      
      Return a JSON object with the following structure:
      {
        "title": "The Article Title",
        "sections": [
          {
            "id": "intro",
            "title": "Introduction",
            "content": "Detailed introduction content..."
          },
          {
            "id": "step1",
            "title": "Step 1 Title",
            "content": "Detailed content for step 1..."
          },
          ... more steps ...
          {
            "id": "conclusion",
            "title": "Conclusion",
            "content": "Conclusion content..."
          }
        ]
      }
      
      IMPORTANT:
      1. The content MUST be in Markdown format.
      2. Make the content detailed, practical, and high-quality.
      3. Use bolding, lists, and clear structure.
      4. Return ONLY the JSON object, no markdown code blocks around it.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'user', content: systemPrompt }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Parse JSON response
      let parsedResponse;
      try {
        // Extract JSON if wrapped in code blocks
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = JSON.parse(aiResponse);
        }
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.log('Raw Response:', aiResponse);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      setArticleTitle(parsedResponse.title);

      const newCards = parsedResponse.sections.map(section => {
        // Convert markdown content to HTML
        let htmlContent = convertToHtml(section.content);

        // Prepend the title as an H2 if it's not already there (simple check)
        if (!htmlContent.includes(`<h2`)) {
          htmlContent = `<h2 class="text-2xl font-semibold mb-4 text-gray-800">${section.title}</h2>` + htmlContent;
        }

        // Add edit link
        htmlContent += `<div class="flex justify-end"><a href="#" class="edit-link" data-card-id="${section.id}">EDIT</a></div>`;

        return {
          id: section.id || `card-${Date.now()}-${Math.random()}`,
          content: htmlContent
        };
      });

      setCards(newCards);

      // Save immediately
      const cardsData = {};
      newCards.forEach(card => {
        cardsData[card.id] = card.content;
      });
      optimizedLocalStorage.setItem('cardEditorData', cardsData);
      optimizedLocalStorage.setItem('articleTitle', parsedResponse.title);

      setView('editor');
      showNotificationMessage('Article generated successfully!', 'success');

    } catch (error) {
      console.error('Generation Error:', error);
      showNotificationMessage(`Generation failed: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Callback function to open the edit modal
  const handleOpenEditModal = (card) => {
    if (cardEditorRef.current && cardEditorRef.current.openEditModal) {
      cardEditorRef.current.openEditModal(card);
    }
  };

  // Preload the editor when the app loads
  useEffect(() => {
    // Set a timeout to simulate loading
    const timer = setTimeout(() => {
      setIsEditorLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (view === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (view === 'generator') {
    return <ArticleGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />;
  }

  return (
    <div className="bg-gray-100 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="container bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{articleTitle}</h1>
          <button onClick={reloadPage} className="text-gray-500 hover:text-red-500 text-sm">Start Over</button>
        </div>

        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onEdit={handleEditCard}
          />
        ))}

        <ActionButtons
          onSave={saveAllData}
          onAddCard={addNewCard}
          onClean={reloadPage}
        />
      </div>

      {/* Notification */}
      {showNotification.show && (
        <div className={`notification notification-${showNotification.type}`}>
          {showNotification.message}
        </div>
      )}

      {/* Edit Modal - Lazy loaded */}
      {isEditorLoaded && (
        <Suspense fallback={<div>Loading editor...</div>}>
          <CardEditor
            ref={cardEditorRef}
            cards={cards}
            setCards={setCards}
            showNotification={showNotificationMessage}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;