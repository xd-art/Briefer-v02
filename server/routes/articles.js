const express = require('express');
const router = express.Router();
const { Article, User, ArticleFacet, FacetValue, Facet } = require('../models');
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

/**
 * GET /api/articles/categories/:facetValue
 * Get published articles by facet value
 * Example: /api/articles/categories/web_development
 */
router.get('/categories/:facetValue', async (req, res) => {
    try {
        const { facetValue } = req.params;
        console.log('📂 Category request for:', facetValue);
        
        // Find the facet value
        const fv = await FacetValue.findOne({
            where: { value: facetValue },
            include: [
                {
                    model: FacetValue,
                    as: 'parent'
                },
                {
                    model: Facet,
                    as: 'facet'
                }
            ]
        });

        if (!fv) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Get articles with this facet value
        const articles = await Article.findAll({
            where: {
                is_published_in_categories: true,
                status: 'approved'
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'email']
                },
                {
                    model: ArticleFacet,
                    as: 'facetAssignments',
                    where: { facet_value_id: fv.id },
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
