# 🔍 Débogage - Problème de Route

## ❌ Erreur actuelle

```
{"error":"Route manquante. Utilisez ?route=nom_route"}
```

## ✅ Solution appliquée

Le code a été amélioré pour mieux détecter la route. Vérifiez maintenant :

### 1. Ouvrez la console du navigateur (F12)

Vous devriez voir :
```
[API] GET products {params: {...}, bodyData: null}
[API] URL complète: https://script.google.com/...?route=products&limit=20&filter=all
```

### 2. Vérifiez l'URL complète

L'URL doit contenir `?route=products` (ou la route que vous utilisez).

### 3. Testez directement dans le navigateur

Ouvrez cette URL directement :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

**Si vous voyez du JSON** → L'API fonctionne, le problème est dans le frontend  
**Si vous voyez l'erreur "Route manquante"** → Problème dans Apps Script

### 4. Vérifiez les logs Apps Script

1. Allez sur [script.google.com](https://script.google.com)
2. Ouvrez votre projet
3. **Exécutions** (menu de gauche)
4. Cliquez sur la dernière exécution
5. Regardez les logs

Vous devriez voir :
```
=== Nouvelle requête ===
Méthode: GET
Paramètres: {"route":"products","limit":"20",...}
Route détectée: products
```

## 🧪 Test rapide

Dans la console du navigateur, tapez :
```javascript
window.debugAPI.test('products', { limit: 5 })
```

Cela devrait afficher les produits ou une erreur détaillée.

## 📝 Si ça ne fonctionne toujours pas

1. **Vérifiez** que l'URL dans `assets/js/api.js` est correcte
2. **Vérifiez** que vous utilisez la bonne URL Apps Script
3. **Vérifiez** les logs Apps Script pour voir ce qui est reçu
4. **Testez** l'URL directement dans le navigateur

---

**Le code a été amélioré pour mieux détecter les routes. Testez maintenant !** ✅

