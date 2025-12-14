import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/briefer-logo.svg';

const Header = ({ user, onLoginClick, onNavigate, currentView }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isHome = location.pathname === '/';
    const isBlog = location.pathname.startsWith('/blog');
    const isCategories = location.pathname === '/categories';

    return (
        <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: Logo (Desktop) / Burger (Mobile) */}
                    <div className="flex items-center">
                        {/* Desktop Logo */}
                        <Link to="/" className="hidden md:block flex-shrink-0 cursor-pointer">
                            <img src={Logo} alt="Briefer Logo" className="h-4 inline-block" />
                        </Link>

                        {/* Mobile Burger Icon */}
                        <button
                            className="md:hidden flex items-center justify-center text-blue-500 focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Center Section: Navigation (Desktop) */}
                    <nav className="hidden md:flex space-x-8">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors duration-200 ${currentView === 'home'
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/categories"
                            className={`text-sm font-medium transition-colors duration-200 ${isCategories
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Categories
                        </Link>
                        <Link
                            to="/blog"
                            className={`text-sm font-medium transition-colors duration-200 ${isBlog
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Blog
                        </Link>
                        <button className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors duration-200">
                            About
                        </button>
                    </nav>

                    {/* Right Section: Account Management */}
                    <div className="flex items-center">
                        {user ? (
                            <Link
                                to="/profile"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${currentView === 'profile'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {user.email ? user.email[0].toUpperCase() : 'U'}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">Profile</span>
                            </Link>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow"
                            >
                                Login / Register
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar / Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] flex justify-start">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Drawer Panel */}
                    <div className="relative bg-white w-3/4 max-w-xs h-full shadow-2xl flex flex-col p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out animate-slide-in-left">

                        {/* Header within Drawer: Logo + Close Button */}
                        <div className="flex justify-between items-center mb-8">
                            <img src={Logo} alt="Briefer Logo" className="h-5" />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <nav className="flex flex-col space-y-6">
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-medium transition-colors duration-200 ${currentView === 'home' ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/categories"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-medium transition-colors duration-200 ${isCategories ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                Categories
                            </Link>
                            <Link
                                to="/blog"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-medium transition-colors duration-200 ${isBlog ? 'text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                Blog
                            </Link>
                            <button
                                className="text-left text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
