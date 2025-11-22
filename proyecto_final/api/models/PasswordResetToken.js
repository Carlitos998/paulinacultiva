const { DataTypes} = require('sequelize');
const {sequelize} = require('../config/db');
const { User } = require('./User');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
    model: 'Usuarios',
    key: 'id'
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'password_reset_tokens',
  timestamps: true
});

// Asociación
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordResetToken, { foreignKey: 'userId' });

// Método para verificar si el token ha expirado
PasswordResetToken.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Método estático para limpiar tokens expirados
PasswordResetToken.cleanExpiredTokens = async function() {
  await this.destroy({
    where: {
      expiresAt: {
        [sequelize.Sequelize.Op.lt]: new Date()
      }
    }
  });
};

module.exports = PasswordResetToken;