const fs = require('fs');
const path = require('path');
const db = require('../server/config/db'); // Ruta actualizada al archivo de configuración de DB

// Leer el archivo schema.sql
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Ejecutar múltiples sentencias correctamente
db.query(schema)
  .then(() => {
    console.log('✅ Tablas creadas o actualizadas correctamente.');
    process.exit(0); // Un código 0 indica éxito
  })
  .catch(err => {
    console.error('❌ Error al crear las tablas:', err);
    console.error(err.stack); // Mostrar el stack trace completo para mejor diagnóstico
    process.exit(1); // Un código diferente de 0 indica error
  });
