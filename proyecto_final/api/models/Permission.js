const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const { configurarHooksBitacora, nivelesCriticidad } = require('./hooks/bitacora');
const { agregarHooksDV } = require('./hooks/UpdateDV');

const Permiso = sequelize.define('Permiso', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes.STRING,
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
  }
}, {
  timestamps: true,
  tableName: 'permisos'
});

// Configurar hooks de bitácora para el modelo Permiso
configurarHooksBitacora(Permiso, 'Permiso', {
  criticidad: nivelesCriticidad.administracion, // Operaciones de permisos son administrativas
  registrarCreacion: true,
  registrarModificacion: true,
  registrarBorrado: true
});

// Configurar hooks de DVH para el modelo Permiso
agregarHooksDV(Permiso, 'permisos');

module.exports = {
  Permiso
};