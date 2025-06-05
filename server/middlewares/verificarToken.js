const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó el encabezado Authorization.' });
  }

  const token = authHeader.split(' ')[1]; // Se espera: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado en el encabezado Authorization.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Aquí se guarda el payload del token (ej. id del usuario)
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = verificarToken;
