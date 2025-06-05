const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const authMiddleware = require('./server/middlewares/authMiddleware');
const fs = require('fs');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Crear directorio para uploads si no existe
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Directorio de uploads creado:', uploadsDir);
}

// Configuración de middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('public'));

// Ruta API básica
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API funcionando correctamente' });
});

// Middleware para proteger rutas
app.use((req, res, next) => {
  if (authMiddleware.requiereAutenticacion(req)) {
    return authMiddleware.verificarToken(req, res, next);
  }
  next();
});

// Rutas para servir archivos HTML
app.get('/:page.html', (req, res) => {
  const pageName = req.params.page;
  res.sendFile(path.resolve(__dirname, 'public', 'views', `${pageName}.html`));
});

// Redirección para la ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'views', 'index.html'));
});

// Rutas API
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/libros', require('./server/routes/books'));
app.use('/api/carrito', require('./server/routes/cart'));
app.use('/api/orden', require('./server/routes/orden'));
app.use('/api/ordenes', require('./server/routes/orden'));
app.use('/api/admin', authMiddleware.verificarAdmin, require('./server/routes/admin'));
app.use('/api/upload', require('./server/routes/upload'));

// Middleware para manejar rutas no encontradas
// Debe ir AL FINAL de todas las demás rutas
app.use((req, res, next) => {
  // Verificar si la solicitud es para un archivo estático
  // o si es una solicitud de API
  if (req.path.startsWith('/api/')) {
    // Para solicitudes de API, devolver un error JSON
    return res.status(404).json({ error: 'Ruta API no encontrada' });
  } else if (req.accepts('html')) {
    // Para solicitudes de página, redirigir a 404.html
    res.status(404).sendFile(path.join(__dirname, 'public', 'views', '404.html'));
  } else {
    // Para otros tipos de solicitudes (por ejemplo, JSON)
    res.status(404).send('Not found');
  }
});

// Manejador de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'public', 'views', 'error.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
