const express = require('express');
const router = express.Router();
const { Article, User } = require('../models');
const requireAuth = require('../middleware/requireAuth');
const { v4: uuidv4 } = require('uuid');

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

module.exports = router;
