# 🔧 Guide de Dépannage - Erreur de Chargement

## 🐛 Diagnostic de l'erreur "Erreur de chargement"

### Étape 1 : Ouvrir la console

1. **Ouvrez votre site** avec Live Server
2. Appuyez sur **F12** (ou Clic droit > Inspecter)
3. Allez dans l'onglet **Console**
4. Regardez les messages d'erreur

### Étape 2 : Utiliser l'outil de débogage

Dans la console, tapez :
```javascript
window.debugAPI.test('products', { limit: 5 })
```

Cela va tester l'API et afficher les détails.

### Étape 3 : Vérifier les causes possibles

## ❌ Causes courantes et solutions

### 1. Problème CORS (Cross-Origin)

**Symptôme** : Erreur dans la console comme "CORS policy" ou "Access-Control-Allow-Origin"

**Solution** :
1. Allez sur [script.google.com](https://script.google.com)
2. Ouvrez votre projet Apps Script
3. **Déployer** > **Gérer les déploiements**
4. Cliquez sur l'icône **✏️** (modifier)
5. Vérifiez que **"Accès"** est sur **"Tous les utilisateurs"**
6. **Redéployez** si nécessaire

### 2. L'API retourne une erreur

**Symptôme** : Dans la console, vous voyez `{"error":"..."}`

**Solutions** :
- Si `"Route manquante"` : Normal si vous testez sans `?route=...`
- Si `"Feuille non trouvée"` : Vérifiez les noms des onglets dans Sheets
- Si `"Impossible d'ouvrir le spreadsheet"` : Vérifiez l'ID dans Code.gs

### 3. Aucun produit dans Sheets

**Symptôme** : L'API répond mais `products: []`

**Solution** :
1. Ouvrez votre Sheets
2. Vérifiez l'onglet **Products**
3. Assurez-vous qu'il y a des produits
4. Vérifiez que `isPublic` est `TRUE` pour au moins un produit

### 4. Format de données incorrect

**Symptôme** : Erreur de parsing JSON

**Solution** :
- Vérifiez que `imagesJson` est un JSON valide : `["url1","url2"]`
- Vérifiez que les booléens sont `TRUE` ou `FALSE`
- Vérifiez que les dates sont au format ISO

### 5. Timeout

**Symptôme** : "Request timeout"

**Solution** :
- Votre Sheets est peut-être trop lent
- Réduisez le nombre de produits chargés
- Vérifiez votre connexion internet

## 🧪 Tests manuels

### Test 1 : URL directe dans le navigateur

Ouvrez cette URL :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

**Résultats possibles** :
- ✅ **JSON avec produits** : L'API fonctionne !
- ❌ **`{"error":"Route manquante"}`** : Normal, mais avec `?route=products` ça devrait marcher
- ❌ **Page blanche** : Problème de déploiement Apps Script
- ❌ **Erreur 404** : URL incorrecte

### Test 2 : Console du navigateur

1. Ouvrez la console (F12)
2. Tapez :
```javascript
fetch('https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error)
```

### Test 3 : Vérifier Sheets

1. Ouvrez votre Sheets : https://docs.google.com/spreadsheets/d/1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q/edit
2. Vérifiez l'onglet **Products**
3. Assurez-vous qu'il y a :
   - Au moins une ligne de données (en plus de l'en-tête)
   - La colonne `isPublic` contient `TRUE`
   - Les colonnes sont dans le bon ordre

## 🔍 Vérifier les logs Apps Script

1. Allez sur [script.google.com](https://script.google.com)
2. Ouvrez votre projet
3. Allez dans **"Exécutions"**
4. Vous verrez toutes les requêtes et leurs erreurs

## ✅ Checklist de vérification

- [ ] Apps Script est déployé en Web App
- [ ] Accès : "Tous les utilisateurs"
- [ ] L'URL dans `api.js` est correcte
- [ ] Sheets contient des données
- [ ] Au moins un produit a `isPublic = TRUE`
- [ ] Les noms des onglets sont exacts (Products, Videos, etc.)
- [ ] Pas d'erreur CORS dans la console
- [ ] La console affiche les requêtes API

## 🆘 Commandes de débogage

Dans la console du navigateur :

```javascript
// Tester l'API
window.debugAPI.test('products', { limit: 5 })

// Tester tous les endpoints
window.debugAPI.testAll()

// Vérifier la configuration
window.debugAPI.checkConfig()

// Vérifier Sheets
window.debugAPI.checkSheets()

// Voir l'URL de l'API
console.log(API_CONFIG.baseUrl)
```

## 📞 Si le problème persiste

1. **Copiez les erreurs** de la console
2. **Vérifiez les logs** Apps Script
3. **Testez l'URL** directement dans le navigateur
4. **Vérifiez** que Sheets contient des données

---

**Le système de débogage est maintenant actif ! Ouvrez la console (F12) pour voir les détails.** 🔍

