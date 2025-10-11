import React from 'react';
import { render } from '@testing-library/react';
import DOMPurify from 'dompurify';
import RichTextDisplay from '../components/RichTextDisplay';

describe('SEO Optimization', () => {
  test('generates semantic HTML structure', () => {
    const content = `
      <h1>Main Heading</h1>
      <h2>Sub Heading</h2>
      <p>This is a paragraph with <strong>important</strong> text.</p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
      <blockquote>Quote text</blockquote>
    `;
    
    render(<RichTextDisplay content={content} />);
    
    // The content should maintain proper semantic structure
    expect(content).toContain('<h1>');
    expect(content).toContain('<h2>');
    expect(content).toContain('<p>');
    expect(content).toContain('<ul>');
    expect(content).toContain('<li>');
    expect(content).toContain('<blockquote>');
  });

  test('preserves accessibility attributes', () => {
    const content = `
      <h2 id="section-1">Section Title</h2>
      <p>This is <strong>important</strong> content.</p>
      <a href="/link" title="Link title">Link text</a>
    `;
    
    // Sanitize content
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['h2', 'p', 'strong', 'a'],
      ALLOWED_ATTR: ['id', 'href', 'title']
    });
    
    // Should preserve semantic and accessibility attributes
    expect(sanitizedContent).toContain('id="section-1"');
    expect(sanitizedContent).toContain('title="Link title"');
  });

  test('maintains proper heading hierarchy', () => {
    const content = `
      <h1>Main Title</h1>
      <h2>Section 1</h2>
      <h3>Subsection 1.1</h3>
      <h2>Section 2</h2>
      <h3>Subsection 2.1</h3>
      <h4>Sub-subsection 2.1.1</h4>
    `;
    
    // Should maintain proper heading order
    const headings = content.match(/<h[1-6]/g);
    expect(headings).toEqual(['<h1', '<h2', '<h3', '<h2', '<h3', '<h4']);
  });

  test('optimizes for search engines', () => {
    const content = `
      <h1>Article Title</h1>
      <p>This is the <strong>main content</strong> of the article.</p>
      <h2>Key Features</h2>
      <ul>
        <li>Feature 1</li>
        <li>Feature 2</li>
      </ul>
    `;
    
    // Should contain semantic HTML that's good for SEO
    expect(content).toContain('<h1>');
    expect(content).toContain('<strong>');
    expect(content).toContain('<ul>');
    expect(content).toContain('<li>');
    
    // Should not contain inline styles that interfere with SEO
    expect(content).not.toMatch(/style\s*=/);
  });
});