import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * RightSidebar Component
 * 
 * Displays featured and random articles in the right sidebar.
 * Fetches articles from various categories to provide content discovery.
 * 
 * Sections:
 * 1. Featured from Categories - Curated articles from different domains
 * 2. Random Inspiration - Random article suggestions
 */
const RightSidebar = () => {
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [randomArticle, setRandomArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSidebarContent();
    }, []);

    const fetchSidebarContent = async () => {
        try {
            setLoading(true);

            // Fetch multiple category articles in parallel
            const categoryPromises = [
                fetchCategoryArticle('graphic_design'),
                fetchCategoryArticle('content_creation'),
                fetchCategoryArticle('motion_graphics'),
                fetchCategoryArticle('audio_production'),
                fetchCategoryArticle('digital_marketing'),
                fetchCategoryArticle('programming_development')
            ];

            const results = await Promise.allSettled(categoryPromises);

            // Filter successful results and extract articles
            const articles = results
                .filter(result => result.status === 'fulfilled' && result.value)
                .map(result => result.value)
                .filter(Boolean);

            // Deduplicate articles by ID
            const uniqueArticles = Array.from(new Map(articles.map(article => [article.id, article])).values());

            // Take first 3-4 for featured section
            setFeaturedArticles(uniqueArticles.slice(0, 4));

            // Pick a random one for inspiration (different from featured)
            const remainingArticles = uniqueArticles.slice(4);
            if (remainingArticles.length > 0) {
                const randomIndex = Math.floor(Math.random() * remainingArticles.length);
                setRandomArticle(remainingArticles[randomIndex]);
            } else if (articles.length > 0) {
                // If we don't have enough articles, pick any random one
                const randomIndex = Math.floor(Math.random() * articles.length);
                setRandomArticle(articles[randomIndex]);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching sidebar content:', err);
            setError('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryArticle = async (categoryValue) => {
        try {
            const response = await fetch(
                `http://localhost:3003/api/articles/categories/${categoryValue}?limit=1`
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (data.articles && data.articles.length > 0) {
                const article = data.articles[0];
                return {
                    id: article.id,
                    title: article.title,
                    category: article.facets?.[0]?.label || 'Article',
                    subcategory: article.facets?.[1]?.label || null,
                    categoryValue: article.facets?.[0]?.value || categoryValue,
                    subcategoryValue: article.facets?.[1]?.value || null
                };
            }

            return null;
        } catch (err) {
            console.error(`Error fetching article from ${categoryValue}:`, err);
            return null;
        }
    };

    const getArticlePath = (article) => {
        if (article.subcategoryValue) {
            return `/article/${article.subcategoryValue}/${article.id}`;
        }
        return `/article/${article.categoryValue}/${article.id}`;
    };

    const getCategoryIcon = (categoryValue) => {
        const icons = {
            'graphic_design': 'palette',
            'content_creation': 'edit_note',
            'motion_graphics': 'movie',
            'audio_production': 'headphones',
            'digital_marketing': 'campaign',
            'programming_development': 'code'
        };
        return icons[categoryValue] || 'article';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
                <button
                    onClick={fetchSidebarContent}
                    className="mt-2 text-xs text-red-700 hover:text-red-900 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <aside className="space-y-6 sticky top-4">
            {/* Featured Articles Section */}
            {featuredArticles.length > 0 && (
                <div className="bg-white rounded-lg border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
                        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-2x1">stars</span>
                            <span>Featured from Categories</span>
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {featuredArticles.map((article, index) => (
                            <article
                                key={article.id}
                                className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <Link
                                    to={getArticlePath(article)}
                                    className="block transform transition-transform duration-200 hover:translate-x-1"
                                >
                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors duration-200">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:scale-110">{getCategoryIcon(article.categoryValue)}</span>
                                        <span>{article.category}</span>
                                        {article.subcategory && (
                                            <>
                                                <span>·</span>
                                                <span>{article.subcategory}</span>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {/* Random Inspiration Section */}
            {randomArticle && (
                <div className="bg-white rounded-lg border border-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-white px-4 py-3 border-b border-blue-200">
                        <h2 className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base animate-pulse">lightbulb</span>
                            <span>Random Inspiration</span>
                        </h2>
                    </div>
                    <div className="p-4">
                        <p className="text-xs text-blue-700 mb-3 font-medium">
                            Don't know where to start? Try this:
                        </p>
                        <Link
                            to={getArticlePath(randomArticle)}
                            className="block bg-white rounded-lg p-3 shadow-sm hover:shadow-lg transition-all duration-300 group hover:scale-105"
                        >
                            <h3 className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                                {randomArticle.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:scale-110">{getCategoryIcon(randomArticle.categoryValue)}</span>
                                <span>{randomArticle.category}</span>
                                {randomArticle.subcategory && (
                                    <>
                                        <span>·</span>
                                        <span>{randomArticle.subcategory}</span>
                                    </>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {featuredArticles.length === 0 && !randomArticle && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 text-center shadow-sm">
                    <span className="material-symbols-outlined text-5xl mb-3 opacity-50">menu_book</span>
                    <p className="text-sm text-gray-500 mb-2">
                        No articles available yet.
                    </p>
                    <Link
                        to="/categories"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:translate-x-1"
                    >
                        <span>Browse Categories</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
            )}

            {/* Quick Links Section */}
            <div className="bg-white rounded-lg border border-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="px-4 py-3">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">link</span>
                        Quick Links
                    </h3>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to="/categories"
                                className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:scale-110">category</span>
                                <span>All Categories</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/blog"
                                className="text-sm text-gray-600 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:scale-110">article</span>
                                <span>Blog</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
