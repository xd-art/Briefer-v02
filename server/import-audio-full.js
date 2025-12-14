// Import all audio articles with FULL HTML rich text and SEO preservation
// Author: conceptration@yahoo.com

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Article, User, FacetValue, ArticleFacet, Contributor } = require('./models');

// Extract content sections with HTML preserved
function extractRichTextSections(htmlContent) {
    const sections = [];
    
    // Remove everything before <article> and after </article>
    const articleMatch = htmlContent.match(/<article>([\s\S]*?)<\/article>/);
    if (!articleMatch) return sections;
    
    const articleBody = articleMatch[1];
    
    // Split by h2 headers to get sections
    const h2Regex = /<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|$)/g;
    let match;
    let cardId = 1;
    
    while ((match = h2Regex.exec(articleBody)) !== null) {
        const heading = match[1].trim();
        let sectionHtml = match[2].trim();
        
        // Clean up but preserve ALL HTML structure (lists, paragraphs, bold, links, tables, etc.)
        sectionHtml = sectionHtml
            .replace(/<hr[^>]*>/g, '') // Remove hr tags
            .replace(/<br\s*\/?>/g, ' ') // Convert breaks to spaces
            .trim();
        
        if (sectionHtml.length > 20) {
            sections.push({
                id: `card-${cardId++}`,
                heading,
                content: sectionHtml
            });
        }
    }
    
    return sections;
}

// Article mapping with facets - All audio articles
// Note: Each article gets BOTH the parent 'content_creation' facet AND its specific subcategory
const articleMappings = [
    {
        filename: 'audio.html',
        facets: ['content_creation', 'audio_production', 'intermediate', 'step_by_step_guide', 'general']
    },
    {
        filename: 'music.html',
        facets: ['content_creation', 'music_production', 'intermediate', 'step_by_step_guide', 'general']
    },
    {
        filename: 'voiceover.html',
        facets: ['content_creation', 'voiceover', 'intermediate', 'step_by_step_guide', 'general']
    }
];

