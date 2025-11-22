const { User, Post, Comment, Report, Notification } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
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
    }

    // Si se descarta el reporte, eliminar el contenido automáticamente
    if (status === 'dismissed') {
      try {
        console.log(`🗑️ Descartando reporte ${id} y eliminando contenido automáticamente`);

        if (report.reportType === 'post') {
          const post = await Post.findByPk(report.reportedItemId);
          if (!post) {
            console.log(`❌ Post no encontrado para eliminar: ${report.reportedItemId}`);
            return res.status(404).json({
              success: false,
              message: 'Publicación no encontrada'
            });
          }

          console.log(`🗑️ Eliminando post automáticamente (status dismissed): ${report.reportedItemId}`);

          // Iniciar transacción para garantizar consistencia
          const t = await sequelize.transaction();

          try {
            // 1. Obtener comentarios asociados al post
            const comments = await Comment.findAll({
              where: { PostId: report.reportedItemId },
              transaction: t,
              attributes: ['id']
            });

            const commentIds = comments.map(c => c.id);

            // 2. Eliminar reportes de comentarios asociados
            if (commentIds.length > 0) {
              await Report.destroy({
                where: {
                  reportType: 'comment',
                  reportedItemId: { [Op.in]: commentIds }
                },
                transaction: t
              });
              console.log(`🗑️ Eliminados ${commentIds.length} reportes de comentarios`);
            }

            // 3. Eliminar comentarios del post
            await Comment.destroy({
              where: { PostId: report.reportedItemId },
              transaction: t
            });
            console.log(`🗑️ Eliminados comentarios del post`);

            // 4. Eliminar todos los reportes del post (incluyendo el actual)
            await Report.destroy({
              where: {
                reportType: 'post',
                reportedItemId: report.reportedItemId
              },
              transaction: t
            });
            console.log(`🗑️ Eliminados reportes del post`);

            // 5. Eliminar el post
            await post.destroy({ transaction: t });
            console.log(`🗑️ Post eliminado exitosamente`);

            // Confirmar transacción
            await t.commit();

            // Notificar al autor del post
            try {
              await Notification.create({
                userId: post.autorId,
                title: 'Publicación Eliminada',
                message: 'Tu publicación ha sido eliminada por violar las normas de la comunidad.',
                type: 'content_removed',
                isRead: false,
                relatedPostId: report.reportedItemId
              });

              // Emitir notificación en tiempo real
              if (global.io) {
                global.io.to(`user-${post.autorId}`).emit('new-notification', {
                  title: 'Publicación Eliminada',
                  message: 'Tu publicación ha sido eliminada por violar las normas de la comunidad.',
                  type: 'content_removed',
                  createdAt: new Date()
                });
              }
            } catch (notifError) {
              console.error('Error al enviar notificación:', notifError);
              // No fallar si la notificación falla
            }

          } catch (transactionError) {
            await t.rollback();
            throw transactionError;
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

          console.log(`🗑️ Eliminando comentario automáticamente (status dismissed): ${report.reportedItemId}`);

          // Iniciar transacción
          const t = await sequelize.transaction();

          try {
            // 1. Eliminar reportes del comentario (incluyendo el actual)
            await Report.destroy({
              where: {
                reportType: 'comment',
                reportedItemId: report.reportedItemId
              },
              transaction: t
            });
            console.log(`🗑️ Eliminados reportes del comentario`);

            // 2. Eliminar el comentario
            await comment.destroy({ transaction: t });
            console.log(`🗑️ Comentario eliminado exitosamente`);

            // Confirmar transacción
            await t.commit();

            // Notificar al autor del comentario
            try {
              await Notification.create({
                userId: comment.autorId,
                title: 'Comentario Eliminado',
                message: 'Tu comentario ha sido eliminado por violar las normas de la comunidad.',
                type: 'content_removed',
                isRead: false,
                relatedCommentId: report.reportedItemId
              });

              // Emitir notificación en tiempo real
              if (global.io) {
                global.io.to(`user-${comment.autorId}`).emit('new-notification', {
                  title: 'Comentario Eliminado',
                  message: 'Tu comentario ha sido eliminado por violar las normas de la comunidad.',
                  type: 'content_removed',
                  createdAt: new Date()
                });
              }
            } catch (notifError) {
              console.error('Error al enviar notificación:', notifError);
              // No fallar si la notificación falla
            }

          } catch (transactionError) {
            await t.rollback();
            throw transactionError;
          }
        }

        // Devolver respuesta exitosa
        res.json({
          success: true,
          message: `${report.reportType === 'post' ? 'Publicación' : 'Comentario'} eliminado correctamente por dismiss`,
          report
        });
        return;

      } catch (error) {
        console.error('Error al eliminar contenido automáticamente por dismiss:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al eliminar el contenido automáticamente',
          error: error.message
        });
      }
    }

    // Si se resuelve el reporte, quitar el estado de reportado del contenido
    if (status === 'resolved') {
      try {
        if (report.reportType === 'post') {
          await Post.update(
            { reported: false },
            { where: { id: report.reportedItemId } }
          );
        } else if (report.reportType === 'comment') {
          await Comment.update(
            { reported: false },
            { where: { id: report.reportedItemId } }
          );
        }
      } catch (error) {
        console.error('Error al quitar estado de reportado:', error);
      }
    }

    // Enviar notificación al usuario que reportó
    try {
      await Notification.create({
        userId: report.reporterId,
        title: 'Reporte Revisado',
        message: 'Tu reporte ha sido revisado por el equipo de moderación. Gracias por tu colaboración.',
        type: 'report_reviewed',
        isRead: false,
        relatedPostId: report.reportType === 'post' ? report.reportedItemId : null,
        relatedCommentId: report.reportType === 'comment' ? report.reportedItemId : null
      });

      // Emitir notificación en tiempo real
      if (global.io) {
        global.io.to(`user-${report.reporterId}`).emit('new-notification', {
          title: 'Reporte Revisado',
          message: 'Tu reporte ha sido revisado por el equipo de moderación. Gracias por tu colaboración.',
          type: 'report_reviewed',
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error al enviar notificación al reportante:', error);
    }

    res.json({
      success: true,
      message: 'Reporte actualizado correctamente',
      report
    });

  } catch (error) {
    console.error('Error en updateReportStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el reporte'
    });
  }
};

