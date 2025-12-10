const express = require('express');
const router = express.Router();
const { Facet, FacetValue } = require('../models');

/**
 * GET /api/facets
 * Get all facets with their values (hierarchical)
 */
router.get('/', async (req, res) => {
    try {
        const facets = await Facet.findAll({
            include: [{
                model: FacetValue,
                as: 'values',
                include: [{
                    model: FacetValue,
                    as: 'children'
                }],
                where: { parent_id: null }, // Only top-level values
                required: false
            }],
            order: [
                ['is_required', 'DESC'],
                ['name', 'ASC'],
                [{ model: FacetValue, as: 'values' }, 'label', 'ASC']
            ]
        });

        res.json(facets);
    } catch (error) {
        console.error('Error fetching facets:', error);
        res.status(500).json({ error: 'Failed to fetch facets' });
    }
});

/**
 * GET /api/facets/:facetName/values
 * Get all values for a specific facet (flat list)
 */
router.get('/:facetName/values', async (req, res) => {
    try {
        const { facetName } = req.params;
        
        const facet = await Facet.findOne({
            where: { name: facetName },
            include: [{
                model: FacetValue,
                as: 'values',
                include: [{
                    model: FacetValue,
                    as: 'parent'
                }]
            }]
        });

        if (!facet) {
            return res.status(404).json({ error: 'Facet not found' });
        }

        res.json(facet);
    } catch (error) {
        console.error('Error fetching facet values:', error);
        res.status(500).json({ error: 'Failed to fetch facet values' });
    }
});

module.exports = router;
