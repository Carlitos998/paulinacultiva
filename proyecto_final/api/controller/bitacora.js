// controller/bitacora.js
const { Bitacora } = require('../models/Bitacora');

// Obtener todos los registros de la bitácora
const getBitacora = async (req, res) => {
  try {
    const { limite = 50, pagina = 1, entidad, accion, criticidad } = req.query;

    // Construir filtro where
    const where = {};
    if (entidad) where.entidad = entidad;
    if (accion) where.accion = accion;
    if (criticidad) where.criticidad = parseInt(criticidad);

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const registros = await Bitacora.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: registros.count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(registros.count / parseInt(limite)),
      datos: registros.rows
    });
  } catch (error) {
    console.error('Error al obtener bitácora:', error);
    res.status(500).json({ message: 'Error al obtener registros de bitácora' });
  }
};

// Obtener un registro específico de la bitácora
const getBitacoraById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await Bitacora.findByPk(id);

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener registro de bitácora:', error);
    res.status(500).json({ message: 'Error al obtener el registro' });
  }
};

// Limpiar registros antiguos de la bitácora
const limpiarBitacora = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));

    const resultado = await Bitacora.destroy({
      where: {
        createdAt: {
          [require('sequelize').Op.lt]: fechaLimite
        }
      }
    });

    res.json({
      message: `Se eliminaron ${resultado} registros antiguos`,
      registrosEliminados: resultado
    });
  } catch (error) {
    console.error('Error al limpiar bitácora:', error);
    res.status(500).json({ message: 'Error al limpiar registros de bitácora' });
  }
};

// Obtener estadísticas de la bitácora
const getEstadisticas = async (req, res) => {
  try {
    // Total de registros
    const total = await Bitacora.count();

    // Registros por entidad
    const porEntidad = await Bitacora.findAll({
      attributes: [
        'entidad',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'cantidad']
      ],
      group: ['entidad'],
      order: [[require('sequelize').literal('cantidad'), 'DESC']]
    });

    // Registros por acción
    const porAccion = await Bitacora.findAll({
      attributes: [
        'accion',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'cantidad']
      ],
      group: ['accion'],
      order: [[require('sequelize').literal('cantidad'), 'DESC']]
    });

    // Registros por criticidad
    const porCriticidad = await Bitacora.findAll({
      attributes: [
        'criticidad',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'cantidad']
      ],
      group: ['criticidad'],
      order: ['criticidad']
    });

    // Registros de las últimas 24 horas
    const ultimas24h = new Date();
    ultimas24h.setHours(ultimas24h.getHours() - 24);

    const ultimas24hCount = await Bitacora.count({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: ultimas24h
        }
      }
    });

    res.json({
      total,
      ultimas24h: ultimas24hCount,
      porEntidad: porEntidad.map(r => ({
        entidad: r.entidad,
        cantidad: parseInt(r.dataValues.cantidad)
      })),
      porAccion: porAccion.map(r => ({
        accion: r.accion,
        cantidad: parseInt(r.dataValues.cantidad)
      })),
      porCriticidad: porCriticidad.map(r => ({
        criticidad: r.criticidad,
        cantidad: parseInt(r.dataValues.cantidad)
      }))
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de bitácora:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getBitacora,
  getBitacoraById,
  limpiarBitacora,
  getEstadisticas
};