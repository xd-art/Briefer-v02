// Add audio subcategories as children of content_creation
// Author: conceptration@yahoo.com

require('dotenv').config();
const { Facet, FacetValue } = require('./models');

async function addAudioSubcategories() {
    try {
        console.log('🎵 Adding Audio subcategories...\n');

        // Find the domain facet
        const domainFacet = await Facet.findOne({ where: { name: 'domain' } });
        if (!domainFacet) {
            throw new Error('Domain facet not found! Please run seed-facets.js first.');
        }

        // Find the content_creation parent value
        const contentCreationParent = await FacetValue.findOne({ 
            where: { 
                facet_id: domainFacet.id,
                value: 'content_creation' 
            } 
        });

        if (!contentCreationParent) {
            throw new Error('Content Creation facet value not found! Please run seed-facets.js first.');
        }

        console.log(`✅ Found parent: ${contentCreationParent.label} (ID: ${contentCreationParent.id})\n`);

        // Subcategories to add
        const subcategories = [
            { value: 'audio_production', label: 'Audio Production' },
            { value: 'music_production', label: 'Music Production' },
            { value: 'voiceover', label: 'Voiceover' }
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
                if (existing.parent_id !== contentCreationParent.id) {
                    await existing.update({ parent_id: contentCreationParent.id });
                    console.log(`   ↳ Updated parent_id to ${contentCreationParent.id}`);
                }
            } else {
                await FacetValue.create({
                    facet_id: domainFacet.id,
                    value: subcat.value,
                    label: subcat.label,
                    parent_id: contentCreationParent.id
                });
                console.log(`✅ Added: ${subcat.label} (child of ${contentCreationParent.label})`);
                added++;
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('🎉 Audio Subcategories Update Complete!');
        console.log('═══════════════════════════════════════');
        console.log(`📊 Statistics:`);
        console.log(`   - New subcategories added: ${added}`);
        console.log(`   - Already existing: ${skipped}`);
        console.log(`   - Total subcategories: ${added + skipped}`);
        console.log('═══════════════════════════════════════');

        // Show hierarchy
        console.log('\n📁 Current Audio Subcategories Hierarchy:');
        console.log(`   ${contentCreationParent.label} (${contentCreationParent.value})`);
        
        const children = await FacetValue.findAll({
            where: { parent_id: contentCreationParent.id },
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
    addAudioSubcategories();
}

module.exports = addAudioSubcategories;
