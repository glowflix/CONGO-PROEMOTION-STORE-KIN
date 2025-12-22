# 🚀 Guide de configuration finale - Congo Promotion Store

## ✅ Checklist de déploiement

### 1. Google Sheets Configuration

- [ ] Créer le spreadsheet "CongoPromotionDB"
- [ ] Créer les 8 onglets avec les colonnes exactes
- [ ] Importer les données d'exemple depuis `generate_sheets_data.js`
- [ ] Vérifier que toutes les URLs sont accessibles
- [ ] Tester que les données s'affichent correctement

**Colonnes importantes à vérifier :**
- `imagesJson` doit être un JSON valide : `["url1","url2"]`
- `isPublic`, `isNew`, `isPromo` doivent être `TRUE` ou `FALSE`
- Les dates doivent être au format ISO : `2024-01-01T10:00:00Z`

### 2. Google Drive Configuration

- [ ] Créer le dossier "CongoPromotionStore_Media"
- [ ] Partager en "Tous ceux qui ont le lien peuvent voir"
- [ ] Uploader les images de produits
- [ ] Uploader les vidéos (format vertical 9:16)
- [ ] Uploader les modèles 3D (.glb compressés)
- [ ] Obtenir les IDs et construire les URLs :
  ```
  https://drive.google.com/uc?export=view&id=ID_DU_FICHIER
  ```

### 3. Apps Script Configuration

- [ ] Aller sur script.google.com
- [ ] Créer un nouveau projet
- [ ] Copier le contenu de `Code.gs`
- [ ] Remplacer `YOUR_SPREADSHEET_ID` par votre ID
- [ ] Sauvegarder le projet
- [ ] Exécuter `doGet` une fois pour autoriser
- [ ] Déployer en Web App :
  - Type : Application Web
  - Exécuter en tant que : Moi
  - Accès : Tous les utilisateurs
- [ ] Copier l'URL de déploiement

### 4. Frontend Configuration

- [ ] Ouvrir `assets/js/api.js`
- [ ] Remplacer l'URL dans `API_CONFIG.baseUrl` :
  ```javascript
  baseUrl: 'https://script.google.com/macros/s/VOTRE_ID/exec'
  ```

### 5. Test des fonctionnalités

- [ ] Page d'accueil charge les produits
- [ ] Page store avec filtres fonctionne
- [ ] Page produit affiche les images
- [ ] Vue 3D se charge et tourne
- [ ] Commentaires s'affichent avec threading
- [ ] Réponses aux commentaires fonctionnent
- [ ] Avis s'affichent avec notes
- [ ] Likes fonctionnent
- [ ] Vidéos se lisent
- [ ] Thème dark/light/auto fonctionne
- [ ] Assistant IA répond aux questions

### 6. Déploiement Vercel

- [ ] Installer Vercel CLI : `npm i -g vercel`
- [ ] Dans le dossier du projet : `vercel`
- [ ] Suivre les instructions
- [ ] OU déployer via l'interface web Vercel

## 📋 Structure finale des fichiers

```
Congo Promotion Store/
├── index.html                    ✅ Page d'accueil
├── store.html                    ✅ Catalogue
├── product.html                  ✅ Page produit (3D + commentaires)
├── videos.html                   ✅ Vidéos verticales
├── profile.html                  ✅ Profil utilisateur
├── contact.html                  ✅ Page contact + IA
├── privacy.html                  ✅ Confidentialité
├── terms.html                    ✅ CGU
├── cookies.html                  ✅ Cookies
├── Code.gs                       ✅ Backend Apps Script
├── generate_sheets_data.js       ✅ Script données exemple
├── README.md                     ✅ Documentation principale
├── GOOGLE_SHEETS_SETUP.md        ✅ Guide Sheets
├── SHEETS_DATA_IMPORT.md          ✅ Import données
├── GUIDE_IMAGES_VIDEOS.md        ✅ Guide médias
├── FINAL_SETUP.md                ✅ Ce fichier
└── assets/
    ├── css/
    │   ├── app.css              ✅ Styles principaux
    │   ├── product.css          ✅ Styles produit
    │   ├── videos.css           ✅ Styles vidéos
    │   ├── profile.css          ✅ Styles profil
    │   └── contact.css          ✅ Styles contact
    └── js/
        ├── api.js               ✅ Communication API
        ├── theme.js             ✅ Gestion thème
        ├── feed.js              ✅ Feed accueil
        ├── store.js             ✅ Page store
        ├── product.js           ✅ Page produit (threading)
        ├── videos.js            ✅ Page vidéos
        ├── profile.js           ✅ Page profil
        └── contact.js           ✅ Page contact
```

## 🎯 Fonctionnalités professionnelles implémentées

### ✅ Système de commentaires avancé
- Threading (commentaires et réponses)
- Modération (statut pending/approved)
- Validation des données
- Compteurs automatiques
- Affichage hiérarchique

### ✅ Gestion des données
- Récupération complète depuis Sheets
- Formatage automatique des URLs
- Conversion des types (booléens, nombres)
- Parsing JSON pour imagesJson
- Gestion des erreurs

### ✅ Interface professionnelle
- Design dark premium avec option light
- Responsive mobile
- Animations fluides
- UX optimisée
- Accessibilité

### ✅ Fonctionnalités avancées
- Vue 3D interactive (model-viewer)
- Vidéos verticales (format TikTok)
- Système d'avis avec notes
- Likes sur produits
- Assistant IA par mots-clés
- Recherche et filtres

## 🔧 Dépannage

### Les produits ne s'affichent pas
1. Vérifiez l'URL Apps Script dans `api.js`
2. Vérifiez que le Spreadsheet ID est correct
3. Vérifiez que `isPublic` est `TRUE` dans Sheets
4. Ouvrez la console du navigateur pour voir les erreurs

### Les images ne se chargent pas
1. Vérifiez que les fichiers Drive sont partagés publiquement
2. Vérifiez le format de l'URL : `https://drive.google.com/uc?export=view&id=ID`
3. Testez l'URL directement dans le navigateur

### Les commentaires ne s'affichent pas
1. Vérifiez que le statut est `approved` dans Sheets
2. Vérifiez que `productId` correspond
3. Vérifiez la structure des données dans Sheets

### Le modèle 3D ne charge pas
1. Vérifiez que le fichier est en .glb
2. Vérifiez que l'URL est correcte
3. Vérifiez la console pour les erreurs CORS
4. Compressez le fichier si trop volumineux

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les fichiers de documentation
2. Vérifiez les erreurs dans la console du navigateur
3. Vérifiez les logs Apps Script (Exécutions)

## 🎉 Félicitations !

Votre site Congo Promotion Store est maintenant prêt avec :
- ✅ Architecture professionnelle
- ✅ Système de commentaires avec threading
- ✅ Récupération complète des données depuis Sheets
- ✅ Interface moderne et responsive
- ✅ Fonctionnalités avancées (3D, vidéos, IA)

Bon déploiement ! 🚀

