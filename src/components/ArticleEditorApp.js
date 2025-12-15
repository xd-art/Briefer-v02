import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
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
import { convertToHtml } from '../utils/markdown';
import { ArticleManager } from '../utils/ArticleManager';
import { useAuth } from '../context/AuthContext';
import { ARTICLE_FILTERS, buildDetailedPrompt } from '../data/filterOptions';
import Header from './Header';
import Footer from './Footer';
import ProfilePage from './ProfilePage';

function ArticleEditorApp() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
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
            const systemPrompt = `You are an expert technical writer.
Create a comprehensive, detailed guide on the topic: "${topic}".

${detailedPrompt ? `Additional instructions: ${detailedPrompt}` : ''}

FORMAT RULES:
1. Use standard Markdown.
2. The first line MUST be the main title, starting with "# ".
3. Use "## " for section titles.
4. Write detailed content for each section.

CRITICAL - AI LINKS:
If you mention a complex sub-topic that deserves its own separate guide (e.g., "Setting up Nginx", "Configuring DNS"), you MUST wrap that phrase in a special <ai-link> tag.
Format: <ai-link topic="Exact Topic Title" template="guide">visible text</ai-link>

Example:
# How to Host a Website
## Introduction
First, you need to <ai-link topic="How to install Node.js" template="guide">install Node.js</ai-link> on your server.
...`;

            const API_KEY = 'AIzaSyDsl5dvLeH3WtsfQ93RnZ01UePo_pAQsBE';
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 8192,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            // --- Markdown Parsing Logic ---

            // 1. Extract Title
            const lines = aiResponse.split('\n');
            let title = topic; // Fallback
            let contentStartIndex = 0;

            // Find the first line starting with #
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('# ')) {
                    title = lines[i].trim().substring(2).trim();
                    contentStartIndex = i + 1;
                    break;
                }
            }

            setArticleTitle(title);

            // 2. Split into Sections
            // We join the rest of the lines back together, then split by "## "
            const fullContent = lines.slice(contentStartIndex).join('\n');
            const sectionParts = fullContent.split(/\n##\s+/);

            const newCards = [];

            sectionParts.forEach((part, index) => {
                if (!part.trim()) return;

                let sectionTitle = "Introduction";
                let sectionContentMarkdown = part;

                if (index > 0 || fullContent.trim().startsWith('##')) {
                    // Extract first line as title
                    const partLines = part.split('\n');
                    sectionTitle = partLines[0].trim();
                    sectionContentMarkdown = partLines.slice(1).join('\n');
                } else {
                    // It's the intro before any H2
                    sectionTitle = "Introduction";
                    sectionContentMarkdown = part;
                }

                // Convert markdown content to HTML
                let htmlContent = convertToHtml(sectionContentMarkdown);

                // Prepend the title as an H2
                htmlContent = `<h2 class="text-2xl font-semibold mb-4 text-gray-800">${sectionTitle}</h2>` + htmlContent;

                // Add edit link
                const sectionId = `section-${index}-${Date.now()}`;
                htmlContent += `<div class="flex justify-end"><a href="#" class="edit-link" data-card-id="${sectionId}">EDIT</a></div>`;

                newCards.push({
                    id: sectionId,
                    content: htmlContent
                });
            });

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
        } else {
            console.log('⚠️ No editArticle in location.state');
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
            window.history.replaceState(null, '', '/');
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

    const handleNavigate = (newView) => {
        setView(newView);
        if (newView === 'generator') {
            window.history.pushState(null, '', '/');
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
                    <ArticleGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
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

            {/* Refinement Bar - Only show in editor */}
            {view === 'editor' && (
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
            )}

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
