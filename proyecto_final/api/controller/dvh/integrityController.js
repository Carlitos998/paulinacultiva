const IntegrityService = require('./integrityService');

/**
 * Controller para manejar las verificaciones de integridad de datos
 */

// Verificar integridad de todos los usuarios
const verificarIntegridadUsuarios = async (req, res) => {
  try {
    const resultado = await IntegrityService.verificarIntegridadUsuarios();
    res.json({
      success: true,
      message: 'Verificación de usuarios completada',
      data: resultado
    });
  } catch (error) {
    console.error('Error al verificar integridad de usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar integridad de usuarios',
      error: error.message
    });
  }
};

// Verificar integridad de todos los posts
const verificarIntegridadPosts = async (req, res) => {
  try {
    const resultado = await IntegrityService.verificarIntegridadPosts();
    res.json({
      success: true,
      message: 'Verificación de posts completada',
      data: resultado
    });
  } catch (error) {
    console.error('Error al verificar integridad de posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar integridad de posts',
      error: error.message
    });
  }
};

// Verificar integridad de un registro específico
const verificarRegistro = async (req, res) => {
  try {
    const { modelo, id } = req.params;

    if (!modelo || !id) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los parámetros modelo e id'
      });
    }

    const resultado = await IntegrityService.verificarRegistro(modelo, parseInt(id));
    res.json({
      success: true,
      message: `Verificación de ${modelo} con ID ${id} completada`,
      data: resultado
    });
  } catch (error) {
    console.error('Error al verificar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar registro',
      error: error.message
    });
  }
};

// Verificación completa de toda la base de datos
const verificacionCompleta = async (req, res) => {
  try {
    const resultado = await IntegrityService.verificacionCompleta();
    res.json({
      success: true,
      message: 'Verificación completa de integridad finalizada',
      data: resultado
    });
  } catch (error) {
    console.error('Error en verificación completa:', error);
    res.status(500).json({
      success: false,
      message: 'Error en verificación completa',
      error: error.message
    });
  }
};

module.exports = {
  verificarIntegridadUsuarios,
  verificarIntegridadPosts,
  verificarRegistro,
  verificacionCompleta
};