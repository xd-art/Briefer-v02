const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { User } = require('../models'); // Add this import back
require('../config/passport'); // Initialize passport strategies

// Register/Login with Email and Password
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            password_hash
        });

        // Log in the user automatically after registration
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(201).json({ user: { id: user.id, email: user.email } });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login with Email and Password using Passport
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ error: info.message || 'Invalid credentials' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json({ user: { id: user.id, email: user.email } });
        });
    })(req, res, next);
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        res.redirect('http://localhost:3000/profile');
    }
);

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Could not destroy session' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            return res.json({ message: 'Logged out successfully' });
        });
    });
});

// Get Current User
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: { id: req.user.id, email: req.user.email } });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

module.exports = router;