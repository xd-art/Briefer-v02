# AI Link Specification

## Tag definition
- **Tag name**: `<ai-link>`
- **Purpose**: Marks a phrase that should trigger generation of a new article when clicked.

## Required attributes
| Attribute | Description | Example |
|-----------|-------------|---------|
| `topic`   | Exact title of the sub‑article to be generated. | `topic="How to install Node.js"` |
| `template`| Optional template identifier (e.g., `guide`, `faq`). Defaults to `guide` if omitted. | `template="guide"` |

## Behaviour (frontend)
- Rendered as a normal clickable link.
- On click, default navigation is prevented.
- JavaScript extracts `topic` and `template` and opens a new tab with URL:
  ```
  /?action=generate&topic=<encoded‑topic>&template=<encoded‑template>
  ```
- The new tab loads the app, creates a fresh article via `ArticleManager`, and runs the generation flow.

## Styling
- Uses the site’s primary button colour (`#4f46e5`).
- Underlined text, pointer cursor.
- Hover reduces opacity to `0.8`.

## Example usage in generated content
```html
First, you need to <ai-link topic="How to install Node.js" template="guide">install Node.js</ai-link> on your server.
```

The above will appear as a blue underlined link that opens a new article about installing Node.js.
