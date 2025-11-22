// passwordResetFixed.js - Versión corregida del sistema de recuperación de contraseña
const { User } = require('../models');
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Definir modelo PasswordResetToken directamente para evitar problemas de dependencia circular
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

// Método para verificar si el token ha expirado
PasswordResetToken.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

/**
 * Solicitar restablecimiento de contraseña
 * Genera un token interno y lo devuelve al frontend
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email: email.trim() } });

    // Si no existe el usuario, no revelamos esta información por seguridad
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Limpiar tokens anteriores del mismo usuario
    await PasswordResetToken.destroy({ where: { userId: user.id } });

    // Generar token único y seguro
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Establecer expiración (1 hora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar token en base de datos
    await PasswordResetToken.create({
      token: resetToken,
      userId: user.id,
      expiresAt
    });

    res.status(200).json({
      success: true,
      message: 'Token de restablecimiento generado',
      resetToken, // En desarrollo, devolvemos el token directamente
      expiresIn: '1 hora',
      userId: user.id
    });

  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
};

/**
 * Verificar si un token es válido
 */
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token es requerido'
      });
    }

    // Buscar token
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o no encontrado'
      });
    }

    // Verificar si no ha sido usado
    if (resetToken.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Este token ya ha sido utilizado'
      });
    }

    // Verificar si no ha expirado
    if (resetToken.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado. Solicita un nuevo restablecimiento'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token válido',
      user: {
        id: resetToken.User.id,
        username: resetToken.User.username,
        email: resetToken.User.email
      },
      expiresAt: resetToken.expiresAt
    });

  } catch (error) {
    console.error('Error en verifyResetToken:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar token'
    });
  }
};

/**
 * Restablecer contraseña con token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar token
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'password']
      }]
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o no encontrado'
      });
    }

    // Verificar si no ha sido usado
    if (resetToken.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Este token ya ha sido utilizado'
      });
    }

    // Verificar si no ha expirado
    if (resetToken.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado. Solicita un nuevo restablecimiento'
      });
    }

    // Verificar que la nueva contraseña no sea igual a la actual
    const samePassword = await bcrypt.compare(newPassword, resetToken.User.password);
    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no puede ser igual a la actual'
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario
    await resetToken.User.update({ password: hashedPassword });

    // Marcar token como usado
    await resetToken.update({ isUsed: true });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña'
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
};