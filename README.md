# Congo Promotion Store

Plateforme e-commerce moderne avec vue 3D interactive, système d'avis, commentaires et vidéos verticales.

## 🚀 Fonctionnalités

- **Store interactif** : Catalogue de produits avec filtres, recherche et tri
- **Vue 3D** : Visualisation 3D interactive des produits (rotation au doigt)
- **Système d'avis** : Notes et commentaires sur les produits
- **Vidéos verticales** : Format TikTok/Reels pour les démonstrations
- **Thème adaptatif** : Dark/Light/Auto (suit les préférences système)
- **Mini IA** : Assistant basé sur mots-clés pour répondre aux questions
- **Modération** : Système de validation des commentaires et avis

## 📋 Prérequis

- Compte Google (pour Google Sheets et Apps Script)
- Compte Vercel (pour le déploiement)
- Google Drive (pour stocker les médias)

## 🛠️ Installation

### 1. Configuration Google Sheets

1. Créez un nouveau Google Sheets nommé **"CongoPromotionDB"**
2. Suivez les instructions dans `GOOGLE_SHEETS_SETUP.md` pour créer les onglets et colonnes
3. Remplissez avec vos données d'exemple

### 2. Configuration Google Drive

1. Créez un dossier **"CongoPromotionStore_Media"** dans Google Drive
2. Partagez-le en **"Tous ceux qui ont le lien peuvent voir"**
3. Uploadez vos images, vidéos et modèles 3D (.glb)
4. Pour chaque fichier, obtenez l'ID depuis l'URL et utilisez :
   ```
   https://drive.google.com/uc?export=view&id=VOTRE_ID
   ```

### 3. Configuration Apps Script

1. Allez sur [script.google.com](https://script.google.com)
2. Créez un nouveau projet
3. Copiez le contenu de `Code.gs` dans l'éditeur
4. Remplacez `YOUR_SPREADSHEET_ID` par l'ID de votre Google Sheets
5. Déployez en tant que **Web App** :
   - Exécutez la fonction `doGet` une fois pour autoriser
   - Allez dans **Déployer > Nouvelle version**
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Accès : **Tous les utilisateurs**
   - Copiez l'URL de déploiement

### 4. Configuration Frontend

1. Ouvrez `assets/js/api.js`
2. Remplacez `YOUR_SCRIPT_ID` par l'URL complète de votre Apps Script Web App :
   ```javascript
   baseUrl: 'https://script.google.com/macros/s/VOTRE_ID/exec'
   ```

### 5. Déploiement sur Vercel

1. Installez Vercel CLI :
   ```bash
   npm i -g vercel
   ```

2. Dans le dossier du projet :
   ```bash
   vercel
   ```

3. Suivez les instructions pour déployer

**OU** via l'interface Vercel :

1. Allez sur [vercel.com](https://vercel.com)
2. Importez votre projet GitHub
3. Vercel détectera automatiquement les fichiers statiques
4. Déployez !

## 📁 Structure du projet

```
Congo Promotion Store/
├── index.html              # Page d'accueil (feed)
├── store.html             # Catalogue produits
├── product.html           # Page produit (3D + avis)
├── videos.html           # Page vidéos
├── profile.html          # Profil utilisateur
├── privacy.html          # Politique de confidentialité
├── terms.html            # CGU
├── cookies.html          # Politique des cookies
├── Code.gs               # Code Apps Script (backend)
├── assets/
│   ├── css/
│   │   ├── app.css       # Styles principaux
│   │   ├── product.css   # Styles page produit
│   │   ├── videos.css    # Styles page vidéos
│   │   └── profile.css   # Styles page profil
│   └── js/
│       ├── api.js        # Communication avec Apps Script
│       ├── theme.js      # Gestion thème dark/light/auto
│       ├── feed.js       # Gestion feed d'accueil
│       ├── store.js      # Gestion page store
│       ├── product.js    # Gestion page produit
│       ├── videos.js     # Gestion page vidéos
│       └── profile.js    # Gestion page profil
├── GOOGLE_SHEETS_SETUP.md # Documentation Sheets
└── README.md             # Ce fichier
```

## 🎨 Personnalisation

### Thème

Le thème par défaut est **Dark Premium** (#061018). Pour modifier :

1. Ouvrez `assets/css/app.css`
2. Modifiez les variables CSS dans `:root` et `[data-theme="light"]`

### Couleurs

Les couleurs principales sont définies dans les variables CSS :
- `--accent-primary` : Bleu principal (#3b82f6)
- `--accent-secondary` : Violet secondaire (#8b5cf6)
- `--bg-primary` : Fond principal

## 📱 Fonctionnalités détaillées

### Vue 3D

- Utilise `<model-viewer>` de Google
- Rotation au doigt sur mobile
- Zoom par pincement
- Rotation automatique optionnelle
- Format supporté : .glb (GLTF binaire)

### Système de commentaires

- Les utilisateurs peuvent **uniquement commenter** (pas de posts)
- Modération automatique (statut "pending" par défaut)
- Réponses aux commentaires (threading)
- Likes sur les commentaires

### Mini IA

- Basée sur mots-clés (pas de modèle externe)
- Recherche dans la base de connaissances (AI_KB)
- Support multilingue (FR/EN/LN)
- Logs des questions dans AI_Logs

## 🔒 Sécurité

- Les emails sont hashés (SHA256) dans Users
- Modération obligatoire pour commentaires/avis
- Rate limiting recommandé (à implémenter)
- Validation côté serveur (Apps Script)

## 📊 Base de données

Toutes les données sont stockées dans Google Sheets :

- **Users** : Utilisateurs
- **Products** : Produits
- **Comments** : Commentaires
- **ProductLikes** : Likes produits
- **Reviews** : Avis
- **Videos** : Vidéos
- **AI_KB** : Base de connaissances IA
- **AI_Logs** : Logs IA

Voir `GOOGLE_SHEETS_SETUP.md` pour la structure complète.

## 🚧 Phase 2 (Futur)

- Logiciel Admin Node.js pour :
  - Publication de produits
  - Gestion du stock
  - Modération des commentaires/avis
  - Statistiques

## 📝 Notes importantes

- Les utilisateurs ne peuvent **que commenter**, pas publier de posts
- Les commentaires et avis nécessitent modération (statut "pending")
- Les modèles 3D doivent être compressés pour le mobile
- Les URLs Google Drive doivent être publiques

## 🐛 Dépannage

### Erreur CORS
- Vérifiez que votre Apps Script est déployé en Web App avec accès "Tous les utilisateurs"

### Images ne s'affichent pas
- Vérifiez que les fichiers Drive sont partagés publiquement
- Utilisez le format d'URL : `https://drive.google.com/uc?export=view&id=ID`

### Modèle 3D ne charge pas
- Vérifiez que le fichier est en .glb
- Compressez le fichier si trop volumineux
- Vérifiez la console du navigateur pour les erreurs

## 📞 Support

Pour toute question, consultez la documentation dans `GOOGLE_SHEETS_SETUP.md` ou contactez l'équipe.

## 📄 Licence

© 2024 Congo Promotion Store. Tous droits réservés.

