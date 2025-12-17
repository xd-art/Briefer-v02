import React, { useState, useRef, useEffect } from 'react';
import RichTextDisplay from './RichTextDisplay';

const Card = ({ card, onEdit, onMoveUp, onMoveDown, onDelete, isFirst, isLast }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    // Handle edit link clicks within the card
    const handleClick = (e) => {
        // Edit link handling - support legacy embedded links just in case, but prefer the button
        if (e.target.classList.contains('edit-link')) {
            e.preventDefault();
            onEdit(card);
            return;
        }
        // AI link handling
        if (e.target.tagName.toLowerCase() === 'ai-link' || e.target.classList.contains('ai-link')) {
            e.preventDefault();
            const topic = e.target.getAttribute('topic');
            const template = e.target.getAttribute('template') || '';
            const url = `/?action=generate&topic=${encodeURIComponent(topic)}&template=${encodeURIComponent(template)}`;
            window.open(url, '_blank');
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(card);
    };

    // Helper to clean legacy content
    const cleanContent = (html) => {
        if (!html) return '';
        // Remove the specific edit link div structure we used to add
        return html.replace(/<div class="flex justify-end">\s*<a href="#" class="edit-link"[^>]*>EDIT<\/a>\s*<\/div>/g, '');
    };

    return (
        <div
            className="mb-8 border-b border-gray-200 pb-6"
            data-card-id={card.id}
            onClick={handleClick}
        >
            {/* Kebab Menu - Always Top Right */}
            <div className="flex justify-end mb-2 relative z-10">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        title="More options"
                    >
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onDelete && onDelete();
                                    }}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm mr-2">delete</span>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Heading (if exists separately) */}
            {card.heading && (
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{card.heading}</h2>
            )}

            <RichTextDisplay content={cleanContent(card.content)} />

            {/* Card Controls Footer */}
            <div className="flex items-center justify-between mt-4 pl-1">
                <div className="flex items-center space-x-4">
                    {/* Move Up Button - Material Icon */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                        disabled={isFirst}
                        className={`p-3 rounded-full transition-colors flex items-center justify-center ${isFirst
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                        title="Move Up"
                        aria-label="Move Up"
                    >
                        <span className="material-symbols-outlined">keyboard_arrow_up</span>
                    </button>

                    {/* Move Down Button - Material Icon */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                        disabled={isLast}
                        className={`p-3 rounded-full transition-colors flex items-center justify-center ${isLast
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                        title="Move Down"
                        aria-label="Move Down"
                    >
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </button>
                </div>

                <button
                    onClick={handleEditClick}
                    className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded transition-colors"
                >
                    EDIT
                </button>
            </div>
        </div>
    );
};

export default React.memo(Card);