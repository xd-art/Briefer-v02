const { sequelize, Facet, FacetValue } = require('./models');

async function seedFacets() {
    try {
        console.log('🌱 Starting facets seed...');
        
        // 1. Domain facet
        const domainFacet = await Facet.create({
            name: 'domain',
            label: 'Предметная область',
            is_required: true
        });

        // Domain values with hierarchy
        const programmingDev = await FacetValue.create({
            facet_id: domainFacet.id,
            value: 'programming_development',
            label: 'Programming & Development'
        });

        await FacetValue.bulkCreate([
            { facet_id: domainFacet.id, value: 'web_development', label: 'Web Development', parent_id: programmingDev.id },
            { facet_id: domainFacet.id, value: 'backend_development', label: 'Backend Development', parent_id: programmingDev.id },
            { facet_id: domainFacet.id, value: 'frontend_development', label: 'Frontend Development', parent_id: programmingDev.id },
            { facet_id: domainFacet.id, value: 'mobile_development', label: 'Mobile Development', parent_id: programmingDev.id },
            { facet_id: domainFacet.id, value: 'data_science_ml', label: 'Data Science & ML', parent_id: programmingDev.id },
            { facet_id: domainFacet.id, value: 'devops_infrastructure', label: 'DevOps & Infrastructure', parent_id: programmingDev.id },
            { facet_id: domainFacet.id, value: 'databases', label: 'Databases', parent_id: programmingDev.id }
        ]);

        const businessMgmt = await FacetValue.create({
            facet_id: domainFacet.id,
            value: 'business_management',
            label: 'Business & Management'
        });

        await FacetValue.bulkCreate([
            { facet_id: domainFacet.id, value: 'project_management', label: 'Project Management', parent_id: businessMgmt.id },
            { facet_id: domainFacet.id, value: 'sales_marketing', label: 'Sales & Marketing', parent_id: businessMgmt.id },
            { facet_id: domainFacet.id, value: 'human_resources', label: 'Human Resources', parent_id: businessMgmt.id },
            { facet_id: domainFacet.id, value: 'finance_accounting', label: 'Finance & Accounting', parent_id: businessMgmt.id }
        ]);

        const designCreative = await FacetValue.create({
            facet_id: domainFacet.id,
            value: 'design_creative',
            label: 'Design & Creative'
        });

        await FacetValue.bulkCreate([
            { facet_id: domainFacet.id, value: 'ui_ux_design', label: 'UI/UX Design', parent_id: designCreative.id },
            { facet_id: domainFacet.id, value: 'graphic_design', label: 'Graphic Design', parent_id: designCreative.id },
            { facet_id: domainFacet.id, value: 'motion_graphics', label: 'Motion Graphics', parent_id: designCreative.id },
            { facet_id: domainFacet.id, value: 'content_creation', label: 'Content Creation', parent_id: designCreative.id }
        ]);

        // 2. Difficulty facet
        const difficultyFacet = await Facet.create({
            name: 'difficulty',
            label: 'Уровень сложности',
            is_required: true
        });

        await FacetValue.bulkCreate([
            { facet_id: difficultyFacet.id, value: 'beginner', label: 'Beginner' },
            { facet_id: difficultyFacet.id, value: 'intermediate', label: 'Intermediate' },
            { facet_id: difficultyFacet.id, value: 'advanced', label: 'Advanced' },
            { facet_id: difficultyFacet.id, value: 'expert', label: 'Expert' }
        ]);

        // 3. Instruction Type facet
        const instructionFacet = await Facet.create({
            name: 'instruction_type',
            label: 'Тип инструкции',
            is_required: true
        });

        await FacetValue.bulkCreate([
            { facet_id: instructionFacet.id, value: 'step_by_step_guide', label: 'Step-by-step Guide' },
            { facet_id: instructionFacet.id, value: 'tutorial', label: 'Tutorial' },
            { facet_id: instructionFacet.id, value: 'reference', label: 'Reference' },
            { facet_id: instructionFacet.id, value: 'conceptual', label: 'Conceptual Overview' },
            { facet_id: instructionFacet.id, value: 'troubleshooting', label: 'Troubleshooting' },
            { facet_id: instructionFacet.id, value: 'best_practices', label: 'Best Practices' }
        ]);

        // 4. Target Audience facet
        const audienceFacet = await Facet.create({
            name: 'target_audience',
            label: 'Целевая аудитория',
            is_required: true
        });

        await FacetValue.bulkCreate([
            { facet_id: audienceFacet.id, value: 'developer', label: 'Developer' },
            { facet_id: audienceFacet.id, value: 'designer', label: 'Designer' },
            { facet_id: audienceFacet.id, value: 'manager', label: 'Manager' },
            { facet_id: audienceFacet.id, value: 'student', label: 'Student' },
            { facet_id: audienceFacet.id, value: 'general', label: 'General Audience' }
        ]);

        // 5. Technology facet (optional, commonly used technologies)
        const technologyFacet = await Facet.create({
            name: 'technology',
            label: 'Технология',
            is_required: false
        });

        await FacetValue.bulkCreate([
            { facet_id: technologyFacet.id, value: 'javascript', label: 'JavaScript' },
            { facet_id: technologyFacet.id, value: 'typescript', label: 'TypeScript' },
            { facet_id: technologyFacet.id, value: 'python', label: 'Python' },
            { facet_id: technologyFacet.id, value: 'react', label: 'React' },
            { facet_id: technologyFacet.id, value: 'nodejs', label: 'Node.js' },
            { facet_id: technologyFacet.id, value: 'express', label: 'Express' },
            { facet_id: technologyFacet.id, value: 'sql', label: 'SQL' },
            { facet_id: technologyFacet.id, value: 'mongodb', label: 'MongoDB' },
            { facet_id: technologyFacet.id, value: 'docker', label: 'Docker' },
            { facet_id: technologyFacet.id, value: 'kubernetes', label: 'Kubernetes' },
            { facet_id: technologyFacet.id, value: 'aws', label: 'AWS' },
            { facet_id: technologyFacet.id, value: 'figma', label: 'Figma' }
        ]);

        console.log('✅ Facets seeded successfully!');
        console.log(`   - ${domainFacet.label}: ${await FacetValue.count({ where: { facet_id: domainFacet.id } })} values`);
        console.log(`   - ${difficultyFacet.label}: ${await FacetValue.count({ where: { facet_id: difficultyFacet.id } })} values`);
        console.log(`   - ${instructionFacet.label}: ${await FacetValue.count({ where: { facet_id: instructionFacet.id } })} values`);
        console.log(`   - ${audienceFacet.label}: ${await FacetValue.count({ where: { facet_id: audienceFacet.id } })} values`);
        console.log(`   - ${technologyFacet.label}: ${await FacetValue.count({ where: { facet_id: technologyFacet.id } })} values`);

    } catch (error) {
        console.error('❌ Error seeding facets:', error);
        throw error;
    }
}

// Run seed if called directly
if (require.main === module) {
    seedFacets()
        .then(() => {
            console.log('🎉 Seed complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seed failed:', error);
            process.exit(1);
        });
}

module.exports = seedFacets;
