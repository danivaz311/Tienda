const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const router = express.Router();

// Clave secreta para firmar tokens (debería estar en una variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

// Registro de usuario
router.post('/register', async (req, res) => {
  const { nombre, correo, contrasena, rol = 'cliente' } = req.body;

  // Validación de datos
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }

  try {
    // Encriptación de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Inserción en la base de datos
    const result = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, correo, hashedPassword, rol]
    );

    res.status(201).json({ mensaje: 'Usuario registrado', usuario: result.rows[0] });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Correo no registrado' });
    }

    const usuario = result.rows[0];
    const match = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensaje: 'Inicio de sesión exitoso', token });
  } catch (err) {
    console.error('Error en inicio de sesión:', err);
    res.status(500).json({ error: 'Error interno en el inicio de sesión' });
  }
});

module.exports = router;
