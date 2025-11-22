// Script para crear manualmente un usuario moderador
require('dotenv').config();

const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');

async function createModeratorUser() {
  try {
    console.log('🔄 Creando usuario moderador...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Verificar si el usuario ya existe
    const [existingUsers] = await sequelize.query(`
      SELECT id, username, email, role FROM Usuarios WHERE email = 'tobias.soriaet36@gmail.com'
    `);

    if (existingUsers.length > 0) {
      console.log('⚠️ El usuario ya existe:', existingUsers[0]);

      // Actualizar a moderador si no lo es ya
      if (existingUsers[0].role !== 'moderator') {
        await sequelize.query(`
          UPDATE Usuarios
          SET role = 'moderator', estado = 'activo'
          WHERE email = 'tobias.soriaet36@gmail.com'
        `);
        console.log('✅ Usuario actualizado a rol moderador');
      } else {
        console.log('✅ El usuario ya es moderador');
      }

      console.log('📋 Datos de acceso:');
      console.log('   Email: tobias.soriaet36@gmail.com');
      console.log('   Contraseña: 123456mod');
      console.log('   Rol: Moderador');

      await sequelize.close();
      return;
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('123456mod', saltRounds);

    // Insertar nuevo usuario moderador
    const [result] = await sequelize.query(`
      INSERT INTO Usuarios (
        username,
        email,
        password,
        role,
        estado,
        emailVerified,
        createdAt,
        updatedAt
      ) VALUES (
        'Mod',
        'tobias.soriaet36@gmail.com',
        :password,
        'moderator',
        'activo',
        true,
        NOW(),
        NOW()
      )
    `, {
      replacements: { password: hashedPassword }
    });

    console.log('✅ Usuario moderador creado exitosamente');
    console.log('📋 Datos de acceso:');
    console.log('   Nombre: Mod');
    console.log('   Email: tobias.soriaet36@gmail.com');
    console.log('   Contraseña: 123456mod');
    console.log('   Rol: Moderador');
    console.log('   Estado: Activo');
    console.log('   ID:', result.insertId);

    // Verificar que el usuario fue creado correctamente
    const [verifyUser] = await sequelize.query(`
      SELECT id, username, email, role, estado, emailVerified
      FROM Usuarios
      WHERE email = 'tobias.soriaet36@gmail.com'
    `);

    console.log('🔍 Verificación del usuario creado:');
    console.log(JSON.stringify(verifyUser[0], null, 2));

  } catch (error) {
    console.error('❌ Error al crear usuario moderador:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createModeratorUser();
}

module.exports = createModeratorUser;