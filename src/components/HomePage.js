import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ThreeColumnLayout from './ThreeColumnLayout';
import LeftNavigation from './LeftNavigation';
import RightSidebar from './RightSidebar';
import ArticleGenerator from './ArticleGenerator';
import { useAuth } from '../context/AuthContext';
import { ArticleManager } from '../utils/ArticleManager';

import iconRead from '../assets/icons/icon-read.png';
import iconCreate from '../assets/icons/icon-create.png';
import iconEdit from '../assets/icons/icon-edit.png';
import iconPost from '../assets/icons/icon-post.png';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async (topic, detailedPrompt) => {
        setIsGenerating(true);

        try {
            const response = await fetch('http://localhost:3003/api/ai/generate-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: topic,
                    detailedPrompt: detailedPrompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.details || errorData.error || `API request failed: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const aiResponse = data.content;

            if (aiResponse.startsWith('ERROR:')) {
                alert(aiResponse); // Using alert for now as rudimentary error handling in Home
                setIsGenerating(false);
                return;
            }

            // --- HTML Parsing Logic ---
            let title = topic;
            let bodyContent = aiResponse;

            const h1Match = aiResponse.match(/<h1[^>]*>(.*?)<\/h1>/i);
            if (h1Match) {
                title = h1Match[1].trim();
                bodyContent = aiResponse.replace(h1Match[0], '').trim();
            }

            const parts = bodyContent.split(/<h2[^>]*>(.*?)<\/h2>/i);
            const newCards = [];

            if (parts[0] && parts[0].trim()) {
                const sectionId = `section-intro-${Date.now()}`;
                let htmlContent = parts[0].trim();
                if (!htmlContent.includes('<h2')) {
                    htmlContent = `<h2 class="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>` + htmlContent;
                }
                newCards.push({ id: sectionId, content: htmlContent });
            }

            for (let i = 1; i < parts.length; i += 2) {
                const sectionTitle = parts[i].trim();
                let sectionContent = parts[i + 1] ? parts[i + 1].trim() : '';
                if (!sectionContent && !sectionTitle) continue;
                const sectionId = `section-${i}-${Date.now()}`;
                let htmlContent = `<h2 class="text-2xl font-semibold mb-4 text-gray-800">${sectionTitle}</h2>` + sectionContent;
                newCards.push({ id: sectionId, content: htmlContent });
            }

            // Create and Save Article
            const activeId = ArticleManager.createArticle(title);
            ArticleManager.saveArticle(activeId, {
                title: title,
                cards: newCards
            });

            // Navigate to editor with fully formed article
            navigate('/create', {
                state: {
                    editArticle: {
                        id: activeId,
                        title: title,
                        cards: newCards
                    }
                }
            });

        } catch (error) {
            console.error('Generation Error:', error);
            alert(`Generation failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header user={user} onLoginClick={() => { }} onNavigate={() => { }} />

            <ThreeColumnLayout
                left={<LeftNavigation />}
                right={<RightSidebar />}
            >
                <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6">
                        <h1 className="text-4xl font-bold mb-6 text-gray-900">Turn Insights into Actionable Guides with an AI‑Powered How‑To Article Generator</h1>

                        <div className="flex flex-col items-center gap-6">
                            {/* Text Column */}
                            <div className="w-full">
                                <p className="text-gray-800 pb-6">
                                    <strong>Briefer.pro</strong> is a living library of practical instructions. Co-create with AI to build a structured network of knowledge.

                                </p>

                                <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    {/* Create New Guide Card */}
                                    <div className="bg-white p-6 rounded-xl flex flex-col justify-between h-full hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300">
                                        <div>

                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                Get a solid article framework in seconds. AI lays the foundation, which you bring to life with your unique cases and proven solutions before becoming the author.
                                            </p>
                                        </div>
                                        <Link
                                            to="/create"
                                            className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-bold transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
                                        >
                                            Create New Guide
                                        </Link>
                                    </div>

                                    {/* Refine Existing Guide Card */}
                                    <div className="bg-white p-6 rounded-xl  flex flex-col justify-between h-full hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300">
                                        <div>

                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                Become a co-author by improving or expanding an existing draft. Use AI to instantly integrate your experience into the global knowledge base and make every guide truly valuable.
                                            </p>
                                        </div>
                                        <Link
                                            to="/categories"
                                            className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full text-sm font-bold transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
                                        >
                                            Refine Existing Guide
                                        </Link>
                                    </div>
                                </div>








                                <h2 className='text-3xl mt-8 font-bold mb-4 text-gray-900'>  Know how to do something in practice?</h2>
                                <p className="mt-4 text-gray-800">
                                    Whether creating a new article or improving an existing one, simply describe your insight in a single prompt. The AI Agent will instantly generate a draft for you to review, refine with your real-world experience, and publish. Your contribution updates the site, making you a co-author of the global knowledge base

                                </p>



                            </div>

                            {/* Video Column */}
                            <div className="w-full flex justify-center">
                                <iframe
                                    title="briefer-intro-1"
                                    src="https://player.vimeo.com/video/1150155829?badge=0&autopause=0&player_id=0&app_id=58479"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className="w-full aspect-video rounded shadow-lg"
                                ></iframe>



                            </div>
                        </div>

                        <div className="mt-6 text-gray-800">
                            <section className="ai-workflow max-w-3xl mx-auto py-6 space-y-12">
                                {/* READ: Text Left, Icon Right */}
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Read</h3>
                                        <p className="text-base leading-relaxed text-gray-700">
                                            Explore a knowledge base with a unified logical structure.
                                            Deeper exploration of complex topics happens instantly through AI links
                                            that automatically generate additional content.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <img src={iconRead} alt="Read Icon" className="h-32 w-auto object-contain" />
                                    </div>
                                </div>

                                {/* CREATE: Icon Left, Text Right */}
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-shrink-0 order-2 md:order-1">
                                        <img src={iconCreate} alt="Create Icon" className="h-32 w-auto object-contain" />
                                    </div>
                                    <div className="flex-1 order-1 md:order-2">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Create</h3>
                                        <p className="text-base leading-relaxed text-gray-700">
                                            Create new articles from scratch.
                                            AI automatically generates a structured draft that can be published
                                            and refined immediately.
                                            When a new article is created, the user becomes its author.
                                        </p>
                                    </div>
                                </div>

                                {/* EDIT: Text Left, Icon Right */}
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit</h3>
                                        <p className="text-base leading-relaxed text-gray-700">
                                            Edit any article on the site by sending a single prompt through the
                                            built-in editor or by editing manually.
                                            AI applies changes while preserving the article’s context and structure.
                                            Every valid edit makes the user a co-author of the article.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <img src={iconEdit} alt="Edit Icon" className="h-32 w-auto object-contain" />
                                    </div>
                                </div>

                                {/* POST: Icon Left, Text Right */}
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-shrink-0 order-2 md:order-1">
                                        <img src={iconPost} alt="Post Icon" className="h-32 w-auto object-contain" />
                                    </div>
                                    <div className="flex-1 order-1 md:order-2">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Post</h3>
                                        <p className="text-base leading-relaxed text-gray-700">
                                            All new articles and edits go through AI moderation after being saved.
                                            Once approved, AI automatically updates an existing article or publishes
                                            a new one on the site.
                                            Authorship and co-authorship are recorded automatically.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>


                </div>

                <ArticleGenerator
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                />
            </ThreeColumnLayout>

            <Footer />
        </div>
    );
};

export default HomePage;
