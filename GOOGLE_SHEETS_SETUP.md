# Configuration Google Sheets - Congo Promotion Store

## Instructions de configuration

1. Créez un nouveau Google Sheets nommé **"CongoPromotionDB"**
2. Créez les onglets suivants avec les colonnes indiquées
3. Remplacez `YOUR_SPREADSHEET_ID` dans `Code.gs` par l'ID de votre spreadsheet

## Structure des feuilles

### 1. Users (Utilisateurs)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | UUID unique (ex: USER_1234567890_abc123) |
| displayName | TEXT | Nom d'affichage |
| avatarUrl | TEXT | URL de l'avatar (optionnel) |
| emailHash | TEXT | Hash de l'email (SHA256) |
| role | TEXT | user/admin/mod |
| theme | TEXT | dark/light/auto |
| createdAt | DATETIME | Date de création |
| lastSeenAt | DATETIME | Dernière connexion |
| status | TEXT | active/banned |

**Données d'exemple :**
```
id: USER_1704067200000_abc123
displayName: Jean Dupont
emailHash: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542b
role: user
theme: dark
createdAt: 2024-01-01T10:00:00Z
lastSeenAt: 2024-01-15T14:30:00Z
status: active
```

### 2. Products (Produits)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique (ex: PROD_1234567890_xyz789) |
| title | TEXT | Titre du produit |
| description | TEXT | Description complète |
| price | NUMBER | Prix en CDF |
| currency | TEXT | CDF/USD/EUR |
| stock | NUMBER | Quantité en stock |
| category | TEXT | electronique/vetements/maison/sport/beaute |
| coverImageUrl | TEXT | URL image principale (Google Drive) |
| imagesJson | TEXT | JSON array d'URLs d'images |
| model3dUrl | TEXT | URL du modèle 3D .glb (Google Drive) |
| videoUrl | TEXT | URL vidéo (optionnel) |
| ratingAvg | NUMBER | Note moyenne (0-5) |
| ratingCount | NUMBER | Nombre d'avis |
| likesCount | NUMBER | Nombre de likes |
| commentsCount | NUMBER | Nombre de commentaires |
| isPublic | BOOLEAN | true/false |
| isNew | BOOLEAN | Produit nouveau ? |
| isPromo | BOOLEAN | Produit en promo ? |
| createdAt | DATETIME | Date de création |
| updatedAt | DATETIME | Dernière mise à jour |

**Données d'exemple :**
```
id: PROD_1704067200000_xyz789
title: Smartphone Android 128GB
description: Smartphone Android avec écran 6.5 pouces, 128GB de stockage, appareil photo 48MP
price: 150000
currency: CDF
stock: 25
category: electronique
coverImageUrl: https://drive.google.com/uc?export=view&id=1ABC123...
imagesJson: ["https://drive.google.com/uc?export=view&id=1ABC123...", "https://drive.google.com/uc?export=view&id=1DEF456..."]
model3dUrl: https://drive.google.com/uc?export=view&id=1GLB789...
videoUrl: https://drive.google.com/uc?export=view&id=1VIDEO123...
ratingAvg: 4.5
ratingCount: 12
likesCount: 45
commentsCount: 8
isPublic: TRUE
isNew: TRUE
isPromo: FALSE
createdAt: 2024-01-01T10:00:00Z
updatedAt: 2024-01-10T15:30:00Z
```

### 3. Comments (Commentaires)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique (ex: COMM_1234567890_def456) |
| productId | TEXT | ID du produit |
| userId | TEXT | ID de l'utilisateur |
| content | TEXT | Contenu du commentaire |
| parentId | TEXT | ID du commentaire parent (réponses) |
| likesCount | NUMBER | Nombre de likes |
| status | TEXT | pending/approved/hidden |
| createdAt | DATETIME | Date de création |

**Données d'exemple :**
```
id: COMM_1704067200000_def456
productId: PROD_1704067200000_xyz789
userId: USER_1704067200000_abc123
content: Excellent produit, je recommande !
parentId: 
likesCount: 3
status: approved
createdAt: 2024-01-05T12:00:00Z
```

### 4. ProductLikes (Likes produits)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique |
| productId | TEXT | ID du produit |
| userId | TEXT | ID de l'utilisateur |
| createdAt | DATETIME | Date du like |

### 5. Reviews (Avis)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique (ex: REV_1234567890_ghi789) |
| productId | TEXT | ID du produit |
| userId | TEXT | ID de l'utilisateur |
| rating | NUMBER | Note 1-5 |
| content | TEXT | Contenu de l'avis |
| status | TEXT | pending/approved/hidden |
| createdAt | DATETIME | Date de création |

**Données d'exemple :**
```
id: REV_1704067200000_ghi789
productId: PROD_1704067200000_xyz789
userId: USER_1704067200000_abc123
rating: 5
content: Produit de qualité, livraison rapide. Je suis très satisfait !
status: approved
createdAt: 2024-01-08T14:00:00Z
```

