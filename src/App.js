import React, { useState, useEffect, useRef } from 'react';
import CardEditor from './components/CardEditor';

function App() {
  const [cards, setCards] = useState([]);
  const [showNotification, setShowNotification] = useState({ show: false, message: '', type: 'info' });
  const cardEditorRef = useRef();

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('cardEditorData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const cardArray = Object.entries(parsedData).map(([id, content]) => ({
          id,
          content
        }));
        setCards(cardArray);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    } else {
      // Initialize with default content if no saved data
      const defaultCards = [
        {
          id: 'intro',
          content: `
            <h2 class="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
            <p class="text-gray-600 mb-4">Welcome to our revolutionary card-based editing system! This innovative approach allows you to edit text content in an intuitive, modular way. Each paragraph or section of your article becomes an editable card that you can modify independently.</p>
            <div class="flex justify-end">
              <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="intro">EDIT</a>
            </div>
          `
        },
        {
          id: 'main-content',
          content: `
            <h2 class="text-2xl font-semibold mb-4 text-gray-800">How the Card System Works</h2>
            <p class="text-gray-600 mb-2">Each text block in this article is contained within a card. When you click the EDIT link, you'll see a modal dialog where you can modify the text content using our advanced editor.</p>
            <p class="text-gray-600 mb-4">The editor includes AI assistance features - simply type your prompt in the dedicated field and use the up arrow (↑) button to send it for processing. This helps you improve, expand, or refine your content with intelligent suggestions.</p>
            <div class="flex justify-end">
              <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="main-content">EDIT</a>
            </div>
          `
        },
        {
          id: 'features',
          content: `
            <h2 class="text-2xl font-semibold mb-4 text-gray-800">Key Features</h2>
            <p class="text-gray-600 mb-4">Intuitive Editing: Click the edit button to open a modal with advanced text editing capabilities. AI Integration: Use prompts to enhance your content with AI assistance. Save Options: Choose between saving edits temporarily or saving to your profile permanently. Responsive Design: Works seamlessly on both desktop and mobile devices. Keyboard Shortcuts: Use Ctrl+Enter to save or Esc to cancel in the editor.</p>
            <div class="flex justify-end">
              <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="features">EDIT</a>
            </div>
          `
        },
        {
          id: 'conclusion',
          content: `
            <h2 class="text-2xl font-semibold mb-4 text-gray-800">Conclusion</h2>
            <p class="text-gray-600 mb-4">This card-based editing system represents the future of content creation and editing. By breaking down articles into manageable, editable cards, we make the writing and editing process more intuitive and efficient. Try editing any of these cards to experience the system firsthand!</p>
            <div class="flex justify-end">
              <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="conclusion">EDIT</a>
            </div>
          `
        }
      ];
      setCards(defaultCards);
    }
  }, []);

  // Handle edit link clicks
  useEffect(() => {
    const handleEditClick = (e) => {
      if (e.target.classList.contains('edit-link')) {
        e.preventDefault();
        const cardId = e.target.dataset.cardId;
        const card = cards.find(c => c.id === cardId);
        if (card && cardEditorRef.current) {
          // Access the openEditModal function through the CardEditor component
          // We'll need to pass a callback to the CardEditor component
          const event = new CustomEvent('openEditModal', { detail: card });
          window.dispatchEvent(event);
        }
      }
    };

    document.addEventListener('click', handleEditClick);
    return () => {
      document.removeEventListener('click', handleEditClick);
    };
  }, [cards]);

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
    localStorage.setItem('cardEditorData', JSON.stringify(cardsData));
    localStorage.setItem('cardEditorTimestamp', new Date().toISOString());
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

  return (
    <div className="bg-gray-100 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="container bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Getting Started with Card Editing</h1>
        
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="mb-8" 
            data-card-id={card.id}
            dangerouslySetInnerHTML={{ __html: card.content }}
          />
        ))}
        
        <div className="mt-8 flex justify-center w-full px-4 space-x-8">
          <button 
            id="saveEdits" 
            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-600"
            onClick={saveAllData}
          >
            Save
          </button>
          <div 
            id="addCard" 
            className="bg-blue-500 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-blue-600 cursor-pointer"
            onClick={addNewCard}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
            </svg>
          </div>
          <button 
            id="saveToProfile" 
            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-600"
            onClick={reloadPage}
          >
            Clean
          </button>
        </div>
      </div>
      
      {/* Notification */}
      {showNotification.show && (
        <div className={`notification notification-${showNotification.type}`}>
          {showNotification.message}
        </div>
      )}
      
      {/* Edit Modal */}
      <CardEditor 
        ref={cardEditorRef}
        cards={cards} 
        setCards={setCards} 
        showNotification={showNotificationMessage} 
      />
    </div>
  );
}

export default App;