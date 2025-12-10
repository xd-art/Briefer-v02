const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define('Article', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable for guest drafts
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT('long'), // Use LONGTEXT for large articles
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    public_id: {
        type: DataTypes.CHAR(12),
        allowNull: true,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'rejected'),
        defaultValue: 'draft',
        allowNull: false
    },
    is_published_in_categories: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    moderation_comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'articles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Article;
