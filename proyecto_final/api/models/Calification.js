const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const { configurarHooksBitacora, nivelesCriticidad } = require('./hooks/bitacora');
const { agregarHooksDV } = require('./hooks/UpdateDV');


const Calification = sequelize.define('Calificacion', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
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
    modelName: 'Calificacion',
    tableName: 'calificaciones'
});

// Configurar hooks de bitácora para el modelo Calificacion
configurarHooksBitacora(Calification, 'Calificacion', {
    criticidad: nivelesCriticidad.contenido, // Operaciones de calificación son de contenido
    registrarCreacion: true,
    registrarModificacion: true,
    registrarBorrado: true
});

// Configurar hooks de DVH para el modelo Calificacion
agregarHooksDV(Calification, 'calificaciones');

module.exports = {
    Calification
};