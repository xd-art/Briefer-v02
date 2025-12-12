import React, { useState } from 'react';

const ArticleGenerator = ({ onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState('');

  const handleGenerate = () => {
    if (topic.trim() && !isGenerating) {
      onGenerate(topic, null);
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
        {/* ВЕРХНЯЯ КАРТОЧКА: заголовок + текст + видео */}
        <div className="p-6 sm:p-8 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">How To Article Generator</h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Текст‑колонка */}
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

            {/* Видео‑колонка (на маленьком экране уходит вниз) */}
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

        {/* НИЖНЯЯ КАРТОЧКА: How To + поле ввода промпта */}
        <div className="mb-8 p-6 sm:p-8 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.12)] transition-shadow duration-300">
          <h2 className="text-4xl font-semibold mb-4 text-gray-800">How To</h2>
          <div className="flex flex-col items-end">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Write what you need to create"
              className="w-full py-3 text-lg border-t-0 border-l-0 border-r-0 border-b-2 border-gray-200 focus:outline-none focus:border-[#3d82f6] transition-colors placeholder-gray-400 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="p-2 rounded-full bg-[#3d82f6] text-white shadow-md hover:bg-[#3d82f6] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-5 h-5"
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
