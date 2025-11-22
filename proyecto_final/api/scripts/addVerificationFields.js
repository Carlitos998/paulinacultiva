// scripts/addVerificationFields.js
const { sequelize } = require('../config/db');

async function addVerificationFields() {
  try {
    console.log('🔄 Agregando campos de verificación a la tabla Usuarios...');

    // Verificar si las columnas ya existen
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Usuarios'
      AND COLUMN_NAME IN ('verificationCode', 'verificationCodeExpires')
    `);

    const existingColumns = results.map(row => row.COLUMN_NAME);
    console.log('Columnas existentes:', existingColumns);

    // Agregar verificationCode si no existe
    if (!existingColumns.includes('verificationCode')) {
      await sequelize.query(`
        ALTER TABLE Usuarios
        ADD COLUMN verificationCode VARCHAR(6) NULL
        COMMENT 'Código de verificación de email'
      `);
      console.log('✅ Columna verificationCode agregada');
    } else {
      console.log('ℹ️ Columna verificationCode ya existe');
    }

    // Agregar verificationCodeExpires si no existe
    if (!existingColumns.includes('verificationCodeExpires')) {
      await sequelize.query(`
        ALTER TABLE Usuarios
        ADD COLUMN verificationCodeExpires DATETIME NULL
        COMMENT 'Fecha de expiración del código de verificación'
      `);
      console.log('✅ Columna verificationCodeExpires agregada');
    } else {
      console.log('ℹ️ Columna verificationCodeExpires ya existe');
    }

    // Actualizar valor por defecto de estado a 'pendiente' si es necesario
    await sequelize.query(`
      UPDATE Usuarios
      SET estado = 'pendiente'
      WHERE emailVerified = false AND estado = 'activo'
    `);
    console.log('✅ Estados actualizados para usuarios no verificados');

  } catch (error) {
    console.error('❌ Error al agregar los campos de verificación:', error);
    throw error;
  }
}

// Ejecutar la función
if (require.main === module) {
  addVerificationFields()
    .then(() => {
      console.log('🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { addVerificationFields };