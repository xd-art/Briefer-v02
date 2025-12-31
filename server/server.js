require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { sequelize } = require('./models');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_here',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport strategies after models are loaded
require('./config/passport');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/facets', require('./routes/facets'));
app.use('/api/moderation', require('./routes/moderation'));
app.use('/api/ai', require('./routes/ai'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../build')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

// Start Server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        // Keep the process alive
        process.on('SIGINT', () => {
            console.log('\n⚠️  Shutting down server...');
            server.close(() => {
                console.log('✅ Server closed.');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('❌ Server failed to start:', error);
        process.exit(1);
    }
};

startServer();