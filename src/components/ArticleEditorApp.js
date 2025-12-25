import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';
import ArticleGenerator from './ArticleGenerator';
import CardEditor from './CardEditor';
import ActionButtons from './ActionButtons';
import RefinementBar from './RefinementBar';
import FilterModal from './FilterModal';
import RegistrationModal from './RegistrationModal';
import ThreeColumnLayout from './ThreeColumnLayout';
import LeftNavigation from './LeftNavigation';
import RightSidebar from './RightSidebar';

import { ArticleManager } from '../utils/ArticleManager';
import { useAuth } from '../context/AuthContext';
import { ARTICLE_FILTERS, buildDetailedPrompt } from '../data/filterOptions';
import Header from './Header';
import Footer from './Footer';
import ProfilePage from './ProfilePage';

function ArticleEditorApp() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [articleTitle, setArticleTitle] = useState('');
    const [view, setView] = useState('loading'); // 'loading', 'generator', 'editor'
    const [showNotification, setShowNotification] = useState({ show: false, message: '', type: 'info' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentArticleId, setCurrentArticleId] = useState(null);
    const [loadedFromNavigation, setLoadedFromNavigation] = useState(false); // Track if loaded from navigation
    const cardEditorRef = useRef();
    const [isEditorLoaded, setIsEditorLoaded] = useState(false);
    const [refinementPrompt, setRefinementPrompt] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const titleInputRef = useRef(null);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

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
            const response = await fetch('http://localhost:3003/api/ai/generate-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: topic,
                    detailedPrompt: detailedPrompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.details || errorData.error || `API request failed: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const aiResponse = data.content;

            // --- Validation Check (Backend handles this now, or we skip it) ---
            if (aiResponse.startsWith('ERROR:')) {
                showNotificationMessage(aiResponse, 'error');
                setIsGenerating(false);
                return;
            }

            // --- HTML Parsing Logic ---

            let title = topic; // Fallback
            let bodyContent = aiResponse;

            // 1. Extract Title (<h1>)
            const h1Match = aiResponse.match(/<h1[^>]*>(.*?)<\/h1>/i);
            if (h1Match) {
                title = h1Match[1].trim();
                // Remove the H1 from the content to process the rest
                bodyContent = aiResponse.replace(h1Match[0], '').trim();
            }

            setArticleTitle(title);

            // 2. Split into Sections by <h2>
            // The regex splits by h2, capturing the inner text of the h2
            // Result will be: [intro_content, h2_text_1, section_content_1, h2_text_2, section_content_2, ...]
            const parts = bodyContent.split(/<h2[^>]*>(.*?)<\/h2>/i);

            const newCards = [];

            // Handle Introduction (content before first h2)
            if (parts[0] && parts[0].trim()) {
                const sectionId = `section-intro-${Date.now()}`;
                let htmlContent = parts[0].trim();

                // Add title for consistency if missing, or just treat as intro
                if (!htmlContent.includes('<h2')) {
                    htmlContent = `<h2 class="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>` + htmlContent;
                }
                // htmlContent += `<div class="flex justify-end"><a href="#" class="edit-link" data-card-id="${sectionId}">EDIT</a></div>`;

                newCards.push({
                    id: sectionId,
                    content: htmlContent
                });
            }

            // Loop through the rest of the parts in pairs (Title, Content)
            for (let i = 1; i < parts.length; i += 2) {
                const sectionTitle = parts[i].trim();
                let sectionContent = parts[i + 1] ? parts[i + 1].trim() : '';

                if (!sectionContent && !sectionTitle) continue;

                const sectionId = `section-${i}-${Date.now()}`;

                // Construct the card HTML
                let htmlContent = `<h2 class="text-2xl font-semibold mb-4 text-gray-800">${sectionTitle}</h2>` + sectionContent;
                // htmlContent += `<div class="flex justify-end"><a href="#" class="edit-link" data-card-id="${sectionId}">EDIT</a></div>`;

                newCards.push({
                    id: sectionId,
                    content: htmlContent
                });
            }

            setCards(newCards);

            // Save to ArticleManager
            ArticleManager.saveArticle(activeId, {
                title: title,
                cards: newCards
            });

            setView('editor');
            showNotificationMessage('Article generated successfully!', 'success');

        } catch (error) {
            console.error('Generation Error:', error);
            showNotificationMessage(`Generation failed: ${error.message}`, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate dynamic filters based on article topic
    const generateFilters = () => {
        return ARTICLE_FILTERS;
    };

    // Handle incoming article data from navigation (e.g., from CategoryArticlesPage)
    useEffect(() => {
        console.log('🔍 ArticleEditorApp - location.state:', location.state);
        if (location.state?.editArticle) {
            const { id, title, cards: articleCards } = location.state.editArticle;
            console.log('✅ Loading article:', { id, title, cardsCount: articleCards?.length });

            // Normalize cards to ensure they all have ids
            const rawCards = Array.isArray(articleCards) ? articleCards : [];
            const normalizedCards = rawCards.map((card, index) => ({
                id: card.id || `card-${index}-${Date.now()}`,
                ...card
            }));

            // Save to ArticleManager for persistence
            ArticleManager.saveArticle(id.toString(), {
                title: title,
                cards: normalizedCards
            });

            setCurrentArticleId(id);
            setArticleTitle(title || 'Untitled Article');
            setCards(normalizedCards);
            setView('editor');
            setLoadedFromNavigation(true); // Mark as loaded from navigation

            // Update URL with article ID and clear navigation state
            window.history.replaceState({}, document.title, `?id=${id}`);
        } else if (location.state?.generateRequest) {
            const { topic, detailedPrompt } = location.state.generateRequest;
            console.log('✨ Handling generation request from navigation:', { topic });

            // Clear the state so it doesn't re-trigger on reload
            window.history.replaceState({}, document.title, window.location.pathname);

            handleGenerate(topic, detailedPrompt);
        } else {
            console.log('⚠️ No editArticle or generateRequest in location.state');
        }
    }, [location.state]);

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
        let detailedPrompt = buildDetailedPrompt(selectedFilters);

        const fullPrompt = refinementPrompt.trim()
            ? `How to ${refinementPrompt} `
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

    // Fetch article from backend if not in localStorage
    const fetchArticleFromBackend = async (articleId) => {
        try {
            const response = await fetch(`http://localhost:3003/api/articles/${articleId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Article not found');
            }

            const { article } = await response.json();

            // Parse content if it's a string
            let parsedCards = [];
            try {
                parsedCards = typeof article.content === 'string' ? JSON.parse(article.content) : article.content;
            } catch (e) {
                console.error('Failed to parse article content', e);
                parsedCards = [];
            }

            // Save to ArticleManager for future access
            ArticleManager.saveArticle(articleId.toString(), {
                title: article.title,
                cards: parsedCards
            });

            setCurrentArticleId(articleId);
            setArticleTitle(article.title || 'Untitled Article');
            setCards(parsedCards || []);
            setView('editor');
        } catch (error) {
            console.error('Error fetching article from backend:', error);
            showNotificationMessage('Article not found. Redirecting to generator.', 'error');
            window.history.replaceState(null, '', '/create');
            setView('generator');
        }
    };

    // Initialization & Routing
    useEffect(() => {
        // Skip if article is already loaded from navigation state
        if (loadedFromNavigation) {
            console.log('⏩ Skipping initialization - article already loaded from navigation state');
            return;
        }

        console.log('🔍 Initialization useEffect - checking URL params');
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('id');
        const urlTopic = params.get('topic');
        const urlTemplate = params.get('template');

        if (urlId) {
            // Case 1: Load existing article by ID
            console.log('📂 Loading article by ID:', urlId);
            const article = ArticleManager.getArticle(urlId);
            console.log('📦 Article from ArticleManager:', article);
            if (article) {
                console.log('✅ Setting cards from ArticleManager:', article.cards?.length || 0, 'cards');
                setCurrentArticleId(urlId);
                setArticleTitle(article.title);
                setCards(article.cards || []);
                setView('editor');
            } else {
                // Article not in localStorage, try to fetch from backend
                console.log('🔍 Article not in localStorage, fetching from backend...');
                fetchArticleFromBackend(urlId);
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
                console.log('🎸 No article to load - showing generator');
                setView('generator');
            }
        }
    }, [loadedFromNavigation]);

    // Handle edit link clicks
    const handleEditCard = (card) => {
        const event = new CustomEvent('openEditModal', { detail: card });
        window.dispatchEvent(event);
    };

    const saveAllData = async () => {
        // Wait for auth state to load
        if (loading) {
            showNotificationMessage('Please wait...', 'info');
            return;
        }

        // Check if user is authenticated
        if (!user) {
            setShowRegistrationModal(true);
            return;
        }

        // Save to backend
        try {
            console.log('💾 Starting save process...');
            console.log('💾 Current article ID:', currentArticleId);
            console.log('💾 Title:', articleTitle);
            console.log('💾 Cards count:', cards?.length);

            // Always create a new draft for category articles (they're copies)
            // For user's own articles, we could add update logic later
            const createResponse = await fetch('http://localhost:3003/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: articleTitle,
                    content: cards
                })
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create article on backend');
            }

            const { article } = await createResponse.json();
            const backendArticleId = article.id;
            console.log('✅ Article created with ID:', backendArticleId);

            // Attach it to the authenticated user
            const attachResponse = await fetch(`http://localhost:3003/api/articles/${backendArticleId}/attach`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!attachResponse.ok) {
                throw new Error('Failed to attach article to user');
            }
            console.log('✅ Article attached to user');

            // Update local state with the new backend ID
            setCurrentArticleId(backendArticleId);
            console.log('✅ Updated currentArticleId to:', backendArticleId);

            // Save to ArticleManager with the backend ID
            ArticleManager.saveArticle(backendArticleId.toString(), {
                title: articleTitle,
                cards: cards
            });

            // Update URL to reflect the new backend ID
            window.history.replaceState(null, '', `?id=${backendArticleId}`);
            console.log('✅ URL updated to:', `?id=${backendArticleId}`);

            showNotificationMessage('Article saved to your profile!', 'success');
            console.log('✅ Save complete!');
        } catch (error) {
            console.error('❌ Save error:', error);
            showNotificationMessage('Failed to save article', 'error');
        }
    };

    const reloadPage = () => {
        if (loadedFromNavigation) {
            navigate(-1);
            return;
        }

        if (window.confirm('Are you sure you want to start over? You will return to the generator.')) {
            window.location.href = '/create';
        }
    };

    const addNewCard = () => {
        const newCard = {
            id: 'card-' + Date.now(),
            content: '',
            isNew: true // Explicitly mark as new
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

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newCards = [...cards];
        const [item] = newCards.splice(index, 1);
        newCards.splice(index - 1, 0, item);
        setCards(newCards);
        // We should probably save here too, but dragging expects manual save usually. 
        // For buttons, user might expect auto-update or manual save. 
        // Let's rely on the explicit Save button for now to avoid too many writes, 
        // or we could add a debounced save.
    };

    const handleMoveDown = (index) => {
        if (index === cards.length - 1) return;
        const newCards = [...cards];
        const [item] = newCards.splice(index, 1);
        newCards.splice(index + 1, 0, item);
        setCards(newCards);
    };

    const handleDeleteCard = (cardId) => {
        // Temporary removal of confirm for debugging
        // if (window.confirm('Are you sure you want to delete this card?')) {
        console.log(`[DELETE] Request for ID: "${cardId}" (Type: ${typeof cardId})`);

        setCards(prevCards => {
            console.log(`[DELETE] Current card count: ${prevCards.length}`);

            // Check if ID exists before filtering
            const exists = prevCards.some(c => c.id === cardId);
            if (!exists) {
                console.warn(`[DELETE] Warning: Card ID "${cardId}" not found in current state!`);
                console.log('[DELETE] Available IDs:', prevCards.map(c => c.id));
            }

            const newCards = prevCards.filter(card => {
                const isMatch = card.id === cardId;
                if (isMatch) {
                    console.log(`[DELETE] Matching card found and removed: "${card.id}"`);
                }
                return !isMatch;
            });

            console.log(`[DELETE] New card count: ${newCards.length}`);
            return newCards;
        });
        // }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(cards);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setCards(items);
    };

    const handleNavigate = (newView) => {
        setView(newView);
        if (newView === 'generator') {
            window.history.pushState(null, '', '/create');
        } else if (newView === 'profile') {
            window.history.pushState(null, '', '/profile');
        }
    };

    const handleEditArticle = (article) => {
        setCurrentArticleId(article.id);
        setArticleTitle(article.title);

        let parsedCards = [];
        try {
            parsedCards = typeof article.content === 'string' ? JSON.parse(article.content) : article.content;
        } catch (e) {
            console.error("Failed to parse article content", e);
            parsedCards = [];
        }

        setCards(parsedCards || []);
        setView('editor');
        window.history.pushState(null, '', `?id=${article.id}`);
    };

    // Preload the editor when the app loads
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsEditorLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const renderContent = () => {
        if (view === 'loading') {
            return (
                <ThreeColumnLayout>
                    <div className="flex justify-center items-center min-h-[50vh]">
                        Loading...
                    </div>
                </ThreeColumnLayout>
            );
        }

        if (view === 'generator') {
            return (
                <ThreeColumnLayout
                    left={<LeftNavigation />}
                    right={<RightSidebar />}
                >
                    <ArticleGenerator onGenerate={handleGenerate} isGenerating={isGenerating} showInfo={false} />
                </ThreeColumnLayout>
            );
        }

        // Editor View
        return (
            <ThreeColumnLayout
                left={<LeftNavigation />}
                right={<RightSidebar />}
            >
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
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

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="article-cards">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {cards.map((card, index) => (
                                        <Draggable key={card.id} draggableId={card.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`flex flex-row items-stretch gap-2 mb-4 group transition-colors ${snapshot.isDragging ? 'opacity-70' : ''}`}
                                                >


                                                    {/* Card Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <Card
                                                            card={card}
                                                            onEdit={handleEditCard}
                                                            onMoveUp={() => handleMoveUp(index)}
                                                            onMoveDown={() => handleMoveDown(index)}
                                                            onDelete={() => handleDeleteCard(card.id)}
                                                            isFirst={index === 0}
                                                            isLast={index === cards.length - 1}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <ActionButtons
                        onSave={saveAllData}
                        onAddCard={addNewCard}
                    />
                </div>

                {/* Refinement Bar - Moved into flow for sticky positioning */}
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
            </ThreeColumnLayout>
        );
    };

    const handleLoginClick = () => {
        setShowRegistrationModal(true);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header
                articleId={currentArticleId}
                articleTitle={articleTitle}
                isEditingTitle={isEditingTitle}
                setIsEditingTitle={setIsEditingTitle}
                titleInputRef={titleInputRef}
                user={user}
                loading={loading}
                logout={logout}
                view={view}
                setView={setView}
                showNotificationMessage={showNotificationMessage}
            />

            {renderContent()}

            <Footer />



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

            {/* Registration Modal */}
            <RegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                onSuccess={async () => {
                    setShowRegistrationModal(false);
                    // If we are in editor, save the article after successful authentication
                    if (view === 'editor') {
                        await saveAllData();
                    }
                }}
            />
        </div>
    );
}

export default ArticleEditorApp;
