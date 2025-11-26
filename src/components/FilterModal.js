import React from 'react';

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

    const renderFilterSection = (section) => {
        const isSegmented = section.type === 'segmented';
        const selectedValue = selectedFilters[section.id];

        return (
            <div key={section.id} className="filter-section">
                <label className="filter-label">{section.label}</label>

                {isSegmented ? (
                    <div className="segmented-control">
                        {section.options.map((option) => (
                            <button
                                key={option.value}
                                className={`segment-btn ${selectedValue === option.value ? 'active' : ''}`}
                                onClick={() => onFilterChange(section.id, option.value)}
                                title={option.tooltip}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="chip-group">
                        {section.options.map((option) => {
                            const isSelected = Array.isArray(selectedValue)
                                ? selectedValue.includes(option.value)
                                : selectedValue === option.value;

                            return (
                                <button
                                    key={option.value}
                                    className={`filter-chip ${isSelected ? 'active' : ''}`}
                                    onClick={() => onFilterChange(section.id, option.value, true)} // true for multi-select toggle
                                    title={option.tooltip}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderSkeleton = () => (
        <div className="filters-loading">
            {[1, 2, 3].map((i) => (
                <div key={i} className="filter-section">
                    <div className="skeleton-label"></div>
                    <div className="skeleton-chips">
                        <div className="skeleton-chip"></div>
                        <div className="skeleton-chip"></div>
                        <div className="skeleton-chip"></div>
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
                    {isLoading ? renderSkeleton() : filters.map(renderFilterSection)}
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
