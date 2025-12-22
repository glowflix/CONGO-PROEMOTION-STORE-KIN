/**
 * Script pour générer des données d'exemple pour Google Sheets
 * Utilisez ce script pour créer un CSV ou copier-coller dans Sheets
 */

// Données d'exemple pour les produits
const productsData = [
  {
    id: 'PROD_1704067200000_smartphone',
    title: 'Smartphone Android 128GB - Écran 6.5"',
    description: 'Smartphone Android dernière génération avec écran AMOLED 6.5 pouces, 128GB de stockage, processeur octa-core, appareil photo 48MP + 12MP, batterie 5000mAh, charge rapide 33W. Design premium avec verre Gorilla Glass.',
    price: 150000,
    currency: 'CDF',
    stock: 25,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800'
    ]),
    model3dUrl: 'https://polyhaven.com/api/download?file=glb&item=phone&variant=default',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    ratingAvg: 4.5,
    ratingCount: 12,
    likesCount: 45,
    commentsCount: 8,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-10T15:30:00Z'
  },
  {
    id: 'PROD_1704153600000_tshirt',
    title: 'T-shirt Premium Coton Bio',
    description: 'T-shirt 100% coton biologique, coupe moderne, disponible en plusieurs coloris. Matériau respirant et confortable, idéal pour un usage quotidien. Lavable en machine, ne rétrécit pas.',
    price: 25000,
    currency: 'CDF',
    stock: 50,
    category: 'vetements',
    coverImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.2,
    ratingCount: 8,
    likesCount: 32,
    commentsCount: 5,
    isPublic: true,
    isNew: false,
    isPromo: true,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-05T12:00:00Z'
  },
  {
    id: 'PROD_1704240000000_lamp',
    title: 'Lampadaire Moderne LED',
    description: 'Lampadaire design moderne avec éclairage LED dimmable, hauteur réglable, base stable en métal. Éclairage chaud et doux, parfait pour salon ou bureau. Économique et écologique.',
    price: 75000,
    currency: 'CDF',
    stock: 15,
    category: 'maison',
    coverImageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'
    ]),
    model3dUrl: 'https://polyhaven.com/api/download?file=glb&item=lamp&variant=default',
    videoUrl: '',
    ratingAvg: 4.7,
    ratingCount: 15,
    likesCount: 58,
    commentsCount: 12,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-08T14:20:00Z'
  },
  {
    id: 'PROD_1704326400000_shoes',
    title: 'Chaussures de Sport Running',
    description: 'Chaussures de course à pied haute performance, semelle amortissante, respirantes, légères. Idéales pour la course, la marche et le sport. Taille disponible de 38 à 45.',
    price: 60000,
    currency: 'CDF',
    stock: 30,
    category: 'sport',
    coverImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800'
    ]),
    model3dUrl: '',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    ratingAvg: 4.3,
    ratingCount: 20,
    likesCount: 67,
    commentsCount: 15,
    isPublic: true,
    isNew: false,
    isPromo: false,
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  },
  {
    id: 'PROD_1704412800000_creme',
    title: 'Crème Hydratante Visage Bio',
    description: 'Crème hydratante naturelle pour le visage, enrichie en aloe vera et vitamine E. Texture légère, non grasse, adaptée à tous types de peaux. Flacon de 50ml.',
    price: 15000,
    currency: 'CDF',
    stock: 100,
    category: 'beaute',
    coverImageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.6,
    ratingCount: 25,
    likesCount: 89,
    commentsCount: 18,
    isPublic: true,
    isNew: false,
    isPromo: true,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-10T11:30:00Z'
  },
  {
    id: 'PROD_1704499200000_laptop',
    title: 'Laptop 15.6" Intel Core i7',
    description: 'Ordinateur portable 15.6 pouces, processeur Intel Core i7, 16GB RAM, SSD 512GB, écran Full HD, carte graphique dédiée. Idéal pour travail et gaming.',
    price: 450000,
    currency: 'CDF',
    stock: 10,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.8,
    ratingCount: 18,
    likesCount: 92,
    commentsCount: 22,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-06T10:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  }
];

// Données pour les vidéos
const videosData = [
  {
    id: 'VID_1704067200000_demo1',
    title: 'Démonstration Smartphone Android - Unboxing',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    productId: 'PROD_1704067200000_smartphone',
    likesCount: 120,
    commentsCount: 15,
    viewsCount: 1500,
    createdAt: '2024-01-12T10:00:00Z'
  },
  {
    id: 'VID_1704153600000_demo2',
    title: 'Test Chaussures Running - Performance',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    productId: 'PROD_1704326400000_shoes',
    likesCount: 89,
    commentsCount: 12,
    viewsCount: 980,
    createdAt: '2024-01-13T14:30:00Z'
  }
];

