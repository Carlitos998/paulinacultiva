const { sequelize } = require("../config/db");
const { DataTypes } = require('sequelize');
const { configurarHooksBitacora, nivelesCriticidad } = require('./hooks/bitacora');
const { agregarHooksDV } = require('./hooks/UpdateDV');

const Comment = sequelize.define('Comentario', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    PostId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    autorId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fechaComentario: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        defaultValue: 'activo',
        allowNull: false,
        comment: 'Estado del comentario basado en el estado del autor'
    }
}, {
    timestamps: true,
    tableName: 'comentarios'
});

// Configurar hooks de bitácora para el modelo Comentario
configurarHooksBitacora(Comment, 'Comentario', {
    criticidad: nivelesCriticidad.contenido, // Operaciones de comentarios son de contenido
    registrarCreacion: true,
    registrarModificacion: true,
    registrarBorrado: true
});

// Configurar hooks de DVH para el modelo Comentario
agregarHooksDV(Comment, 'comentarios');

// Definir asociaciones
Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
        foreignKey: 'autorId',
        as: 'autor'
    });
    Comment.belongsTo(models.Post, {
        foreignKey: 'PostId',
        as: 'post'
    });
};

module.exports = {
    Comment
};