// Migración para cambiar isAdmin a role y actualizar administradores existentes
require('dotenv').config();

const { sequelize } = require('../config/db');

async function updateAdminToModerator() {
  try {
    console.log('🔄 Iniciando migración de admin a moderador...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Verificar si la columna isAdmin existe
    const [columnCheck] = await sequelize.query(`
      DESCRIBE Usuarios
    `);

    const hasIsAdmin = columnCheck.some(col => col.Field === 'isAdmin');
    const hasRole = columnCheck.some(col => col.Field === 'role');

    console.log(`📊 Columna isAdmin: ${hasIsAdmin ? '✅' : '❌'}`);
    console.log(`📊 Columna role: ${hasRole ? '✅' : '❌'}`);

    // Si existe isAdmin pero no role, agregar role y migrar datos
    if (hasIsAdmin && !hasRole) {
      console.log('🔄 Agregando columna role...');

      await sequelize.query(`
        ALTER TABLE Usuarios
        ADD COLUMN role ENUM('user', 'moderator') DEFAULT 'user' NOT NULL
        COMMENT 'Rol del usuario: user o moderator'
      `);

      console.log('✅ Columna role agregada');

      // Migrar administradores a moderadores
      const [updateResult] = await sequelize.query(`
        UPDATE Usuarios
        SET role = 'moderator'
        WHERE isAdmin = 1
      `);

      console.log(`📊 Usuarios migrados a moderador: ${updateResult[0]?.affectedRows || 0}`);

      // Eliminar columna isAdmin
      await sequelize.query(`
        ALTER TABLE Usuarios
        DROP COLUMN isAdmin
      `);

      console.log('✅ Columna isAdmin eliminada');

    } else if (hasIsAdmin && hasRole) {
      // Si ambas columnas existen, migrar y eliminar isAdmin
      console.log('🔄 Migrando datos de isAdmin a role...');

      const [updateResult] = await sequelize.query(`
        UPDATE Usuarios
        SET role = 'moderator'
        WHERE isAdmin = 1 AND (role IS NULL OR role = 'user')
      `);

      console.log(`📊 Usuarios migrados a moderador: ${updateResult[0]?.affectedRows || 0}`);

      // Eliminar columna isAdmin
      await sequelize.query(`
        ALTER TABLE Usuarios
        DROP COLUMN isAdmin
      `);

      console.log('✅ Columna isAdmin eliminada');

    } else if (!hasIsAdmin && !hasRole) {
      // Si no existe ninguna, crear role
      console.log('🔄 Creando columna role...');

      await sequelize.query(`
        ALTER TABLE Usuarios
        ADD COLUMN role ENUM('user', 'moderator') DEFAULT 'user' NOT NULL
        COMMENT 'Rol del usuario: user o moderator'
      `);

      console.log('✅ Columna role creada');
    }

    // Verificar resultado final
    const [finalCheck] = await sequelize.query(`
      DESCRIBE Usuarios
    `);

    const finalHasRole = finalCheck.some(col => col.Field === 'role');
    const finalHasIsAdmin = finalCheck.some(col => col.Field === 'isAdmin');

    console.log(`📊 Estado final - Columna role: ${finalHasRole ? '✅' : '❌'}`);
    console.log(`📊 Estado final - Columna isAdmin: ${finalHasIsAdmin ? '❌ (debería estar eliminada)' : '✅ (eliminada correctamente)'}`);

    // Contar moderadores
    if (finalHasRole) {
      const [moderatorCount] = await sequelize.query(`
        SELECT COUNT(*) as count FROM Usuarios WHERE role = 'moderator'
      `);
      console.log(`📊 Total moderadores: ${moderatorCount[0]?.count || 0}`);
    }

    console.log('🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  updateAdminToModerator();
}

module.exports = updateAdminToModerator;