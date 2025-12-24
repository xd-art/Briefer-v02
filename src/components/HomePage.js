import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ThreeColumnLayout from './ThreeColumnLayout';
import LeftNavigation from './LeftNavigation';
import RightSidebar from './RightSidebar';
import ArticleGenerator from './ArticleGenerator';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = (topic, detailedPrompt) => {
        setIsGenerating(true);
        // Navigate to the editor app with the generation request
        navigate('/', {
            state: {
                generateRequest: {
                    topic,
                    detailedPrompt
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header user={user} onLoginClick={() => { }} onNavigate={() => { }} />

            <ThreeColumnLayout
                left={<LeftNavigation />}
                right={<RightSidebar />}
            >
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
