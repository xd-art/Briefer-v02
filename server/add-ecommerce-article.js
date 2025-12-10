const { sequelize, Article, ArticleFacet, FacetValue, User } = require('./models');

async function addECommerceArticle() {
    try {
        console.log('📝 Adding E-Commerce Article...');

        // Create or find a default admin user for the article
        let adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
        if (!adminUser) {
            adminUser = await User.create({
                email: 'admin@example.com',
                password_hash: 'system_admin',
                role: 'admin'
            });
        }

        // Create the article
        const article = await Article.create({
            title: 'How to Make E-Commerce Website Project',
            content: JSON.stringify([
                {
                    id: 'card-overview',
                    heading: 'Overview of E-Commerce Websites',
                    content: 'When it comes to developing an e-commerce website, one of the most crucial decisions is choosing the right e-commerce platform. There are several options available, including hosted platforms like Shopify and BigCommerce, as well as self-hosted platforms like WooCommerce and Magento. Alternatively, you can also choose to code your e-commerce website from scratch.'
                },
                {
                    id: 'card-platforms',
                    heading: 'Choosing an e-commerce platform',
                    content: 'Hosted Platforms: Third-party services that provide a complete solution. Pros: Easy setup, built-in features, scalability. Cons: Limited customization, additional fees. Self-Hosted Platforms: Software you install on your own servers. Pros: Full control, better SEO. Cons: Requires technical expertise. Coding from Scratch: Complete control but requires significant technical expertise.'
                },
                {
                    id: 'card-features',
                    heading: 'Website Features',
                    content: 'Core features for e-commerce sites: Product listings with descriptions, images, reviews; Shopping cart; Secure payments; Order tracking; Social media integration; Newsletter signup; FAQ section; Contact page.'
                },
                {
                    id: 'card-goals',
                    heading: 'Project Objectives and Goals',
                    content: 'Set SMART goals (specific, measurable, time-bound). Focus on UX with responsive design and navigation. Optimize SEO for keywords. Implement secure payments with SSL and PCI compliance. Conduct regular A/B testing and load testing.'
                },
                {
                    id: 'card-audience',
                    heading: 'Target Audience',
                    content: 'Defining your target audience is critical. Conduct market research through Google Analytics, social insights, and surveys. Analyze your products to match features with customer needs. Research competitors to identify market gaps and unique selling points.'
                },
                {
                    id: 'card-conclusion',
                    heading: 'Conclusion',
                    content: 'Success requires defining scope, goals, audience, and features upfront. Research informs platform and functionality choices. Key priorities: sales growth via UX, secure payments, navigation. Track KPIs like traffic, conversions, and revenue. Ongoing optimization boosts SEO and retention.'
                }
            ]),
            user_id: adminUser.id,
            status: 'approved',
            is_published_in_categories: true
        });

        console.log(`✅ Article created: "${article.title}" (ID: ${article.id})`);

        // Find the facet values for assignment
        // Domain: Business & Management > Sales & Marketing
        const salesMarketingFacet = await FacetValue.findOne({
            where: { value: 'sales_marketing' }
        });

        // Difficulty: Beginner (for overview/project brief)
        const beginnerFacet = await FacetValue.findOne({
            where: { value: 'beginner' }
        });

        // Instruction Type: Step-by-step Guide
        const guideFacet = await FacetValue.findOne({
            where: { value: 'step_by_step_guide' }
        });

        // Target Audience: Manager (for business decision-makers)
        const managerFacet = await FacetValue.findOne({
            where: { value: 'manager' }
        });

        if (!salesMarketingFacet || !beginnerFacet || !guideFacet || !managerFacet) {
            console.error('❌ Some facet values not found. Make sure to run seed-facets.js first.');
            process.exit(1);
        }

        // Assign facets
        const facetIds = [
            { id: salesMarketingFacet.id, facetId: salesMarketingFacet.facet_id },
            { id: beginnerFacet.id, facetId: beginnerFacet.facet_id },
            { id: guideFacet.id, facetId: guideFacet.facet_id },
            { id: managerFacet.id, facetId: managerFacet.facet_id }
        ];

        const assignments = facetIds.map(fv => ({
            article_id: article.id,
            facet_id: fv.facetId,
            facet_value_id: fv.id,
            source: 'manual',
            confidence: 1.0
        }));

        await ArticleFacet.bulkCreate(assignments);

        console.log('📌 Article assigned to categories:');
        console.log(`   - Domain: Sales & Marketing`);
        console.log(`   - Difficulty: Beginner`);
        console.log(`   - Instruction Type: Step-by-step Guide`);
        console.log(`   - Target Audience: Manager`);
        console.log('🎉 Article published successfully!');

    } catch (error) {
        console.error('❌ Error adding article:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    addECommerceArticle()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = addECommerceArticle;
