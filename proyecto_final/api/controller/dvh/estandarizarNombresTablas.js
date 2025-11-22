/**
 * Script para estandarizar los nombres de tablas en digitos_verificadores
 */

const { DigitoVerificador } = require('../../models');
const { Op } = require('sequelize');

async function estandarizarNombresTablas() {
  console.log('🔧 Estandarizando nombres de tablas en digitos_verificadores...');
  console.log('='.repeat(60));

  try {
    // 1. Mostrar estado actual
    console.log('\n📊 Estado actual:');
    const registros = await DigitoVerificador.findAll({
      order: [['nombre_tabla', 'ASC'], ['id_registro', 'ASC']]
    });

    registros.forEach(reg => {
      console.log(`   🔢 ${reg.nombre_tabla}:${reg.id_registro} = ${reg.dv}`);
    });

    // 2. Estandarizar nombres
    console.log('\n🔄 Estandarizando nombres...');

    // Cambiar 'usuario' y 'Usuario' a 'Usuarios'
    const usuariosActualizar = await DigitoVerificador.findAll({
      where: {
        [Op.or]: [
          { nombre_tabla: 'usuario' },
          { nombre_tabla: 'Usuario' }
        ]
      }
    });

    for (const registro of usuariosActualizar) {
      const nombreAnterior = registro.nombre_tabla;
      await registro.update({ nombre_tabla: 'Usuarios' });
      console.log(`   ✅ ${nombreAnterior}:${registro.id_registro} → Usuarios:${registro.id_registro}`);
    }

    // Cambiar 'post' o 'Post' a 'Posts' (si existen)
    const postsActualizar = await DigitoVerificador.findAll({
      where: {
        [Op.or]: [
          { nombre_tabla: 'post' },
          { nombre_tabla: 'Post' }
        ]
      }
    });

    for (const registro of postsActualizar) {
      const nombreAnterior = registro.nombre_tabla;
      await registro.update({ nombre_tabla: 'Posts' });
      console.log(`   ✅ ${nombreAnterior}:${registro.id_registro} → Posts:${registro.id_registro}`);
    }

    // 3. Mostrar estado final
    console.log('\n📊 Estado final:');
    const registrosFinales = await DigitoVerificador.findAll({
      order: [['nombre_tabla', 'ASC'], ['id_registro', 'ASC']]
    });

    console.log(`📈 Total de registros: ${registrosFinales.length}`);
    registrosFinales.forEach(reg => {
      console.log(`   🔢 ${reg.nombre_tabla}:${reg.id_registro} = ${reg.dv}`);
    });

    // 4. Resumen por tabla
    console.log('\n📋 Resumen por tabla:');
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

    console.log('\n✨ Estandarización completada!');
    console.log('🎯 Todos los nombres de tablas ahora están estandarizados');

  } catch (error) {
    console.error('❌ Error en la estandarización:', error.message);
    throw error;
  }
}

// Ejecutar si se corre este script directamente
if (require.main === module) {
  estandarizarNombresTablas().then(() => {
    console.log('🚀 Estandarización finalizada');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Falló la estandarización:', error);
    process.exit(1);
  });
}

module.exports = { estandarizarNombresTablas };