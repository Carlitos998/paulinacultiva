// middlewares/index.js
const jwt = require('jsonwebtoken');
const SECRET = 'misecreto';

const isAuth = async (req, res, next) => {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  if (!header) return res.status(401).json({ message: "Token no proporcionado" });

  const parts = header.split(' ');
  const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : header;

  try {
    const decoded = jwt.verify(token, SECRET);
    const db = req.app.get('db');
    if (!db || !db.User) return res.status(500).json({ message: "DB no inicializada" });

    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "No autenticado" });
  if (!req.user.isAdmin) return res.status(403).json({ message: "No tenes permisos de admin" });
  next();
};

const canRatePost = async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;
    const postId = req.params.postId;
    if (!db || !db.Calification) return res.status(500).json({ message: "DB no inicializada" });

    const existing = await db.Calification.findOne({ where: { userId, postId } });
    if (existing) return res.status(400).json({ message: "Ya calificaste este post" });
    next();
  } catch (err) {
    return res.status(500).json({ message: "Error del servidor" });
  }
};

const checkUserStatus = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "No autenticado" });
  if (req.user.estado && req.user.estado !== 'activo') {
    return res.status(403).json({ message: `Usuario ${req.user.estado}, acceso denegado` });
  }
  next();
};

const isOwnerOfComment = async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;
    const commentId = req.params.commentId;
    if (!db || !db.Comment) return res.status(500).json({ message: "DB no inicializada" });

    const comment = await db.Comment.findByPk(commentId);
    if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

    if (comment.autorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para modificar este comentario" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "Error del servidor" });
  }
};

const isOwnerOfPost = async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;
    const postId = req.params.postId;
    if (!db || !db.Post) return res.status(500).json({ message: "DB no inicializada" });

    const post = await db.Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    if (post.autorId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para modificar este post" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = {
  isAuth,
  isAdmin,
  canRatePost,
  checkUserStatus,
  isOwnerOfComment,
  isOwnerOfPost,
  SECRET
};
