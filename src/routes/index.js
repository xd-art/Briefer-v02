import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ArticleEditorApp from '../components/ArticleEditorApp';
import BlogList from '../components/BlogList';
import BlogPost from '../components/BlogPost';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ArticleEditorApp />} />
            <Route path="/profile" element={<ArticleEditorApp initialView="profile" />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Add more routes here as needed */}
        </Routes>
    );
};

export default AppRoutes;