### 6. Videos (Vidéos)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique |
| title | TEXT | Titre de la vidéo |
| videoUrl | TEXT | URL de la vidéo (Google Drive) |
| coverUrl | TEXT | URL de la miniature |
| productId | TEXT | ID du produit associé (optionnel) |
| likesCount | NUMBER | Nombre de likes |
| commentsCount | NUMBER | Nombre de commentaires |
| viewsCount | NUMBER | Nombre de vues |
| createdAt | DATETIME | Date de création |

**Données d'exemple :**
```
id: VID_1704067200000_jkl012
title: Démonstration Smartphone Android
videoUrl: https://drive.google.com/uc?export=view&id=1VIDEO456...
coverUrl: https://drive.google.com/uc?export=view&id=1COVER789...
productId: PROD_1704067200000_xyz789
likesCount: 120
commentsCount: 15
viewsCount: 1500
createdAt: 2024-01-12T10:00:00Z
```

### 7. AI_KB (Base de connaissances IA)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique |
| intent | TEXT | Intention (ex: livraison, paiement, retour) |
| keywords | TEXT | Mots-clés séparés par virgules |
| answer_fr | TEXT | Réponse en français |
| answer_en | TEXT | Réponse en anglais |
| answer_ln | TEXT | Réponse en lingala |
| priority | NUMBER | Priorité (plus élevé = plus important) |
| updatedAt | DATETIME | Dernière mise à jour |

**Données d'exemple :**
```
id: KB_001
intent: livraison
keywords: livraison,delivery,expedition,transport,quand,when,combien,how long
answer_fr: La livraison se fait sous 3-5 jours ouvrés dans toute la RDC. Les frais de livraison sont de 5000 CDF.
answer_en: Delivery takes 3-5 business days throughout DRC. Shipping costs are 5000 CDF.
answer_ln: Livraison ezali na 3-5 mikolo ya mosala na RDC mobimba. Mbongo ya livraison ezali 5000 CDF.
priority: 10
updatedAt: 2024-01-01T10:00:00Z
```

### 8. AI_Logs (Logs IA)

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | ID unique |
| userId | TEXT | ID de l'utilisateur |
| question | TEXT | Question posée |
| matchedIntent | TEXT | Intention correspondante |
| answerUsed | TEXT | Réponse utilisée |
| createdAt | DATETIME | Date de création |

## Configuration Google Drive pour les médias

### Images et vidéos

1. Créez un dossier Google Drive nommé **"CongoPromotionStore_Media"**
2. Partagez le dossier en **"Tous ceux qui ont le lien peuvent voir"**
3. Pour chaque fichier, obtenez l'ID depuis l'URL :
   - URL : `https://drive.google.com/file/d/1ABC123XYZ/view`
   - ID : `1ABC123XYZ`
4. Utilisez cette URL pour l'accès direct :
   ```
   https://drive.google.com/uc?export=view&id=1ABC123XYZ
   ```

### Modèles 3D (.glb)

1. Placez les fichiers .glb dans le même dossier Drive
2. Utilisez la même méthode d'URL pour les modèles 3D
3. **Important** : Compressez les fichiers .glb pour le mobile (utilisez des outils comme gltf-pipeline)

## Données d'exemple complètes

### Produits d'exemple (à ajouter dans Products)

1. **Smartphone Android 128GB**
   - Prix: 150000 CDF
   - Stock: 25
   - Catégorie: electronique
   - Images: Téléchargez des images de smartphone depuis internet
   - Modèle 3D: Téléchargez un modèle .glb de smartphone (sites comme Sketchfab)

2. **T-shirt Premium**
   - Prix: 25000 CDF
   - Stock: 50
   - Catégorie: vetements
   - Images: Images de t-shirt

3. **Lampadaire Moderne**
   - Prix: 75000 CDF
   - Stock: 15
   - Catégorie: maison
   - Images: Images de lampadaire

4. **Chaussures de Sport**
   - Prix: 60000 CDF
   - Stock: 30
   - Catégorie: sport
   - Images: Images de chaussures

5. **Crème Hydratante**
   - Prix: 15000 CDF
   - Stock: 100
   - Catégorie: beaute
   - Images: Images de produit beauté

### Vidéos d'exemple

Créez des vidéos verticales (format TikTok/Reels) de démonstration des produits et ajoutez-les dans la feuille Videos.

## Notes importantes

- Tous les IDs doivent être uniques
- Les dates doivent être au format ISO 8601
- Les URLs Google Drive doivent être accessibles publiquement
- Les commentaires et avis sont en statut "pending" par défaut et nécessitent modération
- Le système calcule automatiquement les moyennes de notes et les compteurs de likes

## Prochaines étapes

1. Remplir les feuilles avec vos données
2. Configurer Apps Script avec votre Spreadsheet ID
3. Déployer l'Apps Script en Web App
4. Mettre à jour l'URL dans `assets/js/api.js`

