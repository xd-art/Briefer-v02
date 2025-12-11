-- Faceted Classification Database Schema
-- PostgreSQL / MySQL compatible

-- ============================================
-- 1. Users Table (Extended with role)
-- ============================================
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'moderator', 'admin') NOT NULL DEFAULT 'user';

-- Add profile fields to users table
ALTER TABLE users
ADD COLUMN name VARCHAR(100) NULL,
ADD COLUMN bio VARCHAR(160) NULL,
ADD COLUMN website VARCHAR(255) NULL;

-- ============================================
-- 2. Articles Table (Extended)
-- ============================================
ALTER TABLE articles 
ADD COLUMN status ENUM('draft', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
ADD COLUMN is_published_in_categories BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN moderation_comment TEXT NULL;

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(is_published_in_categories);

-- ============================================
-- 3. Facets Table
-- ============================================
CREATE TABLE facets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'System name (domain, difficulty, etc.)',
    label VARCHAR(100) NOT NULL COMMENT 'Human-readable label',
    is_required BOOLEAN NOT NULL DEFAULT false COMMENT 'Required for published articles',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Facet Values Table
-- ============================================
CREATE TABLE facet_values (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facet_id INT NOT NULL,
    value VARCHAR(100) NOT NULL COMMENT 'System name (programming_development, etc.)',
    label VARCHAR(150) NOT NULL COMMENT 'Human-readable label',
    parent_id INT NULL COMMENT 'Parent value for hierarchy (one level)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (facet_id) REFERENCES facets(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES facet_values(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_facet_value (facet_id, value)
);

CREATE INDEX idx_facet_values_facet_id ON facet_values(facet_id);
CREATE INDEX idx_facet_values_parent_id ON facet_values(parent_id);

-- ============================================
-- 5. Article Facets (Many-to-Many Junction)
-- ============================================
CREATE TABLE article_facets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    facet_id INT NOT NULL,
    facet_value_id INT NOT NULL,
    source ENUM('manual', 'auto_suggested') NOT NULL DEFAULT 'manual' COMMENT 'How tag was assigned',
    confidence FLOAT NOT NULL DEFAULT 1.0 COMMENT 'Confidence score (0-1) for auto-tags',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (facet_id) REFERENCES facets(id) ON DELETE CASCADE,
    FOREIGN KEY (facet_value_id) REFERENCES facet_values(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_article_facet_value (article_id, facet_value_id)
);

CREATE INDEX idx_article_facets_article_id ON article_facets(article_id);
CREATE INDEX idx_article_facets_facet_value_id ON article_facets(facet_value_id);
CREATE INDEX idx_article_facets_facet_id ON article_facets(facet_id);

-- ============================================
-- 6. Contributors Table (New)
-- ============================================
CREATE TABLE contributors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    contribution_type ENUM('author', 'editor', 'reviewer') NOT NULL DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_article_user (article_id, user_id)
);

CREATE INDEX idx_contributors_article_id ON contributors(article_id);
CREATE INDEX idx_contributors_user_id ON contributors(user_id);

-- ============================================
-- Sample Data Structure
-- ============================================

-- Example: Domain Facet with Hierarchy
-- facets:
--   id=1, name='domain', label='Предметная область', is_required=true

-- facet_values (hierarchical):
--   id=10, facet_id=1, value='programming_development', label='Programming & Development', parent_id=NULL
--   id=11, facet_id=1, value='web_development', label='Web Development', parent_id=10
--   id=12, facet_id=1, value='backend_development', label='Backend Development', parent_id=10

-- Article with facets:
-- articles:
--   id=100, title='How to build REST API', status='approved', is_published_in_categories=true

-- article_facets:
--   (article_id=100, facet_id=1, facet_value_id=10, source='manual', confidence=1.0) -- Programming & Development
--   (article_id=100, facet_id=1, facet_value_id=11, source='manual', confidence=1.0) -- Web Development
--   (article_id=100, facet_id=1, facet_value_id=12, source='manual', confidence=1.0) -- Backend Development
--   (article_id=100, facet_id=2, facet_value_id=50, source='manual', confidence=1.0) -- Difficulty: Intermediate

-- ============================================
-- Common Queries
-- ============================================

-- Get all articles in "Web Development" category:
SELECT a.* 
FROM articles a
JOIN article_facets af ON a.id = af.article_id
JOIN facet_values fv ON af.facet_value_id = fv.id
WHERE fv.value = 'web_development'
  AND a.is_published_in_categories = true
  AND a.status = 'approved';

-- Get all facets for an article:
SELECT f.name, f.label, fv.value, fv.label AS value_label, af.source, af.confidence
FROM article_facets af
JOIN facets f ON af.facet_id = f.id
JOIN facet_values fv ON af.facet_value_id = fv.id
WHERE af.article_id = 100;

-- Get hierarchical facet tree:
SELECT 
    f.name AS facet_name,
    f.label AS facet_label,
    parent.value AS parent_value,
    parent.label AS parent_label,
    child.value AS child_value,
    child.label AS child_label
FROM facets f
LEFT JOIN facet_values parent ON f.id = parent.facet_id AND parent.parent_id IS NULL
LEFT JOIN facet_values child ON parent.id = child.parent_id
WHERE f.name = 'domain'
ORDER BY parent.label, child.label;
