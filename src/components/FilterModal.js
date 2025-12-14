import React from 'react';
import FilterList from './FilterList';

const FilterModal = ({
    isOpen,
    onClose,
    filters,
    selectedFilters,
    onFilterChange,
    onClean,
    onRegenerate,
    isLoading
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const renderSkeleton = () => (
        <div className="filters-loading">
            {[1, 2, 3].map((i) => (
                <div key={i} className="filter-section mb-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 animate-pulse"></div>
                    <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="filter-modal-overlay" onClick={handleOverlayClick}>
            <div className="filter-modal-content">
                <div className="filter-header">
                    <h3>Detailed filters</h3>
                    <button onClick={onClose} className="close-btn text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="filter-body">
                    {isLoading ? renderSkeleton() : (
                        <FilterList
                            filters={filters}
                            selectedFilters={selectedFilters}
                            onFilterChange={onFilterChange}
                        />
                    )}
                </div>

                <div className="filter-footer">
                    <button className="btn-clean" onClick={onClean}>
                        Clean
                    </button>
                    <button className="btn-regenerate" onClick={onRegenerate}>
                        Regenerate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
