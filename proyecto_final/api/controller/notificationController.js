// controller/notificationController.js
const { Notification, User, Post, Comment } = require('../models');

// Función helper para crear notificaciones con emisión en tiempo real
const createNotification = async (userId, title, message, type = 'system',
                                   relatedUserId = null, relatedPostId = null,
                                   relatedCommentId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedUserId,
      relatedPostId,
      relatedCommentId
    });

    // Emitir notificación en tiempo real con Socket.IO
    if (global.io && global.io.to) {
      global.io.to(`user-${userId}`).emit('new-notification', {
        id: notification.id,
        title,
        message,
        type,
        relatedUserId,
        relatedPostId,
        relatedCommentId,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

// Obtener todas las notificaciones del usuario
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread = false } = req.query;

    const whereClause = { userId };
    if (unread === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'relatedUser',
          attributes: ['id', 'username'],
          required: false
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'titulo'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      page: parseInt(page),
      totalPages: Math.ceil(notifications.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener contador de notificaciones no leídas
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error al obtener contador de no leídas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    await notification.update({ isRead: true });

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Marcar todas las notificaciones como leídas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({ message: 'Todas las notificaciones han sido marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar notificación
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    await notification.destroy();

    res.json({ message: 'Notificación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar notificaciones leídas
const deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedCount = await Notification.destroy({
      where: {
        userId,
        isRead: true
      }
    });

    res.json({
      message: `${deletedCount} notificaciones leídas eliminadas`,
      deletedCount
    });
  } catch (error) {
    console.error('Error al eliminar notificaciones leídas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear notificación de like
const createLikeNotification = async (postAuthorId, postId, userIdLiking) => {
  try {
    const userLiking = await User.findByPk(userIdLiking);
    const post = await Post.findByPk(postId);

    if (userLiking && post && postAuthorId !== userIdLiking) {
      await createNotification(
        postAuthorId,
        'Nuevo like en tu receta',
        `${userLiking.username} le dio like a tu receta "${post.titulo}"`,
        'like',
        userIdLiking,
        postId
      );
    }
  } catch (error) {
    console.error('Error al crear notificación de like:', error);
  }
};

// Crear notificación de comentario
const createCommentNotification = async (postAuthorId, postId, commentId, userIdCommenting) => {
  try {
    const userCommenting = await User.findByPk(userIdCommenting);
    const post = await Post.findByPk(postId);

    if (userCommenting && post && postAuthorId !== userIdCommenting) {
      await createNotification(
        postAuthorId,
        'Nuevo comentario en tu receta',
        `${userCommenting.username} comentó en tu receta "${post.titulo}"`,
        'comment',
        userIdCommenting,
        postId,
        commentId
      );
    }
  } catch (error) {
    console.error('Error al crear notificación de comentario:', error);
  }
};

// Crear notificación de solicitud de amistad
const createFriendRequestNotification = async (userId, requesterId) => {
  try {
    const requester = await User.findByPk(requesterId);

    if (requester) {
      await createNotification(
        userId,
        'Nueva solicitud de amistad',
        `${requester.username} te ha enviado una solicitud de amistad`,
        'friend_request',
        requesterId
      );
    }
  } catch (error) {
    console.error('Error al crear notificación de solicitud de amistad:', error);
  }
};

// Crear notificación de amistad aceptada
const createFriendAcceptedNotification = async (userId, friendId) => {
  try {
    const friend = await User.findByPk(friendId);

    if (friend) {
      await createNotification(
        userId,
        'Solicitud de amistad aceptada',
        `${friend.username} ha aceptado tu solicitud de amistad`,
        'friend_accept',
        friendId
      );
    }
  } catch (error) {
    console.error('Error al crear notificación de amistad aceptada:', error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  createLikeNotification,
  createCommentNotification,
  createFriendRequestNotification,
  createFriendAcceptedNotification
};