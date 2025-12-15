import React from 'react';
import ThreeColumnLayout from './ThreeColumnLayout';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

/**
 * LayoutTestPage
 * 
 * A test page to verify ThreeColumnLayout component behavior
 * Shows placeholder content in all three columns with different styling
 */
const LayoutTestPage = () => {
    const { user, logout } = useAuth();

    // Placeholder: Left Navigation
    const LeftNavPlaceholder = () => (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Explore Categories
            </h2>
            <ul className="space-y-2">
                <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Graphic Design
                    </a>
                </li>
                <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Writing
                    </a>
                </li>
                <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Video Production
                    </a>
                </li>
                <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Audio
                    </a>
                </li>
                <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Marketing
                    </a>
                </li>
                <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Programming
                    </a>
                </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Quick Actions
                </h3>
                <button className="text-sm text-gray-600 hover:text-gray-900 block">
                    View All Categories →
                </button>
            </div>
        </div>
    );

    // Placeholder: Right Sidebar
    const RightSidebarPlaceholder = () => (
        <div className="space-y-6">
            {/* Featured Articles Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Featured from Categories
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <article key={i} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                                How to Create Amazing Designs in 2024
                            </h3>
                            <p className="text-xs text-gray-500">
                                Graphic Design · Illustration
                            </p>
                        </article>
                    ))}
                </div>
            </div>

            {/* Random Inspiration Section */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                    <h2 className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                        Random Inspiration
                    </h2>
                </div>
                <div className="p-4">
                    <p className="text-xs text-blue-700 mb-3">
                        Don't know where to start? Try this:
                    </p>
                    <article className="bg-white rounded p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Complete Guide to Video Editing
                        </h3>
                        <p className="text-xs text-gray-500">
                            Video Production
                        </p>
                    </article>
                </div>
            </div>
        </div>
    );

    // Placeholder: Main Content
    const MainContentPlaceholder = () => (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Three Column Layout Test
            </h1>

            <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-4">
                    This is a test page to verify the ThreeColumnLayout component works correctly
                    across different screen sizes.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                    Desktop Behavior (≥ 1024px)
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                    <li>Left column: 3/12 width - Shows category navigation</li>
                    <li>Center column: 6/12 width - Main content (this area)</li>
                    <li>Right column: 3/12 width - Sidebar with featured articles</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                    Mobile/Tablet Behavior (&lt; 1024px)
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                    <li>All columns stack vertically</li>
                    <li>Main content appears first</li>
                    <li>Left and right columns hidden by default (can be shown with props)</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                    Test Instructions
                </h2>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-6">
                    <li>Resize your browser window to see responsive behavior</li>
                    <li>At ≥ 1024px width, you should see 3 columns side by side</li>
                    <li>Below 1024px, columns should stack vertically</li>
                    <li>Check that spacing (gap-8) looks correct</li>
                    <li>Verify that sidebar content is readable and styled properly</li>
                </ol>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                        ✅ Layout Component Features
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>✓ Responsive 12-column grid system</li>
                        <li>✓ Automatic column hiding on mobile</li>
                        <li>✓ Optional mobile visibility control</li>
                        <li>✓ Flexible content slots (left, center, right)</li>
                        <li>✓ Custom className support for each column</li>
                        <li>✓ Semantic HTML with proper ARIA labels</li>
                    </ul>
                </div>

                <div className="bg-gray-100 rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Sample Content Block
                    </h3>
                    <p className="text-gray-700 mb-4">
                        This is a sample content block to test how regular paragraphs and content
                        flow within the center column. The center column should be wide enough for
                        comfortable reading while leaving room for the sidebars on desktop.
                    </p>
                    <p className="text-gray-700">
                        The maximum line length is optimized for readability, typically around
                        60-80 characters per line on desktop screens.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header
                user={user}
                onLogoutClick={logout}
                currentView="home"
            />

            <ThreeColumnLayout
                left={<LeftNavPlaceholder />}
                right={<RightSidebarPlaceholder />}
            >
                <MainContentPlaceholder />
            </ThreeColumnLayout>
            <Footer />
        </div>
    );
};

export default LayoutTestPage;
