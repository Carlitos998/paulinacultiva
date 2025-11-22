/**
 * Script para migrar el campo DVH de INTEGER a STRING(8)
 */

const { sequelize } = require('../../config/db');
const { User, Post } = require('../../models');

async function migrarDVH() {
  console.log('🔄 Migrando campo DVH de INTEGER a STRING(8)...');
  console.log('='.repeat(50));

  try {
    // 1. Primero, respaldar los DVH actuales
    console.log('\n💾 Respaldando DVH actuales...');
    const usuarios = await User.findAll();
    const posts = await Post.findAll();

    // 2. Modificar la estructura de las tablas
    console.log('\n🔧 Modificando estructura de la tabla Usuarios...');
    await sequelize.query(`
      ALTER TABLE Usuarios
      MODIFY COLUMN dvh VARCHAR(8) NOT NULL DEFAULT '00000000'
    `);

    console.log('🔧 Modificando estructura de la tabla Posts...');
    await sequelize.query(`
      ALTER TABLE Posts
      MODIFY COLUMN dvh VARCHAR(8) NOT NULL DEFAULT '00000000'
    `);

    console.log('✅ Estructura modificada correctamente');

    // 3. Recalcular DVH para todos los registros
    console.log('\n🔄 Recalculando DVH para todos los registros...');

    const { calcularDVH } = require('./dvh');

    for (const usuario of usuarios) {
      const datosUsuario = usuario.get({ plain: true });
      const nuevoDVH = calcularDVH(datosUsuario);
      await usuario.update({ dvh: nuevoDVH });
      console.log(`   👤 Usuario ${usuario.username}: ${nuevoDVH}`);
    }

    for (const post of posts) {
      const datosPost = post.get({ plain: true });
      const nuevoDVH = calcularDVH(datosPost);
      await post.update({ dvh: nuevoDVH });
      console.log(`   📝 Post ${post.titulo}: ${nuevoDVH}`);
    }

    console.log('\n✨ Migración completada exitosamente!');
    console.log('🎯 El campo DVH ahora es STRING(8) en todas las tablas');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  }
}

// Ejecutar si se corre este script directamente
if (require.main === module) {
  migrarDVH().then(() => {
    console.log('🚀 Migración finalizada');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Falló la migración:', error);
    process.exit(1);
  });
}

module.exports = { migrarDVH };