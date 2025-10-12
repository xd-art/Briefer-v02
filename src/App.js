import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Card from './components/Card';
import ActionButtons from './components/ActionButtons';
import { optimizedLocalStorage } from './utils/performance';

// Lazy load the CardEditor component
const CardEditor = lazy(() => import('./components/CardEditor'));

function App() {
  const [cards, setCards] = useState([]);
  const [showNotification, setShowNotification] = useState({ show: false, message: '', type: 'info' });
  const cardEditorRef = useRef();
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = optimizedLocalStorage.getItem('cardEditorData');
    if (savedData) {
      try {
        const cardArray = Object.entries(savedData).map(([id, content]) => ({
          id,
          content
        }));
        setCards(cardArray);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    } else {
      // Initialize with article content
      const articleCards = [
        {
          id: 'background',
          content: '<h2 class="text-2xl font-semibold mb-4 text-gray-800">Background and Overview Information</h2>' +
            '<p class="text-gray-600 mb-4">The background and overview section of a project brief explains what the project is about and what needs to be achieved.</p>' +
            '<p class="text-gray-600 mb-4">It includes information about the product and the main message that needs to be conveyed. This section sets the context for the project and aligns everyone\'s understanding.</p>' +
            '<p class="text-gray-600 mb-4">A company that has been in the market for a long time typically has ready-made materials such as a brand book or presentation. Simply attach all relevant materials and provide a general description of the project. Beginners can share basic information about themselves, their business, and their project ideas.</p>' +
            '<p class="text-gray-600 mb-4">Before establishing a long-term partnership, it\'s natural for people to want to learn more about each other. A creative brief is a useful tool for this, allowing both parties to understand each other\'s past experiences and goals. While extensive personal details aren\'t necessary, clearly outlining the project\'s purpose is essential. <b>This helps build trust and leads to better outcomes.</b></p>' +
            '<div class="flex justify-end">' +
              '<a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="background">EDIT</a>' +
            '</div>'
        },
        {
          id: 'goals',
          content: '<h2 class="text-2xl font-semibold mb-4 text-gray-800">Setting Goals and Objectives</h2>' +
            '<p class="text-gray-600 mb-4">Setting goals and objectives involves defining broad outcomes (goals) and specific, measurable, time-bound actions (objectives) to achieve them. Using the SMART framework—Specific, Measurable, Achievable, Relevant, and Time-bound—provides a clear roadmap for success, fostering motivation and clarity.</p>' +
            '<div class="flex justify-end">' +
              '<a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="goals">EDIT</a>' +
            '</div>'
        },
        {
          id: 'results',
          content: '<h2 class="text-2xl font-semibold mb-4 text-gray-800">Setting Measurable Results</h2>' +
            '<p class="text-gray-600 mb-4">To set measurable results in a project brief, define specific, quantifiable outcomes using the SMART framework. Identify key performance indicators (KPIs) to track progress, and use numerical data and milestones to evaluate success against the set deadline.</p>' +
            '<div class="flex justify-end">' +
              '<a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="results">EDIT</a>' +
            '</div>'
        }
      ];
      setCards(articleCards);
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
    optimizedLocalStorage.setItem('cardEditorTimestamp', new Date().toISOString());
    showNotificationMessage('All edits saved locally!', 'success');
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const addNewCard = () => {
    const newCard = {
      id: 'card-' + Date.now(),
      content: `
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">New Card</h2>
        <p class="text-gray-600 mb-4">Click EDIT to add content to this new card.</p>
        <div class="flex justify-end">
          <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="card-${Date.now()}">EDIT</a>
        </div>
      `
    };
    setCards([...cards, newCard]);
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

  return (
    <div className="bg-gray-100 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="container bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Basic Information About How to Write a Creative Project Brief for Any Digital Work</h1>
        
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