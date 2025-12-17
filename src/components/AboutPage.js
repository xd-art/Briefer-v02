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
                            Briefer.pro is a growing collection of simple "How to" guides, built by AI and people like you to create clear, connected step-by-step instructions.
                            Got a practical skill to share? Just type it into one quick prompt for a "How to" guide—AI drafts it, you review and tweak it with your real-world know-how, save, and it'll go live on the site. Super easy start: your expertise + one idea = your published guide!
                        </p>
                        <p className="mb-4">
                            Pick a topic you're good at and type a prompt for a "How to" guide—AI builds the base.
                            Use AI to make new guides, tweak old ones, and share your updates on the site.
                        </p>



                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">A Bit More About Briefer.pro</h2>
                        <p className="mb-4">
                            Briefer.pro is an active hub for easy-to-follow guides and tech docs. It's a smart space where you and others team up to make and refine content with built-in AI help. We aim to grow a collection of useful knowledge that stays clear and organized.
                        </p>
                        <p className="mb-4">
                            You'll find real-world guides on programming, design, video, marketing, and audio.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How AI Gathers and Improves Content Here</h2>
                        <p className="mb-4">
                            AI on Briefer.pro pulls ideas and bits of text from tons of articles, blogs, and online resources—it's like scanning a massive internet library to mix and match for your draft. But the real power comes from you: when you edit or add to a guide (fixing steps, sharing tips from your experience), you make it more detailed and spot-on. This creates richer content that AI "parses" (learns from) next time, making future drafts smarter and the whole site better. Your tweaks fuel a cycle where human smarts upgrade the AI—win-win!
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How It Works: Making Content and Spreading Knowledge</h2>
                        <p className="mb-4">
                            Our guides follow a simple, standard format. AI helps by "diverging" knowledge—splitting big ideas into smaller, linked pieces.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Creating Content with AI Links</h3>
                        <p className="mb-4">
                            We use a card-style editor (called CardEditor) to build, tweak, and preview guides right in your browser.
                        </p>

                        <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
                            <li>
                                <strong>AI Helper:</strong> Start a new guide or edit a part (a "card"), and type a prompt into the AI box.
                            </li>
                            <li>
                                <strong>Smart Links:</strong> As AI writes, it adds <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">&lt;ai-link&gt;</code> tags for tricky subtopics that need their own guide.
                            </li>
                            <li>
                                <strong>Link Setup:</strong> Each link holds the new guide's title (topic) and format type (like "guide").
                            </li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Spreading Knowledge</h3>
                        <p className="mb-4">
                            These links let anyone click to create missing side-guides from the main one.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
                            <li>
                                <strong>Start It:</strong> Click a link in the text to kick off new content.
                            </li>
                            <li>
                                <strong>Draft Made:</strong> AI uses the main guide's info and format to write a new one, saving it as your draft.
                            </li>
                            <li>
                                <strong>Connect It:</strong> Tidy it up, get admin approval, publish, and link it as a "child" to the parent. This builds chains like parent → child for easy browsing, creating a web of connected guides.
                            </li>
                        </ul>

                        <p className="mb-4 italic">
                            In short, AI breaks down huge topics (like building a website, covering code and design) into focused, linked guides—all keeping the same clear structure.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Quick Note on RAG (Retrieval-Augmented Generation)</h3>
                        <p className="mb-4">
                            RAG is like a super-smart search buddy for AI: it first searches (retrieval) for the best facts from a knowledge base (no wild guesses!), then builds (generation) a custom answer on top. Result? Accurate, up-to-date responses every time—like asking "how to fix a bike" and getting a tailored guide pulled from real sources, not made-up stuff. We use it behind the scenes to keep your guides fresh and reliable!
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
                            <Link to="/terms-and-conditions" className="!text-blue-600 hover:text-blue-800 underline">
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
                            <Link to="/privacy-policy" className="!text-blue-600 hover:text-blue-800 underline">
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
