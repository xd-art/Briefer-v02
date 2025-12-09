const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { sequelize } = require('./models');
require('dotenv').config();

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

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start Server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Server failed to start:', error);
    }
};

startServer();