/**
 * Bottom Navigation Bar - Style Instagram
 * Menu de navigation en bas qui apparaît au scroll
 */

class BottomNav {
    constructor() {
        this.bottomNav = document.getElementById('bottomNav');
        this.navbar = document.querySelector('.navbar');
        this.lastScrollY = 0;
        this.scrollThreshold = 100; // Pixels à scroller avant d'afficher/masquer
        this.isScrolling = false;
        
        if (this.bottomNav) {
            this.init();
        }
    }
    
    init() {
        // Vérifier si on est sur mobile
        if (window.innerWidth > 768) {
            return; // Ne pas initialiser sur desktop
        }
        
        // Ajouter la classe au body
        document.body.classList.add('has-bottom-nav');
        
        // Écouter le scroll
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        
        // Mettre à jour le badge du panier
        this.updateCartBadge();
        
        // Observer les changements du badge du panier
        this.observeCartBadge();
        
        // Mettre à jour l'item actif
        this.updateActiveItem();
    }
    
    handleScroll() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
            
            // Afficher/masquer le menu du haut
            if (this.navbar) {
                if (currentScrollY > this.scrollThreshold && scrollDirection === 'down') {
                    this.navbar.classList.add('scrolled');
                } else if (scrollDirection === 'up' || currentScrollY < this.scrollThreshold) {
                    this.navbar.classList.remove('scrolled');
                }
            }
            
            // Afficher/masquer le menu du bas
            if (this.bottomNav) {
                if (currentScrollY > this.scrollThreshold && scrollDirection === 'down') {
                    this.bottomNav.classList.add('visible');
                } else if (scrollDirection === 'up' || currentScrollY < this.scrollThreshold) {
                    this.bottomNav.classList.remove('visible');
                }
            }
            
            this.lastScrollY = currentScrollY;
            this.isScrolling = false;
        });
    }
    
    updateCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        const bottomNavBadge = this.bottomNav?.querySelector('.nav-badge');
        const bottomNavCart = document.getElementById('bottomNavCart');
        
        if (!cartBadge || !bottomNavBadge) return;
        
        const count = parseInt(cartBadge.textContent) || 0;
        const isVisible = cartBadge.style.display !== 'none' && count > 0;
        
        bottomNavBadge.textContent = count > 99 ? '99+' : count;
        if (isVisible) {
            bottomNavBadge.classList.add('show');
        } else {
            bottomNavBadge.classList.remove('show');
        }
        
        // Ajouter l'événement de clic sur le panier du bottom nav
        if (bottomNavCart) {
            bottomNavCart.addEventListener('click', (e) => {
                e.preventDefault();
                const cartToggle = document.getElementById('cartToggle');
                if (cartToggle) {
                    cartToggle.click();
                }
            });
        }
    }
    
    observeCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        if (!cartBadge) return;
        
        const observer = new MutationObserver(() => {
            this.updateCartBadge();
        });
        
        observer.observe(cartBadge, {
            attributes: true,
            childList: true,
            characterData: true
        });
    }
    
    updateActiveItem() {
        const currentPath = window.location.pathname;
        const navItems = this.bottomNav?.querySelectorAll('.bottom-nav-item');
        
        if (!navItems) return;
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            item.classList.remove('active');
            
            if (href === currentPath || 
                (currentPath === '/' && href === '/') ||
                (currentPath.includes('store') && href?.includes('store')) ||
                (currentPath.includes('profile') && href?.includes('profile')) ||
                (currentPath.includes('contact') && href?.includes('contact'))) {
                item.classList.add('active');
            }
        });
    }
}

// Initialiser le bottom nav
document.addEventListener('DOMContentLoaded', () => {
    window.bottomNav = new BottomNav();
    
    // Réinitialiser au resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.bottomNav) {
                window.bottomNav.updateActiveItem();
                window.bottomNav.updateCartBadge();
            }
        }, 250);
    });
});

