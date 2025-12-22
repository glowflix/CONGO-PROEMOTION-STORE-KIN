// Configuration API Apps Script
const API_CONFIG = {
    // URL Apps Script Web App déployée
    baseUrl: 'https://script.google.com/macros/s/AKfycbzuzOTZ8dpxlgxB6MHo2JNk9L6OOpByb-TT8nxRd_kdJcZkWxMTpw7dHjvBy0Epfpg/exec',
    timeout: 12000 // 12 secondes (Apps Script peut être lent, surtout au cold start)
};

// Mode debug - mettre à true seulement pour déboguer
const DEBUG_MODE = false;

// Gestion des erreurs API
class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Fonction utilitaire pour faire des requêtes
async function apiRequest(route, params = {}, method = 'GET', bodyData = null) {
    const url = new URL(API_CONFIG.baseUrl);
    url.searchParams.append('route', route);
    
    // Pour GET, tout passe en paramètres URL (évite preflight CORS)
    if (method === 'GET') {
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
    }

    // Configuration pour Apps Script - CORS simplifié
    const options = {
        method,
        redirect: 'follow', // Important pour Apps Script
        mode: 'cors' // Utiliser cors normalement
    };
    
    // Pour POST : ajouter headers et body
    if (method === 'POST' && bodyData) {
        options.headers = {
            'Content-Type': 'application/json',
        };
        options.body = JSON.stringify(bodyData.body || bodyData);
    }
    // Pour GET : pas de headers pour éviter preflight inutile

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
        
        // Logs uniquement en mode debug
        if (DEBUG_MODE) {
            console.log(`[API] ${method} ${route}`, { params, bodyData });
            console.log(`[API] URL:`, url.toString());
        }
        
        const response = await fetch(url.toString(), {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Log uniquement en mode debug
        if (DEBUG_MODE) {
            console.log(`[API] Response status: ${response.status}`);
        }

        // Détection d'erreur CORS
        if (response.type === 'opaque' || response.type === 'opaqueredirect') {
            console.error('[API] ❌ ERREUR CORS DÉTECTÉE');
            console.error('[API] La réponse est opaque, ce qui signifie que CORS bloque la requête.');
            console.error('[API] SOLUTION: Vérifiez le déploiement Apps Script:');
            console.error('[API]   1. Allez sur script.google.com');
            console.error('[API]   2. Déployer > Gérer les déploiements');
            console.error('[API]   3. Modifiez le déploiement');
            console.error('[API]   4. Accès = "Tous les utilisateurs" (OBLIGATOIRE)');
            console.error('[API]   5. Redéployez');
            throw new APIError('Erreur CORS - Vérifiez que Apps Script est déployé avec "Tous les utilisateurs"', 0);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API] HTTP Error ${response.status}:`, errorText);
            throw new APIError(`HTTP error! status: ${response.status}`, response.status, { details: errorText });
        }

        // Lire le texte d'abord pour voir ce qui est retourné
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('[API] Erreur de parsing JSON:', parseError);
            if (DEBUG_MODE) {
                console.error('[API] Texte reçu:', responseText);
            }
            throw new APIError('Réponse invalide du serveur (pas du JSON)', response.status, { responseText });
        }
        
        if (data.error) {
            console.error('[API] Erreur:', data.error);
            if (DEBUG_MODE) {
                console.error('[API] Détails:', data);
            }
            throw new APIError(data.error, response.status, data);
        }

        if (DEBUG_MODE) {
            console.log(`[API] Succès:`, data);
        }
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('[API] Timeout');
            throw new APIError('Request timeout', 408);
        }
        if (error instanceof APIError) {
            throw error;
        }
        // Détecter si c'est une erreur de connexion
        const isOffline = error.message.includes('Failed to fetch') || 
                         error.message.includes('ERR_INTERNET_DISCONNECTED') ||
                         error.message.includes('ERR_NETWORK_CHANGED') ||
                         (!navigator.onLine);
        
        if (isOffline) {
            console.warn('[API] ⚠️ Pas de connexion internet détectée');
        }
        
        console.error('[API] Erreur inattendue:', error);
        throw new APIError(
            isOffline ? 'Pas de connexion internet' : (error.message || 'Erreur de connexion'), 
            0, 
            { 
                originalError: error.toString(),
                isOffline: isOffline
            }
        );
    }
}

// API - Produits
const ProductsAPI = {
    // Récupérer la liste des produits
    async getProducts(limit = 20, cursor = null, filter = null) {
        const params = { limit, cursor, filter };
        return apiRequest('products', params);
    },

    // Récupérer un produit par ID
    async getProduct(id) {
        return apiRequest('product', { id });
    },

    // Rechercher des produits
    async searchProducts(query, limit = 20) {
        return apiRequest('products', { search: query, limit });
    }
};

// API - Commentaires
const CommentsAPI = {
    // Récupérer les commentaires d'un produit
    async getComments(productId, limit = 50) {
        return apiRequest('comments', { productId, limit });
    },

    // Ajouter un commentaire
    async addComment(productId, content, parentId = null) {
        const userId = localStorage.getItem('userId') || 'anonymous';
        const userName = localStorage.getItem('userName') || 'Utilisateur';
        return apiRequest('comment', {}, 'POST', {
            productId,
            content,
            parentId,
            userId,
            userName
        });
    }
};

// API - Likes
const LikesAPI = {
    // Liker un produit
    async likeProduct(productId) {
        const userId = localStorage.getItem('userId') || 'anonymous';
        return apiRequest('likeProduct', {}, 'POST', { productId, userId });
    },

    // Retirer le like
    async unlikeProduct(productId) {
        const userId = localStorage.getItem('userId') || 'anonymous';
        return apiRequest('unlikeProduct', {}, 'POST', { productId, userId });
    }
};

// API - Avis
const ReviewsAPI = {
    // Récupérer les avis d'un produit
    async getReviews(productId, limit = 50) {
        return apiRequest('reviews', { productId, limit });
    },

    // Ajouter un avis
    async addReview(productId, rating, content) {
        const userId = localStorage.getItem('userId') || 'anonymous';
        const userName = localStorage.getItem('userName') || 'Utilisateur';
        return apiRequest('review', {}, 'POST', {
            productId,
            rating,
            content,
            userId,
            userName
        });
    }
};

// API - Vidéos
const VideosAPI = {
    // Récupérer les vidéos
    async getVideos(limit = 20, cursor = null) {
        return apiRequest('videos', { limit, cursor });
    }
};

// API - IA (Assistant)
const AIAPI = {
    // Poser une question à l'assistant
    async askQuestion(question) {
        return apiRequest('aiAsk', {}, 'POST', { question });
    }
};

// API - Livraisons
const DeliveryAPI = {
    // Créer une livraison
    async createDelivery(deliveryData) {
        return apiRequest('createDelivery', {}, 'POST', deliveryData);
    },

    // Récupérer une livraison par ID
    async getDelivery(deliveryId) {
        return apiRequest('delivery', { id: deliveryId });
    },

    // Mettre à jour le statut d'une livraison
    async updateDeliveryStatus(deliveryId, status, driverId = null, driverLocation = null) {
        return apiRequest('updateDeliveryStatus', {}, 'POST', {
            deliveryId,
            status,
            driverId,
            driverLocation
        });
    },

    // Assigner un livreur à une livraison
    async assignDriver(deliveryId, driverId) {
        return apiRequest('assignDriver', {}, 'POST', {
            deliveryId,
            driverId
        });
    }
};

// Export pour utilisation globale
window.ProductsAPI = ProductsAPI;
window.CommentsAPI = CommentsAPI;
window.LikesAPI = LikesAPI;
window.ReviewsAPI = ReviewsAPI;
window.VideosAPI = VideosAPI;
window.AIAPI = AIAPI;
window.DeliveryAPI = DeliveryAPI;

