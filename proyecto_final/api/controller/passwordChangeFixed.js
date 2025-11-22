// passwordChangeFixed.js - Sistema de modificación de contraseña con tokens para el perfil
const { User } = require('../models');
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'misecreto';

// Definir modelo PasswordChangeToken directamente para evitar problemas de dependencia circular
const PasswordChangeToken = sequelize.define('PasswordChangeToken', {
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
  currentPasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  newPasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
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
  tableName: 'password_change_tokens',
  timestamps: true
});

// Asociación
PasswordChangeToken.belongsTo(User, { foreignKey: 'userId' });

// Método para verificar si el token ha expirado
PasswordChangeToken.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

/**
 * Solicitar token para cambio de contraseña (desde perfil)
 * Verifica la contraseña actual y genera un token temporal
 */
const requestPasswordChange = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual y la nueva son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Verificar que la nueva contraseña no sea igual a la actual
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no puede ser igual a la actual'
      });
    }

    // Limpiar tokens anteriores del mismo usuario
    await PasswordChangeToken.destroy({ where: { userId } });

    // Hashear contraseñas
    const currentPasswordHash = await bcrypt.hash(currentPassword, 10);
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Generar token único y seguro
    const changeToken = crypto.randomBytes(32).toString('hex');

    // Establecer expiración (15 minutos - más corto por seguridad)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Guardar token en base de datos
    await PasswordChangeToken.create({
      token: changeToken,
      userId,
      currentPasswordHash,
      newPasswordHash,
      expiresAt
    });

    res.status(200).json({
      success: true,
      message: 'Token de cambio generado correctamente',
      changeToken,
      expiresIn: '15 minutos'
    });

  } catch (error) {
    console.error('Error en requestPasswordChange:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
};

/**
 * Confirmar cambio de contraseña con token
 */
const confirmPasswordChange = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token es requerido'
      });
    }

    // Buscar token
    const changeToken = await PasswordChangeToken.findOne({
      where: { token },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!changeToken) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o no encontrado'
      });
    }

    // Verificar si no ha sido usado
    if (changeToken.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Este token ya ha sido utilizado'
      });
    }

    // Verificar si no ha expirado
    if (changeToken.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado. Solicita un nuevo cambio de contraseña'
      });
    }

    // Verificación final de seguridad: la contraseña actual debe seguir siendo válida
    const user = await User.findByPk(changeToken.userId);
    const isCurrentPasswordStillValid = await bcrypt.compare(
      changeToken.currentPasswordHash,
      user.password
    );

    if (!isCurrentPasswordStillValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual ha cambiado. Por seguridad, solicita un nuevo token'
      });
    }

    // Actualizar contraseña del usuario
    await user.update({ password: changeToken.newPasswordHash });

    // Marcar token como usado
    await changeToken.update({ isUsed: true });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error en confirmPasswordChange:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar cambio de contraseña'
    });
  }
};

module.exports = {
  requestPasswordChange,
  confirmPasswordChange
};