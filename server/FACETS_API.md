# Faceted Classification API Documentation

## Database Schema

### Tables

#### `users`
- `id` - Primary key
- `email` - Unique email
- `password_hash` - Hashed password (nullable for OAuth)
- `googleId` - Google OAuth ID (nullable)
- **`role`** - ENUM('user', 'moderator', 'admin') - User role
- `created_at`, `updated_at`

#### `articles`
- `id` - Primary key
- `user_id` - Foreign key to users (nullable for guest drafts)
- `title` - Article title
- `content` - Article content (LONGTEXT)
- `public_id` - Public identifier (CHAR 12)
- **`status`** - ENUM('draft', 'pending_review', 'approved', 'rejected')
- **`is_published_in_categories`** - BOOLEAN - Whether article is in public categories
- **`moderation_comment`** - TEXT - Moderator feedback
- `created_at`, `updated_at`

#### `facets`
- `id` - Primary key
- `name` - System name (e.g., 'domain', 'difficulty')
- `label` - Human-readable label (e.g., 'Предметная область')
- `is_required` - Whether facet is required for published articles
- `created_at`, `updated_at`

#### `facet_values`
- `id` - Primary key
- `facet_id` - Foreign key to facets
- `value` - System name (e.g., 'web_development')
- `label` - Human-readable label (e.g., 'Web Development')
- `parent_id` - Self-referencing FK for hierarchy (nullable)
- `created_at`, `updated_at`

#### `article_facets`
- `id` - Primary key
- `article_id` - Foreign key to articles
- `facet_id` - Foreign key to facets
- `facet_value_id` - Foreign key to facet_values
- **`source`** - ENUM('manual', 'auto_suggested') - How tag was assigned
- **`confidence`** - FLOAT (0-1) - Confidence score for auto-tags
- `created_at`, `updated_at`

---

## API Endpoints

### Facets Endpoints

#### `GET /api/facets`
Get all facets with their hierarchical values.

**Response:**
```json
[
  {
    "id": 1,
    "name": "domain",
    "label": "Предметная область",
    "is_required": true,
    "values": [
      {
        "id": 10,
        "value": "programming_development",
        "label": "Programming & Development",
        "parent_id": null,
        "children": [
          {
            "id": 11,
            "value": "web_development",
            "label": "Web Development"
          }
        ]
      }
    ]
  }
]
```

#### `GET /api/facets/:facetName/values`
Get all values for a specific facet.

**Example:** `/api/facets/domain/values`

---

### Articles Endpoints (Extended)

#### `POST /api/articles/:id/submit-for-review`
Submit article for moderation (user must own the article).

**Auth:** Required  
**Body:** None

**Response:**
```json
{
  "message": "Article submitted for review",
  "article": { ... }
}
```

#### `GET /api/articles/categories/:facetValue`
Get published articles by category.

**Example:** `/api/articles/categories/web_development`

**Response:**
```json
{
  "category": {
    "id": 11,
    "value": "web_development",
    "label": "Web Development",
    "parent": { ... },
    "facet": { ... }
  },
  "articles": [
    {
      "id": 100,
      "title": "How to build REST API",
      "content": "...",
      "status": "approved",
      "is_published_in_categories": true,
      "author": { ... },
      "facetAssignments": [ ... ]
    }
  ]
}
```

---

### Moderation Endpoints (Admin/Moderator only)

#### `GET /api/moderation/pending`
Get all articles pending review.

**Auth:** Required (moderator/admin)

**Response:**
```json
[
  {
    "id": 50,
    "title": "My Draft Article",
    "status": "pending_review",
    "author": {
      "id": 5,
      "email": "user@example.com"
    }
  }
]
```

#### `GET /api/moderation/articles/:id`
Get single article with facet assignments.

**Auth:** Required (moderator/admin)

#### `POST /api/moderation/articles/:id/facets`
Assign facets to an article.

**Auth:** Required (moderator/admin)  
**Body:**
```json
{
  "facetValueIds": [11, 50, 60, 70],
  "source": "manual"
}
```

**Response:**
```json
{
  "message": "Facets assigned successfully",
  "count": 4
}
```

#### `PATCH /api/moderation/articles/:id/approve`
Approve article and publish to categories.

**Auth:** Required (moderator/admin)  
**Body:**
```json
{
  "facetValueIds": [11, 12, 50, 60]
}
```

**Response:**
```json
{
  "message": "Article approved and published",
  "article": { ... }
}
```

#### `PATCH /api/moderation/articles/:id/reject`
Reject article with feedback.

**Auth:** Required (moderator/admin)  
**Body:**
```json
{
  "moderation_comment": "Content needs improvement"
}
```

---

## User Workflow

### User (Author)
1. Create article → `status: 'draft'`
2. Submit for review → `POST /api/articles/:id/submit-for-review`
3. Article status changes to `pending_review`

### Moderator/Admin
1. View pending articles → `GET /api/moderation/pending`
2. Review article → `GET /api/moderation/articles/:id`
3. Assign facets → `POST /api/moderation/articles/:id/facets`
4. Approve → `PATCH /api/moderation/articles/:id/approve`
   - Sets `status: 'approved'`
   - Sets `is_published_in_categories: true`
   - Creates facet assignments in `article_facets`

### Public
1. Browse categories → `GET /api/facets`
2. View articles in category → `GET /api/articles/categories/:facetValue`

---

## Scripts

- `npm run sync-db` - Sync database schema
- `npm run seed-facets` - Seed initial facets and values
- `npm run server` - Start Express backend

---

## Future: Auto-tagging

When auto-tagging is implemented:
1. System suggests facets with `source: 'auto_suggested'` and `confidence: 0.0-1.0`
2. Moderator reviews suggestions
3. On approval, update `source: 'manual'`, `confidence: 1.0`
