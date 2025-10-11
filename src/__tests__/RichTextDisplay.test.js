import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RichTextDisplay from '../components/RichTextDisplay';

describe('RichTextDisplay', () => {
  test('renders plain text content', () => {
    const content = '<p>Hello World</p>';
    render(<RichTextDisplay content={content} />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('renders complex HTML content', () => {
    const content = `
      <h2>Test Heading</h2>
      <p>This is a <strong>test</strong> paragraph.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    `;
    
    render(<RichTextDisplay content={content} />);
    
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    // Use a more flexible matcher for text that might be split across elements
    expect(screen.getByText((content, element) => 
      content.includes('This is a') && content.includes('test') && content.includes('paragraph')
    )).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('sanitizes malicious content', () => {
    const content = '<p>Hello World</p><script>alert("malicious")</script>';
    render(<RichTextDisplay content={content} />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    // The script tag should be removed by DOMPurify
    expect(screen.queryByText('alert("malicious")')).not.toBeInTheDocument();
  });

  test('handles empty content', () => {
    const content = '';
    render(<RichTextDisplay content={content} />);
    
    // Should render without errors
    expect(screen.getByTestId('rich-text-content')).toBeInTheDocument();
  });
});