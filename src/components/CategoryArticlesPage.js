import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ThreeColumnLayout from './ThreeColumnLayout';
import LeftNavigation from './LeftNavigation';
import RightSidebar from './RightSidebar';
import { useAuth } from '../context/AuthContext';
import SEO from '../utils/seo';
import useDebounce from '../hooks/useDebounce';

const CategoryArticlesPage = () => {
    const { category, subcategory } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [initialArticles, setInitialArticles] = useState([]); // Store original articles
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const isFirstRun = useRef(true);

    // Initial load of category articles
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
                setInitialArticles(data.articles || []);
            } catch (err) {
                console.error('Error fetching category articles:', err);
                setError('Failed to fetch articles');
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery === '') {
            fetchCategoryArticles();
        }
    }, [category, subcategory]);

    // Search effect
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearch.trim() === '') {
                // Restore original if search is cleared
                if (initialArticles.length > 0) {
                    setArticles(initialArticles);
                }
                return;
            }

            try {
                setLoading(true);
                const facetValue = subcategory.replace(/-/g, '_');
                const response = await fetch(
                    `http://localhost:3003/api/articles/search?query=${encodeURIComponent(debouncedSearch)}&category=${facetValue}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setArticles(data.articles || []);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isFirstRun.current) {
            isFirstRun.current = false;
        } else {
            performSearch();
        }

    }, [debouncedSearch, subcategory, initialArticles]);

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

    const handleLogin = () => {
        // Redirect to home page which has login functionality
        navigate('/');
    };



    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Header user={user} onLoginClick={handleLogin} onLogoutClick={logout} />
                <ThreeColumnLayout
                    left={<LeftNavigation />}
                    right={<RightSidebar />}
                >
                    <div className="text-center py-12">
                        <div className="text-red-500 text-xl font-medium">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </ThreeColumnLayout>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SEO
                title={`${categoryInfo?.label || subcategory.replace(/-/g, ' ')} - How-to Articles`}
                description={`Browse ${categoryInfo?.label || subcategory.replace(/-/g, ' ')} articles and guides. Learn from expert tutorials and step-by-step instructions.`}
                keywords={`${subcategory}, tutorials, how-to, guides, articles`}
            />
            <Header user={user} onLoginClick={handleLogin} onLogoutClick={logout} />

            <ThreeColumnLayout
                left={<LeftNavigation />}
                right={<RightSidebar />}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {categoryInfo?.label || subcategory.replace(/-/g, ' ')}
                    </h1>
                    <p className="text-gray-600">
                        {categoryInfo?.facet?.label ? `${categoryInfo.facet.label}: ` : ''}
                        Articles in this category
                    </p>
                </div>

                <div className="mb-6 bg-white p-1 rounded-md">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search in this category..."
                            className="w-full pl-10 pr-4 py-3 border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-500 focus:outline-none"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-3 top-3.5 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Searching...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No articles found.</p>
                        <p className="text-gray-500 text-sm">Try different keywords.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {articles.map((article) => (
                                <li key={article.id} className="border-b border-gray-200 last:border-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <Link
                                                to={`/article/${subcategory}/${article.id}`}
                                                className="text-lg font-medium text-blue-600 hover:underline focus:outline-none w-full text-left block"
                                            >
                                                {article.title || 'Untitled Article'}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">
                                                By {article.author?.name || article.author?.email?.split('@')[0] || 'Unknown Author'} • {article.updated_at ? new Date(article.updated_at).toLocaleDateString() : ''}
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
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleEditArticle(article)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                                                >
                                                    Edit &amp; save to profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </ThreeColumnLayout>
            <Footer />
        </div>
    );
};

export default CategoryArticlesPage;
