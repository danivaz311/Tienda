const fs = require('fs');
const db = require('./db');

// Leer el archivo schema.sql
const schema = fs.readFileSync(__dirname + '/schema.sql', 'utf8');

// Ejecutar múltiples sentencias correctamente
db.query(schema)
  .then(() => {
    console.log('✅ Tablas creadas o actualizadas correctamente.');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error al crear las tablas:', err);
    process.exit(1);
  });
