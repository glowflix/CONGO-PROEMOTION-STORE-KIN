// Configuration du système de livraison
const DELIVERY_CONFIG = {
    // Coordonnées du magasin (même que checkout)
    storeLocation: {
        lat: -4.3276,
        lng: 15.3136,
        address: 'Congo Promotion Store, Kinshasa, RD Congo'
    },
    // Numéro WhatsApp pour contacter le livreur
    whatsappNumber: '243900000000', // À remplacer par le numéro réel
    // Frais de livraison
    baseFee: 2000, // Frais de base en CDF
    feePerKm: 1000, // Frais par kilomètre en CDF
    // Intervalle de mise à jour du suivi (en millisecondes)
    trackingUpdateInterval: 5000 // 5 secondes
};

// Gestionnaire principal de la livraison
class DeliveryManager {
    constructor() {
        this.storeLocation = DELIVERY_CONFIG.storeLocation;
        this.whatsappNumber = DELIVERY_CONFIG.whatsappNumber;
        this.selectedCoords = null;
        this.selectedAddress = null;
        this.deliveryFee = 0;
        this.deliveryId = null;
        this.trackingInterval = null;
        
        // Cartes
        this.addressMapInstance = null;
        this.addressMarker = null;
        this.addressRoute = null;
        this.addressRouteOutline = null;
        this.storeMarker = null;
        this.trackingMapInstance = null;
        this.trackingMarkers = {
            customer: null,
            driver: null,
            route: null
        };
        this.routeInfoPanel = null;
        
        // Produits (depuis localStorage ou URL)
        this.orderItems = [];
        
        this.init();
    }

    init() {
        // Charger les produits depuis localStorage ou URL
        this.loadOrderItems();
        
        // Initialiser la carte d'adresse
        this.initAddressMap();
        
        // Configurer les event listeners
        this.setupEventListeners();
        
        // Si on est en mode suivi (avec ID dans l'URL)
        const urlParams = new URLSearchParams(window.location.search);
        const deliveryId = urlParams.get('id');
        if (deliveryId) {
            this.deliveryId = deliveryId;
            this.showTrackingSection();
            this.startTracking();
        }
    }

