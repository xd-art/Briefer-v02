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

    return (
        <div
            className="mb-8"
            data-card-id={card.id}
            onClick={handleClick}
        >
            <RichTextDisplay content={card.content} />
        </div>
    );
};

export default React.memo(Card);