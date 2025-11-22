const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware para verificar el token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'paulina-cultiva-secret');

    // Obtener el usuario desde la base de datos
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuario no encontrado'
      });
    }

    // Agregar información del usuario al request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    console.error('Error en authenticateToken:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

/**
 * Middleware opcional para verificar token sin fallar si no existe
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'paulina-cultiva-secret');
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    req.user = user || null;
    req.userId = user ? user.id : null;

    next();
  } catch (error) {
    // En caso de error, continuamos sin usuario autenticado
    req.user = null;
    req.userId = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};