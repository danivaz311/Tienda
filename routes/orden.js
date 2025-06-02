const express = require('express');
const router = express.Router();
const db = require('../db/db');
const verificarToken = require('../middlewares/verificarToken');

// Crear una nueva orden
router.post('/', verificarToken, async (req, res) => {
  const carrito = req.body.carrito;
  const usuario_id = req.usuario.id;

  if (!Array.isArray(carrito) || carrito.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío.' });
  }
const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Insertar en tabla ordenes
    
    const insertOrden = await client.query(
  'INSERT INTO ordenes (usuario_id) VALUES ($1) RETURNING id, fecha',
  [usuario_id]
);

    const ordenId = insertOrden.rows[0].id;
    const fecha = insertOrden.rows[0].fecha;

    // Insertar cada libro en la tabla detalle_orden
    for (const item of carrito) {
      await client.query(
        `INSERT INTO detalle_orden (orden_id, libro_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [ordenId, item.id, item.cantidad, item.precio]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Orden creada correctamente', ordenId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la creación de la orden:', error);
    res.status(500).json({ error: 'Error al procesar la orden.' });
  } finally {
    client.release();
  }
});



router.get('/ordenes', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const ordenes = await db.query(`
      SELECT o.id, o.fecha, l.titulo, d.cantidad, d.precio_unitario
      FROM ordenes o
      JOIN detalle_orden d ON o.id = d.orden_id
      JOIN libros l ON d.libro_id = l.id
      WHERE o.usuario_id = $1
      ORDER BY o.fecha DESC
    `, [usuarioId]);

    res.json(ordenes.rows);
   res.status(201).json({ id: ordenId, fecha });
  
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial de compras' });
  }
});

module.exports = router;
