/**
 * Componente para el manejo del carrito de compras
 */
const Cart = {
  items: [],
  
  // Inicializar carrito desde localStorage
  init() {
    this.items = JSON.parse(localStorage.getItem('cart') || '[]');
    this.updateCartIcon();
  },
  
  // Añadir un libro al carrito
  addItem(book) {
    const existingItem = this.items.find(item => item.id === book.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ ...book, quantity: 1 });
    }
    
    this.save();
    this.updateCartIcon();
    Notification.show(`"${book.titulo}" añadido al carrito`, 'success');
  },
  
  // Eliminar un libro del carrito
  removeItem(bookId) {
    this.items = this.items.filter(item => item.id !== bookId);
    this.save();
    this.updateCartIcon();
  },
  
  // Actualizar cantidad
  updateQuantity(bookId, quantity) {
    const item = this.items.find(item => item.id === bookId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.save();
      this.updateCartIcon();
    }
  },
  
  // Guardar carrito en localStorage
  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  },
  
  // Limpiar carrito
  clear() {
    this.items = [];
    this.save();
    this.updateCartIcon();
  },
  
  // Calcular total
  getTotal() {
    return this.items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  },
  
  // Actualizar indicador visual del carrito
  updateCartIcon() {
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
      const itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
      cartBadge.textContent = itemCount;
      cartBadge.style.display = itemCount > 0 ? 'block' : 'none';
    }
  },
  
  // Renderizar el contenido del carrito en un elemento
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <p>Tu carrito está vacío</p>
          <a href="/" class="btn">Ver catálogo</a>
        </div>
      `;
      return;
    }
    
    let html = `
      <table class="cart-table">
        <thead>
          <tr>
            <th>Libro</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    this.items.forEach(item => {
      html += `
        <tr data-id="${item.id}">
          <td>
            <div class="cart-item-info">
              <img src="${item.imagen || '/img/default-book.jpg'}" alt="${item.titulo}">
              <div>
                <h3>${item.titulo}</h3>
                <p>${item.autor}</p>
              </div>
            </div>
          </td>
          <td>$${item.precio.toFixed(2)}</td>
          <td>
            <div class="quantity-control">
              <button class="quantity-btn minus">-</button>
              <input type="number" value="${item.quantity}" min="1" class="quantity-input">
              <button class="quantity-btn plus">+</button>
            </div>
          </td>
          <td>$${(item.precio * item.quantity).toFixed(2)}</td>
          <td>
            <button class="remove-btn"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-right"><strong>Total:</strong></td>
            <td>$${this.getTotal().toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div class="cart-actions">
        <button id="clear-cart" class="btn btn-outline">Vaciar carrito</button>
        <button id="checkout-btn" class="btn">Proceder al pago</button>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Configurar eventos
    this._setupCartEvents(container);
  },
  
  // Configurar eventos para los elementos del carrito
  _setupCartEvents(container) {
    // Botones de cantidad
    container.querySelectorAll('.quantity-btn.minus').forEach(btn => {
      btn.addEventListener('click', e => {
        const row = e.target.closest('tr');
        const id = parseInt(row.dataset.id);
        const input = row.querySelector('.quantity-input');
        const newValue = parseInt(input.value) - 1;
        if (newValue >= 1) {
          input.value = newValue;
          this.updateQuantity(id, newValue);
          this.render(container.id);
        }
      });
    });
    
    container.querySelectorAll('.quantity-btn.plus').forEach(btn => {
      btn.addEventListener('click', e => {
        const row = e.target.closest('tr');
        const id = parseInt(row.dataset.id);
        const input = row.querySelector('.quantity-input');
        const newValue = parseInt(input.value) + 1;
        input.value = newValue;
        this.updateQuantity(id, newValue);
        this.render(container.id);
      });
    });
    
    // Inputs de cantidad
    container.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', e => {
        const row = e.target.closest('tr');
        const id = parseInt(row.dataset.id);
        let newValue = parseInt(e.target.value);
        if (isNaN(newValue) || newValue < 1) {
          newValue = 1;
          e.target.value = 1;
        }
        this.updateQuantity(id, newValue);
        this.render(container.id);
      });
    });
    
    // Botones de eliminar
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const row = e.target.closest('tr');
        const id = parseInt(row.dataset.id);
        this.removeItem(id);
        this.render(container.id);
      });
    });
    
    // Botón de vaciar carrito
    const clearBtn = container.querySelector('#clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
          this.clear();
          this.render(container.id);
        }
      });
    }
    
    // Botón de checkout
    const checkoutBtn = container.querySelector('#checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (!Auth.isAuthenticated()) {
          Notification.show('Debes iniciar sesión para realizar la compra', 'warning');
          setTimeout(() => {
            window.location.href = '/login.html?redirect=cart';
          }, 1500);
          return;
        }
        window.location.href = '/checkout.html';
      });
    }
  }
};

// Exportar para uso en otros scripts
window.Cart = Cart;

// Inicializar si el DOM ya está listo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  Cart.init();
} else {
  document.addEventListener('DOMContentLoaded', () => Cart.init());
}