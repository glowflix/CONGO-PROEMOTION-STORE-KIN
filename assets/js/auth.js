// Système d'authentification
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Charger l'utilisateur depuis le localStorage
        this.loadUser();
    }

    // Charger l'utilisateur depuis le stockage local
    loadUser() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur:', error);
        }
    }

    // Sauvegarder l'utilisateur
    saveUser(user) {
        try {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUser = user;
            this.updateUI();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
        }
    }

    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obtenir l'utilisateur actuel
    getCurrentUser() {
        return this.currentUser;
    }

    // Déconnexion
    logout() {
        localStorage.removeItem('user');
        this.currentUser = null;
        this.updateUI();
        
        // Rediriger vers la page d'accueil ou profil
        if (window.location.pathname.includes('profile')) {
            window.location.reload();
        }
    }

    // Mettre à jour l'UI selon l'état de connexion
    updateUI() {
        const isAuth = this.isAuthenticated();
        
        // Mettre à jour les boutons de connexion/déconnexion
        const loginButtons = document.querySelectorAll('.login-btn, .auth-login-btn');
        const logoutButtons = document.querySelectorAll('.logout-btn, .auth-logout-btn');
        const userInfo = document.querySelectorAll('.user-info');
        
        loginButtons.forEach(btn => {
            btn.style.display = isAuth ? 'none' : 'block';
        });
        
        logoutButtons.forEach(btn => {
            btn.style.display = isAuth ? 'block' : 'none';
        });
        
        if (isAuth && this.currentUser) {
            userInfo.forEach(info => {
                const nameEl = info.querySelector('.user-name');
                const emailEl = info.querySelector('.user-email');
                if (nameEl) nameEl.textContent = this.currentUser.name || this.currentUser.email;
                if (emailEl) emailEl.textContent = this.currentUser.email;
            });
        }
    }

    // Demander la création de compte si nécessaire
    requireAuth(action = 'effectuer cette action') {
        if (!this.isAuthenticated()) {
            this.showAuthModal(action);
            return false;
        }
        return true;
    }

    // Afficher le modal d'authentification
    showAuthModal(action = 'effectuer cette action') {
        const modal = this.createAuthModal(action);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    // Créer le modal d'authentification
    createAuthModal(action) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <button class="auth-modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="auth-tabs">
                    <button class="auth-tab-btn active" data-tab="login">Se connecter</button>
                    <button class="auth-tab-btn" data-tab="signup">Créer un compte</button>
                </div>
                
                <div class="auth-tab-content active" id="authLoginTab">
                    <h3>Connexion</h3>
                    <p class="auth-info">Connectez-vous pour ${action}</p>
                    <form id="loginForm" class="auth-form">
                        <div class="auth-form-group">
                            <label>Email ou Téléphone</label>
                            <input type="text" id="loginIdentifier" placeholder="email@example.com ou +243..." required>
                        </div>
                        <div class="auth-form-group">
                            <label>Mot de passe</label>
                            <input type="password" id="loginPassword" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Se connecter</button>
                        <div class="auth-divider">
                            <span>ou</span>
                        </div>
                        <button type="button" class="btn btn-secondary btn-block" id="googleLoginBtn">
                            <i class="fab fa-google"></i> Continuer avec Google
                        </button>
                    </form>
                </div>
                
                <div class="auth-tab-content" id="authSignupTab">
                    <h3>Créer un compte</h3>
                    <p class="auth-info">Créez un compte pour ${action}</p>
                    <form id="signupForm" class="auth-form">
                        <div class="auth-form-group">
                            <label>Nom complet</label>
                            <input type="text" id="signupName" placeholder="Votre nom" required>
                        </div>
                        <div class="auth-form-group">
                            <label>Numéro de téléphone</label>
                            <input type="tel" id="signupPhone" placeholder="+243..." required>
                        </div>
                        <div class="auth-form-group">
                            <label>Adresse email</label>
                            <input type="email" id="signupEmail" placeholder="email@example.com" required>
                        </div>
                        <div class="auth-form-group" id="codeGroup" style="display: none;">
                            <label>Code de confirmation</label>
                            <input type="text" id="signupCode" placeholder="Entrez le code reçu par email" maxlength="6">
                            <small>Un code a été envoyé à votre email</small>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="signupSubmitBtn">
                            Créer un compte
                        </button>
                        <div class="auth-divider">
                            <span>ou</span>
                        </div>
                        <button type="button" class="btn btn-secondary btn-block" id="googleSignupBtn">
                            <i class="fab fa-google"></i> Continuer avec Google
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Auto-remplissage si utilisateur déjà enregistré
        this.autoFillForm(modal);

        // Gestion des onglets
        const tabButtons = modal.querySelectorAll('.auth-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tabs = modal.querySelectorAll('.auth-tab-content');
                tabs.forEach(t => t.classList.remove('active'));
                modal.querySelector(`#auth${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`).classList.add('active');
            });
        });

        // Fermer le modal
        const closeBtn = modal.querySelector('.auth-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Gestion du formulaire de connexion
        const loginForm = modal.querySelector('#loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(modal);
        });

        // Gestion du formulaire d'inscription
        const signupForm = modal.querySelector('#signupForm');
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(modal);
        });

        // Connexion Google
        const googleLoginBtn = modal.querySelector('#googleLoginBtn');
        const googleSignupBtn = modal.querySelector('#googleSignupBtn');
        googleLoginBtn.addEventListener('click', () => this.handleGoogleAuth('login'));
        googleSignupBtn.addEventListener('click', () => this.handleGoogleAuth('signup'));

        return modal;
    }

    // Auto-remplissage des formulaires
    autoFillForm(modal) {
        const savedPhone = localStorage.getItem('savedPhone');
        const savedEmail = localStorage.getItem('savedEmail');
        const savedName = localStorage.getItem('savedName');

        if (savedPhone) {
            const phoneInput = modal.querySelector('#signupPhone');
            const loginInput = modal.querySelector('#loginIdentifier');
            if (phoneInput) phoneInput.value = savedPhone;
            if (loginInput && !loginInput.value) loginInput.value = savedPhone;
        }

        if (savedEmail) {
            const emailInput = modal.querySelector('#signupEmail');
            const loginEmailInput = modal.querySelector('#loginIdentifier');
            if (emailInput) emailInput.value = savedEmail;
            if (loginEmailInput && !loginEmailInput.value) loginEmailInput.value = savedEmail;
        }

        if (savedName) {
            const nameInput = modal.querySelector('#signupName');
            if (nameInput) nameInput.value = savedName;
        }
    }

    // Gérer la connexion
    async handleLogin(modal) {
        const identifier = modal.querySelector('#loginIdentifier').value;
        const password = modal.querySelector('#loginPassword').value;

        try {
            // Simuler une connexion (à remplacer par un vrai appel API)
            const user = {
                id: 'user_' + Date.now(),
                email: identifier.includes('@') ? identifier : null,
                phone: identifier.includes('@') ? null : identifier,
                name: identifier.split('@')[0] || 'Utilisateur',
                createdAt: new Date().toISOString()
            };

            this.saveUser(user);
            modal.remove();
            
            // Afficher un message de succès
            this.showNotification('Connexion réussie !', 'success');
            
            // Recharger la page si nécessaire
            if (window.location.pathname.includes('profile')) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            this.showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        }
    }

    // Gérer l'inscription
    async handleSignup(modal) {
        const name = modal.querySelector('#signupName').value;
        const phone = modal.querySelector('#signupPhone').value;
        const email = modal.querySelector('#signupEmail').value;
        const code = modal.querySelector('#signupCode').value;
        const codeGroup = modal.querySelector('#codeGroup');
        const signupSubmitBtn = modal.querySelector('#signupSubmitBtn');

        // Si le code n'a pas été envoyé, l'envoyer
        if (!codeGroup.style.display || codeGroup.style.display === 'none') {
            try {
                // Simuler l'envoi du code (à remplacer par un vrai appel API)
                this.showNotification('Code de confirmation envoyé à ' + email, 'info');
                codeGroup.style.display = 'block';
                signupSubmitBtn.textContent = 'Vérifier le code';
                signupSubmitBtn.dataset.step = 'verify';
                
                // Sauvegarder temporairement les données
                modal.dataset.tempName = name;
                modal.dataset.tempPhone = phone;
                modal.dataset.tempEmail = email;
            } catch (error) {
                console.error('Erreur d\'envoi du code:', error);
                this.showNotification('Erreur lors de l\'envoi du code.', 'error');
            }
            return;
        }

        // Vérifier le code
        if (code.length < 6) {
            this.showNotification('Le code doit contenir 6 chiffres', 'error');
            return;
        }

        try {
            // Simuler la vérification du code (à remplacer par un vrai appel API)
            const user = {
                id: 'user_' + Date.now(),
                name: modal.dataset.tempName || name,
                phone: modal.dataset.tempPhone || phone,
                email: modal.dataset.tempEmail || email,
                createdAt: new Date().toISOString()
            };

            // Sauvegarder pour auto-remplissage futur
            localStorage.setItem('savedPhone', phone);
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('savedName', name);

            this.saveUser(user);
            modal.remove();
            
            this.showNotification('Compte créé avec succès !', 'success');
            
            if (window.location.pathname.includes('profile')) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Erreur de création de compte:', error);
            this.showNotification('Erreur lors de la création du compte.', 'error');
        }
    }

    // Gérer l'authentification Google
    async handleGoogleAuth(type) {
        try {
            // Simuler l'authentification Google (à remplacer par Google OAuth)
            const user = {
                id: 'user_' + Date.now(),
                email: 'user@gmail.com',
                name: 'Utilisateur Google',
                provider: 'google',
                createdAt: new Date().toISOString()
            };

            // Sauvegarder l'email pour auto-remplissage
            localStorage.setItem('savedEmail', user.email);

            this.saveUser(user);
            
            // Fermer tous les modals
            document.querySelectorAll('.auth-modal').forEach(m => m.remove());
            
            this.showNotification('Connexion Google réussie !', 'success');
            
            if (window.location.pathname.includes('profile')) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Erreur Google Auth:', error);
            this.showNotification('Erreur lors de la connexion Google.', 'error');
        }
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialiser le gestionnaire d'authentification
if (typeof window !== 'undefined') {
    window.authManager = new AuthManager();
}

