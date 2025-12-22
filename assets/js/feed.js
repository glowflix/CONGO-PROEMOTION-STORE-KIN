// Gestion du feed d'accueil
class FeedManager {
    constructor() {
        this.products = [];
        this.currentFilter = 'all';
        this.cursor = null;
        this.loading = false;
        this.init();
    }

    init() {
        this.setupFilters();
        this.loadProducts();
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.products = [];
                this.cursor = null;
                this.loadProducts();
            });
        });
    }

    async loadProducts(useCache = true) {
        if (this.loading) return;
        
        this.loading = true;
        const grid = document.getElementById('productsGrid');
        
        try {
            // Essayer de charger depuis le cache d'abord
            let data = null;
            let fromCache = false;
            let hasCache = false;
            
            if (useCache && window.indexedDBCache) {
                try {
                    // TOUJOURS utiliser le cache s'il existe, même très ancien
                    let cacheData = await window.indexedDBCache.getProducts(this.currentFilter, Infinity);
                    
                    if (cacheData && cacheData.products && cacheData.products.length > 0) {
                        data = {
                            products: cacheData.products,
                            cursor: null,
                            hasMore: false
                        };
                        fromCache = true;
                        hasCache = true;
                        const ageMinutes = Math.round(cacheData.cacheAge / 1000 / 60);
                        console.log(`⚡ Produits chargés depuis le cache (${cacheData.products.length} produits, âge: ${ageMinutes}min)`);
                        
                        // Afficher immédiatement les produits du cache
                        this.products = [...cacheData.products];
                        this.renderProducts();
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
                        const apiData = await ProductsAPI.getProducts(20, this.cursor, this.currentFilter);
                        
                        if (apiData.products && apiData.products.length > 0) {
                            // Sauvegarder dans le cache
                            if (window.indexedDBCache) {
                                window.indexedDBCache.saveProducts(apiData.products, this.currentFilter, {
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
                                this.renderProducts();
                            }
                            
                            // Afficher le bouton "Charger plus" s'il y a plus de produits
                            const loadMoreBtn = document.getElementById('loadMoreBtn');
                            if (apiData.hasMore && loadMoreBtn) {
                                loadMoreBtn.style.display = 'block';
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
                apiData = await ProductsAPI.getProducts(20, this.cursor, this.currentFilter);
            } catch (apiError) {
                this.loading = false;
                // Si erreur API, essayer quand même le cache même très ancien (dernier recours)
                if (window.indexedDBCache && this.products.length === 0) {
                    try {
                        const cacheData = await window.indexedDBCache.getProducts(this.currentFilter, Infinity);
                        if (cacheData && cacheData.products && cacheData.products.length > 0) {
                            const ageMinutes = Math.round(cacheData.cacheAge / 1000 / 60);
                            console.log(`⚠️ Erreur API, utilisation du cache (âge: ${ageMinutes}min)`);
                            this.products = [...cacheData.products];
                            this.renderProducts();
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
                if (window.indexedDBCache) {
                    window.indexedDBCache.saveProducts(apiData.products, this.currentFilter, {
                        cursor: apiData.cursor,
                        hasMore: apiData.hasMore
                    }).catch(err => console.warn('Erreur sauvegarde cache:', err));
                }
                
                this.products = [...apiData.products];
                this.cursor = apiData.cursor;
                this.renderProducts();
                
                // Afficher le bouton "Charger plus" s'il y a plus de produits
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (apiData.hasMore && loadMoreBtn) {
                    loadMoreBtn.style.display = 'block';
                }
            } else {
                grid.innerHTML = '<div class="loading-spinner"><p>Aucun produit trouvé</p></div>';
            }
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            
            // Si erreur API, essayer le cache même très ancien (dernier recours)
            // Cette partie est déjà gérée dans le catch de l'appel API ci-dessus
            const isOffline = error.data?.isOffline || 
                             error.message.includes('Pas de connexion') ||
                             error.message.includes('Failed to fetch') ||
                             !navigator.onLine;
            
            // Message d'erreur détaillé
            let errorMessage = isOffline ? 'Pas de connexion internet' : 'Erreur de chargement. Veuillez réessayer.';
            let errorDetails = '';
            
            if (error instanceof APIError) {
                errorMessage = error.message || errorMessage;
                if (error.status === 404) {
                    errorMessage = 'Route API non trouvée. Vérifiez la configuration.';
                } else if (error.status === 500) {
                    errorMessage = 'Erreur serveur. Vérifiez les logs Apps Script.';
                } else if (error.status === 408) {
                    errorMessage = 'Timeout. La requête a pris trop de temps.';
                }
                errorDetails = error.data ? JSON.stringify(error.data, null, 2) : '';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if (grid) {
                grid.innerHTML = `
                    <div class="loading-spinner" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="color: var(--accent-danger); font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${errorMessage}</p>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
                            ${isOffline ? 'Vérifiez votre connexion internet.' : (errorDetails || 'Vérifiez la console (F12) pour plus d\'informations')}
                        </p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Recharger la page
                        </button>
                        ${!isOffline ? `<div style="margin-top: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); text-align: left; font-size: 0.85rem; color: var(--text-muted);">
                            <strong>Débogage:</strong><br>
                            - Ouvrez la console (F12) pour voir les détails<br>
                            - Vérifiez que l'API Apps Script est déployée<br>
                            - Testez l'URL directement dans le navigateur
                        </div>` : ''}
                    </div>
                `;
            }
        } finally {
            this.loading = false;
        }
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const carousel = document.getElementById('productsCarousel');
        const isMobile = window.innerWidth <= 768;
        
        console.log('🎨 FeedManager renderProducts - Reçu', this.products.length, 'produits');
        console.log('🎨 FeedManager renderProducts - isMobile:', isMobile);
        console.log('🎨 FeedManager renderProducts - Grid:', grid ? 'trouvé' : 'non trouvé');
        console.log('🎨 FeedManager renderProducts - Carousel:', carousel ? 'trouvé' : 'non trouvé');
        
        if (this.products.length === 0) {
            if (grid) {
                grid.innerHTML = '<div class="loading-spinner"><p>Aucun produit trouvé</p></div>';
            }
            if (carousel) {
                carousel.innerHTML = '<div class="loading-spinner"><p>Aucun produit trouvé</p></div>';
            }
            return;
        }

        // Sur mobile, utiliser le carousel ET la grille 2 colonnes (grille sous le carousel)
        if (isMobile) {
            console.log('📱 FeedManager renderProducts - Mode mobile');
            
            // Option 1: Utiliser le carousel si disponible
            if (carousel) {
                console.log('📱 FeedManager renderProducts - Utilisation du carousel');
                // Afficher le carousel
                carousel.style.display = 'block';
                console.log('📱 FeedManager renderProducts - Création du carousel avec', this.products.length, 'produits');
                this.renderCarouselProducts(this.products, carousel);
            }
            
            // Afficher aussi la grille sous le carousel sur mobile
            console.log('📱 FeedManager renderProducts - Affichage de la grille mobile sous le carousel');
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
                grid.style.setProperty('padding', '0', 'important');
                
                console.log('📱 FeedManager renderProducts - Styles de grille appliqués:', {
                    display: grid.style.display,
                    gridTemplateColumns: grid.style.gridTemplateColumns,
                    visibility: grid.style.visibility
                });
                
                // Supprimer le spinner si présent
                const spinner = grid.querySelector('.loading-spinner');
                if (spinner) {
                    spinner.remove();
                }
                
                // Vider la grille et recréer toutes les cartes
                grid.innerHTML = '';
                
                this.products.forEach((product, index) => {
                    const card = this.createProductCard(product);
                    card.classList.add('stagger-item');
                    card.style.transitionDelay = `${index * 0.1}s`;
                    grid.appendChild(card);
                });
                
                console.log(`✅ FeedManager renderProducts - Grille mobile remplie avec ${this.products.length} produits`);
                
                // Forcer un scroll vers la grille si elle n'est pas visible
                setTimeout(() => {
                    const rect = grid.getBoundingClientRect();
                    if (rect.top > window.innerHeight || rect.bottom < 0) {
                        console.log('📍 FeedManager renderProducts - Grille hors écran, scroll vers elle');
                        grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 500);
                
                // Vérification finale approfondie
                setTimeout(() => {
                    const computedStyle = window.getComputedStyle(grid);
                    const rect = grid.getBoundingClientRect();
                    console.log('📊 FeedManager renderProducts - Vérification finale grille:', {
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        opacity: computedStyle.opacity,
                        gridTemplateColumns: computedStyle.gridTemplateColumns,
                        childCount: grid.children.length,
                        height: computedStyle.height,
                        minHeight: computedStyle.minHeight,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex,
                        boundingRect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            bottom: rect.bottom
                        },
                        isVisible: rect.height > 0 && rect.width > 0 && computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0'
                    });
                    
                    // Vérifier chaque carte
                    const cards = grid.querySelectorAll('.product-card');
                    console.log(`📊 FeedManager renderProducts - ${cards.length} cartes dans la grille`);
                    cards.forEach((card, index) => {
                        const cardRect = card.getBoundingClientRect();
                        const cardStyle = window.getComputedStyle(card);
                        console.log(`  📦 Carte ${index + 1}:`, {
                            display: cardStyle.display,
                            visibility: cardStyle.visibility,
                            opacity: cardStyle.opacity,
                            height: cardRect.height,
                            width: cardRect.width,
                            isVisible: cardRect.height > 0 && cardRect.width > 0
                        });
                    });
                }, 300);
            } else {
                console.warn('⚠️ FeedManager renderProducts - Grille non trouvée sur mobile!');
            }
            return;
        }

        // Sur desktop, afficher la grille normalement
        console.log('🖥️ FeedManager renderProducts - Mode desktop, utilisation de la grille');
        
        // Masquer le carousel sur desktop
        if (carousel) {
            carousel.style.display = 'none';
        }
        
        if (grid) {
            grid.style.display = 'grid';
            
            // Supprimer le spinner si présent
            const spinner = grid.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
            
            // Rendre les nouveaux produits avec animations
            const newProducts = this.products.filter(p => !document.getElementById(`product-${p.id}`));
            console.log('🖥️ FeedManager renderProducts - Nouveaux produits à ajouter:', newProducts.length);
            
            newProducts.forEach((product, index) => {
                const card = this.createProductCard(product);
                // Ajouter classe d'animation avec délai progressif
                card.classList.add('stagger-item');
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
            
            // Si aucun nouveau produit, reconstruire toute la grille
            if (newProducts.length === 0 && this.products.length > 0) {
                grid.innerHTML = '';
                this.products.forEach((product, index) => {
                    const card = this.createProductCard(product);
                    card.classList.add('stagger-item');
                    card.style.transitionDelay = `${index * 0.1}s`;
                    grid.appendChild(card);
                    
                    setTimeout(() => {
                        if (window.scrollAnimations && window.scrollAnimations.observer) {
                            window.scrollAnimations.observer.observe(card);
                        } else {
                            card.classList.add('visible');
                        }
                    }, 50);
                });
            }
            
            console.log('✅ FeedManager renderProducts - Grille desktop remplie');
        } else {
            console.error('❌ FeedManager renderProducts - Grille non trouvée en mode desktop');
        }
    }
    
    renderCarouselProducts(products, carouselContainer) {
        console.log('🎠 FeedManager renderCarouselProducts - Reçu', products.length, 'produits');
        // Grouper les produits par 1 pour le carousel (1 produit par slide)
        const groups = [];
        for (let i = 0; i < products.length; i += 1) {
            groups.push(products.slice(i, i + 1));
        }
        
        console.log('🎠 FeedManager renderCarouselProducts - Groupes créés:', groups.length);
        if (groups.length === 0) {
            console.warn('⚠️ FeedManager renderCarouselProducts - Aucun groupe créé');
            return;
        }
        
        // Créer la structure du carousel si elle n'existe pas
        let wrapper = carouselContainer.querySelector('.carousel-wrapper');
        if (!wrapper) {
            console.log('🎠 FeedManager renderCarouselProducts - Création de la structure du carousel');
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
            console.error('❌ FeedManager renderCarouselProducts - Wrapper non trouvé après création');
            return;
        }
        
        wrapper.innerHTML = '';
        console.log('🎠 FeedManager renderCarouselProducts - Création de', groups.length, 'slides');
        
        // Créer les slides
        groups.forEach((group, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            // Forcer la visibilité du slide
            slide.style.display = 'flex';
            slide.style.visibility = 'visible';
            slide.style.opacity = index === 0 ? '1' : '0.7';
            slide.style.minWidth = '100%';
            slide.style.position = 'relative';
            
            // Pour 1 produit par slide, utiliser toute la largeur
            const productsGrid = document.createElement('div');
            productsGrid.className = 'products-grid';
            productsGrid.style.gridTemplateColumns = '1fr';
            productsGrid.style.gap = '0';
            productsGrid.style.width = '100%';
            productsGrid.style.maxWidth = '100%';
            productsGrid.style.margin = '0';
            productsGrid.style.padding = '0';
            productsGrid.style.display = 'grid';
            productsGrid.style.visibility = 'visible';
            
            console.log(`🎠 FeedManager renderCarouselProducts - Slide ${index + 1}/${groups.length} avec ${group.length} produits`);
            group.forEach((product, productIndex) => {
                const card = this.createProductCard(product);
                // Forcer la visibilité de la carte
                card.style.display = 'block';
                card.style.visibility = 'visible';
                card.style.opacity = '1';
                productsGrid.appendChild(card);
                console.log(`  ✅ Produit ${productIndex + 1}: ${product.title.substring(0, 30)}...`);
            });
            
            slide.appendChild(productsGrid);
            wrapper.appendChild(slide);
            console.log(`✅ FeedManager renderCarouselProducts - Slide ${index + 1} ajouté au wrapper (${wrapper.children.length} slides au total)`);
        });
        
        console.log(`✅ FeedManager renderCarouselProducts - ${groups.length} slides créés et ajoutés au DOM`);
        console.log(`📊 FeedManager renderCarouselProducts - Vérification: ${wrapper.children.length} éléments dans le wrapper`);
        
        // Vérifier que les slides sont bien dans le DOM
        const slidesInDOM = wrapper.querySelectorAll('.carousel-item');
        console.log(`📊 FeedManager renderCarouselProducts - ${slidesInDOM.length} slides trouvés dans le DOM après création`);
        
        if (slidesInDOM.length !== groups.length) {
            console.error(`❌ FeedManager renderCarouselProducts - Incohérence: ${groups.length} slides créés mais ${slidesInDOM.length} trouvés dans le DOM!`);
        }
        
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
            console.log(`✅ FeedManager renderCarouselProducts - ${groups.length} dots de navigation créés`);
        }
        
        // Initialiser ou réinitialiser le carousel
        if (carouselContainer.id === 'productsCarousel') {
            console.log('🎠 FeedManager renderCarouselProducts - Initialisation du carousel');
            
            // Détruire l'ancien carousel s'il existe
            if (window.homeCarousel && typeof window.homeCarousel.destroy === 'function') {
                window.homeCarousel.destroy();
            }
            
            // Attendre que les images soient chargées pour une meilleure animation
            setTimeout(() => {
                const images = carouselContainer.querySelectorAll('img');
                let imagesLoaded = 0;
                const totalImages = images.length;
                
                console.log('🎠 FeedManager renderCarouselProducts - Images trouvées:', totalImages);
                
                if (totalImages === 0) {
                    console.log('🎠 FeedManager renderCarouselProducts - Pas d\'images, initialisation directe');
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
                                console.log('🎠 FeedManager renderCarouselProducts - Toutes les images chargées');
                                this.initCarousel(carouselContainer);
                            }
                        });
                        img.addEventListener('error', () => {
                            imagesLoaded++;
                            if (imagesLoaded === totalImages) {
                                console.log('🎠 FeedManager renderCarouselProducts - Toutes les images traitées (avec erreurs)');
                                this.initCarousel(carouselContainer);
                            }
                        });
                    }
                });
                
                if (imagesLoaded === totalImages) {
                    console.log('🎠 FeedManager renderCarouselProducts - Images déjà chargées');
                    this.initCarousel(carouselContainer);
                } else {
                    // Timeout de sécurité
                    setTimeout(() => {
                        if (imagesLoaded < totalImages) {
                            console.log('🎠 FeedManager renderCarouselProducts - Timeout, initialisation avec images partiellement chargées');
                            this.initCarousel(carouselContainer);
                        }
                    }, 3000);
                }
            }, 150);
        }
    }
    
    initCarousel(carouselContainer) {
        try {
            console.log('🎠 FeedManager initCarousel - Début de l\'initialisation');
            
            // Détruire l'ancien carousel s'il existe
            if (window.homeCarousel && typeof window.homeCarousel.destroy === 'function') {
                console.log('🎠 FeedManager initCarousel - Destruction de l\'ancien carousel');
                window.homeCarousel.destroy();
                window.homeCarousel = null;
            }
            
            // Vérifier que les slides existent avant d'initialiser
            const wrapper = carouselContainer.querySelector('.carousel-wrapper');
            if (!wrapper) {
                console.error('❌ FeedManager initCarousel - Wrapper non trouvé!');
                return;
            }
            
            const slides = wrapper.querySelectorAll('.carousel-item');
            console.log(`📊 FeedManager initCarousel - ${slides.length} slides trouvés dans le wrapper`);
            
            if (slides.length === 0) {
                console.warn('⚠️ FeedManager initCarousel - Aucun slide trouvé, attente 300ms...');
                // Attendre un peu plus et réessayer
                setTimeout(() => {
                    const slidesRetry = carouselContainer.querySelector('.carousel-wrapper')?.querySelectorAll('.carousel-item');
                    console.log(`📊 FeedManager initCarousel - Retry: ${slidesRetry?.length || 0} slides trouvés`);
                    if (slidesRetry && slidesRetry.length > 0) {
                        this.initCarousel(carouselContainer);
                    } else {
                        console.error('❌ FeedManager initCarousel - Aucun slide après attente, abandon');
                    }
                }, 300);
                return;
            }
            
            // Vérifier que les slides contiennent bien des produits
            let totalProducts = 0;
            slides.forEach((slide, index) => {
                const products = slide.querySelectorAll('.product-card');
                totalProducts += products.length;
                console.log(`📊 FeedManager initCarousel - Slide ${index + 1}: ${products.length} produits`);
            });
            console.log(`📊 FeedManager initCarousel - Total: ${totalProducts} produits dans ${slides.length} slides`);
            
            console.log('🎠 FeedManager initCarousel - Création de l\'instance ProductsCarousel');
            
            window.homeCarousel = new ProductsCarousel('productsCarousel', {
                autoplay: true,
                autoplayInterval: 5000,
                loop: true,
                swipe: true
            });
            
            console.log('✅ FeedManager initCarousel - Carousel accueil initialisé avec succès');
            
            // Vérification finale après initialisation
            setTimeout(() => {
                const finalSlides = carouselContainer.querySelector('.carousel-wrapper')?.querySelectorAll('.carousel-item');
                console.log(`📊 FeedManager initCarousel - Vérification finale: ${finalSlides?.length || 0} slides toujours présents`);
                if (finalSlides && finalSlides.length > 0) {
                    finalSlides.forEach((slide, index) => {
                        const products = slide.querySelectorAll('.product-card');
                        console.log(`  📊 Slide ${index + 1}: ${products.length} produits, visible: ${slide.style.display !== 'none'}`);
                    });
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ FeedManager initCarousel - Erreur:', error);
            console.error('❌ Stack trace:', error.stack);
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card stagger-item';
        card.id = `product-${product.id}`;
        
        // Badges
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

        // Rating stars
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

        // Ajouter l'événement de clic
        card.addEventListener('click', () => {
            window.location.href = `/product.html?id=${product.id}`;
        });

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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le feed
document.addEventListener('DOMContentLoaded', () => {
    const feedManager = new FeedManager();
    
    // Bouton "Charger plus"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            feedManager.loadProducts();
        });
    }
    
    // Gérer le redimensionnement de la fenêtre pour réafficher correctement
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Réafficher les produits avec la bonne vue (mobile/desktop)
            if (feedManager.products.length > 0) {
                feedManager.renderProducts();
            }
        }, 250);
    });
});

