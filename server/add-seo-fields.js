// Author: conceptration@yahoo.com
// Add SEO fields to articles table

require('dotenv').config();
const { sequelize } = require('./models');

async function addSEOFields() {
    try {
        console.log('📊 Adding SEO fields to articles table...');

        await sequelize.query(`
            ALTER TABLE articles 
            ADD COLUMN IF NOT EXISTS meta_description TEXT NULL,
            ADD COLUMN IF NOT EXISTS meta_keywords TEXT NULL,
            ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500) NULL,
            ADD COLUMN IF NOT EXISTS og_title VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS og_description TEXT NULL,
            ADD COLUMN IF NOT EXISTS og_image VARCHAR(500) NULL
        `);

        console.log('✅ SEO fields added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding SEO fields:', error);
        process.exit(1);
    }
}

addSEOFields();
