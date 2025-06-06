const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear una nueva orden
router.post('/', authMiddleware.verificarToken, async (req, res) => {
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
      // Asegúrate de que los nombres de las tablas sean correctos
      await client.query(
        `INSERT INTO detalle_orden (orden_id, libro_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [ordenId, item.id, item.cantidad, item.precio]
      );
      // Disminuir el stock del libro
      await client.query(
        'UPDATE libros SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.cantidad, item.id]
      );
    }

    await client.query('COMMIT');

    // Obtener el total de la orden
    const totalOrdenResult = await client.query(
      'SELECT SUM(d.cantidad * d.precio_unitario) as total FROM detalle_orden d WHERE d.orden_id = $1',
      [ordenId]
    );
    const totalOrden = totalOrdenResult.rows[0].total;

    res.status(201).json({
      id: ordenId,
      fecha: new Date(),
      mensaje: 'Orden creada correctamente',
      total: totalOrden
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la creación de la orden:', error);
    res.status(500).json({ error: 'Error al procesar la orden.' });
  } finally {
    client.release();
  }
});

// Obtener historial de órdenes del usuario autenticado
router.get('/', authMiddleware.verificarToken, async (req, res) => {
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
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial de compras' });
  }
});

// Obtener detalle de una orden específica
router.get('/:id', authMiddleware.verificarToken, async (req, res) => {
  try {
    const ordenId = req.params.id;
    const usuarioId = req.usuario.id;

    // Verificar que la orden pertenezca al usuario
    const ordenCheck = await db.query(
      'SELECT id FROM ordenes WHERE id = $1 AND usuario_id = $2',
      [ordenId, usuarioId]
    );

    if (ordenCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Obtener detalles de la orden
    const detalles = await db.query(`
      SELECT l.titulo, l.imagen, d.cantidad, d.precio_unitario, (d.cantidad * d.precio_unitario) as subtotal
      FROM detalle_orden d
      JOIN libros l ON d.libro_id = l.id
      WHERE d.orden_id = $1
    `, [ordenId]);

    // Obtener datos de la orden
    const orden = await db.query(`
      SELECT id, fecha, estado
      FROM ordenes
      WHERE id = $1
    `, [ordenId]);

    // Calcular total
    const total = detalles.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      orden: orden.rows[0],
      items: detalles.rows,
      total: total
    });

  } catch (error) {
    console.error('Error al obtener detalles de la orden:', error);
    res.status(500).json({ error: 'Error al obtener detalles de la orden' });
  }
});

// Ruta para administradores - listar todas las órdenes
router.get('/admin/all', authMiddleware.verificarToken, authMiddleware.verificarAdmin, async (req, res) => {
  try {
    const ordenes = await db.query(`
      SELECT o.id, o.fecha, o.estado, u.nombre as usuario,
             SUM(d.cantidad * d.precio_unitario) as total
      FROM ordenes o
      JOIN usuarios u ON o.usuario_id = u.id
      JOIN detalle_orden d ON o.id = d.orden_id
      GROUP BY o.id, u.nombre
      ORDER BY o.fecha DESC
    `);

    res.json(ordenes.rows);
  } catch (error) {
    console.error('Error al obtener todas las órdenes:', error);
    res.status(500).json({ error: 'Error al obtener listado de órdenes' });
  }
});

module.exports = router;
