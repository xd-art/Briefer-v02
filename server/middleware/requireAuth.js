const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    // Check if user is authenticated via Passport session
    if (req.isAuthenticated && req.isAuthenticated()) {
        req.userId = req.user.id;
        next();
    } else {
        return res.status(401).json({ error: 'Not authenticated' });
    }
};

module.exports = requireAuth;
