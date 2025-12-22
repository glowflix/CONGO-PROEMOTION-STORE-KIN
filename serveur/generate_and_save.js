/**
 * Script pour générer et sauvegarder les données Sheets enrichies
 */

const fs = require('fs');
const path = require('path');

// Produits enrichis avec vraies images de téléphones
const productsData = [
  {
    id: 'PROD_1704067200000_smartphone',
    title: 'Samsung Galaxy S23 Ultra 256GB',
    description: 'Smartphone Android premium avec écran AMOLED Dynamic 6.8 pouces, processeur Snapdragon 8 Gen 2, 256GB de stockage, 12GB RAM, appareil photo 200MP + 10MP + 10MP + 12MP, batterie 5000mAh, charge rapide 45W, résistant à l\'eau IP68. Design premium en verre et métal.',
    price: 850000,
    currency: 'CDF',
    stock: 15,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    ratingAvg: 4.8,
    ratingCount: 45,
    likesCount: 234,
    commentsCount: 32,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-10T15:30:00Z'
  },
  {
    id: 'PROD_1704153600000_iphone',
    title: 'iPhone 15 Pro Max 512GB',
    description: 'iPhone dernier cri avec écran Super Retina XDR 6.7 pouces, puce A17 Pro, 512GB de stockage, triple caméra 48MP + 12MP + 12MP avec zoom optique 5x, batterie longue durée, charge sans fil MagSafe, résistant à l\'eau IP68. Design titane premium.',
    price: 1200000,
    currency: 'CDF',
    stock: 8,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1601972602237-8c79241f8c5a?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.9,
    ratingCount: 67,
    likesCount: 456,
    commentsCount: 58,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-12T14:20:00Z'
  },
  {
    id: 'PROD_1704240000000_xiaomi',
    title: 'Xiaomi Redmi Note 13 Pro 128GB',
    description: 'Smartphone Android performant avec écran AMOLED 6.67 pouces 120Hz, processeur Snapdragon 7s Gen 2, 128GB de stockage, 8GB RAM, triple caméra 200MP + 8MP + 2MP, batterie 5100mAh, charge rapide 67W. Excellent rapport qualité-prix.',
    price: 320000,
    currency: 'CDF',
    stock: 35,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.5,
    ratingCount: 28,
    likesCount: 156,
    commentsCount: 19,
    isPublic: true,
    isNew: false,
    isPromo: true,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-08T11:15:00Z'
  },
  {
    id: 'PROD_1704326400000_tshirt',
    title: 'T-shirt Premium Coton Bio',
    description: 'T-shirt 100% coton biologique certifié, coupe moderne et ajustée, disponible en plusieurs coloris (noir, blanc, bleu, gris). Matériau respirant et confortable, idéal pour un usage quotidien. Lavable en machine à 30°C, ne rétrécit pas, séchage rapide.',
    price: 25000,
    currency: 'CDF',
    stock: 50,
    category: 'vetements',
    coverImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.2,
    ratingCount: 18,
    likesCount: 89,
    commentsCount: 12,
    isPublic: true,
    isNew: false,
    isPromo: true,
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-05T12:00:00Z'
  },
  {
    id: 'PROD_1704412800000_lamp',
    title: 'Lampadaire Moderne LED Dimmable',
    description: 'Lampadaire design moderne avec éclairage LED dimmable (3000K-6000K), hauteur réglable de 120cm à 160cm, base stable en métal laqué noir, abat-jour en tissu. Éclairage chaud et doux, parfait pour salon ou bureau. Économique (9W) et écologique, durée de vie 25000h.',
    price: 75000,
    currency: 'CDF',
    stock: 15,
    category: 'maison',
    coverImageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.7,
    ratingCount: 23,
    likesCount: 134,
    commentsCount: 18,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-08T14:20:00Z'
  },
  {
    id: 'PROD_1704499200000_shoes',
    title: 'Chaussures de Sport Running Pro',
    description: 'Chaussures de course à pied haute performance, semelle amortissante Air Cushion, technologie anti-transpiration, légères (280g), respirantes avec mesh aéré. Idéales pour la course, la marche et le sport intensif. Taille disponible de 38 à 45. Semelle extérieure en caoutchouc durable.',
    price: 60000,
    currency: 'CDF',
    stock: 30,
    category: 'sport',
    coverImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    ratingAvg: 4.3,
    ratingCount: 42,
    likesCount: 198,
    commentsCount: 28,
    isPublic: true,
    isNew: false,
    isPromo: false,
    createdAt: '2024-01-06T10:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  },
  {
    id: 'PROD_1704585600000_creme',
    title: 'Crème Hydratante Visage Bio 50ml',
    description: 'Crème hydratante naturelle pour le visage, enrichie en aloe vera (80%), vitamine E, acide hyaluronique et beurre de karité. Texture légère, non grasse, adaptée à tous types de peaux (sèche, normale, grasse). Hydratation 24h, anti-âge, SPF 15. Flacon de 50ml. Sans parabènes, sans parfum.',
    price: 15000,
    currency: 'CDF',
    stock: 100,
    category: 'beaute',
    coverImageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.6,
    ratingCount: 35,
    likesCount: 167,
    commentsCount: 24,
    isPublic: true,
    isNew: false,
    isPromo: true,
    createdAt: '2024-01-07T10:00:00Z',
    updatedAt: '2024-01-10T11:30:00Z'
  },
  {
    id: 'PROD_1704672000000_laptop',
    title: 'Laptop Gaming 15.6" Intel Core i7 RTX 4060',
    description: 'Ordinateur portable gaming 15.6 pouces Full HD 144Hz, processeur Intel Core i7-13700H, 16GB RAM DDR5, SSD 512GB NVMe, carte graphique NVIDIA RTX 4060 8GB, clavier rétroéclairé RGB, WiFi 6, Bluetooth 5.2. Idéal pour gaming, travail et création. Batterie 90Wh, charge rapide.',
    price: 1200000,
    currency: 'CDF',
    stock: 10,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.8,
    ratingCount: 29,
    likesCount: 312,
    commentsCount: 45,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  },
  {
    id: 'PROD_1704758400000_oneplus',
    title: 'OnePlus 12 256GB',
    description: 'Smartphone Android flagship avec écran LTPO AMOLED 6.82 pouces 120Hz, processeur Snapdragon 8 Gen 3, 256GB de stockage, 16GB RAM, triple caméra 50MP + 64MP + 48MP, batterie 5400mAh, charge ultra-rapide 100W (0-100% en 26min), charge sans fil 50W. Design premium verre et métal.',
    price: 650000,
    currency: 'CDF',
    stock: 20,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
    imagesJson: JSON.stringify([
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1601972602237-8c79241f8c5a?w=800&q=80'
    ]),
    model3dUrl: '',
    videoUrl: '',
    ratingAvg: 4.7,
    ratingCount: 38,
    likesCount: 201,
    commentsCount: 27,
    isPublic: true,
    isNew: true,
    isPromo: false,
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-14T10:20:00Z'
  }
];

// Vidéos enrichies
const videosData = [
  {
    id: 'VID_1704067200000_demo1',
    title: 'Unboxing Samsung Galaxy S23 Ultra - Test Complet',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    productId: 'PROD_1704067200000_smartphone',
    likesCount: 120,
    commentsCount: 15,
    viewsCount: 1500,
    createdAt: '2024-01-12T10:00:00Z'
  },
  {
    id: 'VID_1704153600000_demo2',
    title: 'Test Performance iPhone 15 Pro Max - Gaming & Photo',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
    productId: 'PROD_1704153600000_iphone',
    likesCount: 89,
    commentsCount: 12,
    viewsCount: 980,
    createdAt: '2024-01-13T14:30:00Z'
  },
  {
    id: 'VID_1704240000000_demo3',
    title: 'Chaussures Running - Test Course 10km',
    videoUrl: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    productId: 'PROD_1704499200000_shoes',
    likesCount: 67,
    commentsCount: 9,
    viewsCount: 756,
    createdAt: '2024-01-14T11:00:00Z'
  }
];

// AI_KB enrichi
const aiKbData = [
  {
    id: 'KB_001',
    intent: 'livraison',
    keywords: 'livraison,delivery,expedition,transport,quand,when,combien,how long,durée,temps,frais,shipping',
    answer_fr: 'La livraison se fait sous 3-5 jours ouvrés dans toute la RDC. Les frais de livraison sont de 5000 CDF pour Kinshasa et 10000 CDF pour les autres provinces. Suivi en temps réel disponible via SMS et email.',
    answer_en: 'Delivery takes 3-5 business days throughout DRC. Shipping costs are 5000 CDF for Kinshasa and 10000 CDF for other provinces. Real-time tracking available via SMS and email.',
    answer_ln: 'Livraison ezali na 3-5 mikolo ya mosala na RDC mobimba. Mbongo ya livraison ezali 5000 CDF na Kinshasa mpe 10000 CDF na provinces mosusu. Kolanda na ntango ya solosolo ezali na SMS mpe email.',
    priority: 10,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_002',
    intent: 'paiement',
    keywords: 'paiement,payment,pay,comment payer,how to pay,moyen paiement,method,carte,card,mobile money',
    answer_fr: 'Nous acceptons les paiements par Mobile Money (Airtel Money, Orange Money, M-Pesa), virement bancaire, et paiement à la livraison. Tous les paiements sont sécurisés et cryptés. Aucune commission supplémentaire.',
    answer_en: 'We accept Mobile Money (Airtel Money, Orange Money, M-Pesa), bank transfer, and cash on delivery. All payments are secure and encrypted. No additional fees.',
    answer_ln: 'Tobondaka Mobile Money (Airtel Money, Orange Money, M-Pesa), virement ya banki, mpe mbongo na livraison. Mbongo nyonso ezali na sécurité mpe crypté. Commission te.',
    priority: 10,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_003',
    intent: 'retour',
    keywords: 'retour,return,remboursement,refund,échanger,exchange,garantie,warranty,défaut,defect',
    answer_fr: 'Vous avez 14 jours pour retourner un produit non conforme ou défectueux. Remboursement complet ou échange possible. Contactez notre service client pour initier un retour. Les frais de retour sont à notre charge si le produit est défectueux.',
    answer_en: 'You have 14 days to return a non-conforming or defective product. Full refund or exchange possible. Contact our customer service to initiate a return. Return shipping is free if the product is defective.',
    answer_ln: 'Ozali na mikolo 14 mpo na kozongisa produit oyo ezali te malamu to oyo ezali na défaut. Remboursement ya mbongo nyonso to échange ekoki. Bimela service client na biso. Mbongo ya retour ezali na biso soki produit ezali na défaut.',
    priority: 9,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_004',
    intent: 'stock',
    keywords: 'stock,disponible,available,rupture,out of stock,quand disponible,when available,précommande,preorder',
    answer_fr: 'Le stock est mis à jour en temps réel sur chaque page produit. Si un produit est en rupture, vous pouvez vous inscrire pour être notifié dès qu\'il sera à nouveau disponible. Les précommandes sont possibles pour les nouveautés.',
    answer_en: 'Stock is updated in real-time on each product page. If a product is out of stock, you can sign up to be notified when it becomes available again. Pre-orders are available for new products.',
    answer_ln: 'Stock ezali na mise à jour na ntango ya solosolo na page ya produit nyonso. Soki produit ezali na rupture, okoki kozwa notification ntango ekosima. Précommande ekoki mpo na produits ya sika.',
    priority: 8,
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'KB_005',
    intent: 'contact',
    keywords: 'contact,email,téléphone,phone,adresse,address,service client,customer service,help,aide',
    answer_fr: 'Contactez-nous par email à contact@congopromotionstore.com, par téléphone au +243 XXX XXX XXX, ou via notre formulaire de contact. Nous répondons sous 24h du lundi au vendredi. Support disponible en français, anglais et lingala.',
    answer_en: 'Contact us by email at contact@congopromotionstore.com, by phone at +243 XXX XXX XXX, or via our contact form. We respond within 24 hours Monday to Friday. Support available in French, English and Lingala.',
    answer_ln: 'Bimela na biso na email na contact@congopromotionstore.com, na téléphone na +243 XXX XXX XXX, to na formulaire ya contact. Tozongisaka na mikolo 1 na lundi tii na vendredi. Support ezali na français, anglais mpe lingala.',
    priority: 7,
    updatedAt: '2024-01-01T10:00:00Z'
  }
];

// Users enrichis
const usersData = [
  {
    id: 'USER_1704067200000_admin',
    displayName: 'Admin Store',
    avatarUrl: '',
    emailHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542b',
    role: 'admin',
    theme: 'dark',
    createdAt: '2024-01-01T10:00:00Z',
    lastSeenAt: '2024-01-15T14:30:00Z',
    status: 'active'
  },
  {
    id: 'USER_1704153600000_user1',
    displayName: 'Jean Dupont',
    avatarUrl: '',
    emailHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    role: 'user',
    theme: 'auto',
    createdAt: '2024-01-02T10:00:00Z',
    lastSeenAt: '2024-01-14T16:20:00Z',
    status: 'active'
  },
  {
    id: 'USER_1704240000000_user2',
    displayName: 'Marie Kabasele',
    avatarUrl: '',
    emailHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    role: 'user',
    theme: 'light',
    createdAt: '2024-01-03T10:00:00Z',
    lastSeenAt: '2024-01-13T09:15:00Z',
    status: 'active'
  }
];

// Commentaires d'exemple
const commentsData = [
  {
    id: 'COMM_1704067200000_001',
    productId: 'PROD_1704067200000_smartphone',
    userId: 'USER_1704153600000_user1',
    userName: 'Jean Dupont',
    content: 'Excellent smartphone ! L\'écran est magnifique et les photos sont de très bonne qualité. Je recommande vivement.',
    parentId: '',
    likesCount: 12,
    status: 'approved',
    createdAt: '2024-01-05T12:00:00Z'
  },
  {
    id: 'COMM_1704153600000_002',
    productId: 'PROD_1704067200000_smartphone',
    userId: 'USER_1704240000000_user2',
    userName: 'Marie Kabasele',
    content: 'La batterie tient vraiment toute la journée, même avec un usage intensif. Très satisfaite de mon achat !',
    parentId: '',
    likesCount: 8,
    status: 'approved',
    createdAt: '2024-01-06T14:30:00Z'
  },
  {
    id: 'COMM_1704240000000_003',
    productId: 'PROD_1704067200000_smartphone',
    userId: 'USER_1704153600000_user1',
    userName: 'Jean Dupont',
    content: 'Merci pour votre retour ! Combien de temps avez-vous eu besoin pour vous y habituer ?',
    parentId: 'COMM_1704153600000_002',
    likesCount: 3,
    status: 'approved',
    createdAt: '2024-01-06T16:00:00Z'
  }
];

// Avis d'exemple
const reviewsData = [
  {
    id: 'REV_1704067200000_001',
    productId: 'PROD_1704067200000_smartphone',
    userId: 'USER_1704153600000_user1',
    userName: 'Jean Dupont',
    rating: 5,
    content: 'Produit exceptionnel ! Qualité premium, performances au top. Le meilleur smartphone que j\'ai eu. Livraison rapide et emballage soigné.',
    status: 'approved',
    createdAt: '2024-01-08T10:00:00Z'
  },
  {
    id: 'REV_1704153600000_002',
    productId: 'PROD_1704067200000_smartphone',
    userId: 'USER_1704240000000_user2',
    userName: 'Marie Kabasele',
    rating: 4,
    content: 'Très bon téléphone, mais le prix est un peu élevé. Les fonctionnalités sont excellentes cependant.',
    status: 'approved',
    createdAt: '2024-01-09T11:30:00Z'
  },
  {
    id: 'REV_1704240000000_003',
    productId: 'PROD_1704153600000_iphone',
    userId: 'USER_1704153600000_user1',
    userName: 'Jean Dupont',
    rating: 5,
    content: 'iPhone de qualité, design magnifique. L\'iOS est fluide et les applications fonctionnent parfaitement.',
    status: 'approved',
    createdAt: '2024-01-10T09:00:00Z'
  }
];

// Fonction pour convertir en CSV
function convertToCSV(data, headers) {
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      if (value === undefined || value === null) {
        value = '';
      }
      if (typeof value === 'boolean') {
        value = value ? 'TRUE' : 'FALSE';
      }
      value = String(value);
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

// Fonction pour sauvegarder un fichier
function saveFile(filename, content) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fichier créé: ${filename}`);
}

// Générer et sauvegarder les fichiers CSV
console.log('🚀 Génération des fichiers Sheets enrichis...\n');

// Products
const productsCSV = convertToCSV(productsData, [
  'id', 'title', 'description', 'price', 'currency', 'stock', 'category',
  'coverImageUrl', 'imagesJson', 'model3dUrl', 'videoUrl',
  'ratingAvg', 'ratingCount', 'likesCount', 'commentsCount',
  'isPublic', 'isNew', 'isPromo', 'createdAt', 'updatedAt'
]);
saveFile('Products.csv', productsCSV);

// Videos
const videosCSV = convertToCSV(videosData, [
  'id', 'title', 'videoUrl', 'coverUrl', 'productId',
  'likesCount', 'commentsCount', 'viewsCount', 'createdAt'
]);
saveFile('Videos.csv', videosCSV);

// AI_KB
const aiKbCSV = convertToCSV(aiKbData, [
  'id', 'intent', 'keywords', 'answer_fr', 'answer_en', 'answer_ln',
  'priority', 'updatedAt'
]);
saveFile('AI_KB.csv', aiKbCSV);

// Users
const usersCSV = convertToCSV(usersData, [
  'id', 'displayName', 'avatarUrl', 'emailHash', 'role',
  'theme', 'createdAt', 'lastSeenAt', 'status'
]);
saveFile('Users.csv', usersCSV);

// Comments
const commentsCSV = convertToCSV(commentsData, [
  'id', 'productId', 'userId', 'userName', 'content', 'parentId', 'likesCount', 'status', 'createdAt'
]);
saveFile('Comments.csv', commentsCSV);

// Reviews
const reviewsCSV = convertToCSV(reviewsData, [
  'id', 'productId', 'userId', 'userName', 'rating', 'content', 'status', 'createdAt'
]);
saveFile('Reviews.csv', reviewsCSV);

// ProductLikes (vide mais avec header)
const productLikesHeaders = 'id,productId,userId,createdAt';
saveFile('ProductLikes.csv', productLikesHeaders);

// AI_Logs (vide mais avec header)
const aiLogsHeaders = 'id,userId,question,matchedIntent,answerUsed,createdAt';
saveFile('AI_Logs.csv', aiLogsHeaders);

console.log('\n✨ Tous les fichiers ont été générés avec succès !');
console.log('📊 Statistiques :');
console.log(`   - ${productsData.length} produits`);
console.log(`   - ${videosData.length} vidéos`);
console.log(`   - ${aiKbData.length} intents IA`);
console.log(`   - ${usersData.length} utilisateurs`);
console.log(`   - ${commentsData.length} commentaires`);
console.log(`   - ${reviewsData.length} avis`);
