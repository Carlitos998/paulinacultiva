// models/Category.js
const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const { configurarHooksBitacora, nivelesCriticidad } = require('./hooks/bitacora');
const { agregarHooksDV } = require('./hooks/UpdateDV');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El nombre de la categoría no puede estar vacío'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '🍳'
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#f97316'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'categories'
});

// Configurar hooks de bitácora para el modelo Category
configurarHooksBitacora(Category, 'Category', {
  criticidad: nivelesCriticidad.administracion, // Operaciones de categorías son administrativas
  registrarCreacion: true,
  registrarModificacion: true,
  registrarBorrado: true
});

// Configurar hooks de DVH para el modelo Category
agregarHooksDV(Category, 'categories');

module.exports = {
  Category
};