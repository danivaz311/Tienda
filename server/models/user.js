const db = require('../config/db');
const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');
const validation = require('../utils/validation'); // Importar validaciones

class User {
  // Buscar un usuario por su correo electrónico
  static async findByEmail(email) {
    try {
      const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }

  // Buscar un usuario por su ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Crear un nuevo usuario con validaciones
  static async create(userData) {
    const { nombre, correo, contrasena, rol = authConfig.ROLES.CLIENTE } = userData;
    
    // Validar campos requeridos
    const requiredCheck = validation.validateRequired(userData, ['nombre', 'correo', 'contrasena']);
    if (!requiredCheck.valid) {
      throw new Error(requiredCheck.message);
    }
    
    // Validar formato de correo
    if (!validation.isValidEmail(correo)) {
      throw new Error('El formato de correo electrónico no es válido');
    }
    
    // Validar contraseña segura (opcional - descomentar si quieres asegurar contraseñas fuertes)
    /*
    if (!validation.isStrongPassword(contrasena)) {
      throw new Error('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números');
    }
    */
    
    try {
      // Sanitizar nombre
      const nombreSanitizado = validation.sanitizeText(nombre);
      
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contrasena, authConfig.BCRYPT_SALT_ROUNDS);
      
      const result = await db.query(
        'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING *',
        [nombreSanitizado, correo, hashedPassword, rol]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Verificar credenciales (login)
  static async verifyCredentials(email, password) {
    try {
      const user = await this.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      const passwordMatch = await bcrypt.compare(password, user.contrasena);
      
      return passwordMatch ? user : null;
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      throw error;
    }
  }
}

module.exports = User;