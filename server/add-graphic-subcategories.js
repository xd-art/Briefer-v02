// Add graphic design subcategories as children of graphic_design
// Author: conceptration@yahoo.com

require('dotenv').config();
const { Facet, FacetValue } = require('./models');

async function addGraphicSubcategories() {
    try {
        console.log('🎨 Adding Graphic Design subcategories...\n');

        // Find the domain facet
        const domainFacet = await Facet.findOne({ where: { name: 'domain' } });
        if (!domainFacet) {
            throw new Error('Domain facet not found! Please run seed-facets.js first.');
        }

        // Find the graphic_design parent value
        const graphicDesignParent = await FacetValue.findOne({ 
            where: { 
                facet_id: domainFacet.id,
                value: 'graphic_design' 
            } 
        });

        if (!graphicDesignParent) {
            throw new Error('Graphic Design facet value not found! Please run seed-facets.js first.');
        }

        console.log(`✅ Found parent: ${graphicDesignParent.label} (ID: ${graphicDesignParent.id})\n`);

        // Subcategories to add
        const subcategories = [
            { value: 'illustration', label: 'Illustration' },
            { value: 'infographic', label: 'Infographic' },
            { value: 'logo_design', label: 'Logo Design' },
            { value: 'web_design', label: 'Web Design' },
            { value: 'product_design', label: 'Product Design' },
            { value: 'mobile_app_design', label: 'Mobile App Design' },
            { value: 'wrap_design', label: 'Wrap Design' }
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
                if (existing.parent_id !== graphicDesignParent.id) {
                    await existing.update({ parent_id: graphicDesignParent.id });
                    console.log(`   ↳ Updated parent_id to ${graphicDesignParent.id}`);
                }
            } else {
                await FacetValue.create({
                    facet_id: domainFacet.id,
                    value: subcat.value,
                    label: subcat.label,
                    parent_id: graphicDesignParent.id
                });
                console.log(`✅ Added: ${subcat.label} (child of ${graphicDesignParent.label})`);
                added++;
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 Graphic Design Subcategories Update Complete!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Statistics:`);
        console.log(`   - New subcategories added: ${added}`);
        console.log(`   - Already existing: ${skipped}`);
        console.log(`   - Total subcategories: ${added + skipped}`);
        console.log('═══════════════════════════════════════');

        // Show hierarchy
        console.log('\n📁 Current Graphic Design Hierarchy:');
        console.log(`   ${graphicDesignParent.label} (${graphicDesignParent.value})`);
        
        const children = await FacetValue.findAll({
            where: { parent_id: graphicDesignParent.id },
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
    addGraphicSubcategories();
}

module.exports = addGraphicSubcategories;
