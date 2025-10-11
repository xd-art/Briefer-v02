/**
 * Simple markdown to HTML converter
 * Converts common markdown syntax to HTML tags
 * @param {string} markdown - The markdown text to convert
 * @returns {string} - The converted HTML
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Convert headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle lists - we need to process them separately
  // Convert unordered lists
  html = html.replace(/^[\s]*-[\s]+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>(\s*<li>.*<\/li>)*)/g, '<ul>$1</ul>');
  
  // Convert ordered lists
  html = html.replace(/^[\s]*\d+\.[\s]+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<ol>.*<\/ol>(\s*<li>.*<\/li>)*)/g, '<ol>$1</ol>');
  html = html.replace(/(<li>.*<\/li>(\s*<li>.*<\/li>)*)/g, '<ol>$1</ol>');
  
  // Convert paragraphs for lines that are not already wrapped in HTML tags
  const lines = html.split('\n');
  let inList = false;
  let newListType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (line.trim() === '') {
      if (inList) {
        inList = false;
        newListType = null;
      }
      continue;
    }
    
    // Check if line is already wrapped in HTML tags
    if (line.startsWith('<')) {
      if (line.startsWith('<ul') || line.startsWith('<ol')) {
        inList = true;
        newListType = line.startsWith('<ul') ? 'ul' : 'ol';
      } else if (line.startsWith('</ul') || line.startsWith('</ol')) {
        inList = false;
        newListType = null;
      }
      continue;
    }
    
    // Wrap in paragraph if not in a list and not already HTML
    if (!inList) {
      lines[i] = `<p>${line}</p>`;
    }
  }
  
  html = lines.join('\n');
  
  // Clean up extra whitespace
  html = html.replace(/\n\s*\n/g, '\n');
  
  return html;
};

/**
 * Plain text to HTML converter
 * Converts plain text with line breaks to HTML paragraphs
 * @param {string} text - The plain text to convert
 * @returns {string} - The converted HTML
 */
export const plainTextToHtml = (text) => {
  if (!text) return '';
  
  // Escape HTML characters
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Convert line breaks to paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  
  return html;
};

/**
 * Detect if text is markdown or plain text and convert accordingly
 * @param {string} text - The text to convert
 * @returns {string} - The converted HTML
 */
export const convertToHtml = (text) => {
  if (!text) return '';
  
  // Simple heuristic to detect markdown
  const markdownPatterns = [
    /^#{1,6}\s/,        // Headers
    /\*\*.*\*\*/,       // Bold
    /\*.*\*/,           // Italic
    /^\s*-\s+.*/,       // Unordered lists
    /^\s*\d+\.\s+.*/    // Ordered lists
  ];
  
  const isMarkdown = markdownPatterns.some(pattern => pattern.test(text));
  
  if (isMarkdown) {
    return markdownToHtml(text);
  } else {
    return plainTextToHtml(text);
  }
};

export default { markdownToHtml, plainTextToHtml, convertToHtml };