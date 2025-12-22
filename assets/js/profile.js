// Gestion de la page profil
class ProfileManager {
    constructor() {
        this.userId = null;
        this.init();
    }

    init() {
        // Attendre que authManager soit disponible
        if (window.authManager) {
            this.setupAuth();
        } else {
            setTimeout(() => {
                if (window.authManager) {
                    this.setupAuth();
                }
            }, 500);
        }
        
        this.setupTabs();
        this.setupSettings();
        this.checkAuthStatus();
    }

    setupAuth() {
        // Boutons de connexion/déconnexion
        const loginBtn = document.getElementById('profileLoginBtn');
        const logoutBtn = document.getElementById('profileLogoutBtn');
        const notConnectedLoginBtn = document.getElementById('notConnectedLoginBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.authManager.showAuthModal('accéder à votre profil');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    window.authManager.logout();
                    this.checkAuthStatus();
                }
            });
        }

        if (notConnectedLoginBtn) {
            notConnectedLoginBtn.addEventListener('click', () => {
                window.authManager.showAuthModal('accéder à votre profil');
            });
        }
    }

    checkAuthStatus() {
        const isAuth = window.authManager && window.authManager.isAuthenticated();
        const user = window.authManager ? window.authManager.getCurrentUser() : null;
        
        const notConnectedDiv = document.getElementById('profileNotConnected');
        const profileHeader = document.querySelector('.profile-header');
        const profileTabs = document.querySelector('.profile-tabs');
        const tabContents = document.querySelectorAll('.tab-content');

        if (isAuth && user) {
            // Utilisateur connecté
            if (notConnectedDiv) notConnectedDiv.style.display = 'none';
            if (profileHeader) profileHeader.style.display = 'flex';
            if (profileTabs) profileTabs.style.display = 'flex';
            tabContents.forEach(tab => tab.style.display = 'block');
            
            this.userId = user.id;
            this.loadUserProfile(user);
        } else {
            // Utilisateur non connecté
            if (notConnectedDiv) notConnectedDiv.style.display = 'block';
            if (profileHeader) profileHeader.style.display = 'none';
            if (profileTabs) profileTabs.style.display = 'none';
            tabContents.forEach(tab => tab.style.display = 'none');
        }
    }

    loadUserProfile(user = null) {
        if (!user && window.authManager) {
            user = window.authManager.getCurrentUser();
        }

        if (!user) {
            return;
        }

        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');

        if (userNameEl) userNameEl.textContent = user.name || user.email || 'Utilisateur';
        if (userEmailEl) userEmailEl.textContent = user.email || user.phone || 'Non renseigné';
        
        if (userAvatar) {
            const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
            userAvatar.innerHTML = initial;
            userAvatar.style.background = `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`;
        }

        // Charger les stats
        this.loadUserStats();
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.profile-tabs .tab-btn');
        const tabContents = document.querySelectorAll('.profile-page .tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => {
                    if (content.id === `${tab}Tab`) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });

                // Charger le contenu du tab
                this.loadTabContent(tab);
            });
        });
    }

    async loadUserProfile() {
        // Simuler le chargement du profil utilisateur
        // Dans une vraie app, cela viendrait de l'API
        const userName = localStorage.getItem('userName') || 'Utilisateur';
        const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');

        if (userNameEl) userNameEl.textContent = userName;
        if (userEmailEl) userEmailEl.textContent = userEmail;
        if (userAvatar) {
            const initial = userName.charAt(0).toUpperCase();
            userAvatar.innerHTML = initial;
        }

        // Charger les stats (simulé)
        // Dans une vraie app, cela viendrait de l'API
        this.loadUserStats();
    }

    async loadUserStats() {
        // Simuler les stats
        // Dans une vraie app, cela viendrait de l'API
        const likesCount = document.getElementById('likesCount');
        const commentsCount = document.getElementById('commentsCount');
        const reviewsCount = document.getElementById('reviewsCount');

        if (likesCount) likesCount.textContent = '0';
        if (commentsCount) commentsCount.textContent = '0';
        if (reviewsCount) reviewsCount.textContent = '0';
    }

    loadTabContent(tab) {
        switch (tab) {
            case 'activity':
                this.loadActivity();
                break;
            case 'likes':
                this.loadLikedProducts();
                break;
            case 'reviews':
                this.loadUserReviews();
                break;
        }
    }

    loadActivity() {
        const list = document.getElementById('activityList');
        if (!list) return;

        // Simuler l'activité
        // Dans une vraie app, cela viendrait de l'API
        list.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Commentaire ajouté</div>
                    <div class="activity-date">Il y a 2 jours</div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Avis publié</div>
                    <div class="activity-date">Il y a 5 jours</div>
                </div>
            </div>
        `;
    }

    loadLikedProducts() {
        const grid = document.getElementById('likedProducts');
        if (!grid) return;

        // Simuler les produits aimés
        // Dans une vraie app, cela viendrait de l'API
        grid.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Aucun produit aimé pour le moment</p>';
    }

    loadUserReviews() {
        const list = document.getElementById('userReviews');
        if (!list) return;

        // Simuler les avis
        // Dans une vraie app, cela viendrait de l'API
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Aucun avis pour le moment</p>';
    }

    setupSettings() {
        const themeSelect = document.getElementById('themeSelect');
        const languageSelect = document.getElementById('languageSelect');
        const saveBtn = document.getElementById('saveSettingsBtn');

        // Charger les paramètres sauvegardés
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const savedLanguage = localStorage.getItem('language') || 'fr';

        if (themeSelect) {
            themeSelect.value = savedTheme;
        }

        if (languageSelect) {
            languageSelect.value = savedLanguage;
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (themeSelect) {
                    const theme = themeSelect.value;
                    localStorage.setItem('theme', theme);
                    if (window.themeManager) {
                        window.themeManager.applyTheme(theme);
                    }
                }

                if (languageSelect) {
                    const language = languageSelect.value;
                    localStorage.setItem('language', language);
                }

                alert('Paramètres enregistrés avec succès !');
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});

