const sequelize = require('../config/database');
const User = require('./User');
const Article = require('./Article');
const Facet = require('./Facet');
const FacetValue = require('./FacetValue');
const ArticleFacet = require('./ArticleFacet');

// User <-> Article associations
User.hasMany(Article, { foreignKey: 'user_id', as: 'drafts' });
Article.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Facet <-> FacetValue associations
Facet.hasMany(FacetValue, { foreignKey: 'facet_id', as: 'values', onDelete: 'CASCADE' });
FacetValue.belongsTo(Facet, { foreignKey: 'facet_id', as: 'facet' });

// FacetValue self-referencing (parent/children hierarchy)
FacetValue.hasMany(FacetValue, { foreignKey: 'parent_id', as: 'children', onDelete: 'SET NULL' });
FacetValue.belongsTo(FacetValue, { foreignKey: 'parent_id', as: 'parent' });

// Article <-> Facet many-to-many through ArticleFacet
Article.belongsToMany(FacetValue, { 
    through: ArticleFacet, 
    foreignKey: 'article_id',
    otherKey: 'facet_value_id',
    as: 'facetValues'
});

FacetValue.belongsToMany(Article, { 
    through: ArticleFacet, 
    foreignKey: 'facet_value_id',
    otherKey: 'article_id',
    as: 'articles'
});

// Direct access to ArticleFacet for detailed queries
Article.hasMany(ArticleFacet, { foreignKey: 'article_id', as: 'facetAssignments' });
ArticleFacet.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });
ArticleFacet.belongsTo(FacetValue, { foreignKey: 'facet_value_id', as: 'value' });
ArticleFacet.belongsTo(Facet, { foreignKey: 'facet_id', as: 'facet' });

module.exports = {
    sequelize,
    User,
    Article,
    Facet,
    FacetValue,
    ArticleFacet
};
