document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;

    // Mostrar estado de carga
    mensaje.textContent = 'Verificando credenciales...';
    mensaje.className = 'message';
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        mensaje.textContent = 'Inicio de sesión exitoso 🎉 Redirigiendo...';
        mensaje.className = 'message success';
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        mensaje.textContent = data.error || data.mensaje || 'Error en las credenciales';
        mensaje.className = 'message error';
      }
    } catch (error) {
      mensaje.textContent = 'Error al conectar con el servidor';
      mensaje.className = 'message error';
      console.error('Error en login:', error);
    }
  });
});