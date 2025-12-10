# API Reference

<cite>
**Referenced Files in This Document**   
- [auth.js](file://server/routes/auth.js)
- [articles.js](file://server/routes/articles.js)
- [facets.js](file://server/routes/facets.js)
- [moderation.js](file://server/routes/moderation.js)
- [FACETS_API.md](file://server/FACETS_API.md)
- [requireAuth.js](file://server/middleware/requireAuth.js)
- [passport.js](file://server/config/passport.js)
- [User.js](file://server/models/User.js)
- [Article.js](file://server/models/Article.js)
- [Facet.js](file://server/models/Facet.js)
- [AuthContext.js](file://src/context/AuthContext.js)
- [server.js](file://server/server.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Articles Endpoints](#articles-endpoints)
4. [Facets Endpoints](#facets-endpoints)
5. [Moderation Endpoints](#moderation-endpoints)
6. [Security Considerations](#security-considerations)
7. [Client Implementation Guidelines](#client-implementation-guidelines)
8. [Performance Optimization Tips](#performance-optimization-tips)
9. [Error Codes](#error-codes)

## Introduction
This document provides comprehensive API documentation for the backend RESTful endpoints of article-page-v11. The API enables users to create, manage, and publish articles through a faceted classification system. The backend is built with Express.js and uses Passport.js for authentication, with Sequelize as the ORM for MySQL database interactions.

The API follows REST principles with JSON request and response payloads. Authentication is handled through session-based authentication with support for both email/password and Google OAuth. The system implements role-based access control with user, moderator, and admin roles.

**Section sources**
- [server.js](file://server/server.js#L1-L59)
- [FACETS_API.md](file://server/FACETS_API.md#L1-L255)

## Authentication Endpoints

### POST /api/auth/register
Register a new user with email and password.

**Request**
- Method: POST
- URL: /api/auth/register
- Authentication: Not required
- Content-Type: application/json

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**
- Success: 201 Created
- Error: 400 Bad Request (validation error), 500 Internal Server Error

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Section sources**
- [auth.js](file://server/routes/auth.js#L9-L44)
- [User.js](file://server/models/User.js#L4-L39)

### POST /api/auth/login
Authenticate a user with email and password.

**Request**
- Method: POST
- URL: /api/auth/login
- Authentication: Not required
- Content-Type: application/json

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**
- Success: 200 OK
- Error: 400 Bad Request (invalid credentials), 500 Internal Server Error

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Section sources**
- [auth.js](file://server/routes/auth.js#L47-L62)
- [passport.js](file://server/config/passport.js#L23-L49)

### GET /api/auth/google
Initiate Google OAuth authentication.

**Request**
- Method: GET
- URL: /api/auth/google
- Authentication: Not required

**Response**
- Redirects to Google OAuth consent screen

**Section sources**
- [auth.js](file://server/routes/auth.js#L64-L65)
- [passport.js](file://server/config/passport.js#L53-L89)

### GET /api/auth/google/callback
Handle Google OAuth callback.

**Request**
- Method: GET
- URL: /api/auth/google/callback
- Authentication: Not required

**Response**
- Success: Redirects to frontend profile page
- Failure: Redirects to homepage

**Section sources**
- [auth.js](file://server/routes/auth.js#L67-L73)
- [passport.js](file://server/config/passport.js#L53-L89)

### POST /api/auth/logout
Log out the current user and destroy the session.

**Request**
- Method: POST
- URL: /api/auth/logout
- Authentication: Required (session)

**Response**
- Success: 200 OK
- Error: 500 Internal Server Error

```json
{
  "message": "Logged out successfully"
}
```

**Section sources**
- [auth.js](file://server/routes/auth.js#L76-L89)
- [requireAuth.js](file://server/middleware/requireAuth.js#L3-L13)

### GET /api/auth/me
Get the current authenticated user's information.

**Request**
- Method: GET
- URL: /api/auth/me
- Authentication: Required (session)

**Response**
- Success: 200 OK
- Error: 401 Unauthorized (not authenticated)

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Section sources**
- [auth.js](file://server/routes/auth.js#L92-L98)
- [requireAuth.js](file://server/middleware/requireAuth.js#L3-L13)

## Articles Endpoints

### POST /api/articles
Create a new guest draft article.

**Request**
- Method: POST
- URL: /api/articles
- Authentication: Not required
- Content-Type: application/json

**Request Body**
```json
{
  "title": "My Article",
  "content": "[{ \"id\": \"card1\", \"content\": \"Card content\" }]"
}
```

**Response**
- Success: 201 Created
- Error: 500 Internal Server Error

```json
{
  "article": {
    "id": 1,
    "title": "My Article",
    "content": "[{ \"id\": \"card1\", \"content\": \"Card content\" }]",
    "user_id": null,
    "status": "draft"
  }
}
```

**Section sources**
- [articles.js](file://server/routes/articles.js#L9-L23)

### PUT /api/articles/:id/attach
Attach a guest draft to the authenticated user.

**Request**
- Method: PUT
- URL: /api/articles/:id/attach
- Authentication: Required
- Content-Type: application/json

**Response**
- Success: 200 OK
- Error: 403 Forbidden (already owned by another user), 404 Not Found, 500 Internal Server Error

```json
{
  "article": {
    "id": 1,
    "title": "My Article",
    "content": "[{ \"id\": \"card1\", \"content\": \"Card content\" }]",
    "user_id": 1,
    "status": "draft"
  }
}
```

**Section sources**
- [articles.js](file://server/routes/articles.js#L27-L52)

### PUT /api/articles/:id
Update an article (title and content).

**Request**
- Method: PUT
- URL: /api/articles/:id
- Authentication: Required
- Content-Type: application/json

**Request Body**
```json
{
  "title": "Updated Title",
  "content": "[{ \"id\": \"card1\", \"content\": \"Updated content\" }]"
}
```

**Response**
- Success: 200 OK
- Error: 403 Forbidden (not owner), 404 Not Found, 500 Internal Server Error

```json
{
  "article": {
    "id": 1,
    "title": "Updated Title",
    "content": "[{ \"id\": \"card1\", \"content\": \"Updated content\" }]",
    "user_id": 1,
    "status": "draft"
  }
}
```

**Section sources**
- [articles.js](file://server/routes/articles.js#L56-L80)

### GET /api/articles/user/:userId
Get all articles belonging to a user.

**Request**
- Method: GET
- URL: /api/articles/user/:userId
- Authentication: Required

**Response**
- Success: 200 OK
- Error: 403 Forbidden (accessing another user's drafts), 500 Internal Server Error

```json
{
  "drafts": [
    {
      "id": 1,
      "title": "My Article",
      "content": "[{ \"id\": \"card1\", \"content\": \"Card content\" }]",
      "user_id": 1,
      "status": "draft"
    }
  ]
}
```

**Section sources**
- [articles.js](file://server/routes/articles.js#L84-L101)

### DELETE /api/articles/:id
Delete an article.

**Request**
- Method: DELETE
- URL: /api/articles/:id
- Authentication: Required

**Response**
- Success: 200 OK
- Error: 403 Forbidden (not owner), 404 Not Found, 500 Internal Server Error

```json
{
  "message": "Article deleted"
}
```

**Section sources**
- [articles.js](file://server/routes/articles.js#L104-L123)

### POST /api/articles/:id/submit-for-review
Submit an article for moderation review.

**Request**
- Method: POST
- URL: /api/articles/:id/submit-for-review
- Authentication: Required
- Content-Type: application/json

**Response**
- Success: 200 OK
- Error: 400 Bad Request (already submitted), 403 Forbidden (not owner), 404 Not Found, 500 Internal Server Error

```json
{
  "message": "Article submitted for review",
  "article": {
    "id": 1,
    "title": "My Article",
    "content": "[{ \"id\": \"card1\", \"content\": \"Card content\" }]",
    "user_id": 1,
    "status": "pending_review"
  }
}
```

**Section sources**
- [articles.js](file://server/routes/articles.js#L198-L225)
- [FACETS_API.md](file://server/FACETS_API.md#L95-L107)

### GET /api/articles/categories/:facetValue
Get published articles by category (facet value).

**Request**
- Method: GET
- URL: /api/articles/categories/:facetValue
- Authentication: Not required

**Response**
- Success: 200 OK
- Error: 404 Not Found (category not found), 500 Internal Server Error

```json
{
  "category": {
    "id": 11,
    "value": "web_development",
    "label": "Web Development"
  },
  "articles": [
    {
      "id": 100,
      "title": "How to build REST API",
      "content": "...",
      "status": "approved",
      "is_published_in_categories": true,
      "author": {
        "id": 5,
        "email": "user@example.com"
      }
    }
  ]
}
```

**Section sources**
- [articles.js](file://server/routes/articles.js#L130-L192)
- [FACETS_API.md](file://server/FACETS_API.md#L109-L136)

## Facets Endpoints

### GET /api/facets
Get all facets with their hierarchical values.

**Request**
- Method: GET
- URL: /api/facets
- Authentication: Not required

**Response**
- Success: 200 OK
- Error: 500 Internal Server Error

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

**Section sources**
- [facets.js](file://server/routes/facets.js#L9-L33)

### GET /api/facets/:facetName/values
Get all values for a specific facet.

**Request**
- Method: GET
- URL: /api/facets/:facetName/values
- Authentication: Not required

**Response**
- Success: 200 OK
- Error: 404 Not Found (facet not found), 500 Internal Server Error

```json
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
      "facet_id": 1
    },
    {
      "id": 11,
      "value": "web_development",
      "label": "Web Development",
      "parent_id": 10,
      "facet_id": 1
    }
  ]
}
```

**Section sources**
- [facets.js](file://server/routes/facets.js#L40-L65)

## Moderation Endpoints

### GET /api/moderation/pending
Get all articles pending review.

**Request**
- Method: GET
- URL: /api/moderation/pending
- Authentication: Required (moderator/admin)

**Response**
- Success: 200 OK
- Error: 500 Internal Server Error

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

**Section sources**
- [moderation.js](file://server/routes/moderation.js#L10-L28)
- [FACETS_API.md](file://server/FACETS_API.md#L142-L160)

### GET /api/moderation/articles/:id
Get a specific article with facet assignments for moderation.

**Request**
- Method: GET
- URL: /api/moderation/articles/:id
- Authentication: Required (moderator/admin)

**Response**
- Success: 200 OK
- Error: 404 Not Found, 500 Internal Server Error

```json
{
  "id": 50,
  "title": "My Draft Article",
  "content": "...",
  "status": "pending_review",
  "author": {
    "id": 5,
    "email": "user@example.com"
  },
  "facetAssignments": [
    {
      "id": 100,
      "facet_id": 1,
      "facet_value_id": 11,
      "source": "manual",
      "confidence": 1.0
    }
  ]
}
```

**Section sources**
- [moderation.js](file://server/routes/moderation.js#L35-L75)

### POST /api/moderation/articles/:id/facets
Assign facets to an article.

**Request**
- Method: POST
- URL: /api/moderation/articles/:id/facets
- Authentication: Required (moderator/admin)
- Content-Type: application/json

**Request Body**
```json
{
  "facetValueIds": [11, 50, 60, 70],
  "source": "manual"
}
```

**Response**
- Success: 200 OK
- Error: 400 Bad Request (invalid facet IDs), 404 Not Found, 500 Internal Server Error

```json
{
  "message": "Facets assigned successfully",
  "count": 4
}
```

**Section sources**
- [moderation.js](file://server/routes/moderation.js#L83-L128)
- [FACETS_API.md](file://server/FACETS_API.md#L167-L185)

### PATCH /api/moderation/articles/:id/approve
Approve an article and publish it to categories.

**Request**
- Method: PATCH
- URL: /api/moderation/articles/:id/approve
- Authentication: Required (moderator/admin)
- Content-Type: application/json

**Request Body**
```json
{
  "facetValueIds": [11, 12, 50, 60]
}
```

**Response**
- Success: 200 OK
- Error: 404 Not Found, 500 Internal Server Error

```json
{
  "message": "Article approved and published",
  "article": {
    "id": 50,
    "title": "My Draft Article",
    "status": "approved",
    "is_published_in_categories": true
  }
}
```

**Section sources**
- [moderation.js](file://server/routes/moderation.js#L136-L179)
- [FACETS_API.md](file://server/FACETS_API.md#L187-L204)

### PATCH /api/moderation/articles/:id/reject
Reject an article with feedback.

**Request**
- Method: PATCH
- URL: /api/moderation/articles/:id/reject
- Authentication: Required (moderator/admin)
- Content-Type: application/json

**Request Body**
```json
{
  "moderation_comment": "Content needs improvement"
}
```

**Response**
- Success: 200 OK
- Error: 404 Not Found, 500 Internal Server Error

```json
{
  "message": "Article rejected",
  "article": {
    "id": 50,
    "title": "My Draft Article",
    "status": "rejected",
    "moderation_comment": "Content needs improvement",
    "is_published_in_categories": false
  }
}
```

**Section sources**
- [moderation.js](file://server/routes/moderation.js#L187-L211)

## Security Considerations

### Authentication and Authorization
The API uses session-based authentication with Passport.js. User sessions are stored server-side with session cookies. The system implements role-based access control with three roles: user, moderator, and admin.

Authentication is enforced through the `requireAuth` middleware, which checks if the user is authenticated via Passport session. All endpoints that require authentication use this middleware.

Sensitive operations like article deletion and moderation actions include ownership verification to prevent unauthorized access.

**Section sources**
- [requireAuth.js](file://server/middleware/requireAuth.js#L3-L13)
- [passport.js](file://server/config/passport.js#L7-L20)
- [server.js](file://server/server.js#L20-L25)

### Input Validation
The API implements input validation at multiple levels:

1. **Authentication endpoints**: Validate email format and password presence
2. **Articles endpoints**: Validate article ownership before modification
3. **Moderation endpoints**: Validate facet IDs before assignment
4. **Client-side validation**: Implemented in the frontend for user experience

Password hashing is performed using bcrypt with a salt factor of 10.

**Section sources**
- [auth.js](file://server/routes/auth.js#L13-L15)
- [articles.js](file://server/routes/articles.js#L68-L69)
- [moderation.js](file://server/routes/moderation.js#L88-L90)

### Rate Limiting
While not explicitly implemented in the current codebase, rate limiting should be considered for production deployment to prevent abuse of authentication endpoints. Recommended approaches include:

- Limiting login attempts per IP address
- Implementing account lockout after multiple failed attempts
- Rate limiting for article creation endpoints

## Client Implementation Guidelines

### Authentication State Management
The frontend uses React Context for authentication state management. The `AuthContext` provides the following functionality:

- Check authentication status on application load
- Handle login and registration
- Manage user logout
- Support Google OAuth authentication

The client must include credentials (cookies) in all requests to maintain session state.

```javascript
// Example: Checking authentication status
const response = await fetch('http://localhost:3003/api/auth/me', {
  credentials: 'include'
});
```

**Section sources**
- [AuthContext.js](file://src/context/AuthContext.js#L1-L110)

### Handling AI-Generated Content
The system supports AI-generated content through a prompt-based interface. Key considerations:

1. **Prompt validation**: Client enforces minimum 10 characters and maximum 500 characters
2. **Forbidden phrases**: Certain phrases are blocked to maintain content quality
3. **Content structure**: AI-generated content is structured as cards with IDs and content

The client should provide clear feedback when prompts are too short, too long, or contain forbidden phrases.

**Section sources**
- [script.js](file://script.js#L473-L504)
- [CardEditor.js](file://src/components/CardEditor.js#L238-L252)

## Performance Optimization Tips

### Caching Facet Data
Facet data is relatively static and can be cached to improve performance:

- Cache the response from GET /api/facets
- Use browser localStorage or sessionStorage
- Implement cache invalidation on application updates
- Consider server-side caching with Redis for high-traffic scenarios

```javascript
// Example: Caching facet data
const getFacets = async () => {
  const cached = localStorage.getItem('facets_cache');
  if (cached && Date.now() - JSON.parse(cached).timestamp < 3600000) {
    return JSON.parse(cached).data;
  }
  
  const response = await fetch('/api/facets');
  const data = await response.json();
  
  localStorage.setItem('facets_cache', JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
};
```

**Section sources**
- [facets.js](file://server/routes/facets.js#L9-L33)
- [ArticleManager.js](file://src/utils/ArticleManager.js#L1-L152)

### Batching Article Updates
For better performance when updating multiple articles:

- Implement batch update endpoints
- Use database transactions for atomic operations
- Minimize database round trips
- Consider using bulkCreate and bulkUpdate methods

The current ArticleManager utility provides client-side storage optimization using localStorage with an optimized wrapper.

**Section sources**
- [ArticleManager.js](file://src/utils/ArticleManager.js#L1-L152)

## Error Codes
The API returns standard HTTP status codes with descriptive error messages:

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

Error responses include a descriptive message in the response body:

```json
{
  "error": "Email already in use"
}
```

**Section sources**
- [auth.js](file://server/routes/auth.js#L14-L15)
- [articles.js](file://server/routes/articles.js#L33-L34)
- [facets.js](file://server/routes/facets.js#L57-L58)