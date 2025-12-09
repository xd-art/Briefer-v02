import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ onNavigate, onEditArticle }) => {
    const { user, logout } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            if (!user) return;
            try {
                const response = await fetch(`http://localhost:3003/api/articles/user/${user.id}`, {
                    credentials: 'include', // Include cookies for authentication
                });
                if (!response.ok) throw new Error('Failed to fetch articles');
                const data = await response.json();
                setArticles(data.drafts || []);
            } catch (err) {
                console.error('Error fetching articles:', err);
                setError('Failed to load your articles.');
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        // Redirect to home page after logout
        navigate('/');
    };

    const handleDelete = async (articleId) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        try {
            const response = await fetch(`http://localhost:3003/api/articles/${articleId}`, {
                method: 'DELETE',
                credentials: 'include', // Include cookies for authentication
            });
            if (!response.ok) throw new Error('Failed to delete article');
            setArticles(articles.filter(article => article.id !== articleId));
        } catch (err) {
            console.error('Error deleting article:', err);
            alert('Failed to delete article');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-20 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Articles</h1>
                <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                    Logout
                </button>
            </div>

            {articles.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500 mb-4">You haven't saved any articles yet.</p>
                    <button
                        onClick={() => onNavigate && onNavigate('generator')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Create your first article
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {articles.map((article) => (
                            <li key={article.id} className="border-b border-gray-200 last:border-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <button
                                            onClick={() => onEditArticle && onEditArticle(article)}
                                            className="text-lg font-medium text-blue-600 hover:underline focus:outline-none w-full text-left"
                                        >
                                            {article.title || 'Untitled Article'}
                                        </button>
                                        <p className="text-sm text-gray-500 mt-1">
                                            (Modified: {new Date(article.updated_at || article.updatedAt).toLocaleDateString()})
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;