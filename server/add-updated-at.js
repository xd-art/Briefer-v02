const { sequelize } = require('./models');

const addUpdatedAt = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Add updated_at column with default value
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
        `);
        
        console.log('✅ Added updated_at column to users table.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addUpdatedAt();
