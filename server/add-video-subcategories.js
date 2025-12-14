// Add video subcategories as children of motion_graphics
// Author: conceptration@yahoo.com

require('dotenv').config();
const { Facet, FacetValue } = require('./models');

async function addVideoSubcategories() {
    try {
        console.log('🎬 Adding Video subcategories...\n');

        // Find the domain facet
        const domainFacet = await Facet.findOne({ where: { name: 'domain' } });
        if (!domainFacet) {
            throw new Error('Domain facet not found! Please run seed-facets.js first.');
        }

        // Find the motion_graphics parent value
        const motionGraphicsParent = await FacetValue.findOne({ 
            where: { 
                facet_id: domainFacet.id,
                value: 'motion_graphics' 
            } 
        });

        if (!motionGraphicsParent) {
            throw new Error('Motion Graphics facet value not found! Please run seed-facets.js first.');
        }

        console.log(`✅ Found parent: ${motionGraphicsParent.label} (ID: ${motionGraphicsParent.id})\n`);

        // Subcategories to add
        const subcategories = [
            { value: 'explainer_video', label: 'Explainer Video' },
            { value: 'intro_outro', label: 'Intro & Outro' },
            { value: 'logo_animation', label: 'Logo Animation' },
            { value: 'montage_video', label: 'Montage Video' },
            { value: 'video_advertising', label: 'Video Advertising' },
            { value: 'whiteboard_animation', label: 'Whiteboard Animation' }
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
                if (existing.parent_id !== motionGraphicsParent.id) {
                    await existing.update({ parent_id: motionGraphicsParent.id });
                    console.log(`   ↳ Updated parent_id to ${motionGraphicsParent.id}`);
                }
            } else {
                await FacetValue.create({
                    facet_id: domainFacet.id,
                    value: subcat.value,
                    label: subcat.label,
                    parent_id: motionGraphicsParent.id
                });
                console.log(`✅ Added: ${subcat.label} (child of ${motionGraphicsParent.label})`);
                added++;
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 Video Subcategories Update Complete!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Statistics:`);
        console.log(`   - New subcategories added: ${added}`);
        console.log(`   - Already existing: ${skipped}`);
        console.log(`   - Total subcategories: ${added + skipped}`);
        console.log('═══════════════════════════════════════');

        // Show hierarchy
        console.log('\n📁 Current Video/Motion Graphics Hierarchy:');
        console.log(`   ${motionGraphicsParent.label} (${motionGraphicsParent.value})`);
        
        const children = await FacetValue.findAll({
            where: { parent_id: motionGraphicsParent.id },
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
    addVideoSubcategories();
}

module.exports = addVideoSubcategories;
