const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for large articles

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

        // Sync models (optional here if using sync-db script, but good for dev)
        // await sequelize.sync({ alter: true }); 

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Server failed to start:', error);
    }
};

startServer();
