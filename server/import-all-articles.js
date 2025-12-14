// Author: conceptration@yahoo.com
// Import all 11 articles from HTML files with SEO metadata and proper categorization

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Article, User, FacetValue, ArticleFacet, Contributor } = require('./models');

// HTML parser function to extract metadata and content
function parseHTML(htmlContent) {
    const seo = {
        title: '',
        metaDescription: '',
        metaKeywords: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: ''
    };

    // Extract meta tags
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
    if (titleMatch) seo.title = titleMatch[1].replace(' | Example of Writing Project Brief', '').trim();

    const descMatch = htmlContent.match(/<meta name="description" content="(.*?)"/);
    if (descMatch) seo.metaDescription = descMatch[1];

    const keywordsMatch = htmlContent.match(/<meta name="keywords" content="(.*?)"/);
    if (keywordsMatch) seo.metaKeywords = keywordsMatch[1];

    const canonicalMatch = htmlContent.match(/<link rel="canonical" href="(.*?)"/);
    if (canonicalMatch) seo.canonicalUrl = canonicalMatch[1];

    const ogTitleMatch = htmlContent.match(/<meta property="og:title" content="(.*?)"/);
    if (ogTitleMatch) seo.ogTitle = ogTitleMatch[1].replace(' | Example of Writing Project Brief', '').trim();

    const ogDescMatch = htmlContent.match(/<meta property="og:description" content="(.*?)"/);
    if (ogDescMatch) seo.ogDescription = ogDescMatch[1];

    // Extract h1 as article title if not found in meta
    if (!seo.title) {
        const h1Match = htmlContent.match(/<h1>(.*?)<\/h1>/);
        if (h1Match) seo.title = h1Match[1];
    }

    // Extract all h2 sections as cards
    const cards = [];
    const h2Regex = /<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|<\/article>|$)/g;
    let match;
    let cardId = 1;

    while ((match = h2Regex.exec(htmlContent)) !== null) {
        const heading = match[1].trim();
        let content = match[2]
            .replace(/<hr[^>]*>/g, '')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<p[^>]*>/g, '')
            .replace(/<table>[\s\S]*?<\/table>/g, '')
            .replace(/<ul>[\s\S]*?<\/ul>/g, '')
            .replace(/<ol>[\s\S]*?<\/ol>/g, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (content.length > 50) {
            cards.push({
                id: `card-${cardId++}`,
                heading,
                content: content
            });
        }
    }

    return { seo, cards };
}

// Article mapping with facet categorization
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

async function importAllArticles() {
    try {
        console.log('📚 Starting import of all 11 articles...\n');

        // Get or create admin user
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
            const { seo, cards } = parseHTML(htmlContent);

            if (cards.length === 0) {
                console.log(`  ⚠️  No content cards extracted, skipping...\n`);
                continue;
            }

            // Check if article already exists
            let article = await Article.findOne({ where: { title: seo.title } });

            if (article) {
                // Update existing article with SEO data
                await article.update({
                    content: JSON.stringify(cards),
                    meta_description: seo.metaDescription,
                    meta_keywords: seo.metaKeywords,
                    canonical_url: seo.canonicalUrl,
                    og_title: seo.ogTitle || seo.title,
                    og_description: seo.ogDescription || seo.metaDescription,
                    status: 'approved',
                    is_published_in_categories: true
                });
                console.log(`  ✅ Updated: "${seo.title}" (ID: ${article.id})`);
                updated++;
            } else {
                // Create new article
                article = await Article.create({
                    title: seo.title,
                    content: JSON.stringify(cards),
                    meta_description: seo.metaDescription,
                    meta_keywords: seo.metaKeywords,
                    canonical_url: seo.canonicalUrl,
                    og_title: seo.ogTitle || seo.title,
                    og_description: seo.ogDescription || seo.metaDescription,
                    user_id: adminUser.id,
                    status: 'approved',
                    is_published_in_categories: true
                });
                console.log(`  ✅ Created: "${seo.title}" (ID: ${article.id})`);
                imported++;

                // Create contributor record
                await Contributor.create({
                    article_id: article.id,
                    user_id: adminUser.id,
                    contribution_type: 'author'
                });
            }

            // Remove old facet assignments
            await ArticleFacet.destroy({ where: { article_id: article.id } });

            // Assign facets
            const facetAssignments = [];
            for (const facetValue of mapping.facets) {
                const fv = await FacetValue.findOne({ where: { value: facetValue } });
                if (fv) {
                    facetAssignments.push({
                        article_id: article.id,
                        facet_id: fv.facet_id,
                        facet_value_id: fv.id,
                        source: 'manual',
                        confidence: 1.0
                    });
                }
            }

            if (facetAssignments.length > 0) {
                await ArticleFacet.bulkCreate(facetAssignments);
                console.log(`  📌 Assigned ${facetAssignments.length} facets`);
            }

            console.log(`  💾 Content cards: ${cards.length}\n`);
        }

        console.log('═══════════════════════════════════════');
        console.log(`🎉 Import completed!`);
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
    importAllArticles();
}

module.exports = importAllArticles;
