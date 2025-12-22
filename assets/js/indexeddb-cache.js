/**
 * IndexedDB Cache - Gestion avancée du cache local
 * Stocke les produits, titres, textes en mémoire pour chargement rapide
 * Durée de vie : 10-20 minutes
 */

class IndexedDBCache {
    constructor() {
        this.dbName = 'CongoPromotionStoreDB';
        this.dbVersion = 1;
        this.db = null;
        this.cacheDuration = 15 * 60 * 1000; // 15 minutes par défaut
        this.init();
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('Erreur IndexedDB:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialisé');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store pour les produits
                if (!db.objectStoreNames.contains('products')) {
                    const productsStore = db.createObjectStore('products', { keyPath: 'id' });
                    productsStore.createIndex('category', 'category', { unique: false });
                    productsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    productsStore.createIndex('filter', 'filter', { unique: false });
                }
                
                // Store pour les métadonnées (titres, textes, etc.)
                if (!db.objectStoreNames.contains('metadata')) {
                    const metadataStore = db.createObjectStore('metadata', { keyPath: 'key' });
                    metadataStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store pour les statistiques
                if (!db.objectStoreNames.contains('stats')) {
                    const statsStore = db.createObjectStore('stats', { keyPath: 'key' });
                }
                
                console.log('✅ IndexedDB stores créés');
            };
        });
    }
    
    /**
     * Sauvegarder les produits dans le cache
     */
    async saveProducts(products, filter = 'all', metadata = {}) {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products', 'metadata'], 'readwrite');
            const productsStore = transaction.objectStore('products');
            const metadataStore = transaction.objectStore('metadata');
            
            const timestamp = Date.now();
            let savedCount = 0;
            let errorCount = 0;
            
            // Sauvegarder chaque produit
            products.forEach(product => {
                const productData = {
                    ...product,
                    timestamp: timestamp,
                    filter: filter,
                    // Extraire les données importantes pour recherche rapide
                    searchText: `${product.title} ${product.description || ''}`.toLowerCase(),
                    priceNumber: parseFloat(product.price) || 0
                };
                
                const request = productsStore.put(productData);
                
                request.onsuccess = () => {
                    savedCount++;
                    if (savedCount + errorCount === products.length) {
                        // Sauvegarder les métadonnées
                        const metadataData = {
                            key: `products_${filter}`,
                            products: products.map(p => ({
                                id: p.id,
                                title: p.title,
                                price: p.price,
                                coverImageUrl: p.coverImageUrl,
                                ratingAvg: p.ratingAvg,
                                ratingCount: p.ratingCount,
                                likesCount: p.likesCount,
                                commentsCount: p.commentsCount,
                                isNew: p.isNew,
                                isPromo: p.isPromo,
                                stock: p.stock
                            })),
                            count: products.length,
                            timestamp: timestamp,
                            filter: filter,
                            ...metadata
                        };
                        
                        metadataStore.put(metadataData).onsuccess = () => {
                            console.log(`✅ ${savedCount} produits mis en cache (filter: ${filter})`);
                            resolve({ saved: savedCount, errors: errorCount });
                        };
                    }
                };
                
                request.onerror = () => {
                    errorCount++;
                    console.error('Erreur sauvegarde produit:', request.error);
                    if (savedCount + errorCount === products.length) {
                        resolve({ saved: savedCount, errors: errorCount });
                    }
                };
            });
        });
    }
    
    /**
     * Récupérer les produits depuis le cache
     */
    async getProducts(filter = 'all', maxAge = this.cacheDuration) {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products', 'metadata'], 'readonly');
            const productsStore = transaction.objectStore('products');
            const metadataStore = transaction.objectStore('metadata');
            
            // Vérifier les métadonnées d'abord
            const metadataRequest = metadataStore.get(`products_${filter}`);
            
            metadataRequest.onsuccess = () => {
                const metadata = metadataRequest.result;
                
                if (!metadata) {
                    resolve(null);
                    return;
                }
                
                // Vérifier l'âge du cache (seulement si maxAge n'est pas Infinity)
                const age = Date.now() - metadata.timestamp;
                if (maxAge !== Infinity && age > maxAge) {
                    // Si maxAge est Infinity, on retourne le cache même très ancien
                    // Sinon, on vérifie l'âge normalement
                    console.log(`⚠️ Cache expiré pour filter: ${filter} (âge: ${Math.round(age / 1000 / 60)}min, max: ${Math.round(maxAge / 1000 / 60)}min)`);
                    resolve(null);
                    return;
                }
                
                // Récupérer les produits
                const index = productsStore.index('filter');
                const range = IDBKeyRange.only(filter);
                const request = index.getAll(range);
                
                request.onsuccess = () => {
                    let products = request.result;
                    
                    // Filtrer par timestamp (garder seulement les plus récents)
                    const validTimestamp = metadata.timestamp;
                    products = products.filter(p => p.timestamp === validTimestamp);
                    
                    // Trier par timestamp décroissant
                    products.sort((a, b) => {
                        if (a.timestamp !== b.timestamp) {
                            return b.timestamp - a.timestamp;
                        }
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                    
                    console.log(`✅ ${products.length} produits récupérés du cache (filter: ${filter}, âge: ${Math.round(age / 1000 / 60)}min)`);
                    resolve({
                        products: products,
                        metadata: metadata,
                        fromCache: true,
                        cacheAge: age
                    });
                };
                
                request.onerror = () => {
                    console.error('Erreur récupération produits:', request.error);
                    reject(request.error);
                };
            };
            
            metadataRequest.onerror = () => {
                resolve(null);
            };
        });
    }
    
    /**
     * Recherche rapide dans le cache
     */
    async searchProducts(query, filter = 'all') {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const productsStore = transaction.objectStore('products');
            const index = productsStore.index('filter');
            const range = IDBKeyRange.only(filter);
            const request = index.getAll(range);
            
            request.onsuccess = () => {
                const searchLower = query.toLowerCase();
                const results = request.result.filter(product => {
                    return product.searchText && product.searchText.includes(searchLower);
                });
                
                console.log(`🔍 ${results.length} produits trouvés pour "${query}"`);
                resolve(results);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    /**
     * Sauvegarder les métadonnées (titres, textes, etc.)
     */
    async saveMetadata(key, data) {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['metadata'], 'readwrite');
            const store = transaction.objectStore('metadata');
            
            const metadata = {
                key: key,
                data: data,
                timestamp: Date.now()
            };
            
            const request = store.put(metadata);
            
            request.onsuccess = () => {
                console.log(`✅ Métadonnées sauvegardées: ${key}`);
                resolve();
            };
            
            request.onerror = () => {
                console.error('Erreur sauvegarde métadonnées:', request.error);
                reject(request.error);
            };
        });
    }
    
    /**
     * Récupérer les métadonnées
     */
    async getMetadata(key, maxAge = this.cacheDuration) {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['metadata'], 'readonly');
            const store = transaction.objectStore('metadata');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const metadata = request.result;
                
                if (!metadata) {
                    resolve(null);
                    return;
                }
                
                const age = Date.now() - metadata.timestamp;
                if (age > maxAge) {
                    resolve(null);
                    return;
                }
                
                resolve(metadata.data);
            };
            
            request.onerror = () => {
                resolve(null);
            };
        });
    }
    
    /**
     * Nettoyer le cache expiré
     */
    async cleanExpiredCache(maxAge = this.cacheDuration) {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products', 'metadata'], 'readwrite');
            const productsStore = transaction.objectStore('products');
            const metadataStore = transaction.objectStore('metadata');
            const timestampIndex = productsStore.index('timestamp');
            
            const cutoffTime = Date.now() - maxAge;
            const range = IDBKeyRange.upperBound(cutoffTime);
            const request = timestampIndex.openCursor(range);
            
            let deletedCount = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    // Nettoyer aussi les métadonnées
                    const metadataRequest = metadataStore.openCursor();
                    let metadataDeleted = 0;
                    
                    metadataRequest.onsuccess = (e) => {
                        const metaCursor = e.target.result;
                        if (metaCursor) {
                            if (Date.now() - metaCursor.value.timestamp > maxAge) {
                                metaCursor.delete();
                                metadataDeleted++;
                            }
                            metaCursor.continue();
                        } else {
                            console.log(`🧹 Cache nettoyé: ${deletedCount} produits, ${metadataDeleted} métadonnées`);
                            resolve({ products: deletedCount, metadata: metadataDeleted });
                        }
                    };
                }
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    /**
     * Obtenir les statistiques du cache
     */
    async getCacheStats() {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products', 'metadata'], 'readonly');
            const productsStore = transaction.objectStore('products');
            const metadataStore = transaction.objectStore('metadata');
            
            const productsCount = productsStore.count();
            const metadataCount = metadataStore.count();
            
            Promise.all([
                new Promise(res => {
                    productsCount.onsuccess = () => res(productsCount.result);
                    productsCount.onerror = () => res(0);
                }),
                new Promise(res => {
                    metadataCount.onsuccess = () => res(metadataCount.result);
                    metadataCount.onerror = () => res(0);
                })
            ]).then(([products, metadata]) => {
                resolve({
                    products: products,
                    metadata: metadata,
                    cacheSize: 'Calcul en cours...' // IndexedDB ne donne pas directement la taille
                });
            });
        });
    }
    
    /**
     * Vider complètement le cache
     */
    async clearCache() {
        if (!this.db) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products', 'metadata', 'stats'], 'readwrite');
            const productsStore = transaction.objectStore('products');
            const metadataStore = transaction.objectStore('metadata');
            const statsStore = transaction.objectStore('stats');
            
            Promise.all([
                new Promise(res => {
                    productsStore.clear().onsuccess = () => res();
                    productsStore.clear().onerror = () => res();
                }),
                new Promise(res => {
                    metadataStore.clear().onsuccess = () => res();
                    metadataStore.clear().onerror = () => res();
                }),
                new Promise(res => {
                    statsStore.clear().onsuccess = () => res();
                    statsStore.clear().onerror = () => res();
                })
            ]).then(() => {
                console.log('🗑️ Cache vidé complètement');
                resolve();
            });
        });
    }
}

// Initialiser le cache global
let indexedDBCache = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        indexedDBCache = new IndexedDBCache();
        await indexedDBCache.init();
        
        // Nettoyer le cache expiré au démarrage
        await indexedDBCache.cleanExpiredCache();
        
        // Exposer globalement pour le débogage
        window.indexedDBCache = indexedDBCache;
        
        console.log('✅ IndexedDB Cache prêt');
    } catch (error) {
        console.error('❌ Erreur initialisation IndexedDB:', error);
    }
});

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexedDBCache;
}

