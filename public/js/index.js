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
      
      // Preservar el carrito antes de cerrar sesión
      //gestionarCarritoAlCerrarSesion();
      
      // Eliminar el token
      localStorage.removeItem('token');
      
      // Quitar clases del body
      document.body.classList.remove('logged-in');
      document.body.classList.remove('admin-user');
      
      // Mostrar notificación
      showNotification('Has cerrado sesión correctamente');
      
      // Redirigir a la página principal o recargar
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
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
      
      // NUEVO: Sincronizar el carrito cuando se verifica la autenticación
      sincronizarCarritoAlIniciarSesion(token);
      
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
    let imagenUrl = libro.imagen;

    // Si solo es el nombre del archivo, construye la ruta completa
    if (imagenUrl && !imagenUrl.startsWith('http') && !imagenUrl.startsWith('/uploads/')) {
      imagenUrl = '/uploads/' + imagenUrl;
    }

    if (!imagenUrl) {
      imagenUrl = '/img/error-imagen.png';
    }

    // Crear elemento del libro con estructura mejorada
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.innerHTML = `
      <div class="book-cover">
        <img 
          src="${imagenUrl}" 
          alt="${libro.titulo}" 
          onerror="this.src='/img/error-imagen.png'">
      </div>
      <div class="book-info">
        <h3 class="book-title">${libro.titulo}</h3>
        <p class="book-author">Por: ${libro.autor}</p>
        <p class="book-description">${libro.descripcion || ''}</p>
        <p class="book-price">$${libro.precio}</p>
        <p class="book-stock"><strong>Stock:</strong> ${libro.stock}</p>
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
  // Guardar carrito en localStorage general (para todos)
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Si hay usuario logueado, guardar también con su ID
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Extraer ID del usuario del token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      
      // Guardar carrito asociado al usuario
      if (userId) {
        localStorage.setItem(`carrito_${userId}`, JSON.stringify(carrito));
        console.log(`Carrito guardado para usuario ID: ${userId}`, carrito);
      }
    } catch (error) {
      console.error('Error al guardar carrito específico del usuario:', error);
    }
  }
}

function obtenerCarrito() {
  console.log("Obteniendo carrito...");
  
  // Intentar obtener carrito del usuario actual
  const token = localStorage.getItem('token');
  let carrito = [];
  
  if (token) {
    try {
      // Extraer ID del usuario del token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      
      console.log(`Usuario identificado con ID: ${userId}`);
      
      // Intentar obtener el carrito específico del usuario
      const carritoUsuario = localStorage.getItem(`carrito_${userId}`);
      
      if (carritoUsuario) {
        console.log("Carrito de usuario encontrado");
        carrito = JSON.parse(carritoUsuario);
      } else {
        console.log("No hay carrito guardado para este usuario");
        
        // Si no hay carrito de usuario pero sí un carrito anónimo,
        // asignar ese carrito al usuario
        const carritoAnonimo = localStorage.getItem('carrito');
        if (carritoAnonimo) {
          carrito = JSON.parse(carritoAnonimo);
          console.log("Asignando carrito anónimo al usuario:", carrito);
          
          // Guardar este carrito para el usuario
          localStorage.setItem(`carrito_${userId}`, JSON.stringify(carrito));
        } else {
          console.log("No hay carrito anónimo, empezando con carrito vacío");
        }
      }
    } catch (error) {
      console.error('Error al obtener carrito de usuario:', error);
      
      // Si hay error, intentar obtener el carrito general
      const carritoAnonimo = localStorage.getItem('carrito');
      if (carritoAnonimo) {
        carrito = JSON.parse(carritoAnonimo);
      }
    }
  } else {
    // Usuario no autenticado
    console.log("Usuario no autenticado, usando carrito anónimo");
    const carritoAnonimo = localStorage.getItem('carrito');
    if (carritoAnonimo) {
      carrito = JSON.parse(carritoAnonimo);
    }
  }
  
  console.log("Carrito final obtenido:", carrito);
  return carrito || [];
}

// Simplificar esta función para evitar problemas

function agregarAlCarrito(id, titulo, precio) {
  console.log(`Agregando libro: ID=${id}, Título=${titulo}, Precio=${precio}`);
  
  // Obtener carrito del localStorage (no usar cargarCarrito para evitar problemas)
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Verificar si el producto ya está en el carrito
  const index = carrito.findIndex(item => item.id === id);
  
  if (index !== -1) {
    // Si ya existe, incrementar cantidad
    carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
    console.log(`Incrementada cantidad de "${titulo}" a ${carrito[index].cantidad}`);
  } else {
    // Si no existe, agregar nuevo item con cantidad 1
    carrito.push({ id, titulo, precio, cantidad: 1 });
    console.log(`Añadido nuevo libro "${titulo}" al carrito`);
  }
  
  // Guardar en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Guardar también en el carrito del usuario si está autenticado
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem(`carrito_${payload.id}`, JSON.stringify(carrito));
    } catch (error) {
      console.error('Error al guardar en carrito de usuario:', error);
    }
  }
  
  // Actualizar contador visual
  const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
  actualizarContadorCarrito(totalItems);
  
  // Mostrar notificación
  showNotification(`${titulo} agregado al carrito`);
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
function actualizarContadorCarrito(cantidad) {
  // Si no se proporciona una cantidad, calcularla desde el carrito
  if (cantidad === undefined) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    cantidad = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
  }
  
  const contadores = document.querySelectorAll('.cart-badge');
  contadores.forEach(contador => {
    contador.textContent = cantidad;
    contador.style.display = cantidad > 0 ? 'inline-block' : 'none';
  });
  
  console.log(`Contador del carrito actualizado a: ${cantidad}`);
}

// Reemplazar la función handleLogout

function handleLogout(e) {
  if (e) e.preventDefault();
  
  // Guardar el carrito del usuario antes de cerrar sesión
  const token = localStorage.getItem('token');
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  if (token && carrito.length > 0) {
    try {
      // Extraer ID del usuario del token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      
      // Guardar el carrito actual para este usuario antes de eliminarlo
      localStorage.setItem(`carrito_${userId}`, JSON.stringify(carrito));
      console.log(`Carrito guardado para usuario ID ${userId} antes de cerrar sesión`);
    } catch (error) {
      console.error('Error al guardar carrito al cerrar sesión:', error);
    }
  }
  
  // Eliminar token
  localStorage.removeItem('token');
  
  // IMPORTANTE: Vaciar el carrito anónimo para que esté vacío al cerrar sesión
  localStorage.removeItem('carrito');
  
  // Actualizar contador del carrito
  actualizarContadorCarrito(0);
  
  // Actualizar UI
  showNotification('Has cerrado sesión correctamente');
  document.body.classList.remove('logged-in');
  document.body.classList.remove('admin-user');
  
  // Redirigir a la página principal
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
  // pero solo si estamos en la página principal, no en historial
  if (document.referrer.includes('orden-confirmada.html') && 
      !window.location.pathname.includes('historial.html')) {
    console.log('Viniendo de orden confirmada a página no-historial, limpiando carrito');
    limpiarCarrito();
  }
  
  // Limpiar posibles duplicados al cargar cualquier página
  //limpiarDuplicadosCarrito();
  
  // Resto del código...
  checkAuth();
  actualizarInterfaz();
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

// Añadir estas funciones para manejar el carrito durante el inicio/cierre de sesión

// Cuando el usuario inicia sesión
function gestionarCarritoAlIniciarSesion() {
  // Esta función ahora solo actualiza el contador
  actualizarContadorCarrito();
  console.log('Contador del carrito actualizado después de iniciar sesión');
}



// Mejora la función cargarCarrito para que recupere el carrito específico del usuario


// Reemplazar función sincronizarCarritoAlIniciarSesion

function sincronizarCarritoAlIniciarSesion(token) {
  try {
    console.log('Verificando carrito después del login...');
    
    // Extraer información del usuario del token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;
    
    // Verificar si existe un carrito guardado para este usuario
    const carritoUsuario = localStorage.getItem(`carrito_${userId}`);
    
    if (carritoUsuario) {
      // Si el usuario tiene un carrito guardado, usamos ese
      console.log('Usando carrito guardado del usuario');
      localStorage.setItem('carrito', carritoUsuario);
      
      // Actualizar la UI
      const carritoParsed = JSON.parse(carritoUsuario);
      const totalItems = carritoParsed.reduce((total, item) => total + item.cantidad, 0);
      actualizarContadorCarrito(totalItems);
    } else {
      // Si el usuario no tiene un carrito guardado, guardamos el actual
      const carritoActual = localStorage.getItem('carrito');
      if (carritoActual) {
        localStorage.setItem(`carrito_${userId}`, carritoActual);
        console.log('Guardando carrito actual para el usuario');
      }
    }
  } catch (error) {
    console.error('Error al gestionar carrito después del login:', error);
  }
}

// Añadir esta función para emergencias

function emergenciaLimpiarCarrito() {
  localStorage.removeItem('carrito');
  
  // Limpiar también los carritos de usuarios
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('carrito_')) {
      keys.push(key);
    }
  }
  
  // Eliminar todas las claves de carritos
  keys.forEach(key => localStorage.removeItem(key));
  
  // Actualizar contador
  actualizarContadorCarrito(0);
  
  // Recargar página
  location.reload();
  
  console.log('EMERGENCIA: Todos los carritos han sido eliminados!');
}

// Mejora con verificación adicional para decidir si limpiar el carrito

document.addEventListener('DOMContentLoaded', function() {
  // Para casos de emergencia: detectar si el carrito tiene demasiados items
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
  
  if (totalItems > 100) {  // Si hay más de 100 items, algo anda mal
    console.warn('¡ALERTA! Carrito con demasiados items:', totalItems);
    if (confirm('Se detectaron demasiados productos en el carrito. ¿Desea reiniciarlo?')) {
      limpiarCarrito();
      location.reload();
    }
  }
  
  // Determinar si debemos limpiar el carrito cuando venimos de orden confirmada
  if (document.referrer.includes('orden-confirmada.html')) {
    // Solo limpiar si:
    // 1. No estamos en la página de historial
    // 2. No estamos en la página de carrito
    // 3. No hay una bandera específica para prevenir la limpieza
    const isHistorialPage = window.location.pathname.includes('historial.html');
    const isCarritoPage = window.location.pathname.includes('carrito.html');
    const shouldPreventClearing = window.preventCartClear === true;
    
    if (!isHistorialPage && !isCarritoPage && !shouldPreventClearing) {
      console.log('Limpiando carrito después de orden confirmada');
      limpiarCarrito();
    } else {
      console.log('Manteniendo carrito intacto después de orden confirmada en página protegida');
    }
  }
  
  // Actualizaciones básicas
  actualizarContadorCarrito();
  checkAuth();
  cargarLibros();

});