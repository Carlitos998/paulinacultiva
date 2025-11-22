// controller/adminController.js
const { User, Bitacora } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los usuarios para el panel de administración
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'estado', 'isAdmin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        estado: user.estado,
        isAdmin: user.isAdmin,
        fechaCreacion: user.createdAt,
        estadoLabel: user.estado === 'activo' ? 'Activo' : 'Bloqueado',
        rolLabel: user.isAdmin ? 'Administrador' : 'Usuario'
      }))
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de usuarios',
      error: error.message
    });
  }
};

/**
 * Bloquear un usuario
 */
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { motivo } = req.body;

    // Verificar que no se intente bloquear a un administrador
    const userToBlock = await User.findByPk(userId);
    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (userToBlock.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'No se puede bloquear a un usuario administrador'
      });
    }

    // No permitir bloquearse a sí mismo
    if (userToBlock.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes bloquear tu propio usuario'
      });
    }

    // Actualizar estado del usuario
    await userToBlock.update({
      estado: 'bloqueado'
    });

    // Registrar en bitácora
    await Bitacora.create({
      accion: 'USUARIO_BLOQUEADO',
      usuarioId: req.user.id,
      entidad: `Usuario ID: ${userToBlock.id}`,
      antes: `Estado: activo`,
      despues: `Estado: bloqueado`,
      ip: req.ip || req.connection.remoteAddress,
      criticidad: 'alto'
    });

    res.json({
      success: true,
      message: `Usuario ${userToBlock.username} bloqueado exitosamente`,
      motivo: motivo || 'Bloqueado por administrador'
    });
  } catch (error) {
    console.error('Error al bloquear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al bloquear usuario',
      error: error.message
    });
  }
};

/**
 * Desbloquear un usuario
 */
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userToUnblock = await User.findByPk(userId);
    if (!userToUnblock) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar estado del usuario
    await userToUnblock.update({
      estado: 'activo'
    });

    // Registrar en bitácora
    await Bitacora.create({
      accion: 'USUARIO_DESBLOQUEADO',
      usuarioId: req.user.id,
      entidad: `Usuario ID: ${userToUnblock.id}`,
      antes: `Estado: bloqueado`,
      despues: `Estado: activo`,
      ip: req.ip || req.connection.remoteAddress,
      criticidad: 'medio'
    });

    res.json({
      success: true,
      message: `Usuario ${userToUnblock.username} desbloqueado exitosamente`
    });
  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desbloquear usuario',
      error: error.message
    });
  }
};

/**
 * Eliminar un usuario
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario exista
    const userToDelete = await User.findByPk(userId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar a un administrador
    if (userToDelete.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar a un usuario administrador'
      });
    }

    // No permitirse eliminarse a sí mismo
    if (userToDelete.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propio usuario'
      });
    }

    // Guardar info para la bitácora
    const userInfo = {
      id: userToDelete.id,
      username: userToDelete.username,
      email: userToDelete.email
    };

    // Eliminar usuario (Sequelize manejará las restricciones)
    await userToDelete.destroy();

    // Registrar en bitácora
    await Bitacora.create({
      accion: 'USUARIO_ELIMINADO',
      usuarioId: req.user.id,
      entidad: `Usuario ID: ${userInfo.id}`,
      antes: `Username: ${userInfo.username}, Email: ${userInfo.email}`,
      despues: 'Usuario eliminado',
      ip: req.ip || req.connection.remoteAddress,
      criticidad: 'critico'
    });

    res.json({
      success: true,
      message: `Usuario ${userInfo.username} eliminado exitosamente`
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de usuarios
 */
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { estado: 'activo' } });
    const blockedUsers = await User.count({ where: { estado: 'bloqueado' } });
    const adminUsers = await User.count({ where: { isAdmin: true } });

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        activos: activeUsers,
        bloqueados: blockedUsers,
        administradores: adminUsers,
        usuariosNormales: totalUsers - adminUsers
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de usuarios',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getUserStats
};