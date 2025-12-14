// Author: conceptration@yahoo.com
// Fix missing SEO for article ID 28

require('dotenv').config();
const { Article } = require('./models');

async function fixArticleSEO() {
    try {
        const article = await Article.findByPk(28);
        
        if (!article) {
            console.log('❌ Article not found');
            process.exit(1);
        }

        await article.update({
            meta_description: 'Learn how to create an effective entertainment website project brief with examples, tools, and essential questions. Covers platform selection, features, and development approaches.',
            meta_keywords: 'entertainment website, project brief, web development, programming, UX design, mobile optimization, content management, performance optimization, security',
            canonical_url: 'https://briefer.pro/pages/programming/entertainment-website.html',
            og_title: 'How to Make an Entertainment Website Project',
            og_description: 'Learn how to create an effective entertainment website project brief with examples, tools, and essential questions. Covers platform selection, features, and development approaches.'
        });

        console.log('✅ Article SEO updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixArticleSEO();
