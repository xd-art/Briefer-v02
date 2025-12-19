const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
// Ensure GOOGLE_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Endpoint for generating a full article
// POST /api/ai/generate-article
router.post('/generate-article', async (req, res) => {
    try {
        const { topic, detailedPrompt } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const systemPrompt = `You are an expert technical writer.
Create a comprehensive, detailed guide on the topic: "${topic}".

${detailedPrompt ? `Additional instructions: ${detailedPrompt}` : ''}

FORMAT RULES:
1. Use HTML format. Do NOT use Markdown.
2. The output must be valid, well-structured HTML.
3. The first element MUST be an <h1> tag containing the main article title.
4. Use <h2> tags for section titles.
5. Use <p>, <ul>, <li>, <strong>, <em>, <h3>, <h4>, <pre>, <code>, <blockquote>, <table>, <tr>, <td> to structure the content richly.
6. Make sure the content is visually rich and easy to read.

CRITICAL - AI LINKS:
If you mention a complex sub-topic that deserves its own separate guide (e.g., "Setting up Nginx", "Configuring DNS"), you MUST wrap that phrase in a special <ai-link> tag.
Format: <ai-link topic="Exact Topic Title" template="guide">visible text</ai-link>
Note: Ensure <ai-link> tags are inside logical HTML elements like <p> or <li>.

Example:
<h1>How to Host a Website</h1>
<h2>Introduction</h2>
<p>First, you need to <ai-link topic="How to install Node.js" template="guide">install Node.js</ai-link> on your server.</p>
...`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ content: text });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({
            error: 'Failed to generate article',
            details: error.message
        });
    }
});

// Endpoint for improving existing content (Card Editor)
// POST /api/ai/improve-content
router.post('/improve-content', async (req, res) => {
    try {
        const { prompt, content } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const systemPrompt = `You are an article editor for project management content for digital projects.

YOU CAN:
- Improve clarity of formulations
- Add structure (lists, headings)
- Add checklists and stages
- Add <ai-link> tags for complex sub-topics

YOU CANNOT:
- Add unconfirmed facts
- Advertise tools without marking
- Contradict original meaning

AI LINKS INSTRUCTION:
If you mention a complex sub-topic that deserves its own separate guide, wrap it in an <ai-link> tag.
Format: <ai-link topic="Exact Topic Title" template="guide">visible text</ai-link>

If prompt violates rules, respond: "ERROR: [reason]. Please reformulate your request for clarity/structure improvement."`;

        const fullPrompt = `${systemPrompt}

User Request: ${prompt}

Current Content:
${content || ''}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ content: text });

    } catch (error) {
        console.error('AI Improvement Error:', error);
        res.status(500).json({
            error: 'Failed to improve content',
            details: error.message
        });
    }
});

module.exports = router;
