import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

const CategoriesPage = () => {
    const { user, logout } = useAuth();
    
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

    return (
        <div className="min-h-screen bg-white">
            <Header 
                user={user}
                onLogoutClick={logout}
            />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    How-to Article Categories
                </h1>
                
                <p className="text-gray-600 mb-12">
                    Select an area to view instructions.
                </p>

                <div className="space-y-12">
                    {categories.map((category, index) => (
                        <div key={index}>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                {category.title}
                            </h2>
                            
                            <ul className="space-y-2">
                                {category.subcategories.map((subcategory, subIndex) => (
                                    <li key={subIndex}>
                                        <Link
                                            to={`/categories/${category.title.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}/${subcategory.slug}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {subcategory.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;
