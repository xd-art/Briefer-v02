const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contributor = sequelize.define('Contributor', {
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
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    contribution_type: {
        type: DataTypes.ENUM('author', 'editor', 'reviewer'),
        defaultValue: 'editor',
        allowNull: false
    }
}, {
    tableName: 'contributors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Contributor;
