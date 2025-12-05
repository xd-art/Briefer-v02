# Project: Article Page v08

## Overview
A React application that generates technical articles using Google Gemini (gemini‑2.0‑flash). The app now uses **Markdown parsing** instead of fragile JSON, supports AI‑links, and includes a refined UI (filters, refinement bar, edit modal).

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Move the hard‑coded Gemini API key to an environment variable:
   ```env
   REACT_APP_GEMINI_API_KEY=YOUR_KEY_HERE
   ```
   and replace the constant in `src/App.js` and `src/components/CardEditor.js` with `process.env.REACT_APP_GEMINI_API_KEY`.
3. Start the development server:
   ```bash
   npm start
   ```

## Core Features
- **Markdown generation** – AI returns Markdown with `#` title and `##` sections.
- **AI‑links** – `<ai-link topic="..." template="guide">text</ai-link>` tags are parsed and rendered; clicking opens a new article.
- **Filters & Refinement** – Bottom bar + modal to adjust style, length, audience, format, extras.
- **Edit modal** – Lazy‑loaded `CardEditor` for per‑card editing.

## Important Files
- `src/App.js` – Main app, generation logic, UI routing.
- `src/components/CardEditor.js` – AI‑assisted editing (fixed template string and response handling).
- `src/components/ArticleGenerator.js` – Input for topic generation.
- `src/utils/markdown.js` – `convertToHtml` helper.
- `src/utils/ArticleManager.js` – Local storage of articles.

## Running Tests / Verification
1. Generate an article from the generator view – the UI should display the title and sections without errors.
2. Use the refinement bar or filter modal to regenerate with additional prompts.
3. Edit a card; AI improvements should apply and the notification appears.
4. Verify that `<ai-link>` tags appear in the rendered HTML and are clickable.

## Future Improvements
- Move the API key to a secure backend proxy.
- Add unit tests for `convertToHtml` and `ArticleManager`.
- Implement rate‑limit handling (exponential back‑off).
- Provide a dark‑mode theme.
