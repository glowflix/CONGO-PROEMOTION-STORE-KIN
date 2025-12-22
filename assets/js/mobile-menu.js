/**
 * Menu Mobile - Style Instagram
 * Gestion du menu hamburger avec overlay slide depuis le bas
 */

class MobileMenu {
    constructor() {
        this.menuToggle = document.getElementById('mobileMenuToggle');
        this.menu = document.getElementById('mobileMenu');
        this.overlay = document.getElementById('mobileMenuOverlay');
        this.menuIcon = document.getElementById('menuIcon');
        this.body = document.body;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.menuToggle || !this.menu || !this.overlay) {
            return; // Pas sur mobile ou éléments manquants
        }
        
        // Événements
        this.menuToggle.addEventListener('click', () => this.toggle());
        this.overlay.addEventListener('click', () => this.close());
        
        // Fermer en cliquant sur un lien
        const menuItems = this.menu.querySelectorAll('.mobile-menu-item[href]');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Petit délai pour voir l'animation
                setTimeout(() => this.close(), 200);
            });
        });
        
        // Gestion du drag (comme Instagram)
        this.setupDrag();
        
        // Mettre à jour l'état actif selon la page
        this.updateActiveItem();
        
        // Synchroniser le badge du panier
        this.syncCartBadge();
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.menu.classList.add('active');
        this.overlay.classList.add('active');
        this.body.classList.add('menu-open');
        
        // Changer l'icône
        if (this.menuIcon) {
            this.menuIcon.classList.remove('fa-bars');
            this.menuIcon.classList.add('fa-times');
        }
        
        // Empêcher le scroll
        document.documentElement.style.overflow = 'hidden';
    }
    
    close() {
        this.isOpen = false;
        this.menu.classList.remove('active');
        this.menu.classList.add('closing');
        this.overlay.classList.remove('active');
        this.body.classList.remove('menu-open');
        
        // Changer l'icône
        if (this.menuIcon) {
            this.menuIcon.classList.remove('fa-times');
            this.menuIcon.classList.add('fa-bars');
        }
        
        // Réactiver le scroll
        document.documentElement.style.overflow = '';
        
        // Retirer la classe closing après l'animation
        setTimeout(() => {
            this.menu.classList.remove('closing');
        }, 300);
    }
    
    setupDrag() {
        const handle = this.menu.querySelector('.mobile-menu-handle');
        if (!handle) return;
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        handle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            this.menu.style.transition = 'none';
        }, { passive: true });
        
        handle.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            if (diff > 0) {
                this.menu.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: true });
        
        handle.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            this.menu.style.transition = '';
            
            const diff = currentY - startY;
            
            // Si on a glissé de plus de 100px, fermer
            if (diff > 100) {
                this.close();
            } else {
                // Sinon, revenir à la position initiale
                this.menu.style.transform = '';
            }
        }, { passive: true });
    }
    
    updateActiveItem() {
        const currentPath = window.location.pathname;
        const menuItems = this.menu.querySelectorAll('.mobile-menu-item[data-page]');
        
        menuItems.forEach(item => {
            const page = item.getAttribute('data-page');
            item.classList.remove('active');
            
            if (currentPath === '/' && page === 'home') {
                item.classList.add('active');
            } else if (currentPath.includes(page)) {
                item.classList.add('active');
            }
        });
    }
    
    syncCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        const mobileCartBadge = document.getElementById('mobileCartBadge');
        
        if (!cartBadge || !mobileCartBadge) return;
        
        // Observer les changements du badge
        const observer = new MutationObserver(() => {
            const count = cartBadge.textContent || '0';
            const isVisible = cartBadge.style.display !== 'none';
            
            mobileCartBadge.textContent = count;
            if (isVisible && parseInt(count) > 0) {
                mobileCartBadge.classList.add('show');
            } else {
                mobileCartBadge.classList.remove('show');
            }
        });
        
        observer.observe(cartBadge, {
            attributes: true,
            childList: true,
            characterData: true
        });
        
        // Synchronisation initiale
        const count = cartBadge.textContent || '0';
        const isVisible = cartBadge.style.display !== 'none';
        mobileCartBadge.textContent = count;
        if (isVisible && parseInt(count) > 0) {
            mobileCartBadge.classList.add('show');
        }
    }
}

// Initialiser le menu mobile
document.addEventListener('DOMContentLoaded', () => {
    window.mobileMenu = new MobileMenu();
    
    // Synchroniser le toggle du thème
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const mobileThemeIcon = document.getElementById('mobileThemeIcon');
    const themeIcon = document.getElementById('themeIcon');
    
    if (mobileThemeToggle && themeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            themeToggle.click();
        });
        
        // Synchroniser les icônes
        if (themeIcon && mobileThemeIcon) {
            const syncIcons = () => {
                const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
                mobileThemeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            };
            
            // Observer les changements de thème
            const observer = new MutationObserver(syncIcons);
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
            
            syncIcons();
        }
    }
    
    // Synchroniser le toggle du panier
    const cartToggle = document.getElementById('cartToggle');
    const mobileCartToggle = document.getElementById('mobileCartToggle');
    
    if (mobileCartToggle && cartToggle) {
        mobileCartToggle.addEventListener('click', () => {
            cartToggle.click();
            if (window.mobileMenu) {
                window.mobileMenu.close();
            }
        });
    }
});

// Fermer le menu au resize si on passe en desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && window.mobileMenu && window.mobileMenu.isOpen) {
        window.mobileMenu.close();
    }
});

