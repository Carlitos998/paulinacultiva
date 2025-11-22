// Actualizar posts y comentarios existentes para que tengan estado 'activo'
require('dotenv').config();

const { sequelize } = require('../config/db');

async function updateExistingContent() {
  try {
    console.log('🔄 Actualizando contenido existente...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Actualizar posts existentes que no tengan estado (NULL)
    const [postsResult] = await sequelize.query(`
      UPDATE posts
      SET estado = 'activo'
      WHERE estado IS NULL OR estado = ''
    `);
    console.log(`✅ Posts actualizados: ${postsResult.affectedRows || 0}`);

    // Actualizar comentarios existentes que no tengan estado (NULL)
    const [commentsResult] = await sequelize.query(`
      UPDATE comentarios
      SET estado = 'activo'
      WHERE estado IS NULL OR estado = ''
    `);
    console.log(`✅ Comentarios actualizados: ${commentsResult.affectedRows || 0}`);

    // Verificar conteo de contenido activo
    const [activePostsCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM posts WHERE estado = 'activo'
    `);
    const [activeCommentsCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM comentarios WHERE estado = 'activo'
    `);

    console.log(`📊 Posts activos: ${activePostsCount[0]?.count || 0}`);
    console.log(`📊 Comentarios activos: ${activeCommentsCount[0]?.count || 0}`);

    console.log('🎉 Actualización completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la actualización:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar actualización si se llama directamente
if (require.main === module) {
  updateExistingContent();
}

module.exports = updateExistingContent;