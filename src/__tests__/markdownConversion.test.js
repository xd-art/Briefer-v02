import { markdownToHtml, plainTextToHtml, convertToHtml } from '../utils/markdown';

describe('Markdown to HTML Conversion', () => {
  test('converts markdown headers to HTML', () => {
    const markdown = '# Header 1\n\n## Header 2\n\n### Header 3';
    const html = markdownToHtml(markdown);
    expect(html).toContain('<h1>Header 1</h1>');
    expect(html).toContain('<h2>Header 2</h2>');
    expect(html).toContain('<h3>Header 3</h3>');
  });

  test('converts markdown bold and italic text', () => {
    const markdown = '**bold text** and *italic text*';
    const html = markdownToHtml(markdown);
    expect(html).toContain('<strong>bold text</strong>');
    expect(html).toContain('<em>italic text</em>');
  });

  test('converts markdown lists', () => {
    const markdown = '- Item 1\n- Item 2\n\n1. Numbered 1\n2. Numbered 2';
    const html = markdownToHtml(markdown);
    expect(html).toContain('<li>Item 1</li>');
    expect(html).toContain('<li>Item 2</li>');
    expect(html).toContain('<li>Numbered 1</li>');
    expect(html).toContain('<li>Numbered 2</li>');
  });

  test('converts plain text to HTML paragraphs', () => {
    const text = 'This is a paragraph.\n\nThis is another paragraph.';
    const html = plainTextToHtml(text);
    expect(html).toContain('<p>This is a paragraph.</p>');
    expect(html).toContain('<p>This is another paragraph.</p>');
  });

  test('detects and converts markdown automatically', () => {
    const markdown = '# Header\n\n**Bold text**';
    const plainText = 'Just plain text\n\nWith paragraphs';
    
    const markdownHtml = convertToHtml(markdown);
    const plainTextHtml = convertToHtml(plainText);
    
    expect(markdownHtml).toContain('<h1>Header</h1>');
    expect(plainTextHtml).toContain('<p>Just plain text</p>');
  });
});