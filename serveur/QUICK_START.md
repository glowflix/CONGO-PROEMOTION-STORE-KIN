# 🚀 Démarrage Rapide - Congo Promotion Store

## ✅ Ce qui a été généré

Tous les fichiers sont dans le dossier **`serveur/`** :

### 📊 Fichiers CSV (prêts à importer)
- ✅ `Products.csv` - 6 produits complets
- ✅ `Videos.csv` - 2 vidéos d'exemple
- ✅ `AI_KB.csv` - 5 intents IA
- ✅ `Users.csv` - 2 utilisateurs
- ✅ `Comments.csv` - Structure vide
- ✅ `ProductLikes.csv` - Structure vide
- ✅ `Reviews.csv` - Structure vide
- ✅ `AI_Logs.csv` - Structure vide

### 📝 Documentation
- ✅ `README.md` - Guide général
- ✅ `INSTRUCTIONS_IMPORT.md` - Instructions détaillées
- ✅ `Code.gs` - Code Apps Script complet

## 🎯 3 Étapes pour démarrer

### 1️⃣ Importer dans Google Sheets (5 min)

1. Créez un nouveau Google Sheets : **"CongoPromotionDB"**
2. Créez 8 onglets avec les noms exacts :
   - Products, Videos, AI_KB, Users, Comments, ProductLikes, Reviews, AI_Logs
3. Pour chaque onglet :
   - Fichier > Importer > Télécharger
   - Sélectionnez le CSV correspondant
   - "Remplacer la feuille de calcul"

### 2️⃣ Configurer Apps Script (3 min)

1. Allez sur [script.google.com](https://script.google.com)
2. Nouveau projet
3. Copiez le contenu de `serveur/Code.gs`
4. **IMPORTANT** : Remplacez `YOUR_SPREADSHEET_ID` par l'ID de votre Sheets
   - L'ID est dans l'URL : `https://docs.google.com/spreadsheets/d/ID_ICI/edit`
5. Déployez en Web App :
   - Déployer > Nouvelle version
   - Type : Application Web
   - Exécuter en tant que : Moi
   - Accès : Tous les utilisateurs
6. Copiez l'URL de déploiement

### 3️⃣ Configurer le Frontend (2 min)

1. Ouvrez `assets/js/api.js`
2. Remplacez l'URL :
   ```javascript
   baseUrl: 'https://script.google.com/macros/s/VOTRE_ID/exec'
   ```
3. Déployez sur Vercel

## ✨ C'est tout !

Votre site est maintenant opérationnel avec :
- ✅ 6 produits d'exemple
- ✅ 2 vidéos
- ✅ Assistant IA fonctionnel
- ✅ Système de commentaires avec threading
- ✅ Avis et notes
- ✅ Vue 3D interactive

## 📞 Besoin d'aide ?

Consultez `INSTRUCTIONS_IMPORT.md` pour plus de détails.

---

**Temps total estimé : 10 minutes** ⏱️

