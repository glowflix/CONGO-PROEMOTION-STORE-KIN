# 🚀 Guide Live Server - Test Local

## 📦 Installation Live Server

### Dans VS Code :

1. **Ouvrez VS Code**
2. Allez dans **Extensions** (Ctrl+Shift+X)
3. Recherchez **"Live Server"** par Ritwick Dey
4. Cliquez sur **"Installer"**

## 🎯 Utilisation

### Méthode 1 : Clic droit (Recommandé)

1. **Ouvrez** `index.html` dans VS Code
2. **Clic droit** sur le fichier
3. Sélectionnez **"Open with Live Server"**
4. Le site s'ouvre automatiquement dans votre navigateur !

### Méthode 2 : Bouton dans la barre

1. En bas à droite de VS Code, cliquez sur **"Go Live"**
2. Le serveur démarre
3. Ouvrez `http://localhost:5500` dans votre navigateur

### Méthode 3 : Commande

1. Appuyez sur **F1** ou **Ctrl+Shift+P**
2. Tapez **"Live Server: Open with Live Server"**
3. Entrez

## ✅ Configuration actuelle

Votre API Apps Script est déjà configurée :
```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec
```

Le fichier `assets/js/api.js` contient déjà cette URL.

## 🧪 Test rapide

1. **Démarrez Live Server** (clic droit sur `index.html` > Open with Live Server)
2. Le site s'ouvre automatiquement
3. **Ouvrez la console** (F12) pour voir les requêtes API
4. Testez les fonctionnalités :
   - Navigation entre les pages
   - Ajout au panier
   - Thème dark/light
   - Recherche de produits

## 🔍 Vérifier que l'API fonctionne

Ouvrez la console du navigateur (F12) et regardez :

- ✅ **Requêtes réussies** : Status 200
- ❌ **Erreurs CORS** : Vérifiez que Apps Script est déployé avec "Tous les utilisateurs"
- ❌ **Erreur 404** : Vérifiez l'URL dans `api.js`

## 📝 Test manuel de l'API

Ouvrez cette URL dans votre navigateur pour tester directement :

```
https://script.google.com/macros/s/AKfycbw35cUqBRv42tuFZdOUKL1TgooinmDKcg8PDs4Xxh9I3-KmAhx6vpJofSDvdeNr59AH/exec?route=products&limit=5
```

Vous devriez voir du JSON avec vos produits !

## 🎨 Avantages de Live Server

- ✅ **Rechargement automatique** quand vous modifiez les fichiers
- ✅ **Pas de commande à taper**
- ✅ **Port par défaut** : 5500
- ✅ **Hot reload** instantané

## 🛑 Arrêter Live Server

- Cliquez sur **"Port: 5500"** en bas à droite
- Ou **clic droit** > **"Stop Live Server"**

## 🔧 Configuration personnalisée

Le fichier `.vscode/settings.json` est déjà configuré avec :
- Port : 5500
- Rechargement automatique
- Ignore des fichiers inutiles

## 📱 Test sur mobile (même réseau WiFi)

1. Trouvez votre IP locale :
   - Windows : `ipconfig` → IPv4
   - Mac/Linux : `ifconfig` → inet

2. Sur votre téléphone, ouvrez :
   ```
   http://VOTRE_IP:5500
   ```
   Exemple : `http://192.168.1.100:5500`

## ✅ Checklist de test

- [ ] Live Server installé
- [ ] Site s'ouvre dans le navigateur
- [ ] Console ouverte (F12)
- [ ] API répond (vérifier dans Network)
- [ ] Produits s'affichent
- [ ] Panier fonctionne
- [ ] Thème fonctionne
- [ ] Navigation fonctionne

## 🐛 Dépannage

### "Live Server" n'apparaît pas
- Vérifiez que l'extension est installée
- Redémarrez VS Code

### Port déjà utilisé
- Changez le port dans `.vscode/settings.json`
- Ou arrêtez l'autre processus

### L'API ne répond pas
- Vérifiez l'URL dans `assets/js/api.js`
- Testez l'URL directement dans le navigateur
- Vérifiez les logs Apps Script

---

**C'est tout ! Lancez Live Server et testez ! 🚀**

