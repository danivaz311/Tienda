const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

// Verifica si el token es válido
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó el encabezado Authorization.' });
  }

  const token = authHeader.split(' ')[1]; // Se espera: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // Usar la clave JWT_SECRET desde authConfig
  try {
    const decoded = jwt.verify(token, authConfig.JWT_SECRET);
    
    // Información de depuración (solo desarrollo)
    console.log('Token decodificado:', {
      id: decoded.id,
      rol: decoded.rol,
      expiración: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expira'
    });
    
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error de verificación de token:', error.name, error.message);
    
    // Proporcionar mensajes de error más específicos
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido. Por favor, inicia sesión nuevamente.',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({ 
      error: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
      code: 'AUTH_ERROR'
    });
  }
}

// Verifica si el usuario tiene rol administrador
function verificarAdmin(req, res, next) {
  // Usar las constantes de roles desde authConfig
  if (req.usuario.rol !== authConfig.ROLES.ADMIN) {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

// Comprobar si una ruta requiere autenticación
function requiereAutenticacion(req) {
  const protectedRoutes = ['/api/admin', '/api/ordenes', '/api/usuario'];
  return protectedRoutes.some(route => req.path.startsWith(route));
}

module.exports = {
  verificarToken,
  verificarAdmin,
  requiereAutenticacion
};
