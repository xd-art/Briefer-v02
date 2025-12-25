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
                        <h1 className="text-4xl font-bold mb-6 text-gray-900">How-To Article Generator</h1>

                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Text Column */}
                            <div className="md:w-1/2 w-full">
                                <p className="text-gray-800">
                                    <strong>Briefer.pro</strong> is a living library of practical How-To instructions, where AI and the community together build a network of clearly structured guides.

                                </p>
                                <div className="flex flex-wrap gap-4 mt-6">
                                    <Link
                                        to="/create"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow"
                                    >
                                        Create new article
                                    </Link>
                                    <Link
                                        to="/categories"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow"
                                    >
                                        Revise articles
                                    </Link>
                                </div>
                                <h3 className='text-2xl mt-4 font-bold mb-4 text-gray-900'>  Know how to do something in practice?</h3>
                                <p className="mt-4 text-gray-800">
                                    Whether creating a new article or improving an existing one, simply describe your insight in a single prompt. The AI Agent will instantly generate a draft for you to review, refine with your real-world experience, and publish. Your contribution updates the site, making you a co-author of the global knowledge base

                                </p>


                            </div>

                            {/* Video Column */}
                            <div className="md:w-1/2 w-full flex justify-center">
                                <video
                                    src="/videos/intro.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-64 h-auto rounded"
                                ></video>
                            </div>
                        </div>

                        <div className="mt-6 text-gray-800">
                            <section className="ai-workflow max-w-3xl mx-auto  py-6 space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Read
                                    </h3>
                                    <p className="mt-2 text-base leading-relaxed text-gray-700">
                                        Explore a knowledge base with a unified logical structure.
                                        Deeper exploration of complex topics happens instantly through AI links
                                        that automatically generate additional content.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Create
                                    </h3>
                                    <p className="mt-2 text-base leading-relaxed text-gray-700">
                                        Create new articles from scratch.
                                        AI automatically generates a structured draft that can be published
                                        and refined immediately.
                                        When a new article is created, the user becomes its author.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Edit
                                    </h3>
                                    <p className="mt-2 text-base leading-relaxed text-gray-700">
                                        Edit any article on the site by sending a single prompt through the
                                        built-in editor or by editing manually.
                                        AI applies changes while preserving the article’s context and structure.
                                        Every valid edit makes the user a co-author of the article.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Post
                                    </h3>
                                    <p className="mt-2 text-base leading-relaxed text-gray-700">
                                        All new articles and edits go through AI moderation after being saved.
                                        Once approved, AI automatically updates an existing article or publishes
                                        a new one on the site.
                                        Authorship and co-authorship are recorded automatically.
                                    </p>
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
