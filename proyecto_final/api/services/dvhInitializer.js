// services/dvhInitializer.js
const { recalcularTodo } = require('./digitoVerificadorService');

/**
 * Inicializar automáticamente todos los dígitos verificadores al iniciar la aplicación
 */
async function inicializarDigitosVerificadores(modelos) {
  console.log('🔒 Inicializando sistema de Dígitos Verificadores...');

  try {
    console.log('📊 Calculando DVH y DVV para todas las tablas...');

    const resultado = await recalcularTodo(modelos);

    if (resultado.success) {
      console.log('✅ Sistema de DVH inicializado correctamente');

      resultado.resultados.forEach((info) => {
        console.log(`   📋 ${info.tabla}: ${info.registrosActualizados} registros, suma DVH: ${info.sumaDVH}`);
      });

      console.log(`📈 Total: ${resultado.tablasProcesadas} tablas procesadas`);
    } else {
      console.error('❌ Error al inicializar DVH:', resultado.errores);

      resultado.errores.forEach((error) => {
        console.error(`   ❌ ${error.tabla}: ${error.error}`);
      });
    }

    return resultado;
  } catch (error) {
    console.error('💥 Error crítico en inicialización de DVH:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  inicializarDigitosVerificadores
};