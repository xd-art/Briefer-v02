import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import SEO from '../utils/seo';

const AboutPage = () => {
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
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            <Header
                user={user}
                onLoginClick={handleLoginClick}
                onLogoutClick={logout}
                onNavigate={handleNavigate}
                currentView="about"
            />

            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SEO
                    title="About Briefer.pro"
                    description="Briefer.pro is a living library of practical instructions and a dynamic database of technical documentation."
                />

                <div className="prose prose-lg prose-blue mx-auto">
                    <section id="about-briefer" className="mb-12">
                        <h1 className="text-3xl  text-gray-900 ">About Briefer.pro</h1>
                        <p className="mb-4">
                            <strong>Briefer.pro</strong> is a living library of practical instructions and a dynamic database of technical
                            documentation.
                            We are an intelligent environment where users and editors collaboratively create and improve content using built-in
                            AI integration.
                            Our goal is to build a self-growing ecosystem of practical knowledge, where content is strictly structured to ensure
                            maximum clarity.
                        </p>
                        <p>
                            The platform features hands-on guides in programming, design, video, marketing, and audio.
                        </p>
                    </section>


                    <section id="how-it-works" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works: Content Generation and Knowledge Divergence</h2>
                        <p className="mb-4">
                            At the core of our platform is a unified article structure and a unique content creation mechanism, where artificial
                            intelligence
                            acts as an assistant in <strong>Knowledge Divergence</strong>.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Content Generation with AI Links</h3>
                        <p className="mb-4">
                            The platform uses an <strong>Article Generator</strong> component (card-based editor, or <em>CardEditor</em>),
                            which allows users to create, edit, and preview articles directly in the browser.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li>
                                <strong>Using the AI assistant:</strong> When a user creates a new article or edits an existing section (card),
                                they can enter a prompt into the AI assistant input field.
                            </li>
                            <li>
                                <strong>Automatic insertion of AI links:</strong> During content generation, the AI automatically inserts
                                <code>&lt;ai-link&gt;</code> tags into the text where it identifies subtopics that are broad and complex and
                                cannot
                                be fully covered within the current unified guide.
                            </li>
                            <li>
                                <strong>Link structure:</strong> Each generated AI link is a special interactive marker that includes
                                <code>topic</code> (the exact title of the new article) and <code>template</code>
                                (a structure template identifier, for example <code>guide</code>).
                            </li>
                        </ul>

                        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Knowledge Divergence</h3>
                        <p className="mb-4">
                            AI links act as interactive elements that allow users to trigger AI-based generation of missing sub-articles
                            directly from the text of the parent article.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-6">
                            <li>
                                <strong>Generation trigger:</strong> When a user (or guest) clicks an AI link within the text,
                                this action initiates a request to generate new content.
                            </li>
                            <li>
                                <strong>Draft creation:</strong> The AI automatically generates a new article using the context of the parent
                                article and the selected structural template. This article is immediately saved as a draft in the user’s profile.
                            </li>
                            <li>
                                <strong>Linking:</strong> After the draft is refined and approved by an administrator (moderator),
                                it is published and linked back as a child article of the parent one. These relationships create
                                “parent → child” article chains for navigation, forming a networked knowledge graph.
                            </li>
                        </ul>

                        <p>
                            Through this cycle, AI helps users break down broad topics (for example, website creation, which includes
                            programming and design) into a network of interconnected but more narrowly focused articles,
                            while maintaining a strict unified structure for each one.
                        </p>
                    </section>

                    <hr className="my-8 border-gray-200" />

                    <section id="terms" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>
                        <p className="mb-4">
                            On our platform, any content saved to a user profile does not affect the public version without moderator approval.
                            The AI agent assists in creating and improving content, but the Administrator reviews the content,
                            adds external links, AI links, and glossary explanations.
                        </p>
                        <p className="mb-4">
                            Since AI alone cannot fully account for all the complexities of real-world projects,
                            your contribution and experience are essential to ensure practical and relevant guidance.
                        </p>
                        <p>
                            <Link to="/terms-and-conditions" className="text-blue-600 hover:text-blue-800 underline">
                                Read the full Terms and Conditions
                            </Link>
                        </p>
                    </section>

                    <section id="privacy" className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
                        <p className="mb-4">
                            We respect your privacy and are committed to protecting your personal data.
                            The platform may collect and process limited user information to ensure proper
                            functionality of AI features, content moderation, and account management.
                        </p>
                        <p className="mb-4">
                            We do not sell personal data to third parties. Any data used for AI-assisted
                            content generation is handled in accordance with applicable data protection laws.
                        </p>
                        <p>
                            <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                                Read our full Privacy Policy
                            </Link>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
