// Card-Based Article Editor - Stage 1
// JavaScript functionality for interactive card editing

class CardEditor {
    constructor() {
        this.currentCard = null;
        this.originalContent = '';
        this.isEditingMode = false;
        this.hasUnsavedChanges = false;
        this.isNewCard = false;
        this.originalCardsContent = {};
        this.lastAIRequest = 0; // For rate limiting
        this.aiRequestCooldown = 10000; // 10 seconds
        
        this.init();
    }
    
    init() {
        this.storeOriginalContent(); // Store original content before any editing
        this.bindEvents();
        this.setupKeyboardShortcuts();
        this.loadSavedData();
    }
    
    storeOriginalContent() {
        // Store the original content of all cards before any editing
        document.querySelectorAll('[data-card-id]').forEach(card => {
            const cardId = card.dataset.cardId;
            const cardClone = card.cloneNode(true);
            const editLink = cardClone.querySelector('.edit-link');
            if (editLink && editLink.parentNode) {
                editLink.parentNode.remove();
            }
            this.originalCardsContent[cardId] = cardClone.innerHTML;
        });
    }
    
    bindEvents() {
        // Use event delegation for edit links
        this.handleEditClick = (e) => {
            if (e.target.classList.contains('edit-link')) {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('[data-card-id]');
                if (card) {
                    this.openEditModal(card);
                }
            }
        };
        document.addEventListener('click', this.handleEditClick);
        
        // Modal controls
        const modal = document.getElementById('editModal');
        const closeBtn = document.getElementById('closeModal');
        const saveBtn = document.getElementById('saveCardEdit');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        saveBtn.addEventListener('click', () => this.saveCardChanges());
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // AI Prompt functionality
        const sendPromptBtn = document.getElementById('sendPrompt');
        const promptInput = document.getElementById('aiPrompt');
        const promptCounter = document.getElementById('promptCounter');
        
        sendPromptBtn.addEventListener('click', () => this.sendAIPrompt());
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendAIPrompt();
            }
        });
        
        // Character counter for AI prompt
        promptInput.addEventListener('input', (e) => {
            const length = e.target.value.length;
            promptCounter.textContent = length;
            
            // Color coding based on length
            if (length < 10) {
                promptCounter.className = 'text-gray-400';
            } else if (length <= 500) {
                promptCounter.className = 'text-green-600';
            } else {
                promptCounter.className = 'text-red-600';
                // Trim to maximum length
                e.target.value = e.target.value.substring(0, 500);
                promptCounter.textContent = 500;
            }
        });
        
        // Header action buttons
        document.getElementById('saveEdits').addEventListener('click', () => this.saveEdits());
        document.getElementById('saveToProfile').addEventListener('click', () => this.reloadPage());
        document.getElementById('addCard').addEventListener('click', () => this.addNewCard());
        
        // Track changes in editor and title
        const editor = document.getElementById('cardEditor');
        const titleInput = document.getElementById('cardTitle');
        
        editor.addEventListener('input', () => {
            this.hasUnsavedChanges = true;
        });
        
        titleInput.addEventListener('input', () => {
            this.hasUnsavedChanges = true;
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when modal is open
            if (this.isEditingMode) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closeModal();
                } else if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.saveCardChanges();
                }
            }
        });
    }
    
    openEditModal(card) {
        this.currentCard = card;
        this.isEditingMode = true;
        
        // Get the card content (excluding the edit link)
        const cardContent = card.cloneNode(true);
        const editLink = cardContent.querySelector('.edit-link');
        if (editLink && editLink.parentNode) {
            editLink.parentNode.remove();
        }
        this.originalContent = cardContent.innerHTML;
        
        // Extract title and content
        const titleElement = cardContent.querySelector('h2');
        const title = titleElement ? titleElement.textContent : '';
        
        // Get text content without the title
        if (titleElement) {
            titleElement.remove();
        }
        const textContent = this.extractTextContent(cardContent);
        
        // Populate the editor fields
        document.getElementById('cardTitle').value = title;
        document.getElementById('cardEditor').value = textContent;
        
        // Show modal
        const modal = document.getElementById('editModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Focus the title input
        setTimeout(() => {
            document.getElementById('cardTitle').focus();
        }, 100);
        
        // Reset states
        this.hasUnsavedChanges = false;
    }
    
    closeModal() {
        if (this.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
                return;
            }
        }
        
        const modal = document.getElementById('editModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // Clear AI prompt
        document.getElementById('aiPrompt').value = '';
        
        this.currentCard = null;
        this.isEditingMode = false;
        this.isNewCard = false;
        this.hasUnsavedChanges = false;
    }
    
    saveCardChanges() {
        if (!this.currentCard) return;
        
        const title = document.getElementById('cardTitle').value.trim();
        const content = document.getElementById('cardEditor').value.trim();
        
        // Validate that at least title or content is provided
        if (!title && !content) {
            this.showNotification('Please enter a title or content for the card.', 'warning');
            return;
        }
        
        // Create new card HTML
        let newHTML = '';
        
        if (title) {
            newHTML += `<h2 class="text-2xl font-semibold mb-4 text-gray-800">${this.escapeHtml(title)}</h2>`;
        }
        
        if (content) {
            // Convert text content to paragraphs
            const paragraphs = content.split('\n\n').filter(p => p.trim());
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    newHTML += `<p class="text-gray-600 mb-4">${this.escapeHtml(paragraph.trim())}</p>`;
                }
            });
        }
        
        if (this.isNewCard) {
            // Create a new card and add it to the article
            this.addCardToArticle(newHTML);
        } else {
            // Update existing card
            this.updateExistingCard(newHTML);
        }
        
        // Save to localStorage
        this.saveCardData();
        
        // Show success feedback
        const message = this.isNewCard ? 'New card added successfully!' : 'Card updated successfully!';
        this.showNotification(message, 'success');
        
        // Close modal
        this.closeModal();
    }
    
    addCardToArticle(htmlContent) {
        // Generate unique card ID
        const cardId = 'card-' + Date.now();
        
        // Create new card element
        const newCard = document.createElement('div');
        newCard.className = 'mb-8';
        newCard.dataset.cardId = cardId;
        newCard.innerHTML = htmlContent;
        
        // Add edit link
        const editLinkDiv = document.createElement('div');
        editLinkDiv.className = 'flex justify-end';
        editLinkDiv.innerHTML = '<a href="#" class="text-blue-500 font-medium text-sm edit-link">EDIT</a>';
        newCard.appendChild(editLinkDiv);
        
        // Find the button container and insert new card before it
        const buttonContainer = document.querySelector('.mt-8.flex.justify-center');
        const parentContainer = buttonContainer.parentNode;
        parentContainer.insertBefore(newCard, buttonContainer);
        
        // Add to original content storage
        const cardClone = newCard.cloneNode(true);
        const editLink = cardClone.querySelector('.edit-link');
        if (editLink && editLink.parentNode) {
            editLink.parentNode.remove();
        }
        this.originalCardsContent[cardId] = cardClone.innerHTML;
        
        // Rebind events to include the new card
        this.rebindEditEvents();
    }
    
    updateExistingCard(htmlContent) {
        // Update the card content
        const cardId = this.currentCard.dataset.cardId;
        const cardClasses = this.currentCard.className;
        this.currentCard.innerHTML = htmlContent;
        this.currentCard.dataset.cardId = cardId;
        this.currentCard.className = cardClasses;
        
        // Re-add the edit link
        const editLinkDiv = document.createElement('div');
        editLinkDiv.className = 'flex justify-end';
        editLinkDiv.innerHTML = '<a href="#" class="text-blue-500 font-medium text-sm edit-link">EDIT</a>';
        this.currentCard.appendChild(editLinkDiv);
        
        // Add edited indicator if not a new card
        this.addEditedIndicator(this.currentCard);
        
        // Rebind the edit event for the updated card
        this.rebindEditEvents();
    }
    
    extractTextContent(element) {
        // Convert HTML content to editable text format
        const clone = element.cloneNode(true);
        
        // Replace headings with markdown-style notation
        const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            const prefix = '#'.repeat(level) + ' ';
            heading.textContent = prefix + heading.textContent;
        });
        
        // Handle lists
        const lists = clone.querySelectorAll('ul, ol');
        lists.forEach(list => {
            const items = list.querySelectorAll('li');
            items.forEach((item, index) => {
                const isOrdered = list.tagName === 'OL';
                const prefix = isOrdered ? `${index + 1}. ` : '• ';
                item.textContent = prefix + item.textContent;
            });
        });
        
        // Handle strong/bold text
        const strongElements = clone.querySelectorAll('strong, b');
        strongElements.forEach(strong => {
            strong.textContent = '**' + strong.textContent + '**';
        });
        
        return clone.textContent.trim();
    }
    
    convertTextToHTML(text) {
        // Convert text content back to HTML
        const lines = text.split('\n');
        let html = '';
        let inList = false;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                return;
            }
            
            // Handle headings
            if (line.startsWith('#')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                
                const hashCount = line.match(/^#+/)[0].length;
                const text = line.replace(/^#+\s*/, '');
                html += `<h${hashCount}>${this.processInlineFormatting(text)}</h${hashCount}>`;
            }
            // Handle list items
            else if (line.startsWith('• ') || line.match(/^\d+\.\s/)) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                const text = line.replace(/^(•|\d+\.)\s*/, '');
                html += `<li>${this.processInlineFormatting(text)}</li>`;
            }
            // Handle regular paragraphs
            else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<p>${this.processInlineFormatting(line)}</p>`;
            }
        });
        
        if (inList) {
            html += '</ul>';
        }
        
        return html;
    }
    
    processInlineFormatting(text) {
        // Handle bold text
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    
    sendAIPrompt() {
        const promptInput = document.getElementById('aiPrompt');
        const prompt = promptInput.value.trim();
        
        // Validate prompt
        const validation = this.validatePrompt(prompt);
        if (!validation.isValid) {
            this.showNotification(`Validation Error: ${validation.error}`, 'error');
            return;
        }
        
        // Check rate limiting
        const now = Date.now();
        if (now - this.lastAIRequest < this.aiRequestCooldown) {
            const remainingTime = Math.ceil((this.aiRequestCooldown - (now - this.lastAIRequest)) / 1000);
            this.showNotification(`Please wait ${remainingTime} seconds before next AI request.`, 'warning');
            return;
        }
        
        // Get current card content for context
        const currentTitle = document.getElementById('cardTitle').value;
        const currentContent = document.getElementById('cardEditor').value;
        
        // Show loading state
        const sendBtn = document.getElementById('sendPrompt');
        const originalBtnContent = sendBtn.innerHTML;
        sendBtn.innerHTML = '<div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>';
        sendBtn.disabled = true;
        
        // Make API request
        this.callPerplexityAPI(prompt, currentTitle, currentContent)
            .then(response => {
                this.handleAIResponse(response);
                this.lastAIRequest = now;
                promptInput.value = '';
                document.getElementById('promptCounter').textContent = '0';
            })
            .catch(error => {
                console.error('AI API Error:', error);
                this.showNotification('AI service temporarily unavailable. Please try again later.', 'error');
            })
            .finally(() => {
                // Restore button state
                sendBtn.innerHTML = originalBtnContent;
                sendBtn.disabled = false;
            });
    }
    
    validatePrompt(prompt) {
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
    }
    
    async callPerplexityAPI(prompt, currentTitle, currentContent) {
        const systemPrompt = `You are an article editor for project management content for digital projects.

YOU CAN:
- Improve clarity of formulations
- Add structure (lists, headings)
- Add checklists and stages

YOU CANNOT:
- Add unconfirmed facts
- Advertise tools without marking
- Contradict original meaning

If prompt violates rules, respond: "ERROR: [reason]. Please reformulate your request for clarity/structure improvement."

Current title: "${currentTitle}"
Current content: "${currentContent}"

User requests: ${prompt}

Return improved content in JSON format:
{
  "title": "improved title",
  "content": "improved content"
}`;

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
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    handleAIResponse(aiResponse) {
        try {
            // Check if response is an error
            if (aiResponse.startsWith('ERROR:')) {
                this.showNotification(aiResponse, 'error');
                return;
            }
            
            // Try to parse JSON response
            let parsedResponse;
            try {
                // Extract JSON from response if it's wrapped in quotes or other text
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedResponse = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (e) {
                // If not JSON, treat as plain text improvement
                parsedResponse = {
                    title: document.getElementById('cardTitle').value,
                    content: aiResponse
                };
            }
            
            // Update the form fields with AI suggestions
            if (parsedResponse.title) {
                document.getElementById('cardTitle').value = parsedResponse.title;
            }
            
            if (parsedResponse.content) {
                document.getElementById('cardEditor').value = parsedResponse.content;
            }
            
            // Mark as having unsaved changes
            this.hasUnsavedChanges = true;
            
            this.showNotification('AI improvements applied! Review and save changes.', 'success');
            
        } catch (error) {
            console.error('Error handling AI response:', error);
            this.showNotification('Error processing AI response. Please try again.', 'error');
        }
    }
    
    saveEdits() {
        this.saveAllData();
        this.showNotification('All edits saved locally!', 'success');
    }
    
    cleanAllEdits() {
        if (confirm('Are you sure you want to restore all cards to their original content? All your edits will be lost.')) {
            // Clear saved data from localStorage
            localStorage.removeItem('cardEditorData');
            localStorage.removeItem('cardEditorTimestamp');
            
            // Reload the page to restore original content
            location.reload();
        }
    }
    
    reloadPage() {
        // Simple page reload for Clean button
        location.reload();
    }
    
    saveCardData() {
        const cardsData = {};
        document.querySelectorAll('[data-card-id]').forEach(card => {
            const cardId = card.dataset.cardId;
            // Clone the card and remove the edit link to get just the content
            const cardClone = card.cloneNode(true);
            const editLink = cardClone.querySelector('.edit-link');
            if (editLink && editLink.parentNode) {
                editLink.parentNode.remove();
            }
            cardsData[cardId] = cardClone.innerHTML;
        });
        
        localStorage.setItem('cardEditorData', JSON.stringify(cardsData));
    }
    
    saveAllData() {
        this.saveCardData();
        localStorage.setItem('cardEditorTimestamp', new Date().toISOString());
    }
    
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('cardEditorData');
            if (savedData) {
                const cardsData = JSON.parse(savedData);
                
                document.querySelectorAll('[data-card-id]').forEach(card => {
                    const cardId = card.dataset.cardId;
                    if (cardsData[cardId]) {
                        // Preserve the card structure and just update content
                        const cardClasses = card.className;
                        card.innerHTML = cardsData[cardId];
                        card.className = cardClasses;
                        
                        // Re-add the edit link if it doesn't exist
                        if (!card.querySelector('.edit-link')) {
                            const editLinkDiv = document.createElement('div');
                            editLinkDiv.className = 'flex justify-end';
                            editLinkDiv.innerHTML = '<a href="#" class="text-blue-500 font-medium text-sm edit-link">EDIT</a>';
                            card.appendChild(editLinkDiv);
                        }
                    }
                });
                
                // Rebind events after loading
                this.rebindEditEvents();
                
                const timestamp = localStorage.getItem('cardEditorTimestamp');
                if (timestamp) {
                    const savedTime = new Date(timestamp);
                    const now = new Date();
                    const diffMinutes = Math.floor((now - savedTime) / (1000 * 60));
                    
                    if (diffMinutes < 60) {
                        this.showNotification(`Loaded saved content from ${diffMinutes} minutes ago.`, 'info');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            backgroundColor: type === 'success' ? '#10b981' : 
                            type === 'warning' ? '#f59e0b' : 
                            type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            fontSize: '14px',
            maxWidth: '300px',
            wordWrap: 'break-word',
            animation: 'slideInRight 0.3s ease'
        });
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
    
    rebindEditEvents() {
        // Event delegation is already set up in bindEvents, no need to rebind individual elements
        // This method is kept for compatibility but doesn't need to do anything
        console.log('Edit events are handled by event delegation');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    addNewCard() {
        // Create a temporary card for editing
        this.currentCard = this.createTempCard();
        this.isEditingMode = true;
        this.isNewCard = true;
        
        // Clear the editor fields for new content
        document.getElementById('cardTitle').value = '';
        document.getElementById('cardEditor').value = '';
        
        // Show modal
        const modal = document.getElementById('editModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Focus the title input
        setTimeout(() => {
            document.getElementById('cardTitle').focus();
        }, 100);
        
        // Reset states
        this.hasUnsavedChanges = false;
    }
    
    createTempCard() {
        // Create a temporary card element for new card creation
        const tempCard = document.createElement('div');
        tempCard.dataset.cardId = 'temp-' + Date.now();
        tempCard.className = 'mb-8';
        return tempCard;
    }
    
    addEditedIndicator(card) {
        // Add visual indicator that card has been edited
        if (!card.querySelector('.edited-badge')) {
            const badge = document.createElement('span');
            badge.className = 'edited-badge text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-2';
            badge.textContent = 'Edited';
            
            const title = card.querySelector('h2');
            if (title) {
                title.appendChild(badge);
            }
        }
    }
}

// Animation styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize the card editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CardEditor();
});

// Add some helpful utilities
window.CardEditorUtils = {
    exportData: function() {
        const data = localStorage.getItem('cardEditorData');
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'card-editor-backup.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    },
    
    importData: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.setItem('cardEditorData', JSON.stringify(data));
                location.reload();
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    },
    
    clearAllData: function() {
        if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
            localStorage.removeItem('cardEditorData');
            localStorage.removeItem('cardEditorTimestamp');
            location.reload();
        }
    }
};