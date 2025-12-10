import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ArticleEditorApp from '../components/ArticleEditorApp';
import ProfilePage from '../components/ProfilePage';
import BlogList from '../components/BlogList';
import BlogPost from '../components/BlogPost';
import CategoriesPage from '../components/CategoriesPage';
import CategoryArticlesPage from '../components/CategoryArticlesPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ArticleEditorApp />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:category/:subcategory" element={<CategoryArticlesPage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Add more routes here as needed */}
        </Routes>
    );
};

export default AppRoutes;