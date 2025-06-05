const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarToken } = require('../middlewares/authMiddleware');

// Agregar libro al carrito
router.post('/add', verificarToken, async (req, res) => {
  const { libro_id, cantidad = 1 } = req.body;
  const usuario_id = req.usuario.id;

  if (!libro_id) {
    return res.status(400).json({ error: 'ID del libro es obligatorio' });
  }

  try {
    // Verificar si el libro ya está en el carrito
    const existente = await db.query(
      'SELECT * FROM carrito WHERE usuario_id = $1 AND libro_id = $2',
      [usuario_id, libro_id]
    );

    if (existente.rows.length > 0) {
      // Si existe, aumentar la cantidad
      const nuevaCantidad = existente.rows[0].cantidad + cantidad;
      const result = await db.query(
        'UPDATE carrito SET cantidad = $1 WHERE usuario_id = $2 AND libro_id = $3 RETURNING *',
        [nuevaCantidad, usuario_id, libro_id]
      );
      return res.json({ 
        mensaje: 'Cantidad actualizada en el carrito',
        item: result.rows[0]
      });
    }

    // Si no existe, insertar nuevo
    const result = await db.query(
      'INSERT INTO carrito (usuario_id, libro_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, libro_id, cantidad]
    );
    res.status(201).json({
      mensaje: 'Libro añadido al carrito',
      item: result.rows[0]
    });
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
      `SELECT c.id, c.libro_id, l.titulo, l.autor, l.imagen, l.precio, c.cantidad, 
              (l.precio * c.cantidad) as subtotal
       FROM carrito c
       JOIN libros l ON c.libro_id = l.id
       WHERE c.usuario_id = $1`,
      [usuario_id]
    );
    
    // Calcular total general
    const total = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    
    res.json({
      items: result.rows,
      total: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// Actualizar cantidad de un libro en el carrito
router.put('/:id', verificarToken, async (req, res) => {
  const carrito_id = req.params.id;
  const usuario_id = req.usuario.id;
  const { cantidad } = req.body;
  
  if (!cantidad || cantidad < 1) {
    return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
  }

  try {
    const result = await db.query(
      'UPDATE carrito SET cantidad = $1 WHERE id = $2 AND usuario_id = $3 RETURNING *',
      [cantidad, carrito_id, usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado o no autorizado' });
    }

    res.json({ mensaje: 'Cantidad actualizada', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cantidad en el carrito' });
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

// Vaciar todo el carrito
router.delete('/', verificarToken, async (req, res) => {
  const usuario_id = req.usuario.id;

  try {
    const result = await db.query(
      'DELETE FROM carrito WHERE usuario_id = $1 RETURNING *',
      [usuario_id]
    );

    res.json({ 
      mensaje: 'Carrito vaciado correctamente',
      elementosEliminados: result.rowCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
});

module.exports = router;
