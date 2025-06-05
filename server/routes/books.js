const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas (no requieren autenticación)
router.get('/', booksController.getAllBooks); // GET /api/libros - Obtener todos los libros
router.get('/:id', booksController.getBookById); // GET /api/libros/:id - Obtener un libro por ID

// Rutas protegidas (solo para administradores)
router.post('/', authMiddleware.verificarToken, authMiddleware.verificarAdmin, booksController.createBook);
router.put('/:id', authMiddleware.verificarToken, authMiddleware.verificarAdmin, booksController.updateBook);
router.delete('/:id', authMiddleware.verificarToken, authMiddleware.verificarAdmin, booksController.deleteBook);

module.exports = router;
