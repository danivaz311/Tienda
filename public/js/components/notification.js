/**
 * Sistema de notificaciones para la interfaz
 */
const Notification = {
  container: null,
  timeout: null,
  
  // Inicializar el contenedor de notificaciones
  init() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
    
    // Añadir estilos si no existen
    if (!document.getElementById('notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .notification {
          margin-bottom: 10px;
          padding: 15px 20px;
          border-radius: 4px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
          min-width: 300px;
          max-width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slide-in 0.3s ease-out;
        }
        
        .notification.hide {
          animation: slide-out 0.3s ease-out forwards;
        }
        
        .notification.success {
          background-color: #d4edda;
          border-color: #c3e6cb;
          color: #155724;
        }
        
        .notification.error {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }
        
        .notification.warning {
          background-color: #fff3cd;
          border-color: #ffeeba;
          color: #856404;
        }
        
        .notification.info {
          background-color: #d1ecf1;
          border-color: #bee5eb;
          color: #0c5460;
        }
        
        .notification .message {
          flex: 1;
        }
        
        .notification .close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          margin-left: 15px;
          opacity: 0.7;
        }
        
        .notification .close:hover {
          opacity: 1;
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }
  },
  
  // Mostrar una notificación
  show(message, type = 'info', duration = 3000) {
    this.init();
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="message">${message}</span>
      <button class="close">&times;</button>
    `;
    
    // Añadir al contenedor
    this.container.appendChild(notification);
    
    // Configurar botón de cierre
    const closeBtn = notification.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentNode === this.container) {
          this.container.removeChild(notification);
        }
      }, 300);
    });
    
    // Auto-cerrar después de la duración especificada
    setTimeout(() => {
      if (notification.parentNode === this.container) {
        notification.classList.add('hide');
        setTimeout(() => {
          if (notification.parentNode === this.container) {
            this.container.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
  }
};

// Exportar para uso en otros scripts
window.Notification = Notification;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  Notification.init();
});