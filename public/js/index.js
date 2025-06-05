document.addEventListener('DOMContentLoaded', function () {
  // Elementos del DOM
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  const bienvenida = document.getElementById('bienvenida');
  window.notification = document.getElementById('notification');

  // Inicializar contador del carrito
  actualizarContadorCarrito();
  
  // Cargar libros
  cargarLibros();

  // Verificar autenticación
  checkAuth();

  // Menú responsive
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
    item.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.classList.toggle('active');
      }
    });
  });

  // Cerrar sesión
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('carrito');
      showNotification('Sesión cerrada correctamente');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    });
  }

  // Hacer la función accesible globalmente
  window.agregarAlCarrito = agregarAlCarrito;
});

// Verificar autenticación
function checkAuth() {
  const token = localStorage.getItem('token');
  const bienvenida = document.getElementById('bienvenida');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Usuario autenticado - aplicar clase logged-in
      document.body.classList.add('logged-in');
      
      // Si es administrador, aplicar también la clase admin-user
      if (payload.rol === 'admin') {
        document.body.classList.add('admin-user');
      }
      
      // Actualizar mensaje de bienvenida
      if (bienvenida) {
        const saludo = payload.rol === 'admin' ? 
          `<h2>Bienvenido, Administrador ${payload.nombre || payload.correo}</h2>` : 
          `<h2>Bienvenido, ${payload.nombre || payload.correo}</h2>`;
        
        bienvenida.innerHTML = saludo;
      }
      
    } catch (error) {
      console.error('Error al decodificar token:', error);
      localStorage.removeItem('token');
      document.body.classList.remove('logged-in');
      document.body.classList.remove('admin-user');
      
      if (bienvenida) {
        bienvenida.innerHTML = 'Bienvenido a nuestra tienda de libros';
      }
    }
  } else {
    // Usuario no autenticado
    document.body.classList.remove('logged-in');
    document.body.classList.remove('admin-user');
    
    if (bienvenida) {
      bienvenida.innerHTML = 'Bienvenido a nuestra tienda de libros';
    }
  }
  
  // Actualizar contador del carrito (si existe)
  actualizarContadorCarrito();
}

// Cargar libros desde la base de datos
async function cargarLibros() {
  try {
    const response = await fetch('/api/libros');

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
  const container = document.getElementById('libros');
  container.innerHTML = '';

  libros.forEach(libro => {
    // Construir la URL de la imagen correctamente
    let imagenUrl = libro.imagen;
    
    if (imagenUrl && imagenUrl.startsWith('/uploads/')) {
      console.log('URL de imagen relativa:', imagenUrl);
    } else if (imagenUrl) {
      console.log('URL de imagen externa:', imagenUrl);
    } else {
      imagenUrl = 'https://via.placeholder.com/150x200?text=Sin+Imagen';
      console.log('Sin imagen, usando placeholder');
    }

    // Crear elemento del libro con estructura mejorada
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.innerHTML = `
      <div class="book-cover">
        <img 
          src="${imagenUrl}" 
          alt="${libro.titulo}" 
          onerror="this.src='https://via.placeholder.com/150x200?text=Error+Imagen'">
      </div>
      <div class="book-info">
        <h3 class="book-title">${libro.titulo}</h3>
        <p class="book-author">Por: ${libro.autor}</p>
        <p class="book-price">$${libro.precio}</p>
        <button class="btn-add-cart" onclick="agregarAlCarrito(${libro.id}, '${libro.titulo}', ${libro.precio})">
          <i class="fas fa-shopping-cart"></i> Agregar al carrito
        </button>
      </div>
    `;
    
    container.appendChild(bookItem);
  });
}

// Añadir estas funciones para gestionar mejor el carrito:

function guardarCarrito(carrito) {
  // Guardar carrito en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Si el usuario está logueado, también guardar el carrito con su ID
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Extraer ID del usuario del token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      
      // Guardar carrito asociado al usuario
      localStorage.setItem(`carrito_${userId}`, JSON.stringify(carrito));
    } catch (error) {
      console.error('Error al guardar carrito para usuario:', error);
    }
  }
  
  // Actualizar contador de items
  actualizarContadorCarrito();
}

