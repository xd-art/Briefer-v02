import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ArticleEditorApp from '../components/ArticleEditorApp';
import HomePage from '../components/HomePage';
import ProfilePage from '../components/ProfilePage';
import BlogList from '../components/BlogList';
import BlogPost from '../components/BlogPost';
import CategoriesPage from '../components/CategoriesPage';
import CategoryArticlesPage from '../components/CategoryArticlesPage';
import PublishedArticle from '../components/PublishedArticle';
import LayoutTestPage from '../components/LayoutTestPage';
import AboutPage from '../components/AboutPage';
import PrivacyPolicyPage from '../components/PrivacyPolicyPage';
import TermsAndConditionsPage from '../components/TermsAndConditionsPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ArticleEditorApp />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:category/:subcategory" element={<CategoryArticlesPage />} />
            <Route path="/article/:subcategory/:articleId" element={<PublishedArticle />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/layout-test" element={<LayoutTestPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            {/* Add more routes here as needed */}
        </Routes>
    );
};

export default AppRoutes;