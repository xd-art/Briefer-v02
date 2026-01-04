import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import RegistrationModal from './RegistrationModal';
import ThreeColumnLayout from './ThreeColumnLayout';
import LeftNavigation from './LeftNavigation';
import RightSidebar from './RightSidebar';
import useDebounce from '../hooks/useDebounce';
import SEO from '../utils/seo';

const CategoriesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const isFirstRun = useRef(true);

    const categories = [
        {
            title: 'Programming & Development',
            subcategories: [
                { name: 'Web Development', slug: 'web-development' },
                { name: 'Backend Development', slug: 'backend-development' },
                { name: 'Frontend Development', slug: 'frontend-development' },
                { name: 'Mobile Development', slug: 'mobile-development' },
                { name: 'Data Science & ML', slug: 'data-science-ml' },
                { name: 'DevOps & Infrastructure', slug: 'devops-infrastructure' },
                { name: 'Databases', slug: 'databases' }
            ]
        },
        {
            title: 'Business & Management',
            subcategories: [
                { name: 'Project Management', slug: 'project-management' },
                { name: 'Sales & Marketing', slug: 'sales-marketing' },
                { name: 'Human Resources', slug: 'human-resources' },
                { name: 'Finance & Accounting', slug: 'finance-accounting' }
            ]
        },
        {
            title: 'Design & Creative',
            subcategories: [
                { name: 'UI/UX Design', slug: 'ui-ux-design' },
                { name: 'Graphic Design', slug: 'graphic-design' },
                { name: 'Motion Graphics', slug: 'motion-graphics' },
                { name: 'Content Creation', slug: 'content-creation' }
            ]
        }
    ];

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearch.trim() === '') {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            try {
                setLoading(true);
                setIsSearching(true);
                const response = await fetch(
                    `/api/articles/search?query=${encodeURIComponent(debouncedSearch)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.articles || []);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isFirstRun.current) {
            isFirstRun.current = false;
        } else {
            performSearch();
        }
    }, [debouncedSearch]);

    const handleEditArticle = (article) => {
        // ... (reuse logic or keep simple navigation for now)
        // For consistency with other pages, we can just navigate or add edit logic if needed.
        // For now, let's just assume we want to view it primarily.
        console.log('📝 Opening article:', article.title);

        // Basic content parsing if needed solely for log
        let articleContent = article.content;
        if (typeof articleContent === 'string') {
            try {
                articleContent = JSON.parse(articleContent);
            } catch (e) {
                articleContent = [];
            }
        }

        const navigationState = {
            editArticle: {
                id: article.id,
                title: article.title,
                cards: articleContent
            }
        };
        navigate('/', { state: navigationState });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SEO
                title="Browse Categories - How-to Articles"
                description="Explore our comprehensive collection of how-to guides and tutorials across various categories."
            />
            <Header
                user={user}
                onLoginClick={() => setShowRegistrationModal(true)}
                currentView="categories"
            />

            <ThreeColumnLayout
                left={<LeftNavigation />}
                right={<RightSidebar />}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        How-to Article Categories
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Search for specific guides or select an area to browse.
                    </p>

                    {/* Global Search Input */}
                    <div className="relative ">
                        <input
                            type="text"
                            placeholder="Search detailed how-to guides..."
                            className="w-full pl-12 pr-4 py-4 border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-500 focus:outline-none"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        {isSearching && searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {isSearching ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {loading ? 'Searching...' : `Found ${searchResults.length} results`}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {searchResults.map((article) => (
                                        <li key={article.id} className="border-b border-gray-200 last:border-0">
                                            <div className="block hover:bg-gray-50 transition-colors p-4">
                                                <Link
                                                    to="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // For now, let's link to the first category if available, or just use edit 
                                                        // Ideally we should have a proper article view link.
                                                        // Assuming article view logic similar to CategoryArticlesPage:
                                                        // We need subcategory slot... we might not have it easily if it's mixed.
                                                        // Let's use the edit handler for consistency or a direct edit button.
                                                        handleEditArticle(article);
                                                    }}
                                                    className="text-lg font-medium text-blue-600 hover:underline block"
                                                >
                                                    {article.title || 'Untitled Article'}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    By {article.author?.name || 'Unknown'} • {article.updated_at ? new Date(article.updated_at).toLocaleDateString() : ''}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {article.facetAssignments?.map(fa => (
                                                        <span key={fa.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            {fa.value?.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No articles found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {categories.map((category, index) => (
                            <div key={index}>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                    {category.title}
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.subcategories.map((subcategory, subIndex) => (
                                        <Link
                                            key={subIndex}
                                            to={`/categories/${category.title.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}/${subcategory.slug}`}
                                            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group bg-white"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                                                {subcategory.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Browse guides &rarr;
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ThreeColumnLayout>

            <Footer />

            <RegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
            />
        </div>
    );
};

export default CategoriesPage;
