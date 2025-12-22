# 📦 Configuration Sheets pour le système de livraison

## 📋 Vue d'ensemble

Le système de livraison nécessite 2 nouveaux onglets dans votre Google Sheets :

1. **Deliveries** - Pour stocker les commandes de livraison
2. **DeliveryDrivers** - Pour stocker les informations des livreurs

## 🗂️ Structure des onglets

### 1. Onglet "Deliveries" (Livraisons)

Créez un nouvel onglet nommé **"Deliveries"** avec les colonnes suivantes (dans cet ordre) :

| Colonne | Type | Description | Exemple |
|---------|------|-------------|---------|
| id | TEXT | ID unique de la livraison | DELIV_1704067200000_abc123 |
| customerName | TEXT | Nom complet du client | Jean Dupont |
| customerPhone | TEXT | Téléphone du client | +243 900 000 000 |
| customerAddress | TEXT | Adresse complète du client | Avenue X, Quartier Y, Kinshasa |
| customerLat | NUMBER | Latitude de l'adresse client | -4.3276 |
| customerLng | NUMBER | Longitude de l'adresse client | 15.3136 |
| items | TEXT | JSON array des produits commandés | [{"id":"PROD_123","title":"...","quantity":2}] |
| subtotal | NUMBER | Sous-total en CDF | 50000 |
| deliveryFee | NUMBER | Frais de livraison en CDF | 5000 |
| total | NUMBER | Total en CDF | 55000 |
| storeLat | NUMBER | Latitude du magasin | -4.3276 |
| storeLng | NUMBER | Longitude du magasin | 15.3136 |
| status | TEXT | Statut: pending/assigned/in_transit/delivered | pending |
| driverId | TEXT | ID du livreur assigné | DRIVER_123 |
| driverName | TEXT | Nom du livreur | Marc Livreur |
| driverPhone | TEXT | Téléphone du livreur | +243 900 111 222 |
| driverVehicle | TEXT | Type de véhicule: moto/taxi/car | moto |
| driverLocation | TEXT | JSON de la position du livreur | {"lat":-4.3276,"lng":15.3136} |
| createdAt | DATETIME | Date de création | 2024-01-01T10:00:00Z |
| updatedAt | DATETIME | Dernière mise à jour | 2024-01-01T10:30:00Z |

**Exemple de ligne :**
```
DELIV_1704067200000_abc123 | Jean Dupont | +243 900 000 000 | Avenue X, Quartier Y | -4.3276 | 15.3136 | [{"id":"PROD_123","title":"Smartphone","quantity":1,"price":50000}] | 50000 | 5000 | 55000 | -4.3276 | 15.3136 | assigned | DRIVER_123 | Marc Livreur | +243 900 111 222 | moto | {"lat":-4.3276,"lng":15.3136} | 2024-01-01T10:00:00Z | 2024-01-01T10:30:00Z
```

### 2. Onglet "DeliveryDrivers" (Livreurs)

Créez un nouvel onglet nommé **"DeliveryDrivers"** avec les colonnes suivantes (dans cet ordre) :

| Colonne | Type | Description | Exemple |
|---------|------|-------------|---------|
| id | TEXT | ID unique du livreur | DRIVER_1704067200000_xyz789 |
| name | TEXT | Nom complet du livreur | Marc Livreur |
| phone | TEXT | Téléphone WhatsApp | +243 900 111 222 |
| vehicle | TEXT | Type de véhicule: moto/taxi/car | moto |
| avatar | TEXT | URL de la photo de profil | https://example.com/avatar.jpg |
| rating | NUMBER | Note moyenne (0-5) | 4.8 |
| location | TEXT | JSON de la position actuelle | {"lat":-4.3276,"lng":15.3136} |
| status | TEXT | Statut: available/busy/offline | available |
| createdAt | DATETIME | Date de création | 2024-01-01T10:00:00Z |
| updatedAt | DATETIME | Dernière mise à jour | 2024-01-01T11:00:00Z |

**Exemple de ligne :**
```
DRIVER_1704067200000_xyz789 | Marc Livreur | +243 900 111 222 | moto | https://example.com/avatar.jpg | 4.8 | {"lat":-4.3276,"lng":15.3136} | available | 2024-01-01T10:00:00Z | 2024-01-01T11:00:00Z
```

## 📝 Instructions de création

### Méthode 1 : Création manuelle

1. Ouvrez votre Google Sheets "CongoPromotionDB"
2. Cliquez sur le bouton "+" en bas pour ajouter un nouvel onglet
3. Renommez l'onglet en "Deliveries"
4. Dans la première ligne, ajoutez toutes les colonnes listées ci-dessus
5. Répétez pour créer l'onglet "DeliveryDrivers"

### Méthode 2 : Import CSV

Vous pouvez créer des fichiers CSV avec les en-têtes et les importer :

**Deliveries.csv :**
```csv
id,customerName,customerPhone,customerAddress,customerLat,customerLng,items,subtotal,deliveryFee,total,storeLat,storeLng,status,driverId,driverName,driverPhone,driverVehicle,driverLocation,createdAt,updatedAt
```

**DeliveryDrivers.csv :**
```csv
id,name,phone,vehicle,avatar,rating,location,status,createdAt,updatedAt
DRIVER_1704067200000_xyz789,Marc Livreur,+243 900 111 222,moto,https://example.com/avatar.jpg,4.8,{"lat":-4.3276,"lng":15.3136},available,2024-01-01T10:00:00Z,2024-01-01T11:00:00Z
```

Puis importez dans Google Sheets via **Fichier > Importer**.

## 🔧 Notes importantes

1. **Format JSON** : Les colonnes `items` et `driverLocation` doivent contenir du JSON valide
2. **Coordonnées** : Les latitudes et longitudes doivent être des nombres (pas de texte)
3. **Dates** : Utilisez le format ISO 8601 : `2024-01-01T10:00:00Z`
4. **Statuts** : 
   - Livraisons : `pending`, `assigned`, `in_transit`, `delivered`
   - Livreurs : `available`, `busy`, `offline`
5. **Véhicules** : `moto`, `taxi`, `car` (ou `voiture`)

## ✅ Vérification

Après création, vérifiez que :

- ✅ Les 2 onglets existent dans votre Sheets
- ✅ Toutes les colonnes sont présentes (dans le bon ordre)
- ✅ La première ligne contient les en-têtes
- ✅ Le nom des onglets correspond exactement : `Deliveries` et `DeliveryDrivers`

## 🚀 Utilisation

Une fois les onglets créés, le système de livraison fonctionnera automatiquement :

1. Les clients peuvent commander sur `/livraison.html`
2. Les commandes sont enregistrées dans l'onglet "Deliveries"
3. Les livreurs peuvent être assignés via l'API
4. Le suivi en temps réel fonctionne via les mises à jour de position

