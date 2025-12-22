/**
 * Congo Promotion Store - Apps Script API
 * Backend REST API pour le store
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: '1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q', // ID Google Sheets
  SHEETS: {
    USERS: 'Users',
    PRODUCTS: 'Products',
    COMMENTS: 'Comments',
    PRODUCT_LIKES: 'ProductLikes',
    REVIEWS: 'Reviews',
    VIDEOS: 'Videos',
    AI_KB: 'AI_KB',
    AI_LOGS: 'AI_Logs'
  }
};

/**
 * Point d'entrée principal - Gère toutes les requêtes
 */
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
    
    // Log pour débogage (sécurisé)
    Logger.log('=== Nouvelle requête ===');
    Logger.log('Méthode: ' + method);
    Logger.log('Paramètres: ' + JSON.stringify(e.parameter || {}));
    if (e && e.postData && e.postData.contents) {
      Logger.log('POST Data: ' + e.postData.contents);
    }
    if (e && e.queryString) {
      Logger.log('Query String: ' + e.queryString);
    }
    
    // Vérifier l'accès au spreadsheet en premier (seulement pour les routes qui en ont besoin)
    // On va le faire de manière lazy pour éviter de bloquer toutes les requêtes
    
    // Lire la route de différentes manières (Apps Script peut varier)
    let route = null;
    
    // Méthode 1: e.parameter.route
    if (e.parameter && e.parameter.route) {
      route = e.parameter.route;
    }
    // Méthode 2: e.parameter['route']
    else if (e.parameter && e.parameter['route']) {
      route = e.parameter['route'];
    }
    // Méthode 3: queryString (pour les URLs directes)
    else if (e.queryString) {
      const params = e.queryString.split('&');
      for (let i = 0; i < params.length; i++) {
        const [key, value] = params[i].split('=');
        if (key === 'route') {
          route = decodeURIComponent(value);
          break;
        }
      }
    }
    
    Logger.log('Route détectée: ' + route);
    
    if (!route) {
      Logger.log('❌ Route manquante');
      return createResponse({ 
        error: 'Route manquante. Utilisez ?route=nom_route',
        receivedParams: e.parameter ? Object.keys(e.parameter) : [],
        hint: 'Exemples: ?route=products, ?route=product&id=PROD_123'
      }, 400);
    }

    let result;
    
    switch (route) {
      // Produits
      case 'products':
        result = getProducts(e.parameter);
        break;
      case 'product':
        result = getProduct(e.parameter.id);
        break;
      
      // Commentaires
      case 'comments':
        result = getComments(e.parameter.productId, e.parameter.limit);
        break;
      case 'comment':
        if (method === 'POST') {
          const body = JSON.parse(e.postData.contents);
          result = addComment(body);
        }
        break;
      
      // Likes
      case 'likeProduct':
        if (method === 'POST') {
          const body = JSON.parse(e.postData.contents);
          result = likeProduct(body.productId, body.userId);
        }
        break;
      case 'unlikeProduct':
        if (method === 'POST') {
          const body = JSON.parse(e.postData.contents);
          result = unlikeProduct(body.productId, body.userId);
        }
        break;
      
      // Avis
      case 'reviews':
        result = getReviews(e.parameter.productId, e.parameter.limit);
        break;
      case 'review':
        if (method === 'POST') {
          const body = JSON.parse(e.postData.contents);
          result = addReview(body);
        }
        break;
      
      // Vidéos
      case 'videos':
        result = getVideos(e.parameter.limit, e.parameter.cursor);
        break;
      
      // IA
      case 'aiAsk':
        if (method === 'POST') {
          const body = JSON.parse(e.postData.contents);
          result = askAI(body.question, body.userId);
        }
        break;
      
      default:
        return createResponse({ error: 'Route non trouvée' }, 404);
    }

    if (!result) {
      return createResponse({ error: 'Aucun résultat retourné pour la route: ' + route }, 500);
    }
    
    return createResponse(result);
  } catch (error) {
    Logger.log('Erreur handleRequest: ' + error.toString());
    Logger.log('Stack: ' + (error.stack || 'N/A'));
    
    // Message d'erreur plus détaillé
    let errorMessage = error.toString();
    if (errorMessage.includes('openById')) {
      errorMessage = 'Erreur d\'accès au Google Sheets. Exécutez la fonction testConnection() dans Apps Script pour autoriser les permissions.';
    }
    
    return createResponse({ 
      error: errorMessage,
      hint: 'Vérifiez les logs Apps Script pour plus de détails. Exécutez testConnection() pour tester la connexion.'
    }, 500);
  }
}

