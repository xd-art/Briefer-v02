import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * LeftNavigation Component
 * 
 * Displays category navigation in the left sidebar.
 * Fetches categories from the facets API and organizes them hierarchically.
 * Shows main domains (Graphic Design, Writing, Video, Audio, Marketing, Programming)
 * with their subcategories.
 */
const LeftNavigation = () => {
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/facets');

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const facets = await response.json();

            // Find the "domain" facet which contains main categories
            const domainFacet = facets.find(f => f.name === 'domain');

            if (domainFacet && domainFacet.values) {
                // Sort and organize categories
                const organizedCategories = domainFacet.values.map(category => ({
                    id: category.id,
                    value: category.value,
                    label: category.label,
                    children: category.children || []
                }));

                setCategories(organizedCategories);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryValue) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryValue]: !prev[categoryValue]
        }));
    };

    // Generate route path for category/subcategory
    const getCategoryPath = (parentValue, childValue = null) => {
        if (childValue) {
            // For subcategories: /categories/parent/child (both with hyphens)
            const parent = parentValue.replace(/_/g, '-');
            const child = childValue.replace(/_/g, '-');
            return `/categories/${parent}/${child}`;
        }
        // For parent categories: use the parent value as subcategory
        // This shows all articles in that domain category
        const parent = parentValue.replace(/_/g, '-');
        return `/categories/domain/${parent}`;
    };

    // Icon mapping for main categories using Material Symbols
    const getCategoryIcon = (categoryValue) => {
        const icons = {
            graphic_design: 'palette',
            content_creation: 'edit_note',
            motion_graphics: 'movie',
            audio_production: 'headphones',
            digital_marketing: 'campaign',
            programming_development: 'code',
            business_management: 'handshake',
            design_creative: 'brush'
        };
        return icons[categoryValue] || 'folder';
    };

    // Check if current path matches category
    const isActiveCategory = (categoryValue) => {
        const path = getCategoryPath(categoryValue);
        return location.pathname.startsWith(path);
    };

    // Check if current path matches subcategory
    const isActiveSubcategory = (parentValue, childValue) => {
        const path = getCategoryPath(parentValue, childValue);
        return location.pathname.startsWith(path);
    };

    if (loading) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
                <button
                    onClick={fetchCategories}
                    className="mt-2 text-xs text-red-700 hover:text-red-900 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <nav className="bg-white rounded-lg border border-white overflow-hidden sticky top-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-2x1">explore</span>
                    Explore Categories
                </h2>
            </div>

            {/* Categories List */}
            <div className="p-4">
                {categories.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No categories available
                    </p>
                ) : (
                    <ul className="space-y-1">
                        {categories.map((category) => (
                            <li key={category.id}>
                                {/* Parent Category */}
                                <div className="flex items-center gap-1 group">
                                    {/* Expand/Collapse Button (Left) */}
                                    <div className="w-6 shrink-0 flex justify-center">
                                        {category.children && category.children.length > 0 && (
                                            <button
                                                onClick={() => toggleCategory(category.value)}
                                                className={`p-0.5 transition-all duration-200 rounded hover:bg-gray-200 ${isActiveCategory(category.value) ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                aria-label={expandedCategories[category.value] ? 'Collapse' : 'Expand'}
                                            >
                                                <span className={`material-symbols-outlined text-base transition-transform duration-300 ${expandedCategories[category.value] ? 'rotate-90' : ''
                                                    }`}>
                                                    chevron_right
                                                </span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Label & Icon (Text Left, Icon Right) */}
                                    <Link
                                        to={getCategoryPath(category.value)}
                                        className={`flex items-center gap-2 text-sm rounded px-2 py-1.5 flex-1 transition-all duration-200 ${isActiveCategory(category.value)
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        <span className="font-medium">{category.label}</span>
                                    </Link>
                                </div>

                                {/* Subcategories */}
                                {expandedCategories[category.value] && category.children && category.children.length > 0 && (
                                    <ul className="mt-1 ml-4 pl-3 border-l-2 border-blue-200 space-y-0.5 animate-slideDown">
                                        {category.children.map((subcategory) => (
                                            <li key={subcategory.id}>
                                                <Link
                                                    to={getCategoryPath(category.value, subcategory.value)}
                                                    className={`block text-sm rounded px-2 py-1 transition-all duration-200 ${isActiveSubcategory(category.value, subcategory.value)
                                                        ? 'bg-blue-100 text-blue-700 font-medium shadow-sm'
                                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    {subcategory.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer - Quick Links */}
            <div className="px-4 py-3 bg-white border-t border-gray-200">
                <Link
                    to="/categories"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1"
                >
                    <span>View All Categories</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
            </div>
        </nav>
    );
};

export default LeftNavigation;
