const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ArticleFacet = sequelize.define('ArticleFacet', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'articles',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    facet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'facets',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    facet_value_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'facet_values',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    source: {
        type: DataTypes.ENUM('manual', 'auto_suggested'),
        defaultValue: 'manual',
        allowNull: false
    },
    confidence: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0,
        allowNull: false,
        validate: {
            min: 0,
            max: 1
        },
        comment: 'Confidence score for auto-suggested tags (0-1)'
    }
}, {
    tableName: 'article_facets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['article_id']
        },
        {
            fields: ['facet_value_id']
        },
        {
            fields: ['facet_id']
        },
        {
            unique: true,
            fields: ['article_id', 'facet_value_id']
        }
    ]
});

module.exports = ArticleFacet;
