// operaciones para recalcular DVH y DVV
const { registrarBitacora, nivelesCriticidad } = require('../models/hooks/bitacora');

const recalculateDVHForModel = async (db, Model, keyFields = []) => {
  const rows = await Model.findAll();
  // ejemplo simple de DVH: sum de char codes de JSON string modulo 100000
  const calcDVH = (obj) => {
    const s = JSON.stringify(obj);
    let sum = 0;
    for (let i = 0; i < s.length; i++) sum = (sum + s.charCodeAt(i)) % 100000;
    return sum;
  };

  for (const r of rows) {
    const dvh = calcDVH(r.toJSON());
    // intenta actualizar campo dvh si existe
    if (r.get('dvh') !== undefined) {
      await r.update({ dvh });
    }
  }
};

const actualizarDV = async (req, res) => {
  try {
    const db = req.app.get('db');
    // recalcular DVH por modelo listado
    await recalculateDVHForModel(db, db.User);
    await recalculateDVHForModel(db, db.Post);
    await recalculateDVHForModel(db, db.Comment);
    await recalculateDVHForModel(db, db.Calification);
    await recalculateDVHForModel(db, db.Permission);
    await recalculateDVHForModel(db, db.Bitacora);

    // calcular DVV (ejemplo: sum dvh por tabla)
    const tablas = ['Usuarios','post','comentario','calificacion','permiso','bitacora'];
    for (const tabla of tablas) {
      const model = {
        Usuarios: db.User,
        post: db.Post,
        comentario: db.Comment,
        calificacion: db.Calification,
        permiso: db.Permission,
        bitacora: db.Bitacora
      }[tabla];

      const rows = await model.findAll();
      const dvv = rows.reduce((acc, r) => acc + (r.get('dvh') || 0), 0) % 100000;
      await db.DigitoVerificador.upsert({ tabla, dvv });
    }

    await registrarBitacora(db, {
      accion: 'recalcular_dv',
      entidad: 'digito_verificador',
      entidad_id: null,
      usuario_id: req.user?.id ?? null,
      antes: null,
      despues: null,
      criticidad: nivelesCriticidad.seguridad,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar DV' });
  }
};

module.exports = { actualizarDV };
