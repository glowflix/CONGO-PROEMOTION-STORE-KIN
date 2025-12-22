# 🔧 Correction - Paramètres vides

## ❌ Problème

Les logs montrent :
```
Paramètres reçus: {}
```

Cela signifie qu'Apps Script ne reçoit pas les paramètres de l'URL.

## ✅ Solution appliquée

Le code a été amélioré pour :
1. **Parser manuellement `queryString`** si `parameter` est vide
2. **Fusionner les paramètres** dans `e.parameter`
3. **Logger plus d'informations** pour déboguer

## 📝 Prochaines étapes

### 1. Copiez le code mis à jour

Copiez `serveur/Code.gs` dans Apps Script et redéployez.

### 2. Testez à nouveau

Après redéploiement, les logs devraient montrer :
```
e.parameter: {}
e.queryString: route=products&limit=20&filter=all
⚠️ e.parameter est vide, parsing queryString manuellement...
Paramètres parsés depuis queryString: {"route":"products","limit":"20","filter":"all"}
e.parameter après fusion: {"route":"products","limit":"20","filter":"all"}
✅ Route détectée (méthode 1 - parameter.route): products
```

### 3. Si queryString est aussi vide

Si `e.queryString` est aussi vide, le problème vient de l'URL générée côté frontend. Vérifiez :
- L'URL dans la console du navigateur (F12)
- Que l'URL contient bien `?route=products&limit=20`

## 🧪 Test direct

Testez cette URL directement dans votre navigateur :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

**Si vous voyez du JSON** → L'API fonctionne  
**Si vous voyez "Route manquante"** → Regardez les logs pour voir si `queryString` est vide

## 📋 Checklist

- [ ] Code `serveur/Code.gs` copié dans Apps Script
- [ ] Apps Script redéployé
- [ ] Page frontend rechargée (Ctrl+F5)
- [ ] Logs Apps Script vérifiés (regardez `queryString`)

---

**Le code parse maintenant manuellement les paramètres si nécessaire. Copiez et testez !** ✅

