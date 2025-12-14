// Author: conceptration@yahoo.com
// Check entertainment article content completeness

require('dotenv').config();
const { Article } = require('./models');
const fs = require('fs');
const path = require('path');

async function checkContent() {
    try {
        // Get article from database
        const article = await Article.findOne({
            where: { title: 'How to Make Entertainment Website Project' }
        });

        if (!article) {
            console.log('❌ Article not found in database');
            process.exit(1);
        }

        console.log('📄 Article found in database (ID: ' + article.id + ')');
        console.log('Title:', article.title);
        console.log('\n════════════════════════════════════════\n');

        // Parse content
        const cards = JSON.parse(article.content);
        console.log(`Total cards in database: ${cards.length}\n`);

        // Display each card
        cards.forEach((card, index) => {
            console.log(`\n━━━━ CARD ${index + 1}: ${card.heading} ━━━━`);
            console.log('Content length:', card.content.length, 'characters');
            console.log('Preview (first 200 chars):');
            console.log(card.content.substring(0, 200) + '...\n');
        });

        console.log('\n════════════════════════════════════════');
        console.log('📊 Summary:');
        console.log(`   - Total sections: ${cards.length}`);
        console.log(`   - Total content: ${cards.reduce((sum, c) => sum + c.content.length, 0)} characters`);
        
        // Read original HTML file
        const htmlPath = path.join(__dirname, '..', 'temp', 'programming', 'entertainment-website.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        
        // Count h2 sections in HTML
        const h2Matches = htmlContent.match(/<h2>/g);
        const h2Count = h2Matches ? h2Matches.length : 0;
        
        console.log(`\n📁 Original HTML file:`);
        console.log(`   - H2 sections found: ${h2Count}`);
        console.log(`   - Total file size: ${htmlContent.length} characters`);
        
        if (cards.length === h2Count) {
            console.log('\n✅ All sections transferred!');
        } else {
            console.log(`\n⚠️  Section count mismatch: DB has ${cards.length}, HTML has ${h2Count}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkContent();
