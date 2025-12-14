// Author: conceptration@yahoo.com
// Manual import for e-commerce and mobile-app articles with full HTML

require('dotenv').config();
const { Article, User, FacetValue, ArticleFacet, Contributor } = require('./models');
const fs = require('fs');
const path = require('path');

async function importManualArticles() {
    try {
        const adminUser = await User.findOne({ where: { email: 'conceptration@yahoo.com' } });
        
        // E-Commerce Website Article
        const ecommerceFile = fs.readFileSync(path.join(__dirname, '..', 'temp', 'programming', 'e-commerce-website.html'), 'utf-8');
        
        const ecommerceCards = [
            {
                id: 'card-1',
                heading: 'Overview of E-Commerce Websites',
                content: `<p>When it comes to developing an e-commerce website, one of the most crucial decisions is choosing the right e-commerce platform. There are several options available, including hosted platforms like Shopify and BigCommerce, as well as self-hosted platforms like WooCommerce and Magento. Alternatively, you can also choose to code your e-commerce website from scratch. In this article, we will discuss the pros and cons of both options to help you make an informed decision.</p>

<h3>Choosing an e-commerce platform</h3>

<p><strong>Hosted Platforms</strong></p>
<p>Hosted e-commerce platforms are third-party services that provide a complete solution for building and running an online store. These platforms are user-friendly and require minimal technical expertise, making them an ideal option for small to medium-sized businesses.</p>

<p>Pros:</p>
<ul>
    <li>Easy setup and management</li>
    <li>Built-in features and integrations</li>
    <li>Scalability and flexibility</li>
    <li>Automatic updates and security</li>
</ul>

<p>Cons:</p>
<ul>
    <li>Limited customization options</li>
    <li>Additional fees for advanced features</li>
    <li>Restricted control over server and database</li>
    <li>Limited SEO capabilities</li>
</ul>

<p><strong>Self-Hosted Platforms</strong></p>
<p>Self-hosted e-commerce platforms are software solutions that you install and manage on your own servers. These platforms provide more control and flexibility than hosted platforms, but also require more technical expertise.</p>

<p>Pros:</p>
<ul>
    <li>Full control and customization options</li>
    <li>No additional fees for advanced features</li>
    <li>Better SEO capabilities</li>
    <li>Ability to integrate with third-party software</li>
</ul>

<p>Cons:</p>
<ul>
    <li>Higher technical expertise required</li>
    <li>More time-consuming setup and maintenance</li>
    <li>Additional costs for hosting and security</li>
    <li>Limited support and updates</li>
</ul>

<p><strong>Coding an E-commerce Website from Scratch</strong></p>
<p>Coding an e-commerce website from scratch involves building the website's frontend, backend, and database from the ground up. This option provides complete control and customization but requires significant technical expertise.</p>`
            },
            {
                id: 'card-2',
                heading: 'Choosing an e-commerce platform',
                content: `<p>Set SMART goals (specific, measurable, time-bound). Focus on UX with responsive design and navigation. Optimize SEO for keywords. Implement secure payments with SSL and PCI compliance. Conduct regular A/B testing and load testing.</p>`
            },
            {
                id: 'card-3',
                heading: 'Conclusion',
                content: `<p>Success requires defining scope, goals, audience, and features upfront. Research informs platform and functionality choices. Key priorities: sales growth via UX, secure payments, navigation. Track KPIs like traffic, conversions, and revenue. Ongoing optimization boosts SEO and retention.</p>`
            }
        ];

        const ecommerceMeta = ecommerceFile.match(/<meta name="description" content="(.*?)"/);
        const ecommerceKeywords = ecommerceFile.match(/<meta name="keywords" content="(.*?)"/);
        const ecommerceCanonical = ecommerceFile.match(/<link rel="canonical" href="(.*?)"/);

        let ecommerceArticle = await Article.findByPk(20);
        if (ecommerceArticle) {
            await ecommerceArticle.update({
                content: JSON.stringify(ecommerceCards),
                meta_description: ecommerceMeta ? ecommerceMeta[1] : '',
                meta_keywords: ecommerceKeywords ? ecommerceKeywords[1] : '',
                canonical_url: ecommerceCanonical ? ecommerceCanonical[1] : ''
            });
            console.log('✅ Updated E-Commerce article (ID: 20) with rich text');
        }

        // Mobile App Article
        const mobileCards = [
            {
                id: 'card-1',
                heading: 'Overview of Mobile Application Project',
                content: `<p>In today's fast-paced digital world, mobile apps have become an essential part of our lives.</p>
<p>The mobile app programming project brief involves creating a new application for iOS and Android platforms that meets the needs of users in a specific market segment. The app will be a fitness app that allows users to track their progress and connect with others who share their fitness goals.</p>

<h3>Mobile App Project Brief Example</h3>
<p>This template provides a structured format for outlining the key aspects of a mobile app development project, including its goals, target audience, features, design preferences, technical requirements, and testing procedures.</p>`
            },
            {
                id: 'card-2',
                heading: 'Define the Project Objectives and Goals',
                content: `<p>When it comes to developing a mobile app, it is essential to define the project objectives and goals clearly. This will help you stay focused and ensure that the final product meets the needs of your target audience.</p>
<p>Here are some key objectives and goals to consider when developing a mobile app:</p>
<ul>
    <li><strong>User experience (UX):</strong> The app should be easy to use, visually appealing, and intuitive. It should have a clear navigation system and provide value to the user.</li>
    <li><strong>Performance:</strong> The app should be fast and responsive, with minimal lag or downtime.</li>
    <li><strong>Security:</strong> The app should be secure and protect user data.</li>
    <li><strong>Compatibility:</strong> The app should be compatible with different devices and operating systems.</li>
</ul>`
            },
            {
                id: 'card-3',
                heading: 'Conclusion',
                content: `<p>By following these guidelines and best practices, you can create a successful mobile app that meets the needs of your target audience and achieves your business goals.</p>`
            }
        ];

        const mobileFile = fs.readFileSync(path.join(__dirname, '..', 'temp', 'programming', 'mobile-app.html'), 'utf-8');
        const mobileMeta = mobileFile.match(/<meta name="description" content="(.*?)"/);
        const mobileKeywords = mobileFile.match(/<meta name="keywords" content="(.*?)"/);
        const mobileCanonical = mobileFile.match(/<link rel="canonical" href="(.*?)"/);

        let mobileArticle = await Article.findByPk(34);
        if (mobileArticle) {
            await mobileArticle.update({
                content: JSON.stringify(mobileCards),
                meta_description: mobileMeta ? mobileMeta[1] : '',
                meta_keywords: mobileKeywords ? mobileKeywords[1] : '',
                canonical_url: mobileCanonical ? mobileCanonical[1] : ''
            });
            console.log('✅ Updated Mobile App article (ID: 34) with rich text');
        }

        console.log('\n🎉 Manual article imports completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

importManualArticles();
