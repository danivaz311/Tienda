const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { verificarToken } = require('../middlewares/authMiddleware');

// Verifica que el usuario sea admin
function verificarAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado: se requiere rol admin' });
  }
  next();
}

// Ruta para agregar un libro
router.post('/books', verificarToken, verificarAdmin, async (req, res) => {
  const { titulo, autor, precio, stock } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO libros (titulo, autor, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, autor, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error detallado al agregar libro:', err);  // Te mostrará el error real
    res.status(500).json({ error: 'Error al agregar el libro' });
  }
});

module.exports = router;
