const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facet = sequelize.define('Facet', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'System name (domain, difficulty, technology, etc.)'
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Human-readable label'
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether this facet is required for published articles'
    }
}, {
    tableName: 'facets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Facet;