// Données pour AI_KB
const aiKbData = [
  {
    id: 'KB_001',
    intent: 'livraison',
    keywords: 'livraison,delivery,expedition,transport,quand,when,combien,how long,durée,temps',
    answer_fr: 'La livraison se fait sous 3-5 jours ouvrés dans toute la RDC. Les frais de livraison sont de 5000 CDF pour Kinshasa et 10000 CDF pour les autres provinces. Suivi en temps réel disponible.',
    answer_en: 'Delivery takes 3-5 business days throughout DRC. Shipping costs are 5000 CDF for Kinshasa and 10000 CDF for other provinces. Real-time tracking available.',
    answer_ln: 'Livraison ezali na 3-5 mikolo ya mosala na RDC mobimba. Mbongo ya livraison ezali 5000 CDF na Kinshasa mpe 10000 CDF na provinces mosusu. Kolanda na ntango ya solosolo ezali.',
    priority: 10,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_002',
    intent: 'paiement',
    keywords: 'paiement,payment,pay,comment payer,how to pay,moyen paiement,method',
    answer_fr: 'Nous acceptons les paiements par Mobile Money (Airtel Money, Orange Money, M-Pesa), virement bancaire, et paiement à la livraison. Tous les paiements sont sécurisés.',
    answer_en: 'We accept Mobile Money (Airtel Money, Orange Money, M-Pesa), bank transfer, and cash on delivery. All payments are secure.',
    answer_ln: 'Tobondaka Mobile Money (Airtel Money, Orange Money, M-Pesa), virement ya banki, mpe mbongo na livraison. Mbongo nyonso ezali na sécurité.',
    priority: 10,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_003',
    intent: 'retour',
    keywords: 'retour,return,remboursement,refund,échanger,exchange,garantie,warranty',
    answer_fr: 'Vous avez 14 jours pour retourner un produit non conforme ou défectueux. Remboursement complet ou échange possible. Contactez notre service client pour initier un retour.',
    answer_en: 'You have 14 days to return a non-conforming or defective product. Full refund or exchange possible. Contact our customer service to initiate a return.',
    answer_ln: 'Ozali na mikolo 14 mpo na kozongisa produit oyo ezali te malamu to oyo ezali na défaut. Remboursement ya mbongo nyonso to échange ekoki. Bimela service client na biso.',
    priority: 9,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_004',
    intent: 'stock',
    keywords: 'stock,disponible,available,rupture,out of stock,quand disponible,when available',
    answer_fr: 'Le stock est mis à jour en temps réel sur chaque page produit. Si un produit est en rupture, vous pouvez vous inscrire pour être notifié dès qu\'il sera à nouveau disponible.',
    answer_en: 'Stock is updated in real-time on each product page. If a product is out of stock, you can sign up to be notified when it becomes available again.',
    answer_ln: 'Stock ezali na mise à jour na ntango ya solosolo na page ya produit nyonso. Soki produit ezali na rupture, okoki kozwa notification ntango ekosima.',
    priority: 8,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_005',
    intent: 'contact',
    keywords: 'contact,email,téléphone,phone,adresse,address,service client,customer service',
    answer_fr: 'Contactez-nous par email à contact@congopromotionstore.com, par téléphone au +243 XXX XXX XXX, ou via notre formulaire de contact. Nous répondons sous 24h.',
    answer_en: 'Contact us by email at contact@congopromotionstore.com, by phone at +243 XXX XXX XXX, or via our contact form. We respond within 24 hours.',
    answer_ln: 'Bimela na biso na email na contact@congopromotionstore.com, na téléphone na +243 XXX XXX XXX, to na formulaire ya contact. Tozongisaka na mikolo 1.',
    priority: 7,
    updatedAt: '2024-01-01T10:00:00Z'
  }
];

// Fonction pour convertir en CSV
function convertToCSV(data, headers) {
  const csvRows = [];
  
  // Headers
  csvRows.push(headers.join(','));
  
  // Data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Échapper les virgules et guillemets dans les valeurs
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

// Générer les CSV
console.log('=== PRODUCTS ===');
console.log(convertToCSV(productsData, [
  'id', 'title', 'description', 'price', 'currency', 'stock', 'category',
  'coverImageUrl', 'imagesJson', 'model3dUrl', 'videoUrl',
  'ratingAvg', 'ratingCount', 'likesCount', 'commentsCount',
  'isPublic', 'isNew', 'isPromo', 'createdAt', 'updatedAt'
]));

console.log('\n=== VIDEOS ===');
console.log(convertToCSV(videosData, [
  'id', 'title', 'videoUrl', 'coverUrl', 'productId',
  'likesCount', 'commentsCount', 'viewsCount', 'createdAt'
]));

console.log('\n=== AI_KB ===');
console.log(convertToCSV(aiKbData, [
  'id', 'intent', 'keywords', 'answer_fr', 'answer_en', 'answer_ln',
  'priority', 'updatedAt'
]));

// Export pour utilisation dans Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    productsData,
    videosData,
    aiKbData,
    convertToCSV
  };
}

