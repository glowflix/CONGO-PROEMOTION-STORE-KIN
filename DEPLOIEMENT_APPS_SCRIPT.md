# 🚀 Guide de Déploiement Apps Script

## ✅ Votre Spreadsheet est prêt !

**ID de votre Sheets** : `1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q`  
**URL** : https://docs.google.com/spreadsheets/d/1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q/edit

## 📋 Étapes de déploiement

### 1. Ouvrir Apps Script

1. Allez sur [script.google.com](https://script.google.com)
2. Cliquez sur **"Nouveau projet"**
3. Donnez un nom au projet : **"CongoPromotionStore API"**

### 2. Copier le code

1. **Supprimez** le code par défaut dans l'éditeur
2. **Ouvrez** le fichier `serveur/Code.gs` dans votre projet
3. **Copiez tout le contenu** (Ctrl+A, Ctrl+C)
4. **Collez** dans l'éditeur Apps Script (Ctrl+V)

### 3. Vérifier la configuration

Le code contient déjà votre Spreadsheet ID :
```javascript
SPREADSHEET_ID: '1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q'
```

✅ **Aucune modification nécessaire !**

### 4. Autoriser l'accès

1. Cliquez sur **"Exécuter"** (▶️) en haut
2. Sélectionnez la fonction `doGet`
3. Cliquez sur **"Exécuter"**
4. **Autorisez l'accès** :
   - Cliquez sur "Revoir les autorisations"
   - Choisissez votre compte Google
   - Cliquez sur "Avancé" > "Aller à [nom du projet] (non sécurisé)"
   - Cliquez sur "Autoriser"

### 5. Déployer en Web App

1. Cliquez sur **"Déployer"** > **"Nouvelle version"**
2. **Type** : Sélectionnez **"Application Web"**
3. **Description** : "API Congo Promotion Store v1.0"
4. **Exécuter en tant que** : **"Moi"**
5. **Accès** : **"Tous les utilisateurs"** (important pour CORS)
6. Cliquez sur **"Déployer"**

### 6. Copier l'URL de déploiement

Après le déploiement, vous obtiendrez une URL comme :
```
https://script.google.com/macros/s/AKfycby.../exec
```

**⚠️ IMPORTANT** : Copiez cette URL complète !

### 7. Configurer le frontend

1. Ouvrez `assets/js/api.js`
2. Remplacez la ligne :
   ```javascript
   baseUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
   ```
   Par :
   ```javascript
   baseUrl: 'VOTRE_URL_DE_DEPLOIEMENT',
   ```
   (Collez l'URL complète que vous avez copiée)

### 8. Tester l'API

Ouvrez cette URL dans votre navigateur (remplacez par votre URL) :
```
https://script.google.com/macros/s/VOTRE_ID/exec?route=products&limit=5
```

Vous devriez voir du JSON avec vos produits !

## 🔧 Vérification des onglets

Assurez-vous que votre Sheets contient ces **8 onglets** avec les noms exacts :

1. ✅ **Products**
2. ✅ **Videos**
3. ✅ **AI_KB**
4. ✅ **Users**
5. ✅ **Comments**
6. ✅ **ProductLikes**
7. ✅ **Reviews**
8. ✅ **AI_Logs**

## 📊 Endpoints disponibles

### GET (Lecture)

```
?route=products&limit=20&filter=new
?route=product&id=PROD_123
?route=comments&productId=PROD_123&limit=50
?route=reviews&productId=PROD_123&limit=50
?route=videos&limit=20
```

### POST (Écriture)

```
route=comment
Body: { productId, content, userId, userName, parentId? }

route=review
Body: { productId, rating, content, userId, userName }

route=likeProduct
Body: { productId, userId }

route=unlikeProduct
Body: { productId, userId }

route=aiAsk
Body: { question, userId }

route=updateStock
Body: { productId, stock }
```

## ✅ Test rapide

### Test 1 : Récupérer les produits
```
https://VOTRE_URL/exec?route=products&limit=5
```

### Test 2 : Récupérer un produit
```
https://VOTRE_URL/exec?route=product&id=PROD_1704067200000_smartphone
```

### Test 3 : Ajouter un commentaire (POST)
Utilisez Postman ou votre frontend pour tester.

## 🐛 Dépannage

### Erreur "Feuille non trouvée"
- Vérifiez que les noms des onglets correspondent exactement
- Les noms sont sensibles à la casse (Products ≠ products)

### Erreur "Impossible d'ouvrir le spreadsheet"
- Vérifiez que l'ID est correct
- Vérifiez que le Sheets est accessible

### Erreur CORS
- Assurez-vous que l'accès est "Tous les utilisateurs"
- Redéployez après modification

### Les données ne s'affichent pas
- Vérifiez que `isPublic` est `TRUE` dans Products
- Vérifiez que les colonnes sont correctes
- Consultez les logs Apps Script (Exécutions)

## 📝 Logs et débogage

1. Dans Apps Script, allez dans **"Exécutions"**
2. Vous verrez toutes les requêtes et erreurs
3. Cliquez sur une exécution pour voir les détails

## 🔄 Mettre à jour le code

Si vous modifiez le code :

1. Modifiez le code dans Apps Script
2. **Déployer** > **Nouvelle version**
3. Donnez une nouvelle description
4. Cliquez sur **"Déployer"**
5. L'URL reste la même (pas besoin de reconfigurer le frontend)

## 🎯 Prochaines étapes

1. ✅ Déployez Apps Script
2. ✅ Copiez l'URL de déploiement
3. ✅ Mettez à jour `assets/js/api.js`
4. ✅ Testez avec `python -m http.server 8000`
5. ✅ Déployez sur Vercel

---

**Votre backend est maintenant prêt ! 🚀**

