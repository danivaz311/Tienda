const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

// Controlador para registro de usuario
const register = async (req, res) => {
  try {
    // Las validaciones detalladas ahora están en el modelo User
    const user = await User.create(req.body);
    
    // Eliminamos la contraseña hash antes de enviar la respuesta
    const { contrasena, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente', 
      usuario: userWithoutPassword 
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    
    // Identificar el tipo de error para dar respuestas más específicas
    if (err.message.includes('obligatorios') || 
        err.message.includes('correo electrónico') ||
        err.message.includes('contraseña')) {
      return res.status(400).json({ error: err.message });
    }
    
    // Si el error es de duplicación (correo ya existe)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }
    
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
};

// Controlador para inicio de sesión
const login = async (req, res) => {
  const { correo, contrasena } = req.body;
  
  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }
  
  try {
    // El modelo User verifica las credenciales
    const user = await User.verifyCredentials(correo, contrasena);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        correo: user.correo, 
        rol: user.rol,
        nombre: user.nombre  // Añadir esta línea para incluir el nombre
      },
      authConfig.JWT_SECRET,
      { expiresIn: authConfig.TOKEN_EXPIRATION }
    );
    
    res.json({ 
      mensaje: 'Inicio de sesión exitoso', 
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error('Error en inicio de sesión:', err);
    res.status(500).json({ error: 'Error interno en el inicio de sesión' });
  }
};

module.exports = {
  register,
  login
};