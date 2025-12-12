const { sequelize, Article, User, Contributor } = require('./models');

async function setEcommerceAuthor() {
    try {
        console.log('🔄 Setting author for "How to Make E-Commerce Website Project"...');

        // Ensure DB connection works
        await sequelize.authenticate();

        // 1) Find or create your user by email
        const email = 'danny.khorz@gmail.com';

        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                email,
                password_hash: 'external_created',
                role: 'user',
                name: null,
                bio: null,
                website: null
            }
        });

        console.log(created
            ? `✅ User created for ${email} (id=${user.id})`
            : `ℹ️ Using existing user ${email} (id=${user.id})`
        );

        // 2) Find the article by title
        const title = 'How to Make E-Commerce Website Project';

        const article = await Article.findOne({ where: { title } });

        if (!article) {
            console.error(`❌ Article not found with title: "${title}"`);
            process.exit(1);
        }

        console.log(`📝 Found article "${article.title}" (id=${article.id})`);

        // 3) Update article.user_id to your user
        article.user_id = user.id;
        await article.save();

        console.log(`✅ Article author updated to user_id=${user.id}`);

        // 4) Ensure contributor record with type "author"
        const [contributor, contribCreated] = await Contributor.findOrCreate({
            where: {
                article_id: article.id,
                user_id: user.id
            },
            defaults: {
                article_id: article.id,
                user_id: user.id,
                contribution_type: 'author'
            }
        });

        if (!contribCreated && contributor.contribution_type !== 'author') {
            contributor.contribution_type = 'author';
            await contributor.save();
            console.log('✅ Existing contributor updated to type "author"');
        } else if (contribCreated) {
            console.log('✅ Contributor record created with type "author"');
        } else {
            console.log('ℹ️ Author contributor already correctly set');
        }

        console.log('🎉 Done. You should now appear as article author.');
    } catch (err) {
        console.error('💥 Error setting author:', err);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run if called directly
if (require.main === module) {
    setEcommerceAuthor();
}

module.exports = setEcommerceAuthor;
