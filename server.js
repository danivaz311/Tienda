const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const booksRoutes = require('./routes/books');
const ordenRoutes = require('./routes/orden');

require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cart', cartRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/orden', ordenRoutes);


// Ruta de prueba POST
app.post('/prueba', (req, res) => {
  console.log(req.body);
  res.json({ mensaje: 'POST recibido correctamente' });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando ✅');
});
