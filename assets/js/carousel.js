/**
 * Carousel Professionnel - Android
 * Gestion du carousel avec animations fluides et swipe
 */

class ProductsCarousel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.options = {
            autoplay: options.autoplay !== false,
            autoplayInterval: options.autoplayInterval || 5000,
            loop: options.loop !== false,
            swipe: options.swipe !== false,
            ...options
        };
        
        this.currentIndex = 0;
        this.items = [];
        this.isSliding = false;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        // Vérifier si la structure existe déjà (créée par renderCarouselProducts)
        const existingWrapper = this.container.querySelector('.carousel-wrapper');
        if (existingWrapper) {
            console.log('🎠 ProductsCarousel - Structure existante détectée, utilisation de celle-ci');
            this.attachToExistingStructure();
        } else {
            // Créer la structure du carousel
            this.createStructure();
        }
        
        // Charger les produits seulement si la structure a été créée (pas si elle existait déjà)
        if (!existingWrapper) {
            this.loadProducts();
        }
        
        // Initialiser les événements
        this.setupEvents();
        
        // Mettre à jour l'affichage avec les slides existants (seulement si on a des items)
        if (this.items && this.items.length > 0) {
            this.updateDisplay();
        } else {
            // Si pas d'items, essayer de les trouver dans le DOM
            const itemsInDOM = this.wrapper ? this.wrapper.querySelectorAll('.carousel-item') : [];
            if (itemsInDOM.length > 0) {
                this.items = Array.from(itemsInDOM);
                this.updateDisplay();
            } else {
                console.warn('⚠️ ProductsCarousel init - Aucun item trouvé, updateDisplay ignoré');
            }
        }
        
        // Démarrer l'autoplay si activé et qu'on a des items
        if (this.options.autoplay && this.items && this.items.length > 0) {
            this.startAutoplay();
        }
    }
    
    attachToExistingStructure() {
        // Attacher aux éléments existants
        this.wrapper = this.container.querySelector('.carousel-wrapper');
        if (!this.wrapper) {
            console.error('❌ ProductsCarousel - Wrapper non trouvé dans la structure existante');
            return;
        }
        
        // Utiliser les sélecteurs génériques au lieu d'ID (car il peut y avoir plusieurs carousels)
        this.nav = this.container.querySelector('.carousel-nav');
        
        const indicator = this.container.querySelector('.carousel-indicator');
        if (indicator) {
            // Chercher par classe plutôt que par position
            this.currentSpan = indicator.querySelector('.carousel-current');
            this.totalSpan = indicator.querySelector('.carousel-total');
            
            if (!this.currentSpan || !this.totalSpan) {
                // Créer les spans si ils n'existent pas
                indicator.innerHTML = '';
                this.currentSpan = document.createElement('span');
                this.currentSpan.className = 'carousel-current';
                this.currentSpan.textContent = '1';
                this.totalSpan = document.createElement('span');
                this.totalSpan.className = 'carousel-total';
                this.totalSpan.textContent = '1';
                indicator.appendChild(this.currentSpan);
                indicator.appendChild(document.createTextNode('/'));
                indicator.appendChild(this.totalSpan);
            }
        }
        
        this.prevBtn = this.container.querySelector('.carousel-btn.prev');
        this.nextBtn = this.container.querySelector('.carousel-btn.next');
        
        // Compter les slides existants
        const slides = Array.from(this.wrapper.querySelectorAll('.carousel-item'));
        
        if (slides.length === 0) {
            console.warn('⚠️ ProductsCarousel attachToExistingStructure - Aucun slide trouvé dans le wrapper');
            // Ne pas initialiser si pas de slides
            return;
        }
        
        this.items = slides; // On stocke les éléments DOM directement pour compatibilité
        
        const itemsCount = this.items.length;
        console.log(`🎠 ProductsCarousel attachToExistingStructure - ${itemsCount} slides trouvés`);
        
        if (this.totalSpan) {
            this.totalSpan.textContent = itemsCount || 1;
        }
        
        // S'assurer que le premier slide est actif
        if (this.items.length > 0) {
            // Retirer active de tous les slides
            this.items.forEach(slide => slide.classList.remove('active'));
            // Ajouter active au premier
            this.items[0].classList.add('active');
        }
        
        // Mettre à jour les dots si nécessaire
        if (this.nav) {
            const existingDots = this.nav.querySelectorAll('.carousel-dot');
            if (existingDots.length === 0 && this.items.length > 0) {
                this.createDots();
            } else if (existingDots.length !== this.items.length) {
                // Recréer les dots si le nombre ne correspond pas
                this.createDots();
            }
        }
        
        console.log(`✅ ProductsCarousel - Structure existante attachée avec ${itemsCount} slides`);
    }
    
    createStructure() {
        this.container.innerHTML = `
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
                <span class="carousel-total">1</span>
            </div>
        `;
        
        this.wrapper = this.container.querySelector('.carousel-wrapper');
        this.nav = this.container.querySelector('.carousel-nav');
        const indicator = this.container.querySelector('.carousel-indicator');
        if (indicator) {
            // Chercher par classe
            this.currentSpan = indicator.querySelector('.carousel-current');
            this.totalSpan = indicator.querySelector('.carousel-total');
            
            if (!this.currentSpan || !this.totalSpan) {
                // Créer les spans si nécessaire
                indicator.innerHTML = '';
                this.currentSpan = document.createElement('span');
                this.currentSpan.className = 'carousel-current';
                this.currentSpan.textContent = '1';
                this.totalSpan = document.createElement('span');
                this.totalSpan.className = 'carousel-total';
                this.totalSpan.textContent = '1';
                indicator.appendChild(this.currentSpan);
                indicator.appendChild(document.createTextNode('/'));
                indicator.appendChild(this.totalSpan);
            }
        }
        this.prevBtn = this.container.querySelector('.carousel-btn.prev');
        this.nextBtn = this.container.querySelector('.carousel-btn.next');
    }
    
    async loadProducts() {
        // Ne pas charger automatiquement si les produits sont déjà fournis
        // Les produits seront chargés via renderCarouselProducts dans store.js
        return;
        
        try {
            // Essayer de charger depuis le cache d'abord
            let products = null;
            let fromCache = false;
            
            if (window.indexedDBCache) {
                const cacheData = await window.indexedDBCache.getProducts('all', 20 * 60 * 1000); // 20 minutes
                if (cacheData && cacheData.products && cacheData.products.length > 0) {
                    products = cacheData.products;
                    fromCache = true;
                    console.log(`⚡ Carousel: Produits chargés depuis le cache (${products.length} produits)`);
                    this.renderProducts(products);
                }
            }
            
            // Charger depuis l'API en arrière-plan
            if (window.ProductsAPI) {
                const data = await ProductsAPI.getProducts(20, null, 'all');
                if (data.products && data.products.length > 0) {
                    // Sauvegarder dans le cache
                    if (window.indexedDBCache) {
                        window.indexedDBCache.saveProducts(data.products, 'all').catch(err => 
                            console.error('Erreur sauvegarde cache carousel:', err)
                        );
                    }
                    
                    // Mettre à jour seulement si différent du cache
                    if (!fromCache || JSON.stringify(products?.map(p => p.id)) !== JSON.stringify(data.products.map(p => p.id))) {
                        this.renderProducts(data.products);
                    }
                }
            } else {
                console.warn('ProductsAPI non disponible');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
        }
    }
    
    renderProducts(products) {
        // Grouper les produits par 2 pour le carousel
        const groups = [];
        for (let i = 0; i < products.length; i += 2) {
            groups.push(products.slice(i, i + 2));
        }
        
        this.items = groups;
        this.totalSpan.textContent = groups.length;
        
        // Créer les slides
        this.wrapper.innerHTML = '';
        groups.forEach((group, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            
            const productsGrid = document.createElement('div');
            productsGrid.className = 'products-grid';
            productsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            productsGrid.style.gap = '0.75rem';
            
            group.forEach(product => {
                const card = this.createProductCard(product);
                productsGrid.appendChild(card);
            });
            
            slide.appendChild(productsGrid);
            this.wrapper.appendChild(slide);
        });
        
        // Créer les dots de navigation
        this.createDots();
        
        // Mettre à jour l'affichage
        this.updateDisplay();
        
        // Forcer le re-render pour éviter que les images disparaissent
        setTimeout(() => {
            this.updateDisplay();
            // S'assurer que toutes les images sont visibles
            const images = this.wrapper.querySelectorAll('img');
            images.forEach(img => {
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
            });
        }, 100);
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Badges
        let badges = '';
        if (product.isNew) {
            badges += '<span class="badge badge-new">Nouveau</span>';
        }
        if (product.isPromo) {
            badges += '<span class="badge badge-promo">Promo</span>';
        }
        
        // Rating
        const stars = this.generateStars(product.ratingAvg || 0);
        
        card.innerHTML = `
            <div class="product-badges">${badges}</div>
            <img src="${product.coverImageUrl || '/assets/images/placeholder.jpg'}" 
                 alt="${product.title}" 
                 class="product-image"
                 loading="lazy"
                 onerror="this.src='/assets/images/placeholder.jpg'">
            <div class="product-info">
                <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
                <div class="product-price">${product.price} ${product.currency || 'CDF'}</div>
                <div class="product-rating">
                    ${stars}
                    <span>(${product.ratingCount || 0})</span>
                </div>
            </div>
        `;
        
        // Événement de clic
        card.addEventListener('click', () => {
            window.location.href = `/product.html?id=${product.id}`;
        });
        
        return card;
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    createDots() {
        if (!this.nav) return;
        
        this.nav.innerHTML = '';
        
        // Obtenir le nombre d'items depuis le DOM ou this.items
        const itemsCount = this.items.length > 0 
            ? this.items.length 
            : this.wrapper ? this.wrapper.querySelectorAll('.carousel-item').length : 0;
        
        if (itemsCount === 0) {
            console.warn('⚠️ ProductsCarousel createDots - Aucun item trouvé');
            return;
        }
        
        for (let i = 0; i < itemsCount; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Aller au slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            this.nav.appendChild(dot);
        }
    }
    
    setupEvents() {
        // Boutons de navigation
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Swipe gestures
        if (this.options.swipe) {
            this.setupSwipe();
        }
        
        // Pause autoplay au hover/touch
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => {
            if (this.options.autoplay) this.startAutoplay();
        });
        
        // Pause autoplay au touch
        this.container.addEventListener('touchstart', () => this.stopAutoplay());
        this.container.addEventListener('touchend', () => {
            if (this.options.autoplay) {
                setTimeout(() => this.startAutoplay(), 3000);
            }
        });
    }
    
    setupSwipe() {
        this.wrapper.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        this.wrapper.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }
    
    goToSlide(index) {
        if (this.isSliding || index === this.currentIndex) return;
        
        this.currentIndex = index;
        this.updateDisplay();
        this.resetAutoplay();
    }
    
    next() {
        if (this.isSliding) return;
        
        if (this.currentIndex < this.items.length - 1) {
            this.currentIndex++;
        } else if (this.options.loop) {
            this.currentIndex = 0;
        } else {
            return;
        }
        
        this.updateDisplay();
        this.resetAutoplay();
    }
    
    prev() {
        if (this.isSliding) return;
        
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else if (this.options.loop) {
            this.currentIndex = this.items.length - 1;
        } else {
            return;
        }
        
        this.updateDisplay();
        this.resetAutoplay();
    }
    
    updateDisplay() {
        if (!this.wrapper) {
            console.warn('⚠️ ProductsCarousel updateDisplay - Wrapper non trouvé');
            return;
        }
        
        // Obtenir les items depuis le DOM (pour supporter les deux modes : items pré-chargés ou éléments DOM)
        const items = Array.from(this.wrapper.querySelectorAll('.carousel-item'));
        console.log(`📊 ProductsCarousel updateDisplay - ${items.length} items trouvés dans le DOM, currentIndex: ${this.currentIndex}`);
        
        if (items.length === 0) {
            console.warn('⚠️ ProductsCarousel updateDisplay - Aucun item trouvé dans le wrapper');
            // Essayer de récupérer depuis this.items si disponible
            if (this.items && this.items.length > 0) {
                console.log(`📊 ProductsCarousel updateDisplay - Utilisation de this.items (${this.items.length} items)`);
            } else {
                console.error('❌ ProductsCarousel updateDisplay - Aucun item disponible');
                return;
            }
        }
        
        // Mettre à jour this.items si nécessaire (pour compatibilité)
        if (items.length > 0 && (!this.items || this.items.length !== items.length)) {
            this.items = items;
            console.log(`📊 ProductsCarousel updateDisplay - this.items mis à jour avec ${items.length} items`);
        }
        
        // Utiliser items ou this.items selon ce qui est disponible
        const itemsToUse = items.length > 0 ? items : (this.items || []);
        
        if (itemsToUse.length === 0) {
            console.error('❌ ProductsCarousel updateDisplay - Aucun item à utiliser');
            return;
        }
        
        // Vérifier que currentIndex est valide
        if (this.currentIndex >= itemsToUse.length) {
            console.warn(`⚠️ ProductsCarousel updateDisplay - currentIndex ${this.currentIndex} >= items.length ${itemsToUse.length}, réinitialisation à 0`);
            this.currentIndex = 0;
        }
        
        console.log(`🎯 ProductsCarousel updateDisplay - Affichage du slide ${this.currentIndex + 1}/${itemsToUse.length}`);
        
        this.isSliding = true;
        this.wrapper.classList.add('sliding');
        
        // Mettre à jour la position - Ajuster pour afficher partiellement les slides adjacents et centrer le slide actif
        // Détecter si on est sur mobile pour ajuster la largeur du slide
        const isMobile = window.innerWidth <= 768;
        const slideWidth = isMobile ? 90 : 85; // 90% sur mobile, 85% sur desktop
        // Pour centrer le slide actif: on doit décaler de (100% - slideWidth) / 2
        // Ensuite, chaque slide suivant décale de slideWidth (largeur du slide)
        const centerOffset = (100 - slideWidth) / 2; // Pour centrer le premier slide
        const translateX = -this.currentIndex * slideWidth + centerOffset;
        this.wrapper.style.transform = `translateX(${translateX}%)`;
        console.log(`🎯 ProductsCarousel updateDisplay - Transform: translateX(${translateX}%) pour centrer le slide ${this.currentIndex + 1} (${isMobile ? 'mobile' : 'desktop'}, slideWidth=${slideWidth}%)`);
        
        // Mettre à jour les items actifs et s'assurer qu'ils sont visibles
        itemsToUse.forEach((item, index) => {
            const isActive = index === this.currentIndex;
            item.classList.toggle('active', isActive);
            
            // Les items sont toujours dans le DOM pour permettre la transition
            // overflow:hidden du wrapper cache automatiquement les items non visibles
            item.style.display = 'flex';
            item.style.position = 'relative';
            // La visibilité et l'opacité sont gérées par le CSS via la classe .active
            
            // S'assurer que toutes les images sont visibles
            const images = item.querySelectorAll('img');
            console.log(`📸 ProductsCarousel updateDisplay - Slide ${index + 1}: ${images.length} images`);
            images.forEach((img, imgIndex) => {
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
                img.style.width = '100%';
                img.style.height = 'auto';
            });
            
            // S'assurer que les cartes produits sont visibles
            const cards = item.querySelectorAll('.product-card');
            console.log(`🃏 ProductsCarousel updateDisplay - Slide ${index + 1}: ${cards.length} cartes produits`);
            cards.forEach(card => {
                card.style.display = 'block';
                card.style.visibility = 'visible';
                card.style.opacity = '1';
            });
        });
        
        // Mettre à jour les dots
        if (this.nav) {
            const dots = this.nav.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }
        
        // Mettre à jour l'indicateur
        if (this.currentSpan) {
            this.currentSpan.textContent = this.currentIndex + 1;
        }
        if (this.totalSpan) {
            this.totalSpan.textContent = itemsToUse.length;
        }
        
        // Mettre à jour les boutons
        if (this.prevBtn && this.nextBtn) {
            if (!this.options.loop) {
                this.prevBtn.disabled = this.currentIndex === 0;
                this.nextBtn.disabled = this.currentIndex === itemsToUse.length - 1;
            } else {
                this.prevBtn.disabled = false;
                this.nextBtn.disabled = false;
            }
        }
        
        // Fin de l'animation
        setTimeout(() => {
            this.isSliding = false;
            this.wrapper.classList.remove('sliding');
            console.log(`✅ ProductsCarousel updateDisplay - Animation terminée`);
        }, 500);
    }
    
    startAutoplay() {
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.options.autoplayInterval);
    }
    
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    
    resetAutoplay() {
        if (this.options.autoplay) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }
    
    destroy() {
        this.stopAutoplay();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Ne pas initialiser automatiquement - sera fait par feed.js et store.js après le rendu des produits
// Cela évite la double initialisation et permet de s'assurer que les produits sont déjà rendus

