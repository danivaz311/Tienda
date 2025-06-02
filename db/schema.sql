-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  correo TEXT UNIQUE,
  contrasena TEXT,
  rol TEXT DEFAULT 'cliente'
);

-- Tabla de libros
CREATE TABLE IF NOT EXISTS libros (
  id SERIAL PRIMARY KEY,
  titulo TEXT,
  autor TEXT,
  precio NUMERIC,
  stock INTEGER
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT NOW()
);

-- Detalle de órdenes (cada libro dentro de una orden)
CREATE TABLE IF NOT EXISTS detalle_orden (
  id SERIAL PRIMARY KEY,
  orden_id INTEGER REFERENCES ordenes(id),
  libro_id INTEGER REFERENCES libros(id),
  cantidad INTEGER,
  precio_unitario NUMERIC
);
