import React from 'react';

const FilterList = ({ filters, selectedFilters, onFilterChange }) => {
    const renderFilterSection = (section) => {
        const isSegmented = section.type === 'segmented';
        const selectedValue = selectedFilters[section.id];

        // Debug logging
        // console.log(`FilterList render: ${section.id}`, { selectedValue, type: section.type });

        // Ensure we handle both single values (strings) and arrays appropriately
        const isSelected = (optionValue) => {
            if (Array.isArray(selectedValue)) {
                return selectedValue.includes(optionValue);
            }
            return selectedValue === optionValue;
        };

        const handleOptionClick = (e, val, isMulti) => {
            e.preventDefault(); // Prevent accidental form submission or other default behaviors
            e.stopPropagation(); // Stop event bubbling
            // console.log(`FilterList click: ${section.id} = ${val} (multi: ${isMulti})`);
            onFilterChange(section.id, val, isMulti);
        };

        return (
            <div key={section.id} className="filter-section mb-6 last:mb-0">
                <label className="filter-label block text-sm font-medium text-gray-700 mb-2">
                    {section.label}
                </label>

                {isSegmented ? (
                    <div className="segmented-control flex bg-gray-100 p-1 rounded-lg">
                        {section.options.map((option) => (
                            <button
                                key={option.value}
                                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${isSelected(option.value)
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={(e) => handleOptionClick(e, option.value, false)}
                                title={option.tooltip}
                                type="button"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="chip-group flex flex-wrap gap-2">
                        {section.options.map((option) => (
                            <button
                                key={option.value}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 ${isSelected(option.value)
                                    ? 'bg-blue-50 border-blue-200 text-blue-700' // Changed to blue match ArticleGenerator
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                onClick={(e) => handleOptionClick(e, option.value, true)}
                                title={option.tooltip}
                                type="button"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="filter-list w-full">
            {filters.map(renderFilterSection)}
        </div>
    );
};

export default FilterList;
