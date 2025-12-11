const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true // Allow null for Google-authenticated users
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    role: {
        type: DataTypes.ENUM('user', 'moderator', 'admin'),
        defaultValue: 'user',
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    bio: {
        type: DataTypes.STRING(160),
        allowNull: true,
        validate: {
            len: {
                args: [0, 160],
                msg: "Bio must be less than 160 characters"
            }
        }
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: {
                msg: "Website must be a valid URL"
            }
        }
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = User;