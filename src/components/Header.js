import React from 'react';

const Header = ({ user, onLoginClick, onLogoutClick, onNavigate, currentView }) => {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: Logo */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('generator')}>
                        <span className="text-2xl font-bold text-blue-600 tracking-tight">ArticleAI</span>
                    </div>

                    {/* Center Section: Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <button
                            onClick={() => onNavigate('generator')}
                            className={`text-sm font-medium transition-colors duration-200 ${currentView === 'generator' || currentView === 'editor'
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Home
                        </button>
                        <button className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors duration-200">
                            Categories
                        </button>
                        <button className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors duration-200">
                            Blog
                        </button>
                        <button className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors duration-200">
                            About
                        </button>
                    </nav>

                    {/* Right Section: Account Management */}
                    <div className="flex items-center">
                        {user ? (
                            <button
                                onClick={() => onNavigate('profile')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${currentView === 'profile'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {user.email ? user.email[0].toUpperCase() : 'U'}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">Profile</span>
                            </button>
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
