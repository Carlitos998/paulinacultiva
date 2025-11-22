const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    postId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    }
}, {
    timestamps: true,
    tableName: 'favorites',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'postId']
        }
    ]
});

// Definir asociaciones
Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
    });
    Favorite.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post'
    });
};

module.exports = {
    Favorite
};