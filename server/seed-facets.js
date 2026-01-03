const { sequelize, Facet, FacetValue } = require('./models');

async function seedFacets() {
    try {
        console.log('🌱 Starting facets seed...');

        const findOrCreateFacet = async (name, label, is_required = false) => {
            const [facet] = await Facet.findOrCreate({
                where: { name },
                defaults: { label, is_required }
            });
            return facet;
        };

        const findOrCreateValue = async (facet_id, value, label, parent_id = null) => {
            const [val] = await FacetValue.findOrCreate({
                where: { value, facet_id },
                defaults: { label, parent_id }
            });
            return val;
        };

        // 1. Domain facet
        const domainFacet = await findOrCreateFacet('domain', 'Предметная область', true);

        // Domain values
        const programmingDev = await findOrCreateValue(domainFacet.id, 'programming_development', 'Programming & Development');

        await findOrCreateValue(domainFacet.id, 'web_development', 'Web Development', programmingDev.id);
        await findOrCreateValue(domainFacet.id, 'backend_development', 'Backend Development', programmingDev.id);
        await findOrCreateValue(domainFacet.id, 'frontend_development', 'Frontend Development', programmingDev.id);
        await findOrCreateValue(domainFacet.id, 'mobile_development', 'Mobile Development', programmingDev.id);
        await findOrCreateValue(domainFacet.id, 'data_science_ml', 'Data Science & ML', programmingDev.id);
        await findOrCreateValue(domainFacet.id, 'devops_infrastructure', 'DevOps & Infrastructure', programmingDev.id);
        await findOrCreateValue(domainFacet.id, 'databases', 'Databases', programmingDev.id);

        const businessMgmt = await findOrCreateValue(domainFacet.id, 'business_management', 'Business & Management');

        await findOrCreateValue(domainFacet.id, 'project_management', 'Project Management', businessMgmt.id);
        await findOrCreateValue(domainFacet.id, 'sales_marketing', 'Sales & Marketing', businessMgmt.id);
        await findOrCreateValue(domainFacet.id, 'digital_marketing', 'Digital Marketing', businessMgmt.id);
        await findOrCreateValue(domainFacet.id, 'human_resources', 'Human Resources', businessMgmt.id);
        await findOrCreateValue(domainFacet.id, 'finance_accounting', 'Finance & Accounting', businessMgmt.id);

        const designCreative = await findOrCreateValue(domainFacet.id, 'design_creative', 'Design & Creative');

        await findOrCreateValue(domainFacet.id, 'ui_ux_design', 'UI/UX Design', designCreative.id);
        await findOrCreateValue(domainFacet.id, 'graphic_design', 'Graphic Design', designCreative.id);
        await findOrCreateValue(domainFacet.id, 'motion_graphics', 'Motion Graphics', designCreative.id);
        await findOrCreateValue(domainFacet.id, 'content_creation', 'Content Creation', designCreative.id);

        // 2. Difficulty facet
        const difficultyFacet = await findOrCreateFacet('difficulty', 'Уровень сложности', true);

        await findOrCreateValue(difficultyFacet.id, 'beginner', 'Beginner');
        await findOrCreateValue(difficultyFacet.id, 'intermediate', 'Intermediate');
        await findOrCreateValue(difficultyFacet.id, 'advanced', 'Advanced');
        await findOrCreateValue(difficultyFacet.id, 'expert', 'Expert');

        // 3. Instruction Type facet
        const instructionFacet = await findOrCreateFacet('instruction_type', 'Тип инструкции', true);

        await findOrCreateValue(instructionFacet.id, 'step_by_step_guide', 'Step-by-step Guide');
        await findOrCreateValue(instructionFacet.id, 'tutorial', 'Tutorial');
        await findOrCreateValue(instructionFacet.id, 'reference', 'Reference');
        await findOrCreateValue(instructionFacet.id, 'conceptual', 'Conceptual Overview');
        await findOrCreateValue(instructionFacet.id, 'troubleshooting', 'Troubleshooting');
        await findOrCreateValue(instructionFacet.id, 'best_practices', 'Best Practices');

        // 4. Target Audience facet
        const audienceFacet = await findOrCreateFacet('target_audience', 'Целевая аудитория', true);

        await findOrCreateValue(audienceFacet.id, 'developer', 'Developer');
        await findOrCreateValue(audienceFacet.id, 'designer', 'Designer');
        await findOrCreateValue(audienceFacet.id, 'manager', 'Manager');
        await findOrCreateValue(audienceFacet.id, 'student', 'Student');
        await findOrCreateValue(audienceFacet.id, 'general', 'General Audience');

        // 5. Technology facet (optional)
        const technologyFacet = await findOrCreateFacet('technology', 'Технология', false);

        await findOrCreateValue(technologyFacet.id, 'javascript', 'JavaScript');
        await findOrCreateValue(technologyFacet.id, 'typescript', 'TypeScript');
        await findOrCreateValue(technologyFacet.id, 'python', 'Python');
        await findOrCreateValue(technologyFacet.id, 'react', 'React');
        await findOrCreateValue(technologyFacet.id, 'nodejs', 'Node.js');
        await findOrCreateValue(technologyFacet.id, 'express', 'Express');
        await findOrCreateValue(technologyFacet.id, 'sql', 'SQL');
        await findOrCreateValue(technologyFacet.id, 'mongodb', 'MongoDB');
        await findOrCreateValue(technologyFacet.id, 'docker', 'Docker');
        await findOrCreateValue(technologyFacet.id, 'kubernetes', 'Kubernetes');
        await findOrCreateValue(technologyFacet.id, 'aws', 'AWS');
        await findOrCreateValue(technologyFacet.id, 'figma', 'Figma');

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
