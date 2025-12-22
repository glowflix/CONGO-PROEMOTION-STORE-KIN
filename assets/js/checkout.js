// Configuration du checkout
const CHECKOUT_CONFIG = {
    // Numéro WhatsApp du magasin (format international sans +)
    whatsappNumber: '243900000000', // À remplacer par le numéro réel
    
    // Coordonnées du magasin Congo Promotion Store
    // 💡 À ajuster avec les coordonnées exactes de votre lien Maps
    //    ex: https://maps.app.goo.gl/kLsrZyPMSxZL65sX7
    storeLocation: {
        lat: -4.3276,
        lng: 15.3136,
        address: 'Congo Promotion Store, Kinshasa, RD Congo'
    }
};

// Gestion du système de checkout avec 3 options
class CheckoutManager {
    constructor() {
        this.storeLocation = CHECKOUT_CONFIG.storeLocation;
        this.whatsappNumber = CHECKOUT_CONFIG.whatsappNumber;
        
        this.init();
    }

    init() {
        this.createCheckoutModal();
        this.setupEventListeners();
    }

    createCheckoutModal() {
        // Créer le modal de checkout s'il n'existe pas
        if (document.getElementById('checkoutModal')) return;

        const modal = document.createElement('div');
        modal.id = 'checkoutModal';
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-overlay" id="checkoutOverlay"></div>
            <div class="checkout-content">
                <div class="checkout-header">
                    <h2><i class="fas fa-shopping-bag"></i> Passer la commande</h2>
                    <button class="checkout-close" id="checkoutClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="checkout-body">
                    <div class="checkout-options" id="checkoutOptions">
                        <div class="checkout-option" data-option="whatsapp">
                            <div class="option-icon">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="option-content">
                                <h3>Commander via WhatsApp</h3>
                                <p>Envoyez votre commande directement sur WhatsApp avec tous les détails</p>
                            </div>
                            <div class="option-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        
                        <div class="checkout-option" data-option="online">
                            <div class="option-icon">
                                <i class="fas fa-credit-card"></i>
                            </div>
                            <div class="option-content">
                                <h3>Commander directement</h3>
                                <p>Paiement en ligne sécurisé (Mobile Money ou Carte bancaire)</p>
                            </div>
                            <div class="option-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        
                        <div class="checkout-option" data-option="pickup">
                            <div class="option-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="option-content">
                                <h3>Payer sur place</h3>
                                <p>Récupérez votre commande au magasin et payez sur place</p>
                            </div>
                            <div class="option-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        
                        <div class="checkout-option" data-option="delivery">
                            <div class="option-icon">
                                <i class="fas fa-truck"></i>
                            </div>
                            <div class="option-content">
                                <h3>Livraison à domicile</h3>
                                <p>Commande livrée chez vous avec suivi en temps réel</p>
                            </div>
                            <div class="option-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Vue WhatsApp -->
                    <div class="checkout-view" id="whatsappView" style="display: none;">
                        <div class="view-header">
                            <button class="back-btn" data-back="options">
                                <i class="fas fa-arrow-left"></i> Retour
                            </button>
                            <h3><i class="fab fa-whatsapp"></i> Commande WhatsApp</h3>
                        </div>
                        <div class="view-body">
                            <div class="order-summary" id="whatsappOrderSummary"></div>
                            <div class="whatsapp-preview">
                                <p>Le message suivant sera envoyé à notre numéro WhatsApp :</p>
                                <div class="whatsapp-message" id="whatsappMessage"></div>
                            </div>
                            <button class="btn btn-primary btn-whatsapp" id="sendWhatsAppBtn">
                                <i class="fab fa-whatsapp"></i> Ouvrir WhatsApp
                            </button>
                        </div>
                    </div>

                    <!-- Vue Commande en ligne -->
                    <div class="checkout-view" id="onlineView" style="display: none;">
                        <div class="view-header">
                            <button class="back-btn" data-back="options">
                                <i class="fas fa-arrow-left"></i> Retour
                            </button>
                            <h3><i class="fas fa-credit-card"></i> Commande en ligne</h3>
                        </div>
                        <div class="view-body">
                            <div class="order-summary" id="onlineOrderSummary"></div>
                            <form id="onlineOrderForm" class="checkout-form">
                                <div class="form-group">
                                    <label>Nom complet *</label>
                                    <input type="text" name="fullName" required>
                                </div>
                                <div class="form-group">
                                    <label>Téléphone *</label>
                                    <input type="tel" name="phone" required>
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email">
                                </div>
                                <div class="form-group">
                                    <label>Adresse de livraison *</label>
                                    <textarea name="address" rows="3" required></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Mode de paiement *</label>
                                    <div class="payment-methods">
                                        <label class="payment-option">
                                            <input type="radio" name="paymentMethod" value="mobile-money" required>
                                            <div class="payment-card">
                                                <i class="fas fa-mobile-alt"></i>
                                                <span>Mobile Money</span>
                                                <small>M-Pesa, Airtel, Orange</small>
                                            </div>
                                        </label>
                                        <label class="payment-option">
                                            <input type="radio" name="paymentMethod" value="card" required>
                                            <div class="payment-card">
                                                <i class="fas fa-credit-card"></i>
                                                <span>Carte bancaire</span>
                                                <small>Visa, Mastercard</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-lock"></i> Confirmer la commande
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Vue Payer sur place -->
                    <div class="checkout-view" id="pickupView" style="display: none;">
                        <div class="view-header">
                            <button class="back-btn" data-back="options">
                                <i class="fas fa-arrow-left"></i> Retour
                            </button>
                            <h3><i class="fas fa-map-marker-alt"></i> Payer sur place</h3>
                        </div>
                        <div class="view-body">
                            <div class="order-summary" id="pickupOrderSummary"></div>
                            <div class="store-location">
                                <h4><i class="fas fa-store"></i> Notre magasin</h4>
                                <p class="store-address">${this.storeLocation.address}</p>
                                
                                <!-- Message de permission Android -->
                                <div class="permission-request" id="permissionRequest" style="display: none;">
                                    <div class="permission-message">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <p>Pour afficher votre itinéraire, nous avons besoin de votre position.</p>
                                        <button class="btn btn-primary" id="requestLocationBtn">
                                            <i class="fas fa-location-arrow"></i> Autoriser la position
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="map-container" id="storeMap">
                                    <!-- La carte Google Maps sera chargée ici -->
                                    <div class="map-loading">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <p>Chargement de la carte...</p>
                                    </div>
                                </div>
                                <div class="route-info" id="routeInfo">
                                    <div class="route-distance">
                                        <i class="fas fa-route"></i>
                                        <span id="routeDistance">Calcul en cours...</span>
                                    </div>
                                    <div class="route-time">
                                        <i class="fas fa-clock"></i>
                                        <span id="routeTime">Calcul en cours...</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary" id="confirmPickupBtn">
                                    <i class="fas fa-check"></i> Confirmer la commande
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Vue Livraison -->
                    <div class="checkout-view" id="deliveryView" style="display: none;">
                        <div class="view-header">
                            <button class="back-btn" data-back="options">
                                <i class="fas fa-arrow-left"></i> Retour
                            </button>
                            <h3><i class="fas fa-truck"></i> Livraison à domicile</h3>
                        </div>
                        <div class="view-body">
                            <div class="order-summary" id="deliveryOrderSummary"></div>
                            
                            <form id="deliveryForm" class="checkout-form">
                                <div class="form-group">
                                    <label>Nom complet *</label>
                                    <input type="text" name="fullName" required>
                                </div>
                                <div class="form-group">
                                    <label>Téléphone *</label>
                                    <input type="tel" name="phone" required>
                                </div>
                                <div class="form-group">
                                    <label>Adresse de livraison *</label>
                                    <div class="address-input-container">
                                        <textarea name="address" id="deliveryAddress" rows="2" placeholder="Tapez votre adresse complète" required></textarea>
                                        <button type="button" class="btn btn-secondary btn-sm" id="useCurrentLocationBtn">
                                            <i class="fas fa-location-arrow"></i> Utiliser ma position
                                        </button>
                                    </div>
                                    <div class="address-suggestions" id="addressSuggestions"></div>
                                </div>
                                
                                <div class="delivery-map-container">
                                    <div class="map-container" id="deliveryMap">
                                        <div class="map-loading">
                                            <i class="fas fa-spinner fa-spin"></i>
                                            <p>Chargement de la carte...</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="delivery-info" id="deliveryInfo">
                                    <div class="delivery-fee">
                                        <i class="fas fa-dollar-sign"></i>
                                        <span>Frais de livraison: <strong id="deliveryFee">Calcul en cours...</strong></span>
                                    </div>
                                    <div class="delivery-distance">
                                        <i class="fas fa-route"></i>
                                        <span>Distance: <strong id="deliveryDistance">-</strong></span>
                                    </div>
                                </div>
                                
                                <div class="order-total-delivery">
                                    <div class="subtotal">
                                        <span>Sous-total:</span>
                                        <span id="deliverySubtotal">0 CDF</span>
                                    </div>
                                    <div class="delivery-fee-row">
                                        <span>Frais de livraison:</span>
                                        <span id="deliveryFeeAmount">0 CDF</span>
                                    </div>
                                    <div class="total-row">
                                        <span>Total:</span>
                                        <strong id="deliveryTotal">0 CDF</strong>
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn btn-primary" id="confirmDeliveryBtn">
                                    <i class="fas fa-truck"></i> Confirmer la livraison
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        // Ouvrir le modal depuis le bouton "Commander"
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-primary') && 
                e.target.closest('.cart-actions') && 
                cartManager.cart.length > 0) {
                this.openCheckout();
            }
        });

        // Fermer le modal
        const closeBtn = document.getElementById('checkoutClose');
        const overlay = document.getElementById('checkoutOverlay');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCheckout());
        }
        if (overlay) {
            overlay.addEventListener('click', () => this.closeCheckout());
        }

        // Navigation entre les options
        document.querySelectorAll('.checkout-option').forEach(option => {
            option.addEventListener('click', () => {
                const optionType = option.dataset.option;
                this.showCheckoutView(optionType);
            });
        });

        // Boutons retour
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showCheckoutView('options');
            });
        });

        // Envoyer WhatsApp
        const whatsappBtn = document.getElementById('sendWhatsAppBtn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => this.sendWhatsApp());
        }

        // Soumettre commande en ligne
        const onlineForm = document.getElementById('onlineOrderForm');
        if (onlineForm) {
            onlineForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitOnlineOrder(new FormData(onlineForm));
            });
        }

        // Confirmer commande sur place
        const pickupBtn = document.getElementById('confirmPickupBtn');
        if (pickupBtn) {
            pickupBtn.addEventListener('click', () => this.confirmPickupOrder());
        }

        // Soumettre commande de livraison
        const deliveryForm = document.getElementById('deliveryForm');
        if (deliveryForm) {
            deliveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitDeliveryOrder(new FormData(deliveryForm));
            });
        }

        // Utiliser la position actuelle pour l'adresse
        const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');
        if (useCurrentLocationBtn) {
            useCurrentLocationBtn.addEventListener('click', () => this.useCurrentLocationForDelivery());
        }

        // Bouton pour demander la permission de géolocalisation (Android)
        const requestLocationBtn = document.getElementById('requestLocationBtn');
        if (requestLocationBtn) {
            requestLocationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.requestLocationPermissionManually();
            });
        }
    }

    openCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;

        if (cartManager.cart.length === 0) {
            alert('Votre panier est vide');
            return;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        this.showCheckoutView('options');
        this.updateOrderSummaries();
    }

    closeCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;

        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    showCheckoutView(view) {
        // Masquer toutes les vues
        document.querySelectorAll('.checkout-view').forEach(v => {
            v.style.display = 'none';
        });
        document.getElementById('checkoutOptions').style.display = view === 'options' ? 'block' : 'none';

        // Afficher la vue demandée
        if (view === 'whatsapp') {
            document.getElementById('whatsappView').style.display = 'block';
            this.updateWhatsAppMessage();
        } else if (view === 'online') {
            document.getElementById('onlineView').style.display = 'block';
        } else if (view === 'pickup') {
            document.getElementById('pickupView').style.display = 'block';
            // Sur Android, vérifier la permission et afficher le bouton si nécessaire
            this.checkAndRequestPermission();
            this.loadStoreMap();
        } else if (view === 'delivery') {
            document.getElementById('deliveryView').style.display = 'block';
            this.initDeliveryView();
        }
    }

    updateOrderSummaries() {
        const cart = cartManager.cart;
        const total = cartManager.getTotal();
        
        const summaryHTML = `
            <div class="order-items">
                ${cart.map(item => `
                    <div class="order-item">
                        <img src="${item.coverImageUrl}" alt="${item.title}">
                        <div class="order-item-info">
                            <h4>${this.escapeHtml(item.title)}</h4>
                            <p>${item.quantity} × ${item.price.toLocaleString()} ${item.currency}</p>
                        </div>
                        <div class="order-item-total">
                            ${(item.price * item.quantity).toLocaleString()} ${item.currency}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <span>Total:</span>
                <strong>${total.toLocaleString()} CDF</strong>
            </div>
        `;

        ['whatsappOrderSummary', 'onlineOrderSummary', 'pickupOrderSummary', 'deliveryOrderSummary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = summaryHTML;
        });
    }

    updateWhatsAppMessage() {
        const cart = cartManager.cart;
        const total = cartManager.getTotal();
        
        let message = `🛒 *Commande Congo Promotion Store*\n\n`;
        message += `*Détails de la commande:*\n\n`;
        
        cart.forEach((item, index) => {
            message += `${index + 1}. *${item.title}*\n`;
            message += `   Quantité: ${item.quantity}\n`;
            message += `   Prix unitaire: ${item.price.toLocaleString()} ${item.currency}\n`;
            message += `   Sous-total: ${(item.price * item.quantity).toLocaleString()} ${item.currency}\n`;
            message += `   Stock disponible: Oui\n\n`;
        });
        
        message += `💰 *Total: ${total.toLocaleString()} CDF*\n\n`;
        message += `Merci pour votre commande !`;

        const messageEl = document.getElementById('whatsappMessage');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }

    sendWhatsApp() {
        const cart = cartManager.cart;
        const total = cartManager.getTotal();
        
        let message = `🛒 *Commande Congo Promotion Store*%0A%0A`;
        message += `*Détails de la commande:*%0A%0A`;
        
        cart.forEach((item, index) => {
            message += `${index + 1}. *${item.title}*%0A`;
            message += `   Quantité: ${item.quantity}%0A`;
            message += `   Prix unitaire: ${item.price.toLocaleString()} ${item.currency}%0A`;
            message += `   Sous-total: ${(item.price * item.quantity).toLocaleString()} ${item.currency}%0A`;
            message += `   Stock disponible: Oui%0A%0A`;
        });
        
        message += `💰 *Total: ${total.toLocaleString()} CDF*%0A%0A`;
        message += `Merci pour votre commande !`;

        const whatsappUrl = `https://wa.me/${this.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        
        // Optionnel: fermer le modal après ouverture
        setTimeout(() => {
            this.closeCheckout();
            cartManager.clearCart();
        }, 500);
    }

    async submitOnlineOrder(formData) {
        const orderData = {
            items: cartManager.cart,
            total: cartManager.getTotal(),
            customer: {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address')
            },
            paymentMethod: formData.get('paymentMethod'),
            timestamp: new Date().toISOString()
        };

        // Afficher un message de confirmation
        alert('Commande enregistrée ! Vous serez contacté pour finaliser le paiement.');
        
        // Ici, vous pouvez envoyer les données à votre API
        // await ProductsAPI.createOrder(orderData);
        
        this.closeCheckout();
        cartManager.clearCart();
    }

    confirmPickupOrder() {
        const orderData = {
            items: cartManager.cart,
            total: cartManager.getTotal(),
            type: 'pickup',
            timestamp: new Date().toISOString()
        };

        alert('Commande confirmée ! Vous pouvez venir récupérer votre commande au magasin.');
        
        // Ici, vous pouvez envoyer les données à votre API
        // await ProductsAPI.createOrder(orderData);
        
        this.closeCheckout();
        cartManager.clearCart();
    }

    loadStoreMap() {
        const mapContainer = document.getElementById('storeMap');
        if (!mapContainer) return;

        // Ne recréer la carte qu'une seule fois
        if (mapContainer.classList.contains('map-loaded')) {
            this.calculateRoute();
            return;
        }

        // Vérifier que Leaflet est chargé
        if (typeof L === 'undefined') {
            console.error('Leaflet n\'est pas chargé');
            mapContainer.innerHTML = '<div class="map-loading"><p>Chargement de la carte...</p></div>';
            // Réessayer après un délai
            setTimeout(() => this.loadStoreMap(), 500);
            return;
        }

        // Créer le conteneur de la carte
        mapContainer.innerHTML = `
            <div id="gtaMap" style="width: 100%; height: 400px; border-radius: 12px; overflow: hidden;"></div>
            <div class="map-controls-gta">
                <button class="map-control-btn-gta" id="fullscreenViewBtn" title="Vue plein écran">
                    <i class="fas fa-expand"></i>
                </button>
                <button class="map-control-btn-gta" id="view2DBtn" title="Vue 2D">
                    <i class="fas fa-map"></i>
                </button>
                <button class="map-control-btn-gta" id="view3DBtn" title="Vue immersive (GTA-style)">
                    <i class="fas fa-cube"></i>
                </button>
                <button class="map-control-btn-gta" id="centerUserBtn" title="Centrer sur moi">
                    <i class="fas fa-crosshairs"></i>
                </button>
                <button class="map-control-btn-gta" id="centerRouteBtn" title="Centrer sur l'itinéraire">
                    <i class="fas fa-route"></i>
                </button>
            </div>
        `;

        const mapDiv = document.getElementById('gtaMap');
        if (!mapDiv) return;

        // Coordonnées du magasin
        const storeLat = this.storeLocation.lat;
        const storeLng = this.storeLocation.lng;

        // Créer la carte Leaflet avec style GTA (sombre mais avec routes visibles)
        const map = L.map('gtaMap', {
            center: [storeLat, storeLng],
            zoom: 15,
            zoomControl: true,
            attributionControl: false
        });

        // Style de carte GTA 5 avec routes nommées visibles
        // Utiliser OpenStreetMap standard pour avoir les noms de routes
        const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);
        
        // Overlay sombre pour style GTA mais garder les routes visibles
        const darkOverlay = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            maxZoom: 19,
            opacity: 0.6 // Overlay semi-transparent pour garder les routes visibles
        }).addTo(map);
        
        // Stocker les références
        this.baseLayer = baseLayer;
        this.darkOverlay = darkOverlay;
        
        // Ajouter des points d'intérêt (POI) style GTA autour du magasin
        this.addPointsOfInterest(map, storeLat, storeLng);

        // Marqueur personnalisé pour le magasin
        const storeIcon = L.divIcon({
            className: 'gta-marker-store',
            html: `
                <div class="gta-marker-store-inner">
                    <i class="fas fa-store"></i>
                    <div class="gta-marker-pulse"></div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 48]
        });

        const storeMarker = L.marker([storeLat, storeLng], { icon: storeIcon })
            .addTo(map)
            .bindPopup(`
                <div style="text-align: center; padding: 0.5rem;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #6366f1;">🏪 Congo Promotion Store</h3>
                    <p style="margin: 0; color: #666;">${this.storeLocation.address}</p>
                </div>
            `)
            .openPopup();

        // Stocker les références
        this.mapInstance = map;
        this.storeMarker = storeMarker;
        this.userMarker = null;
        this.routePolyline = null;
        this.currentView = '2D'; // '2D' ou '3D'

        // Contrôles de vue
        document.getElementById('fullscreenViewBtn')?.addEventListener('click', () => {
            this.openFullscreenMap();
        });

        document.getElementById('view2DBtn')?.addEventListener('click', () => {
            this.setViewMode('2D');
        });

        document.getElementById('view3DBtn')?.addEventListener('click', () => {
            this.setViewMode('3D');
        });

        document.getElementById('centerUserBtn')?.addEventListener('click', () => {
            this.centerOnUser();
        });

        document.getElementById('centerRouteBtn')?.addEventListener('click', () => {
            this.centerOnRoute();
        });

        mapContainer.classList.add('map-loaded');

        // Demander automatiquement la géolocalisation (important pour iOS)
        this.requestGeolocationPermission();

        // Calculer l'itinéraire automatiquement avec plusieurs tentatives
        this.calculateRouteWithRetry();
    }

    addPointsOfInterest(map, centerLat, centerLng) {
        // Points d'intérêt autour du magasin (exemples - à ajuster selon votre ville)
        const pois = [
            { lat: centerLat + 0.01, lng: centerLng + 0.01, type: 'hospital', name: 'Hôpital Central', icon: 'hospital' },
            { lat: centerLat - 0.008, lng: centerLng + 0.012, type: 'stadium', name: 'Stade des Martyrs', icon: 'football-ball' },
            { lat: centerLat + 0.015, lng: centerLng - 0.01, type: 'church', name: 'Cathédrale', icon: 'church' },
            { lat: centerLat - 0.012, lng: centerLng - 0.008, type: 'school', name: 'Université', icon: 'university' },
            { lat: centerLat + 0.005, lng: centerLng + 0.015, type: 'park', name: 'Parc National', icon: 'tree' },
            { lat: centerLat - 0.015, lng: centerLng + 0.005, type: 'airport', name: 'Aéroport', icon: 'plane' },
        ];

        pois.forEach(poi => {
            const poiIcon = this.createPOIIcon(poi.type, poi.icon);
            const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="poi-popup">
                        <i class="fas fa-${poi.icon}"></i>
                        <strong>${poi.name}</strong>
                    </div>
                `);
        });

        // Ajouter des labels de quartiers
        this.addDistrictLabels(map, centerLat, centerLng);
    }

    createPOIIcon(type, iconName) {
        const colors = {
            hospital: { bg: '#ef4444', border: '#dc2626' },
            stadium: { bg: '#3b82f6', border: '#2563eb' },
            church: { bg: '#8b5cf6', border: '#7c3aed' },
            school: { bg: '#10b981', border: '#059669' },
            park: { bg: '#22c55e', border: '#16a34a' },
            airport: { bg: '#f59e0b', border: '#d97706' }
        };

        const color = colors[type] || { bg: '#6366f1', border: '#4f46e5' };

        return L.divIcon({
            className: 'gta-poi-marker',
            html: `
                <div class="gta-poi-marker-inner" style="background: ${color.bg}; border-color: ${color.border};">
                    <i class="fas fa-${iconName}"></i>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    }

    addDistrictLabels(map, centerLat, centerLng) {
        // Labels de quartiers style GTA
        const districts = [
            { lat: centerLat + 0.02, lng: centerLng, name: 'GOMBE', size: 'large' },
            { lat: centerLat - 0.015, lng: centerLng + 0.02, name: 'KALAMU', size: 'medium' },
            { lat: centerLat + 0.01, lng: centerLng - 0.018, name: 'LINGWALA', size: 'medium' },
            { lat: centerLat - 0.02, lng: centerLng - 0.01, name: 'BANDAL', size: 'small' },
        ];

        districts.forEach(district => {
            const label = L.marker([district.lat, district.lng], {
                icon: L.divIcon({
                    className: 'gta-district-label',
                    html: `<div class="gta-district-label-inner gta-district-${district.size}">${district.name}</div>`,
                    iconSize: [100, 30],
                    iconAnchor: [50, 15]
                }),
                interactive: false,
                zIndexOffset: -1000
            }).addTo(map);
        });
    }

    requestGeolocationPermission() {
        // Sur iOS et Android, il faut demander explicitement la permission
        if (!navigator.geolocation) return;

        // Vérifier l'état de la permission
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                console.log('État permission géolocalisation:', result.state);
                
                if (result.state === 'prompt') {
                    // Permission pas encore demandée - demander maintenant
                    navigator.geolocation.getCurrentPosition(
                        () => {
                            console.log('✅ Géolocalisation autorisée');
                        },
                        (error) => {
                            if (error.code === error.PERMISSION_DENIED) {
                                console.log('❌ Géolocalisation refusée');
                            }
                        },
                        { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
                    );
                } else if (result.state === 'granted') {
                    // Permission déjà accordée - ne rien faire, juste logger
                    console.log('✅ Permission géolocalisation déjà accordée');
                } else if (result.state === 'denied') {
                    // Permission refusée
                    console.log('❌ Permission géolocalisation refusée');
                }
                
                // Écouter les changements de permission
                result.onchange = () => {
                    console.log('Changement d\'état permission:', result.state);
                };
            }).catch((error) => {
                // Si l'API permissions n'est pas supportée, essayer directement
                console.log('API permissions non supportée, tentative directe');
                this.tryGetPosition();
            });
        } else {
            // Fallback pour navigateurs qui ne supportent pas permissions API (Android Chrome parfois)
            this.tryGetPosition();
        }
    }

    tryGetPosition() {
        // Essayer d'obtenir la position pour déclencher la demande de permission
        navigator.geolocation.getCurrentPosition(
            () => {
                console.log('✅ Géolocalisation autorisée');
            },
            (error) => {
                // Ne pas afficher d'erreur ici, juste logger
                if (error.code === error.PERMISSION_DENIED) {
                    console.log('❌ Permission refusée');
                } else {
                    console.log('⚠️ Erreur géolocalisation:', error.message);
                }
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
        );
    }

    checkAndRequestPermission() {
        // Vérifier l'état de la permission et afficher le bouton si nécessaire
        if (!navigator.geolocation) {
            this.showPermissionRequest();
            return;
        }

        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                console.log('État permission:', result.state);
                
                if (result.state === 'prompt') {
                    // Permission pas encore demandée - afficher le bouton
                    this.showPermissionRequest();
                } else if (result.state === 'denied') {
                    // Permission refusée - afficher un message spécial Android
                    if (/Android/.test(navigator.userAgent)) {
                        this.showAndroidPermissionHelp();
                    } else {
                        this.showPermissionRequest();
                    }
                } else if (result.state === 'granted') {
                    // Permission accordée, masquer le bouton et l'aide
                    this.hidePermissionRequest();
                    this.hideAndroidPermissionHelp();
                    // L'itinéraire sera calculé automatiquement
                }
                
                // Écouter les changements en temps réel
                result.onchange = () => {
                    console.log('Changement permission détecté:', result.state);
                    if (result.state === 'granted') {
                        this.hidePermissionRequest();
                        this.hideAndroidPermissionHelp();
                        // Mettre à jour l'UI
                        const distanceEl = document.getElementById('routeDistance');
                        const timeEl = document.getElementById('routeTime');
                        if (distanceEl) distanceEl.textContent = 'Calcul en cours...';
                        if (timeEl) timeEl.textContent = '';
                        // Recalculer l'itinéraire automatiquement
                        setTimeout(() => {
                            this.calculateRouteWithRetry();
                        }, 500);
                    } else if (result.state === 'denied') {
                        // Si la permission est refusée, afficher l'aide
                        if (/Android/.test(navigator.userAgent)) {
                            this.showAndroidPermissionHelp();
                        }
                    }
                };
            }).catch(() => {
                // Sur Android, parfois l'API permissions ne fonctionne pas
                // Afficher le bouton par précaution
                if (/Android/.test(navigator.userAgent)) {
                    this.showPermissionRequest();
                }
            });
        } else {
            // Pas d'API permissions - sur Android, afficher le bouton
            if (/Android/.test(navigator.userAgent)) {
                this.showPermissionRequest();
            }
        }
    }

    showAndroidPermissionHelp() {
        // Créer ou afficher une modal d'aide pour Android
        let helpModal = document.getElementById('androidPermissionHelp');
        
        // Vérifier si on est en HTTP (pas HTTPS)
        // Android Chrome bloque la géolocalisation en HTTP sauf pour localhost/127.0.0.1
        // Les IPs locales (172.20.10.6, 192.168.x.x, etc.) sont BLOQUÉES en HTTP sur Android
        const isStrictLocalhost = location.hostname === 'localhost' || 
                                   location.hostname === '127.0.0.1' || 
                                   location.hostname === '0.0.0.0';
        const isHTTP = location.protocol === 'http:' && !isStrictLocalhost;
        
        if (!helpModal) {
            helpModal = document.createElement('div');
            helpModal.id = 'androidPermissionHelp';
            helpModal.className = 'android-permission-help';
            helpModal.innerHTML = `
                <div class="android-permission-content">
                    <div class="android-permission-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Autoriser la localisation</h3>
                    </div>
                    <div class="android-permission-body">
                        ${isHTTP ? `
                        <div class="android-warning-http">
                            <i class="fas fa-lock"></i>
                            <div>
                                <strong>⚠️ Site en HTTP détecté</strong>
                                <p>Android Chrome bloque la géolocalisation en HTTP pour des raisons de sécurité. Même si le site est dans "Autorisé", la géolocalisation ne fonctionnera pas en HTTP.</p>
                                <p><strong>Solutions :</strong></p>
                                <ul>
                                    <li><strong>Utiliser HTTPS :</strong> Installer un certificat SSL sur votre serveur</li>
                                    <li><strong>Utiliser localhost :</strong> Accéder via <code>http://localhost</code> au lieu de l'IP (${location.hostname})</li>
                                    <li><strong>Tunnel HTTPS :</strong> Utiliser ngrok, Cloudflare Tunnel, ou LocalTunnel pour créer un tunnel HTTPS</li>
                                </ul>
                                <p style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-secondary);">
                                    <strong>Note :</strong> Même si le site apparaît dans "Autorisé" dans les paramètres Android, la géolocalisation ne fonctionnera pas en HTTP pour des raisons de sécurité.
                                </p>
                            </div>
                        </div>
                        ` : ''}
                        <p>La permission de localisation est requise pour afficher votre itinéraire vers le magasin.</p>
                        <div class="android-steps">
                            <div class="android-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <strong>Ouvrez les paramètres du navigateur</strong>
                                    <p>Cliquez sur les 3 points (⋮) en haut à droite, puis sélectionnez "Paramètres"</p>
                                </div>
                            </div>
                            <div class="android-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <strong>Allez dans "Paramètres du site"</strong>
                                    <p>Puis cliquez sur "Position" (ou "Localisation")</p>
                                </div>
                            </div>
                            <div class="android-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <strong>Ajoutez ce site à "Autorisé"</strong>
                                    <p>Cliquez sur "Autorisé" puis ajoutez ce site, OU basculez le switch sur "Autoriser" pour ce site</p>
                                </div>
                            </div>
                            <div class="android-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <strong>Revenez sur cette page</strong>
                                    <p>Cliquez sur "J'ai autorisé, réessayer" ci-dessous</p>
                                </div>
                            </div>
                        </div>
                        ${isHTTP ? '' : `
                        <div class="android-tip">
                            <i class="fas fa-lightbulb"></i>
                            <p><strong>Astuce :</strong> Si vous voyez "Autorisé - 1" dans les paramètres, vérifiez que ce site (${location.hostname}) est bien dans la liste.</p>
                        </div>
                        `}
                        <div class="android-permission-actions">
                            <button class="btn btn-primary" id="retryPermissionBtn">
                                <i class="fas fa-redo"></i> J'ai autorisé, réessayer
                            </button>
                            <button class="btn btn-secondary" id="closePermissionHelpBtn">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(helpModal);

            // Bouton réessayer
            document.getElementById('retryPermissionBtn')?.addEventListener('click', () => {
                this.hideAndroidPermissionHelp();
                this.requestLocationPermissionManually();
            });

            // Bouton fermer
            document.getElementById('closePermissionHelpBtn')?.addEventListener('click', () => {
                this.hideAndroidPermissionHelp();
            });
        }

        helpModal.style.display = 'flex';
    }

    hideAndroidPermissionHelp() {
        const helpModal = document.getElementById('androidPermissionHelp');
        if (helpModal) {
            helpModal.style.display = 'none';
        }
    }

    showPermissionRequest() {
        const permissionRequest = document.getElementById('permissionRequest');
        if (permissionRequest) {
            permissionRequest.style.display = 'block';
        }
    }

    hidePermissionRequest() {
        const permissionRequest = document.getElementById('permissionRequest');
        if (permissionRequest) {
            permissionRequest.style.display = 'none';
        }
    }

    requestLocationPermissionManually() {
        // Demander la permission manuellement (action utilisateur requise sur Android)
        if (!navigator.geolocation) {
            alert('La géolocalisation n\'est pas disponible sur votre appareil.');
            return;
        }

        // Vérifier si on est en localhost ou réseau local (HTTP autorisé)
        const isLocalhost = location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1' || 
                           location.hostname === '0.0.0.0' ||
                           /^192\.168\./.test(location.hostname) ||
                           /^10\./.test(location.hostname) ||
                           /^172\.(1[6-9]|2[0-9]|3[01])\./.test(location.hostname);
        
        const isSecure = location.protocol === 'https:' || isLocalhost;

        // Ne pas bloquer si on est en localhost - HTTP fonctionne
        if (!isSecure && !isLocalhost) {
            // Seulement si on n'est PAS en localhost ET pas en HTTPS
            const proceed = confirm(
                '⚠️ La géolocalisation nécessite HTTPS en production.\n\n' +
                'HTTP fonctionne uniquement sur:\n' +
                '• localhost\n' +
                '• 127.0.0.1\n' +
                '• Réseau local (192.168.x.x)\n\n' +
                'Pour tester en local, utilisez:\n' +
                'http://localhost:8000\n\n' +
                'En production, déployez en HTTPS (Vercel, Netlify, etc.)\n\n' +
                'Voulez-vous quand même essayer ?'
            );
            if (!proceed) return;
        }

        const btn = document.getElementById('requestLocationBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Demande en cours...';
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ Permission accordée ! Position:', position.coords);
                this.hidePermissionRequest();
                
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check"></i> Position autorisée';
                    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
                }

                // Mettre à jour l'UI immédiatement
                const distanceEl = document.getElementById('routeDistance');
                const timeEl = document.getElementById('routeTime');
                if (distanceEl) distanceEl.textContent = 'Calcul en cours...';
                if (timeEl) timeEl.textContent = '';

                // Recalculer l'itinéraire maintenant que la permission est accordée
                setTimeout(() => {
                    this.calculateRouteWithRetry();
                }, 500);
            },
            (error) => {
                console.log('Erreur permission:', error.code, error.message);
                
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-location-arrow"></i> Autoriser la position';
                    btn.style.background = '';
                }

                if (error.code === error.PERMISSION_DENIED) {
                    // Sur Android, afficher la modal d'aide au lieu d'un simple alert
                    if (/Android/.test(navigator.userAgent)) {
                        this.showAndroidPermissionHelp();
                    } else {
                        // Sur autres plateformes, utiliser alert
                        alert(
                            'Permission refusée.\n\n' +
                            'Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.\n\n' +
                            'Chrome/Edge: Paramètres > Confidentialité > Localisation\n' +
                            'Firefox: Paramètres > Confidentialité > Permissions > Localisation'
                        );
                    }
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    alert('Position indisponible. Vérifiez que le GPS est activé sur votre appareil.');
                } else if (error.code === error.TIMEOUT) {
                    alert('Timeout. Veuillez réessayer.');
                } else {
                    // Si erreur liée à HTTPS, donner des instructions
                    if (!isSecure && error.message.includes('secure')) {
                        alert(
                            'La géolocalisation nécessite HTTPS en production.\n\n' +
                            'Solutions:\n' +
                            '1. Utilisez localhost pour tester (HTTP fonctionne)\n' +
                            '2. Déployez en HTTPS (Vercel, Netlify, etc.)\n' +
                            '3. Utilisez un tunnel HTTPS (ngrok, Cloudflare Tunnel)'
                        );
                    } else {
                        alert('Impossible d\'obtenir votre position. Erreur: ' + error.message);
                    }
                }
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 0 }
        );
    }

    setViewMode(mode) {
        if (!this.mapInstance) return;

        this.currentView = mode;

        if (mode === '3D') {
            // Vue pseudo-3D : zoom élevé + rotation
            this.mapInstance.setView(this.mapInstance.getCenter(), 18);
            // Ajouter un effet de rotation visuel via CSS
            const mapDiv = document.getElementById('gtaMap');
            if (mapDiv) {
                mapDiv.classList.add('gta-view-3d');
            }
            document.getElementById('view3DBtn')?.classList.add('active');
            document.getElementById('view2DBtn')?.classList.remove('active');
        } else {
            // Vue 2D normale
            this.mapInstance.setView(this.mapInstance.getCenter(), 15);
            const mapDiv = document.getElementById('gtaMap');
            if (mapDiv) {
                mapDiv.classList.remove('gta-view-3d');
            }
            document.getElementById('view2DBtn')?.classList.add('active');
            document.getElementById('view3DBtn')?.classList.remove('active');
        }
    }

    centerOnUser() {
        if (!navigator.geolocation || !this.mapInstance) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                this.mapInstance.setView([userLat, userLng], 16);
            },
            (error) => {
                alert('Impossible d\'obtenir votre position');
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
        );
    }

    centerOnRoute() {
        if (!this.mapInstance || !this.userMarker || !this.storeMarker) return;

        const userPos = this.userMarker.getLatLng();
        const storePos = this.storeMarker.getLatLng();
        
        const group = new L.featureGroup([this.userMarker, this.storeMarker]);
        if (this.routePolyline) {
            group.addLayer(this.routePolyline);
        }
        
        this.mapInstance.fitBounds(group.getBounds().pad(0.2));
    }

    openFullscreenMap() {
        // Créer la modal plein écran
        if (document.getElementById('fullscreenMapModal')) {
            document.getElementById('fullscreenMapModal').classList.add('open');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'fullscreenMapModal';
        modal.className = 'fullscreen-map-modal';
        
        // Animation de réduction de la fenêtre
        const checkoutContent = document.querySelector('.checkout-content');
        if (checkoutContent) {
            checkoutContent.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            checkoutContent.style.transform = 'scale(0.8) translateY(20px)';
            checkoutContent.style.opacity = '0.5';
        }

        modal.innerHTML = `
            <div class="fullscreen-map-header">
                <h3><i class="fas fa-map"></i> Carte interactive</h3>
                <button class="fullscreen-map-close" id="closeFullscreenMap">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="fullscreenMapContainer" style="width: 100%; height: calc(100vh - 60px);"></div>
        `;
        
        document.body.appendChild(modal);
        
        // Attendre un peu pour l'animation
        setTimeout(() => {
            modal.classList.add('open');
            
            // Créer la carte plein écran
            setTimeout(() => {
                this.createFullscreenMap();
            }, 100);
        }, 50);

        // Fermer la modal
        document.getElementById('closeFullscreenMap')?.addEventListener('click', () => {
            this.closeFullscreenMap();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFullscreenMap();
            }
        });
    }

    createFullscreenMap() {
        const container = document.getElementById('fullscreenMapContainer');
        if (!container || !this.mapInstance) return;

        // Créer une nouvelle carte pour le plein écran (ou cloner la position)
        const storeLat = this.storeLocation.lat;
        const storeLng = this.storeLocation.lng;

        const fullscreenMap = L.map('fullscreenMapContainer', {
            center: this.mapInstance.getCenter(),
            zoom: this.mapInstance.getZoom(),
            zoomControl: true,
            attributionControl: false
        });

        // Même style de carte GTA 5 avec routes visibles
        const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(fullscreenMap);
        
        const darkOverlay = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            maxZoom: 19,
            opacity: 0.6
        }).addTo(fullscreenMap);
        
        // Ajouter les POI aussi en plein écran
        this.addPointsOfInterest(fullscreenMap, this.storeLocation.lat, this.storeLocation.lng);

        // Copier les markers et l'itinéraire
        if (this.storeMarker) {
            const storePos = this.storeMarker.getLatLng();
            const storeIcon = L.divIcon({
                className: 'gta-marker-store',
                html: `
                    <div class="gta-marker-store-inner">
                        <i class="fas fa-store"></i>
                        <div class="gta-marker-pulse"></div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            L.marker(storePos, { icon: storeIcon })
                .addTo(fullscreenMap)
                .bindPopup(`<b>🏪 Congo Promotion Store</b><br>${this.storeLocation.address}`)
                .openPopup();
        }

        if (this.userMarker) {
            const userPos = this.userMarker.getLatLng();
            const userIcon = L.divIcon({
                className: 'gta-marker-user',
                html: `
                    <div class="gta-marker-user-inner">
                        <i class="fas fa-street-view"></i>
                        <div class="gta-marker-pulse"></div>
                    </div>
                `,
                iconSize: [48, 48],
                iconAnchor: [24, 48]
            });
            L.marker(userPos, { icon: userIcon })
                .addTo(fullscreenMap)
                .bindPopup('<b>Votre position</b>');
        }

        if (this.routePolyline) {
            const routeLatLngs = this.routePolyline.getLatLngs();
            // Ligne de contour
            const outline = L.polyline(routeLatLngs, {
                color: '#000',
                weight: 10,
                opacity: 0.5,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(fullscreenMap);
            
            // Ligne principale très visible
            const route = L.polyline(routeLatLngs, {
                color: '#facc15',
                weight: 8,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(fullscreenMap);
            
            route.bringToFront();
        }

        // Centrer sur l'itinéraire
        if (this.userMarker && this.storeMarker) {
            const group = new L.featureGroup([
                fullscreenMap.getLayers().find(l => l instanceof L.Marker && l.getLatLng().equals(this.storeMarker.getLatLng())),
                fullscreenMap.getLayers().find(l => l instanceof L.Marker && l.getLatLng().equals(this.userMarker.getLatLng()))
            ].filter(Boolean));
            if (group.getLayers().length > 0) {
                fullscreenMap.fitBounds(group.getBounds().pad(0.2));
            }
        }

        this.fullscreenMapInstance = fullscreenMap;
    }

    closeFullscreenMap() {
        const modal = document.getElementById('fullscreenMapModal');
        if (!modal) return;

        modal.classList.remove('open');
        
        // Restaurer la fenêtre checkout
        const checkoutContent = document.querySelector('.checkout-content');
        if (checkoutContent) {
            setTimeout(() => {
                checkoutContent.style.transform = 'scale(1) translateY(0)';
                checkoutContent.style.opacity = '1';
            }, 200);
        }

        // Supprimer la modal après animation
        setTimeout(() => {
            if (this.fullscreenMapInstance) {
                this.fullscreenMapInstance.remove();
                this.fullscreenMapInstance = null;
            }
            modal.remove();
        }, 400);
    }

    calculateRouteWithRetry(retryCount = 0) {
        const maxRetries = 3;
        
        if (!navigator.geolocation) {
            const distanceEl = document.getElementById('routeDistance');
            const timeEl = document.getElementById('routeTime');
            if (distanceEl) distanceEl.textContent = 'Géolocalisation non disponible';
            if (timeEl) timeEl.textContent = '';
            return;
        }

        // Vérifier si on est en localhost (HTTP autorisé pour la géolocalisation)
        const isLocalhost = location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1' || 
                           location.hostname === '0.0.0.0' ||
                           /^192\.168\./.test(location.hostname) ||
                           /^10\./.test(location.hostname) ||
                           /^172\.(1[6-9]|2[0-9]|3[01])\./.test(location.hostname);
        
        const isSecure = location.protocol === 'https:' || isLocalhost;

        // Si pas HTTPS et pas localhost, informer mais ne pas bloquer
        if (!isSecure && !isLocalhost) {
            const distanceEl = document.getElementById('routeDistance');
            if (distanceEl) {
                distanceEl.textContent = 'HTTPS requis (ou utilisez localhost)';
            }
            console.warn('⚠️ Géolocalisation nécessite HTTPS en production. HTTP fonctionne sur localhost.');
        } else if (isLocalhost) {
            console.log('✅ Localhost détecté - HTTP autorisé pour la géolocalisation');
        }

        // Options améliorées pour Windows et autres plateformes
        const geoOptions = {
            enableHighAccuracy: false, // Désactiver pour éviter timeout sur Windows
            timeout: 30000, // 30 secondes au lieu de 10
            maximumAge: 60000 // Accepter une position de moins d'1 minute
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const storeLat = this.storeLocation.lat;
                const storeLng = this.storeLocation.lng;

                // Ajouter le marqueur utilisateur sur la carte
                if (this.mapInstance) {
                    // Supprimer l'ancien marqueur si existe
                    if (this.userMarker) {
                        this.mapInstance.removeLayer(this.userMarker);
                    }

                    // Créer le marqueur utilisateur style GPS
                    const userIcon = L.divIcon({
                        className: 'gta-marker-user',
                        html: `
                            <div class="gta-marker-user-inner">
                                <i class="fas fa-street-view"></i>
                                <div class="gta-marker-pulse"></div>
                            </div>
                        `,
                        iconSize: [48, 48],
                        iconAnchor: [24, 48]
                    });

                    this.userMarker = L.marker([userLat, userLng], { icon: userIcon })
                        .addTo(this.mapInstance)
                        .bindPopup('<b>Votre position</b>');

                    // Obtenir l'itinéraire réel avec OpenRouteService (gratuit)
                    try {
                        const route = await this.getRouteFromAPI(userLng, userLat, storeLng, storeLat);
                        
                        if (route && route.coordinates) {
                            // Dessiner l'itinéraire style GTA
                            this.drawGTARoute(route.coordinates, route.distance, route.duration);
                        } else {
                            // Fallback : ligne droite si l'API ne répond pas
                            this.drawStraightRoute([userLat, userLng], [storeLat, storeLng]);
                            const distance = this.calculateDistance(userLat, userLng, storeLat, storeLng);
                            const estimatedTime = Math.round(distance * 2);
                            this.updateRouteInfo(distance, estimatedTime);
                        }
                    } catch (error) {
                        console.warn('Erreur API itinéraire, utilisation ligne droite:', error);
                        this.drawStraightRoute([userLat, userLng], [storeLat, storeLng]);
                        const distance = this.calculateDistance(userLat, userLng, storeLat, storeLng);
                        const estimatedTime = Math.round(distance * 2);
                        this.updateRouteInfo(distance, estimatedTime);
                    }

                    // Centrer la carte sur l'itinéraire
                    this.centerOnRoute();
                } else {
                    // Si la carte n'est pas encore chargée, juste calculer la distance
                    const distance = this.calculateDistance(userLat, userLng, storeLat, storeLng);
                    const estimatedTime = Math.round(distance * 2);
                    this.updateRouteInfo(distance, estimatedTime);
                }
            },
            (error) => {
                const distanceEl = document.getElementById('routeDistance');
                const timeEl = document.getElementById('routeTime');
                
                // Réessayer automatiquement en cas de timeout
                if (error.code === error.TIMEOUT && retryCount < maxRetries) {
                    console.log(`Tentative ${retryCount + 1}/${maxRetries}...`);
                    if (distanceEl) distanceEl.textContent = `Tentative ${retryCount + 1}...`;
                    if (timeEl) timeEl.textContent = '';
                    
                    // Réessayer avec un timeout plus long
                    setTimeout(() => {
                        this.calculateRouteWithRetry(retryCount + 1);
                    }, 1000);
                    return;
                }
                
                // Vérifier d'abord l'état réel de la permission avant d'afficher un message
                this.checkPermissionAndHandleError(error, retryCount, maxRetries, distanceEl, timeEl).catch(() => {
                    // En cas d'erreur, afficher un message par défaut
                    if (distanceEl) distanceEl.textContent = 'Calcul en cours...';
                    if (timeEl) timeEl.textContent = '';
                    if (retryCount < maxRetries) {
                        setTimeout(() => {
                            this.calculateRouteWithRetry(retryCount + 1);
                        }, 1500);
                    }
                });
            },
            geoOptions
        );
    }

    async checkPermissionAndHandleError(error, retryCount, maxRetries, distanceEl, timeEl) {
        let errorMessage = 'Position non disponible';
        let shouldRetry = false;
        
        if (error.code === error.PERMISSION_DENIED) {
            // Vérifier l'état réel de la permission
            if (navigator.permissions) {
                try {
                    const result = await navigator.permissions.query({ name: 'geolocation' });
                    
                    if (result.state === 'granted') {
                        // Permission accordée mais erreur - probablement temporaire (Android)
                        errorMessage = 'Calcul en cours...';
                        shouldRetry = retryCount < maxRetries;
                        console.log('Permission accordée mais erreur - réessai automatique');
                    } else if (result.state === 'prompt') {
                        // Permission pas encore demandée - réessayer
                        errorMessage = 'Calcul en cours...';
                        shouldRetry = retryCount < maxRetries;
                    } else {
                        // Vraiment refusée
                        errorMessage = 'Autorisation de position requise';
                        console.log('Permission géolocalisation refusée');
                    }
                } catch (permError) {
                    // API permissions non disponible ou erreur
                    // Sur Android, réessayer car peut être temporaire
                    if (/Android/.test(navigator.userAgent)) {
                        errorMessage = 'Calcul en cours...';
                        shouldRetry = retryCount < maxRetries;
                        console.log('Android - réessai automatique');
                    } else {
                        errorMessage = 'Autorisation de position requise';
                    }
                }
            } else {
                // Pas d'API permissions - sur Android, réessayer automatiquement
                if (/Android/.test(navigator.userAgent) && retryCount < maxRetries) {
                    errorMessage = 'Calcul en cours...';
                    shouldRetry = true;
                    console.log('Android sans API permissions - réessai');
                } else {
                    errorMessage = 'Autorisation de position requise';
                }
            }
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Position indisponible';
        } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Calcul en cours...';
            shouldRetry = retryCount < maxRetries;
        }
        
        // Afficher le message
        if (distanceEl) distanceEl.textContent = errorMessage;
        if (timeEl) timeEl.textContent = '';
        
        // Réessayer si nécessaire
        if (shouldRetry) {
            setTimeout(() => {
                this.calculateRouteWithRetry(retryCount + 1);
            }, 1500);
        }
    }

    async calculateRoute() {
        // Alias pour compatibilité
        this.calculateRouteWithRetry();
    }

    async getRouteFromAPI(userLng, userLat, storeLng, storeLat) {
        // Utiliser OSRM directement (gratuit, pas besoin de clé)
        return await this.getRouteFromOSRM(userLng, userLat, storeLng, storeLat);
    }

    async getRouteFromOSRM(userLng, userLat, storeLng, storeLat) {
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${storeLng},${storeLat}?overview=full&geometries=geojson`
            );
            
            if (!response.ok) return null;
            
            const data = await response.json();
            
            if (data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lng]
                const distance = route.distance / 1000; // en km
                const duration = route.duration / 60; // en minutes
                
                return { coordinates, distance, duration };
            }
        } catch (error) {
            console.error('Erreur OSRM:', error);
            return null;
        }
    }

    drawGTARoute(coordinates, distance, duration) {
        if (!this.mapInstance) return;

        // Supprimer l'ancien itinéraire
        if (this.routePolyline) {
            this.mapInstance.removeLayer(this.routePolyline);
        }

        // Style GTA : ligne très visible avec dégradé jaune/orange/rouge
        const routeStyle = {
            color: '#facc15', // Jaune vif très visible
            weight: 8, // Plus épais pour meilleure visibilité
            opacity: 1, // Opacité maximale
            lineCap: 'round',
            lineJoin: 'round'
        };

        // Créer la polyline avec style GTA très visible
        this.routePolyline = L.polyline(coordinates, routeStyle).addTo(this.mapInstance);

        // Ajouter un effet de glow très visible
        this.routePolyline.setStyle({
            ...routeStyle,
            shadow: true,
            shadowBlur: 20,
            shadowColor: '#facc15',
            shadowOpacity: 0.8
        });

        // Ajouter une ligne de contour pour plus de visibilité
        const outlineStyle = {
            color: '#000',
            weight: 10,
            opacity: 0.5,
            lineCap: 'round',
            lineJoin: 'round'
        };
        
        // Créer une ligne de contour en dessous
        const outline = L.polyline(coordinates, outlineStyle);
        outline.addTo(this.mapInstance);
        this.routePolyline.bringToFront();

        // Mettre à jour les infos
        this.updateRouteInfo(distance, Math.round(duration));
    }

    drawStraightRoute(start, end) {
        if (!this.mapInstance) return;

        // Ligne droite très visible style GTA
        const coordinates = [start, end];
        
        if (this.routePolyline) {
            this.mapInstance.removeLayer(this.routePolyline);
        }

        // Ligne de contour
        const outline = L.polyline(coordinates, {
            color: '#000',
            weight: 10,
            opacity: 0.5,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.mapInstance);

        // Ligne principale très visible
        this.routePolyline = L.polyline(coordinates, {
            color: '#facc15',
            weight: 8,
            opacity: 1,
            dashArray: '15, 8',
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.mapInstance);
        
        this.routePolyline.bringToFront();
    }

    updateRouteInfo(distance, time) {
        const distanceEl = document.getElementById('routeDistance');
        const timeEl = document.getElementById('routeTime');
        
        if (distanceEl) {
            distanceEl.textContent = `${distance.toFixed(1)} km`;
        }
        if (timeEl) {
            timeEl.textContent = `~${time} min`;
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // SYSTÈME DE LIVRAISON
    // ============================================
    
    initDeliveryView() {
        this.updateDeliverySummary();
        this.loadDeliveryMap();
        this.setupDeliveryAddressInput();
        this.deliveryMapInstance = null;
        this.deliveryMarker = null;
        this.selectedDeliveryAddress = null;
        this.selectedDeliveryCoords = null;
        this.deliveryFee = 0;
    }

    updateDeliverySummary() {
        const cart = cartManager.cart;
        const subtotal = cartManager.getTotal();
        
        const summaryHTML = `
            <div class="order-items">
                ${cart.map(item => `
                    <div class="order-item">
                        <img src="${item.coverImageUrl}" alt="${item.title}">
                        <div class="order-item-info">
                            <h4>${this.escapeHtml(item.title)}</h4>
                            <p>${item.quantity} × ${item.price.toLocaleString()} ${item.currency}</p>
                        </div>
                        <div class="order-item-total">
                            ${(item.price * item.quantity).toLocaleString()} ${item.currency}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <span>Sous-total:</span>
                <strong>${subtotal.toLocaleString()} CDF</strong>
            </div>
        `;

        const summaryEl = document.getElementById('deliveryOrderSummary');
        if (summaryEl) summaryEl.innerHTML = summaryHTML;

        // Mettre à jour le sous-total
        const subtotalEl = document.getElementById('deliverySubtotal');
        if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString() + ' CDF';
    }

    loadDeliveryMap() {
        const mapContainer = document.getElementById('deliveryMap');
        if (!mapContainer) return;

        if (mapContainer.classList.contains('map-loaded')) return;

        if (typeof L === 'undefined') {
            setTimeout(() => this.loadDeliveryMap(), 500);
            return;
        }

        mapContainer.innerHTML = '<div id="deliveryMapDiv" style="width: 100%; height: 300px; border-radius: 12px; overflow: hidden;"></div>';

        const mapDiv = document.getElementById('deliveryMapDiv');
        if (!mapDiv) return;

        // Centrer sur Kinshasa par défaut
        const defaultLat = -4.3276;
        const defaultLng = 15.3136;

        const map = L.map('deliveryMapDiv', {
            center: [defaultLat, defaultLng],
            zoom: 13,
            zoomControl: true,
            attributionControl: false
        });

        const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);

        const darkOverlay = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            maxZoom: 19,
            opacity: 0.6
        }).addTo(map);

        // Marqueur du magasin
        const storeIcon = L.divIcon({
            className: 'gta-marker-store',
            html: `
                <div class="gta-marker-store-inner">
                    <i class="fas fa-store"></i>
                    <div class="gta-marker-pulse"></div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 48]
        });

        const storeMarker = L.marker([this.storeLocation.lat, this.storeLocation.lng], { icon: storeIcon })
            .addTo(map)
            .bindPopup('<b>🏪 Congo Promotion Store</b><br>' + this.storeLocation.address);

        // Permettre de cliquer sur la carte pour sélectionner l'adresse
        map.on('click', (e) => {
            this.setDeliveryLocation(e.latlng.lat, e.latlng.lng);
            this.reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        this.deliveryMapInstance = map;
        this.storeMarker = storeMarker;
        this.deliveryMarker = null;
        mapContainer.classList.add('map-loaded');
    }

    setupDeliveryAddressInput() {
        const addressInput = document.getElementById('deliveryAddress');
        if (!addressInput) return;

        let geocodeTimeout;
        addressInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(geocodeTimeout);
            if (query.length < 3) {
                document.getElementById('addressSuggestions').innerHTML = '';
                return;
            }

            geocodeTimeout = setTimeout(() => {
                this.geocodeAddress(query);
            }, 500);
        });
    }

    async geocodeAddress(query) {
        try {
            // Utiliser Nominatim (OpenStreetMap) pour la géocodification
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=fr`
            );
            const results = await response.json();

            const suggestionsEl = document.getElementById('addressSuggestions');
            if (!suggestionsEl) return;

            if (results.length === 0) {
                suggestionsEl.innerHTML = '<div class="address-suggestion">Aucune adresse trouvée</div>';
                return;
            }

            suggestionsEl.innerHTML = results.map(result => `
                <div class="address-suggestion" data-lat="${result.lat}" data-lng="${result.lon}">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>${result.display_name}</strong>
                    </div>
                </div>
            `).join('');

            // Ajouter les event listeners
            suggestionsEl.querySelectorAll('.address-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    const lat = parseFloat(suggestion.dataset.lat);
                    const lng = parseFloat(suggestion.dataset.lng);
                    const address = suggestion.querySelector('strong').textContent;
                    
                    document.getElementById('deliveryAddress').value = address;
                    suggestionsEl.innerHTML = '';
                    this.setDeliveryLocation(lat, lng);
                });
            });
        } catch (error) {
            console.error('Erreur géocodification:', error);
        }
    }

    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
            );
            const result = await response.json();
            
            if (result.display_name) {
                document.getElementById('deliveryAddress').value = result.display_name;
                this.selectedDeliveryAddress = result.display_name;
            }
        } catch (error) {
            console.error('Erreur reverse géocodification:', error);
        }
    }

    setDeliveryLocation(lat, lng) {
        this.selectedDeliveryCoords = { lat, lng };
        
        if (!this.deliveryMapInstance) return;

        // Supprimer l'ancien marqueur
        if (this.deliveryMarker) {
            this.deliveryMapInstance.removeLayer(this.deliveryMarker);
        }

        // Créer le nouveau marqueur
        const deliveryIcon = L.divIcon({
            className: 'gta-marker-user',
            html: `
                <div class="gta-marker-user-inner">
                    <i class="fas fa-map-marker-alt"></i>
                    <div class="gta-marker-pulse"></div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 48]
        });

        this.deliveryMarker = L.marker([lat, lng], { icon: deliveryIcon })
            .addTo(this.deliveryMapInstance)
            .bindPopup('<b>📍 Adresse de livraison</b>')
            .openPopup();

        // Centrer la carte sur les deux points
        const group = new L.featureGroup([this.storeMarker, this.deliveryMarker]);
        this.deliveryMapInstance.fitBounds(group.getBounds().pad(0.2));

        // Calculer la distance et les frais
        this.calculateDeliveryFee(lat, lng);
    }

    calculateDeliveryFee(deliveryLat, deliveryLng) {
        const distance = this.calculateDistance(
            this.storeLocation.lat,
            this.storeLocation.lng,
            deliveryLat,
            deliveryLng
        );

        // Calcul des frais selon la distance (exemple: 1000 CDF par km, minimum 2000 CDF)
        // Vous pouvez ajuster cette formule selon vos besoins
        const baseFee = 2000; // Frais de base
        const feePerKm = 1000; // Frais par kilomètre
        this.deliveryFee = Math.max(baseFee, Math.round(distance * feePerKm));

        // Mettre à jour l'interface
        const feeEl = document.getElementById('deliveryFee');
        const feeAmountEl = document.getElementById('deliveryFeeAmount');
        const distanceEl = document.getElementById('deliveryDistance');
        const totalEl = document.getElementById('deliveryTotal');

        if (feeEl) feeEl.textContent = this.deliveryFee.toLocaleString() + ' CDF';
        if (feeAmountEl) feeAmountEl.textContent = this.deliveryFee.toLocaleString() + ' CDF';
        if (distanceEl) distanceEl.textContent = distance.toFixed(1) + ' km';

        const subtotal = cartManager.getTotal();
        const total = subtotal + this.deliveryFee;
        if (totalEl) totalEl.textContent = total.toLocaleString() + ' CDF';
    }

    useCurrentLocationForDelivery() {
        if (!navigator.geolocation) {
            alert('La géolocalisation n\'est pas disponible sur votre appareil.');
            return;
        }

        const btn = document.getElementById('useCurrentLocationBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localisation...';
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                this.setDeliveryLocation(lat, lng);
                this.reverseGeocode(lat, lng);
                
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position';
                }
            },
            (error) => {
                alert('Impossible d\'obtenir votre position. Veuillez saisir votre adresse manuellement.');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position';
                }
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
        );
    }

    async submitDeliveryOrder(formData) {
        if (!this.selectedDeliveryCoords) {
            alert('Veuillez sélectionner une adresse de livraison sur la carte ou utiliser le bouton "Utiliser ma position".');
            return;
        }

        const cart = cartManager.cart;
        const subtotal = cartManager.getTotal();
        const total = subtotal + this.deliveryFee;

        const deliveryData = {
            items: cart,
            subtotal: subtotal,
            deliveryFee: this.deliveryFee,
            total: total,
            customer: {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                address: formData.get('address') || this.selectedDeliveryAddress,
                coordinates: this.selectedDeliveryCoords
            },
            storeLocation: this.storeLocation,
            status: 'pending', // pending, assigned, in_transit, delivered, cancelled
            timestamp: new Date().toISOString()
        };

        try {
            // Créer la livraison via l'API
            if (window.DeliveryAPI) {
                const result = await window.DeliveryAPI.createDelivery(deliveryData);
                
                if (result.error) {
                    alert('Erreur: ' + result.error);
                    return;
                }

                // Rediriger vers la page de suivi
                if (result.delivery && result.delivery.id) {
                    window.location.href = `delivery-tracking.html?id=${result.delivery.id}`;
                } else {
                    alert('Commande de livraison enregistrée ! Vous serez contacté par WhatsApp pour le suivi.');
                    this.closeCheckout();
                    cartManager.clearCart();
                }
            } else {
                // Fallback si l'API n'est pas encore disponible
                console.log('Données de livraison:', deliveryData);
                alert('Commande de livraison enregistrée ! Vous serez contacté par WhatsApp pour le suivi.');
                this.closeCheckout();
                cartManager.clearCart();
            }
        } catch (error) {
            console.error('Erreur lors de la création de la livraison:', error);
            alert('Erreur lors de l\'enregistrement de la commande. Veuillez réessayer.');
        }
    }
}

// Initialiser le gestionnaire de checkout
let checkoutManager;
document.addEventListener('DOMContentLoaded', () => {
    checkoutManager = new CheckoutManager();
    window.checkoutManager = checkoutManager;
});

