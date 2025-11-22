/**
 * Script para poblar la tabla digitos_verificadores con los DVH existentes
 */

const { DigitoVerificador, User, Post } = require('../../models');

async function poblarDigitosVerificadores() {
  console.log('📝 Poblando tabla digitos_verificadores con DVH existentes...');
  console.log('='.repeat(60));

  try {
    // 1. Limpiar la tabla para evitar duplicados
    console.log('\n🧹 Limpiando tabla digitos_verificadores...');
    await DigitoVerificador.destroy({
      where: {}
    });
    console.log('✅ Tabla limpiada');

    // 2. Procesar usuarios
    console.log('\n👤 Procesando usuarios...');
    const usuarios = await User.findAll();

    for (const usuario of usuarios) {
      if (usuario.dvh && usuario.dvh !== '00000000') {
        await DigitoVerificador.create({
          nombre_tabla: 'Usuarios',
          id_registro: usuario.id,
          dv: usuario.dvh,
          fecha_calculo: new Date(),
          estado: 'activo'
        });
        console.log(`   ✅ Usuario ${usuario.username} (ID: ${usuario.id}): DVH ${usuario.dvh}`);
      }
    }

    // 3. Procesar posts
    console.log('\n📝 Procesando posts...');
    const posts = await Post.findAll();

    for (const post of posts) {
      if (post.dvh && post.dvh !== '00000000') {
        await DigitoVerificador.create({
          nombre_tabla: 'Posts',
          id_registro: post.id,
          dv: post.dvh,
          fecha_calculo: new Date(),
          estado: 'activo'
        });
        console.log(`   ✅ Post "${post.titulo}" (ID: ${post.id}): DVH ${post.dvh}`);
      }
    }

    // 4. Verificar resultados
    console.log('\n📊 Verificando resultados...');
    const totalDVH = await DigitoVerificador.count();
    const dvvPorTabla = await DigitoVerificador.findAll({
      attributes: [
        'nombre_tabla',
        [DigitoVerificador.sequelize.fn('COUNT', DigitoVerificador.sequelize.col('id')), 'cantidad']
      ],
      group: ['nombre_tabla']
    });

    console.log(`\n🎯 Total de DVH guardados: ${totalDVH}`);
    dvvPorTabla.forEach(item => {
      console.log(`   📋 ${item.nombre_tabla}: ${item.dataValues.cantidad} registros`);
    });

    // 5. Mostrar contenido de la tabla
    console.log('\n📋 Contenido actual de digitos_verificadores:');
    const todosDVH = await DigitoVerificador.findAll({
      order: [['nombre_tabla', 'ASC'], ['id_registro', 'ASC']]
    });

    todosDVH.forEach(dvv => {
      console.log(`   🔢 Tabla: ${dvv.nombre_tabla}, ID: ${dvv.id_registro}, DV: ${dvv.dv}, Estado: ${dvv.estado}`);
    });

    console.log('\n✨ Poblado completado exitosamente!');
    console.log('🎯 Todos los DVH existentes ahora están en la tabla digitos_verificadores');

  } catch (error) {
    console.error('❌ Error al poblar digitos_verificadores:', error.message);
    throw error;
  }
}

// Ejecutar si se corre este script directamente
if (require.main === module) {
  poblarDigitosVerificadores().then(() => {
    console.log('🚀 Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Falló el script:', error);
    process.exit(1);
  });
}

module.exports = { poblarDigitosVerificadores };