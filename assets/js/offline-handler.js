/**
 * Gestionnaire Mode Hors Ligne
 * Détecte la perte de connexion et gère l'affichage
 */

class OfflineHandler {
    constructor() {
        this.isOnline = navigator.onLine;
        this.init();
    }
    
    init() {
        // Écouter les changements de connexion
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Vérifier l'état initial
        if (!this.isOnline) {
            this.handleOffline();
        } else {
            this.handleOnline();
        }
    }
    
    handleOnline() {
        this.isOnline = true;
        console.log('✅ Connexion internet rétablie');
        
        // Retirer le badge hors ligne
        const offlineBadge = document.getElementById('offlineBadge');
        if (offlineBadge) {
            offlineBadge.remove();
        }
        
        // Retirer le statut de connexion
        const connectionStatus = document.getElementById('connectionStatus');
        if (connectionStatus) {
            connectionStatus.classList.remove('offline');
        }
        
        // Recharger les données si nécessaire
        if (window.feedManager) {
            window.feedManager.loadProducts(true);
        }
        if (window.storeManager) {
            window.storeManager.loadProducts(true);
        }
    }
    
    handleOffline() {
        this.isOnline = false;
        console.log('⚠️ Connexion internet perdue');
        
        // Afficher le badge hors ligne
        this.showOfflineBadge();
        
        // Afficher le statut de connexion
        this.showConnectionStatus();
    }
    
    showOfflineBadge() {
        // Retirer l'ancien badge s'il existe
        const existing = document.getElementById('offlineBadge');
        if (existing) {
            existing.remove();
        }
        
        // Créer le badge
        const badge = document.createElement('div');
        badge.id = 'offlineBadge';
        badge.className = 'offline-badge';
        badge.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>Mode hors ligne</span>
        `;
        
        document.body.appendChild(badge);
        
        // Retirer après 5 secondes
        setTimeout(() => {
            if (badge.parentNode) {
                badge.style.animation = 'offlineBadgeSlideIn 0.4s ease-out reverse';
                setTimeout(() => badge.remove(), 400);
            }
        }, 5000);
    }
    
    showConnectionStatus() {
        // Retirer l'ancien statut s'il existe
        const existing = document.getElementById('connectionStatus');
        if (existing) {
            existing.classList.add('offline');
            return;
        }
        
        // Créer le statut
        const status = document.createElement('div');
        status.id = 'connectionStatus';
        status.className = 'connection-status offline';
        status.setAttribute('aria-label', 'Hors ligne');
        
        document.body.appendChild(status);
    }
}

// Initialiser le gestionnaire hors ligne
document.addEventListener('DOMContentLoaded', () => {
    window.offlineHandler = new OfflineHandler();
});