/**
 * Utilitaires - Réponse JSON
 */
function createResponse(data, statusCode = 200) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Headers CORS - Apps Script les gère automatiquement si déployé correctement
  // Mais on peut les ajouter explicitement pour plus de sécurité
  return output;
}

// Gestion des requêtes OPTIONS (preflight CORS)
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fonction de test pour vérifier la connexion au spreadsheet
 * ⚠️ IMPORTANT: EXÉCUTEZ CETTE FONCTION DANS L'ÉDITEUR APPS SCRIPT POUR AUTORISER LES PERMISSIONS
 * 
 * Instructions:
 * 1. Allez sur script.google.com
 * 2. Ouvrez votre projet
 * 3. Sélectionnez "testConnection" dans le menu déroulant
 * 4. Cliquez sur ▶️ Exécuter
 * 5. Autorisez les permissions quand Google le demande
 */
function testConnection() {
  try {
    Logger.log('🔍 Test de connexion au spreadsheet...');
    Logger.log('📋 SPREADSHEET_ID: ' + CONFIG.SPREADSHEET_ID);
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    if (!ss) {
      Logger.log('❌ Impossible d\'ouvrir le spreadsheet');
      return '❌ Erreur: Impossible d\'ouvrir le spreadsheet';
    }
    
    Logger.log('✅ Spreadsheet ouvert avec succès: ' + ss.getName());
    
    // Tester l'accès aux onglets
    const sheets = CONFIG.SHEETS;
    const missingSheets = [];
    const foundSheets = [];
    
    for (const sheetName in sheets) {
      const sheet = ss.getSheetByName(sheets[sheetName]);
      if (!sheet) {
        missingSheets.push(sheets[sheetName]);
        Logger.log('⚠️ Onglet manquant: ' + sheets[sheetName]);
      } else {
        const rowCount = sheet.getLastRow();
        foundSheets.push(sheets[sheetName] + ' (' + rowCount + ' lignes)');
        Logger.log('✅ Onglet trouvé: ' + sheets[sheetName] + ' - ' + rowCount + ' lignes');
      }
    }
    
    let result = '✅ Connexion réussie !\n\n';
    result += 'Onglets trouvés:\n';
    foundSheets.forEach(s => result += '  • ' + s + '\n');
    
    if (missingSheets.length > 0) {
      result += '\n⚠️ Onglets manquants:\n';
      missingSheets.forEach(s => result += '  • ' + s + '\n');
      result += '\nCréez ces onglets dans votre Google Sheets.';
    }
    
    return result;
  } catch (error) {
    Logger.log('❌ Erreur: ' + error.toString());
    Logger.log('Stack: ' + (error.stack || 'N/A'));
    
    let errorMsg = '❌ Erreur: ' + error.toString();
    errorMsg += '\n\nVérifiez que:';
    errorMsg += '\n1. Le spreadsheet existe à l\'ID: ' + CONFIG.SPREADSHEET_ID;
    errorMsg += '\n2. Vous avez les permissions d\'accès';
    errorMsg += '\n3. L\'ID est correct';
    errorMsg += '\n4. Vous avez autorisé les permissions Apps Script';
    
    return errorMsg;
  }
}

