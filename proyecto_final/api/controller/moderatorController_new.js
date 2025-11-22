const { User, Post, Comment, Report, Notification } = require('../models');
const { sequelize, Op } = require('../config/db');
const { registrarBitacora, nivelesCriticidad } = require('../models/hooks/bitacora');

// Obtener todos los reportes
const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, reportType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (reportType) where.reportType = reportType;

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Enriquecer reportes con información adicional
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const reporter = await User.findByPk(report.reporterId, {
          attributes: ['id', 'username']
        });

        let reportedContent = null;
        if (report.reportType === 'post') {
          reportedContent = await Post.findByPk(report.reportedItemId, {
            attributes: ['id', 'titulo']
          });
        } else if (report.reportType === 'comment') {
          reportedContent = await Comment.findByPk(report.reportedItemId, {
            attributes: ['id', 'contenido']
          });
        }

        return {
          ...report.toJSON(),
          reporter: reporter ? { id: reporter.id, username: reporter.username } : null,
          reportedContent
        };
      })
    );

    res.json({
      success: true,
      reports: enrichedReports,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los reportes'
    });
  }
};

// Obtener usuarios inactivos
const getInactiveUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where: {
        estado: 'inactivo'
      },
      attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id'],
          required: false
        },
        {
          model: Comment,
          as: 'comentarios',
          attributes: ['id'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']]
    });

    const enrichedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      postsCount: user.posts ? user.posts.length : 0,
      commentsCount: user.comentarios ? user.comentarios.length : 0
    }));

    res.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios inactivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios inactivos'
    });
  }
};

// Actualizar estado de un reporte
const updateReportStatus = async (req, res) => {
  console.log('🚀 updateReportStatus llamado:', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    moderator: req.moderator ? { id: req.moderator.id, username: req.moderator.username } : null
  });

  try {
    const { id } = req.params;
    const { status, action } = req.body; // action puede ser 'dismiss', 'resolve', 'delete_content'
    const moderatorId = req.moderator.id;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    await report.update({
      status,
      reviewedBy: moderatorId,
      reviewedAt: new Date()
    });

    // Si se solicita eliminar contenido
    if (action === 'delete_content') {
      try {
        if (report.reportType === 'post') {
          const post = await Post.findByPk(report.reportedItemId);
          if (!post) {
            console.log(`❌ Post no encontrado para eliminar: ${report.reportedItemId}`);
            return res.status(404).json({
              success: false,
              message: 'Publicación no encontrada'
            });
          }

          console.log(`🗑️ Eliminando post reportado: ${report.reportedItemId}`);

          // PRIMERO: Obtener los IDs de comentarios ANTES de eliminarlos
          const commentsToDelete = await Comment.findAll({
            where: { PostId: report.reportedItemId },
            attributes: ['id']
          });

          // Eliminar reportes asociados a los comentarios del post (si hay comentarios)
          if (commentsToDelete.length > 0) {
            const commentIds = commentsToDelete.map(c => c.id);
            await Report.destroy({
              where: {
                reportType: 'comment',
                reportedItemId: { [Op.in]: commentIds }
              }
            });
            console.log(`🗑️ Reportes de ${commentIds.length} comentarios asociados eliminados`);
          }

          // SEGUNDO: Eliminar todos los comentarios asociados al post
          await Comment.destroy({
            where: { PostId: report.reportedItemId }
          });
          console.log(`🗑️ Comentarios asociados eliminados`);

          // TERCERO: Eliminar reportes asociados al post
          await Report.destroy({
            where: {
              reportType: 'post',
              reportedItemId: report.reportedItemId
            }
          });
          console.log(`🗑️ Reportes asociados al post eliminados`);

          // CUARTO: Eliminar el post completamente (después de eliminar sus comentarios)
          await post.destroy();
          console.log(`🗑️ Post eliminado exitosamente con destroy()`);

          // Notificar al autor del post
          await Notification.create({
            userId: post.autorId,
            title: 'Publicación Eliminada',
            message: 'Tu publicación ha sido eliminada por un moderador por violar las normas de la comunidad.',
            type: 'content_removed',
            isRead: false,
            relatedPostId: report.reportedItemId
          });

          // Emitir notificación en tiempo real
          if (global.io) {
            global.io.to(`user-${post.autorId}`).emit('new-notification', {
              title: 'Publicación Eliminada',
              message: 'Tu publicación ha sido eliminada por un moderador por violar las normas de la comunidad.',
              type: 'content_removed',
              createdAt: new Date()
            });
          }

        } else if (report.reportType === 'comment') {
          const comment = await Comment.findByPk(report.reportedItemId);
          if (!comment) {
            console.log(`❌ Comentario no encontrado para eliminar: ${report.reportedItemId}`);
            return res.status(404).json({
              success: false,
              message: 'Comentario no encontrado'
            });
          }

          console.log(`🗑️ Eliminando comentario reportado: ${report.reportedItemId}`);

          // Eliminar reportes asociados al comentario
          await Report.destroy({
            where: {
              reportType: 'comment',
              reportedItemId: report.reportedItemId
            }
          });
          console.log(`🗑️ Reportes asociados al comentario eliminados`);

          // Eliminar el comentario completamente
          await comment.destroy();
          console.log(`🗑️ Comentario eliminado exitosamente con destroy()`);

          // Notificar al autor del comentario
          await Notification.create({
            userId: comment.autorId,
            title: 'Comentario Eliminado',
            message: 'Tu comentario ha sido eliminado por un moderador por violar las normas de la comunidad.',
            type: 'content_removed',
            isRead: false,
            relatedCommentId: report.reportedItemId
          });

          // Emitir notificación en tiempo real
          if (global.io) {
            global.io.to(`user-${comment.autorId}`).emit('new-notification', {
              title: 'Comentario Eliminado',
              message: 'Tu comentario ha sido eliminado por un moderador por violar las normas de la comunidad.',
              type: 'content_removed',
              createdAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error al eliminar contenido reportado:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al eliminar el contenido reportado'
        });
      }

      // Si se eliminó contenido, devolver respuesta exitosa inmediatamente
      res.json({
        success: true,
        message: `${report.reportType === 'post' ? 'Publicación' : 'Comentario'} eliminado correctamente`,
        report
      });
      return; // Importante: salir de la función para evitar procesamiento adicional

