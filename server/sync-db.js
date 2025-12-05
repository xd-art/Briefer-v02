const { sequelize } = require('./models');

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models
        // force: false ensures we don't drop existing tables unless necessary
        // alter: true updates tables to match models if they exist
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

syncDatabase();
