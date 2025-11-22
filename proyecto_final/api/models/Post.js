const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const { configurarHooksBitacora, nivelesCriticidad } = require('./hooks/bitacora');
const { agregarHooksDV } = require('../services/dvhHooksService');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  autorId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  foto: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  etiquetas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  dificultad: {
    type: DataTypes.ENUM('facil', 'medio', 'dificil'),
    allowNull: true
  },
  porciones: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 50
    }
  },
  tiempoPreparacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo de preparación (valor numérico)'
  },
  tiempoUnidad: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'min',
    comment: 'Unidad del tiempo de preparación (min, horas)'
  },
  tiempoCoccion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo en minutos'
  },
  ingredientes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  instrucciones: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dvh: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 6
    }
  },
  fechaPublicacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0,
    comment: 'Promedio de calificaciones del post'
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total de calificaciones recibidas'
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo',
    allowNull: false,
    comment: 'Estado del post basado en el estado del autor'
  }
}, {
  timestamps: false,
  tableName: 'posts'
});

// Configurar hooks de bitácora para el modelo Post
configurarHooksBitacora(Post, 'Post', {
  criticidad: nivelesCriticidad.contenido, // Operaciones de posts son de contenido
  registrarCreacion: true,
  registrarModificacion: true,
  registrarBorrado: true
});

// Configurar hooks de DVH para el modelo Post
agregarHooksDV(Post, 'posts');

// Definir asociaciones
Post.associate = (models) => {
    Post.hasMany(models.Favorite, {
        foreignKey: 'postId',
        as: 'favorites'
    });
};

module.exports = {
  Post
};