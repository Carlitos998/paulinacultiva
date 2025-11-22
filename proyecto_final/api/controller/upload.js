const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para subir archivos
const uploadsDir = path.join(__dirname, '../uploads');

// Asegurarse de que la carpeta uploads exista
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para el archivo (igual que Noa)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'recipe-' + uniqueSuffix + ext);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

// Middleware para subir una sola imagen
const uploadImage = upload.single('image');

// Middleware para subir una foto (para recetas) - Eliminado, ahora se usa middlewares/upload.js
// const uploadFoto = upload.single('foto');

const uploadImageHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }

    // Construir la URL de la imagen
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: 'Imagen subida exitosamente',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  uploadImageHandler
};