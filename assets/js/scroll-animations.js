/**
 * Scroll Animations - Animations professionnelles au scroll
 * Gère les animations d'apparition au scroll avec Intersection Observer
 */

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // Déclenche un peu avant que l'élément soit visible
            threshold: 0.1 // Déclenche quand 10% de l'élément est visible
        };
        
        this.observer = null;
        this.init();
    }
    
    init() {
        // Vérifier si Intersection Observer est supporté
        if (!('IntersectionObserver' in window)) {
            // Fallback : afficher tous les éléments immédiatement
            this.fallback();
            return;
        }
        
        // Créer l'observer
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.observerOptions
        );
        
        // Observer tous les éléments avec des classes d'animation
        this.observeElements();
        
        // Gérer le scroll de la navbar
        this.handleNavbarScroll();
        
        // Gérer les animations de parallaxe
        this.handleParallax();
    }
    
    observeElements() {
        const animatedElements = document.querySelectorAll(
            '.fade-in, .slide-left, .slide-right, .scale-in, .rotate-in, ' +
            '.product-card, .section-animate, .image-fade, .cascade-item, .stagger-item'
        );
        
        animatedElements.forEach((element, index) => {
            // Ajouter un délai progressif pour les éléments en cascade
            if (element.classList.contains('cascade-item') || 
                element.classList.contains('stagger-item')) {
                element.style.transitionDelay = `${index * 0.1}s`;
            }
            
            this.observer.observe(element);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Ne plus observer cet élément une fois qu'il est visible
                // (optionnel : commentez cette ligne si vous voulez réanimer au scroll)
                // this.observer.unobserve(entry.target);
            }
        });
    }
    
    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let lastScroll = 0;
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            if (currentScroll > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
            
            // Animation hide/show navbar au scroll (optionnel)
            if (currentScroll > lastScroll && currentScroll > 200) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }, { passive: true });
    }
    
    handleParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-slow');
        
        if (parallaxElements.length === 0) return;
        
        let ticking = false;
        
        const updateParallax = () => {
            const scrollY = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + scrollY;
                const elementHeight = rect.height;
                const windowHeight = window.innerHeight;
                
                // Calculer la position relative
                const scrolled = scrollY + windowHeight;
                const elementBottom = elementTop + elementHeight;
                
                if (scrolled > elementTop && scrollY < elementBottom) {
                    const progress = (scrolled - elementTop) / (windowHeight + elementHeight);
                    const parallaxValue = (progress - 0.5) * 30; // Ajustez la valeur pour plus/moins de parallaxe
                    element.style.transform = `translateY(${parallaxValue}px)`;
                }
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }
    
    // Fallback pour les navigateurs sans Intersection Observer
    fallback() {
        const animatedElements = document.querySelectorAll(
            '.fade-in, .slide-left, .slide-right, .scale-in, .rotate-in, ' +
            '.product-card, .section-animate, .image-fade, .cascade-item, .stagger-item'
        );
        
        animatedElements.forEach(element => {
            element.classList.add('visible');
        });
    }
    
    // Méthode pour réinitialiser les animations (utile après chargement dynamique)
    refresh() {
        if (this.observer) {
            this.observer.disconnect();
            this.observeElements();
        }
    }
}

// Initialiser les animations au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.scrollAnimations = new ScrollAnimations();
});

// Réinitialiser après chargement dynamique de contenu
// (Désactivé car cela interfère avec le cache - les animations se réinitialisent automatiquement)

