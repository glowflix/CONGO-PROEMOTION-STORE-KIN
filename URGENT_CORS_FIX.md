# 🚨 URGENT - Correction CORS

## ❌ Problème actuel

L'erreur CORS indique que **Apps Script ne renvoie pas les headers CORS nécessaires**.

## ✅ Solution IMMÉDIATE (2 minutes)

### Étape 1 : Vérifier le déploiement Apps Script

1. **Ouvrez** [script.google.com](https://script.google.com)
2. **Trouvez** votre projet "CongoPromotionStore API" (ou le nom que vous avez donné)
3. **Cliquez** sur **"Déployer"** (en haut à droite)
4. **Cliquez** sur **"Gérer les déploiements"**
5. **Cliquez** sur l'icône **✏️** (crayon) à côté de votre déploiement
6. **VÉRIFIEZ** ces paramètres :
   - ✅ **Type** : Application Web
   - ✅ **Exécuter en tant que** : Moi
   - ✅ **Accès** : **"Tous les utilisateurs"** ⚠️ **CRITIQUE**
7. **Cliquez** sur **"Déployer"** (même si rien n'a changé)

### ⚠️ IMPORTANT

Si **"Accès"** est sur **"Seulement moi"**, vous aurez **TOUJOURS** l'erreur CORS.

**"Tous les utilisateurs"** est **OBLIGATOIRE** pour que le frontend puisse accéder à l'API.

### Étape 2 : Tester après redéploiement

1. **Rechargez** votre page (Ctrl+F5)
2. **Ouvrez** la console (F12)
3. **Regardez** les messages

Vous devriez voir :
- ✅ `[API] GET products` 
- ✅ `[API] Response status: 200`
- ✅ `[API] Succès:` avec les données

## 🧪 Test rapide

Ouvrez cette URL directement dans votre navigateur :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

- **Si vous voyez du JSON** → L'API fonctionne, le problème est uniquement CORS
- **Si vous voyez une erreur** → Problème Apps Script (vérifiez les logs)

## 📝 Checklist

- [ ] Apps Script ouvert sur script.google.com
- [ ] Déploiement modifié
- [ ] Accès = **"Tous les utilisateurs"** (pas "Seulement moi")
- [ ] Redéployé
- [ ] Page rechargée (Ctrl+F5)
- [ ] Console ouverte (F12)
- [ ] Test direct de l'URL fonctionne

## 🆘 Si ça ne fonctionne toujours pas

1. **Supprimez** l'ancien déploiement
2. **Créez** un nouveau déploiement
3. **Type** : Application Web
4. **Exécuter en tant que** : Moi
5. **Accès** : **Tous les utilisateurs**
6. **Déployez**
7. **Copiez** la nouvelle URL
8. **Mettez à jour** `assets/js/api.js` ligne 4 avec la nouvelle URL

---

**Le code est corrigé. Le problème est maintenant dans le déploiement Apps Script.** ✅

