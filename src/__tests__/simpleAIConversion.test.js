const { convertToHtml } = require('../utils/markdown');

test('converts markdown to HTML', () => {
  const markdown = '# Header\n\n**Bold** and *italic* text.';
  const html = convertToHtml(markdown);
  
  expect(html).toContain('<h1>Header</h1>');
  expect(html).toContain('<strong>Bold</strong>');
  expect(html).toContain('<em>italic</em>');
});

test('converts plain text to HTML', () => {
  const text = 'Paragraph 1\n\nParagraph 2';
  const html = convertToHtml(text);
  
  expect(html).toContain('<p>Paragraph 1</p>');
  expect(html).toContain('<p>Paragraph 2</p>');
});