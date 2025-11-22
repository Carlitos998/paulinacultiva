/**
 * Script para verificar el esquema real de la base de datos
 */

const { sequelize } = require('../../config/db');
const { User, Post } = require('../../models');

async function verificarEsquema() {
  console.log('🔍 Verificando esquema de la base de datos...');
  console.log('='.repeat(50));

  try {
    // Verificar estructura de la tabla usuarios
    console.log('\n👤 Estructura de tabla Usuarios:');
    const [usuariosResults] = await sequelize.query('DESCRIBE Usuarios');
    usuariosResults.forEach(row => {
      if (row.Field.toLowerCase().includes('dvh') || row.Field.toLowerCase().includes('verificador')) {
        console.log(`   📋 ${row.Field}: ${row.Type} (Null: ${row.Null}, Default: ${row.Default})`);
      }
    });

    // Verificar estructura de la tabla posts
    console.log('\n📝 Estructura de tabla Posts:');
    try {
      const [postsResults] = await sequelize.query('DESCRIBE Posts');
      postsResults.forEach(row => {
        if (row.Field.toLowerCase().includes('dvh') || row.Field.toLowerCase().includes('verificador')) {
          console.log(`   📋 ${row.Field}: ${row.Type} (Null: ${row.Null}, Default: ${row.Default})`);
        }
      });
    } catch (error) {
      console.log('   ⚠️  No se pudo verificar tabla Posts');
    }

    // Verificar datos actuales
    console.log('\n📊 Datos actuales:');
    const usuarios = await User.findAll();
    usuarios.forEach(usuario => {
      console.log(`   👤 ${usuario.username} (ID: ${usuario.id}): dvh = ${usuario.dvh} (tipo: ${typeof usuario.dvh})`);
    });

    const posts = await Post.findAll();
    posts.forEach(post => {
      console.log(`   📝 ${post.titulo} (ID: ${post.id}): dvh = ${post.dvh} (tipo: ${typeof post.dvh})`);
    });

  } catch (error) {
    console.error('❌ Error al verificar esquema:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se corre este script directamente
if (require.main === module) {
  verificarEsquema();
}

module.exports = { verificarEsquema };