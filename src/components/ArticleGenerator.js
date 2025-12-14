import React, { useState } from 'react';
import FilterList from './FilterList';
import { ARTICLE_FILTERS, buildDetailedPrompt } from '../data/filterOptions';

const ArticleGenerator = ({ onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [showFilters, setShowFilters] = useState(true); // Default to true as requested: "filters should be seen immediately"
  const [selectedFilters, setSelectedFilters] = useState({
    style: 'professional', // Default style
    length: 'detailed'     // Default length
  });

  const handleFilterChange = (sectionId, value, isMulti) => {
    // console.log(`ArticleGenerator: changing filter ${sectionId} to ${value} (multi: ${isMulti})`);
    setSelectedFilters(prev => {
      // Safety check: ensure prev is an object
      const safePrev = prev || {};

      if (isMulti) {
        const currentValues = safePrev[sectionId] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...safePrev, [sectionId]: newValues };
      }
      return { ...safePrev, [sectionId]: value };
    });
  };

  const handleGenerate = () => {
    if (topic.trim() && !isGenerating) {
      const detailedPrompt = buildDetailedPrompt(selectedFilters);
      onGenerate(topic, detailedPrompt);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleGenerate();
    }
  };

  return (
    <div className="bg-white flex flex-col items-center px-4 sm:px-6 lg:px-8 min-h-screen py-8">
      <div className="w-full max-w-3xl">
        {/* UPPER CARD: Title + Text + Video */}
        <div className="p-6 sm:p-8 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">How To Article Generator</h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Text Column */}
            <div className="md:w-1/2 w-full">
              <p className="text-gray-800">
                Our goal is not just to create another database of articles. We are building a
                <strong> "Living Library of Practical Instructions"</strong>, where every gap in
                knowledge becomes a point of growth.
              </p>

              <p className="mt-4 text-gray-800">
                Try the <em>How To</em> Article Master Generator and become an architect of global
                knowledge! Join today and start shaping the future of shared knowledge!
              </p>
            </div>

            {/* Video Column */}
            <div className="md:w-1/2 w-full flex justify-center">
              <video
                src="/videos/intro.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-64 h-auto rounded"
              ></video>
            </div>
          </div>
        </div>

        {/* LOWER CARD: How To + Input + Filters */}
        <div className="mb-8 p-6 sm:p-8 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.12)] transition-shadow duration-300">
          <h2 className="text-4xl font-semibold mb-4 text-gray-800">How To</h2>

          {/* Input Area */}
          <div className="flex flex-col mb-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Write what you need to create"
              className="w-full py-3 text-lg border-t-0 border-l-0 border-r-0 border-b-2 border-gray-200 focus:outline-none focus:border-[#3d82f6] transition-colors placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Filters Area */}
          <div className="mb-6 border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Detailed Filters</h3>
              {/* Optional toggle if user ever wants to hide them, though requirement said "visible immediately" */}
              {/* <button onClick={() => setShowFilters(!showFilters)} className="text-sm text-blue-500">
                    {showFilters ? 'Hide' : 'Show'}
                </button> */}
            </div>

            {showFilters && (
              <FilterList
                filters={ARTICLE_FILTERS}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="p-3 rounded-full bg-[#3d82f6] text-white shadow-md hover:bg-[#2563eb] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[3rem] min-h-[3rem]"
              title="Generate Article"
            >
              {isGenerating ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerator;
