const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueFileName);
  }
});

// Filtro para archivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: fileFilter
});

// Para depuración
router.use((req, res, next) => {
  console.log(`Solicitud a /api/upload: ${req.method}`);
  next();
});

// Ruta simplificada sin verificación de token
router.post('/', upload.single('imagen'), (req, res) => {
  try {
    console.log('Procesando solicitud de subida de imagen');
    console.log('Archivo recibido:', req.file);
    
    if (!req.file) {
      console.log('No se recibió ningún archivo');
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }
    
    // Devolver la URL relativa
    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log('Imagen guardada correctamente:', imageUrl);
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

module.exports = router;