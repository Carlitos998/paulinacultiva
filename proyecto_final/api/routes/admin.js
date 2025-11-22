const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin, isAuth } = require('../middlewares/auth');

// Middleware que verifica que sea administrador
const adminOnly = [authenticateToken, isAuth, isAdmin];

/**
 * @route   GET /api/admin/users
 * @desc    Obtener todos los usuarios con paginación y filtros
 * @access  Admin
 */
router.get('/users', adminOnly, adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Obtener estadísticas de usuarios
 * @access  Admin
 */
router.get('/users/stats', adminOnly, adminController.getUserStats);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Eliminar un usuario y todos sus datos
 * @access  Admin
 */
router.delete('/users/:userId', adminOnly, adminController.deleteUser);

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Cambiar el estado de un usuario
 * @access  Admin
 */
router.put('/users/:userId/status', adminOnly, adminController.changeUserStatus);

/**
 * @route   DELETE /api/admin/users/bulk
 * @desc    Eliminar usuarios masivamente
 * @access  Admin
 */
router.delete('/users/bulk', adminOnly, adminController.bulkDeleteUsers);

module.exports = router;