const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
} = require('../controller/notificationController');
const { isAuth } = require('../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(isAuth);

/**
 * @route   GET /api/notifications
 * @desc    Obtener todas las notificaciones del usuario
 * @access  Private
 * @query   page, limit, unread
 */
router.get('/', getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtener contador de notificaciones no leídas
 * @access  Private
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificación como leída
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Eliminar notificación específica
 * @access  Private
 */
router.delete('/:id', deleteNotification);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Eliminar todas las notificaciones leídas
 * @access  Private
 */
router.delete('/read', deleteReadNotifications);

module.exports = router;