// scripts/addTiempoUnidadColumn.js
const { sequelize } = require('../config/db');

async function addTiempoUnidadColumn() {
  try {
    console.log('🔄 Agregando columna tiempoUnidad a la tabla posts...');

    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'posts'
      AND COLUMN_NAME = 'tiempoUnidad'
    `);

    if (results.length > 0) {
      console.log('✅ La columna tiempoUnidad ya existe en la tabla posts');
      return;
    }

    // Agregar la columna si no existe
    await sequelize.query(`
      ALTER TABLE posts
      ADD COLUMN tiempoUnidad VARCHAR(10) DEFAULT 'min'
      COMMENT 'Unidad del tiempo de preparación (min, horas)'
    `);

    console.log('✅ Columna tiempoUnidad agregada exitosamente a la tabla posts');

  } catch (error) {
    console.error('❌ Error al agregar la columna tiempoUnidad:', error);
    throw error;
  }
}

// Ejecutar la función
if (require.main === module) {
  addTiempoUnidadColumn()
    .then(() => {
      console.log('🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { addTiempoUnidadColumn };