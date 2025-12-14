export const ARTICLE_FILTERS = [
    {
        id: 'style',
        label: 'Style',
        type: 'segmented',
        options: [
            { value: 'casual', label: 'Casual' },
            { value: 'professional', label: 'Professional' },
            { value: 'technical', label: 'Technical' }
        ]
    },
    {
        id: 'length',
        label: 'Length',
        type: 'segmented',
        options: [
            { value: 'brief', label: 'Brief' },
            { value: 'detailed', label: 'Detailed' },
            { value: 'comprehensive', label: 'Comprehensive' }
        ]
    },
    {
        id: 'audience',
        label: 'Target Audience',
        type: 'chips',
        options: [
            { value: 'beginners', label: 'Beginners' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'experts', label: 'Experts' },
            { value: 'general', label: 'General Public' },
            { value: 'developers', label: 'Developers' },
            { value: 'managers', label: 'Managers' }
        ]
    },
    {
        id: 'format',
        label: 'Format',
        type: 'chips',
        options: [
            { value: 'step-by-step', label: 'Step-by-Step' },
            { value: 'checklist', label: 'Checklist' },
            { value: 'overview', label: 'Overview' },
            { value: 'comparison', label: 'Comparison' },
            { value: 'tutorial', label: 'Tutorial' }
        ]
    },
    {
        id: 'extras',
        label: 'Additional Sections',
        type: 'chips',
        options: [
            { value: 'tips', label: 'Tips & Tricks' },
            { value: 'mistakes', label: 'Common Mistakes' },
            { value: 'faq', label: 'FAQ' },
            { value: 'resources', label: 'Resources' }
        ]
    }
];

export const buildDetailedPrompt = (selectedFilters) => {
    let detailedPrompt = '';

    if (selectedFilters.style) {
        detailedPrompt += `Style: ${selectedFilters.style}. `;
    }
    if (selectedFilters.length) {
        detailedPrompt += `Length: ${selectedFilters.length}. `;
    }
    if (selectedFilters.audience && selectedFilters.audience.length > 0) {
        detailedPrompt += `Target audience: ${selectedFilters.audience.join(', ')}. `;
    }
    if (selectedFilters.format && selectedFilters.format.length > 0) {
        detailedPrompt += `Format: ${selectedFilters.format.join(', ')}. `;
    }
    if (selectedFilters.extras && selectedFilters.extras.length > 0) {
        detailedPrompt += `Include: ${selectedFilters.extras.join(', ')}. `;
    }

    return detailedPrompt.trim();
};
