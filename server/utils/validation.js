/**
 * Utilidades de validación para usar en toda la aplicación
 */

// Validar formato de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar contraseña segura (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Validar que todos los campos requeridos estén presentes
const validateRequired = (data, fields) => {
  const missingFields = fields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`
    };
  }
  return { valid: true };
};

// Sanitizar texto para prevenir XSS
const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validar que un valor sea numérico
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Validar formato de ISBN para libros
const isValidISBN = (isbn) => {
  // Eliminar guiones y espacios
  const cleanISBN = isbn.replace(/[- ]/g, '');
  
  // ISBN-10 o ISBN-13
  if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
    return false;
  }
  
  // Solo para ISBN-10, validar dígito verificador
  if (cleanISBN.length === 10) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanISBN.charAt(i)) * (10 - i);
    }
    
    // El último dígito puede ser 'X' que representa 10
    const lastChar = cleanISBN.charAt(9);
    const lastDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
    
    return (sum + lastDigit) % 11 === 0;
  }
  
  // Para ISBN-13, validar que los primeros 3 dígitos sean correctos y el dígito verificador
  if (cleanISBN.length === 13) {
    // ISBN-13 debe empezar con 978 o 979
    if (!cleanISBN.startsWith('978') && !cleanISBN.startsWith('979')) {
      return false;
    }
    
    // Validar dígito verificador de ISBN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanISBN.charAt(i)) * (i % 2 === 0 ? 1 : 3);
    }
    
    return (10 - (sum % 10)) % 10 === parseInt(cleanISBN.charAt(12));
  }
  
  return false;
};

// Validar precio (positivo con máximo 2 decimales)
const isValidPrice = (price) => {
  if (!isNumeric(price)) return false;
  
  // El precio debe ser positivo
  if (parseFloat(price) <= 0) return false;
  
  // Comprobar que tenga máximo 2 decimales
  const decimalPart = price.toString().split('.')[1];
  if (decimalPart && decimalPart.length > 2) return false;
  
  return true;
};

// Exportar todas las funciones de validación
module.exports = {
  isValidEmail,
  isStrongPassword,
  validateRequired,
  sanitizeText,
  isNumeric,
  isValidISBN,
  isValidPrice
};