/**
 * Fonction de test pour vérifier la connexion au spreadsheet
 * EXÉCUTEZ CETTE FONCTION DANS L'ÉDITEUR APPS SCRIPT POUR AUTORISER LES PERMISSIONS
 */
function testConnection() {
  try {
    Logger.log('Test de connexion au spreadsheet...');
    Logger.log('SPREADSHEET_ID: ' + CONFIG.SPREADSHEET_ID);
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    if (!ss) {
      Logger.log('❌ Impossible d\'ouvrir le spreadsheet');
      return '❌ Erreur: Impossible d\'ouvrir le spreadsheet';
    }
    
    Logger.log('✅ Spreadsheet ouvert avec succès');
    
    // Tester l'accès aux onglets
    const sheets = CONFIG.SHEETS;
    const missingSheets = [];
    
    for (const sheetName in sheets) {
      const sheet = ss.getSheetByName(sheets[sheetName]);
      if (!sheet) {
        missingSheets.push(sheets[sheetName]);
        Logger.log('⚠️ Onglet manquant: ' + sheets[sheetName]);
      } else {
        Logger.log('✅ Onglet trouvé: ' + sheets[sheetName] + ' (' + sheet.getLastRow() + ' lignes)');
      }
    }
    
    if (missingSheets.length > 0) {
      return '⚠️ Attention: Onglets manquants: ' + missingSheets.join(', ');
    }
    
    return '✅ Connexion réussie ! Tous les onglets sont présents.';
  } catch (error) {
    Logger.log('❌ Erreur: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return '❌ Erreur: ' + error.toString() + '\n\nVérifiez que:\n1. Le spreadsheet existe\n2. Vous avez les permissions\n3. L\'ID est correct';
  }
}

/**
 * Utilitaires - Obtenir le spreadsheet
 */
function getSpreadsheet() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    if (!ss) {
      throw new Error('Impossible d\'ouvrir le spreadsheet. Vérifiez l\'ID et les permissions.');
    }
    return ss;
  } catch (error) {
    Logger.log('Erreur getSpreadsheet: ' + error.toString());
    throw new Error('Erreur d\'accès au Google Sheets. Vérifiez que le spreadsheet existe et que vous avez les permissions. ID: ' + CONFIG.SPREADSHEET_ID);
  }
}

/**
 * Utilitaires - Obtenir une feuille
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Feuille ' + sheetName + ' non trouvée');
  }
  return sheet;
}

/**
 * Utilitaires - Générer un ID unique
 */
function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * PRODUITS
 */
