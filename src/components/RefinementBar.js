import React from 'react';

const RefinementBar = ({
    value,
    onChange,
    onFilterClick,
    onSend,
    isGenerating,
    hasFilters
}) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="refinement-bar">
            <button
                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${hasFilters ? 'bg-[#3d82f6] text-white hover:bg-[#2563eb]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                onClick={onFilterClick}
                title="Detailed Filters"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
            </button>

            <input
                type="text"
                className="refinement-input"
                placeholder="Add a new change"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
            />

            <button
                className="p-2 rounded-full bg-[#3d82f6] text-white shadow-md hover:bg-[#3d82f6] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onSend}
                disabled={isGenerating || (!value.trim() && !hasFilters)}
                title="Regenerate Article"
            >
                {isGenerating ? (
                    <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default RefinementBar;
