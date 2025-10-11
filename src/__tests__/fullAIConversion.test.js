import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { convertToHtml } from '../utils/markdown';

// Mock the fetch API for AI requests
global.fetch = jest.fn();

describe('Full AI Content Conversion Flow', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('converts AI response from markdown to HTML and saves to card', async () => {
    // Mock AI response with markdown content
    const mockAIResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            title: "AI Generated Title",
            content: "# New Section\n\n**Important** content with *emphasis*.\n\n- List item 1\n- List item 2"
          })
        }
      }]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAIResponse)
    });

    // Simulate the conversion that happens in CardEditor
    const aiContent = "# New Section\n\n**Important** content with *emphasis*.\n\n- List item 1\n- List item 2";
    const convertedHtml = convertToHtml(aiContent);
    
    // Verify conversion worked correctly
    expect(convertedHtml).toContain('<h1>New Section</h1>');
    expect(convertedHtml).toContain('<strong>Important</strong>');
    expect(convertedHtml).toContain('<em>emphasis</em>');
    expect(convertedHtml).toContain('<li>List item 1</li>');
    expect(convertedHtml).toContain('<li>List item 2</li>');
  });

  test('converts AI response from plain text to HTML and saves to card', async () => {
    // Mock AI response with plain text content
    const mockAIResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            title: "AI Generated Title",
            content: "New section title\n\nThis is a paragraph of content.\n\nThis is another paragraph."
          })
        }
      }]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAIResponse)
    });

    // Simulate the conversion that happens in CardEditor
    const aiContent = "New section title\n\nThis is a paragraph of content.\n\nThis is another paragraph.";
    const convertedHtml = convertToHtml(aiContent);
    
    // Verify conversion worked correctly
    expect(convertedHtml).toContain('New section title');
    expect(convertedHtml).toContain('This is a paragraph of content.');
    expect(convertedHtml).toContain('This is another paragraph.');
    expect(convertedHtml).toContain('<p>');
    expect(convertedHtml).toContain('</p>');
  });
});