function getProducts(params) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let products = [];
  
  // Parcourir les lignes (sauf l'en-tête)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const product = {};
    
    headers.forEach((header, index) => {
      let value = row[index];
      
      // Traitement spécial pour certains champs
      if (header === 'imagesJson' && value) {
        // Si c'est une chaîne JSON, essayer de la parser
        try {
          if (typeof value === 'string') {
            product[header] = JSON.parse(value);
          } else {
            product[header] = value;
          }
        } catch (e) {
          // Si ce n'est pas du JSON valide, garder comme string
          product[header] = value;
        }
      } else if (header === 'isPublic' || header === 'isNew' || header === 'isPromo') {
        // Convertir les booléens
        product[header] = value === true || value === 'TRUE' || value === 'true' || value === 1;
      } else if (header === 'price' || header === 'stock' || header === 'ratingAvg' || 
                 header === 'ratingCount' || header === 'likesCount' || header === 'commentsCount') {
        // Convertir les nombres
        product[header] = parseFloat(value) || 0;
      } else {
        product[header] = value;
      }
    });
    
    // Filtrer les produits publics uniquement
    if (product.isPublic === true || product.isPublic === 'TRUE') {
      // S'assurer que les URLs sont bien formatées
      if (product.coverImageUrl && !product.coverImageUrl.startsWith('http')) {
        // Si c'est juste un ID Google Drive, construire l'URL
        product.coverImageUrl = 'https://drive.google.com/uc?export=view&id=' + product.coverImageUrl;
      }
      
      // Traiter imagesJson si c'est un tableau
      if (product.imagesJson && typeof product.imagesJson === 'string') {
        try {
          product.imagesJson = JSON.parse(product.imagesJson);
        } catch (e) {
          product.imagesJson = [];
        }
      }
      
      // S'assurer que model3dUrl et videoUrl sont bien formatées
      if (product.model3dUrl && !product.model3dUrl.startsWith('http') && product.model3dUrl.length > 0) {
        product.model3dUrl = 'https://drive.google.com/uc?export=view&id=' + product.model3dUrl;
      }
      if (product.videoUrl && !product.videoUrl.startsWith('http') && product.videoUrl.length > 0) {
        product.videoUrl = 'https://drive.google.com/uc?export=view&id=' + product.videoUrl;
      }
      
      products.push(product);
    }
  }
  
  // Recherche par texte si fournie
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm))
    );
  }
  
  // Appliquer les filtres
  const filter = params.filter;
  if (filter === 'new') {
    // Produits créés dans les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    products = products.filter(p => {
      if (!p.createdAt) return false;
      const createdDate = new Date(p.createdAt);
      return createdDate > thirtyDaysAgo;
    });
  } else if (filter === 'promo') {
    products = products.filter(p => p.isPromo === true || p.isPromo === 'TRUE');
  } else if (filter === 'trending') {
    // Trier par likes + comments
    products.sort((a, b) => {
      const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) + (a.ratingCount || 0);
      const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) + (b.ratingCount || 0);
      return scoreB - scoreA;
    });
  }
  
  // Trier par date par défaut (plus récent en premier)
  products.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });
  
  // Limiter les résultats
  const limit = parseInt(params.limit) || 20;
  products = products.slice(0, limit);
  
  return {
    products: products,
    hasMore: products.length >= limit,
    cursor: products.length > 0 ? products[products.length - 1].id : null
  };
}

function getProduct(id) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === id) { // ID en première colonne
      const product = {};
      headers.forEach((header, index) => {
        let value = row[index];
        
        // Traitement spécial pour certains champs
        if (header === 'imagesJson' && value) {
          try {
            if (typeof value === 'string') {
              product[header] = JSON.parse(value);
            } else {
              product[header] = value;
            }
          } catch (e) {
            product[header] = [];
          }
        } else if (header === 'isPublic' || header === 'isNew' || header === 'isPromo') {
          product[header] = value === true || value === 'TRUE' || value === 'true' || value === 1;
        } else if (header === 'price' || header === 'stock' || header === 'ratingAvg' || 
                   header === 'ratingCount' || header === 'likesCount' || header === 'commentsCount') {
          product[header] = parseFloat(value) || 0;
        } else {
          product[header] = value;
        }
      });
      
      // Formater les URLs
      if (product.coverImageUrl && !product.coverImageUrl.startsWith('http')) {
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
      
      return { product: product };
    }
  }
  
  return { error: 'Produit non trouvé' };
}

/**
 * COMMENTAIRES - Version professionnelle avec threading
 */
