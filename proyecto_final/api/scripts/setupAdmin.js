// scripts/setupAdmin.js - Script para limpiar usuarios de prueba y crear admin
const { sequelize } = require('../config/db');
const { User, DigitoVerificador } = require('../models');
const bcrypt = require('bcrypt');

async function setupAdmin() {
  try {
    console.log('🔧 Configurando usuario administrador...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada');

    // Sincronizar tablas (asegurar que tengan la estructura correcta)
    await sequelize.sync({ force: false });
    console.log('✅ Tablas sincronizadas');

    // Limpiar todos los usuarios existentes (manejando restricciones de clave externa)
    console.log('🧹 Limpiando usuarios existentes...');

    // Primero limpiar tokens de recuperación de contraseña
    await sequelize.query('DELETE FROM password_reset_tokens');
    console.log('✅ Tokens de recuperación eliminados');

    // Limpiar bitácora relacionada con usuarios
    await sequelize.query('DELETE FROM bitacora WHERE entidad LIKE "%usuario%"');
    console.log('✅ Bitácora de usuarios limpiada');

    // Ahora eliminar usuarios
    const deletedUsers = await User.destroy({ where: {} });
    console.log(`✅ ${deletedUsers} usuarios eliminados`);

    // Limpiar tabla de dígitos verificadores
    console.log('🧹 Limpiando tabla de dígitos verificadores...');
    const deletedDV = await DigitoVerificador.destroy({ where: {} });
    console.log(`✅ ${deletedDV} registros DV eliminados`);

    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...');

    // ========================= MODIFICAR AQUÍ =========================
    // Cambia estas credenciales por las que desees para tu administrador
    const adminUsername = 'admin';                    // 👈 USUARIO AQUÍ
    const adminEmail = 'paulina@gmail.com';          // 👈 EMAIL AQUÍ
    const adminPassword = 'root';                 // 👈 CONTRASEÑA AQUÍ
    // ===============================================================

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      estado: 'activo',
      dvh: 0 // Se calculará automáticamente con el hook
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📋 Datos del admin:');
    console.log(`   - Usuario: ${adminUsername}`);
    console.log(`   - Email: ${adminEmail}`);
    console.log(`   - Contraseña: ${adminPassword}`);
    console.log(`   - ID: ${admin.id}`);

    await sequelize.close();
    console.log('✅ Configuración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la configuración:', error);
    process.exit(1);
  }
}

setupAdmin();