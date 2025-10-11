import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { convertToHtml } from '../utils/markdown';

// Mock the CardEditor component to test AI content conversion
jest.mock('../components/CardEditor', () => {
  return function MockCardEditor() {
    return <div data-testid="card-editor">Card Editor</div>;
  };
});

describe('AI Content Conversion', () => {
  test('converts markdown content from AI to HTML', () => {
    // Simulate AI response with markdown
    const aiMarkdownResponse = `# New Section Title
    
**Important** text with *emphasis*.
    
- List item 1
- List item 2
    
Paragraph with more content.`;
    
    const htmlContent = convertToHtml(aiMarkdownResponse);
    
    // Check that markdown was converted to HTML
    expect(htmlContent).toContain('<h1>New Section Title</h1>');
    expect(htmlContent).toContain('<strong>Important</strong>');
    expect(htmlContent).toContain('<em>emphasis</em>');
    expect(htmlContent).toContain('<li>List item 1</li>');
    expect(htmlContent).toContain('<li>List item 2</li>');
  });

  test('converts plain text content from AI to HTML', () => {
    // Simulate AI response with plain text
    const aiPlainTextResponse = `New section title
    
This is a paragraph of content.
    
This is another paragraph.`;
    
    const htmlContent = convertToHtml(aiPlainTextResponse);
    
    // Check that plain text was converted to HTML
    expect(htmlContent).toContain('New section title');
    expect(htmlContent).toContain('This is a paragraph of content.');
    expect(htmlContent).toContain('This is another paragraph.');
    expect(htmlContent).toContain('<p>');
    expect(htmlContent).toContain('</p>');
  });
});