function getComments(productId, limit = 50) {
  const sheet = getSheet(CONFIG.SHEETS.COMMENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let allComments = [];
  let commentsMap = {};
  
  // Récupérer tous les commentaires du produit
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const productIdIndex = headers.indexOf('productId');
    if (row[productIdIndex] === productId) {
      const comment = {};
      headers.forEach((header, index) => {
        let value = row[index];
        
        // Traitement des types
        if (header === 'likesCount') {
          comment[header] = parseFloat(value) || 0;
        } else {
          comment[header] = value;
        }
      });
      
      // Uniquement les commentaires approuvés
      if (comment.status === 'approved') {
        comment.replies = []; // Initialiser le tableau de réponses
        commentsMap[comment.id] = comment;
        allComments.push(comment);
      }
    }
  }
  
  // Organiser les commentaires en threads (commentaires parents et réponses)
  let rootComments = [];
  
  allComments.forEach(comment => {
    if (!comment.parentId || comment.parentId === '') {
      // Commentaire racine (pas de parent)
      rootComments.push(comment);
    } else {
      // Réponse à un commentaire
      const parent = commentsMap[comment.parentId];
      if (parent) {
        parent.replies.push(comment);
      } else {
        // Parent non trouvé, traiter comme commentaire racine
        rootComments.push(comment);
      }
    }
  });
  
  // Trier les commentaires racine par date (plus récent en premier)
  rootComments.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });
  
  // Trier les réponses de chaque commentaire
  rootComments.forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB; // Réponses dans l'ordre chronologique
      });
    }
  });
  
  // Limiter le nombre de commentaires racine
  const limitNum = parseInt(limit) || 50;
  rootComments = rootComments.slice(0, limitNum);
  
  return { 
    comments: rootComments,
    totalCount: allComments.length
  };
}

function addComment(body) {
  const sheet = getSheet(CONFIG.SHEETS.COMMENTS);
  
  // Validation
  if (!body.productId || !body.content || body.content.trim().length === 0) {
    return { error: 'Données invalides' };
  }
  
  // Vérifier la longueur du commentaire
  if (body.content.length > 1000) {
    return { error: 'Commentaire trop long (max 1000 caractères)' };
  }
  
  // Filtrer les mots interdits (basique)
  const forbiddenWords = ['spam', 'scam']; // À étendre
  const contentLower = body.content.toLowerCase();
  for (let word of forbiddenWords) {
    if (contentLower.includes(word)) {
      return { error: 'Commentaire contenant des mots interdits' };
    }
  }
  
  const comment = {
    id: generateId('COMM'),
    productId: body.productId,
    userId: body.userId || 'anonymous',
    userName: body.userName || 'Utilisateur', // Ajout du nom d'utilisateur
    content: body.content.trim(),
    parentId: body.parentId || '',
    likesCount: 0,
    status: 'pending', // Nécessite modération
    createdAt: new Date().toISOString()
  };
  
  // Ajouter la ligne
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => {
    if (comment[header] !== undefined) {
      return comment[header];
    }
    return '';
  });
  sheet.appendRow(row);
  
  // Mettre à jour le compteur de commentaires du produit
  updateProductCommentsCount(body.productId);
  
  return { success: true, comment: comment, message: 'Commentaire en attente de modération' };
}

function updateProductCommentsCount(productId) {
  const commentsSheet = getSheet(CONFIG.SHEETS.COMMENTS);
  const productsSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  
  // Compter les commentaires approuvés
  const commentsData = commentsSheet.getDataRange().getValues();
  const productIdColIndex = commentsSheet.getRange(1, 1, 1, commentsSheet.getLastColumn()).getValues()[0].indexOf('productId');
  const statusColIndex = commentsSheet.getRange(1, 1, 1, commentsSheet.getLastColumn()).getValues()[0].indexOf('status');
  
  let count = 0;
  for (let i = 1; i < commentsData.length; i++) {
    if (commentsData[i][productIdColIndex] === productId && 
        commentsData[i][statusColIndex] === 'approved') {
      count++;
    }
  }
  
  // Mettre à jour dans Products
  const productsData = productsSheet.getDataRange().getValues();
  const idColIndex = 0;
  const commentsColIndex = productsData[0].indexOf('commentsCount');
  
  for (let i = 1; i < productsData.length; i++) {
    if (productsData[i][idColIndex] === productId) {
      if (commentsColIndex >= 0) {
        productsSheet.getRange(i + 1, commentsColIndex + 1).setValue(count);
      }
      break;
    }
  }
}

/**
 * LIKES
 */
