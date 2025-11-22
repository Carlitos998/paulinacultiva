// middleware/contextMiddleware.js
const { registrarBitacora, nivelesCriticidad } = require('../models/hooks/bitacora');

// Middleware para agregar contexto de usuario a las operaciones de base de datos
const contextMiddleware = (req, res, next) => {
  // Extraer información del request
  const usuario_id = req.user?.id || null;
  const ip = req.ip || req.connection?.remoteAddress || null;
  const user_agent = req.get('User-Agent') || null;

  // Agregar el contexto al objeto request para que esté disponible en los controllers
  req.dbContext = {
    usuario_id,
    ip,
    user_agent
  };

  // Extender el método create de todos los modelos para incluir el contexto
  const addContextToSequelizeOptions = (options) => {
    if (!options) options = {};
    if (!options.context) options.context = {};

    options.context = {
      ...options.context,
      usuario_id,
      ip,
      user_agent
    };

    return options;
  };

  // Guardar la referencia a este middleware para uso en los controllers
  req.addContextToSequelizeOptions = addContextToSequelizeOptions;

  next();
};

// Middleware para registrar operaciones específicas en la bitácora
const registrarOperacion = (accion, entidad, criticidad = nivelesCriticidad.contenido) => {
  return (req, res, next) => {
    // Guardar la información para registrar después de la operación
    req.bitacoraInfo = {
      accion,
      entidad,
      criticidad,
      usuario_id: req.user?.id || null,
      ip: req.ip || null,
      user_agent: req.get('User-Agent') || null
    };

    // Interceptamos el método res.json para registrar después de la operación exitosa
    const originalJson = res.json;
    res.json = function(data) {
      // Si la operación fue exitosa (código 2xx), registramos en bitácora
      if (res.statusCode >= 200 && res.statusCode < 300 && req.bitacoraInfo) {
        registrarBitacora(req.app.locals.sequelize, {
          ...req.bitacoraInfo,
          entidad_id: data?.id || null,
          despues: data || null
        }).catch(err => {
          console.error('Error al registrar en bitácora:', err);
        });
      }

      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  };
};

// Función helper para los controllers para agregar contexto a las operaciones de base de datos
const agregarContexto = (req, opciones = {}) => {
  if (!opciones.context) opciones.context = {};

  opciones.context = {
    ...opciones.context,
    usuario_id: req.user?.id || null,
    ip: req.ip || null,
    user_agent: req.get('User-Agent') || null
  };

  return opciones;
};

module.exports = {
  contextMiddleware,
  registrarOperacion,
  agregarContexto
};