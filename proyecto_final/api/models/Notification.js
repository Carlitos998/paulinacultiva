// models/Notification.js
const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const { agregarHooksDV } = require('../services/dvhHooksService');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'ID del usuario que recibe la notificación'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El título de la notificación no puede estar vacío'
      },
      len: {
        args: [1, 255],
        msg: 'El título debe tener entre 1 y 255 caracteres'
      }
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El mensaje de la notificación no puede estar vacío'
      },
      len: {
        args: [1, 1000],
        msg: 'El mensaje debe tener entre 1 y 1000 caracteres'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'friend_request', 'friend_accept', 'system', 'favorite', 'rating'),
    allowNull: false,
    defaultValue: 'system',
    comment: 'Tipo de notificación'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si la notificación ha sido leída'
  },
  relatedUserId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: 'ID del usuario relacionado con la notificación (quién dio like, comentó, etc.)'
  },
  relatedPostId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: 'ID del post relacionado con la notificación'
  },
  relatedCommentId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: 'ID del comentario relacionado con la notificación'
  },
  dvh: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 6
    }
  }
}, {
  timestamps: true,
  tableName: 'Notifications',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['isRead']
    },
    {
      fields: ['type']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Configurar hooks de DVH para el modelo Notification
agregarHooksDV(Notification, 'notifications');

// Definir asociaciones
Notification.associate = (models) => {
  // Relación con el usuario que recibe la notificación
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Relación con el usuario relacionado (quién realiza la acción)
  Notification.belongsTo(models.User, {
    foreignKey: 'relatedUserId',
    as: 'relatedUser'
  });

  // Relación con el post relacionado
  Notification.belongsTo(models.Post, {
    foreignKey: 'relatedPostId',
    as: 'post'
  });

  // Relación con el comentario relacionado
  Notification.belongsTo(models.Comment, {
    foreignKey: 'relatedCommentId',
    as: 'comment'
  });
};

module.exports = Notification;
module.exports.Notification = Notification;