const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Obtener todos los libros (público)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM libros');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener libros:', err);
    res.status(500).json({ error: 'Error al obtener libros' });
  }
});

// Agregar un nuevo libro (admin)
router.post('/', async (req, res) => {
  const { titulo, autor, precio, stock } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO libros (titulo, autor, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, autor, precio, stock]
    );
    res.status(201).json({ mensaje: 'Libro agregado', libro: result.rows[0] });
  } catch (err) {
    console.error('Error al agregar libro:', err);
    res.status(500).json({ error: 'Error al agregar el libro' });
  }
});

// Editar un libro por ID (admin)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, precio, stock } = req.body;

  try {
    const result = await db.query(
      'UPDATE libros SET titulo = $1, autor = $2, precio = $3, stock = $4 WHERE id = $5 RETURNING *',
      [titulo, autor, precio, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json({ mensaje: 'Libro actualizado', libro: result.rows[0] });
  } catch (err) {
    console.error('Error al editar libro:', err);
    res.status(500).json({ error: 'Error al editar el libro' });
  }
});

// Eliminar un libro por ID (admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM libros WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json({ mensaje: 'Libro eliminado', libro: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar libro:', err);
    res.status(500).json({ error: 'Error al eliminar el libro' });
  }
});

module.exports = router;


// Middleware para verificar token y que sea administrador
function verificarAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// 🔄 Editar libro
router.put('/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, precio, stock } = req.body;

  try {
    const result = await db.query(
      'UPDATE libros SET titulo = $1, autor = $2, precio = $3, stock = $4 WHERE id = $5 RETURNING *',
      [titulo, autor, precio, stock, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json({ mensaje: 'Libro actualizado', libro: result.rows[0] });
  } catch (err) {
    console.error('Error al editar libro:', err);
    res.status(500).json({ error: 'Error al editar libro' });
  }
});

// ❌ Eliminar libro
router.delete('/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM libros WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json({ mensaje: 'Libro eliminado', libro: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar libro:', err);
    res.status(500).json({ error: 'Error al eliminar libro' });
  }
});
