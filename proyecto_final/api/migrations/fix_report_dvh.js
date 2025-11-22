// Migración para corregir el DVH en la tabla Reports
require('dotenv').config();

const { sequelize } = require('../config/db');

async function fixReportDVH() {
  try {
    console.log('🔄 Corrigiendo DVH en tabla Reports...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Verificar si la columna DVH existe en Reports
    const [columnCheck] = await sequelize.query(`
      DESCRIBE Reports
    `);

    const hasDVH = columnCheck.some(col => col.Field === 'DVH');

    if (!hasDVH) {
      console.log('ℹ️ La columna DVH no existe en la tabla Reports. Creando columna...');

      // Agregar columna DVH si no existe
      await sequelize.query(`
        ALTER TABLE Reports
        ADD COLUMN DVH INT DEFAULT 0 NOT NULL
        COMMENT 'Dígito verificador horizontal'
      `);

      console.log('✅ Columna DVH agregada a Reports');
    }

    // Actualizar registros existentes que tengan DVH NULL
    const [updateResult] = await sequelize.query(`
      UPDATE Reports
      SET DVH = 0
      WHERE DVH IS NULL OR DVH = ''
    `);

    console.log(`📊 Registros actualizados: ${updateResult[0]?.affectedRows || 0}`);

    // Verificar el estado final
    const [checkResult] = await sequelize.query(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN DVH = 0 THEN 1 ELSE 0 END) as with_default
      FROM Reports
    `);

    console.log(`📊 Estado final de la tabla Reports:`);
    console.log(`   Total registros: ${checkResult[0]?.total || 0}`);
    console.log(`   Con DVH por defecto: ${checkResult[0]?.with_default || 0}`);

    // Verificar si hay problemas de estructura
    const [structureCheck] = await sequelize.query(`
      DESCRIBE Reports
    `);

    console.log('📋 Estructura de la tabla Reports:');
    structureCheck.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} | Null: ${col.Null} | Default: ${col.Default}`);
    });

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
  fixReportDVH();
}

module.exports = fixReportDVH;