// Gestion de la page Store
class StoreManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = '';
        this.currentSort = 'newest';
        this.priceRange = { min: 0, max: 1000000 };
        this.searchQuery = '';
        this.cursor = null;
        this.loading = false;
        this.init();
    }

    init() {
        this.setupSearch();
        this.setupFilters();
        this.setupPriceRange();
        this.loadProducts();
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
    }

    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        this.searchQuery = searchInput.value.trim();
        this.products = [];
        this.cursor = null;
        await this.loadProducts();
    }

    setupFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.applyFilters();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.sortProducts();
            });
        }
    }

    setupPriceRange() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceMinDisplay = document.getElementById('priceMinDisplay');
        const priceMaxDisplay = document.getElementById('priceMaxDisplay');

        if (priceMin && priceMax) {
            priceMin.addEventListener('input', (e) => {
                this.priceRange.min = parseInt(e.target.value);
                if (priceMinDisplay) priceMinDisplay.textContent = this.priceRange.min;
                this.applyFilters();
            });

            priceMax.addEventListener('input', (e) => {
                this.priceRange.max = parseInt(e.target.value);
                if (priceMaxDisplay) priceMaxDisplay.textContent = this.priceRange.max;
                this.applyFilters();
            });
        }
    }

    async loadProducts(useCache = true) {
        if (this.loading) return;
        
        this.loading = true;
        const grid = document.getElementById('productsGrid');
        
        try {
            let data = null;
            let fromCache = false;
            
            // Si recherche, essayer le cache de recherche
            if (this.searchQuery && useCache && window.indexedDBCache) {
                const cacheResults = await window.indexedDBCache.searchProducts(this.searchQuery, 'all');
                if (cacheResults && cacheResults.length > 0) {
                    data = { products: cacheResults, hasMore: false };
                    fromCache = true;
                    console.log(`⚡ Recherche depuis le cache: "${this.searchQuery}" (${cacheResults.length} résultats)`);
                }
            } else if (!this.searchQuery && useCache && window.indexedDBCache) {
                try {
                    // TOUJOURS utiliser le cache s'il existe, même très ancien
                    let cacheData = await window.indexedDBCache.getProducts('all', Infinity);
                    
                    if (cacheData && cacheData.products && cacheData.products.length > 0) {
                        data = {
                            products: cacheData.products,
                            cursor: null,
                            hasMore: false
                        };
                        fromCache = true;
                        const ageMinutes = Math.round(cacheData.cacheAge / 1000 / 60);
                        console.log(`⚡ Produits chargés depuis le cache (${cacheData.products.length} produits, âge: ${ageMinutes}min)`);
                        
                        // Afficher immédiatement
                        this.products = [...cacheData.products];
                        this.renderProducts(cacheData.products);
                        this.loading = false;
                    }
                } catch (cacheError) {
                    console.warn('Erreur récupération cache:', cacheError);
                }
            }
            
            // Si on a du cache, charger l'API en arrière-plan (non bloquant)
            if (fromCache) {
                this.loading = false; // Permettre d'autres actions
                
                // Charger depuis API en arrière-plan sans bloquer
                Promise.resolve().then(async () => {
                    try {
                        let apiData;
                        if (this.searchQuery) {
                            apiData = await ProductsAPI.searchProducts(this.searchQuery, 20);
                        } else {
                            apiData = await ProductsAPI.getProducts(20, this.cursor);
                        }
                        
                        if (apiData.products && apiData.products.length > 0) {
                            // Sauvegarder dans le cache
                            if (window.indexedDBCache && !this.searchQuery) {
                                window.indexedDBCache.saveProducts(apiData.products, 'all', {
                                    cursor: apiData.cursor,
                                    hasMore: apiData.hasMore
                                }).catch(err => console.warn('Erreur sauvegarde cache:', err));
                            }
                            
                            // Mettre à jour seulement si différent du cache
                            const cacheIds = this.products.map(p => p.id).sort().join(',');
                            const apiIds = apiData.products.map(p => p.id).sort().join(',');
                            if (cacheIds !== apiIds) {
                                this.products = [...apiData.products];
                                this.cursor = apiData.cursor;
                                this.applyFilters();
                            }
                        }
                    } catch (apiError) {
                        // Erreur API non bloquante si on a déjà le cache
                        console.warn('⚠️ Erreur API (non bloquant):', apiError.message);
                    }
                });
                
                return; // Sortir immédiatement après avoir affiché le cache
            }
            
            // Si pas de cache, charger depuis l'API (bloquant)
            let apiData;
            try {
                if (this.searchQuery) {
                    apiData = await ProductsAPI.searchProducts(this.searchQuery, 20);
                } else {
                    apiData = await ProductsAPI.getProducts(20, this.cursor);
                }
            } catch (apiError) {
                this.loading = false;
                // Si erreur API, essayer quand même le cache même très ancien (dernier recours)
                if (window.indexedDBCache && this.products.length === 0) {
                    try {
                        const cacheData = await window.indexedDBCache.getProducts('all', Infinity);
                        if (cacheData && cacheData.products && cacheData.products.length > 0) {
                            const ageMinutes = Math.round(cacheData.cacheAge / 1000 / 60);
                            console.log(`⚠️ Erreur API, utilisation du cache (âge: ${ageMinutes}min)`);
                            this.products = [...cacheData.products];
                            this.renderProducts(cacheData.products);
                            this.loading = false;
                            return;
                        }
                    } catch (cacheError) {
                        console.warn('Erreur récupération cache:', cacheError);
                    }
                }
                throw apiError;
            }
            
            if (apiData.products && apiData.products.length > 0) {
                // Sauvegarder dans le cache
                if (window.indexedDBCache && !this.searchQuery) {
                    window.indexedDBCache.saveProducts(apiData.products, 'all', {
                        cursor: apiData.cursor,
                        hasMore: apiData.hasMore
                    }).catch(err => console.warn('Erreur sauvegarde cache:', err));
                }
                
                this.products = [...apiData.products];
                this.cursor = apiData.cursor;
                this.applyFilters();
                
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (apiData.hasMore && loadMoreBtn) {
                    loadMoreBtn.style.display = 'block';
                }
            } else {
                if (grid) {
                    grid.innerHTML = '<div class="loading-spinner"><p>Aucun produit trouvé</p></div>';
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            
            // Si erreur API (connexion perdue, etc.), essayer le cache même expiré
            if (window.indexedDBCache && this.products.length === 0) {
                try {
                    // Essayer avec durée étendue (1 heure)
                    let cacheData = await window.indexedDBCache.getProducts('all', 60 * 60 * 1000);
                    
                    // Si toujours rien, essayer sans limite de durée (dernier recours)
                    if (!cacheData || !cacheData.products || cacheData.products.length === 0) {
                        cacheData = await window.indexedDBCache.getProducts('all', Infinity);
                    }
                    
                    if (cacheData && cacheData.products && cacheData.products.length > 0) {
                        const ageMinutes = Math.round(cacheData.cacheAge / 1000 / 60);
                        console.log(`⚠️ Utilisation du cache en raison d'une erreur API (âge: ${ageMinutes}min)`);
                        
                        // Afficher un message informatif
                        if (grid) {
                            const infoMsg = document.createElement('div');
                            infoMsg.className = 'cache-info';
                            infoMsg.style.cssText = 'text-align: center; padding: 1rem; margin-bottom: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); color: var(--text-secondary); font-size: 0.85rem;';
                            infoMsg.innerHTML = `<i class="fas fa-wifi-slash"></i> Mode hors ligne - Données du cache (${ageMinutes}min)`;
                            grid.insertBefore(infoMsg, grid.firstChild);
                        }
                        
                        this.products = [...cacheData.products];
                        this.renderProducts(cacheData.products);
                        this.loading = false;
                        return;
                    }
                } catch (cacheError) {
                    console.error('Erreur récupération cache:', cacheError);
                }
            }
            
            let errorMessage = 'Erreur de chargement. Veuillez réessayer.';
            if (error instanceof APIError) {
                errorMessage = error.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if (grid) {
                grid.innerHTML = `
                <div class="loading-spinner" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="color: var(--accent-danger); font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">${errorMessage}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Recharger
                    </button>
                    <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                        Ouvrez la console (F12) pour plus de détails
                    </p>
                </div>
            `;
            }

            // S'assurer qu'on sort de l'état de chargement en cas d'erreur
            this.loading = false;
        }
    }

    applyFilters() {
        console.log('🔍 applyFilters - Produits totaux:', this.products.length);
        console.log('🔍 applyFilters - Catégorie:', this.currentCategory);
        console.log('🔍 applyFilters - Prix min/max:', this.priceRange.min, this.priceRange.max);
        
        this.filteredProducts = this.products.filter(product => {
            // Filtre catégorie
            if (this.currentCategory && product.category !== this.currentCategory) {
                return false;
            }
            
            // Filtre prix
            const productPrice = parseFloat(product.price) || 0;
            if (productPrice < this.priceRange.min || productPrice > this.priceRange.max) {
                return false;
            }
            
            return true;
        });

        console.log('🔍 applyFilters - Produits filtrés:', this.filteredProducts.length);
        this.sortProducts();
    }

    sortProducts() {
        const products = this.filteredProducts.length > 0 ? this.filteredProducts : this.products;
        
        console.log('📊 sortProducts - Produits à trier:', products.length);
        
        products.sort((a, b) => {
            switch (this.currentSort) {
                case 'price-asc':
                    return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
                case 'price-desc':
                    return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
                case 'rating':
                    return (b.ratingAvg || 0) - (a.ratingAvg || 0);
                case 'popular':
                    return (b.likesCount || 0) - (a.likesCount || 0);
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

        console.log('📊 sortProducts - Appel renderProducts avec', products.length, 'produits');
        this.renderProducts(products);
    }

    renderProducts(products) {
        console.log('🎨 renderProducts - Reçu', products.length, 'produits');
        const grid = document.getElementById('productsGrid');
        const carousel = document.getElementById('storeCarousel');
        const isMobile = window.innerWidth <= 768;
        
        console.log('🎨 renderProducts - Grid:', grid ? 'trouvé' : 'non trouvé');
        console.log('🎨 renderProducts - Carousel:', carousel ? 'trouvé' : 'non trouvé');
        console.log('🎨 renderProducts - isMobile:', isMobile);
        
        if (products.length === 0) {
            console.warn('⚠️ renderProducts - Aucun produit à afficher');
            if (grid) {
                grid.innerHTML = '<div class="loading-spinner"><p>Aucun produit ne correspond à vos critères</p></div>';
            }
            if (carousel) {
                carousel.innerHTML = '<div class="loading-spinner"><p>Aucun produit ne correspond à vos critères</p></div>';
            }
            return;
        }

        // Sur mobile, utiliser le carousel ET la grille 2 colonnes (grille sous le carousel)
        if (isMobile) {
            console.log('📱 renderProducts - Mode mobile');
            
            // Option 1: Utiliser le carousel si disponible
            if (carousel) {
                console.log('📱 renderProducts - Utilisation du carousel');
                // Afficher le carousel
                carousel.style.display = 'block';
                console.log('📱 renderProducts - Création du carousel avec', products.length, 'produits');
                this.renderCarouselProducts(products, carousel);
            }
            
            // Afficher aussi la grille sous le carousel sur mobile
            console.log('📱 renderProducts - Affichage de la grille mobile sous le carousel');
            if (grid) {
                // Forcer l'affichage de la grille avec !important via style inline
                grid.style.setProperty('display', 'grid', 'important');
                grid.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                grid.style.setProperty('gap', '0.75rem', 'important');
                grid.style.setProperty('margin-top', '2rem', 'important');
                grid.style.setProperty('margin-bottom', '2rem', 'important');
                grid.style.setProperty('visibility', 'visible', 'important');
                grid.style.setProperty('opacity', '1', 'important');
                grid.style.setProperty('position', 'relative', 'important');
                grid.style.setProperty('min-height', '200px', 'important');
                grid.style.setProperty('width', '100%', 'important');
                grid.style.setProperty('z-index', '1', 'important');
                
                // Supprimer le spinner si présent
                const spinner = grid.querySelector('.loading-spinner');
                if (spinner) {
                    spinner.remove();
                }
                
                // Vider la grille et recréer toutes les cartes
                grid.innerHTML = '';
                
                products.forEach((product, index) => {
                    const card = this.createProductCard(product);
                    card.classList.add('stagger-item');
                    card.style.transitionDelay = `${index * 0.1}s`;
                    grid.appendChild(card);
                });
                
                console.log(`✅ renderProducts - Grille mobile remplie avec ${products.length} produits`);
            }
            return;
        }

        // Sur desktop, afficher la grille normalement
        console.log('🖥️ renderProducts - Mode desktop, utilisation de la grille');
        if (grid) {
            grid.style.display = 'grid';
            grid.innerHTML = '';
            
            // Masquer le carousel sur desktop
            if (carousel) {
                carousel.style.display = 'none';
            }
            
            console.log('🖥️ renderProducts - Ajout de', products.length, 'cartes produits');
            products.forEach((product, index) => {
                const card = this.createProductCard(product);
                // Ajouter délai progressif pour animation en cascade
                card.style.transitionDelay = `${index * 0.1}s`;
                grid.appendChild(card);
                
                // Déclencher l'animation après un court délai
                setTimeout(() => {
                    if (window.scrollAnimations && window.scrollAnimations.observer) {
                        window.scrollAnimations.observer.observe(card);
                    } else {
                        // Fallback si l'observer n'est pas encore initialisé
                        card.classList.add('visible');
                    }
                }, 50);
            });
            console.log('✅ renderProducts - Grille desktop remplie avec', products.length, 'produits');
        } else {
            console.error('❌ renderProducts - Grille non trouvée en mode desktop');
        }
    }
    
    renderCarouselProducts(products, carouselContainer) {
        console.log('🎠 renderCarouselProducts - Reçu', products.length, 'produits');
        // Grouper les produits par 1 pour le carousel (1 produit par slide)
        const groups = [];
        for (let i = 0; i < products.length; i += 1) {
            groups.push(products.slice(i, i + 1));
        }
        
        console.log('🎠 renderCarouselProducts - Groupes créés:', groups.length);
        if (groups.length === 0) {
            console.warn('⚠️ renderCarouselProducts - Aucun groupe créé');
            return;
        }
        
        // Créer la structure du carousel si elle n'existe pas
        let wrapper = carouselContainer.querySelector('.carousel-wrapper');
        if (!wrapper) {
            console.log('🎠 renderCarouselProducts - Création de la structure du carousel');
            carouselContainer.innerHTML = `
                <button class="carousel-btn prev" aria-label="Précédent">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="carousel-wrapper"></div>
                <button class="carousel-btn next" aria-label="Suivant">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="carousel-nav"></div>
                <div class="carousel-indicator">
                    <span class="carousel-current">1</span>
                    <span>/</span>
                    <span class="carousel-total">${groups.length}</span>
                </div>
            `;
            wrapper = carouselContainer.querySelector('.carousel-wrapper');
        }
        
        if (!wrapper) {
            console.error('❌ renderCarouselProducts - Wrapper non trouvé après création');
            return;
        }
        
        wrapper.innerHTML = '';
        console.log('🎠 renderCarouselProducts - Création de', groups.length, 'slides');
        
        // Créer les slides
        groups.forEach((group, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            
            // Pour 1 produit par slide, utiliser une taille raisonnable avec aperçu adjacent
            const productsGrid = document.createElement('div');
            productsGrid.className = 'products-grid';
            productsGrid.style.gridTemplateColumns = '1fr';
            productsGrid.style.gap = '0';
            productsGrid.style.width = '100%';
            productsGrid.style.maxWidth = '100%';
            productsGrid.style.margin = '0';
            productsGrid.style.padding = '0';
            
            console.log('🎠 renderCarouselProducts - Slide', index + 1, 'avec', group.length, 'produits');
            group.forEach(product => {
                const card = this.createProductCard(product);
                productsGrid.appendChild(card);
            });
            
            slide.appendChild(productsGrid);
            wrapper.appendChild(slide);
        });
        
        console.log('✅ renderCarouselProducts -', groups.length, 'slides créés');
        
        // Créer les dots
        const nav = carouselContainer.querySelector('.carousel-nav');
        if (nav) {
            nav.innerHTML = '';
            for (let i = 0; i < groups.length; i++) {
                const dot = document.createElement('button');
                dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Aller au slide ${i + 1}`);
                nav.appendChild(dot);
            }
        }
        
        // Initialiser ou réinitialiser le carousel
        if (carouselContainer.id === 'storeCarousel') {
            console.log('🎠 renderCarouselProducts - Initialisation du carousel');
            // Attendre un peu pour que le DOM soit prêt et que les images soient chargées
            setTimeout(() => {
                // Détruire l'ancien carousel s'il existe
                if (window.storeCarousel && typeof window.storeCarousel.destroy === 'function') {
                    window.storeCarousel.destroy();
                }
                
                // S'assurer que toutes les images sont chargées
                const images = carouselContainer.querySelectorAll('img');
                let imagesLoaded = 0;
                const totalImages = images.length;
                
                console.log('🎠 renderCarouselProducts - Images trouvées:', totalImages);
                
                if (totalImages === 0) {
                    // Pas d'images, initialiser directement
                    console.log('🎠 renderCarouselProducts - Pas d\'images, initialisation directe');
                    this.initCarousel(carouselContainer);
                    return;
                }
                
                // Attendre que toutes les images soient chargées pour une animation fluide
                images.forEach(img => {
                    if (img.complete) {
                        imagesLoaded++;
                    } else {
                        img.addEventListener('load', () => {
                            imagesLoaded++;
                            if (imagesLoaded === totalImages) {
                                console.log('🎠 renderCarouselProducts - Toutes les images chargées');
                                this.initCarousel(carouselContainer);
                            }
                        });
                        img.addEventListener('error', () => {
                            imagesLoaded++;
                            if (imagesLoaded === totalImages) {
                                console.log('🎠 renderCarouselProducts - Toutes les images traitées (avec erreurs)');
                                this.initCarousel(carouselContainer);
                            }
                        });
                    }
                });
                
                // Si toutes les images sont déjà chargées
                if (imagesLoaded === totalImages) {
                    console.log('🎠 renderCarouselProducts - Images déjà chargées');
                    this.initCarousel(carouselContainer);
                } else {
                    // Timeout de sécurité
                    setTimeout(() => {
                        if (imagesLoaded < totalImages) {
                            console.log('🎠 renderCarouselProducts - Timeout, initialisation avec images partiellement chargées');
                            this.initCarousel(carouselContainer);
                        }
                    }, 3000);
                }
            }, 150);
        }
    }
    
    initCarousel(carouselContainer) {
        try {
            console.log('🎠 initCarousel - Création du carousel');
            window.storeCarousel = new ProductsCarousel('storeCarousel', {
                autoplay: true,
                autoplayInterval: 5000,
                loop: true,
                swipe: true
            });
            console.log('✅ Carousel store initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation carousel:', error);
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card stagger-item';
        card.id = `product-${product.id}`;
        
        let badges = '';
        if (product.isNew) {
            badges += '<span class="badge badge-new">Nouveau</span>';
        }
        if (product.isPromo) {
            badges += '<span class="badge badge-promo">Promo</span>';
        }
        if (product.stock < 10 && product.stock > 0) {
            badges += '<span class="badge badge-low-stock">Stock bas</span>';
        }

        const stars = this.generateStars(product.ratingAvg || 0);

        card.innerHTML = `
            <div class="product-badges">${badges}</div>
            <img src="${product.coverImageUrl || '/assets/images/placeholder.jpg'}" 
                 alt="${product.title}" 
                 class="product-image"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='/assets/images/placeholder.jpg';">
            <div class="product-info">
                <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
                <div class="product-price">${product.price} ${product.currency || 'CDF'}</div>
                <div class="product-rating">
                    ${stars}
                    <span>(${product.ratingCount || 0})</span>
                </div>
                <div class="product-stats">
                    <div class="product-stat">
                        <i class="fas fa-heart"></i>
                        <span>${product.likesCount || 0}</span>
                    </div>
                    <div class="product-stat">
                        <i class="fas fa-comment"></i>
                        <span>${product.commentsCount || 0}</span>
                    </div>
                </div>
            </div>
        `;

        // Ajouter bouton "Ajouter au panier" sur la carte
        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'btn btn-primary add-to-cart-btn';
        addToCartBtn.style.width = '100%';
        addToCartBtn.style.marginTop = '1rem';
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="add-to-cart-text"> Ajouter au panier</span><span class="add-to-cart-short"> Ajouter</span>';
        addToCartBtn.dataset.product = JSON.stringify(product);
        addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.cartManager) {
                window.cartManager.addToCart(product, 1);
            }
        });

        const productInfo = card.querySelector('.product-info');
        if (productInfo) {
            productInfo.appendChild(addToCartBtn);
        }

        card.addEventListener('click', (e) => {
            // Ne pas naviguer si on clique sur le bouton panier
            if (!e.target.closest('.add-to-cart-btn')) {
                window.location.href = `/product.html?id=${product.id}`;
            }
        });

        // Ajouter l'effet hover Netflix (zoom après 2-3 secondes)
        this.setupNetflixHoverEffect(card, product);

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    }

    setupNetflixHoverEffect(card, product) {
        let hoverTimer = null;
        const productImage = card.querySelector('.product-image');
        
        card.addEventListener('mouseenter', () => {
            // Démarrer le timer pour l'effet zoom après 2-3 secondes
            hoverTimer = setTimeout(() => {
                card.classList.add('netflix-zoom');
                
                // Si le produit a une vidéo, la lancer automatiquement
                if (product.videoUrl) {
                    this.createAutoPlayVideo(card, product);
                }
            }, 2000); // 2 secondes
        });

        card.addEventListener('mouseleave', () => {
            // Annuler le timer
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            
            // Retirer l'effet zoom
            card.classList.remove('netflix-zoom');
            
            // Arrêter la vidéo si elle est en lecture
            const videoElement = card.querySelector('.product-video-autoplay');
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }
        });

        // Pour mobile : utiliser touchstart/touchend
        card.addEventListener('touchstart', () => {
            hoverTimer = setTimeout(() => {
                card.classList.add('netflix-zoom');
                if (product.videoUrl) {
                    this.createAutoPlayVideo(card, product);
                }
            }, 2000);
        });

        card.addEventListener('touchend', () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            card.classList.remove('netflix-zoom');
            const videoElement = card.querySelector('.product-video-autoplay');
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }
        });
    }

    createAutoPlayVideo(card, product) {
        const productImageContainer = card.querySelector('.product-image').parentElement;
        const img = card.querySelector('.product-image');
        
        // Vérifier si la vidéo n'existe pas déjà
        if (card.querySelector('.product-video-autoplay')) {
            return;
        }
        
        // Créer l'élément vidéo
        const videoEl = document.createElement('video');
        videoEl.src = product.videoUrl;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.className = 'product-video-autoplay';
        videoEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 2;
        `;
        
        // S'assurer que le conteneur d'image a position relative
        if (productImageContainer) {
            productImageContainer.style.position = 'relative';
            productImageContainer.style.overflow = 'hidden';
            
            // Masquer temporairement l'image
            if (img) {
                img.style.opacity = '0';
            }
            
            productImageContainer.appendChild(videoEl);
            
            // Lancer la lecture
            videoEl.play().catch(err => {
                console.log('Auto-play bloqué:', err);
                // Si l'auto-play est bloqué, réafficher l'image
                if (img) {
                    img.style.opacity = '1';
                }
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Exporter StoreManager globalement pour qu'il soit accessible
if (typeof window !== 'undefined') {
    window.StoreManager = StoreManager;
    console.log('✅ StoreManager exporté globalement');
}

