const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');

const Bitacora = sequelize.define('Bitacora', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entidad: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entidad_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  antes: {
    type: DataTypes.JSON,
    allowNull: true
  },
  despues: {
    type: DataTypes.JSON,
    allowNull: true
  },
  criticidad: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'bitacora'
});

module.exports = {
  Bitacora
};