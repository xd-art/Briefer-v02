import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import SEO from '../utils/seo';
import RichTextDisplay from './RichTextDisplay';

const PublishedArticle = () => {
    const { subcategory, articleId } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to ensure URL has protocol
    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return 'https://' + url;
    };

    const handleEditInEditor = () => {
        if (!article) return;

        let articleContent = article.content;
        if (typeof articleContent === 'string') {
            try {
                articleContent = JSON.parse(articleContent);
            } catch (e) {
                console.error('Failed to parse article content for editing', e);
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

        navigate('/', { state: navigationState });
    };

    const handleLogin = () => {
        // Redirect to home page which has login functionality
        navigate('/');
    };

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);

                const facetValue = subcategory.replace(/-/g, '_');

                const response = await fetch(
                    `http://localhost:3003/api/articles/categories/${facetValue}`
                );

                if (!response.ok) {
                    setError('Failed to fetch article');
                    return;
                }

                const data = await response.json();
                const foundArticle = data.articles.find(a => a.id == articleId);

                if (!foundArticle) {
                    setError('Article not found');
                    return;
                }

                setArticle(foundArticle);
            } catch (err) {
                console.error('Error fetching article:', err);
                setError('Failed to fetch article');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [subcategory, articleId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header user={user} onLoginClick={handleLogin} onLogoutClick={logout} />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Loading article...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-white">
                <Header user={user} onLoginClick={handleLogin} onLogoutClick={logout} />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <div className="text-red-500 text-xl font-medium">{error || 'Article not found'}</div>
                    </div>
                </div>
            </div>
        );
    }

    let articleContent = article.content;
    if (typeof articleContent === 'string') {
        try {
            articleContent = JSON.parse(articleContent);
        } catch (e) {
            articleContent = [];
        }
    }

    const renderCardContent = (cards) => {
        if (!Array.isArray(cards)) return null;

        return cards.map((card, index) => (
            <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{card.heading}</h2>
                <div className="prose max-w-none">
                    <RichTextDisplay content={card.content} />
                </div>
            </div>
        ));
    };

    // Separate authors and other contributors
    const authors = article.contributors?.filter(c => c.contribution_type === 'author') || [];
    const otherContributors = article.contributors?.filter(c => c.contribution_type !== 'author') || [];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SEO
                title={article.title || 'Article'}
                description={article.meta_description || article.content?.substring(0, 160)}
                keywords={article.meta_keywords}
                canonicalUrl={article.canonical_url}
                ogTitle={article.og_title || article.title}
                ogDescription={article.og_description || article.meta_description}
                ogImage={article.og_image}
            />
            <Header user={user} onLoginClick={handleLogin} onLogoutClick={logout} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to={`/categories/${subcategory.split('/')[0]}/${subcategory}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        &larr; Back to Category
                    </Link>
                    <button
                        onClick={handleEditInEditor}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                        Edit &amp; save to profile
                    </button>
                </div>

                <article className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <header className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {article.title || 'Untitled Article'}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                            <span>
                                By {article.author?.name || article.author?.email?.split('@')[0] || 'Unknown'}
                            </span>
                            {article.updated_at && (
                                <span>
                                    Updated: {new Date(article.updated_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {article.facetAssignments && article.facetAssignments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {article.facetAssignments.map((assignment) => (
                                    <span
                                        key={assignment.id}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                        {assignment.value?.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    <div className="article-content">
                        {renderCardContent(articleContent)}
                    </div>

                    {authors.length > 0 && (
                        <section className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {authors.length === 1 ? 'Author' : 'Authors'}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {authors.map((author) => (
                                    <div
                                        key={author.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                                                    {(author.user?.name || author.user?.email)?.charAt(0).toUpperCase() || 'A'}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {author.user?.name || author.user?.email?.split('@')[0] || 'Anonymous'}
                                                </h4>
                                                {author.user?.email && (
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {author.user.email}
                                                    </p>
                                                )}
                                                {author.user?.website && (
                                                    <a
                                                        href={formatUrl(author.user.website)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm truncate block mt-1"
                                                    >
                                                        Visit website
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {otherContributors.length > 0 && (
                        <section className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Contributors
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {otherContributors.map((contributor) => (
                                    <div
                                        key={contributor.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                                                    {contributor.user?.email?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {contributor.user?.name || contributor.user?.email?.split('@')[0] || 'Anonymous'}
                                                </h4>
                                                {contributor.user?.website && (
                                                    <a
                                                        href={formatUrl(contributor.user.website)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm truncate block"
                                                    >
                                                        Visit website
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </article>
            </div>
            <Footer />
        </div>
    );
};

export default PublishedArticle;
