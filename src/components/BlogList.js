
import React, { useEffect } from 'react';
import blogData from '../data/blog.json';
import SEO from '../utils/seo';
import BlogCard from './BlogCard';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BlogList = () => {
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

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header
                user={user}
                onLoginClick={handleLoginClick}
                onLogoutClick={logout}
                onNavigate={handleNavigate}
                currentView="blog"
            />

            <main className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <SEO
                        title={blogData.title}
                        description={blogData.metaDescription}
                        keywords={blogData.metaKeywords}
                        canonicalUrl={blogData.canonicalUrl}
                        ogTitle={blogData.ogTitle}
                        ogDescription={blogData.ogDescription}
                    />

                    {/* Intro Section */}
                    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Collection of Articles About Human Action
                        </h1>

                        <div className="prose prose-lg mx-auto text-gray-600">
                            <p className="mb-4">
                                Welcome to the <span className="font-semibold text-blue-600">Work and Success Stories</span> blog on the <span className="font-semibold">www.briefer.pro</span> website!
                            </p>
                            <p className="mb-6">
                                Our blog is an exciting journey into the world of work, where we explore interesting stories and learn from practical cases presented by various companies and experts.
                            </p>

                            <div className="bg-blue-50 rounded-lg p-6 text-left mx-auto max-w-3xl">
                                <p className="font-semibold text-blue-900 mb-3">What you will find with us:</p>
                                <ul className="space-y-2 text-blue-800">
                                    <li className="flex items-start">
                                        <span className="mr-2 mt-1 text-blue-500">•</span>
                                        <span><b>Inspirational Cases:</b> Discover how companies overcame challenges.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 mt-1 text-blue-500">•</span>
                                        <span><b>Expert Insights:</b> Knowledge and experience from industry professionals.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 mt-1 text-blue-500">•</span>
                                        <span><b>Lessons from Mistakes:</b> valuable lessons from failures.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 mt-1 text-blue-500">•</span>
                                        <span><b>Technologies and Innovations:</b> The latest tools and methods.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                        {blogData.articles.map((article, index) => (
                            <BlogCard key={index} article={article} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BlogList;