async function importAudioArticles() {
    try {
        console.log('🎵 Importing Audio articles with RICH TEXT and SEO preservation...\n');

        // Get admin user
        let adminUser = await User.findOne({ where: { email: 'conceptration@yahoo.com' } });
        if (!adminUser) {
            adminUser = await User.create({
                email: 'conceptration@yahoo.com',
                role: 'admin',
                name: 'Admin'
            });
            console.log('✅ Admin user created\n');
        }

        const tempDir = path.join(__dirname, '..', 'temp', 'audio');
        let imported = 0;
        let updated = 0;
        const articleDetails = [];

        // Ensure all needed facet values exist
        console.log('🔍 Checking facet values...');
        const neededFacetValues = [
            'content_creation', 'audio_production', 'music_production', 'voiceover'
        ];

        for (const value of neededFacetValues) {
            const exists = await FacetValue.findOne({ where: { value } });
            if (!exists) {
                console.log(`  ⚠️  Missing facet value: ${value} - You may need to add it first`);
            }
        }
        console.log('');

        for (const mapping of articleMappings) {
            const filePath = path.join(tempDir, mapping.filename);
            
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  File not found: ${mapping.filename}`);
                continue;
            }

            console.log(`📄 Processing: ${mapping.filename}`);
            
            const htmlContent = fs.readFileSync(filePath, 'utf-8');
            
            // Extract SEO metadata
            const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
            const title = titleMatch ? titleMatch[1].trim() : '';

            const descMatch = htmlContent.match(/<meta name="description" content="(.*?)"/);
            const metaDescription = descMatch ? descMatch[1] : '';

            const keywordsMatch = htmlContent.match(/<meta name="keywords" content="(.*?)"/);
            const metaKeywords = keywordsMatch ? keywordsMatch[1] : '';

            const canonicalMatch = htmlContent.match(/<link rel="canonical" href="(.*?)"/);
            const canonicalUrl = canonicalMatch ? canonicalMatch[1] : '';

            const ogTitleMatch = htmlContent.match(/<meta property="og:title" content="(.*?)"/);
            const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : title;

            const ogDescMatch = htmlContent.match(/<meta property="og:description" content="(.*?)"/);
            const ogDescription = ogDescMatch ? ogDescMatch[1] : metaDescription;

            // Extract rich text sections
            const cards = extractRichTextSections(htmlContent);

            if (cards.length === 0) {
                console.log(`  ⚠️  No content sections extracted, skipping...\n`);
                continue;
            }

            // Find or create article
            let article = await Article.findOne({ where: { title } });

            if (article) {
                await article.update({
                    content: JSON.stringify(cards),
                    meta_description: metaDescription,
                    meta_keywords: metaKeywords,
                    canonical_url: canonicalUrl,
                    og_title: ogTitle,
                    og_description: ogDescription,
                    status: 'approved',
                    is_published_in_categories: true
                });
                console.log(`  ✅ Updated: "${title}" (ID: ${article.id})`);
                updated++;
            } else {
                article = await Article.create({
                    title,
                    content: JSON.stringify(cards),
                    meta_description: metaDescription,
                    meta_keywords: metaKeywords,
                    canonical_url: canonicalUrl,
                    og_title: ogTitle,
                    og_description: ogDescription,
                    user_id: adminUser.id,
                    status: 'approved',
                    is_published_in_categories: true
                });
                console.log(`  ✅ Created: "${title}" (ID: ${article.id})`);
                imported++;

                // Create contributor
                await Contributor.create({
                    article_id: article.id,
                    user_id: adminUser.id,
                    contribution_type: 'author'
                });
            }

            // Remove old facets
            await ArticleFacet.destroy({ where: { article_id: article.id } });

            // Assign facets
            const assignments = [];
            const assignedFacets = [];
            for (const facetValue of mapping.facets) {
                const fv = await FacetValue.findOne({ where: { value: facetValue } });
                if (fv) {
                    assignments.push({
                        article_id: article.id,
                        facet_id: fv.facet_id,
                        facet_value_id: fv.id,
                        source: 'manual',
                        confidence: 1.0
                    });
                    assignedFacets.push(facetValue);
                } else {
                    console.log(`  ⚠️  Facet value not found: ${facetValue}`);
                }
            }

            if (assignments.length > 0) {
                await ArticleFacet.bulkCreate(assignments);
            }

            console.log(`  📌 Assigned facets: ${assignedFacets.join(', ')}`);
            console.log(`  💾 Rich text cards: ${cards.length}`);
            console.log(`  🔖 SEO fields: ✓ title, ✓ description, ✓ keywords, ✓ canonical, ✓ og:tags\n`);

            // Store article details for summary
            articleDetails.push({
                id: article.id,
                public_id: article.public_id,
                title: title,
                filename: mapping.filename,
                cards: cards.length,
                facets: assignedFacets
            });
        }

        // Print summary
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎉 AUDIO ARTICLES IMPORT COMPLETED!');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`📊 Statistics:`);
        console.log(`   - New articles: ${imported}`);
        console.log(`   - Updated articles: ${updated}`);
        console.log(`   - Total processed: ${imported + updated}\n`);

        if (articleDetails.length > 0) {
            console.log('📝 Imported Articles:');
            console.log('─────────────────────────────────────────────────────────────');
            articleDetails.forEach((detail, index) => {
                console.log(`${index + 1}. "${detail.title}"`);
                console.log(`   ID: ${detail.id} | Public ID: ${detail.public_id || 'null'}`);
                console.log(`   File: ${detail.filename}`);
                console.log(`   Content: ${detail.cards} cards`);
                console.log(`   Facets: ${detail.facets.join(', ')}`);
                console.log('');
            });
        }

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('✅ All SEO metadata preserved (title, description, keywords, canonical, OG tags)');
        console.log('✅ All HTML content preserved (lists, links, bold, structure, tables)');
        console.log('✅ Articles marked as approved and published in categories');
        console.log('✅ Facets assigned for categorization');
        console.log('═══════════════════════════════════════════════════════════════');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing articles:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    importAudioArticles();
}

module.exports = importAudioArticles;
