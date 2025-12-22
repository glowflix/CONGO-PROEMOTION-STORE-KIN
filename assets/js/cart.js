// Gestion du panier avec animations professionnelles
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartUI();
        this.setupEventListeners();
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartUI();
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                currency: product.currency || 'CDF',
                coverImageUrl: product.coverImageUrl,
                quantity: quantity
            });
        }

        this.saveCart();
        this.showAddToCartAnimation();
        this.updateCartCount();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    updateCartCount() {
        const count = this.getItemCount();
        const cartBadge = document.getElementById('cartBadge');
        const cartCount = document.querySelectorAll('.cart-count');
        
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'flex' : 'none';
            
            // Animation
            if (count > 0) {
                cartBadge.classList.add('bounce');
                setTimeout(() => cartBadge.classList.remove('bounce'), 600);
            }
        }

        cartCount.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline' : 'none';
        });
    }

    updateCartUI() {
        this.updateCartCount();
        
        // Mettre à jour le panier dans la sidebar/modal si présent
        const cartList = document.getElementById('cartList');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartList) {
            this.renderCartList(cartList);
        }
        
        if (cartTotal) {
            cartTotal.textContent = `${this.getTotal().toLocaleString()} CDF`;
        }
    }

    renderCartList(container) {
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Votre panier est vide</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.coverImageUrl}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${this.escapeHtml(item.title)}</h4>
                    <p class="cart-item-price">${item.price.toLocaleString()} ${item.currency}</p>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="cartManager.removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Ajouter animation d'entrée
        container.querySelectorAll('.cart-item').forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('slide-in');
        });
    }

    showAddToCartAnimation() {
        // Créer l'élément d'animation
        const animation = document.createElement('div');
        animation.className = 'add-to-cart-animation';
        animation.innerHTML = '<i class="fas fa-check"></i> Ajouté au panier !';
        document.body.appendChild(animation);

        // Animation
        setTimeout(() => {
            animation.classList.add('show');
        }, 10);

        setTimeout(() => {
            animation.classList.remove('show');
            setTimeout(() => animation.remove(), 300);
        }, 2000);
    }

    setupEventListeners() {
        // Boutons "Ajouter au panier" globaux
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const btn = e.target.closest('.add-to-cart-btn');
                const productId = btn.dataset.productId;
                const product = btn.dataset.product ? JSON.parse(btn.dataset.product) : null;
                
                if (product) {
                    this.addToCart(product);
                } else if (productId) {
                    // Charger le produit depuis l'API
                    this.loadAndAddProduct(productId);
                }
            }
        });
    }

    async loadAndAddProduct(productId) {
        try {
            const data = await ProductsAPI.getProduct(productId);
            if (data.product) {
                this.addToCart(data.product);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du produit:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le panier
const cartManager = new CartManager();
window.cartManager = cartManager;

