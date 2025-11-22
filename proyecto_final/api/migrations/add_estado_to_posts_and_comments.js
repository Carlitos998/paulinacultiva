// Migración para agregar campo estado a posts y comentarios
require('dotenv').config();

const { sequelize } = require('../config/db');

async function addEstadoFields() {
  try {
    console.log('🔄 Iniciando migración para agregar campo estado...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Agregar campo estado a la tabla posts
    try {
      const [resultsPosts, metadataPosts] = await sequelize.query(`
        ALTER TABLE posts
        ADD COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo' NOT NULL
        COMMENT 'Estado del post basado en el estado del autor'
      `);
      console.log('✅ Campo estado agregado a tabla posts');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ El campo estado ya existe en la tabla posts');
      } else {
        throw error;
      }
    }

    // Agregar campo estado a la tabla comentarios
    try {
      const [resultsComments, metadataComments] = await sequelize.query(`
        ALTER TABLE comentarios
        ADD COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo' NOT NULL
        COMMENT 'Estado del comentario basado en el estado del autor'
      `);
      console.log('✅ Campo estado agregado a tabla comentarios');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ El campo estado ya existe en la tabla comentarios');
      } else {
        throw error;
      }
    }

    // Verificar que los campos se agregaron correctamente
    const [postsCheck] = await sequelize.query(`
      DESCRIBE posts
    `);

    const [commentsCheck] = await sequelize.query(`
      DESCRIBE comentarios
    `);

    const postsHasEstado = postsCheck.some(col => col.Field === 'estado');
    const commentsHasEstado = commentsCheck.some(col => col.Field === 'estado');

    console.log(`📊 Posts tiene campo estado: ${postsHasEstado ? '✅' : '❌'}`);
    console.log(`📊 Comentarios tiene campo estado: ${commentsHasEstado ? '✅' : '❌'}`);

    if (postsHasEstado && commentsHasEstado) {
      console.log('🎉 Migración completada exitosamente');
    } else {
      console.log('⚠️ Migración completada con advertencias');
    }

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  addEstadoFields();
}

module.exports = addEstadoFields;