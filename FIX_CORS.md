# 🔧 Solution CORS - Apps Script

## ❌ Problème identifié

**Erreur CORS** : `Access-Control-Allow-Origin header is not present`

C'est un problème courant avec Apps Script. La solution est dans le code, mais vous devez aussi vérifier le déploiement.

## ✅ Solution 1 : Code corrigé (Déjà fait)

Le code a été mis à jour pour gérer CORS correctement avec `redirect: 'follow'`.

## ✅ Solution 2 : Vérifier le déploiement Apps Script

### Étapes importantes :

1. **Allez sur [script.google.com](https://script.google.com)**
2. **Ouvrez votre projet**
3. **Déployer** > **Gérer les déploiements**
4. **Cliquez sur l'icône ✏️** (modifier) à côté de votre déploiement
5. **Vérifiez ces paramètres** :
   - ✅ **Type** : Application Web
   - ✅ **Exécuter en tant que** : Moi
   - ✅ **Accès** : **"Tous les utilisateurs"** ⚠️ IMPORTANT
6. **Cliquez sur "Déployer"** (même si rien n'a changé)

### ⚠️ Important

- **"Tous les utilisateurs"** est OBLIGATOIRE pour CORS
- Si c'est "Seulement moi", vous aurez toujours l'erreur CORS
- Redéployez même si les paramètres sont déjà corrects

## ✅ Solution 3 : Alternative (si CORS persiste)

Si le problème persiste après avoir vérifié le déploiement, utilisez cette méthode dans `api.js` :

```javascript
// Pour les requêtes GET, utiliser directement l'URL sans headers
const response = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow',
    // Pas de headers pour GET avec Apps Script
});
```

## 🧪 Test après correction

1. **Rechargez la page** (Ctrl+F5)
2. **Ouvrez la console** (F12)
3. **Tapez** : `window.debugAPI.test('products', { limit: 5 })`
4. **Vérifiez** que ça fonctionne

## 📝 Vérification finale

Dans la console, vous devriez voir :
- ✅ `[API] GET products` - Requête envoyée
- ✅ `[API] Response status: 200` - Succès
- ✅ `[API] Succès:` avec les données JSON

Si vous voyez encore CORS :
- Vérifiez le déploiement Apps Script
- Assurez-vous que "Accès" = "Tous les utilisateurs"
- Redéployez

---

**Le code est corrigé. Vérifiez maintenant le déploiement Apps Script !** ✅

