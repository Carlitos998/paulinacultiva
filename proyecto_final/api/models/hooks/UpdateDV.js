const { actualizarDV } = require('../DV');

function agregarHooksDV(modelo, nombreTabla) {
  modelo.addHook('afterCreate', async () => {
    try {
      await actualizarDV(modelo, nombreTabla);
    } catch (error) {
      console.warn(`⚠️  Error en hook afterCreate para DV de ${nombreTabla}:`, error.message);
    }
  });
  modelo.addHook('afterUpdate', async () => {
    try {
      await actualizarDV(modelo, nombreTabla);
    } catch (error) {
      console.warn(`⚠️  Error en hook afterUpdate para DV de ${nombreTabla}:`, error.message);
    }
  });
  modelo.addHook('afterDestroy', async () => {
    try {
      await actualizarDV(modelo, nombreTabla);
    } catch (error) {
      console.warn(`⚠️  Error en hook afterDestroy para DV de ${nombreTabla}:`, error.message);
    }
  });
}

module.exports = { agregarHooksDV };
