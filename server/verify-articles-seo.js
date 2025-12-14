// Author: conceptration@yahoo.com
// Verify all articles have proper SEO metadata and categorization

require('dotenv').config();
const { Article, ArticleFacet, FacetValue, Facet } = require('./models');

async function verifyArticles() {
    try {
        console.log('🔍 Verifying all articles...\n');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const articles = await Article.findAll({
            where: {
                status: 'approved',
                is_published_in_categories: true
            },
            include: [{
                model: ArticleFacet,
                as: 'facetAssignments',
                include: [{
                    model: FacetValue,
                    as: 'value',
                    include: [{
                        model: Facet,
                        as: 'facet'
                    }]
                }]
            }],
            order: [['id', 'ASC']]
        });

        console.log(`📊 Total published articles: ${articles.length}\n`);

        articles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title}`);
            console.log(`   ID: ${article.id}`);
            
            // SEO Status
            const hasSEO = !!(article.meta_description && article.meta_keywords);
            console.log(`   SEO: ${hasSEO ? '✅' : '❌'} ${hasSEO ? 'Complete' : 'Missing'}`);
            
            if (article.meta_description) {
                console.log(`   Meta Description: ${article.meta_description.substring(0, 80)}...`);
            }
            if (article.meta_keywords) {
                console.log(`   Keywords: ${article.meta_keywords.substring(0, 80)}...`);
            }
            if (article.canonical_url) {
                console.log(`   Canonical URL: ${article.canonical_url}`);
            }

            // Categories
            console.log(`   Categories: ${article.facetAssignments?.length || 0} assigned`);
            if (article.facetAssignments && article.facetAssignments.length > 0) {
                article.facetAssignments.forEach(fa => {
                    console.log(`      - ${fa.value?.facet?.label}: ${fa.value?.label}`);
                });
            }
            
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`✅ Verification complete!`);
        console.log(`   - Articles with SEO: ${articles.filter(a => a.meta_description).length}`);
        console.log(`   - Articles categorized: ${articles.filter(a => a.facetAssignments?.length > 0).length}`);
        console.log('═══════════════════════════════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifying articles:', error);
        process.exit(1);
    }
}

verifyArticles();
