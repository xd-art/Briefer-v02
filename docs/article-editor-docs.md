# Article Editor & AI‑Link Documentation

## Overview
This document consolidates everything you need to understand the **article editor** (`CardEditor` component) and the **AI‑link** system used throughout the project. It gathers information from the existing spec and prompt files and adds practical guidance for developers and content creators.

---

## 1. Article Editor (`CardEditor`)
- **Location**: `src/components/CardEditor.js`
- **Purpose**: Provides a modal UI for creating and editing article “cards”.
- **Key Features**:
  - Title input and rich‑text content editor (React‑Quill).
  - AI assistance via a prompt textarea.
  - Keyboard shortcuts (`Esc` to close, `Ctrl+Enter` to save).
  - Rate‑limited AI requests (10 s cooldown).
  - Validation of AI prompt length (10‑500 chars) and forbidden phrases.
  - Automatic insertion of `<ai-link>` tags when the AI suggests sub‑topics.
  - Save handling creates a new card or updates an existing one, preserving the `EDIT` link markup.

> **Note**: The editor relies on the utility `convertToHtml` (`src/utils/markdown.js`) to turn AI‑generated markdown into HTML before inserting it into the card.

---

## 2. AI‑Link Specification
See the full spec in **[`ai-links-spec.md`](file:///d:/SRC/XAMPP/htdocs/sites/UI/article-page-v08/docs/ai-links-spec.md)**. Highlights:
- **Tag name**: `<ai-link>`
- **Attributes**:
  - `topic` – exact title of the sub‑article to generate.
  - `template` – optional template identifier (defaults to `guide`).
- **Frontend behaviour**:
  1. Rendered as a normal clickable link.
  2. Click prevents default navigation.
  3. JavaScript extracts attributes and opens a new tab with:
     ```
     /?action=generate&topic=<encoded‑topic>&template=<encoded‑template>
     ```
  4. The new tab loads the app, creates a fresh article via `ArticleManager`, and runs the generation flow.
- **Styling**: Primary button colour `#4f46e5`, underlined, pointer cursor, hover opacity `0.8`.
- **Example**:
  ```html
  First, you need to <ai-link topic="How to install Node.js" template="guide">install Node.js</ai-link> on your server.
  ```

---

## 3. AI Prompt for Links
The prompt fragment that must be included in any system prompt is documented in **[`ai-links-prompt.md`](file:///d:/SRC/XAMPP/htdocs/sites/UI/article-page-v08/docs/ai-links-prompt.md)**. Key excerpt:
```
IMPORTANT - AI LINKS:
If you mention a complex sub‑topic that deserves its own separate guide (e.g. "Setting up Nginx", "Configuring DNS", "Installing Node.js"), you MUST wrap that phrase in a special <ai-link> tag.
Format: <ai-link topic="Exact Topic Title" template="guide">visible text</ai-link>
```
Copy this block verbatim into the `systemPrompt` used for AI generation (e.g., in `handleGenerate` of `src/App.js`).

---

## 4. Styling (`styles.css`)
Add the following CSS snippet to `src/styles.css` if it isn’t already present:
```css
/* AI‑link styling */
ai-link {
  color: #4f46e5; /* primary button colour */
  text-decoration: underline;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
ai-link:hover {
  opacity: 0.8;
}
```
This ensures a consistent look across the site.

---

## 5. Integration Steps for New Developers
1. **Read the spec** – familiarize yourself with `ai-links-spec.md`.
2. **Include the prompt** – embed the fragment from `ai-links-prompt.md` into any AI system prompt you send.
3. **Ensure CSS** – verify that the styling block above exists in `styles.css`.
4. **Use the editor** – when creating or editing a card, you can type a prompt in the textarea; the AI will automatically insert `<ai-link>` tags where appropriate.
5. **Handle clicks** – the front‑end already has a click listener (see `src/index.js` or a dedicated script) that intercepts `<ai-link>` clicks and opens the generation URL.
6. **Testing** – create a card, trigger AI assistance, and confirm that generated links appear and open new tabs correctly.

---

## 6. Example Workflow
1. Open a new card via the **+** button.
2. Type a title, e.g., *"Deploying a React App"*.
3. In the AI prompt textarea, ask:
   > "Add steps for setting up Nginx and configuring DNS."
4. Press **Enter** (or click the send button).
5. The AI response will include something like:
   ```html
   <p>First, configure <ai-link topic="Nginx" template="guide">Nginx</ai-link> to serve your app.</p>
   <p>Then, set up <ai-link topic="DNS" template="guide">DNS records</ai-link> for your domain.</p>
   ```
6. Save the card. Clicking either link opens a new article generation flow for the respective sub‑topic.

---

## 7. Further Reading
- **Component source**: `src/components/CardEditor.js`
- **Utility**: `src/utils/markdown.js`
- **Styling**: `src/styles.css`
- **AI integration**: `src/App.js` (system prompt construction)

---

*Document generated on 2025‑11‑24.*
