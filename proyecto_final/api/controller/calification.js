const { Calification } = require("../models/Calification");
const NotificationService = require('../services/notificationService');

const calificatePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const { score } = req.body;

  if (!score || score < 1 || score > 5) {
    return res.status(400).json({ error: "La puntuación debe estar entre 1 y 5." });
  }

  try {
    const existing = await Calification.findOne({
      where: { userId, postId }
    });

    if (existing) {
      existing.score = score;
      await existing.save();
    } else {
      await Calification.create({ userId, postId, score });
    }

    // Calcular el promedio y total de calificaciones para este post
    const allCalifications = await Calification.findAll({
      where: { postId }
    });

    const totalRatings = allCalifications.length;
    const averageRating = totalRatings > 0
      ? allCalifications.reduce((sum, cal) => sum + cal.score, 0) / totalRatings
      : 0;

    // Obtener información del post para notificación
    const { Post } = require('../models');
    const post = await Post.findByPk(postId);

    // Opcional: Actualizar el post con las estadísticas
    await Post.update(
      {
        averageRating: averageRating.toFixed(1),
        totalRatings: totalRatings
      },
      { where: { id: postId } }
    );

    // Crear notificación si es la primera calificación del usuario
    if (!existing && post && post.autorId !== userId) {
      await NotificationService.notifyUser(
        post.autorId,
        'Nueva calificación en tu receta',
        `Alguien ha calificado tu receta "${post.titulo}" con ${score} estrella${score !== 1 ? 's' : ''}`,
        'rating',
        userId,
        postId
      );
    }

    console.log(`📊 Calificación guardada - Post ${postId}: ${averageRating.toFixed(1)} (${totalRatings} calificaciones)`);

    res.status(201).json({
      message: existing ? "Calificación actualizada con éxito" : "Post calificado con éxito",
      postId,
      userId,
      score,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings
    });
  } catch (error) {
    console.error('❌ Error al guardar calificación:', error);
    res.status(500).json({ error: "Error al guardar la calificación" });
  }
};

const getUserRating = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const userRating = await Calification.findOne({
      where: { userId, postId }
    });

    // Calcular estadísticas generales del post
    const allCalifications = await Calification.findAll({
      where: { postId }
    });

    const totalRatings = allCalifications.length;
    const averageRating = totalRatings > 0
      ? allCalifications.reduce((sum, cal) => sum + cal.score, 0) / totalRatings
      : 0;

    res.json({
      userRating: userRating ? userRating.score : 0,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings
    });
  } catch (error) {
    console.error('❌ Error al obtener calificación del usuario:', error);
    res.status(500).json({ error: "Error al obtener la calificación" });
  }
};

module.exports = {
  calificatePost,
  getUserRating
};
