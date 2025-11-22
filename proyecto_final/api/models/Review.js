// models/Review.js
const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const { configurarHooksBitacora, nivelesCriticidad } = require('./hooks/bitacora');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  postId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'La calificación mínima es 1'
      },
      max: {
        args: 5,
        msg: 'La calificación máxima es 5'
      }
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  madeIt: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  wouldMakeAgain: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('muy_facil', 'facil', 'medio', 'dificil', 'muy_dificil'),
    allowNull: true
  },
  timeToMake: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo en minutos que le tomó prepararlo'
  },
  modifications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Modificaciones que hizo a la receta'
  }
}, {
  timestamps: true,
  tableName: 'Reviews'
});

// Configurar hooks de bitácora para el modelo Review
configurarHooksBitacora(Review, 'Review', {
  criticidad: nivelesCriticidad.contenido, // Operaciones de reseñas son de contenido
  registrarCreacion: true,
  registrarModificacion: true,
  registrarBorrado: true
});

module.exports = {
  Review
};