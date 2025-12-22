# 🔍 Diagnostic Rapide - Erreur de Chargement

## ⚡ Diagnostic en 30 secondes

### 1. Ouvrez la console (F12)

### 2. Tapez cette commande :

```javascript
window.debugAPI.test('products', { limit: 5 })
```

### 3. Regardez le résultat :

- ✅ **JSON avec produits** → L'API fonctionne ! Le problème est ailleurs.
- ❌ **Erreur CORS** → Vérifiez le déploiement Apps Script
- ❌ **404 ou erreur** → Vérifiez l'URL ou les données Sheets
- ❌ **Timeout** → Problème de connexion ou Sheets trop lent

## 🎯 Solutions rapides

### Si erreur CORS :
1. Apps Script > Déployer > Gérer les déploiements
2. Modifier le déploiement
3. Accès : **"Tous les utilisateurs"**
4. Redéployer

### Si "Route manquante" :
C'est normal si vous testez sans `?route=products`. Testez avec :
```
?route=products&limit=5
```

### Si aucun produit :
1. Ouvrez votre Sheets
2. Onglet **Products**
3. Vérifiez qu'il y a des données
4. Vérifiez que `isPublic = TRUE`

### Si erreur de parsing :
- Vérifiez que `imagesJson` est un JSON valide
- Format : `["url1","url2"]`

## 🧪 Test direct de l'API

Ouvrez cette URL dans votre navigateur :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

**Si vous voyez du JSON** → L'API fonctionne !  
**Si vous voyez une erreur** → Regardez le message d'erreur.

## 📊 Vérifier Sheets

URL de votre Sheets :
https://docs.google.com/spreadsheets/d/1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q/edit

Vérifiez :
- ✅ Onglet **Products** existe
- ✅ Au moins 1 ligne de données (sans compter l'en-tête)
- ✅ Colonne `isPublic` = `TRUE` pour au moins un produit

## 🔧 Commandes de débogage

Dans la console (F12) :

```javascript
// Test simple
window.debugAPI.test('products', { limit: 5 })

// Vérifier la config
window.debugAPI.checkConfig()

// Vérifier Sheets
window.debugAPI.checkSheets()

// Voir l'URL
console.log(API_CONFIG.baseUrl)
```

## 📝 Logs détaillés

Le système affiche maintenant dans la console :
- ✅ Toutes les requêtes API
- ✅ Les réponses reçues
- ✅ Les erreurs détaillées
- ✅ Le texte brut de la réponse

**Ouvrez la console (F12) pour voir tous les détails !**

---

**Le problème devrait être visible dans la console maintenant.** 🔍

