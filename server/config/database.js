const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if we are in Production (Render) or Local
if (process.env.DATABASE_URL) {
    // PRODUCTION: Use the single URL string provided by Render
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Required for Render connections
            }
        }
    });
} else {
    // LOCAL DEVELOPMENT: Use separate variables
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: process.env.DB_DIALECT || 'postgres',
            logging: false,
        }
    );
}

module.exports = sequelize;
