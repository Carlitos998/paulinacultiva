/**
 * Script para corregir el DVH de usuarios existentes
 */

const { calcularDVH } = require('./dvh');
const { User, Post } = require('../../models');

async function corregirDVHExistente() {
  console.log('🔧 Corrigiendo DVH de registros existentes...');
  console.log('='.repeat(50));

  try {
    // 1. Corregir usuarios
    console.log('\n👤 Corrigiendo DVH de usuarios...');
    const usuarios = await User.findAll();

    for (const usuario of usuarios) {
      const datosUsuario = usuario.get({ plain: true });

      // Calcular DVH correcto
      const nuevoDVH = calcularDVH(datosUsuario);

      // Actualizar el usuario
      await usuario.update({ dvh: nuevoDVH });

      console.log(`   ✅ Usuario ${usuario.username} (ID: ${usuario.id}): DVH actualizado a ${nuevoDVH}`);
    }

    // 2. Corregir posts
    console.log('\n📝 Corrigiendo DVH de posts...');
    const posts = await Post.findAll();

    for (const post of posts) {
      const datosPost = post.get({ plain: true });

      // Calcular DVH correcto
      const nuevoDVH = calcularDVH(datosPost);

      // Actualizar el post
      await post.update({ dvh: nuevoDVH });

      console.log(`   ✅ Post "${post.titulo}" (ID: ${post.id}): DVH actualizado a ${nuevoDVH}`);
    }

    console.log('\n✨ Corrección completada!');
    console.log('🎯 Todos los registros ahora tienen DVH correcto.');

  } catch (error) {
    console.error('❌ Error al corregir DVH:', error.message);
  }
}

// Ejecutar si se corre este script directamente
if (require.main === module) {
  corregirDVHExistente();
}

module.exports = { corregirDVHExistente };