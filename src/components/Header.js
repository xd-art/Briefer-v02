import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/briefer-logo.svg';

const Header = ({ user, onLoginClick, onNavigate, currentView }) => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isBlog = location.pathname.startsWith('/blog');
    const isCategories = location.pathname === '/categories';

    return (
        <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: Logo */}
                    <Link to="/" className="flex-shrink-0 cursor-pointer">
                        <img src={Logo} alt="Briefer Logo" className="h-4 inline-block" />
                    </Link>

                    {/* Center Section: Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors duration-200 ${
                                currentView === 'home'
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/categories"
                            className={`text-sm font-medium transition-colors duration-200 ${
                                isCategories
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
        </header>
    );
};

export default Header;
