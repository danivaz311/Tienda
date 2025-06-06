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

ALTER TABLE detalle_orden
  DROP CONSTRAINT IF EXISTS detalle_orden_libro_id_fkey,
  ADD CONSTRAINT detalle_orden_libro_id_fkey
  FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE;

ALTER TABLE carrito
DROP CONSTRAINT IF EXISTS carrito_libro_id_fkey,
ADD CONSTRAINT carrito_libro_id_fkey
  FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE;

ALTER TABLE ordenes_detalle
DROP CONSTRAINT IF EXISTS ordenes_detalle_libro_id_fkey,
ADD CONSTRAINT ordenes_detalle_libro_id_fkey
  FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE;
