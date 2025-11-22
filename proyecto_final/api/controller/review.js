// controller/review.js
const { Review, Post, User } = require('../models');
const { agregarContexto } = require('../middlewares/contextMiddleware');
const { Op } = require('sequelize');

// Obtener reseñas de una receta
const getReviewsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const where = { postId: recipeId };
    if (rating) {
      where.rating = parseInt(rating);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          as: 'user'
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      total: reviews.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(reviews.count / parseInt(limit)),
      reviews: reviews.rows
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error al obtener las reseñas' });
  }
};

// Crear una nueva reseña
const createReview = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const {
      rating,
      title,
      content,
      photos,
      madeIt,
      wouldMakeAgain,
      difficulty,
      timeToMake,
      modifications
    } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
    }

    // Verificar que la receta exista
    const recipe = await Post.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }

    // Verificar que el usuario no haya reseñado antes
    const existingReview = await Review.findOne({
      where: {
        postId: recipeId,
        userId: req.user.id
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Ya has reseñado esta receta' });
    }

    const opciones = agregarContexto(req);

    const review = await Review.create({
      postId: recipeId,
      userId: req.user.id,
      rating,
      title,
      content,
      photos: photos || [],
      madeIt: madeIt || false,
      wouldMakeAgain,
      difficulty,
      timeToMake,
      modifications
    }, opciones);

    // Obtener la reseña con el usuario incluido
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          as: 'user'
        }
      ]
    });

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review: reviewWithUser
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ message: 'Error al crear la reseña' });
  }
};

// Actualizar una reseña
const updateReview = async (req, res) => {
  try {
    const { recipeId, reviewId } = req.params;
    const {
      rating,
      title,
      content,
      photos,
      madeIt,
      wouldMakeAgain,
      difficulty,
      timeToMake,
      modifications
    } = req.body;

    const review = await Review.findOne({
      where: {
        id: reviewId,
        postId: recipeId,
        userId: req.user.id
      }
    });

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
    }

    const opciones = agregarContexto(req);

    await review.update({
      rating,
      title,
      content,
      photos,
      madeIt,
      wouldMakeAgain,
      difficulty,
      timeToMake,
      modifications
    }, opciones);

    // Obtener la reseña actualizada con el usuario
    const updatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          as: 'user'
        }
      ]
    });

    res.json({
      message: 'Reseña actualizada exitosamente',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({ message: 'Error al actualizar la reseña' });
  }
};

// Eliminar una reseña
const deleteReview = async (req, res) => {
  try {
    const { recipeId, reviewId } = req.params;

    const review = await Review.findOne({
      where: {
        id: reviewId,
        postId: recipeId,
        userId: req.user.id
      }
    });

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    const opciones = agregarContexto(req);
    await review.destroy(opciones);

    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ message: 'Error al eliminar la reseña' });
  }
};

// Obtener estadísticas de reseñas de una receta
const getReviewStats = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const stats = await Review.findAll({
      where: { postId: recipeId },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReviews'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating']
      ]
    });

    const ratingDistribution = await Review.findAll({
      where: { postId: recipeId },
      attributes: [
        'rating',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'ASC']]
    });

    const madeItCount = await Review.count({
      where: {
        postId: recipeId,
        madeIt: true
      }
    });

    const wouldMakeAgainCount = await Review.count({
      where: {
        postId: recipeId,
        wouldMakeAgain: true
      }
    });

    const totalReviews = stats[0]?.dataValues.totalReviews || 0;
    const averageRating = stats[0]?.dataValues.averageRating || 0;

    res.json({
      totalReviews,
      averageRating: parseFloat(averageRating).toFixed(1),
      madeItCount,
      wouldMakeAgainCount,
      ratingDistribution: ratingDistribution.map(r => ({
        rating: r.rating,
        count: parseInt(r.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas:', error);
    res.status(500).json({ message: 'Error al obtener las estadísticas' });
  }
};

module.exports = {
  getReviewsByRecipe,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats
};