import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import blogData from '../data/blog.json';
import SEO from '../utils/seo';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

const BlogPost = () => {
    const { slug } = useParams();
    const article = blogData.articles.find(a => a.slug === slug);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/');
    };

    const handleNavigate = (view) => {
        if (view === 'profile') {
            navigate('/profile');
        } else {
            navigate('/');
        }
    };

    if (!article) {
        return (
            <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
                <Header
                    user={user}
                    onLoginClick={handleLoginClick}
                    onLogoutClick={logout}
                    onNavigate={handleNavigate}
                    currentView="blog"
                />
                <main className="py-10 px-4 sm:px-6 lg:px-8">
                    <div className="p-8 text-center">
                        Article not found. <Link to="/blog" className="text-blue-500">Back to Blog</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Header
                user={user}
                onLoginClick={handleLoginClick}
                onLogoutClick={logout}
                onNavigate={handleNavigate}
                currentView="blog"
            />

            <main className="py-10 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto p-6 max-w-4xl bg-white rounded-lg shadow-lg">
                    <SEO
                        title={article.metaTitle || article.title}
                        description={article.metaDescription || article.excerpt}
                        keywords={article.metaKeywords}
                        ogTitle={article.ogTitle || article.title}
                        ogDescription={article.ogDescription || article.excerpt}
                        ogImage={article.ogImage || article.image}
                    />

                    <Link to="/blog" className="text-blue-500 mb-4 inline-block hover:underline">&larr; Back to Blog</Link>

                    <article className="prose lg:prose-xl max-w-none w-full">
                        {article.content ? (
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>
                                <div className="text-gray-600 mb-8 flex items-center space-x-2">
                                    <span className="font-medium">{article.author}</span>
                                    <span>|</span>
                                    <span>{article.date}</span>
                                </div>

                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-auto mb-8 rounded-lg shadow-md object-cover max-h-[500px]"
                                />

                                <div className="text-lg leading-relaxed text-gray-700">
                                    <p className="font-semibold text-xl mb-6 text-gray-800">{article.excerpt}</p>
                                    <div className="space-y-4">
                                        <p>
                                            (Full article content would go here. Currently using placeholder text as the provided data only contained excerpts.)
                                        </p>
                                        <p>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                        </p>
                                        <p>
                                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </article>
                </div>
            </main>
        </div>
    );
};

export default BlogPost;
