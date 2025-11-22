// controller/permission.js
const { registrarBitacora, nivelesCriticidad } = require('../models/hooks/bitacora');

const listPermissions = async (req, res) => {
  try {
    const db = req.app.get('db');
    const permisos = await db.Permission.findAll();
    res.json(permisos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar permisos' });
  }
};

const createPermission = async (req, res) => {
  try {
    const db = req.app.get('db');
    const { nombre, descripcion, tipo } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    const permiso = await db.Permission.create({ nombre, descripcion, tipo });

    await registrarBitacora(db, {
      accion: 'create',
      entidad: 'permiso',
      entidad_id: permiso.id,
      usuario_id: req.user?.id ?? null,
      antes: null,
      despues: permiso.toJSON(),
      criticidad: nivelesCriticidad.seguridad,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json(permiso);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear permiso' });
  }
};

module.exports = { listPermissions, createPermission };
