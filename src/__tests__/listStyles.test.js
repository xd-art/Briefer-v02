import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RichTextDisplay from '../components/RichTextDisplay';

describe('List Styles', () => {
  test('renders unordered lists with proper styling', () => {
    const content = `
      <ul>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ul>
    `;
    
    render(<RichTextDisplay content={content} />);
    
    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');
    
    expect(list).toBeInTheDocument();
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('First item');
  });

  test('renders ordered lists with proper styling', () => {
    const content = `
      <ol>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ol>
    `;
    
    render(<RichTextDisplay content={content} />);
    
    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');
    
    expect(list).toBeInTheDocument();
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('First item');
  });

  test('renders nested lists correctly', () => {
    const content = `
      <ul>
        <li>First item</li>
        <li>
          Second item with nested list
          <ol>
            <li>Nested item 1</li>
            <li>Nested item 2</li>
          </ol>
        </li>
        <li>Third item</li>
      </ul>
    `;
    
    render(<RichTextDisplay content={content} />);
    
    const lists = screen.getAllByRole('list');
    const items = screen.getAllByRole('listitem');
    
    expect(lists).toHaveLength(2); // One ul and one ol
    expect(items).toHaveLength(5); // 3 top-level items + 2 nested items
  });
});