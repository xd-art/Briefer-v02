import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const InlineCardEditor = ({ card, onUpdate, onDelete }) => {
    const [heading, setHeading] = useState(card.heading || '');
    const [content, setContent] = useState(card.content || '');
    const [isExpanded, setIsExpanded] = useState(false);
    const quillRef = useRef(null);

    const modules = {
        toolbar: [
            [{ 'header': [3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    const handleSave = () => {
        onUpdate(card.id, { heading, content });
        setIsExpanded(false);
    };

    const handleContentChange = (value) => {
        setContent(value);
        // Auto-save on change (debounced in parent if needed)
        onUpdate(card.id, { heading, content: value });
    };

    const handleHeadingChange = (e) => {
        const newHeading = e.target.value;
        setHeading(newHeading);
        onUpdate(card.id, { heading: newHeading, content });
    };

    return (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Heading Editor */}
            <div className="mb-4">
                <input
                    type="text"
                    value={heading}
                    onChange={handleHeadingChange}
                    placeholder="Card Heading"
                    className="w-full text-2xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                />
            </div>

            {/* Content Editor */}
            <div className="prose max-w-none">
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={handleContentChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Enter card content..."
                    className="min-h-[150px]"
                />
            </div>

            {/* Card Actions */}
            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={() => onDelete(card.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                    Delete Card
                </button>
            </div>
        </div>
    );
};

export default InlineCardEditor;
