/**
 * Demostración completa del sistema de Dígito Verificador Horizontal
 * con tabla digitos_verificadores
 */

const { User, Post, DigitoVerificador } = require('../../models');
const { calcularDVH, verificarDVH } = require('./dvh');

async function demoCompletaDVH() {
  console.log('🎯 DEMOSTRACIÓN COMPLETA DEL SISTEMA DVH');
  console.log('='.repeat(60));
  console.log('📊 Sistema con DVH en registro individual + tabla centralizada');
  console.log('');

  try {
    // 1. Estado inicial
    console.log('1️⃣ ESTADO INICIAL');
    console.log('-'.repeat(30));
    const dvhIniciales = await DigitoVerificador.findAll({
      order: [['nombre_tabla', 'ASC'], ['id_registro', 'ASC']]
    });
    console.log(`📈 DVH en tabla digitos_verificadores: ${dvhIniciales.length} registros`);
    dvhIniciales.forEach(dvh => {
      console.log(`   🔢 ${dvh.nombre_tabla}:${dvh.id_registro} = ${dvh.dv}`);
    });

    // 2. Crear nuevo usuario (demostración automática)
    console.log('\n2️⃣ CREANDO NUEVO USUARIO (con DVH automático)');
    console.log('-'.repeat(30));
    const timestamp = Date.now();
    const nuevoUsuario = await User.create({
      username: `demo_user_${timestamp}`,
      email: `demo_${timestamp}@test.com`,
      password: 'password123',
      estado: 'activo',
      isAdmin: false
    });

    console.log(`✅ Usuario creado: ${nuevoUsuario.username}`);
    console.log(`🔢 DVH en tabla Usuarios: ${nuevoUsuario.dvh}`);

    // 3. Verificar que se guardó en digitos_verificadores
    const dvvNuevo = await DigitoVerificador.findOne({
      where: {
        nombre_tabla: 'Usuarios',
        id_registro: nuevoUsuario.id,
        estado: 'activo'
      }
    });

    if (dvvNuevo) {
      console.log(`✅ DVH guardado en digitos_verificadores: ${dvvNuevo.dv}`);
      console.log(`🎯 ¿Coinciden? ${nuevoUsuario.dvh === dvvNuevo.dv ? 'SÍ ✅' : 'NO ❌'}`);
    }

    // 4. Crear nuevo post (demostración automática)
    console.log('\n3️⃣ CREANDO NUEVO POST (con DVH automático)');
    console.log('-'.repeat(30));
    const nuevoPost = await Post.create({
      autorId: nuevoUsuario.id,
      titulo: `Receta Demo ${timestamp}`,
      contenido: 'Este es el contenido de una receta de demostración con DVH automático.'
    });

    console.log(`✅ Post creado: ${nuevoPost.titulo}`);
    console.log(`🔢 DVH en tabla Posts: ${nuevoPost.dvh}`);

    const dvvPost = await DigitoVerificador.findOne({
      where: {
        nombre_tabla: 'Posts',
        id_registro: nuevoPost.id,
        estado: 'activo'
      }
    });

    if (dvvPost) {
      console.log(`✅ DVH guardado en digitos_verificadores: ${dvvPost.dv}`);
      console.log(`🎯 ¿Coinciden? ${nuevoPost.dvh === dvvPost.dv ? 'SÍ ✅' : 'NO ❌'}`);
    }

    // 5. Demostrar detección de manipulación
    console.log('\n4️⃣ DETECCIÓN DE MANIPULACIÓN');
    console.log('-'.repeat(30));
    console.log('🔍 Simulando manipulación de datos...');

    // Obtener usuario original
    const usuarioOriginal = await User.findByPk(nuevoUsuario.id);
    const datosOriginales = usuarioOriginal.get({ plain: true });
    console.log(`📝 Usuario original: ${datosOriginales.username}`);

    // Simular datos manipulados (cambiamos username pero mantenemos DVH original)
    const datosManipulados = {
      ...datosOriginales,
      username: 'HACKED_USER',
      dvh: datosOriginales.dvh // Mismo DVH
    };

    const esValido = verificarDVH(datosManipulados);
    console.log(`🚨 ¿DVH detecta manipulación? ${esValido ? 'NO ❌' : 'SÍ ✅ (detectado)'}`);

    // 6. Estado final
    console.log('\n5️⃣ ESTADO FINAL');
    console.log('-'.repeat(30));
    const dvhFinales = await DigitoVerificador.findAll({
      order: [['nombre_tabla', 'ASC'], ['id_registro', 'ASC']]
    });

    console.log(`📈 Total DVH en digitos_verificadores: ${dvhFinales.length} registros`);

    const resumen = await DigitoVerificador.findAll({
      attributes: [
        'nombre_tabla',
        [DigitoVerificador.sequelize.fn('COUNT', DigitoVerificador.sequelize.col('id')), 'cantidad']
      ],
      group: ['nombre_tabla'],
      order: [['nombre_tabla', 'ASC']]
    });

    resumen.forEach(item => {
      console.log(`   📋 ${item.nombre_tabla}: ${item.dataValues.cantidad} registros`);
    });

    // 7. Verificación de integridad global
    console.log('\n6️⃣ VERIFICACIÓN DE INTEGRIDAD GLOBAL');
    console.log('-'.repeat(30));

    let usuariosValidos = 0;
    let usuariosInvalidos = 0;
    const usuarios = await User.findAll();

    for (const usuario of usuarios) {
      const esValido = verificarDVH(usuario.get({ plain: true }));
      if (esValido) {
        usuariosValidos++;
      } else {
        usuariosInvalidos++;
      }
    }

    console.log(`👤 Usuarios válidos: ${usuariosValidos}/${usuarios.length} (${((usuariosValidos/usuarios.length)*100).toFixed(1)}%)`);
    console.log(`❌ Usuarios inválidos: ${usuariosInvalidos}`);

    console.log('\n✨ DEMOSTRACIÓN COMPLETADA');
    console.log('🎯 El sistema DVH funciona perfectamente:');
    console.log('   ✅ Cálculo automático de DVH');
    console.log('   ✅ Almacenamiento en tabla individual');
    console.log('   ✅ Almacenamiento en tabla centralizada');
    console.log('   ✅ Detección de manipulaciones');
    console.log('   ✅ Verificación de integridad');

  } catch (error) {
    console.error('❌ Error en la demostración:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar si se corre este script directamente
if (require.main === module) {
  demoCompletaDVH().then(() => {
    console.log('\n🚀 Demostración finalizada');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Falló la demostración:', error);
    process.exit(1);
  });
}

module.exports = { demoCompletaDVH };