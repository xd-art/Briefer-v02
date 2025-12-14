// Author: conceptration@yahoo.com
// Import all articles with FULL HTML rich text preservation

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

// Article mapping with facets
const articleMappings = [
    {
        filename: 'e-commerce-website.html',
        facets: ['sales_marketing', 'beginner', 'step_by_step_guide', 'general']
    },
    {
        filename: 'entertainment-website.html',
        facets: ['ui_ux_design', 'content_creation', 'beginner', 'step_by_step_guide', 'general']
    },
    {
        filename: 'educational-website.html',
        facets: ['ui_ux_design', 'beginner', 'step_by_step_guide', 'general']
    },
    {
        filename: 'portfolio-website.html',
        facets: ['ui_ux_design', 'graphic_design', 'beginner', 'step_by_step_guide', 'general']
    },
    {
        filename: 'cms.html',
        facets: ['web_development', 'backend_development', 'intermediate', 'tutorial', 'developers']
    },
    {
        filename: 'mobile-app.html',
        facets: ['mobile_development', 'intermediate', 'step_by_step_guide', 'developers']
    },
    {
        filename: 'chatbot.html',
        facets: ['ai_machine_learning', 'backend_development', 'intermediate', 'tutorial', 'developers']
    },
    {
        filename: 'artificial-intelligence.html',
        facets: ['ai_machine_learning', 'data_science', 'advanced', 'reference', 'developers']
    },
    {
        filename: 'system-software.html',
        facets: ['backend_development', 'advanced', 'reference', 'developers']
    },
    {
        filename: 'portal-website.html',
        facets: ['web_development', 'backend_development', 'intermediate', 'step_by_step_guide', 'general']
    },
    {
        filename: 'programming.html',
        facets: ['programming_development', 'beginner', 'overview', 'general']
    }
];

async function importAllArticlesRichText() {
    try {
        console.log('📚 Importing all articles with RICH TEXT preservation...\n');

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

        const tempDir = path.join(__dirname, '..', 'temp', 'programming');
        let imported = 0;
        let updated = 0;

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
            const title = titleMatch ? titleMatch[1].replace(' | Example of Writing Project Brief', '').trim() : '';

            const descMatch = htmlContent.match(/<meta name="description" content="(.*?)"/);
            const metaDescription = descMatch ? descMatch[1] : '';

            const keywordsMatch = htmlContent.match(/<meta name="keywords" content="(.*?)"/);
            const metaKeywords = keywordsMatch ? keywordsMatch[1] : '';

            const canonicalMatch = htmlContent.match(/<link rel="canonical" href="(.*?)"/);
            const canonicalUrl = canonicalMatch ? canonicalMatch[1] : '';

            const ogTitleMatch = htmlContent.match(/<meta property="og:title" content="(.*?)"/);
            const ogTitle = ogTitleMatch ? ogTitleMatch[1].replace(' | Example of Writing Project Brief', '').trim() : title;

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
                }
            }

            if (assignments.length > 0) {
                await ArticleFacet.bulkCreate(assignments);
            }

            console.log(`  📌 Assigned ${assignments.length} facets`);
            console.log(`  💾 Rich text cards: ${cards.length}\n`);
        }

        console.log('═══════════════════════════════════════');
        console.log(`🎉 Rich text import completed!`);
        console.log(`📊 Statistics:`);
        console.log(`   - New articles: ${imported}`);
        console.log(`   - Updated articles: ${updated}`);
        console.log(`   - Total processed: ${imported + updated}`);
        console.log('═══════════════════════════════════════');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing articles:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    importAllArticlesRichText();
}

module.exports = importAllArticlesRichText;
