# 📍 Guide Géolocalisation - Congo Promotion Store

## ⚠️ Pourquoi HTTPS est requis ?

La géolocalisation nécessite **HTTPS** pour des raisons de sécurité, **SAUF** pour le développement local.

## ✅ HTTP autorisé en localhost

La géolocalisation **fonctionne en HTTP** sur :
- `localhost`
- `127.0.0.1`
- `0.0.0.0`
- Réseaux locaux (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

## 🚀 Tester en local (HTTP)

### Méthode 1 : Python HTTP Server

```bash
# Dans le dossier du projet
python -m http.server 8000
```

Puis ouvrez : **http://localhost:8000**

### Méthode 2 : Live Server (VS Code)

1. Installez l'extension **"Live Server"** dans VS Code
2. Clic droit sur `index.html`
3. Sélectionnez **"Open with Live Server"**
4. Le site s'ouvre sur `http://localhost:5500`

### Méthode 3 : Node.js http-server

```bash
npx http-server -p 8000
```

Puis ouvrez : **http://localhost:8000**

## 🌐 Production (HTTPS requis)

En production, vous **DEVEZ** utiliser HTTPS :

### Option 1 : Vercel (Recommandé - Gratuit)

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Connectez votre dépôt GitHub
3. Déployez - HTTPS automatique ! ✅

### Option 2 : Netlify (Gratuit)

1. Créez un compte sur [netlify.com](https://netlify.com)
2. Glissez-déposez votre dossier
3. HTTPS automatique ! ✅

### Option 3 : GitHub Pages (Gratuit)

1. Poussez votre code sur GitHub
2. Activez GitHub Pages dans les paramètres
3. HTTPS automatique ! ✅

## 🔧 Tester sur mobile (réseau local)

### Sur le même WiFi :

1. **Trouvez votre IP locale** :
   - Windows : `ipconfig` → Cherchez "IPv4"
   - Mac/Linux : `ifconfig` → Cherchez "inet"

2. **Démarrez le serveur** :
   ```bash
   python -m http.server 8000 --bind 0.0.0.0
   ```

3. **Sur votre téléphone** :
   ```
   http://VOTRE_IP:8000
   ```
   Exemple : `http://192.168.1.100:8000`

   ⚠️ **HTTP fonctionne sur réseau local !**

## 🐛 Dépannage

### "HTTPS requis" alors que je suis sur localhost

1. Vérifiez l'URL : doit être `http://localhost:8000` (pas `file://`)
2. Utilisez un serveur local (pas juste ouvrir le fichier HTML)
3. Vérifiez la console (F12) pour les erreurs

### La géolocalisation ne fonctionne pas

1. **Vérifiez que vous utilisez un serveur** (pas `file://`)
2. **Autorisez la permission** quand le navigateur le demande
3. **Activez le GPS** sur votre appareil mobile
4. **Vérifiez les paramètres** du navigateur pour la localisation

### Sur Android : Permission ne s'ouvre pas

1. Cliquez sur le bouton **"Autoriser la position"**
2. Si ça ne fonctionne pas :
   - Ouvrez les paramètres du navigateur (3 points ⋮)
   - Allez dans "Paramètres du site"
   - Activez "Localisation"

## 📝 Notes importantes

- ✅ **HTTP fonctionne sur localhost** - Pas besoin de HTTPS pour tester
- ✅ **HTTP fonctionne sur réseau local** - Pour tester sur mobile
- ❌ **HTTPS requis en production** - Pour la sécurité
- ✅ **Vercel/Netlify offrent HTTPS gratuit** - Facile à déployer

## 💡 Astuce rapide

Pour tester rapidement :
```bash
python -m http.server 8000
```
Puis ouvrez : **http://localhost:8000**

C'est tout ! La géolocalisation fonctionnera en HTTP sur localhost. 🎉

