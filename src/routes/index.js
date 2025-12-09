import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ArticleEditorApp from '../components/ArticleEditorApp';
import ProfilePage from '../components/ProfilePage';
import BlogList from '../components/BlogList';
import BlogPost from '../components/BlogPost';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ArticleEditorApp />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Add more routes here as needed */}
        </Routes>
    );
};

export default AppRoutes;