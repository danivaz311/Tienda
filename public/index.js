document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
  const bienvenida = document.getElementById('bienvenida');
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  const notification = document.getElementById('notification');
  
  // Verificar autenticación
  checkAuth();
  
  // Cargar libros
  cargarLibros();
  
  // Menu responsive
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  
  // Cerrar menú al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
  
  // Dropdowns para móviles
  dropdownItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.classList.toggle('active');
      }
    });
  });
  
  // Cerrar sesión
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('carrito');
      showNotification('Sesión cerrada correctamente');
      setTimeout(() => window.location.href = 'index.html', 1000);
    });
  }
  
  // Hacer la función accesible globalmente
  window.agregarAlCarrito = agregarAlCarrito;
});

// Verificar autenticación
function checkAuth() {
  const token = localStorage.getItem('token');
  const authElements = document.querySelectorAll('.auth-only');
  const logoutLink = document.getElementById('logout-link');
  const loginLink = document.getElementById('login-link');
  const bienvenida = document.getElementById('bienvenida');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      bienvenida.innerHTML = `
        <h2>Bienvenido, ${payload.correo}</h2>
        <p>Tu rol: ${payload.rol}</p>
      `;
      
      // Mostrar elementos para autenticados
      authElements.forEach(el => el.style.display = 'block');
      
      // Mostrar opción de cerrar sesión
      if (logoutLink) logoutLink.style.display = 'block';
      if (loginLink) loginLink.style.display = 'none';
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      localStorage.removeItem('token');
    }
  } else {
    // Ocultar elementos para autenticados
    authElements.forEach(el => el.style.display = 'none');
    
    // Mostrar opción de iniciar sesión
    if (logoutLink) logoutLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'block';
  }
}

// Mostrar libros
function mostrarLibros(libros) {
  const contenedor = document.getElementById('libros');
  contenedor.innerHTML = '';
  
  libros.forEach(libro => {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
      <div class="book-image">
        <i class="fas fa-book"></i>
      </div>
      <div class="book-info">
        <h3 class="book-title">${libro.titulo}</h3>
        <p class="book-author">${libro.autor}</p>
        <p class="book-price">$${libro.precio.toFixed(2)}</p>
        <button class="add-to-cart" onclick="agregarAlCarrito(${libro.id}, '${libro.titulo.replace(/'/g, "\\'")}', ${libro.precio})">
          <i class="fas fa-cart-plus"></i> Agregar
        </button>
      </div>
    `;
    contenedor.appendChild(bookCard);
  });
}

// Cargar libros desde la base de datos
async function cargarLibros() {
  try {
    const response = await fetch('/api/books');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const libros = await response.json();
    mostrarLibros(libros);
    
  } catch (error) {
    console.error('Error al cargar libros:', error);
    document.getElementById('libros').innerHTML = `
      <div class="error-message">
        <p>No se pudieron cargar los libros. Por favor, inténtalo de nuevo más tarde.</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}

// Mostrar libros en pantalla
function mostrarLibros(libros) {
  const contenedor = document.getElementById('libros');
  contenedor.innerHTML = '';

  libros.forEach(libro => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${libro.titulo}</strong><br>
      Autor: ${libro.autor}<br>
      Precio: $${libro.precio}<br>
      <button onclick="agregarAlCarrito(${libro.id}, '${libro.titulo}', ${libro.precio})">
        Agregar al carrito
      </button>
      <hr>
    `;
    contenedor.appendChild(div);
  });
}

// Agregar al carrito
function agregarAlCarrito(id, titulo, precio) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const existente = carrito.find(item => item.id === id);
  
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id, titulo, precio, cantidad: 1 });
  }
  
  localStorage.setItem('carrito', JSON.stringify(carrito));
  showNotification(`"${titulo}" agregado al carrito`);
}

// Mostrar notificación
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}