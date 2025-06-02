const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secreto_super_seguro'; // ¡Reemplaza esto por una variable de entorno en producción!

// Verifica si el token es válido
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ mensaje: 'Token inválido' });

    req.usuario = user;
    next();
  });
}

// Verifica si el usuario tiene rol administrador
function verificarAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
  }
  next();
}

module.exports = {
  verificarToken,
  verificarAdmin
};
