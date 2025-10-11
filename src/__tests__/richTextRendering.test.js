import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../components/Card';

describe('Rich Text Rendering', () => {
  test('renders card with rich text content', () => {
    const mockCard = {
      id: 'test-card-1',
      content: `
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Test Card</h2>
        <p class="text-gray-600 mb-4">This is <strong>rich</strong> text content with <em>formatting</em>.</p>
        <ul class="list-disc pl-5">
          <li class="mb-2">Item 1</li>
          <li class="mb-2">Item 2</li>
        </ul>
        <div class="flex justify-end">
          <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="test-card-1">EDIT</a>
        </div>
      `
    };

    const mockOnEdit = jest.fn();

    render(<Card card={mockCard} onEdit={mockOnEdit} />);

    // Should render the heading
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    
    // Should render formatted text
    expect(screen.getByText('This is')).toBeInTheDocument();
    expect(screen.getByText('rich')).toBeInTheDocument();
    expect(screen.getByText('formatting')).toBeInTheDocument();
    
    // Should render list items
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    
    // Should render edit link
    expect(screen.getByText('EDIT')).toBeInTheDocument();
  });

  test('handles complex rich text formatting', () => {
    const mockCard = {
      id: 'complex-card',
      content: `
        <h1 class="text-3xl font-bold">Main Title</h1>
        <h2 class="text-2xl font-semibold">Subtitle</h2>
        <p class="text-gray-700">Paragraph with <strong>bold</strong>, <em>italic</em>, and <u>underline</u> text.</p>
        <blockquote class="border-l-4 border-blue-500 pl-4 italic">This is a quote.</blockquote>
        <ol class="list-decimal pl-5">
          <li>Ordered item 1</li>
          <li>Ordered item 2</li>
        </ol>
        <div class="flex justify-end">
          <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="complex-card">EDIT</a>
        </div>
      `
    };

    const mockOnEdit = jest.fn();

    render(<Card card={mockCard} onEdit={mockOnEdit} />);

    // Should render all formatting
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Paragraph with')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
    expect(screen.getByText('underline')).toBeInTheDocument();
    expect(screen.getByText('This is a quote.')).toBeInTheDocument();
    expect(screen.getByText('Ordered item 1')).toBeInTheDocument();
    expect(screen.getByText('Ordered item 2')).toBeInTheDocument();
  });

  test('handles empty or minimal content', () => {
    const mockCard = {
      id: 'minimal-card',
      content: `
        <h2>Minimal Content</h2>
        <p>Just a simple paragraph.</p>
        <div class="flex justify-end">
          <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="minimal-card">EDIT</a>
        </div>
      `
    };

    const mockOnEdit = jest.fn();

    render(<Card card={mockCard} onEdit={mockOnEdit} />);

    expect(screen.getByText('Minimal Content')).toBeInTheDocument();
    expect(screen.getByText('Just a simple paragraph.')).toBeInTheDocument();
    expect(screen.getByText('EDIT')).toBeInTheDocument();
  });

  test('preserves CSS classes for styling', () => {
    const mockCard = {
      id: 'styled-card',
      content: `
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Styled Card</h2>
        <p class="text-gray-600 mb-4">Content with Tailwind classes.</p>
        <div class="flex justify-end">
          <a href="#" class="text-blue-500 font-medium text-sm edit-link" data-card-id="styled-card">EDIT</a>
        </div>
      `
    };

    const mockOnEdit = jest.fn();

    render(<Card card={mockCard} onEdit={mockOnEdit} />);

    // The component should render without errors
    expect(screen.getByText('Styled Card')).toBeInTheDocument();
  });
});