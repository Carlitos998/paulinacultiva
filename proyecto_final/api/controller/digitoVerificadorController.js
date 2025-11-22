// controller/digitoVerificadorController.js
const {
  verificarIntegridadTabla,
  verificarIntegridadDetallada,
  recalcularTodo
} = require("../services/digitoVerificadorService");
const { User, Post, Comment, Friendship, Calification, Bitacora } = require("../models");

// Mapa de modelos para operaciones masivas
const MODELOS = {
  usuarios: User,        // Tabla: Usuarios
  posts: Post,           // Tabla: Posts
  comentarios: Comment,  // Tabla: Comments
  amistades: Friendship, // Tabla: Friendships
  calificaciones: Calification, // Tabla: Califications
  bitacora: Bitacora     // Tabla: Bitacora
};

/**
 * Obtener estado completo de todos los dígitos verificadores
 */
const obtenerEstadoCompleto = async (req, res) => {
  try {
    const resultados = [];

    // Obtener DVV de cada tabla
    const { DigitoVerificador } = require("../models");
    const registrosDVV = await DigitoVerificador.findAll({
      order: [['nombre_tabla', 'ASC']]
    });

    for (const registro of registrosDVV) {
      const modelo = MODELOS[registro.nombre_tabla];

      if (modelo) {
        try {
          // Verificar integridad
          const integridad = await verificarIntegridadTabla(modelo, registro.nombre_tabla);

          // Contar registros
          const totalRegistros = await modelo.count();

          resultados.push({
            tabla: registro.nombre_tabla,
            totalRegistros,
            sumaDVH: integridad.sumaCalculada || registro.suma_dvh,
            fechaUltimoCalculo: registro.fecha_calculo,
            integridad: integridad.integridad,
            requiereRecalculo: integridad.requiereRecalculo,
            error: integridad.error
          });
        } catch (error) {
          resultados.push({
            tabla: registro.nombre_tabla,
            totalRegistros: 0,
            sumaDVH: registro.suma_dvh,
            fechaUltimoCalculo: registro.fecha_calculo,
            integridad: false,
            requiereRecalculo: true,
            error: error.message
          });
        }
      }
    }

    // Calcular totales generales
    const totals = {
      totalTablas: resultados.length,
      tablasConIntegridad: resultados.filter(r => r.integridad).length,
      totalRegistros: resultados.reduce((sum, r) => sum + r.totalRegistros, 0),
      sumaTotalDVH: resultados.reduce((sum, r) => sum + (r.sumaDVH || 0), 0),
      tablasConErrores: resultados.filter(r => r.requiereRecalculo).length
    };

    res.json({
      success: true,
      totals,
      tablas: resultados
    });
  } catch (error) {
    console.error('Error al obtener estado completo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de dígitos verificadores',
      error: error.message
    });
  }
};

/**
 * Verificar integridad de una tabla específica
 */
const verificarIntegridadTablaEspecifica = async (req, res) => {
  try {
    const { tabla } = req.params;
    const modelo = MODELOS[tabla];

    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Tabla no encontrada'
      });
    }

    const integridad = await verificarIntegridadTabla(modelo, tabla);
    const detalles = await verificarIntegridadDetallada(modelo, tabla);

    res.json({
      success: true,
      tabla,
      integridadGeneral: integridad,
      detallesErrores: detalles
    });
  } catch (error) {
    console.error('Error al verificar integridad de tabla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar integridad',
      error: error.message
    });
  }
};

/**
 * Recalcular absolutamente todos los dígitos verificadores
 */
const recalcularAbsolutamente = async (req, res) => {
  try {
    console.log('🔄 Iniciando recálculo absoluto de todos los DVH...');

    const resultado = await recalcularTodo(MODELOS);

    if (resultado.success) {
      res.json({
        success: true,
        message: 'Recálculo completado exitosamente',
        resultados: resultado.resultados,
        tablasProcesadas: resultado.tablasProcesadas
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Recálculo completado con errores',
        resultados: resultado.resultados,
        errores: resultado.errores
      });
    }
  } catch (error) {
    console.error('Error en recálculo absoluto:', error);
    res.status(500).json({
      success: false,
      message: 'Error crítico en recálculo absoluto',
      error: error.message
    });
  }
};

/**
 * Recalcular dígitos de una tabla específica
 */
const recalcularTabla = async (req, res) => {
  try {
    const { tabla } = req.params;
    const modelo = MODELOS[tabla];

    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Tabla no encontrada'
      });
    }

    const { actualizarDigitosVerificadores } = require("../services/digitoVerificadorService");
    const resultado = await actualizarDigitosVerificadores(modelo, tabla);

    if (resultado.success) {
      res.json({
        success: true,
        message: `Dígitos verificadores de ${tabla} recalculados exitosamente`,
        registrosActualizados: resultado.dvh?.registrosActualizados || 0,
        sumaDVH: resultado.dvv?.sumaDVH || 0
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al recalcular dígitos verificadores',
        error: resultado.error
      });
    }
  } catch (error) {
    console.error('Error al recalcular tabla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recalcular dígitos de la tabla',
      error: error.message
    });
  }
};

/**
 * Obtener errores de integridad recientes
 */
const obtenerErroresRecientes = async (req, res) => {
  try {
    const errores = await Bitacora.findAll({
      where: {
        accion: 'ERROR_INTEGRIDAD_DVH'
      },
      limit: 50,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['username', 'email'],
        required: false
      }]
    });

    res.json({
      success: true,
      errores: errores.map(error => ({
        id: error.id,
        tabla: error.entidad,
        error: error.antes,
        criticidad: error.criticidad,
        fecha: error.createdAt,
        usuario: error.User ? error.User.username : 'SISTEMA',
        ip: error.ip
      }))
    });
  } catch (error) {
    console.error('Error al obtener errores recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener errores de integridad',
      error: error.message
    });
  }
};

module.exports = {
  obtenerEstadoCompleto,
  verificarIntegridadTablaEspecifica,
  recalcularAbsolutamente,
  recalcularTabla,
  obtenerErroresRecientes
};