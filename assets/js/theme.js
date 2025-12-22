// Gestion du thème Dark/Light/Auto
class ThemeManager {
    constructor() {
        this.themes = ['dark', 'light', 'auto'];
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupToggle();
        this.setupSystemPreference();
    }

    getStoredTheme() {
        // Essayer de récupérer depuis localStorage
        const stored = localStorage.getItem('theme');
        if (stored && this.themes.includes(stored)) {
            return stored;
        }
        return null;
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            html.setAttribute('data-theme', theme);
        }
        
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        const icon = document.getElementById('themeIcon');
        if (!icon) return;

        const html = document.documentElement;
        const actualTheme = html.getAttribute('data-theme');
        
        if (actualTheme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    setupToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            const currentIndex = this.themes.indexOf(this.currentTheme);
            const nextIndex = (currentIndex + 1) % this.themes.length;
            this.applyTheme(this.themes[nextIndex]);
        });
    }

    setupSystemPreference() {
        // Écouter les changements de préférence système
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === 'auto') {
                this.applyTheme('auto');
            }
        });
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialiser le gestionnaire de thème
const themeManager = new ThemeManager();

