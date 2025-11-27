import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Card from './components/Card';
import ActionButtons from './components/ActionButtons';
import ArticleGenerator from './components/ArticleGenerator';
import RefinementBar from './components/RefinementBar';
import FilterModal from './components/FilterModal';
import { optimizedLocalStorage } from './utils/performance';
import { convertToHtml } from './utils/markdown';
import { ArticleManager } from './utils/ArticleManager';

// Lazy load the CardEditor component
const CardEditor = lazy(() => import('./components/CardEditor'));

function App() {
    const [cards, setCards] = useState([]);
    const [articleTitle, setArticleTitle] = useState('');
    const [view, setView] = useState('loading'); // 'loading', 'generator', 'editor'
    const [showNotification, setShowNotification] = useState({ show: false, message: '', type: 'info' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentArticleId, setCurrentArticleId] = useState(null);
    const cardEditorRef = useRef();
    const [isEditorLoaded, setIsEditorLoaded] = useState(false);
    const [refinementPrompt, setRefinementPrompt] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const titleInputRef = useRef(null);

    // Helper for notifications
    const showNotificationMessage = (message, type = 'info') => {
        setShowNotification({ show: true, message, type });
        setTimeout(() => {
            setShowNotification({ show: false, message: '', type: 'info' });
        }, 4000);
    };

    // Core generation logic
    const handleGenerate = async (topic, detailedPrompt, targetId = null) => {
        setIsGenerating(true);

        // Determine ID: use targetId if provided, otherwise create new
        let activeId = targetId;
        if (!activeId) {
            activeId = ArticleManager.createArticle(topic);
            setCurrentArticleId(activeId);
            // Update URL to reflect the new ID
            window.history.pushState(null, '', `?id=${activeId}`);
        }

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
      
      IMPORTANT RULES:
      1. The content MUST be in Markdown format.
      2. Make the content detailed, practical, and high-quality.
      3. Use bolding, lists, and clear structure.
      4. Return ONLY the JSON object, no markdown code blocks around it.
      
      CRITICAL - AI LINKS:
      If you mention a complex sub-topic that deserves its own separate guide (e.g., "Setting up Nginx", "Configuring DNS", "Installing Node.js"), you MUST wrap that phrase in a special <ai-link> tag.
      Format: <ai-link topic="Exact Topic Title" template="guide">visible text</ai-link>
      
      Example:
      "First, you need to <ai-link topic="How to install Node.js" template="guide">install Node.js</ai-link> on your server."
      
      Use these links generously to create a network of knowledge.`;

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

            // Save to ArticleManager
            ArticleManager.saveArticle(activeId, {
                title: parsedResponse.title,
                cards: newCards
            });

            setView('editor');
            showNotificationMessage('Article generated successfully!', 'success');

        } catch (error) {
            console.error('Generation Error:', error);
            showNotificationMessage(`Generation failed: ${error.message}`, 'error');
            // If generation failed on a new article, maybe we should stay in generator view?
            // But we already created the ID. Let's leave it for now.
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate dynamic filters based on article topic
    const generateFilters = () => {
        return [
            {
                id: 'style',
                label: 'Style',
                type: 'segmented',
                options: [
                    { value: 'casual', label: 'Casual' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'technical', label: 'Technical' }
                ]
            },
            {
                id: 'length',
                label: 'Length',
                type: 'segmented',
                options: [
                    { value: 'brief', label: 'Brief' },
                    { value: 'detailed', label: 'Detailed' },
                    { value: 'comprehensive', label: 'Comprehensive' }
                ]
            },
            {
                id: 'audience',
                label: 'Target Audience',
                type: 'chips',
                options: [
                    { value: 'beginners', label: 'Beginners' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'experts', label: 'Experts' },
                    { value: 'general', label: 'General Public' }
                ]
            },
            {
                id: 'format',
                label: 'Format',
                type: 'chips',
                options: [
                    { value: 'step-by-step', label: 'Step-by-Step' },
                    { value: 'checklist', label: 'Checklist' },
                    { value: 'overview', label: 'Overview' },
                    { value: 'comparison', label: 'Comparison' }
                ]
            },
            {
                id: 'extras',
                label: 'Additional Sections',
                type: 'chips',
                options: [
                    { value: 'tips', label: 'Tips & Tricks' },
                    { value: 'mistakes', label: 'Common Mistakes' },
                    { value: 'faq', label: 'FAQ' },
                    { value: 'resources', label: 'Resources' }
                ]
            }
        ];
    };

    // Handle filter changes
    const handleFilterChange = (filterId, value, isMulti = false) => {
        setSelectedFilters(prev => {
            if (isMulti) {
                const currentValues = prev[filterId] || [];
                const newValues = currentValues.includes(value)
                    ? currentValues.filter(v => v !== value)
                    : [...currentValues, value];
                return { ...prev, [filterId]: newValues };
            }
            return { ...prev, [filterId]: value };
        });
    };

    // Clean all filters
    const handleCleanFilters = () => {
        setSelectedFilters({});
    };

    // Regenerate with filters
    const handleRegenerateWithFilters = () => {
        setShowFilterModal(false);

        // Build detailed prompt from filters
        let detailedPrompt = '';

        if (selectedFilters.style) {
            detailedPrompt += `Style: ${selectedFilters.style}. `;
        }
        if (selectedFilters.length) {
            detailedPrompt += `Length: ${selectedFilters.length}. `;
        }
        if (selectedFilters.audience && selectedFilters.audience.length > 0) {
            detailedPrompt += `Target audience: ${selectedFilters.audience.join(', ')}. `;
        }
        if (selectedFilters.format && selectedFilters.format.length > 0) {
            detailedPrompt += `Format: ${selectedFilters.format.join(', ')}. `;
        }
        if (selectedFilters.extras && selectedFilters.extras.length > 0) {
            detailedPrompt += `Include: ${selectedFilters.extras.join(', ')}. `;
        }

        const fullPrompt = refinementPrompt.trim()
            ? `How to ${refinementPrompt}`
            : articleTitle;

        handleGenerate(fullPrompt, detailedPrompt, currentArticleId);
        setRefinementPrompt('');
    };

    // Load filters when modal opens
    useEffect(() => {
        if (showFilterModal && filters.length === 0) {
            setFilters(generateFilters());
        }
    }, [showFilterModal]);

    // Initialization & Routing
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('id');
        const urlTopic = params.get('topic');
        const urlTemplate = params.get('template');

        if (urlId) {
            // Case 1: Load existing article by ID
            const article = ArticleManager.getArticle(urlId);
            if (article) {
                setCurrentArticleId(urlId);
                setArticleTitle(article.title);
                setCards(article.cards || []);
                setView('editor');
            } else {
                console.error('Article not found');
                showNotificationMessage('Article not found. Redirecting to generator.', 'error');
                window.history.replaceState(null, '', '/');
                setView('generator');
            }
        } else if (urlTopic) {
            // Case 2: AI Link Trigger (New Article from Topic)
            // Create the article immediately
            const newId = ArticleManager.createArticle(urlTopic, urlTemplate || 'guide');
            setCurrentArticleId(newId);
            setArticleTitle(urlTopic);

            // Update URL so we don't regenerate on reload
            window.history.replaceState(null, '', `?id=${newId}`);

            // Trigger generation
            handleGenerate(urlTopic, null, newId);
        } else {
            // Case 3: No ID, No Topic. Check for legacy data migration or show generator.
            const migratedId = ArticleManager.migrateOldData();
            if (migratedId) {
                const article = ArticleManager.getArticle(migratedId);
                setCurrentArticleId(migratedId);
                setArticleTitle(article.title);
                setCards(article.cards || []);
                setView('editor');
                window.history.replaceState(null, '', `?id=${migratedId}`);
                showNotificationMessage('Restored your previous session.', 'info');
            } else {
                setView('generator');
            }
        }
    }, []);

    // Handle edit link clicks
    const handleEditCard = (card) => {
        const event = new CustomEvent('openEditModal', { detail: card });
        window.dispatchEvent(event);
    };

    const saveAllData = () => {
        if (!currentArticleId) {
            // Should not happen in editor view, but safety check
            const newId = ArticleManager.createArticle(articleTitle || 'Untitled');
            setCurrentArticleId(newId);
            window.history.pushState(null, '', `?id=${newId}`);
        }

        ArticleManager.saveArticle(currentArticleId, {
            title: articleTitle,
            cards: cards
        });

        showNotificationMessage('All edits saved to Library!', 'success');
    };

    const reloadPage = () => {
        if (window.confirm('Are you sure you want to start over? You will return to the generator.')) {
            window.location.href = '/';
        }
    };

    const addNewCard = () => {
        const newCard = {
            id: 'card-' + Date.now(),
            content: ''
        };
        const event = new CustomEvent('openEditModal', { detail: newCard });
        window.dispatchEvent(event);
    };

    // Callback function to open the edit modal
    const handleOpenEditModal = (card) => {
        if (cardEditorRef.current && cardEditorRef.current.openEditModal) {
            cardEditorRef.current.openEditModal(card);
        }
    };

    // Title Editing Handlers
    const handleTitleClick = () => {
        setIsEditingTitle(true);
        setTimeout(() => {
            if (titleInputRef.current) {
                titleInputRef.current.focus();
            }
        }, 100);
    };

    const handleTitleChange = (e) => {
        setArticleTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        saveAllData(); // Auto-save on blur
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            titleInputRef.current.blur(); // This will trigger handleTitleBlur and save
        }
    };

    // Preload the editor when the app loads
    useEffect(() => {
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
                <div className="flex justify-end mb-2">
                    <button
                        onClick={reloadPage}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        title="Start Over"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        className="text-4xl font-bold mb-8 text-gray-900 w-full border-b-2 border-blue-500 focus:outline-none"
                        value={articleTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                    />
                ) : (
                    <h1
                        className="text-4xl font-bold mb-8 text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 -ml-2 transition-colors duration-200"
                        onClick={handleTitleClick}
                        title="Click to edit title"
                    >
                        {articleTitle}
                    </h1>
                )}

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

            {/* Refinement Bar - Fixed Bottom */}
            <RefinementBar
                value={refinementPrompt}
                onChange={setRefinementPrompt}
                onFilterClick={() => setShowFilterModal(true)}
                onSend={() => {
                    if (refinementPrompt.trim() || Object.keys(selectedFilters).length > 0) {
                        handleRegenerateWithFilters();
                    }
                }}
                isGenerating={isGenerating}
                hasFilters={Object.keys(selectedFilters).length > 0}
            />

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClean={handleCleanFilters}
                onRegenerate={handleRegenerateWithFilters}
                isLoading={false}
            />

            {/* Notification */}
            {
                showNotification.show && (
                    <div className={`notification notification-${showNotification.type}`}>
                        {showNotification.message}
                    </div>
                )
            }

            {/* Edit Modal - Lazy loaded */}
            {
                isEditorLoaded && (
                    <Suspense fallback={<div>Loading editor...</div>}>
                        <CardEditor
                            ref={cardEditorRef}
                            cards={cards}
                            setCards={setCards}
                            showNotification={showNotificationMessage}
                        />
                    </Suspense>
                )
            }
        </div >
    );
}

export default App;
