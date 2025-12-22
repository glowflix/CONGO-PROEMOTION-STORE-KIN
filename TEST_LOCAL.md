# 🧪 Guide de Test Local - Congo Promotion Store

## 🚀 Méthodes de test

### Option 1 : Serveur HTTP Python (Recommandé - Simple)

#### Windows / Mac / Linux

1. **Ouvrez un terminal** dans le dossier du projet :
   ```bash
   cd "C:\Users\Jeariss Director\Documents\site web\Congo Promotion Store"
   ```

2. **Python 3** (déjà installé sur la plupart des systèmes) :
   ```bash
   python -m http.server 8000
   ```
   
   OU si Python 3 n'est pas reconnu :
   ```bash
   python3 -m http.server 8000
   ```

3. **Ouvrez votre navigateur** :
   ```
   http://localhost:8000
   ```

4. **Pour arrêter** : Appuyez sur `Ctrl + C` dans le terminal

---

### Option 2 : Serveur HTTP Node.js

#### Installation (une seule fois)

1. **Installez Node.js** : [nodejs.org](https://nodejs.org)

2. **Installez http-server globalement** :
   ```bash
   npm install -g http-server
   ```

#### Utilisation

1. **Dans le dossier du projet** :
   ```bash
   http-server -p 8000
   ```

2. **Ouvrez** : `http://localhost:8000`

---

### Option 3 : Extension VS Code (Plus simple)

1. **Installez l'extension** "Live Server" dans VS Code

2. **Clic droit** sur `index.html`

3. **Sélectionnez** "Open with Live Server"

4. Le site s'ouvre automatiquement dans le navigateur

---

### Option 4 : PHP (Si installé)

```bash
php -S localhost:8000
```

---

## ⚠️ Limitations du test local

### Problèmes possibles :

1. **API Apps Script ne fonctionnera pas** sans configuration
   - Les appels API échoueront
   - Les produits ne se chargeront pas
   - Solution : Configurez d'abord Apps Script (voir README.md)

2. **CORS (Cross-Origin Resource Sharing)**
   - Certaines ressources peuvent être bloquées
   - Les images externes peuvent ne pas se charger

3. **LocalStorage fonctionne** ✅
   - Le panier sera sauvegardé
   - Le thème sera sauvegardé

## 🧪 Test sans backend (Mode démo)

Pour tester l'interface sans Apps Script, créez un fichier `assets/js/demo.js` :

```javascript
// Mode démo - Données fictives
const demoProducts = [
  {
    id: 'PROD_001',
    title: 'Smartphone Android 128GB',
    description: 'Description du produit...',
    price: 150000,
    currency: 'CDF',
    stock: 25,
    category: 'electronique',
    coverImageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    imagesJson: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
    ratingAvg: 4.5,
    ratingCount: 12,
    likesCount: 45,
    commentsCount: 8,
    isPublic: true,
    isNew: true,
    isPromo: false
  }
];

// Simuler l'API
window.ProductsAPI = {
  async getProducts() {
    return { products: demoProducts, hasMore: false };
  },
  async getProduct(id) {
    return { product: demoProducts.find(p => p.id === id) };
  }
};
```

Puis ajoutez dans `index.html` avant les autres scripts :
```html
<script src="/assets/js/demo.js"></script>
```

## ✅ Checklist de test

### Interface
- [ ] La page se charge correctement
- [ ] Le thème dark/light fonctionne
- [ ] La navigation fonctionne
- [ ] Les images s'affichent
- [ ] Le responsive fonctionne (mobile)

### Panier
- [ ] Le badge panier s'affiche
- [ ] Ajouter au panier fonctionne
- [ ] L'animation d'ajout apparaît
- [ ] Le panier sidebar s'ouvre
- [ ] Modifier la quantité fonctionne
- [ ] Supprimer un article fonctionne
- [ ] Le total se calcule correctement
- [ ] Le panier persiste (localStorage)

### Pages
- [ ] Page d'accueil (feed)
- [ ] Page store (filtres, recherche)
- [ ] Page produit (3D, commentaires, avis)
- [ ] Page vidéos
- [ ] Page profil
- [ ] Page contact

## 🔧 Dépannage

### "Cannot GET /"
- Vérifiez que vous êtes dans le bon dossier
- Vérifiez que `index.html` existe

### Port déjà utilisé
- Changez le port : `python -m http.server 8080`
- Ou arrêtez l'autre processus

### Images ne se chargent pas
- Vérifiez votre connexion internet
- Les URLs Unsplash/Pexels nécessitent internet

### Erreurs CORS
- Normal en local
- Configurez Apps Script pour tester l'API

## 📱 Test mobile

### Sur le même réseau WiFi :

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

## 🚀 Test en production (Vercel)

Pour un test complet avec API :

1. **Déployez sur Vercel** (voir README.md)
2. **Configurez Apps Script**
3. **Testez toutes les fonctionnalités**

---

## 💡 Astuce

Pour un développement plus rapide, utilisez **Live Server** dans VS Code :
- Installation automatique
- Rechargement automatique
- Pas de commande à taper

---

**Bon test ! 🎉**

