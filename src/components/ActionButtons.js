import React from 'react';

const ActionButtons = ({ onSave, onAddCard }) => {
  return (
    <div className="mt-8 flex justify-between w-full px-4">
      <button
        id="saveEdits"
        className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-600"
        onClick={onSave}
      >
        Save
      </button>
      <div
        id="addCard"
        className="bg-blue-500 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-blue-600 cursor-pointer"
        onClick={onAddCard}
        data-testid="add-card-button"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
        </svg>
      </div>
    </div>
  );
};

export default React.memo(ActionButtons);