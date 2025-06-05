const { Pool } = require('pg');
require('dotenv').config();

// Validación de la cadena de conexión
if (!process.env.DATABASE_URL) {
  console.error('Error: La variable de entorno DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // importante para Railway
  }
});

// Evento para verificar conexión inicial
pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL');
});

// Capturar errores de conexión
pool.on('error', (err) => {
  console.error('Error de conexión a PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool, // Exportar el pool por si es necesario
};