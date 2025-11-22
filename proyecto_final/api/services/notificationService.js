// services/notificationService.js
const {
  createLikeNotification,
  createCommentNotification,
  createFriendRequestNotification,
  createFriendAcceptedNotification
} = require('../controller/notificationController');

/**
 * Servicio para facilitar la creación de notificaciones desde otros controladores
 */
class NotificationService {
  /**
   * Crear notificación cuando un usuario da like a un post
   */
  static async notifyPostLike(postAuthorId, postId, userIdLiking) {
    try {
      await createLikeNotification(postAuthorId, postId, userIdLiking);
      console.log(`✅ Notificación de like creada para usuario ${postAuthorId}`);
    } catch (error) {
      console.error('❌ Error al crear notificación de like:', error);
    }
  }

  /**
   * Crear notificación cuando un usuario comenta un post
   */
  static async notifyPostComment(postAuthorId, postId, commentId, userIdCommenting) {
    try {
      await createCommentNotification(postAuthorId, postId, commentId, userIdCommenting);
      console.log(`✅ Notificación de comentario creada para usuario ${postAuthorId}`);
    } catch (error) {
      console.error('❌ Error al crear notificación de comentario:', error);
    }
  }

  
  /**
   * Crear notificación personalizada
   */
  static async notifyUser(userId, title, message, type = 'system', relatedUserId = null, relatedPostId = null, relatedCommentId = null) {
    try {
      const { createNotification } = require('../controller/notificationController');
      await createNotification(userId, title, message, type, relatedUserId, relatedPostId, relatedCommentId);
      console.log(`✅ Notificación personalizada creada para usuario ${userId}`);
    } catch (error) {
      console.error('❌ Error al crear notificación personalizada:', error);
    }
  }
}

module.exports = NotificationService;