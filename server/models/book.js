const db = require('../config/db');
const validation = require('../utils/validation'); // Importar validaciones

class Book {
  // Obtener todos los libros
  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM libros ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Error al obtener todos los libros:', error);
      throw error;
    }
  }

  // Buscar un libro por su ID
  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM libros WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al buscar libro por ID:', error);
      throw error;
    }
  }

  // Crear un nuevo libro con validaciones
  static async create(bookData) {
    const { titulo, autor, descripcion, precio, imagen, stock, isbn } = bookData;
    
    // Validar campos requeridos
    const requiredCheck = validation.validateRequired(bookData, ['titulo', 'autor', 'precio']);
    if (!requiredCheck.valid) {
      throw new Error(requiredCheck.message);
    }
    
    // Validar precio
    if (!validation.isValidPrice(precio)) {
      throw new Error('El precio debe ser un valor positivo con máximo 2 decimales');
    }
    
    // Validar ISBN si está presente
    if (isbn && !validation.isValidISBN(isbn)) {
      throw new Error('El formato del ISBN no es válido');
    }
    
    try {
      // Sanitizar textos
      const tituloSanitizado = validation.sanitizeText(titulo);
      const autorSanitizado = validation.sanitizeText(autor);
      const descripcionSanitizada = validation.sanitizeText(descripcion || '');
      const imagenSanitizada = validation.sanitizeText(imagen || '');
      
      // Validar que stock sea numérico
      const stockValidado = validation.isNumeric(stock) ? stock : 0;
      
      const result = await db.query(
        'INSERT INTO libros (titulo, autor, descripcion, precio, imagen, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [tituloSanitizado, autorSanitizado, descripcionSanitizada, precio, imagenSanitizada, stockValidado]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear libro:', error);
      throw error;
    }
  }
  
  // Actualizar un libro existente con validaciones
  static async update(id, bookData) {
    const { titulo, autor, descripcion, precio, imagen, stock, isbn } = bookData;
    
    // Las mismas validaciones que en create
    if (precio && !validation.isValidPrice(precio)) {
      throw new Error('El precio debe ser un valor positivo con máximo 2 decimales');
    }
    
    if (isbn && !validation.isValidISBN(isbn)) {
      throw new Error('El formato del ISBN no es válido');
    }
    
    try {
      // Sanitizar textos
      const tituloSanitizado = validation.sanitizeText(titulo);
      const autorSanitizado = validation.sanitizeText(autor);
      const descripcionSanitizada = validation.sanitizeText(descripcion || '');
      const imagenSanitizada = validation.sanitizeText(imagen || '');
      
      // Validar que stock sea numérico
      const stockValidado = validation.isNumeric(stock) ? stock : 0;
      
      // Resto igual que antes
      const result = await db.query(
        'UPDATE libros SET titulo = $1, autor = $2, descripcion = $3, precio = $4, imagen = $5, stock = $6 WHERE id = $7 RETURNING *',
        [tituloSanitizado, autorSanitizado, descripcionSanitizada, precio, imagenSanitizada, stockValidado, id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al actualizar libro:', error);
      throw error;
    }
  }
  
  // Eliminar un libro
  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM libros WHERE id = $1 RETURNING *', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      throw error;
    }
  }
}

module.exports = Book;