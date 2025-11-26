# Prompt for AI Links

The following system prompt fragment should be included in the AI generation request (e.g., in `handleGenerate` in `src/App.js`). It tells the model to embed AI‑link tags for sub‑topics.

```
IMPORTANT - AI LINKS:
If you mention a complex sub‑topic that deserves its own separate guide (e.g. "Setting up Nginx", "Configuring DNS", "Installing Node.js"), you MUST wrap that phrase in a special <ai-link> tag.
Format: <ai-link topic="Exact Topic Title" template="guide">visible text</ai-link>
```

**How to use**
- Copy the block above into the `systemPrompt` string used for generation.
- Ensure the model receives the instruction verbatim.
- The generated HTML will contain `<ai-link>` elements that the front‑end will handle.
