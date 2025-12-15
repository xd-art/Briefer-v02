import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import RegistrationModal from './RegistrationModal';
import ThreeColumnLayout from './ThreeColumnLayout';
import LeftNavigation from './LeftNavigation';
import RightSidebar from './RightSidebar';

const CategoriesPage = () => {
    const { user } = useAuth();
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

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
        <div className="min-h-screen bg-white flex flex-col">
            <Header
                user={user}
                onLoginClick={() => setShowRegistrationModal(true)}
                currentView="categories"
            />

            <ThreeColumnLayout
                left={<LeftNavigation />}
                right={<RightSidebar />}
            >
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
