// Add marketing subcategories as children of sales_marketing
// Author: conceptration@yahoo.com

require('dotenv').config();
const { Facet, FacetValue } = require('./models');

async function addMarketingSubcategories() {
    try {
        console.log('📢 Adding Marketing subcategories...\n');

        // Find the domain facet
        const domainFacet = await Facet.findOne({ where: { name: 'domain' } });
        if (!domainFacet) {
            throw new Error('Domain facet not found! Please run seed-facets.js first.');
        }

        // Find the sales_marketing parent value
        const salesMarketingParent = await FacetValue.findOne({ 
            where: { 
                facet_id: domainFacet.id,
                value: 'sales_marketing' 
            } 
        });

        if (!salesMarketingParent) {
            throw new Error('Sales & Marketing facet value not found! Please run seed-facets.js first.');
        }

        console.log(`✅ Found parent: ${salesMarketingParent.label} (ID: ${salesMarketingParent.id})\n`);

        // Subcategories to add
        const subcategories = [
            { value: 'content_marketing', label: 'Content Marketing' },
            { value: 'email_marketing', label: 'Email Marketing' },
            { value: 'inbound_outbound_marketing', label: 'Inbound & Outbound Marketing' },
            { value: 'influencer_marketing', label: 'Influencer Marketing' },
            { value: 'search_engine_marketing', label: 'Search Engine Marketing (SEM)' },
            { value: 'seo', label: 'SEO' },
            { value: 'social_media_marketing', label: 'Social Media Marketing' }
        ];

        let added = 0;
        let skipped = 0;

        for (const subcat of subcategories) {
            // Check if already exists
            const existing = await FacetValue.findOne({
                where: {
                    facet_id: domainFacet.id,
                    value: subcat.value
                }
            });

            if (existing) {
                console.log(`⏭️  Skipped: ${subcat.label} (already exists)`);
                skipped++;
                
                // Update parent_id if needed
                if (existing.parent_id !== salesMarketingParent.id) {
                    await existing.update({ parent_id: salesMarketingParent.id });
                    console.log(`   ↳ Updated parent_id to ${salesMarketingParent.id}`);
                }
            } else {
                await FacetValue.create({
                    facet_id: domainFacet.id,
                    value: subcat.value,
                    label: subcat.label,
                    parent_id: salesMarketingParent.id
                });
                console.log(`✅ Added: ${subcat.label} (child of ${salesMarketingParent.label})`);
                added++;
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 Marketing Subcategories Update Complete!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Statistics:`);
        console.log(`   - New subcategories added: ${added}`);
        console.log(`   - Already existing: ${skipped}`);
        console.log(`   - Total subcategories: ${added + skipped}`);
        console.log('═══════════════════════════════════════');

        // Show hierarchy
        console.log('\n📁 Current Marketing Hierarchy:');
        console.log(`   ${salesMarketingParent.label} (${salesMarketingParent.value})`);
        
        const children = await FacetValue.findAll({
            where: { parent_id: salesMarketingParent.id },
            order: [['label', 'ASC']]
        });

        children.forEach(child => {
            console.log(`   ├─ ${child.label} (${child.value})`);
        });

        console.log('');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding subcategories:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    addMarketingSubcategories();
}

module.exports = addMarketingSubcategories;
