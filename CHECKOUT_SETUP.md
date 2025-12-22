# 🛒 Guide de Configuration du Système de Checkout

## ✅ Fonctionnalités Implémentées

Le système de checkout offre **3 options de commande** :

### 1. 📱 Commande par WhatsApp
- Message pré-rempli avec tous les détails de la commande
- Produits, quantités, prix unitaire, prix total
- Ouverture automatique de WhatsApp

### 2. 💳 Commande directe en ligne
- Formulaire de commande complet
- Choix du mode de paiement :
  - Mobile Money (M-Pesa, Airtel, Orange)
  - Carte bancaire (Visa, Mastercard)
- Calcul automatique du total

### 3. 🗺️ Payer sur place
- Carte Google Maps intégrée (3D professionnelle)
- Affichage de la distance et de l'itinéraire en temps réel
- Calcul depuis la position du client
- Contrôles 3D pour rotation et inclinaison

## ⚙️ Configuration

### 1. Numéro WhatsApp

Ouvrez `assets/js/checkout.js` et modifiez la configuration :

```javascript
const CHECKOUT_CONFIG = {
    whatsappNumber: '243900000000', // Remplacez par votre numéro réel
    // ...
};
```

**Format** : Numéro international sans le signe `+` (ex: `243900000000` pour +243 900 000 000)

### 2. Coordonnées du Magasin

Modifiez les coordonnées dans `assets/js/checkout.js` :

```javascript
storeLocation: {
    lat: -4.3276,  // Latitude (à ajuster)
    lng: 15.3136,  // Longitude (à ajuster)
    address: 'Congo Promotion Store, Kinshasa, RD Congo' // Adresse complète
}
```

**Comment obtenir les coordonnées** :
1. Allez sur [Google Maps](https://maps.google.com)
2. Recherchez votre magasin
3. Clic droit sur l'emplacement > "Plus d'infos sur cet endroit"
4. Copiez les coordonnées (latitude, longitude)

### 3. Google Maps API (Optionnel - pour carte 3D avancée)

Pour activer la carte 3D professionnelle avec contrôles interactifs :

1. **Obtenir une clé API Google Maps** :
   - Allez sur [Google Cloud Console](https://console.cloud.google.com)
   - Créez un projet ou sélectionnez-en un
   - Activez l'API "Maps JavaScript API"
   - Créez une clé API

2. **Ajouter la clé dans votre HTML** :

Dans `index.html`, `store.html`, ou `product.html`, ajoutez avant le script `checkout.js` :

```html
<script>
    window.GOOGLE_MAPS_API_KEY = 'VOTRE_CLE_API_ICI';
</script>
<script src="/assets/js/checkout.js"></script>
```

**Note** : Sans clé API, une carte embed simple sera utilisée (fonctionne sans configuration).

## 🎨 Personnalisation

### Styles CSS

Les styles sont dans `assets/css/checkout.css`. Vous pouvez personnaliser :
- Couleurs des options
- Tailles et espacements
- Animations

### Messages WhatsApp

Le format du message WhatsApp peut être modifié dans la méthode `updateWhatsAppMessage()` de `checkout.js`.

## 📱 Utilisation

1. Le client ajoute des produits au panier
2. Clique sur "Commander" dans le panier
3. Choisit une des 3 options :
   - **WhatsApp** : Ouvre WhatsApp avec message pré-rempli
   - **En ligne** : Remplit le formulaire et choisit le paiement
   - **Sur place** : Voit la carte avec distance et itinéraire

## 🔧 Intégration API

Pour enregistrer les commandes dans votre backend, modifiez les méthodes :

- `submitOnlineOrder()` : Envoie la commande en ligne
- `confirmPickupOrder()` : Enregistre la commande sur place

Exemple :

```javascript
async submitOnlineOrder(formData) {
    const orderData = { /* ... */ };
    
    // Envoyer à votre API
    try {
        await ProductsAPI.createOrder(orderData);
        alert('Commande enregistrée avec succès !');
    } catch (error) {
        alert('Erreur lors de l\'enregistrement de la commande');
    }
}
```

## 🐛 Dépannage

### La carte ne s'affiche pas
- Vérifiez que les coordonnées sont correctes
- Si vous utilisez l'API, vérifiez que la clé est valide
- Vérifiez la console du navigateur (F12) pour les erreurs

### WhatsApp ne s'ouvre pas
- Vérifiez que le numéro est au bon format (sans +)
- Testez sur un appareil mobile (WhatsApp Web peut avoir des limitations)

### La géolocalisation ne fonctionne pas
- Vérifiez que l'utilisateur a autorisé la géolocalisation
- Testez sur HTTPS (la géolocalisation nécessite HTTPS en production)

## 📝 Notes Importantes

- Le système fonctionne **sans clé API Google Maps** (utilise l'embed simple)
- Pour une carte 3D interactive, une clé API est recommandée
- Les commandes sont actuellement affichées dans une alerte (à connecter à votre API)
- Le panier est vidé après confirmation de commande

