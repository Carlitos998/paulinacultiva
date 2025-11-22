const { Report, User, Post, Comment, Notification } = require('../models');

// Crear un nuevo reporte
const createReport = async (req, res) => {
  try {
    // Extraer parámetros del body y params
    const { reason, description } = req.body;
    const { postId, commentId } = req.params;
    const reporterId = req.user.id;

    // Determinar tipo de reporte e ID basado en los parámetros
    let reportType, reportedItemId, itemName;

    console.log('🔍 Debug reporte:', { postId, commentId, body: req.body, params: req.params });

    if (commentId) {
      reportType = 'comment';
      reportedItemId = commentId;
      // Obtener información del comentario para el nombre
      try {
        const comment = await Comment.findByPk(commentId);
        itemName = comment ? `Comentario de ${comment.contenido?.substring(0, 30)}...` : 'Comentario';
      } catch (error) {
        itemName = 'Comentario';
      }
      console.log('📝 Reportando comentario:', { reportType, reportedItemId, itemName });
    } else if (postId) {
      reportType = 'post';
      reportedItemId = postId;
      // Obtener información de la publicación para el nombre
      try {
        const post = await Post.findByPk(reportedItemId);
        itemName = post ? `Publicación: ${post.titulo}` : 'Publicación';
      } catch (error) {
        itemName = 'Publicación';
      }
      console.log('📄 Reportando publicación:', { reportType, reportedItemId, itemName });
    } else {
      return res.status(400).json({
        success: false,
        message: 'No se pudo identificar el contenido a reportar'
      });
    }

    // Validar que no exista un reporte previo del mismo usuario para el mismo item
    console.log(`🔍 Buscando reportes existentes para:`, { reporterId, reportType, reportedItemId });

    const existingReport = await Report.findOne({
      where: {
        reporterId,
        reportType,
        reportedItemId,
        status: ['pending', 'resolved'] // Solo considerar duplicados los reportes activos o resueltos
      }
    });

    console.log(`📋 Reporte existente encontrado:`, existingReport ? {
      id: existingReport.id,
      createdAt: existingReport.createdAt,
      status: existingReport.status
    } : 'No se encontraron reportes existentes');

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reportado este contenido anteriormente'
      });
    }

    // Verificar que el contenido existe
    console.log(`🔍 Verificando existencia del contenido:`, { reportType, reportedItemId });

    let content;
    if (reportType === 'post') {
      content = await Post.findByPk(reportedItemId);
      console.log(`📄 Post encontrado:`, content ? {
        id: content.id,
        titulo: content.titulo,
        estado: content.estado
      } : 'Post no encontrado');
    } else if (reportType === 'comment') {
      content = await Comment.findByPk(reportedItemId);
      console.log(`💬 Comentario encontrado:`, content ? {
        id: content.id,
        contenido: content.contenido?.substring(0, 50),
        estado: content.estado
      } : 'Comentario no encontrado');
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'El contenido reportado no existe'
      });
    }

    // Validar datos requeridos
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'La razón del reporte es obligatoria'
      });
    }

    console.log(`📋 Creando reporte:`, { reporterId, reportType, reportedItemId, reason, description });

    // Crear el reporte
    const report = await Report.create({
      reporterId,
      reportType,
      reportedItemId,
      reason,
      description
    });

    console.log(`✅ Reporte creado exitosamente:`, { id: report.id, createdAt: report.createdAt });

    // Obtener información del reportante para la notificación
    const reporterUser = await User.findByPk(reporterId);

    // Crear notificaciones para todos los moderadores
    const moderatorUsers = await User.findAll({
      where: { role: 'moderator', estado: 'activo' }
    });

    const notifications = moderatorUsers.map(moderator => ({
      userId: moderator.id,
      title: 'Nuevo Reporte de Contenido',
      message: `${reporterUser?.username || 'Usuario'} ha reportado: ${itemName} - Razón: ${reason}`,
      type: 'report',
      isRead: false,
      relatedUserId: reporterId,
      relatedPostId: reportType === 'post' ? reportedItemId : null,
      relatedCommentId: reportType === 'comment' ? reportedItemId : null
    }));

    // Crear notificaciones para admins
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);

      // Emitir notificaciones en tiempo real a los admins
      if (global.io) {
        notifications.forEach(notification => {
          global.io.to(`user-${notification.userId}`).emit('new-notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            createdAt: new Date()
          });
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente',
      report
    });

  } catch (error) {
    console.error('❌ Error al crear reporte:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      details: error
    });

    // Enviar información detallada del error
    res.status(500).json({
      success: false,
      message: 'Error al crear el reporte',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener todos los reportes (solo para administradores)
const getAllReports = async (req, res) => {
  try {
    const { status, reportType, page = 1, limit = 10 } = req.query;
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

    res.json({
      success: true,
      reports,
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

// Actualizar estado de un reporte (solo para administradores)
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;
    const reviewerId = req.user.id;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    await report.update({
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Estado del reporte actualizado correctamente',
      report
    });

  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el reporte'
    });
  }
};

// Obtener estadísticas de reportes (solo para administradores)
const getReportStats = async (req, res) => {
  try {
    const stats = await Report.findAll({
      attributes: [
        'status',
        'reportType',
        'reason',
        [Report.sequelize.fn('COUNT', Report.sequelize.col('id')), 'count']
      ],
      group: ['status', 'reportType', 'reason'],
      order: [[Report.sequelize.fn('COUNT', Report.sequelize.col('id')), 'DESC']]
    });

    const totalReports = await Report.count();
    const pendingReports = await Report.count({ where: { status: 'pending' } });

    res.json({
      success: true,
      stats,
      total: totalReports,
      pending: pendingReports
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de reportes'
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
  getReportStats
};