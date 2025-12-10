import React from 'react';
import RichTextDisplay from './RichTextDisplay';

const Card = ({ card, onEdit }) => {
    // Handle edit link clicks within the card
    const handleClick = (e) => {
        // Edit link handling
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

    return (
        <div
            className="mb-8 border-b border-gray-200 pb-6"
            data-card-id={card.id}
            onClick={handleClick}
        >
            {card.heading && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{card.heading}</h2>
                    <button
                        onClick={handleEditClick}
                        className="ml-4 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Edit
                    </button>
                </div>
            )}
            <RichTextDisplay content={card.content} />
        </div>
    );
};

export default React.memo(Card);