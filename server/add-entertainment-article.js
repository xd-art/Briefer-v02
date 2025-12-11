require('dotenv').config();
const { Article, User, FacetValue, ArticleFacet, Contributor } = require('./models');

async function addEntertainmentArticle() {
    try {
        console.log('🎬 Adding Entertainment Website article...');

        // Find or create admin user
        let adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
        if (!adminUser) {
            adminUser = await User.create({
                email: 'admin@example.com',
                role: 'admin'
            });
            console.log('✅ Admin user created');
        }

        // Create article with structured content
        const article = await Article.create({
            title: 'How to Make an Entertainment Website Project',
            content: JSON.stringify([
                {
                    id: 'card-intro',
                    heading: 'Overview of Entertainment Websites',
                    content: 'An entertainment website provides users with engaging content such as news articles, videos, games, music, and multimedia. These websites are designed to deliver fun and engaging experiences that keep users returning. When creating an entertainment website, you can either use pre-made templates (quick and cost-effective) or build from scratch (more customization but time-consuming and expensive).'
                },
                {
                    id: 'card-brief',
                    heading: 'Entertainment Website Project Brief',
                    content: 'Define your project name, description, target audience, content types (categories, genres, formats), design preferences (color scheme, layout, typography), and technical requirements (HTML, CSS, JavaScript, React/Angular framework). Key pages include: Home, News/Updates, Media Gallery, Events/Calendar, and Contact. Additional features may include user registration, streaming services integration, comment sections, and social media integration.'
                },
                {
                    id: 'card-objectives',
                    heading: 'Project Objectives and Goals',
                    content: 'Focus on exceptional user experience (UX) with intuitive navigation and high-quality content. Ensure mobile optimization with responsive design and touch-based navigation. Implement a robust content management system (CMS) like WordPress or Drupal. Prioritize performance optimization through image compression, code minification, and caching. Maintain strong security with SSL encryption, strong passwords, and regular security updates.'
                },
                {
                    id: 'card-audience',
                    heading: 'Determining Your Target Audience',
                    content: 'Start by defining your website\'s purpose (movie reviews, online games, original content like music or web series). Conduct market research to analyze demographics (age, gender, income, location), interests, hobbies, and online behavior. Create user personas representing your ideal users with age, gender, occupation, interests, and pain points. Test with your target audience and refine based on feedback through user testing sessions and surveys.'
                },
                {
                    id: 'card-content-strategy',
                    heading: 'Content Strategy',
                    content: 'Identify your target audience and define content themes (movies, TV shows, music, gaming). Create a content calendar for your publishing schedule. Optimize for SEO with keyword research, optimized headlines and metadata. Use multimedia content (images, videos, infographics) to make content engaging and shareable. Engage with your audience through social media, comments, and user-generated content.'
                },
                {
                    id: 'card-technical',
                    heading: 'Technical Requirements',
                    content: 'Choose a robust CMS (WordPress, Drupal) supporting multimedia content. Implement responsive design for all devices. Optimize performance with CDNs, image compression, and code minification. Apply SEO best practices and secure with SSL encryption. Design for scalability using cloud hosting. Implement user authentication and efficient database management (MySQL, PostgreSQL). Support various multimedia formats and integrate social media. Use analytics tools (Google Analytics) for monitoring. Ensure WCAG accessibility standards compliance.'
                },
                {
                    id: 'card-conclusion',
                    heading: 'Conclusion',
                    content: 'Creating a successful entertainment website requires careful planning across goals, audience understanding, content strategy, and technology implementation. Conduct thorough research, create engaging content, optimize for accessibility and performance, and continuously monitor user analytics. As the digital landscape evolves, entertainment companies must be nimble and innovative to develop captivating online experiences. Brands that leverage data and emerging platforms while prioritizing users will thrive in this competitive market.'
                }
            ]),
            user_id: adminUser.id,
            status: 'approved',
            is_published_in_categories: true
        });

        console.log(`✅ Article created: "${article.title}" (ID: ${article.id})`);

        // Find the facet values for assignment
        // Domain: Design & Creative > UI/UX Design
        const uiUxDesignFacet = await FacetValue.findOne({
            where: { value: 'ui_ux_design' }
        });

        // Also assign to Content Creation
        const contentCreationFacet = await FacetValue.findOne({
            where: { value: 'content_creation' }
        });

        // Difficulty: Beginner
        const beginnerFacet = await FacetValue.findOne({
            where: { value: 'beginner' }
        });

        // Instruction Type: Step-by-step Guide
        const guideFacet = await FacetValue.findOne({
            where: { value: 'step_by_step_guide' }
        });

        // Target Audience: General
        const generalFacet = await FacetValue.findOne({
            where: { value: 'general' }
        });

        if (!uiUxDesignFacet || !contentCreationFacet || !beginnerFacet || !guideFacet || !generalFacet) {
            console.error('❌ Some facet values not found. Make sure to run seed-facets.js first.');
            process.exit(1);
        }

        // Assign facets
        const facetIds = [
            { id: uiUxDesignFacet.id, facetId: uiUxDesignFacet.facet_id },
            { id: contentCreationFacet.id, facetId: contentCreationFacet.facet_id },
            { id: beginnerFacet.id, facetId: beginnerFacet.facet_id },
            { id: guideFacet.id, facetId: guideFacet.facet_id },
            { id: generalFacet.id, facetId: generalFacet.facet_id }
        ];

        const assignments = facetIds.map(fv => ({
            article_id: article.id,
            facet_id: fv.facetId,
            facet_value_id: fv.id,
            source: 'manual',
            confidence: 1.0
        }));

        await ArticleFacet.bulkCreate(assignments);

        // Record the author as contributor
        await Contributor.create({
            article_id: article.id,
            user_id: adminUser.id,
            contribution_type: 'author'
        });

        console.log('📌 Article assigned to categories:');
        console.log(`   - Domain: UI/UX Design, Content Creation`);
        console.log(`   - Difficulty: Beginner`);
        console.log(`   - Instruction Type: Step-by-step Guide`);
        console.log(`   - Target Audience: General Audience`);
        console.log('🎉 Entertainment website article published successfully!');

    } catch (error) {
        console.error('❌ Error adding article:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    addEntertainmentArticle()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = addEntertainmentArticle;