function obtenerCarrito() {
  // Intentar obtener carrito del usuario actual
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Extraer ID del usuario del token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      
      // Intentar obtener el carrito específico del usuario
      const carritoUsuario = localStorage.getItem(`carrito_${userId}`);
      
      if (carritoUsuario) {
        // Si existe un carrito para este usuario, usarlo
        localStorage.setItem('carrito', carritoUsuario);
        return JSON.parse(carritoUsuario);
      }
    } catch (error) {
      console.error('Error al recuperar carrito de usuario:', error);
    }
  }
  
  // Si no hay carrito específico del usuario, usar el genérico
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

// Agregar al carrito
function agregarAlCarrito(id, titulo, precio) {
  let carrito = obtenerCarrito();
  
  // Verificar si el libro ya está en el carrito
  const libroExistente = carrito.find(item => item.id === id);
  
  if (libroExistente) {
    // Si el libro ya está en el carrito, aumentar cantidad
    libroExistente.cantidad += 1;
  } else {
    // Si el libro no está en el carrito, agregarlo con cantidad 1
    carrito.push({
      id,
      titulo,
      precio,
      cantidad: 1
    });
  }
  
  // Guardar carrito actualizado
  guardarCarrito(carrito);
  
  // Mostrar notificación
  showNotification(`"${titulo}" agregado al carrito`);
}

// Mostrar notificación
function showNotification(message) {
  const notification = document.getElementById('notification');
  
  if (notification) {
    notification.textContent = message;
    notification.classList.add('show');
    
    // Remover la notificación después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

// Función opcional para actualizar un contador de items en el carrito
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contadorElement = document.getElementById('cart-count');
  
  if (contadorElement) {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    contadorElement.textContent = totalItems;
    contadorElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }
}

// Función de cerrar sesión

function handleLogout(e) {
  if (e) e.preventDefault();
  
  // Guardar referencia al carrito antes de cerrar sesión
  const carrito = localStorage.getItem('carrito');
  
  // Eliminar SOLO el token y no otros datos
  localStorage.removeItem('token');
  
  // Restaurar el carrito después de eliminar el token
  if (carrito) {
    localStorage.setItem('carrito', carrito);
  }
  
  showNotification('Has cerrado sesión correctamente');
  
  // Actualizar la interfaz
  document.body.classList.remove('logged-in');
  
  // Redirigir a la página principal después de un breve retraso
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}

// Asegurarse de que esta función se llama cuando se hace clic en el botón de cerrar sesión
document.addEventListener('DOMContentLoaded', function() {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', handleLogout);
  }
  
  // Si venimos de orden-confirmada.html, verificar si queda algún residuo en el carrito
  if (document.referrer.includes('orden-confirmada.html')) {
    // Doble verificación para asegurar que el carrito está vacío
    limpiarCarrito();
  }
  
  // Resto del código...
  checkAuth();
  actualizarContadorCarrito();
});

// Añade esta función a tu archivo index.js

function limpiarCarrito() {
  // Limpiar el carrito general
  localStorage.removeItem('carrito');
  
  // Limpiar también el carrito específico del usuario si está autenticado
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      localStorage.removeItem(`carrito_${userId}`);
    } catch (error) {
      console.error('Error al limpiar carrito específico:', error);
    }
  }
  
  // Actualizar contador
  actualizarContadorCarrito();
}

// Entonces en vaciarCarrito() puedes usar:
function vaciarCarrito() {
  if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
    limpiarCarrito();
    showNotification("Carrito vaciado correctamente");
    mostrarCarrito(); // Si estás en la página de carrito
  }
}
