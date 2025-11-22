  // Si se descarta el reporte, eliminar el contenido automáticamente
    if (status === 'dismissed') {
      try {
        console.log(`🗑️ Descartando reporte ${id} y eliminando contenido automáticamente`);

        if (report.reportType === 'post') {
          const post = await Post.findByPk(report.reportedItemId);
          if (!post) {
            console.log(`❌ Post no encontrado para eliminar: ${report.reportedItemId}`);
          } else {
            console.log(`🗑️ Eliminando post automáticamente (status dismissed): ${report.reportedItemId}`);

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

            // TERCERO: Eliminar reportes asociados al post (incluyendo el actual)
            await Report.destroy({
              where: {
                reportType: 'post',
                reportedItemId: report.reportedItemId
              }
            });
            console.log(`🗑️ Reportes asociados al post eliminados`);

            // CUARTO: Eliminar el post completamente (después de eliminar sus comentarios)
            await post.destroy();
            console.log(`🗑️ Post eliminado exitosamente por dismiss`);

            // Notificar al autor del post
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
          }
        } else if (report.reportType === 'comment') {
          const comment = await Comment.findByPk(report.reportedItemId);
          if (!comment) {
            console.log(`❌ Comentario no encontrado para eliminar: ${report.reportedItemId}`);
          } else {
            console.log(`🗑️ Eliminando comentario automáticamente (status dismissed): ${report.reportedItemId}`);

            // Eliminar reportes asociados al comentario (incluyendo el actual)
            await Report.destroy({
              where: {
                reportType: 'comment',
                reportedItemId: report.reportedItemId
              }
            });
            console.log(`🗑️ Reportes asociados al comentario eliminados`);

            // Eliminar el comentario completamente
            await comment.destroy();
            console.log(`🗑️ Comentario eliminado exitosamente por dismiss`);

            // Notificar al autor del comentario
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
          }
        }

        // Si se eliminó contenido por dismiss, devolver respuesta exitosa inmediatamente
        res.json({
          success: true,
          message: `${report.reportType === 'post' ? 'Publicación' : 'Comentario'} eliminado automáticamente por dismiss`,
          report
        });
        return; // Importante: salir de la función para evitar procesamiento adicional

      } catch (error) {
        console.error('Error al eliminar contenido automáticamente por dismiss:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al eliminar el contenido automáticamente'
        });
      }
    }