    loadOrderItems() {
        // Essayer de charger depuis localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                this.orderItems = JSON.parse(savedCart);
            } catch (e) {
                console.error('Erreur chargement panier:', e);
                this.orderItems = [];
            }
        }
        
        // Si aucun produit, afficher un message
        if (this.orderItems.length === 0) {
            console.warn('Aucun produit dans le panier');
        }
    }

    setupEventListeners() {
        // Bouton utiliser position actuelle
        const useLocationBtn = document.getElementById('useCurrentLocationBtn');
        if (useLocationBtn) {
            useLocationBtn.addEventListener('click', () => this.useCurrentLocation());
        }

        // Input d'adresse avec géocodification
        const addressInput = document.getElementById('deliveryAddressInput');
        if (addressInput) {
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

        // Confirmer l'adresse
        const confirmAddressBtn = document.getElementById('confirmAddressBtn');
        if (confirmAddressBtn) {
            confirmAddressBtn.addEventListener('click', () => this.confirmAddress());
        }

        // Confirmer la commande
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', () => this.confirmOrder());
        }
    }

    initAddressMap() {
        const mapContainer = document.getElementById('addressMap');
        if (!mapContainer) return;

        if (typeof L === 'undefined') {
            setTimeout(() => this.initAddressMap(), 500);
            return;
        }

        mapContainer.innerHTML = '<div id="addressMapDiv" style="width: 100%; height: 400px; border-radius: 12px; overflow: hidden;"></div>';

        const mapDiv = document.getElementById('addressMapDiv');
        if (!mapDiv) return;

        // Centrer sur Kinshasa par défaut
        const defaultLat = -4.3276;
        const defaultLng = 15.3136;

        const map = L.map('addressMapDiv', {
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

        this.storeMarker = L.marker([this.storeLocation.lat, this.storeLocation.lng], { icon: storeIcon })
            .addTo(map)
            .bindPopup('<b>🏪 Congo Promotion Store</b><br>' + this.storeLocation.address);

        // Permettre de cliquer sur la carte pour sélectionner l'adresse
        map.on('click', (e) => {
            this.setAddressLocation(e.latlng.lat, e.latlng.lng);
            this.reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        this.addressMapInstance = map;
    }

    async geocodeAddress(query) {
        try {
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
                    
                    document.getElementById('deliveryAddressInput').value = address;
                    suggestionsEl.innerHTML = '';
                    this.setAddressLocation(lat, lng);
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
                document.getElementById('deliveryAddressInput').value = result.display_name;
                this.selectedAddress = result.display_name;
            }
        } catch (error) {
            console.error('Erreur reverse géocodification:', error);
        }
    }

    setAddressLocation(lat, lng) {
        this.selectedCoords = { lat, lng };
        
        if (!this.addressMapInstance) return;

        // Supprimer l'ancien marqueur
        if (this.addressMarker) {
            this.addressMapInstance.removeLayer(this.addressMarker);
        }

        // Supprimer l'ancien itinéraire s'il existe
        if (this.addressRoute) {
            this.addressMapInstance.removeLayer(this.addressRoute);
        }
        if (this.addressRouteOutline) {
            this.addressMapInstance.removeLayer(this.addressRouteOutline);
        }

        // Créer le nouveau marqueur
        const addressIcon = L.divIcon({
            className: 'gta-marker-user',
            html: `
                <div class="gta-marker-user-inner" style="background: #22c55e;">
                    <i class="fas fa-map-marker-alt"></i>
                    <div class="gta-marker-pulse"></div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 48]
        });

        this.addressMarker = L.marker([lat, lng], { icon: addressIcon })
            .addTo(this.addressMapInstance)
            .bindPopup('<b>📍 Votre adresse de livraison</b>')
            .openPopup();

        // Calculer et afficher l'itinéraire depuis le magasin
        this.calculateAddressRoute(lat, lng);

        // Centrer la carte sur les deux points
        if (this.storeMarker) {
            const group = new L.featureGroup([this.storeMarker, this.addressMarker]);
            this.addressMapInstance.fitBounds(group.getBounds().pad(0.2));
        }

        // Calculer la distance et les frais
        this.calculateDeliveryFee(lat, lng);
    }

    async calculateAddressRoute(deliveryLat, deliveryLng) {
        if (!this.addressMapInstance) return;

        try {
            // Calculer l'itinéraire depuis le magasin vers l'adresse
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${this.storeLocation.lng},${this.storeLocation.lat};${deliveryLng},${deliveryLat}?overview=full&geometries=geojson`
            );
            
            if (!response.ok) return;
            
            const data = await response.json();
            
            if (data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lng]
                
                // Ligne de contour (ombre)
                this.addressRouteOutline = L.polyline(coordinates, {
                    color: '#000',
                    weight: 10,
                    opacity: 0.3,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.addressMapInstance);
                
                // Ligne principale de l'itinéraire
                this.addressRoute = L.polyline(coordinates, {
                    color: '#facc15',
                    weight: 8,
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.addressMapInstance);
                
                this.addressRoute.bringToFront();
            }
        } catch (error) {
            console.error('Erreur calcul itinéraire:', error);
        }
    }

    calculateDeliveryFee(deliveryLat, deliveryLng) {
        const distance = this.calculateDistance(
            this.storeLocation.lat,
            this.storeLocation.lng,
            deliveryLat,
            deliveryLng
        );

        // Calcul des frais selon la distance
        const baseFee = DELIVERY_CONFIG.baseFee;
        const feePerKm = DELIVERY_CONFIG.feePerKm;
        this.deliveryFee = Math.max(baseFee, Math.round(distance * feePerKm));

        // Mettre à jour l'interface
        const feeEl = document.getElementById('deliveryFee');
        const distanceEl = document.getElementById('deliveryDistance');

        if (feeEl) feeEl.textContent = this.deliveryFee.toLocaleString() + ' CDF';
        if (distanceEl) distanceEl.textContent = distance.toFixed(1) + ' km';
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

    useCurrentLocation() {
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
                this.setAddressLocation(lat, lng);
                this.reverseGeocode(lat, lng);
                
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-location-arrow"></i> Ma position';
                }
            },
            (error) => {
                alert('Impossible d\'obtenir votre position. Veuillez saisir votre adresse manuellement.');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-location-arrow"></i> Ma position';
                }
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
        );
    }

    confirmAddress() {
        const form = document.getElementById('deliveryAddressForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!this.selectedCoords) {
            alert('Veuillez sélectionner une adresse sur la carte ou utiliser le bouton "Ma position".');
            return;
        }

        // Afficher la section de résumé
        this.showSummarySection();
    }

    showSummarySection() {
        document.getElementById('addressSection').style.display = 'none';
        document.getElementById('summarySection').style.display = 'block';
        
        // Calculer le sous-total
        const subtotal = this.orderItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Afficher les produits
        const productsEl = document.getElementById('summaryProducts');
        if (productsEl) {
            productsEl.innerHTML = this.orderItems.map(item => `
                <div class="summary-product-item">
                    <img src="${item.coverImageUrl || item.image || ''}" alt="${item.title}">
                    <div class="summary-product-info">
                        <h4>${this.escapeHtml(item.title)}</h4>
                        <p>${item.quantity} × ${item.price.toLocaleString()} ${item.currency || 'CDF'}</p>
                    </div>
                    <div class="summary-product-total">
                        ${(item.price * item.quantity).toLocaleString()} ${item.currency || 'CDF'}
                    </div>
                </div>
            `).join('');
        }

        // Afficher les totaux
        const total = subtotal + this.deliveryFee;
        document.getElementById('summarySubtotal').textContent = subtotal.toLocaleString() + ' CDF';
        document.getElementById('summaryDeliveryFee').textContent = this.deliveryFee.toLocaleString() + ' CDF';
        document.getElementById('summaryTotal').textContent = total.toLocaleString() + ' CDF';
    }

    async confirmOrder() {
        if (this.orderItems.length === 0) {
            alert('Aucun produit dans votre commande.');
            return;
        }

        const form = document.getElementById('deliveryAddressForm');
        const formData = new FormData(form);

        const deliveryData = {
            items: this.orderItems,
            subtotal: this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryFee: this.deliveryFee,
            total: this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + this.deliveryFee,
            customer: {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                address: formData.get('address') || this.selectedAddress,
                coordinates: this.selectedCoords
            },
            storeLocation: this.storeLocation,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        try {
            if (!window.DeliveryAPI) {
                alert('API de livraison non disponible. Veuillez réessayer plus tard.');
                return;
            }

            const result = await window.DeliveryAPI.createDelivery(deliveryData);
            
            if (result.error) {
                alert('Erreur: ' + result.error);
                return;
            }

            if (result.delivery && result.delivery.id) {
                this.deliveryId = result.delivery.id;
                
                // Envoyer un message WhatsApp
                this.sendWhatsAppNotification(deliveryData);
                
                // Afficher la section de suivi
                this.showTrackingSection();
                this.startTracking();
            } else {
                alert('Commande enregistrée ! Vous serez contacté par WhatsApp pour le suivi.');
            }
        } catch (error) {
            console.error('Erreur lors de la création de la livraison:', error);
            alert('Erreur lors de l\'enregistrement de la commande. Veuillez réessayer.');
        }
    }

    sendWhatsAppNotification(deliveryData) {
        const phone = deliveryData.customer.phone.replace(/[^0-9]/g, '');
        let message = `🛒 *Nouvelle commande de livraison*%0A%0A`;
        message += `*Client:* ${deliveryData.customer.fullName}%0A`;
        message += `*Téléphone:* ${deliveryData.customer.phone}%0A`;
        message += `*Adresse:* ${deliveryData.customer.address}%0A%0A`;
        message += `*Produits:*%0A`;
        deliveryData.items.forEach((item, index) => {
            message += `${index + 1}. ${item.title} (${item.quantity}x) - ${(item.price * item.quantity).toLocaleString()} CDF%0A`;
        });
        message += `%0A*Sous-total:* ${deliveryData.subtotal.toLocaleString()} CDF%0A`;
        message += `*Frais de livraison:* ${deliveryData.deliveryFee.toLocaleString()} CDF%0A`;
        message += `*Total:* ${deliveryData.total.toLocaleString()} CDF%0A%0A`;
        message += `*ID Commande:* ${this.deliveryId}%0A%0A`;
        message += `Merci pour votre commande !`;

        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${message}`;
        // Ouvrir dans un nouvel onglet
        window.open(whatsappUrl, '_blank');
    }

    showTrackingSection() {
        document.getElementById('addressSection').style.display = 'none';
        document.getElementById('summarySection').style.display = 'none';
        document.getElementById('trackingSection').style.display = 'block';

        // Afficher l'ID de livraison
        if (this.deliveryId) {
            document.getElementById('deliveryIdDisplay').textContent = this.deliveryId;
        }

        // Initialiser la carte de suivi
        this.initTrackingMap();

        // Afficher le produit
        this.displayDeliveryProduct();
    }

    initTrackingMap() {
        const mapContainer = document.getElementById('trackingMap');
        if (!mapContainer) return;

        if (typeof L === 'undefined') {
            setTimeout(() => this.initTrackingMap(), 500);
            return;
        }

        mapContainer.innerHTML = '<div id="trackingMapDiv" style="width: 100%; height: 500px; border-radius: 12px; overflow: hidden;"></div>';

        const mapDiv = document.getElementById('trackingMapDiv');
        if (!mapDiv) return;

        // Centrer sur l'adresse du client
        const centerLat = this.selectedCoords ? this.selectedCoords.lat : -4.3276;
        const centerLng = this.selectedCoords ? this.selectedCoords.lng : 15.3136;

        const map = L.map('trackingMapDiv', {
            center: [centerLat, centerLng],
            zoom: 14,
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

        // Marqueur de l'adresse du client
        if (this.selectedCoords) {
            const customerIcon = L.divIcon({
                className: 'gta-marker-user',
                html: `
                    <div class="gta-marker-user-inner" style="background: #22c55e;">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="gta-marker-pulse"></div>
                    </div>
                `,
                iconSize: [48, 48],
                iconAnchor: [24, 48]
            });

            this.trackingMarkers.customer = L.marker([this.selectedCoords.lat, this.selectedCoords.lng], { icon: customerIcon })
                .addTo(map)
                .bindPopup('<b>📍 Votre adresse</b>');
        }

        this.trackingMapInstance = map;
    }

    displayDeliveryProduct() {
        const productInfoEl = document.getElementById('deliveryProductInfo');
        if (!productInfoEl || this.orderItems.length === 0) return;

        const firstItem = this.orderItems[0];
        productInfoEl.innerHTML = `
            <div class="delivery-product-info">
                <img src="${firstItem.coverImageUrl || firstItem.image || ''}" alt="${firstItem.title}">
                <div class="delivery-product-details">
                    <h5>${this.escapeHtml(firstItem.title)}</h5>
                    <p>Quantité: ${firstItem.quantity}</p>
                    <p>Prix: ${(firstItem.price * firstItem.quantity).toLocaleString()} ${firstItem.currency || 'CDF'}</p>
                </div>
            </div>
        `;
    }

    async startTracking() {
        if (!this.deliveryId) return;

        // Mettre à jour immédiatement
        await this.updateTracking();

        // Puis mettre à jour régulièrement
        this.trackingInterval = setInterval(() => {
            this.updateTracking();
        }, DELIVERY_CONFIG.trackingUpdateInterval);
    }

    async updateTracking() {
        if (!this.deliveryId || !window.DeliveryAPI) return;

        try {
            const result = await window.DeliveryAPI.getDelivery(this.deliveryId);
            
            if (result.error) {
                console.error('Erreur récupération livraison:', result.error);
                return;
            }

            if (result.delivery) {
                const delivery = result.delivery;
                
                // Mettre à jour le statut
                this.updateDeliveryStatus(delivery.status);
                
                // Si un livreur est assigné, afficher ses infos
                if (delivery.driver && delivery.status !== 'pending') {
                    this.displayDriverInfo(delivery.driver);
                    this.updateDriverMarker(delivery.driver.location);
                    this.updateRoute(delivery.driver.location);
                }
            }
        } catch (error) {
            console.error('Erreur mise à jour suivi:', error);
        }
    }

    updateDeliveryStatus(status) {
        // Mettre à jour la timeline
        const statuses = ['pending', 'assigned', 'in_transit', 'delivered'];
        statuses.forEach((s, index) => {
            const item = document.querySelector(`.timeline-item[data-status="${s}"]`);
            if (item) {
                if (index <= statuses.indexOf(status)) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }

    displayDriverInfo(driver) {
        const driverCard = document.getElementById('driverInfoCard');
        if (!driverCard) return;

        driverCard.style.display = 'block';

        // Afficher les informations du livreur
        document.getElementById('driverName').textContent = driver.name || 'Livreur';
        document.getElementById('driverAvatar').src = driver.avatar || '/assets/images/default-avatar.png';
        
        // Type de véhicule
        const vehicleTypes = {
            'moto': { icon: 'fa-motorcycle', label: 'Moto' },
            'taxi': { icon: 'fa-taxi', label: 'Taxi' },
            'voiture': { icon: 'fa-car', label: 'Voiture' },
            'car': { icon: 'fa-car', label: 'Voiture' }
        };
        const vehicleType = vehicleTypes[driver.vehicle || 'moto'] || vehicleTypes.moto;
        document.getElementById('driverVehicleType').innerHTML = `<i class="fas ${vehicleType.icon}"></i> ${vehicleType.label}`;
        
        // Note
        document.getElementById('driverRating').textContent = (driver.rating || '5.0') + '/5';

        // Lien WhatsApp
        const whatsappLink = document.getElementById('driverWhatsAppLink');
        if (whatsappLink && driver.phone) {
            const phone = driver.phone.replace(/[^0-9]/g, '');
            whatsappLink.href = `https://wa.me/${phone}?text=Bonjour, je suis le client pour la livraison ${this.deliveryId}`;
        }
    }

    updateDriverMarker(location) {
        if (!this.trackingMapInstance || !location) return;

        const { lat, lng } = location;

        // Supprimer l'ancien marqueur
        if (this.trackingMarkers.driver) {
            this.trackingMapInstance.removeLayer(this.trackingMarkers.driver);
        }

        // Créer le nouveau marqueur
        const driverIcon = L.divIcon({
            className: 'gta-marker-user',
            html: `
                <div class="gta-marker-user-inner" style="background: #3b82f6;">
                    <i class="fas fa-truck"></i>
                    <div class="gta-marker-pulse"></div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 48]
        });

        this.trackingMarkers.driver = L.marker([lat, lng], { icon: driverIcon })
            .addTo(this.trackingMapInstance)
            .bindPopup('<b>🚚 Livreur</b>');

        // Centrer la carte sur les deux points
        if (this.trackingMarkers.customer) {
            const group = new L.featureGroup([this.trackingMarkers.customer, this.trackingMarkers.driver]);
            this.trackingMapInstance.fitBounds(group.getBounds().pad(0.2));
        }
    }

    async updateRoute(driverLocation) {
        if (!this.trackingMapInstance || !driverLocation || !this.selectedCoords) return;

        try {
            // Calculer l'itinéraire depuis le livreur vers le client
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${this.selectedCoords.lng},${this.selectedCoords.lat}?overview=full&geometries=geojson&steps=true`
            );
            
            if (!response.ok) return;
            
            const data = await response.json();
            
            if (data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lng]
                
                // Calculer distance et durée
                const distance = (route.distance / 1000).toFixed(1); // en km
                const duration = Math.round(route.duration / 60); // en minutes
                
                // Supprimer l'ancien itinéraire
                if (this.trackingMarkers.route) {
                    this.trackingMapInstance.removeLayer(this.trackingMarkers.route);
                }
                
                // Supprimer l'ancien panneau d'info
                if (this.routeInfoPanel) {
                    this.routeInfoPanel.remove();
                }
                
                // Créer la ligne de contour (ombre)
                const outline = L.polyline(coordinates, {
                    color: '#000',
                    weight: 10,
                    opacity: 0.3,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.trackingMapInstance);
                
                // Dessiner le nouvel itinéraire avec style amélioré
                this.trackingMarkers.route = L.polyline(coordinates, {
                    color: '#facc15',
                    weight: 8,
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.trackingMapInstance);
                
                this.trackingMarkers.route.bringToFront();
                
                // Créer le panneau d'information sur l'itinéraire
                this.createRouteInfoPanel(distance, duration);
            }
        } catch (error) {
            console.error('Erreur calcul itinéraire:', error);
        }
    }

    createRouteInfoPanel(distance, duration) {
        // Supprimer l'ancien panneau s'il existe
        const existingPanel = document.querySelector('.route-info-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const mapContainer = document.getElementById('trackingMap');
        if (!mapContainer) return;

        const panel = document.createElement('div');
        panel.className = 'route-info-panel';
        panel.innerHTML = `
            <h5><i class="fas fa-route"></i> Itinéraire</h5>
            <div class="route-info-item">
                <i class="fas fa-route"></i>
                <span>Distance: <strong>${distance} km</strong></span>
            </div>
            <div class="route-info-item">
                <i class="fas fa-clock"></i>
                <span>Temps estimé: <strong>~${duration} min</strong></span>
            </div>
        `;

        mapContainer.appendChild(panel);
        this.routeInfoPanel = panel;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        // Nettoyer les intervalles
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
    }
}

// Initialiser le gestionnaire de livraison
let deliveryManager;
document.addEventListener('DOMContentLoaded', () => {
    deliveryManager = new DeliveryManager();
    window.deliveryManager = deliveryManager;
});

// Nettoyer à la fermeture de la page
window.addEventListener('beforeunload', () => {
    if (deliveryManager) {
        deliveryManager.destroy();
    }
});

