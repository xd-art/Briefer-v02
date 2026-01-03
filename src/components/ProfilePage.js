import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ThreeColumnLayout from './ThreeColumnLayout';
import LeftNavigation from './LeftNavigation';
import RightSidebar from './RightSidebar';

const ProfilePage = () => {
    const { user, logout, refreshUser } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', bio: '', website: '' });
    const [saveMessage, setSaveMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            if (!user) return;
            try {
                const response = await fetch(`http://localhost:3003/api/articles/user/${user.id}`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Failed to fetch articles');
                const data = await response.json();
                setArticles(data.drafts || []);

                // Set initial profile data
                setProfileData({
                    name: user.name || '',
                    bio: user.bio || '',
                    website: user.website || ''
                });
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
        navigate('/');
    };

    const handleEditArticle = (article) => {
        console.log('📝 ProfilePage: Opening article', article.id, article.title);
        // Navigate to editor with article ID to open in editor
        navigate(`/create?id=${article.id}`);
    };

    const handleCreateArticle = () => {
        navigate('/create');
    };

    const handleDelete = async (articleId) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        try {
            const response = await fetch(`http://localhost:3003/api/articles/${articleId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to delete article');
            setArticles(articles.filter(article => article.id !== articleId));
        } catch (err) {
            console.error('Error deleting article:', err);
            alert('Failed to delete article');
        }
    };

    const handleSaveProfile = async (data) => {
        try {
            setIsSaving(true);
            const response = await fetch('http://localhost:3003/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            // Refresh user data in context
            await refreshUser();

            // Show success message
            setSaveMessage('Profile updated successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setSaveMessage(`Error: ${err.message}`);
            setTimeout(() => setSaveMessage(''), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const debouncedSave = (data) => {
        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout to save after 1 second of no typing
        saveTimeoutRef.current = setTimeout(() => {
            handleSaveProfile(data);
        }, 1000);
    };

    const handleCloseEdit = async () => {
        if (hasChanges) {
            // Clean data: send null for empty website to delete it from DB
            const cleanedData = {
                name: profileData.name,
                bio: profileData.bio,
                website: profileData.website.trim() || null
            };
            await handleSaveProfile(cleanedData);
        }
        setEditingProfile(false);
        setHasChanges(false);
    };

    // Ensure URL has protocol to prevent localhost prefix
    const formatExternalUrl = (url) => {
        if (!url) return url;
        const trimmedUrl = url.trim();
        // If URL doesn't start with http:// or https://, add https://
        if (!trimmedUrl.match(/^https?:\/\//i)) {
            return `https://${trimmedUrl}`;
        }
        return trimmedUrl;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header user={user} onLoginClick={() => { }} currentView="profile" />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header user={user} onLoginClick={() => { }} currentView="profile" />
                <div className="text-center py-20 text-red-600">{error}</div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header user={user} onLoginClick={() => { }} currentView="profile" />
            <ThreeColumnLayout
                left={<LeftNavigation />}
                right={<RightSidebar />}
            >
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {saveMessage && (
                    <div className={`mb-4 p-4 rounded ${saveMessage.startsWith('Error')
                        ? 'bg-red-100 border border-red-400 text-red-700'
                        : 'bg-green-100 border border-green-400 text-green-700'
                        }`}>
                        {saveMessage}
                    </div>
                )}

                {isSaving && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm">
                        💾 Saving changes...
                    </div>
                )}

                {/* Profile Information Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                        {editingProfile ? (
                            <button
                                onClick={handleCloseEdit}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Close
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditingProfile(true)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {editingProfile ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        setProfileData({ ...profileData, name: newName });
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio (max 160 characters)
                                </label>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => {
                                        const newBio = e.target.value;
                                        setProfileData({ ...profileData, bio: newBio });
                                        setHasChanges(true);
                                    }}
                                    maxLength={160}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell us about yourself..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {profileData.bio.length}/160 characters
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Website (optional)
                                </label>
                                <input
                                    type="url"
                                    value={profileData.website}
                                    onChange={(e) => {
                                        const newWebsite = e.target.value;
                                        setProfileData({ ...profileData, website: newWebsite });
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://yourwebsite.com"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Include https:// or http:// at the beginning
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Email</p>
                                <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Name</p>
                                <p className="text-gray-900">{user?.name || profileData.name || 'No name set'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Bio</p>
                                <p className="text-gray-900">{user?.bio || profileData.bio || 'No bio yet'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Website</p>
                                {(user?.website || profileData.website) ? (
                                    <a
                                        href={formatExternalUrl(user?.website || profileData.website)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        {user?.website || profileData.website}
                                    </a>
                                ) : (
                                    <p className="text-gray-900">No website</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Articles Section */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Articles</h2>

                {articles.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500 mb-4">You haven't saved any articles yet.</p>
                        <button
                            onClick={handleCreateArticle}
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
                                                onClick={() => handleEditArticle(article)}
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
            </ThreeColumnLayout>
            <Footer />
        </div>
    );
};

export default ProfilePage;