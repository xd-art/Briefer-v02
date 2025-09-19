// Card-Based Article Editor - Stage 1
// JavaScript functionality for interactive card editing

class CardEditor {
    constructor() {
        this.currentCard = null;
        this.originalContent = '';
        this.isEditingMode = false;
        this.hasUnsavedChanges = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupKeyboardShortcuts();
        this.loadSavedData();
    }
    
    bindEvents() {
        // Card edit links
        document.querySelectorAll('.edit-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('[data-card-id]');
                this.openEditModal(card);
            });
        });
        
        // Modal controls
        const modal = document.getElementById('editModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelEdit');
        const saveBtn = document.getElementById('saveCardEdit');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
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
        
        sendPromptBtn.addEventListener('click', () => this.sendAIPrompt());
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendAIPrompt();
            }
        });
        
        // Header action buttons
        document.getElementById('saveEdits').addEventListener('click', () => this.saveEdits());
        document.getElementById('saveToProfile').addEventListener('click', () => this.saveToProfile());
        
        // Track changes in editor
        const editor = document.getElementById('cardEditor');
        editor.addEventListener('input', () => {
            this.hasUnsavedChanges = true;
            this.updateSaveButtonState();
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
            editLink.parentNode.remove(); // Remove the entire flex container with the edit link
        }
        this.originalContent = cardContent.innerHTML;
        
        // Extract text content for editing
        const textContent = this.extractTextContent(cardContent);
        
        // Populate the editor
        const editor = document.getElementById('cardEditor');
        editor.value = textContent;
        
        // Show modal
        const modal = document.getElementById('editModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Focus the editor
        setTimeout(() => {
            editor.focus();
            editor.setSelectionRange(0, 0);
        }, 100);
        
        // Add editing class to card
        card.classList.add('editing');
        
        // Reset states
        this.hasUnsavedChanges = false;
        this.updateSaveButtonState();
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
        
        // Remove editing class from current card
        if (this.currentCard) {
            this.currentCard.classList.remove('editing');
        }
        
        // Clear AI prompt
        document.getElementById('aiPrompt').value = '';
        
        this.currentCard = null;
        this.isEditingMode = false;
        this.hasUnsavedChanges = false;
    }
    
    saveCardChanges() {
        if (!this.currentCard) return;
        
        const editor = document.getElementById('cardEditor');
        const newContent = editor.value;
        
        // Update the card content
        const newCardContent = this.convertTextToHTML(newContent);
        
        // Create a temporary element to hold the new content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newCardContent;
        
        // Clear current card content but preserve the data-card-id and classes
        const cardId = this.currentCard.dataset.cardId;
        const cardClasses = this.currentCard.className;
        this.currentCard.innerHTML = tempDiv.innerHTML;
        this.currentCard.dataset.cardId = cardId;
        this.currentCard.className = cardClasses;
        
        // Re-add the edit link
        const editLinkDiv = document.createElement('div');
        editLinkDiv.className = 'flex justify-end';
        editLinkDiv.innerHTML = '<a href="#" class="text-blue-500 font-medium text-sm edit-link">EDIT</a>';
        this.currentCard.appendChild(editLinkDiv);
        
        // Rebind the edit event for the new link
        const newEditLink = editLinkDiv.querySelector('.edit-link');
        newEditLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('[data-card-id]');
            this.openEditModal(card);
        });
        
        // Save to localStorage
        this.saveCardData();
        
        // Show success feedback
        this.showNotification('Card updated successfully!', 'success');
        
        // Close modal
        this.closeModal();
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
        
        if (!prompt) {
            this.showNotification('Please enter a prompt for AI assistance.', 'warning');
            return;
        }
        
        // Simulate AI processing
        this.showNotification('AI prompt sent! This is a placeholder for AI integration.', 'info');
        
        // In a real implementation, this would send the prompt to an AI service
        // For now, we'll just show a demo response
        setTimeout(() => {
            this.showNotification('AI Response: This is a demo. In the full version, AI would help improve your content based on the prompt: "' + prompt + '"', 'success');
        }, 2000);
        
        // Clear the prompt
        promptInput.value = '';
    }
    
    saveEdits() {
        this.saveAllData();
        this.showNotification('All edits saved locally!', 'success');
    }
    
    saveToProfile() {
        this.saveAllData();
        // In a real implementation, this would save to user profile/server
        this.showNotification('Article saved to profile! (Demo mode)', 'success');
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
    
    updateSaveButtonState() {
        const saveBtn = document.getElementById('saveCardEdit');
        if (this.hasUnsavedChanges) {
            saveBtn.textContent = 'Save Changes *';
            saveBtn.style.fontWeight = 'bold';
        } else {
            saveBtn.textContent = 'Save Changes';
            saveBtn.style.fontWeight = 'normal';
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
        // Rebind edit link events
        document.querySelectorAll('.edit-link').forEach(link => {
            // Remove existing event listeners by cloning the element
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('[data-card-id]');
                this.openEditModal(card);
            });
        });
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