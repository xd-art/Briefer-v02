const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FacetValue = sequelize.define('FacetValue', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    value: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'System name (programming_development, web_development, etc.)'
    },
    label: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Human-readable label'
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'facet_values',
            key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Parent value for hierarchical facets (one level deep)'
    }
}, {
    tableName: 'facet_values',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['facet_id']
        },
        {
            fields: ['parent_id']
        },
        {
            unique: true,
            fields: ['facet_id', 'value']
        }
    ]
});

module.exports = FacetValue;
