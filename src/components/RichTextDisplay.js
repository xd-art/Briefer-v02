import React from 'react';
import DOMPurify from 'dompurify';

// Configure DOMPurify to allow Quill.js specific attributes and classes
const configureDOMPurify = () => {
  // Allow Quill.js specific classes and attributes
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'div' && node.classList.contains('ql-editor')) {
      node.classList.add('ql-editor');
    }
  });
};

// Run configuration once
configureDOMPurify();

const RichTextDisplay = ({ content }) => {
  // Sanitize the HTML content to prevent XSS attacks
  // Allow Quill.js specific formatting
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'span',
      'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'code', 'pre',
      'div'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'href', 'src', 'alt', 'title', 
      'style', 'data-', 'contenteditable'
    ],
    // Allow specific classes for Quill.js formatting
    ALLOW_DATA_ATTR: true,
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
  });

  return (
    <div 
      className="rich-text-content quill-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      data-testid="rich-text-content"
    />
  );
};

export default RichTextDisplay;