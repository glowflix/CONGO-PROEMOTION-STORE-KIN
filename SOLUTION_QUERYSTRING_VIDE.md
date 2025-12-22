# 🔧 Solution - queryString vide

## ❌ Problème identifié

Les logs montrent :
```
e.queryString: vide
e.parameter: {}
```

Cela signifie que **Apps Script ne reçoit pas les paramètres de l'URL**.

## 🔍 Causes possibles

### 1. Vous testez directement dans Apps Script

Si vous cliquez sur **▶️ Exécuter** dans l'éditeur Apps Script pour tester `doGet`, il n'y aura **pas de paramètres** car vous n'envoyez pas de requête HTTP.

**Solution** : Ne testez PAS directement dans Apps Script. Testez depuis le frontend ou via une URL directe.

### 2. L'URL générée ne contient pas les paramètres

Vérifiez dans la console du navigateur (F12) :
- Ouvrez l'onglet **Console**
- Regardez les logs `[API] URL complète:`
- L'URL doit contenir `?route=products&limit=20`

Si l'URL ne contient **PAS** les paramètres après `exec`, alors il y a un problème avec la génération de l'URL.

## ✅ Solutions

### Solution 1 : Tester depuis le frontend (RECOMMANDÉ)

1. **Ouvrez** votre page frontend dans le navigateur
2. **Ouvrez** la console (F12)
3. **Regardez** les logs `[API] URL complète:`
4. **Copiez** l'URL complète
5. **Collez-la** directement dans la barre d'adresse du navigateur
6. **Vérifiez** que vous voyez du JSON

### Solution 2 : Tester avec une URL directe

Testez cette URL directement dans votre navigateur :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

**Si vous voyez du JSON** → L'API fonctionne, le problème est dans le frontend  
**Si vous voyez "Route manquante"** → Le problème est dans Apps Script

### Solution 3 : Vérifier l'URL dans Network tab

1. **Ouvrez** F12 > **Network** (Réseau)
2. **Rechargez** la page
3. **Cherchez** la requête vers `script.google.com`
4. **Cliquez** sur la requête
5. **Regardez** l'onglet **Headers**
6. **Vérifiez** l'URL dans **Request URL**

L'URL doit ressembler à :
```
https://script.google.com/macros/s/.../exec?route=products&limit=20&filter=all
```

## 📝 Checklist

- [ ] Page frontend ouverte dans le navigateur
- [ ] Console ouverte (F12)
- [ ] Logs `[API] URL complète:` vérifiés
- [ ] URL contient `?route=products&...`
- [ ] Test direct de l'URL dans le navigateur
- [ ] Network tab vérifié

## ⚠️ Important

**NE TESTEZ PAS `doGet` directement dans Apps Script** (bouton ▶️ Exécuter).  
**Testez depuis le frontend ou via une URL directe dans le navigateur.**

---

**Vérifiez l'URL dans la console du navigateur et testez avec une URL directe !** ✅

