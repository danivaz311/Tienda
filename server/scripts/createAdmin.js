const bcrypt = require('bcrypt');
const db = require('../config/db');

async function createAdmin() {
  try {
    // Verificar si ya existe un admin
    const checkAdmin = await db.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      ['admin@bookstore.com']
    );

    if (checkAdmin.rows.length > 0) {
      console.log('El administrador ya existe. No se creará uno nuevo.');
      return;
    }

    // Crear una contraseña segura
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insertar el usuario admin
    const result = await db.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol, direccion) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, correo, rol`,
      ['Administrador', 'admin@bookstore.com', hashedPassword, 'admin', 'Oficina Central']
    );

    console.log('Administrador creado exitosamente:');
    console.log({
      id: result.rows[0].id,
      nombre: result.rows[0].nombre,
      correo: result.rows[0].correo,
      rol: result.rows[0].rol
    });

  } catch (error) {
    console.error('Error al crear el administrador:', error);
  } finally {
    // Cerrar la conexión
    process.exit(0);
  }
}

// Ejecutar la función
createAdmin();