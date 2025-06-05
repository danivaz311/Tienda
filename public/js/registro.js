document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registro-form');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtención de valores
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    
    // Todos los nuevos usuarios serán clientes
    const rol = 'cliente';

    // Validación
    if (!nombre || !correo || !contrasena) {
      mensaje.textContent = 'Todos los campos son obligatorios';
      mensaje.className = 'message error';
      return;
    }

    // Validación de email simple
    if (!correo.includes('@') || !correo.includes('.')) {
      mensaje.textContent = 'Por favor ingresa un correo electrónico válido';
      mensaje.className = 'message error';
      return;
    }

    // Validación de contraseña mínima
    if (contrasena.length < 6) {
      mensaje.textContent = 'La contraseña debe tener al menos 6 caracteres';
      mensaje.className = 'message error';
      return;
    }

    // Mostrar estado de carga
    mensaje.textContent = 'Registrando tu cuenta...';
    mensaje.className = 'message';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, correo, contrasena, rol })
      });

      const data = await response.json();

      if (response.ok) {
        mensaje.textContent = '¡Registro exitoso! 🎉 Redirigiendo a login...';
        mensaje.className = 'message success';
        
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        mensaje.textContent = data.error || 'Error en el registro. Intenta con otro correo.';
        mensaje.className = 'message error';
      }
    } catch (error) {
      mensaje.textContent = 'Error al conectar con el servidor';
      mensaje.className = 'message error';
      console.error('Error en registro:', error);
    }
  });
});