function likeProduct(productId, userId) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCT_LIKES);
  const data = sheet.getDataRange().getValues();
  
  // Vérifier si le like existe déjà
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === productId && data[i][2] === userId) {
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
  
  sheet.appendRow([like.id, like.productId, like.userId, like.createdAt]);
  
  // Mettre à jour le compteur de likes du produit
  updateProductLikesCount(productId);
  
  return { success: true, like: like };
}

function unlikeProduct(productId, userId) {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCT_LIKES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === productId && data[i][2] === userId) {
      sheet.deleteRow(i + 1);
      updateProductLikesCount(productId);
      return { success: true };
    }
  }
  
  return { success: false, message: 'Like non trouvé' };
}

function updateProductLikesCount(productId) {
  const likesSheet = getSheet(CONFIG.SHEETS.PRODUCT_LIKES);
  const productsSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  
  // Compter les likes
  const likesData = likesSheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < likesData.length; i++) {
    if (likesData[i][1] === productId) {
      count++;
    }
  }
  
  // Mettre à jour dans Products
  const productsData = productsSheet.getDataRange().getValues();
  const idColIndex = 0; // Colonne ID
  const likesColIndex = productsData[0].indexOf('likesCount');
  
  for (let i = 1; i < productsData.length; i++) {
    if (productsData[i][idColIndex] === productId) {
      productsSheet.getRange(i + 1, likesColIndex + 1).setValue(count);
      break;
    }
  }
}

/**
 * AVIS
 */
function getReviews(productId, limit = 50) {
  const sheet = getSheet(CONFIG.SHEETS.REVIEWS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let reviews = [];
  const productIdIndex = headers.indexOf('productId');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[productIdIndex] === productId) {
      const review = {};
      headers.forEach((header, index) => {
        let value = row[index];
        
        // Traitement des types
        if (header === 'rating') {
          review[header] = parseFloat(value) || 0;
        } else {
          review[header] = value;
        }
      });
      
      // Uniquement les avis approuvés
      if (review.status === 'approved') {
        reviews.push(review);
      }
    }
  }
  
  // Trier par date (plus récent en premier), puis par note (plus haute en premier)
  reviews.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    
    // Si même date, trier par note
    if (dateB.getTime() === dateA.getTime()) {
      return (b.rating || 0) - (a.rating || 0);
    }
    
    return dateB - dateA;
  });
  
  return { 
    reviews: reviews.slice(0, parseInt(limit)),
    totalCount: reviews.length,
    averageRating: reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0
  };
}

function addReview(body) {
  const sheet = getSheet(CONFIG.SHEETS.REVIEWS);
  
  // Validation
  if (!body.productId || !body.rating || !body.content) {
    return { error: 'Données invalides' };
  }
  
  const rating = parseFloat(body.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'Note invalide (doit être entre 1 et 5)' };
  }
  
  if (body.content.trim().length === 0) {
    return { error: 'Le contenu de l\'avis est requis' };
  }
  
  if (body.content.length > 2000) {
    return { error: 'Avis trop long (max 2000 caractères)' };
  }
  
  const review = {
    id: generateId('REV'),
    productId: body.productId,
    userId: body.userId || 'anonymous',
    userName: body.userName || 'Utilisateur', // Ajout du nom d'utilisateur
    rating: rating,
    content: body.content.trim(),
    status: 'pending', // Nécessite modération
    createdAt: new Date().toISOString()
  };
  
  // Ajouter la ligne
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => {
    if (review[header] !== undefined) {
      return review[header];
    }
    return '';
  });
  sheet.appendRow(row);
  
  // Mettre à jour la note moyenne du produit
  updateProductRating(review.productId);
  
  return { success: true, review: review, message: 'Avis en attente de modération' };
}

