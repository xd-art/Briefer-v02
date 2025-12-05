const sequelize = require('../config/database');
const User = require('./User');
const Article = require('./Article');

// Define associations
User.hasMany(Article, { foreignKey: 'user_id', as: 'drafts' });
Article.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

module.exports = {
    sequelize,
    User,
    Article
};
