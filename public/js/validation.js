/**
 * Funciones de validación para formularios en el cliente
 */

// Validar formato de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar contraseña segura (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
function isStrongPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

// Mostrar mensaje de error en formulario
function showFormError(formId, message) {
  const errorDiv = document.getElementById(`${formId}-error`);
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

// Ocultar mensaje de error
function hideFormError(formId) {
  const errorDiv = document.getElementById(`${formId}-error`);
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// Validar formulario de registro
function validateRegistrationForm() {
  const form = document.getElementById('registro-form');
  const nombre = form.querySelector('[name="nombre"]').value.trim();
  const correo = form.querySelector('[name="correo"]').value.trim();
  const contrasena = form.querySelector('[name="contrasena"]').value;
  
  // Validar campos requeridos
  if (!nombre || !correo || !contrasena) {
    showFormError('registro', 'Todos los campos son obligatorios');
    return false;
  }
  
  // Validar formato de correo
  if (!isValidEmail(correo)) {
    showFormError('registro', 'El formato de correo electrónico no es válido');
    return false;
  }
  
  // Opcional: validar contraseña segura
  if (!isStrongPassword(contrasena)) {
    showFormError('registro', 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números');
    return false;
  }
  
  // Si todo está bien
  hideFormError('registro');
  return true;
}

// Validar formulario de login
function validateLoginForm() {
  const form = document.getElementById('login-form');
  const correo = form.querySelector('[name="correo"]').value.trim();
  const contrasena = form.querySelector('[name="contrasena"]').value;
  
  // Validar campos requeridos
  if (!correo || !contrasena) {
    showFormError('login', 'Correo y contraseña son obligatorios');
    return false;
  }
  
  // Validar formato de correo
  if (!isValidEmail(correo)) {
    showFormError('login', 'El formato de correo electrónico no es válido');
    return false;
  }
  
  // Si todo está bien
  hideFormError('login');
  return true;
}

// Validar formulario de libro
function validateBookForm() {
  const form = document.getElementById('libro-form');
  const titulo = form.querySelector('[name="titulo"]').value.trim();
  const autor = form.querySelector('[name="autor"]').value.trim();
  const precio = form.querySelector('[name="precio"]').value.trim();
  
  // Validar campos requeridos
  if (!titulo || !autor || !precio) {
    showFormError('libro', 'Título, autor y precio son obligatorios');
    return false;
  }
  
  // Validar precio
  if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
    showFormError('libro', 'El precio debe ser un número positivo');
    return false;
  }
  
  // Si todo está bien
  hideFormError('libro');
  return true;
}

// Exportar funciones para uso en diferentes páginas
if (typeof module !== 'undefined') {
  module.exports = {
    isValidEmail,
    isStrongPassword,
    validateRegistrationForm,
    validateBookForm
  };
}