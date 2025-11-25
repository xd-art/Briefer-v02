import { optimizedLocalStorage } from './performance';

const STORAGE_KEY = 'articles_library';
const CURRENT_ARTICLE_ID_KEY = 'current_article_id';

// Legacy keys for migration
const LEGACY_DATA_KEY = 'cardEditorData';
const LEGACY_TITLE_KEY = 'articleTitle';

export const ArticleManager = {
    /**
     * Get all articles from storage
     * @returns {Object} Map of article objects keyed by ID
     */
    getAllArticles: () => {
        return optimizedLocalStorage.getItem(STORAGE_KEY) || {};
    },

    /**
     * Get a specific article by ID
     * @param {string} id - The article ID
     * @returns {Object|null} The article data or null if not found
     */
    getArticle: (id) => {
        const articles = ArticleManager.getAllArticles();
        return articles[id] || null;
    },

    /**
     * Save an article
     * @param {string} id - The article ID
     * @param {Object} data - The article data (title, cards, etc.)
     * @returns {boolean} Success status
     */
    saveArticle: (id, data) => {
        const articles = ArticleManager.getAllArticles();

        articles[id] = {
            ...articles[id],
            ...data,
            lastModified: new Date().toISOString()
        };

        return optimizedLocalStorage.setItem(STORAGE_KEY, articles);
    },

    /**
     * Create a new article
     * @param {string} topic - The topic of the article
     * @param {string} template - The template type (guide, faq, etc.)
     * @returns {string} The new article ID
     */
    createArticle: (topic = 'Untitled', template = 'guide') => {
        const id = 'article_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newArticle = {
            id,
            title: topic,
            cards: [], // Initial empty cards
            template,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        ArticleManager.saveArticle(id, newArticle);
        return id;
    },

    /**
     * Delete an article
     * @param {string} id - The article ID
     */
    deleteArticle: (id) => {
        const articles = ArticleManager.getAllArticles();
        if (articles[id]) {
            delete articles[id];
            optimizedLocalStorage.setItem(STORAGE_KEY, articles);
        }
    },

    /**
     * Set the current active article ID
     * @param {string} id - The article ID
     */
    setCurrentArticleId: (id) => {
        optimizedLocalStorage.setItem(CURRENT_ARTICLE_ID_KEY, id);
    },

    /**
     * Get the current active article ID
     * @returns {string|null} The current article ID
     */
    getCurrentArticleId: () => {
        return optimizedLocalStorage.getItem(CURRENT_ARTICLE_ID_KEY);
    },

    /**
     * Migrate legacy single-article data to the new library format
     * @returns {string|null} The ID of the migrated article, or null if no migration needed
     */
    migrateOldData: () => {
        const articles = ArticleManager.getAllArticles();

        // If library is not empty, assume migration already happened or isn't needed
        if (Object.keys(articles).length > 0) {
            return null;
        }

        const legacyData = optimizedLocalStorage.getItem(LEGACY_DATA_KEY);
        const legacyTitle = optimizedLocalStorage.getItem(LEGACY_TITLE_KEY);

        if (legacyData) {
            // Create a new article from legacy data
            const id = 'article_migrated_' + Date.now();

            // Convert legacy object format to array format if needed, 
            // but App.js seems to handle the conversion. 
            // We will store it as is, and let App.js handle the structure for now, 
            // or better, standardize it here.
            // App.js expects: cards array. 
            // Legacy storage was: { id: content } map.

            let cardsArray = [];
            if (legacyData && typeof legacyData === 'object') {
                cardsArray = Object.entries(legacyData).map(([cardId, content]) => ({
                    id: cardId,
                    content
                }));
            }

            const migratedArticle = {
                id,
                title: legacyTitle || 'Untitled Article (Restored)',
                cards: cardsArray,
                template: 'guide',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            ArticleManager.saveArticle(id, migratedArticle);

            // Optional: Clear legacy data to avoid confusion? 
            // Let's keep it for safety for now, or maybe clear it to force usage of new system.
            // optimizedLocalStorage.removeItem(LEGACY_DATA_KEY);
            // optimizedLocalStorage.removeItem(LEGACY_TITLE_KEY);

            return id;
        }

        return null;
    }
};
