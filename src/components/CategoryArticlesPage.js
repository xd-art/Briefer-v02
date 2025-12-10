import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

const CategoryArticlesPage = () => {
    const { category, subcategory } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryArticles = async () => {
            try {
                setLoading(true);

                // 'sales-marketing' -> 'sales_marketing'
                const facetValue = subcategory.replace(/-/g, '_');

                const response = await fetch(
                    `http://localhost:3003/api/articles/categories/${facetValue}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Category not found');
                    } else {
                        setError('Failed to fetch articles');
                    }
                    return;
                }

                const data = await response.json();
                setCategoryInfo(data.category);
                setArticles(data.articles || []);
            } catch (err) {
                console.error('Error fetching category articles:', err);
                setError('Failed to fetch articles');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryArticles();
    }, [category, subcategory]);

    const handleEditArticle = (article) => {
        console.log('📝 Opening article:', article.title);
        console.log('📝 Article content type:', typeof article.content);
        console.log('📝 Article content:', article.content);
        
        // Parse the content if it's a JSON string
        let articleContent = article.content;
        if (typeof articleContent === 'string') {
            try {
                articleContent = JSON.parse(articleContent);
                console.log('✅ Parsed content:', articleContent);
            } catch (e) {
                console.error('❌ Failed to parse article content:', e);
                console.error('❌ Content was:', article.content);
                articleContent = [];
            }
        }

        const navigationState = {
            editArticle: {
                id: article.id,
                title: article.title,
                cards: articleContent
            }
        };
        
        console.log('🚀 Navigating with state:', navigationState);
        
        // Navigate to home with article data in state
        navigate('/', {
            state: navigationState
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header user={user} onLogoutClick={logout} />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Loading articles...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Header user={user} onLogoutClick={logout} />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="text-red-500 text-xl font-medium">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header user={user} onLogoutClick={logout} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {categoryInfo?.label || subcategory.replace(/-/g, ' ')}
                    </h1>
                    <p className="text-gray-600">
                        {categoryInfo?.facet?.label ? `${categoryInfo.facet.label}: ` : ''}
                        Articles in this category
                    </p>
                </div>

                {articles.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No articles found in this category.</p>
                        <p className="text-gray-400 text-sm">Check back later for new content.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {articles.map((article) => (
                                <li key={article.id} className="border-b border-gray-200 last:border-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <button
                                                onClick={() => handleEditArticle(article)}
                                                className="text-lg font-medium text-blue-600 hover:underline focus:outline-none w-full text-left"
                                            >
                                                {article.title || 'Untitled Article'}
                                            </button>
                                            <p className="text-sm text-gray-500 mt-1">
                                                By {article.author?.email || 'Unknown Author'} • {article.updated_at ? new Date(article.updated_at).toLocaleDateString() : ''}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {article.facetAssignments?.slice(0, 3).map((assignment) => (
                                                    <span
                                                        key={assignment.id}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                                                    >
                                                        {assignment.value?.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryArticlesPage;
