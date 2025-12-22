# 🧪 Test de l'API Apps Script

## ✅ Votre URL API

```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec
```

Cette URL est déjà configurée dans `assets/js/api.js` ✅

## 🧪 Tests rapides dans le navigateur

### Test 1 : Récupérer les produits
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

### Test 2 : Récupérer un produit spécifique
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=product&id=PROD_1704067200000_smartphone
```

### Test 3 : Récupérer les vidéos
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=videos&limit=5
```

## ✅ Réponse attendue

Si tout fonctionne, vous devriez voir du JSON comme :
```json
{
  "products": [
    {
      "id": "PROD_...",
      "title": "...",
      "price": 150000,
      ...
    }
  ],
  "hasMore": true
}
```

## ❌ Si vous voyez `{"error":"Route manquante"}`

Cela signifie que l'API fonctionne mais que vous devez ajouter `?route=nom_route` à l'URL.

## 🔍 Test avec Live Server

1. **Installez Live Server** dans VS Code
2. **Clic droit** sur `index.html` > **"Open with Live Server"**
3. Le site s'ouvre automatiquement
4. **Ouvrez la console** (F12) pour voir les requêtes
5. Vérifiez l'onglet **Network** pour voir les appels API

## 📊 Vérifier les logs Apps Script

1. Allez sur [script.google.com](https://script.google.com)
2. Ouvrez votre projet
3. Allez dans **"Exécutions"**
4. Vous verrez toutes les requêtes et leurs résultats

---

**Votre API est prête ! Testez avec Live Server ! 🚀**