// Cambiar estado de usuario (toggleUserStatus)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'activate' o 'deactivate'
    const moderatorId = req.moderator.id;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const newStatus = action === 'activate' ? 'activo' : 'inactivo';

    await user.update({
      estado: newStatus,
      updatedAt: new Date()
    });

    // Registrar en bitácora
    await registrarBitacora(
      moderatorId,
      `Usuario ${user.username} ${action === 'activate' ? 'activado' : 'desactivado'}`,
      'moderation',
      nivelesCriticidad.MEDIA
    );

    // Notificar al usuario
    await Notification.create({
      userId: user.id,
      title: `Cuenta ${action === 'activate' ? 'Activada' : 'Desactivada'}`,
      message: `Tu cuenta ha sido ${action === 'activate' ? 'activada' : 'desactivada'} por un moderador.`,
      type: 'account_status',
      isRead: false
    });

    res.json({
      success: true,
      message: `Usuario ${action === 'activate' ? 'activado' : 'desactivado'} correctamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario'
    });
  }
};

// Eliminar contenido directamente
const deleteContent = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'post' o 'comment', id: ID del contenido
    const moderatorId = req.moderator.id;

    if (type === 'post') {
      const post = await Post.findByPk(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Publicación no encontrada'
        });
      }

      // Obtener comentarios asociados
      const comments = await Comment.findAll({
        where: { PostId: id },
        attributes: ['id']
      });

      // Iniciar transacción
      const t = await sequelize.transaction();

      try {
        // Eliminar reportes de comentarios
        if (comments.length > 0) {
          const commentIds = comments.map(c => c.id);
          await Report.destroy({
            where: {
              reportType: 'comment',
              reportedItemId: { [Op.in]: commentIds }
            },
            transaction: t
          });
        }

        // Eliminar comentarios
        await Comment.destroy({
          where: { PostId: id },
          transaction: t
        });

        // Eliminar reportes del post
        await Report.destroy({
          where: {
            reportType: 'post',
            reportedItemId: id
          },
          transaction: t
        });

        // Eliminar post
        await post.destroy({ transaction: t });
        await t.commit();

      } catch (error) {
        await t.rollback();
        throw error;
      }

    } else if (type === 'comment') {
      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
      }

      // Iniciar transacción
      const t = await sequelize.transaction();

      try {
        // Eliminar reportes del comentario
        await Report.destroy({
          where: {
            reportType: 'comment',
            reportedItemId: id
          },
          transaction: t
        });

        // Eliminar comentario
        await comment.destroy({ transaction: t });
        await t.commit();

      } catch (error) {
        await t.rollback();
        throw error;
      }
    }

    res.json({
      success: true,
      message: `${type === 'post' ? 'Publicación' : 'Comentario'} eliminado correctamente`
    });

  } catch (error) {
    console.error('Error al eliminar contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el contenido'
    });
  }
};

// Obtener estadísticas del moderador
const getModeratorStats = async (req, res) => {
  try {
    const [
      pendingReports,
      totalReports,
      inactiveUsers,
      totalUsers
    ] = await Promise.all([
      Report.count({ where: { status: 'pending' } }),
      Report.count(),
      User.count({ where: { estado: 'inactivo' } }),
      User.count()
    ]);

    res.json({
      success: true,
      stats: {
        pendingReports,
        totalReports,
        inactiveUsers,
        totalUsers
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

// Alias para compatibilidad con index.js
const handleToggleUserStatus = toggleUserStatus;
const handleDeleteContent = deleteContent;

// Exportar funciones
module.exports = {
  getReports,
  getInactiveUsers,
  updateReportStatus,
  toggleUserStatus,
  deleteContent,
  getModeratorStats,
  handleToggleUserStatus,
  handleDeleteContent
};