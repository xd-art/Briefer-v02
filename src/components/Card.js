import React from 'react';
import RichTextDisplay from './RichTextDisplay';

const Card = ({ card, onEdit }) => {
  // Handle edit link clicks within the card
  const handleEditClick = (e) => {
    if (e.target.classList.contains('edit-link')) {
      e.preventDefault();
      onEdit(card);
    }
  };

  return (
    <div 
      className="mb-8" 
      data-card-id={card.id}
      onClick={handleEditClick}
    >
      <RichTextDisplay content={card.content} />
    </div>
  );
};

export default React.memo(Card);