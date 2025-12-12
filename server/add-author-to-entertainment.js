require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Article, User, Contributor } = require('./models');

async function addAuthorToEntertainment() {
    try {
        console.log('🎬 Adding conceptration@yahoo.com as author to Entertainment article...');

        // 1) Find the user
        const user = await User.findOne({ where: { email: 'conceptration@yahoo.com' } });
        if (!user) {
            console.error('❌ User not found: conceptration@yahoo.com');
            console.log('💡 Please ensure the user exists in the database first.');
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.email} (id=${user.id})`);

        // 2) Find the article
        const article = await Article.findOne({
            where: { title: 'How to Make an Entertainment Website Project' }
        });

        if (!article) {
            console.error('❌ Article not found: "How to Make an Entertainment Website Project"');
            process.exit(1);
        }

        console.log(`📝 Found article "${article.title}" (id=${article.id})`);

        // 3) Update article.user_id to this user
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

        console.log('🎉 Done. conceptration@yahoo.com is now the author of the Entertainment article.');
    } catch (err) {
        console.error('💥 Error adding author:', err);
        process.exit(1);
    } finally {
        const sequelize = require('./config/database');
        await sequelize.close();
    }
}

// Run if called directly
if (require.main === module) {
    addAuthorToEntertainment();
}

module.exports = addAuthorToEntertainment;
