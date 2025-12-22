# ⚡ Démarrage Rapide - Congo Promotion Store

## ✅ Configuration terminée !

- ✅ **URL Apps Script** configurée dans `assets/js/api.js`
- ✅ **Spreadsheet ID** configuré dans `serveur/Code.gs`
- ✅ **Données d'exemple** dans `serveur/*.csv`

## 🚀 Tester avec Live Server (2 minutes)

### Étape 1 : Installer Live Server

1. Ouvrez **VS Code**
2. Allez dans **Extensions** (Ctrl+Shift+X)
3. Recherchez **"Live Server"** par Ritwick Dey
4. Cliquez sur **"Installer"**

### Étape 2 : Lancer le serveur

1. **Ouvrez** `index.html` dans VS Code
2. **Clic droit** sur le fichier
3. Sélectionnez **"Open with Live Server"**
4. Le site s'ouvre automatiquement ! 🎉

### Étape 3 : Tester

Le site devrait s'ouvrir sur : `http://localhost:5500`

**Testez** :
- ✅ Navigation entre les pages
- ✅ Affichage des produits
- ✅ Ajout au panier
- ✅ Thème dark/light
- ✅ Recherche

## 🔍 Vérifier que l'API fonctionne

### Test 1 : Dans le navigateur

Ouvrez cette URL directement :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

Vous devriez voir du JSON avec vos produits.

### Test 2 : Dans la console

1. Ouvrez le site avec Live Server
2. Appuyez sur **F12** (console)
3. Allez dans l'onglet **Network**
4. Rechargez la page
5. Cherchez les requêtes vers `script.google.com`
6. Vérifiez que le statut est **200** (succès)

## 🐛 Si ça ne fonctionne pas

### Erreur "Route manquante"
- ✅ Normal si vous testez l'URL sans `?route=...`
- ✅ Le site utilise automatiquement les bonnes routes

### Les produits ne s'affichent pas
1. Vérifiez la console (F12) pour les erreurs
2. Vérifiez que vos produits ont `isPublic = TRUE` dans Sheets
3. Testez l'URL API directement (voir Test 1)

### Erreur CORS
- Vérifiez que Apps Script est déployé avec **"Tous les utilisateurs"**
- Redéployez si nécessaire

## 📊 Vérifier les données dans Sheets

Assurez-vous que votre Sheets contient :
- ✅ Au moins 1 produit avec `isPublic = TRUE`
- ✅ Les colonnes sont correctes
- ✅ Les noms des onglets sont exacts

## 🎯 Prochaines étapes

1. ✅ Testez avec Live Server
2. ✅ Vérifiez que les produits s'affichent
3. ✅ Testez le panier
4. ✅ Déployez sur Vercel quand tout fonctionne

---

**C'est tout ! Lancez Live Server et testez ! 🚀**

