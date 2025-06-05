const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Ruta de dashboard del admin - estadísticas generales
router.get('/dashboard', async (req, res) => {
  try {
    // Contar usuarios
    const usuariosQuery = await db.query('SELECT COUNT(*) AS total FROM usuarios');
    
    // Contar libros
    const librosQuery = await db.query('SELECT COUNT(*) AS total FROM libros');
    
    // Contar libros con stock bajo (menos de 5)
    const stockBajoQuery = await db.query(
      'SELECT COUNT(*) AS total FROM libros WHERE stock < 5'
    );
    
    // Contar órdenes
    const ordenesQuery = await db.query('SELECT COUNT(*) AS total FROM ordenes');
    
    // Calcular ventas totales
    const ventasQuery = await db.query(`
      SELECT SUM(l.precio * d.cantidad) AS total 
      FROM detalle_orden d
      JOIN libros l ON d.libro_id = l.id
    `);
    
    res.json({
      usuarios_registrados: parseInt(usuariosQuery.rows[0].total),
      libros_total: parseInt(librosQuery.rows[0].total),
      libros_stock_bajo: parseInt(stockBajoQuery.rows[0].total),
      ordenes_total: parseInt(ordenesQuery.rows[0].total),
      ventas_totales: parseFloat(ventasQuery.rows[0].total || 0)
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al cargar los datos del dashboard' });
  }
});

// Obtener todos los usuarios (solo admin)
router.get('/usuarios', async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, correo, rol FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Cambiar rol de un usuario (solo admin)
router.put('/usuarios/:id/rol', async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  
  if (!rol || !['admin', 'cliente'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "admin" o "cliente"' });
  }
  
  try {
    const result = await db.query(
      'UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, correo, rol',
      [rol, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
});

// Crear un nuevo usuario admin (solo superadmin)
router.post('/crear-admin', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  
  // Validar los datos
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  try {
    // Verificar si el correo ya existe
    const checkUser = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    // Crear el usuario admin
    const result = await db.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol) 
       VALUES ($1, $2, $3, 'admin') RETURNING id, nombre, correo, rol`,
      [nombre, correo, hashedPassword]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear admin:', error);
    res.status(500).json({ error: 'Error al crear admin' });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', async (req, res) => {
  const userId = req.params.id;
  
  // Evitar eliminar al propio admin que hace la solicitud
  if (req.usuario && parseInt(userId) === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }
  
  try {
    // Primero eliminar las relaciones (carrito, órdenes, etc.)
    await db.query('DELETE FROM carrito WHERE usuario_id = $1', [userId]);
    
    // Eliminar las órdenes y su detalle es más complejo y podría requerir un enfoque transaccional
    // Por simplicidad aquí, pero considera implementar una estrategia más robusta
    
    // Finalmente eliminar el usuario
    const result = await db.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
      mensaje: `Usuario eliminado correctamente`,
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Listar todas las órdenes para administración
router.get('/ordenes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.id, o.fecha, o.estado, u.nombre as usuario,
             SUM(d.cantidad * l.precio) as total
      FROM ordenes o
      JOIN usuarios u ON o.usuario_id = u.id
      JOIN detalle_orden d ON o.id = d.orden_id
      JOIN libros l ON d.libro_id = l.id
      GROUP BY o.id, u.nombre
      ORDER BY o.fecha DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    res.status(500).json({ error: 'Error al cargar la lista de órdenes' });
  }
});

// Actualizar estado de una orden
router.patch('/ordenes/:id/estado', async (req, res) => {
  const ordenId = req.params.id;
  const { estado } = req.body;
  
  if (!estado || !['pendiente', 'enviado', 'entregado', 'cancelado'].includes(estado)) {
    return res.status(400).json({ 
      error: 'Estado inválido. Debe ser: pendiente, enviado, entregado o cancelado' 
    });
  }
  
  try {
    const result = await db.query(
      'UPDATE ordenes SET estado = $1 WHERE id = $2 RETURNING id, fecha, estado',
      [estado, ordenId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json({
      mensaje: `Estado de orden actualizado correctamente`,
      orden: result.rows[0]
    });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    res.status(500).json({ error: 'Error al actualizar el estado de la orden' });
  }
});

module.exports = router;