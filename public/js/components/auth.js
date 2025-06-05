/**
 * Componente para manejo de autenticación
 */
const Auth = {
  token: null,
  user: null,
  
  // Inicializar estado de autenticación
  init() {
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    this.user = userStr ? JSON.parse(userStr) : null;
    this.updateUI();
  },
  
  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      
      this.setSession(data.token, data.usuario);
      return true;
    } catch (error) {
      console.error('Error de login:', error);
      return false;
    }
  },
  
  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }
      
      return data;
    } catch (error) {
      console.error('Error de registro:', error);
      throw error;
    }
  },
  
  // Guardar sesión
  setSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.updateUI();
  },
  
  // Cerrar sesión
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.updateUI();
    window.location.href = '/';
  },
  
  // Verificar si el usuario está autenticado
isAuthenticated() {
    return !!this.token;
},
  
  // Verificar si el usuario es administrador
  isAdmin() {
    return this.user && this.user.rol === 'admin';
  },
  
  // Actualizar elementos de la UI según estado de autenticación
  updateUI() {
    const authLinks = document.getElementById('auth-links');
    const profileLinks = document.getElementById('profile-links');
    const adminLinks = document.getElementById('admin-links');
    
    if (!authLinks || !profileLinks) return;
    
    if (this.isAuthenticated()) {
      authLinks.style.display = 'none';
      profileLinks.style.display = 'flex';
      
      // Mostrar nombre del usuario
      const userNameElement = document.getElementById('user-name');
      if (userNameElement && this.user) {
        userNameElement.textContent = this.user.nombre;
      }
      
      // Mostrar/ocultar enlaces de administración
      if (adminLinks) {
        adminLinks.style.display = this.isAdmin() ? 'block' : 'none';
      }
    } else {
      authLinks.style.display = 'flex';
      profileLinks.style.display = 'none';
      if (adminLinks) {
        adminLinks.style.display = 'none';
      }
    }
  },
  
  // Obtener headers con token para peticiones autenticadas
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  },
  
  // Proteger rutas que requieren autenticación
  checkAuth() {
    if (!this.isAuthenticated()) {
      Notification.show('Acceso restringido. Por favor inicia sesión', 'warning');
      window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  },
  
  // Proteger rutas de administrador
  checkAdmin() {
    if (!this.checkAuth()) return false;
    
    if (!this.isAdmin()) {
      Notification.show('Acceso denegado. Se requieren permisos de administrador', 'error');
      window.location.href = '/';
      return false;
    }
    return true;
  }
};

// Exportar para uso en otros scripts
window.Auth = Auth;

// Inicializar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});