const express = require('express');
const router = express.Router();
const { Article, User, ArticleFacet, FacetValue, Facet, Contributor } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/moderation/pending
 * Get all articles pending review (moderator/admin only)
 */
router.get('/pending', async (req, res) => {
    try {
        // TODO: Add requireAuth middleware to check for moderator/admin role
        
        const articles = await Article.findAll({
            where: { status: 'pending_review' },
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'email']
            }],
            order: [['created_at', 'ASC']]
        });

        res.json(articles);
    } catch (error) {
        console.error('Error fetching pending articles:', error);
        res.status(500).json({ error: 'Failed to fetch pending articles' });
    }
});

/**
 * GET /api/moderation/articles/:id
 * Get single article with facets (moderator/admin only)
 */
router.get('/articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const article = await Article.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'email']
                },
                {
                    model: ArticleFacet,
                    as: 'facetAssignments',
                    include: [
                        {
                            model: Facet,
                            as: 'facet'
                        },
                        {
                            model: FacetValue,
                            as: 'value',
                            include: [{
                                model: FacetValue,
                                as: 'parent'
                            }]
                        }
                    ]
                }
            ]
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

/**
 * POST /api/moderation/articles/:id/facets
 * Assign facets to article (moderator/admin only)
 * Body: { facetValueIds: [1, 2, 3], source: 'manual' }
 */
router.post('/articles/:id/facets', async (req, res) => {
    try {
        const { id } = req.params;
        const { facetValueIds, source = 'manual' } = req.body;

        if (!Array.isArray(facetValueIds) || facetValueIds.length === 0) {
            return res.status(400).json({ error: 'facetValueIds array is required' });
        }

        const article = await Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Get facet_id for each facet_value_id
        const facetValues = await FacetValue.findAll({
            where: { id: facetValueIds },
            attributes: ['id', 'facet_id']
        });

        if (facetValues.length !== facetValueIds.length) {
            return res.status(400).json({ error: 'Some facet values not found' });
        }

        // Delete existing facet assignments
        await ArticleFacet.destroy({ where: { article_id: id } });

        // Create new assignments
        const assignments = facetValues.map(fv => ({
            article_id: id,
            facet_id: fv.facet_id,
            facet_value_id: fv.id,
            source,
            confidence: source === 'manual' ? 1.0 : 0.8
        }));

        await ArticleFacet.bulkCreate(assignments);

        res.json({ 
            message: 'Facets assigned successfully',
            count: assignments.length 
        });
    } catch (error) {
        console.error('Error assigning facets:', error);
        res.status(500).json({ error: 'Failed to assign facets' });
    }
});

/**
 * PATCH /api/moderation/articles/:id/approve
 * Approve article and publish to categories
 * Body: { facetValueIds: [1, 2, 3] }
 */
router.patch('/articles/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { facetValueIds } = req.body;

        const article = await Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Assign facets if provided
        if (facetValueIds && facetValueIds.length > 0) {
            const facetValues = await FacetValue.findAll({
                where: { id: facetValueIds },
                attributes: ['id', 'facet_id']
            });

            await ArticleFacet.destroy({ where: { article_id: id } });
            
            const assignments = facetValues.map(fv => ({
                article_id: id,
                facet_id: fv.facet_id,
                facet_value_id: fv.id,
                source: 'manual',
                confidence: 1.0
            }));

            await ArticleFacet.bulkCreate(assignments);
        }

        // Record the author as a contributor if not already recorded
        if (article.user_id) {
            const existingContributor = await Contributor.findOne({
                where: {
                    article_id: id,
                    user_id: article.user_id
                }
            });

            if (!existingContributor) {
                await Contributor.create({
                    article_id: id,
                    user_id: article.user_id,
                    contribution_type: 'author'
                });
            }
        }

        // Update article status
        await article.update({
            status: 'approved',
            is_published_in_categories: true
        });

        res.json({ 
            message: 'Article approved and published',
            article 
        });
    } catch (error) {
        console.error('Error approving article:', error);
        res.status(500).json({ error: 'Failed to approve article' });
    }
});

/**
 * PATCH /api/moderation/articles/:id/reject
 * Reject article
 * Body: { moderation_comment: 'Reason for rejection' }
 */
router.patch('/articles/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { moderation_comment } = req.body;

        const article = await Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        await article.update({
            status: 'rejected',
            moderation_comment,
            is_published_in_categories: false
        });

        res.json({ 
            message: 'Article rejected',
            article 
        });
    } catch (error) {
        console.error('Error rejecting article:', error);
        res.status(500).json({ error: 'Failed to reject article' });
    }
});

module.exports = router;