function updateProductRating(productId) {
  const reviewsSheet = getSheet(CONFIG.SHEETS.REVIEWS);
  const productsSheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  
  // Calculer la moyenne des notes approuvées
  const reviewsData = reviewsSheet.getDataRange().getValues();
  let totalRating = 0;
  let count = 0;
  
  for (let i = 1; i < reviewsData.length; i++) {
    if (reviewsData[i][1] === productId && reviewsData[i][5] === 'approved') {
      totalRating += parseFloat(reviewsData[i][3]) || 0;
      count++;
    }
  }
  
  const avgRating = count > 0 ? totalRating / count : 0;
  
  // Mettre à jour dans Products
  const productsData = productsSheet.getDataRange().getValues();
  const idColIndex = 0;
  const ratingAvgColIndex = productsData[0].indexOf('ratingAvg');
  const ratingCountColIndex = productsData[0].indexOf('ratingCount');
  
  for (let i = 1; i < productsData.length; i++) {
    if (productsData[i][idColIndex] === productId) {
      if (ratingAvgColIndex >= 0) {
        productsSheet.getRange(i + 1, ratingAvgColIndex + 1).setValue(avgRating);
      }
      if (ratingCountColIndex >= 0) {
        productsSheet.getRange(i + 1, ratingCountColIndex + 1).setValue(count);
      }
      break;
    }
  }
}

/**
 * VIDEOS
 */
function getVideos(limit = 20, cursor = null) {
  const sheet = getSheet(CONFIG.SHEETS.VIDEOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let videos = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const video = {};
    headers.forEach((header, index) => {
      let value = row[index];
      
      // Traitement des types
      if (header === 'likesCount' || header === 'commentsCount' || header === 'viewsCount') {
        video[header] = parseFloat(value) || 0;
      } else {
        video[header] = value;
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
  
  // Trier par date (plus récent en premier)
  videos.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });
  
  // Limiter
  const limitNum = parseInt(limit) || 20;
  videos = videos.slice(0, limitNum);
  
  return {
    videos: videos,
    hasMore: videos.length >= limitNum,
    cursor: videos.length > 0 ? videos[videos.length - 1].id : null
  };
}

/**
 * IA - Assistant basé sur mots-clés
 */
function askAI(question, userId) {
  const kbSheet = getSheet(CONFIG.SHEETS.AI_KB);
  const logsSheet = getSheet(CONFIG.SHEETS.AI_LOGS);
  
  const data = kbSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Normaliser la question
  const questionLower = question.toLowerCase();
  const questionWords = questionLower.split(/\s+/);
  
  let bestMatch = null;
  let bestScore = 0;
  
  // Parcourir la base de connaissances
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const kb = {};
    headers.forEach((header, index) => {
      kb[header] = row[index];
    });
    
    // Extraire les mots-clés
    const keywords = (kb.keywords || '').toLowerCase().split(',').map(k => k.trim());
    
    // Calculer le score (nombre de mots-clés trouvés)
    let score = 0;
    keywords.forEach(keyword => {
      if (questionWords.some(word => word.includes(keyword) || keyword.includes(word))) {
        score++;
      }
    });
    
    // Prendre en compte la priorité
    const priority = parseFloat(kb.priority) || 0;
    score = score + (priority * 0.1);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = kb;
    }
  }
  
  // Log de la question
  const log = {
    id: generateId('LOG'),
    userId: userId || 'anonymous',
    question: question,
    matchedIntent: bestMatch ? bestMatch.intent : 'none',
    answerUsed: bestMatch ? bestMatch.answer_fr : 'Désolé, je ne comprends pas votre question.',
    createdAt: new Date().toISOString()
  };
  
  const logHeaders = logsSheet.getRange(1, 1, 1, logsSheet.getLastColumn()).getValues()[0];
  const logRow = logHeaders.map(header => log[header] || '');
  logsSheet.appendRow(logRow);
  
  // Retourner la réponse
  if (bestMatch) {
    return {
      answer: bestMatch.answer_fr,
      intent: bestMatch.intent,
      confidence: bestScore
    };
  } else {
    return {
      answer: 'Désolé, je ne comprends pas votre question. Pouvez-vous reformuler ?',
      intent: 'none',
      confidence: 0
    };
  }
}

