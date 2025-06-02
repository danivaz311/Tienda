const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { verificarToken } = require('../middlewares/authMiddleware');

// Agregar libro al carrito
router.post('/add', verificarToken, async (req, res) => {
  const { libro_id, cantidad } = req.body;
  const usuario_id = req.usuario.id;

  try {
    const result = await db.query(
      'INSERT INTO carrito (usuario_id, libro_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, libro_id, cantidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
});

// Ver carrito del usuario
router.get('/', verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    const result = await db.query(
      `SELECT c.id, l.titulo, l.precio, c.cantidad
       FROM carrito c
       JOIN libros l ON c.libro_id = l.id
       WHERE c.usuario_id = $1`,
      [usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// Eliminar un libro del carrito
router.delete('/:id', verificarToken, async (req, res) => {
  const carrito_id = req.params.id;
  const usuario_id = req.usuario.id;

  try {
    const result = await db.query(
      'DELETE FROM carrito WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [carrito_id, usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado o no autorizado' });
    }

    res.json({ mensaje: 'Elemento eliminado del carrito', eliminado: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
});



module.exports = router;
