/**
 * Congo Promotion Store - Apps Script API Backend Professionnel
 * 
 * Spreadsheet ID: 1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q
 * 
 * INSTRUCTIONS DE DÉPLOIEMENT:
 * 1. Copiez ce code dans Apps Script (script.google.com)
 * 2. Déployez en Web App (Déployer > Nouvelle version)
 * 3. Type: Application Web
 * 4. Exécuter en tant que: Moi
 * 5. Accès: Tous les utilisateurs
 * 6. Copiez l'URL de déploiement
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  SPREADSHEET_ID: '1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q',
  SHEETS: {
    USERS: 'Users',
    PRODUCTS: 'Products',
    COMMENTS: 'Comments',
    PRODUCT_LIKES: 'ProductLikes',
    REVIEWS: 'Reviews',
    VIDEOS: 'Videos',
    AI_KB: 'AI_KB',
    AI_LOGS: 'AI_Logs',
    DELIVERIES: 'Deliveries',
    DELIVERY_DRIVERS: 'DeliveryDrivers'
  },
  RATE_LIMIT: {
    ENABLED: true,
    MAX_REQUESTS: 100,
    WINDOW_MINUTES: 15
  }
};

// ============================================
// POINTS D'ENTRÉE PRINCIPAUX
// ============================================
function doGet(e) {
  // S'assurer que e existe (peut être undefined si appelé directement)
  if (!e) {
    e = {};
  }
  return handleRequest(e, 'GET');
}

function doPost(e) {
  // S'assurer que e existe (peut être undefined si appelé directement)
  if (!e) {
    e = {};
  }
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    // Vérifier que e existe
    if (!e) {
      e = {};
    }
    
    // Initialiser parameter si absent
    if (!e.parameter) {
      e.parameter = {};
    }
    
    // Log de débogage détaillé
    Logger.log('=== Nouvelle requête ===');
    Logger.log('Méthode: ' + method);
    Logger.log('e.parameter: ' + JSON.stringify(e.parameter || {}));
    Logger.log('e.queryString: ' + (e.queryString || 'vide'));
    Logger.log('e.pathInfo: ' + (e.pathInfo || 'vide'));
    Logger.log('Tous les champs de e: ' + JSON.stringify(Object.keys(e || {})));
    
    // Si e.parameter est vide mais queryString existe, parser queryString
    if ((!e.parameter || Object.keys(e.parameter).length === 0) && e.queryString) {
      Logger.log('⚠️ e.parameter est vide, parsing queryString...');
      const params = {};
      const pairs = e.queryString.split('&');
      for (let i = 0; i < pairs.length; i++) {
        const [key, value] = pairs[i].split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      }
      Logger.log('Paramètres parsés depuis queryString: ' + JSON.stringify(params));
      // Fusionner avec e.parameter
      e.parameter = Object.assign(e.parameter || {}, params);
      Logger.log('e.parameter après fusion: ' + JSON.stringify(e.parameter));
    }
    
    // Vérification rate limit
    if (CONFIG.RATE_LIMIT.ENABLED && !checkRateLimit(e)) {
      return createResponse({ 
        error: 'Trop de requêtes. Veuillez réessayer plus tard.' 
      }, 429);
    }
    
    // Détecter la route de plusieurs manières
    let route = null;
    
    // Méthode 1: e.parameter.route
    if (e.parameter && e.parameter.route) {
      route = e.parameter.route;
      Logger.log('Route détectée (méthode 1): ' + route);
    }
    // Méthode 2: e.parameter['route']
    else if (e.parameter && e.parameter['route']) {
      route = e.parameter['route'];
      Logger.log('Route détectée (méthode 2): ' + route);
    }
    // Méthode 3: queryString (pour les URLs directes)
    else if (e.queryString) {
      const params = e.queryString.split('&');
      for (let i = 0; i < params.length; i++) {
        const [key, value] = params[i].split('=');
        if (key === 'route') {
          route = decodeURIComponent(value);
          Logger.log('Route détectée (méthode 3 - queryString): ' + route);
          break;
        }
      }
    }
    // Méthode 4: POST body
    else if (e.postData && e.postData.contents) {
      try {
        const body = JSON.parse(e.postData.contents);
        if (body.route) {
          route = body.route;
          Logger.log('Route détectée (méthode 4 - POST body): ' + route);
        }
      } catch (e) {
        Logger.log('Erreur parsing POST body: ' + e.toString());
      }
    }
    
    if (!route) {
      Logger.log('❌ Route non détectée');
      Logger.log('Tous les paramètres: ' + JSON.stringify(e.parameter || {}));
      return createResponse({ 
        error: 'Route manquante. Utilisez ?route=nom_route',
        receivedParams: e.parameter ? Object.keys(e.parameter) : [],
        hint: 'Exemples: ?route=products, ?route=product&id=PROD_123'
      }, 400);
    }
    
    Logger.log('✅ Route finale: ' + route);

    let result;
    
    // Router les requêtes
    switch (route) {
      // ========== PRODUITS ==========
      case 'products':
        result = getProducts(e.parameter);
        break;
      case 'product':
        if (!e.parameter.id) {
          return createResponse({ error: 'ID produit manquant' }, 400);
        }
        result = getProduct(e.parameter.id);
        break;
      
      // ========== COMMENTAIRES ==========
      case 'comments':
        if (!e.parameter.productId) {
          return createResponse({ error: 'ID produit manquant' }, 400);
        }
        result = getComments(e.parameter.productId, parseInt(e.parameter.limit) || 50);
        break;
      case 'comment':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const commentBody = JSON.parse(e.postData.contents);
        result = addComment(commentBody);
        break;
      
      // ========== LIKES ==========
      case 'likeProduct':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const likeBody = JSON.parse(e.postData.contents);
        result = likeProduct(likeBody.productId, likeBody.userId);
        break;
      case 'unlikeProduct':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const unlikeBody = JSON.parse(e.postData.contents);
        result = unlikeProduct(unlikeBody.productId, unlikeBody.userId);
        break;
      
      // ========== AVIS ==========
      case 'reviews':
        if (!e.parameter.productId) {
          return createResponse({ error: 'ID produit manquant' }, 400);
        }
        result = getReviews(e.parameter.productId, parseInt(e.parameter.limit) || 50);
        break;
      case 'review':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const reviewBody = JSON.parse(e.postData.contents);
        result = addReview(reviewBody);
        break;
      
      // ========== VIDÉOS ==========
      case 'videos':
        result = getVideos(parseInt(e.parameter.limit) || 20, e.parameter.cursor);
        break;
      
      // ========== IA ==========
      case 'aiAsk':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const aiBody = JSON.parse(e.postData.contents);
        result = askAI(aiBody.question, aiBody.userId);
        break;
      
      // ========== STOCK ==========
      case 'updateStock':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const stockBody = JSON.parse(e.postData.contents);
        result = updateProductStock(stockBody.productId, stockBody.stock);
        break;
      
      // ========== LIVRAISONS ==========
      case 'createDelivery':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const deliveryBody = JSON.parse(e.postData.contents);
        result = createDelivery(deliveryBody);
        break;
      case 'delivery':
        if (!e.parameter.id) {
          return createResponse({ error: 'ID livraison manquant' }, 400);
        }
        result = getDelivery(e.parameter.id);
        break;
      case 'updateDeliveryStatus':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const statusBody = JSON.parse(e.postData.contents);
        result = updateDeliveryStatus(statusBody.deliveryId, statusBody.status, statusBody.driverId, statusBody.driverLocation);
        break;
      case 'assignDriver':
        if (method !== 'POST') {
          return createResponse({ error: 'Méthode POST requise' }, 405);
        }
        const assignBody = JSON.parse(e.postData.contents);
        result = assignDriverToDelivery(assignBody.deliveryId, assignBody.driverId);
        break;
      
      default:
        return createResponse({ error: `Route '${route}' non trouvée` }, 404);
    }

    return createResponse(result);
  } catch (error) {
    Logger.log('ERREUR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createResponse({ 
      error: 'Erreur serveur',
      message: error.toString()
    }, 500);
  }
}

// ============================================
// UTILITAIRES
// ============================================
function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data));
  response.setMimeType(ContentService.MimeType.JSON);
  
  // Headers CORS pour permettre les requêtes depuis le frontend
  // Important : Ces headers doivent être définis
  return response;
}

// Fonction pour gérer les requêtes OPTIONS (preflight CORS)
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (error) {
    throw new Error('Impossible d\'ouvrir le spreadsheet. Vérifiez l\'ID.');
  }
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Feuille '${sheetName}' non trouvée. Vérifiez le nom de l'onglet.`);
  }
  return sheet;
}

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function checkRateLimit(e) {
  // Implémentation basique du rate limiting
  // Dans une vraie app, utilisez un cache ou une base de données
  return true; // Désactivé pour l'instant
}

// ============================================
// PRODUITS
// ============================================
function getProducts(params) {
  try {
    // Vérifier le cache (durée: 5 minutes)
    const cache = CacheService.getScriptCache();
    const cacheKey = 'products_all_' + (params.filter || 'all') + '_' + (params.search || '');
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        Logger.log('📦 Produits depuis le cache Apps Script');
        
        // Appliquer la limite après récupération du cache
        const limit = parseInt(params.limit) || 20;
        const limitedProducts = parsed.products.slice(0, limit);
        
        return {
          products: limitedProducts,
          hasMore: parsed.products.length > limit,
          cursor: limitedProducts.length > 0 ? limitedProducts[limitedProducts.length - 1].id : null,
          total: parsed.products.length
        };
      } catch (e) {
        Logger.log('Erreur parsing cache: ' + e.toString());
      }
    }
    
    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return { products: [], hasMore: false, cursor: null };
    }
    
    const headers = data[0];
    let products = [];
    
    // Parcourir les lignes (sauf l'en-tête)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] || row[0].toString().trim() === '') continue; // Ignorer les lignes vides
      
      const product = {};
      headers.forEach((header, index) => {
        let value = row[index];
        
        // Traitement spécial selon le type de colonne
        if (header === 'imagesJson' && value) {
          try {
            if (typeof value === 'string' && value.trim() !== '') {
              product[header] = JSON.parse(value);
            } else {
              product[header] = [];
            }
          } catch (e) {
            product[header] = [];
          }
        } else if (header === 'isPublic' || header === 'isNew' || header === 'isPromo') {
          product[header] = value === true || value === 'TRUE' || value === 'true' || value === 1 || value === '1';
        } else if (header === 'price' || header === 'stock' || header === 'ratingAvg' || 
                   header === 'ratingCount' || header === 'likesCount' || header === 'commentsCount') {
          product[header] = parseFloat(value) || 0;
        } else {
          product[header] = value || '';
        }
      });
      
      // Filtrer uniquement les produits publics
      if (product.isPublic === true || product.isPublic === 'TRUE') {
        // Formater les URLs si nécessaire
        if (product.coverImageUrl && !product.coverImageUrl.startsWith('http') && product.coverImageUrl.length > 0) {
          product.coverImageUrl = 'https://drive.google.com/uc?export=view&id=' + product.coverImageUrl;
        }
        
        if (product.model3dUrl && !product.model3dUrl.startsWith('http') && product.model3dUrl.length > 0) {
          product.model3dUrl = 'https://drive.google.com/uc?export=view&id=' + product.model3dUrl;
        }
        
        if (product.videoUrl && !product.videoUrl.startsWith('http') && product.videoUrl.length > 0) {
          product.videoUrl = 'https://drive.google.com/uc?export=view&id=' + product.videoUrl;
        }
        
        // S'assurer que imagesJson est un tableau
        if (!product.imagesJson || !Array.isArray(product.imagesJson)) {
          product.imagesJson = product.coverImageUrl ? [product.coverImageUrl] : [];
        }
        
        products.push(product);
      }
    }
    
    // Recherche par texte
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      products = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(searchTerm)) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filtres
    const filter = params.filter;
    if (filter === 'new') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      products = products.filter(p => {
        if (!p.createdAt) return false;
        try {
          return new Date(p.createdAt) > thirtyDaysAgo;
        } catch (e) {
          return false;
        }
      });
    } else if (filter === 'promo') {
      products = products.filter(p => p.isPromo === true || p.isPromo === 'TRUE');
    } else if (filter === 'trending') {
      products.sort((a, b) => {
        const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) + (a.ratingCount || 0);
        const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) + (b.ratingCount || 0);
        return scoreB - scoreA;
      });
    }
    
    // Tri par date (plus récent en premier)
    products.sort((a, b) => {
      try {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });
    
    // Mettre en cache (durée: 5 minutes = 300 secondes)
    try {
      const cache = CacheService.getScriptCache();
      const cacheKey = 'products_all_' + (params.filter || 'all') + '_' + (params.search || '');
      cache.put(cacheKey, JSON.stringify({
        products: products,
        timestamp: Date.now()
      }), 300); // 5 minutes
      Logger.log('💾 Produits mis en cache Apps Script');
    } catch (cacheError) {
      Logger.log('Erreur mise en cache: ' + cacheError.toString());
    }
    
    // Limiter les résultats
    const limit = parseInt(params.limit) || 20;
    const limitedProducts = products.slice(0, limit);
    
    return {
      products: limitedProducts,
      hasMore: products.length > limit,
      cursor: limitedProducts.length > 0 ? limitedProducts[limitedProducts.length - 1].id : null,
      total: products.length
    };
  } catch (error) {
    Logger.log('Erreur getProducts: ' + error.toString());
    throw error;
  }
}

function getProduct(id) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const idColIndex = headers.indexOf('id');
    if (idColIndex === -1) {
      throw new Error('Colonne "id" non trouvée dans Products');
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[idColIndex] === id) {
        const product = {};
        headers.forEach((header, index) => {
          let value = row[index];
          
          if (header === 'imagesJson' && value) {
            try {
              if (typeof value === 'string' && value.trim() !== '') {
                product[header] = JSON.parse(value);
              } else {
                product[header] = [];
              }
            } catch (e) {
              product[header] = [];
            }
          } else if (header === 'isPublic' || header === 'isNew' || header === 'isPromo') {
            product[header] = value === true || value === 'TRUE' || value === 'true' || value === 1 || value === '1';
          } else if (header === 'price' || header === 'stock' || header === 'ratingAvg' || 
                     header === 'ratingCount' || header === 'likesCount' || header === 'commentsCount') {
            product[header] = parseFloat(value) || 0;
          } else {
            product[header] = value || '';
          }
        });
        
        // Formater les URLs
        if (product.coverImageUrl && !product.coverImageUrl.startsWith('http') && product.coverImageUrl.length > 0) {
          product.coverImageUrl = 'https://drive.google.com/uc?export=view&id=' + product.coverImageUrl;
        }
        
        if (product.model3dUrl && !product.model3dUrl.startsWith('http') && product.model3dUrl.length > 0) {
          product.model3dUrl = 'https://drive.google.com/uc?export=view&id=' + product.model3dUrl;
        }
        
        if (product.videoUrl && !product.videoUrl.startsWith('http') && product.videoUrl.length > 0) {
          product.videoUrl = 'https://drive.google.com/uc?export=view&id=' + product.videoUrl;
        }
        
        if (!product.imagesJson || !Array.isArray(product.imagesJson)) {
          product.imagesJson = product.coverImageUrl ? [product.coverImageUrl] : [];
        }
        
        return { product: product };
      }
    }
    
    return { error: 'Produit non trouvé' };
  } catch (error) {
    Logger.log('Erreur getProduct: ' + error.toString());
    throw error;
  }
}

// ============================================
// COMMENTAIRES (avec threading professionnel)
// ============================================
function getComments(productId, limit = 50) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.COMMENTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return { comments: [], totalCount: 0 };
    }
    
    const headers = data[0];
    const productIdColIndex = headers.indexOf('productId');
    const statusColIndex = headers.indexOf('status');
    
    if (productIdColIndex === -1) {
      throw new Error('Colonne "productId" non trouvée dans Comments');
    }
    
    let allComments = [];
    let commentsMap = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[productIdColIndex] || row[productIdColIndex].toString().trim() === '') continue;
      
      if (row[productIdColIndex] === productId) {
        const comment = {};
        headers.forEach((header, index) => {
          let value = row[index];
          if (header === 'likesCount') {
            comment[header] = parseFloat(value) || 0;
          } else {
            comment[header] = value || '';
          }
        });
        
        // Uniquement les commentaires approuvés
        if (comment.status === 'approved' || comment.status === '') {
          comment.replies = [];
          commentsMap[comment.id] = comment;
          allComments.push(comment);
        }
      }
    }
    
    // Organiser en threads
    let rootComments = [];
    
    allComments.forEach(comment => {
      if (!comment.parentId || comment.parentId.toString().trim() === '') {
        rootComments.push(comment);
      } else {
        const parent = commentsMap[comment.parentId];
        if (parent) {
          parent.replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      }
    });
    
    // Trier
    rootComments.sort((a, b) => {
      try {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });
    
    rootComments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => {
          try {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateA - dateB;
          } catch (e) {
            return 0;
          }
        });
      }
    });
    
    return { 
      comments: rootComments.slice(0, limit),
      totalCount: allComments.length
    };
  } catch (error) {
    Logger.log('Erreur getComments: ' + error.toString());
    throw error;
  }
}

function addComment(body) {
  try {
    // Validation
    if (!body.productId || !body.content || body.content.toString().trim().length === 0) {
      return { error: 'Données invalides: productId et content requis' };
    }
    
    if (body.content.length > 1000) {
      return { error: 'Commentaire trop long (max 1000 caractères)' };
    }
    
    // Filtre mots interdits basique
    const forbiddenWords = ['spam', 'scam', 'arnaque'];
    const contentLower = body.content.toLowerCase();
    for (let word of forbiddenWords) {
      if (contentLower.includes(word)) {
        return { error: 'Commentaire contenant des mots interdits' };
      }
    }
    
    const sheet = getSheet(CONFIG.SHEETS.COMMENTS);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const comment = {
      id: generateId('COMM'),
      productId: body.productId,
      userId: body.userId || 'anonymous',
      userName: body.userName || 'Utilisateur',
      content: body.content.toString().trim(),
      parentId: body.parentId || '',
      likesCount: 0,
      status: 'pending', // Nécessite modération
      createdAt: new Date().toISOString()
    };
    
    // Construire la ligne selon les colonnes
    const row = headers.map(header => {
      if (comment[header] !== undefined) {
        return comment[header];
      }
      return '';
    });
    
    sheet.appendRow(row);
    
    // Mettre à jour le compteur de commentaires
    updateProductCommentsCount(body.productId);
    
    return { 
      success: true, 
      comment: comment, 
      message: 'Commentaire en attente de modération' 
    };
  } catch (error) {
    Logger.log('Erreur addComment: ' + error.toString());
    throw error;
  }
}

function updateProductCommentsCount(productId) {
  try {
    const commentsSheet = getSheet(CONFIG.SHEETS.COMMENTS);
    const productsSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    
    const commentsData = commentsSheet.getDataRange().getValues();
    const commentsHeaders = commentsData[0];
    const productIdColIndex = commentsHeaders.indexOf('productId');
    const statusColIndex = commentsHeaders.indexOf('status');
    
    let count = 0;
    for (let i = 1; i < commentsData.length; i++) {
      if (commentsData[i][productIdColIndex] === productId && 
          (commentsData[i][statusColIndex] === 'approved' || commentsData[i][statusColIndex] === '')) {
        count++;
      }
    }
    
    // Mettre à jour dans Products
    const productsData = productsSheet.getDataRange().getValues();
    const productsHeaders = productsData[0];
    const idColIndex = productsHeaders.indexOf('id');
    const commentsColIndex = productsHeaders.indexOf('commentsCount');
    
    if (idColIndex === -1 || commentsColIndex === -1) {
      Logger.log('Colonnes non trouvées pour mise à jour commentsCount');
      return;
    }
    
    for (let i = 1; i < productsData.length; i++) {
      if (productsData[i][idColIndex] === productId) {
        productsSheet.getRange(i + 1, commentsColIndex + 1).setValue(count);
        break;
      }
    }
  } catch (error) {
    Logger.log('Erreur updateProductCommentsCount: ' + error.toString());
  }
}

// ============================================
// LIKES
// ============================================
function likeProduct(productId, userId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PRODUCT_LIKES);
    const data = sheet.getDataRange().getValues();
    
    const productIdColIndex = data[0] ? data[0].indexOf('productId') : 1;
    const userIdColIndex = data[0] ? data[0].indexOf('userId') : 2;
    
    // Vérifier si le like existe déjà
    for (let i = 1; i < data.length; i++) {
      if (data[i][productIdColIndex] === productId && data[i][userIdColIndex] === userId) {
        return { success: false, message: 'Déjà liké' };
      }
    }
    
    // Ajouter le like
    const like = {
      id: generateId('LIKE'),
      productId: productId,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString()
    };
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => like[header] || '');
    sheet.appendRow(row);
    
    // Mettre à jour le compteur
    updateProductLikesCount(productId);
    
    return { success: true, like: like };
  } catch (error) {
    Logger.log('Erreur likeProduct: ' + error.toString());
    throw error;
  }
}

function unlikeProduct(productId, userId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PRODUCT_LIKES);
    const data = sheet.getDataRange().getValues();
    
    const productIdColIndex = data[0] ? data[0].indexOf('productId') : 1;
    const userIdColIndex = data[0] ? data[0].indexOf('userId') : 2;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][productIdColIndex] === productId && data[i][userIdColIndex] === userId) {
        sheet.deleteRow(i + 1);
        updateProductLikesCount(productId);
        return { success: true };
      }
    }
    
    return { success: false, message: 'Like non trouvé' };
  } catch (error) {
    Logger.log('Erreur unlikeProduct: ' + error.toString());
    throw error;
  }
}

function updateProductLikesCount(productId) {
  try {
    const likesSheet = getSheet(CONFIG.SHEETS.PRODUCT_LIKES);
    const productsSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    
    const likesData = likesSheet.getDataRange().getValues();
    const productIdColIndex = likesData[0] ? likesData[0].indexOf('productId') : 1;
    
    let count = 0;
    for (let i = 1; i < likesData.length; i++) {
      if (likesData[i][productIdColIndex] === productId) {
        count++;
      }
    }
    
    const productsData = productsSheet.getDataRange().getValues();
    const productsHeaders = productsData[0];
    const idColIndex = productsHeaders.indexOf('id');
    const likesColIndex = productsHeaders.indexOf('likesCount');
    
    if (idColIndex === -1 || likesColIndex === -1) {
      Logger.log('Colonnes non trouvées pour mise à jour likesCount');
      return;
    }
    
    for (let i = 1; i < productsData.length; i++) {
      if (productsData[i][idColIndex] === productId) {
        productsSheet.getRange(i + 1, likesColIndex + 1).setValue(count);
        break;
      }
    }
  } catch (error) {
    Logger.log('Erreur updateProductLikesCount: ' + error.toString());
  }
}

// ============================================
// AVIS
// ============================================
function getReviews(productId, limit = 50) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.REVIEWS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return { reviews: [], totalCount: 0, averageRating: 0 };
    }
    
    const headers = data[0];
    const productIdColIndex = headers.indexOf('productId');
    const statusColIndex = headers.indexOf('status');
    
    if (productIdColIndex === -1) {
      throw new Error('Colonne "productId" non trouvée dans Reviews');
    }
    
    let reviews = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[productIdColIndex] || row[productIdColIndex].toString().trim() === '') continue;
      
      if (row[productIdColIndex] === productId) {
        const review = {};
        headers.forEach((header, index) => {
          let value = row[index];
          if (header === 'rating') {
            review[header] = parseFloat(value) || 0;
          } else {
            review[header] = value || '';
          }
        });
        
        if (review.status === 'approved' || review.status === '') {
          reviews.push(review);
        }
      }
    }
    
    // Trier
    reviews.sort((a, b) => {
      try {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        if (dateB.getTime() === dateA.getTime()) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });
    
    const averageRating = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;
    
    return { 
      reviews: reviews.slice(0, limit),
      totalCount: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10
    };
  } catch (error) {
    Logger.log('Erreur getReviews: ' + error.toString());
    throw error;
  }
}

function addReview(body) {
  try {
    // Validation
    if (!body.productId || !body.rating || !body.content) {
      return { error: 'Données invalides: productId, rating et content requis' };
    }
    
    const rating = parseFloat(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { error: 'Note invalide (doit être entre 1 et 5)' };
    }
    
    if (body.content.toString().trim().length === 0) {
      return { error: 'Le contenu de l\'avis est requis' };
    }
    
    if (body.content.length > 2000) {
      return { error: 'Avis trop long (max 2000 caractères)' };
    }
    
    const sheet = getSheet(CONFIG.SHEETS.REVIEWS);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const review = {
      id: generateId('REV'),
      productId: body.productId,
      userId: body.userId || 'anonymous',
      userName: body.userName || 'Utilisateur',
      rating: rating,
      content: body.content.toString().trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const row = headers.map(header => {
      if (review[header] !== undefined) {
        return review[header];
      }
      return '';
    });
    
    sheet.appendRow(row);
    
    // Mettre à jour la note moyenne
    updateProductRating(review.productId);
    
    return { 
      success: true, 
      review: review, 
      message: 'Avis en attente de modération' 
    };
  } catch (error) {
    Logger.log('Erreur addReview: ' + error.toString());
    throw error;
  }
}

function updateProductRating(productId) {
  try {
    const reviewsSheet = getSheet(CONFIG.SHEETS.REVIEWS);
    const productsSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    
    const reviewsData = reviewsSheet.getDataRange().getValues();
    const reviewsHeaders = reviewsData[0];
    const productIdColIndex = reviewsHeaders.indexOf('productId');
    const statusColIndex = reviewsHeaders.indexOf('status');
    const ratingColIndex = reviewsHeaders.indexOf('rating');
    
    let totalRating = 0;
    let count = 0;
    
    for (let i = 1; i < reviewsData.length; i++) {
      if (reviewsData[i][productIdColIndex] === productId && 
          (reviewsData[i][statusColIndex] === 'approved' || reviewsData[i][statusColIndex] === '')) {
        totalRating += parseFloat(reviewsData[i][ratingColIndex]) || 0;
        count++;
      }
    }
    
    const avgRating = count > 0 ? totalRating / count : 0;
    
    const productsData = productsSheet.getDataRange().getValues();
    const productsHeaders = productsData[0];
    const idColIndex = productsHeaders.indexOf('id');
    const ratingAvgColIndex = productsHeaders.indexOf('ratingAvg');
    const ratingCountColIndex = productsHeaders.indexOf('ratingCount');
    
    if (idColIndex === -1) {
      Logger.log('Colonne "id" non trouvée dans Products');
      return;
    }
    
    for (let i = 1; i < productsData.length; i++) {
      if (productsData[i][idColIndex] === productId) {
        if (ratingAvgColIndex >= 0) {
          productsSheet.getRange(i + 1, ratingAvgColIndex + 1).setValue(Math.round(avgRating * 10) / 10);
        }
        if (ratingCountColIndex >= 0) {
          productsSheet.getRange(i + 1, ratingCountColIndex + 1).setValue(count);
        }
        break;
      }
    }
  } catch (error) {
    Logger.log('Erreur updateProductRating: ' + error.toString());
  }
}

// ============================================
// VIDÉOS
// ============================================
function getVideos(limit = 20, cursor = null) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.VIDEOS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return { videos: [], hasMore: false, cursor: null };
    }
    
    const headers = data[0];
    let videos = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] || row[0].toString().trim() === '') continue;
      
      const video = {};
      headers.forEach((header, index) => {
        let value = row[index];
        if (header === 'likesCount' || header === 'commentsCount' || header === 'viewsCount') {
          video[header] = parseFloat(value) || 0;
        } else {
          video[header] = value || '';
        }
      });
      
      // Formater les URLs
      if (video.videoUrl && !video.videoUrl.startsWith('http') && video.videoUrl.length > 0) {
        video.videoUrl = 'https://drive.google.com/uc?export=view&id=' + video.videoUrl;
      }
      
      if (video.coverUrl && !video.coverUrl.startsWith('http') && video.coverUrl.length > 0) {
        video.coverUrl = 'https://drive.google.com/uc?export=view&id=' + video.coverUrl;
      }
      
      videos.push(video);
    }
    
    // Trier par date
    videos.sort((a, b) => {
      try {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });
    
    const limitNum = parseInt(limit) || 20;
    const limitedVideos = videos.slice(0, limitNum);
    
    return {
      videos: limitedVideos,
      hasMore: videos.length > limitNum,
      cursor: limitedVideos.length > 0 ? limitedVideos[limitedVideos.length - 1].id : null
    };
  } catch (error) {
    Logger.log('Erreur getVideos: ' + error.toString());
    throw error;
  }
}

// ============================================
// IA - Assistant basé sur mots-clés
// ============================================
function askAI(question, userId) {
  try {
    const kbSheet = getSheet(CONFIG.SHEETS.AI_KB);
    const logsSheet = getSheet(CONFIG.SHEETS.AI_LOGS);
    
    const data = kbSheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return {
        answer: 'Base de connaissances vide. Contactez le support.',
        intent: 'none',
        confidence: 0
      };
    }
    
    const headers = data[0];
    const questionLower = question.toLowerCase();
    const questionWords = questionLower.split(/\s+/);
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] || row[0].toString().trim() === '') continue;
      
      const kb = {};
      headers.forEach((header, index) => {
        kb[header] = row[index] || '';
      });
      
      const keywords = (kb.keywords || '').toLowerCase().split(',').map(k => k.trim());
      
      let score = 0;
      keywords.forEach(keyword => {
        if (questionWords.some(word => word.includes(keyword) || keyword.includes(word))) {
          score++;
        }
      });
      
      const priority = parseFloat(kb.priority) || 0;
      score = score + (priority * 0.1);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = kb;
      }
    }
    
    // Log
    const logHeaders = logsSheet.getRange(1, 1, 1, logsSheet.getLastColumn()).getValues()[0];
    const log = {
      id: generateId('LOG'),
      userId: userId || 'anonymous',
      question: question,
      matchedIntent: bestMatch ? bestMatch.intent : 'none',
      answerUsed: bestMatch ? bestMatch.answer_fr : 'Désolé, je ne comprends pas votre question.',
      createdAt: new Date().toISOString()
    };
    
    const logRow = logHeaders.map(header => log[header] || '');
    logsSheet.appendRow(logRow);
    
    if (bestMatch) {
      return {
        answer: bestMatch.answer_fr || bestMatch.answer_en || 'Réponse non disponible',
        intent: bestMatch.intent,
        confidence: Math.round(bestScore * 10) / 10
      };
    } else {
      return {
        answer: 'Désolé, je ne comprends pas votre question. Pouvez-vous reformuler ? Contactez-nous pour plus d\'aide.',
        intent: 'none',
        confidence: 0
      };
    }
  } catch (error) {
    Logger.log('Erreur askAI: ' + error.toString());
    return {
      answer: 'Erreur lors du traitement de votre question. Veuillez réessayer.',
      intent: 'error',
      confidence: 0
    };
  }
}

// ============================================
// GESTION STOCK
// ============================================
function updateProductStock(productId, newStock) {
  try {
    const productsSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
    const data = productsSheet.getDataRange().getValues();
    const headers = data[0];
    
    const idColIndex = headers.indexOf('id');
    const stockColIndex = headers.indexOf('stock');
    
    if (idColIndex === -1 || stockColIndex === -1) {
      return { error: 'Colonnes id ou stock non trouvées' };
    }
    
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
      return { error: 'Stock invalide' };
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIndex] === productId) {
        productsSheet.getRange(i + 1, stockColIndex + 1).setValue(stock);
        return { 
          success: true, 
          productId: productId, 
          stock: stock,
          message: 'Stock mis à jour avec succès'
        };
      }
    }
    
    return { error: 'Produit non trouvé' };
  } catch (error) {
    Logger.log('Erreur updateProductStock: ' + error.toString());
    throw error;
  }
}

// ============================================
// LIVRAISONS
// ============================================
function createDelivery(body) {
  try {
    // Validation
    if (!body.customer || !body.customer.address || !body.items || body.items.length === 0) {
      return { error: 'Données invalides: customer, address et items requis' };
    }
    
    const deliveriesSheet = getSheet(CONFIG.SHEETS.DELIVERIES);
    const headers = deliveriesSheet.getRange(1, 1, 1, deliveriesSheet.getLastColumn()).getValues()[0];
    
    const deliveryId = generateId('DELIV');
    const delivery = {
      id: deliveryId,
      customerName: body.customer.fullName || '',
      customerPhone: body.customer.phone || '',
      customerAddress: body.customer.address || '',
      customerLat: body.customer.coordinates ? body.customer.coordinates.lat : '',
      customerLng: body.customer.coordinates ? body.customer.coordinates.lng : '',
      items: JSON.stringify(body.items),
      subtotal: body.subtotal || 0,
      deliveryFee: body.deliveryFee || 0,
      total: body.total || 0,
      storeLat: body.storeLocation ? body.storeLocation.lat : '',
      storeLng: body.storeLocation ? body.storeLocation.lng : '',
      status: 'pending',
      driverId: '',
      driverName: '',
      driverPhone: '',
      driverVehicle: '',
      driverLocation: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const row = headers.map(header => {
      if (delivery[header] !== undefined) {
        return delivery[header];
      }
      return '';
    });
    
    deliveriesSheet.appendRow(row);
    
    return { 
      success: true, 
      delivery: delivery
    };
  } catch (error) {
    Logger.log('Erreur createDelivery: ' + error.toString());
    throw error;
  }
}

function getDelivery(deliveryId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.DELIVERIES);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return { error: 'Livraison non trouvée' };
    }
    
    const headers = data[0];
    const idColIndex = headers.indexOf('id');
    
    if (idColIndex === -1) {
      return { error: 'Colonne "id" non trouvée' };
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[idColIndex] === deliveryId) {
        const delivery = {};
        headers.forEach((header, index) => {
          let value = row[index];
          
          // Traitement spécial pour les champs JSON
          if (header === 'items' && value) {
            try {
              delivery[header] = JSON.parse(value);
            } catch (e) {
              delivery[header] = [];
            }
          } else if (header === 'driverLocation' && value) {
            try {
              delivery[header] = JSON.parse(value);
            } catch (e) {
              delivery[header] = null;
            }
          } else if (header === 'customerLat' || header === 'customerLng' || 
                     header === 'storeLat' || header === 'storeLng' ||
                     header === 'subtotal' || header === 'deliveryFee' || header === 'total') {
            delivery[header] = parseFloat(value) || 0;
          } else {
            delivery[header] = value || '';
          }
        });
        
        // Construire l'objet driver si disponible
        if (delivery.driverId) {
          delivery.driver = {
            id: delivery.driverId,
            name: delivery.driverName || '',
            phone: delivery.driverPhone || '',
            vehicle: delivery.driverVehicle || 'moto',
            location: delivery.driverLocation
          };
        }
        
        return { delivery: delivery };
      }
    }
    
    return { error: 'Livraison non trouvée' };
  } catch (error) {
    Logger.log('Erreur getDelivery: ' + error.toString());
    throw error;
  }
}

function updateDeliveryStatus(deliveryId, status, driverId = null, driverLocation = null) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.DELIVERIES);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return { error: 'Livraison non trouvée' };
    }
    
    const headers = data[0];
    const idColIndex = headers.indexOf('id');
    const statusColIndex = headers.indexOf('status');
    const updatedAtColIndex = headers.indexOf('updatedAt');
    
    if (idColIndex === -1 || statusColIndex === -1) {
      return { error: 'Colonnes requises non trouvées' };
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[idColIndex] === deliveryId) {
        // Mettre à jour le statut
        sheet.getRange(i + 1, statusColIndex + 1).setValue(status);
        
        // Mettre à jour la date de modification
        if (updatedAtColIndex !== -1) {
          sheet.getRange(i + 1, updatedAtColIndex + 1).setValue(new Date().toISOString());
        }
        
        // Si un driver est fourni, mettre à jour les infos du driver
        if (driverId) {
          const driverIdColIndex = headers.indexOf('driverId');
          if (driverIdColIndex !== -1) {
            sheet.getRange(i + 1, driverIdColIndex + 1).setValue(driverId);
            
            // Récupérer les infos du driver
            const driver = getDriverById(driverId);
            if (driver) {
              const driverNameColIndex = headers.indexOf('driverName');
              const driverPhoneColIndex = headers.indexOf('driverPhone');
              const driverVehicleColIndex = headers.indexOf('driverVehicle');
              
              if (driverNameColIndex !== -1) {
                sheet.getRange(i + 1, driverNameColIndex + 1).setValue(driver.name || '');
              }
              if (driverPhoneColIndex !== -1) {
                sheet.getRange(i + 1, driverPhoneColIndex + 1).setValue(driver.phone || '');
              }
              if (driverVehicleColIndex !== -1) {
                sheet.getRange(i + 1, driverVehicleColIndex + 1).setValue(driver.vehicle || 'moto');
              }
            }
          }
        }
        
        // Mettre à jour la position du driver
        if (driverLocation) {
          const driverLocationColIndex = headers.indexOf('driverLocation');
          if (driverLocationColIndex !== -1) {
            sheet.getRange(i + 1, driverLocationColIndex + 1).setValue(JSON.stringify(driverLocation));
          }
        }
        
        return { success: true, deliveryId: deliveryId, status: status };
      }
    }
    
    return { error: 'Livraison non trouvée' };
  } catch (error) {
    Logger.log('Erreur updateDeliveryStatus: ' + error.toString());
    throw error;
  }
}

function assignDriverToDelivery(deliveryId, driverId) {
  try {
    // Récupérer les infos du driver
    const driver = getDriverById(driverId);
    if (!driver) {
      return { error: 'Livreur non trouvé' };
    }
    
    // Mettre à jour la livraison
    return updateDeliveryStatus(deliveryId, 'assigned', driverId);
  } catch (error) {
    Logger.log('Erreur assignDriverToDelivery: ' + error.toString());
    throw error;
  }
}

function getDriverById(driverId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.DELIVERY_DRIVERS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return null;
    }
    
    const headers = data[0];
    const idColIndex = headers.indexOf('id');
    
    if (idColIndex === -1) {
      return null;
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[idColIndex] === driverId) {
        const driver = {};
        headers.forEach((header, index) => {
          if (header === 'rating') {
            driver[header] = parseFloat(row[index]) || 5.0;
          } else if (header === 'location' && row[index]) {
            try {
              driver[header] = JSON.parse(row[index]);
            } catch (e) {
              driver[header] = null;
            }
          } else {
            driver[header] = row[index] || '';
          }
        });
        return driver;
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Erreur getDriverById: ' + error.toString());
    return null;
  }
}