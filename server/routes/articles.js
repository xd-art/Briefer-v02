const express = require('express');
const router = express.Router();
const { Article, User, ArticleFacet, FacetValue, Facet, Contributor } = require('../models');
const requireAuth = require('../middleware/requireAuth');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// Create Guest Draft
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;

        const article = await Article.create({
            title: title || 'Untitled',
            content: JSON.stringify(content), // Store cards as JSON string
            user_id: null
        });

        res.status(201).json({ article });
    } catch (error) {
        console.error('Create draft error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /api/articles/search
 * Search articles by title/content and optionally filter by category
 */
router.get('/search', async (req, res) => {
    try {
        const { query, category, limit = 20, offset = 0 } = req.query;
        let categoryIds = [];

        // If category provided, find relevant facet IDs
        if (category) {
            const fv = await FacetValue.findOne({
                where: { value: category },
                include: [{ model: FacetValue, as: 'children' }]
            });
            
            if (fv) {
                categoryIds = [fv.id, ...(fv.children || []).map(c => c.id)];
            }
        }

        const whereClause = {
            status: 'approved',
            is_published_in_categories: true
        };

        if (query) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${query}%` } },
                { content: { [Op.like]: `%${query}%` } }
            ];
        }

        const include = [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'email', 'name', 'bio', 'website']
            }
        ];

        // Add category filter if needed
        if (categoryIds.length > 0) {
            include.push({
                model: ArticleFacet,
                as: 'facetAssignments',
                where: {
                    facet_value_id: { [Op.in]: categoryIds }
                },
                include: [{
                    model: FacetValue,
                    as: 'value'
                }]
            });
        } else {
             // Still include facets for display, but without where clause
             include.push({
                model: ArticleFacet,
                as: 'facetAssignments',
                include: [{
                    model: FacetValue,
                    as: 'value'
                }]
            });
        }

        const { count, rows } = await Article.findAndCountAll({
            where: whereClause,
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            distinct: true // Important for correct count with includes
        });

        res.json({
            articles: rows,
            total: count,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('Search articles error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Attach Draft to User
router.put('/:id/attach', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Only attach if it doesn't have an owner yet
        if (article.user_id) {
            // If it already belongs to this user, that's fine
            if (article.user_id === req.userId) {
                return res.json({ article });
            }
            return res.status(403).json({ error: 'Article already belongs to a user' });
        }

        article.user_id = req.userId;
        await article.save();

        res.json({ article });
    } catch (error) {
        console.error('Attach draft error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /api/articles/categories/:facetValue
 * Get published articles by facet value
 * Example: /api/articles/categories/web_development
 * IMPORTANT: This route must come before /:id to avoid conflicts
 */
router.get('/categories/:facetValue', async (req, res) => {
    try {
        const { facetValue } = req.params;

        // Find the FacetValue by value
        const fv = await FacetValue.findOne({
            where: { value: facetValue },
            include: [
                {
                    model: Facet,
                    as: 'facet'
                },
                {
                    model: FacetValue,
                    as: 'children'
                }
            ]
        });

        if (!fv) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Collect all relevant facet value IDs (parent + children)
        // This ensures we get articles in "Web Development" when viewing "Programming"
        const categoryIds = [fv.id, ...(fv.children || []).map(c => c.id)];

        // Find all articles that:
        // 1. Are approved
        // 2. Are published in categories
        // 3. Have this facet value OR any of its children assigned
        const articles = await Article.findAll({
            where: {
                status: 'approved',
                is_published_in_categories: true
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'email', 'name', 'bio', 'website']
                },
                {
                    model: Contributor,
                    as: 'contributors',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'email', 'name', 'bio', 'website']
                    }]
                },
                {
                    model: ArticleFacet,
                    as: 'facetAssignments',
                    where: {
                        facet_value_id: {
                            [Op.in]: categoryIds
                        }
                    },
                    include: [
                        {
                            model: FacetValue,
                            as: 'value',
                            include: [{
                                model: Facet,
                                as: 'facet'
                            }]
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            category: fv,
            articles
        });
    } catch (error) {
        console.error('Error fetching articles by category:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Drafts
router.get('/user/:userId', requireAuth, async (req, res) => {
    try {
        // Ensure user requests their own drafts
        if (parseInt(req.params.userId) !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const drafts = await Article.findAll({
            where: { user_id: req.userId },
            order: [['updated_at', 'DESC']]
        });

        res.json({ drafts });
    } catch (error) {
        console.error('Get drafts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save/Update Article (Protected)
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const article = await Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Check ownership
        if (article.user_id !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        article.title = title;
        article.content = JSON.stringify(content);
        await article.save();

        res.json({ article });
    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Single Article by ID (Protected)
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Check ownership
        if (article.user_id !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({ article });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Draft
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        if (article.user_id !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await article.destroy();
        res.json({ message: 'Article deleted' });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * POST /api/articles/:id/submit-for-review
 * Submit article for moderation (user can submit their own draft)
 */
router.post('/:id/submit-for-review', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        if (article.user_id !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (article.status !== 'draft') {
            return res.status(400).json({ error: 'Article already submitted or processed' });
        }

        await article.update({ status: 'pending_review' });

        res.json({
            message: 'Article submitted for review',
            article
        });
    } catch (error) {
        console.error('Error submitting article:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
