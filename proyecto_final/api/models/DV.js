function calcularDV(fila) {
  const datos = Object.entries(fila)
    .filter(([key, _]) => key !== 'dvh' && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
    .map(([_, v]) => (v === null || v === undefined) ? '' : String(v));
  const str = datos.join('');
  let suma = 0;
  for (let i = 0; i < str.length; i++) suma += str.charCodeAt(i);
  return suma % 7;
}

async function actualizarDVH(modelo) {
  const filas = await modelo.findAll();
  for (const fila of filas) {
    const dvh = calcularDV(fila.dataValues);
    if ((fila.dvh || null) !== dvh) {
      await fila.update({ dvh });
    }
  }
}

async function actualizarDVV(modelo, nombreTabla) {
  const filas = await modelo.findAll({ attributes: ['dvh'] });
  const dvv = filas.reduce((acc, fila) => acc + (Number(fila.dvh) || 0), 0);

  const DigitoVerificador = modelo.sequelize.models.DigitoVerificador;
  if (DigitoVerificador) {
    await DigitoVerificador.upsert({ tabla: nombreTabla, dvv });
  } else {
    console.warn(`⚠️  Modelo DigitoVerificador no disponible para tabla ${nombreTabla}`);
  }
}

async function actualizarDV(modelo, tabla) {
  await actualizarDVH(modelo);
  await actualizarDVV(modelo, tabla);
}

module.exports = { actualizarDV };
