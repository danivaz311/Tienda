/**
 * Configuración de autenticación
 * Este archivo contiene constantes y configuraciones relacionadas con la autenticación
 */

module.exports = {
  // Clave secreta para firmar los JWT (normalmente se obtiene de variables de entorno)
  JWT_SECRET: process.env.JWT_SECRET || 'secreto_super_seguro',
  
  // Duración del token JWT
  TOKEN_EXPIRATION: '2h', // Tiempo de vida del token
  
  // Opciones de configuración de cookies
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7200000, // 2 horas en milisegundos
    sameSite: 'strict'
  },
  
  // Algoritmo de hash para bcrypt
  BCRYPT_SALT_ROUNDS: 10,
  
  // Roles de usuario disponibles
  ROLES: {
    ADMIN: 'admin',
    CLIENTE: 'cliente'
  },
  
  // Rutas protegidas que requieren autenticación
  PROTECTED_ROUTES: [
    '/api/usuarios/perfil',
    '/api/ordenes',
    '/api/carrito'
  ],
  
  // Rutas que requieren ser administrador
  ADMIN_ROUTES: [
    '/api/libros/crear',
    '/api/libros/editar',
    '/api/libros/eliminar',
    '/api/usuarios/listar'
  ]
};