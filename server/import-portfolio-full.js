// Author: conceptration@yahoo.com
// Import portfolio website article with FULL content preservation

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Article, User, FacetValue, ArticleFacet, Contributor } = require('./models');

async function importPortfolioFull() {
    try {
        console.log('📄 Importing Portfolio Website article with full content...\n');

        // Get admin user
        const adminUser = await User.findOne({ where: { email: 'conceptration@yahoo.com' } });
        if (!adminUser) {
            console.error('❌ Admin user not found');
            process.exit(1);
        }

        const filePath = path.join(__dirname, '..', 'temp', 'programming', 'portfolio-website.html');
        const htmlContent = fs.readFileSync(filePath, 'utf-8');

        // Extract SEO metadata
        const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1].replace(' | Example of Writing Project Brief', '').trim() : 'How to Make Portfolio Website Project';

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

        // Extract content with FULL text preservation
        const cards = [
            {
                id: 'card-1',
                heading: 'Overview of Portfolio Websites',
                content: `Portfolio Website Templates

Using a pre-made template is a popular option for those who want a professional-looking website without the cost and time commitment of building it from scratch. There are many portfolio website templates available online, both free and paid, that can be customized to fit your specific needs.

While using a pre-made template can save time and money, it can also limit the level of customization and control you have over your website. Additionally, many templates are used by a large number of people, which can make your website look less unique.

Building a Portfolio Website from Scratch

Building a portfolio website from scratch offers a higher level of customization and control over your website. It allows you to create a website that is unique to your brand and showcases your specific skills and accomplishments. However, building a website from scratch requires more time and expertise, and can be more costly.

Steps to consider when building from scratch:
1. Choose a Domain Name and Hosting - Choose a domain name that is easy to remember and reflects your brand, and choose a hosting provider that offers reliable uptime and fast loading speeds.
2. Plan Your Website - Plan out the structure and design of your website before starting the build. This includes deciding on the pages, layout, and features you want to include.
3. Code Your Website - Code your website using HTML, CSS, and JavaScript. This requires a high level of expertise, and you may need to hire a developer to assist you.
4. Add Content - Once your website is built, add content, including text, images, and videos. This is the time to showcase your work and accomplishments.
5. Test and Launch - Test your website to ensure it is working properly, including checking for broken links and responsive design. Once you are satisfied with your website, launch it to the public.

In conclusion, the choice between using a pre-made template or building a portfolio website from scratch depends on your goals, budget, and level of expertise. Using a pre-made template can save time and money, but limits customization and control, while building a website from scratch offers a higher level of customization and control but requires more time and expertise. Whatever option you choose, remember to showcase your work and accomplishments in the best possible way to attract potential clients and employers.`
            },
            {
                id: 'card-2',
                heading: 'Portfolio Website Development Brief',
                content: `This template provides a structured format for outlining the key aspects of a portfolio website development project, including its goals, target audience, design preferences, technical requirements, and additional features.

Key Sections:
• Project Name - Your project name
• Project Description - Brief description of the project goals and main functionality
• Target Audience - Demographics, interests, and preferences
• Design Preferences - Color scheme, layout, typography
• Technical Requirements - HTML, CSS, JavaScript, Framework (Bootstrap, React), Responsive Design
• Pages and Sections - Home, About Me, Portfolio, Contact
• Additional Features - Image Gallery, Contact Form, Blog Section, Social Media Integration
• Testing and Deployment - Cross-browser compatibility, responsiveness, usability, hosting, server configuration`
            },
            {
                id: 'card-3',
                heading: 'Define the Project Objectives and Goals',
                content: `When it comes to programming an entertainment website, there are a few key objectives and goals that you should keep in mind to ensure that your website is successful. Here are some tips and tricks to help you achieve these goals:

• User experience (UX) is essential - One of the main goals is to provide a great user experience. This means ensuring that your website is easy to use, visually appealing, and responsive. Focus on creating an intuitive navigation system, clear calls-to-action, and high-quality content that will engage and entertain your users.

• Mobile optimization is a must - With more and more people accessing websites on their mobile devices, it's essential to ensure that your entertainment website is optimized for mobile. This means using responsive design techniques to ensure that your website looks great on any device, and focusing on mobile-specific features, such as touch-based navigation.

• Content management is key - An entertainment website needs to be regularly updated with fresh, high-quality content to keep users coming back. This means having a robust content management system (CMS) in place that allows you to easily add and update content. Consider using a CMS like WordPress or Drupal that is specifically designed for content-heavy websites.

• Performance optimization is crucial - A slow-loading website can lead to high bounce rates and frustrated users. To ensure that your entertainment website is fast and responsive, focus on performance optimization techniques such as image compression, minification of code, and caching.

• Security is paramount - An entertainment website may be a target for hackers and other cybercriminals, so it's essential to prioritize security. This means implementing SSL encryption, using strong passwords, and keeping your website up-to-date with the latest security patches and updates.

By focusing on these objectives and goals, you can create a successful and engaging entertainment website that will attract and retain users. Remember to prioritize user experience, mobile optimization, content management, performance optimization, and security to create a website that will stand the test of time.`
            },
            {
                id: 'card-4',
                heading: 'Target Audience for Portfolio Website',
                content: `When creating a portfolio website, it's important to consider your target audience. Your website should be designed with your audience in mind, so that it effectively showcases your work and appeals to their needs and preferences.

Potential target audiences:

• Potential Clients - If you're a freelancer or running your own business, your target audience may be potential clients. Your website should showcase your skills, experience and the type of work you can do for clients. It should be designed to appeal to the types of clients you want to work with.

• Employers - If you're looking for a job, your target audience may be potential employers. Your website should showcase your skills, experience, and the types of projects you've worked on. It should be designed to appeal to the types of companies you want to work for.

• Industry Peers - Your target audience may also include other professionals in your industry. Your website should showcase your skills and expertise, and position you as an authority in your field. It should also be designed to appeal to other professionals in your industry, who may be interested in collaborating or networking with you.

• Potential Collaborators - Your target audience may also include potential collaborators, such as other freelancers or businesses. Your website should showcase your skills and the types of projects you're interested in working on. It should also be designed to appeal to potential collaborators who may be interested in partnering with you on projects.

By considering your target audience and designing your portfolio website with their needs and preferences in mind, you can create a website that effectively showcases your work and helps you achieve your desired outcomes, whether it's attracting new clients, securing a job, or networking with other professionals.`
            },
            {
                id: 'card-5',
                heading: 'Portfolio Website Design',
                content: `Design is a crucial aspect of creating a portfolio website. A well-designed website will effectively showcase your work and help you achieve your desired outcomes, whether it's attracting new clients, securing a job, or networking with industry peers.

Key design considerations:

• Visual Hierarchy - Establish a clear visual hierarchy on your website, with the most important information and content appearing prominently. This could include your name or business name, a headline or tagline, and your most impressive work samples.

• Color Scheme - Choose a color scheme that reflects your personal brand and appeals to your target audience. Stick to a consistent color palette throughout the website to create a cohesive look and feel.

• Typography - Choose typography that is easy to read and complements your overall design. Use typography to establish a hierarchy of information and highlight important content.

• Layout - Use a layout that is clean, uncluttered, and easy to navigate. Use white space strategically to create a sense of balance and emphasize important content.

• Imagery - Use high-quality images or videos to showcase your work. Use images that are relevant to your industry or style, and ensure they are properly optimized for web viewing.

• User Experience - Consider the user experience when designing your website. Ensure that it is easy to navigate, with clear calls to action and intuitive menus. Make it easy for visitors to contact you or view more information about your work.`
            },
            {
                id: 'card-6',
                heading: 'Conclusion',
                content: `Whether you opt for pre-made portfolio website templates or choose to build your website from scratch, the decision hinges on your goals, budget, and expertise level. Utilizing templates can save time and money but may limit customization, while building from scratch offers high customization but demands more time and expertise. Whichever path you take, the key is to showcase your work and achievements effectively to attract potential clients and employers.`
            }
        ];

        // Find existing article
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
            console.log(`✅ Updated: "${title}" (ID: ${article.id})`);
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
            console.log(`✅ Created: "${title}" (ID: ${article.id})`);

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
        const facetValues = ['ui_ux_design', 'graphic_design', 'beginner', 'step_by_step_guide', 'general'];
        const assignments = [];

        for (const facetValue of facetValues) {
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

        await ArticleFacet.bulkCreate(assignments);

        console.log(`📌 Assigned ${assignments.length} facets`);
        console.log(`💾 Content cards: ${cards.length}`);
        console.log('\n✅ Portfolio article imported with FULL content!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

importPortfolioFull();
