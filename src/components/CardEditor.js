import React, { useState, useEffect, useRef, useImperativeHandle, memo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { convertToHtml } from '../utils/markdown'; // Import the markdown utility
import { jsonRepair } from '../utils/jsonRepair';

// Function to remove citations like [1], [2], [123] from text
export function removeCitations(text) {
  return text.replace(/\[\d+\]/g, '');
}

const CardEditor = React.forwardRef(({ cards, setCards, showNotification }, ref) => {
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNewCard, setIsNewCard] = useState(false);
  const [lastAIRequest, setLastAIRequest] = useState(0);
  const [aiRequestCooldown] = useState(10000); // 10 seconds
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [promptCounter, setPromptCounter] = useState(0);
  const [aiStatus, setAiStatus] = useState('• AI Ready');

  const titleInputRef = useRef(null);
  const modalRef = useRef(null);
  const quillRef = useRef(null);
  const isLoadingContentRef = useRef(false);

  // Keep a ref to cards to access current state inside closures (like openEditModal)
  const cardsRef = useRef(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  // Keep a ref to cards to access current state inside closures (like openEditModal)
  /* Removed cardsRef as we now use explicit isNew flag */


  // Quill modules configuration to match original styling
  const modules = {
    toolbar: [
      [{ 'header': [3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  // Helper function for escaping HTML
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Define closeModal and saveCardChanges BEFORE useEffect hooks
  const closeModal = useCallback((force = false) => {
    if (!force && hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        return;
      }
    }

    setIsEditingMode(false);
    setCurrentCard(null);
    setIsNewCard(false);
    setHasUnsavedChanges(false);
    setTitle('');
    setContent('');
    setAiPrompt('');
    setPromptCounter(0);
    setAiStatus('\u2022 AI Ready');
  }, [hasUnsavedChanges]);

  const saveCardChanges = useCallback(() => {
    console.log('Saving card changes. isNewCard:', isNewCard, 'currentCard:', currentCard);

    // Validate that at least title or content is provided
    if (!title.trim() && !content.trim()) {
      showNotification('Please enter a title or content for the card.', 'warning');
      return;
    }

    // Create new card HTML
    let newHTML = '';

    if (title.trim()) {
      newHTML += `<h2 class="text-2xl font-semibold mb-4 text-gray-800">${escapeHtml(title.trim())}</h2>`;
    }

    if (content.trim()) {
      // Use the HTML content directly from Quill
      newHTML += content;
    }

    if (isNewCard) {
      console.log('Appending NEW card');
      // Create a new card
      const newCard = {
        id: 'card-' + Date.now(),
        content: newHTML
      };
      setCards([...cards, newCard]);
    } else {
      console.log('Updating EXISTING card', currentCard.id);
      // Update existing card
      const updatedCards = cards.map(card => {
        if (card.id === currentCard.id) {
          // Remove 'heading' property to avoid duplication (Rendered via Card.js AND content)
          // We are baking the title into the HTML content now.
          const { heading, ...rest } = card;
          return { ...rest, content: newHTML };
        }
        return card;
      });
      setCards(updatedCards);
    }

    // Show success feedback
    const message = isNewCard ? 'New card added successfully!' : 'Card updated successfully!';
    showNotification(message, 'success');

    // Close modal
    closeModal(true);
  }, [isNewCard, currentCard, title, content, showNotification, cards, setCards, closeModal]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openEditModal: (card) => {
      openEditModal(card);
    }
  }), []);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditingMode) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal();
        } else if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          saveCardChanges();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingMode, closeModal, saveCardChanges]);

  // Handle custom event for opening modal
  useEffect(() => {
    const handleOpenEditModal = (e) => {
      openEditModal(e.detail);
    };

    window.addEventListener('openEditModal', handleOpenEditModal);
    return () => {
      window.removeEventListener('openEditModal', handleOpenEditModal);
    };
  }, []);

  // Focus title input when modal opens
  useEffect(() => {
    if (isEditingMode && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 100);
    }
  }, [isEditingMode]);

  const openEditModal = (card) => {
    console.log('OpenEditModal called with:', card);
    isLoadingContentRef.current = true; // Prevent onChange from marking as unsaved

    setCurrentCard(card);
    setIsEditingMode(true);
    setHasUnsavedChanges(false);

    // 1. Check if card explicitly says it is new
    if (card.isNew) {
      console.log('Card has isNew: true flag');
      setIsNewCard(true);
      setTitle('');
      setContent('');
      // Delay to allow onChange events to settle
      setTimeout(() => {
        isLoadingContentRef.current = false;
      }, 100);
      return;
    }

    // 2. Safety check: Does this card ID exist in our current cards list?
    const existingCardIndex = cardsRef.current.findIndex(c => c.id === card.id);
    const idExists = existingCardIndex !== -1;
    console.log(`Card ID ${card.id} exists in list? ${idExists} (index: ${existingCardIndex})`);

    if (idExists) {
      console.log('Card exists in list -> Treating as EXISTING (isNewCard: false)');
      setIsNewCard(false);
    } else {
      // It doesn't exist in our list, and doesn't have isNew flag.
      // This is the ambiguous case.
      // If content is empty, maybe it's new?
      // But for "category articles" duplication bug, we want to err on side of "Existing" if possible,
      // but if we treat as existing and it's not in the list, save will do nothing.

      // Let's assume if it came in with content, it's NOT new, even if we can't find ID (maybe stale ID?).
      console.log('Card ID not found key logic fallback.');
      setIsNewCard(false);
    }

    // If card has explicit heading/content (e.g., category articles), use it directly
    if (card && typeof card.heading === 'string' && card.heading.trim() !== '') {
      setTitle(card.heading);
      setContent(card.content || '');
      // Delay to allow onChange events to settle
      setTimeout(() => {
        isLoadingContentRef.current = false;
      }, 100);
      return;
    }

    // Extract title and content from card HTML
    if (card.content && card.content.trim() !== '') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(card.content, 'text/html');

      const titleElement = doc.querySelector('h1, h2, h3, h4, h5, h6');
      const titleText = titleElement ? titleElement.textContent : '';

      // Remove title element to get content
      if (titleElement) {
        titleElement.remove();
      }

      // Get remaining content
      const contentElements = Array.from(doc.body.children);
      let contentHTML = '';
      contentElements.forEach(element => {
        if (element.classList && !element.classList.contains('flex')) {
          contentHTML += element.outerHTML;
        }
      });

      setTitle(titleText);
      setContent(contentHTML);
    } else {
      // Fallback for existing empty cards
      setTitle('');
      setContent('');
    }

    // Delay to allow onChange events to settle
    setTimeout(() => {
      isLoadingContentRef.current = false;
    }, 100);
  };

  const handleAiPromptChange = (e) => {
    const value = e.target.value;
    setAiPrompt(value);
    setPromptCounter(value.length);

    // Color coding based on length (matching original behavior)
    if (value.length < 10) {
      const counterElement = document.getElementById('promptCounter');
      if (counterElement) {
        counterElement.className = 'text-gray-400';
      }
    } else if (value.length <= 500) {
      const counterElement = document.getElementById('promptCounter');
      if (counterElement) {
        counterElement.className = 'text-green-600';
      }
    } else {
      // Trim to maximum length
      const trimmedValue = value.substring(0, 500);
      setAiPrompt(trimmedValue);
      setPromptCounter(500);
      const counterElement = document.getElementById('promptCounter');
      if (counterElement) {
        counterElement.className = 'text-red-600';
      }
    }
  };

  const validatePrompt = (prompt) => {
    // Length validation
    if (prompt.length < 10) {
      return { isValid: false, error: 'Prompt too short. Minimum 10 characters required.' };
    }
    if (prompt.length > 500) {
      return { isValid: false, error: 'Prompt too long. Maximum 500 characters allowed.' };
    }

    // Forbidden phrases
    const forbiddenPhrases = [
      'измени тему',
      'добавь рекламу',
      'смени направление',
      'change topic',
      'add advertisement',
      'change direction'
    ];

    const lowerPrompt = prompt.toLowerCase();
    for (const phrase of forbiddenPhrases) {
      if (lowerPrompt.includes(phrase.toLowerCase())) {
        return {
          isValid: false,
          error: `Forbidden phrase detected: "${phrase}". Please reformulate your request for clarity/structure improvement.`
        };
      }
    }

    return { isValid: true };
  };

  const sendAIPrompt = async () => {
    const validation = validatePrompt(aiPrompt);
    if (!validation.isValid) {
      showNotification(`Validation Error: ${validation.error}`, 'error');
      return;
    }

    // Check rate limiting
    const now = Date.now();
    if (now - lastAIRequest < aiRequestCooldown) {
      const remainingTime = Math.ceil((aiRequestCooldown - (now - lastAIRequest)) / 1000);
      showNotification(`Please wait ${remainingTime} seconds before next AI request.`, 'warning');
      return;
    }

    // Show loading state
    setAiStatus('• Processing...');
    const statusElement = document.getElementById('aiStatus');
    if (statusElement) {
      statusElement.className = 'ml-2 text-blue-600 text-xs';
    }

    try {
      const response = await fetch('http://localhost:3003/api/ai/improve-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          content: content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details || errorData.error || `API request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse = data.content;

      if (aiResponse.startsWith('ERROR:')) {
        showNotification(aiResponse, 'error');
      } else {

        // Convert AI-generated content from markdown/plain text to HTML
        const htmlContent = convertToHtml(aiResponse);
        setContent(htmlContent);
      }

      // Mark as having unsaved changes
      setHasUnsavedChanges(true);

      showNotification('AI improvements applied! Review and save changes.', 'success');
      setLastAIRequest(now);
    } catch (error) {
      console.error('AI API Error:', error);
      showNotification('AI service temporarily unavailable. Please try again later.', 'error');
    } finally {
      setAiStatus('• AI Ready');
      const statusElement = document.getElementById('aiStatus');
      if (statusElement) {
        statusElement.className = 'ml-2 text-green-600 text-xs';
      }
      setAiPrompt('');
      setPromptCounter(0);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (!isLoadingContentRef.current) {
      setHasUnsavedChanges(true);
    }
  };

  const handleContentChange = (value) => {
    setContent(value);
    if (!isLoadingContentRef.current) {
      setHasUnsavedChanges(true);
    }
  };

  // Handle Enter key in AI prompt (matching original behavior)
  const handleAiPromptKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAIPrompt();
    }
  };

  // Memoize the Quill component to prevent unnecessary re-renders
  const quillModules = React.useMemo(() => modules, []);
  const quillFormats = React.useMemo(() => formats, []);

  return (
    <div
      id="editModal"
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-0 hidden"
      style={{ display: isEditingMode ? 'flex' : 'none', zIndex: 'var(--z-modal-content)' }}
      ref={modalRef}
    >
      <div className="bg-white rounded-none w-full h-full shadow-xl transition-all duration-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          {/* Buttons moved to top and right-aligned */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center space-x-4">
              <button
                id="saveCardEdit"
                className="text-blue-500 font-semibold text-sm hover:underline focus:outline-none"
                onClick={saveCardChanges}
              >
                SAVE
              </button>
              <button
                id="closeModal"
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={closeModal}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Title input below buttons */}
          <input
            type="text"
            id="cardTitle"
            className="text-xl font-bold text-gray-800 border-none outline-none bg-transparent w-full"
            placeholder="Enter section title"
            value={title}
            onChange={handleTitleChange}
            ref={titleInputRef}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              className="h-full"
              style={{ border: 'none', outline: 'none' }}
            />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col items-end">
              <textarea
                id="aiPrompt"
                className="w-full p-3 rounded-lg outline-none text-gray-600 resize-none transition-colors focus:border-blue-300"
                placeholder="Write prompt for AI assistance..."
                rows="2"
                value={aiPrompt}
                onChange={handleAiPromptChange}
                onKeyDown={handleAiPromptKeyDown}
              />
              <div className="mt-2 flex items-center justify-between w-full">
                <div className="text-xs text-gray-400">
                  <span id="promptCounter">{promptCounter}</span>/500 characters
                  <span id="aiStatus" className="ml-2 text-green-600 text-xs">{aiStatus}</span>
                </div>
                <button
                  id="sendPrompt"
                  className="p-2 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={sendAIPrompt}
                  disabled={aiStatus === '• Processing...'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoize the component to prevent unnecessary re-renders
export default memo(CardEditor);