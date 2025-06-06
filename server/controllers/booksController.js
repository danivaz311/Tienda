const Book = require('../models/book');

// Obtener todos los libros
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.getAll();
    res.json(books);
  } catch (err) {
    console.error('Error al obtener libros:', err);
    res.status(500).json({ error: 'Error al obtener la lista de libros' });
  }
};

// Obtener un libro por ID
const getBookById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    res.json(book);
  } catch (err) {
    console.error(`Error al obtener libro con id ${id}:`, err);
    res.status(500).json({ error: 'Error al obtener el libro' });
  }
};

// Crear un nuevo libro
const createBook = async (req, res) => {
  try {
    // La validación ahora se maneja en el modelo Book
    const book = await Book.create(req.body);
    res.status(201).json({ mensaje: 'Libro creado exitosamente', libro: book });
  } catch (err) {
    console.error('Error al crear libro:', err);
    
    // Errores de validación desde el modelo
    if (err.message.includes('obligatorios') || 
        err.message.includes('precio') ||
        err.message.includes('ISBN')) {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Error al crear el libro' });
  }
};

// Actualizar un libro
const updateBook = async (req, res) => {
  const { id } = req.params;
  
  try {
    const book = await Book.update(id, req.body);
    
    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    res.json({ mensaje: 'Libro actualizado exitosamente', libro: book });
  } catch (err) {
    console.error(`Error al actualizar libro con id ${id}:`, err);
    res.status(500).json({ error: 'Error al actualizar el libro' });
  }
};

// Eliminar un libro
const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Book.delete(id);
    if (!result || result.rowCount === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json({ mensaje: 'Libro eliminado correctamente' });
  } catch (err) {
    console.error(`Error al eliminar libro con id ${id}:`, err);
    // Manejo especial para error de clave foránea
    if (err.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar el libro porque está relacionado con otras entidades.' });
    }
    res.status(500).json({ error: 'Error al eliminar el libro' });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};