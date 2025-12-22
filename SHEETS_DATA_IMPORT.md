# Guide d'importation des données dans Google Sheets

## 📋 Instructions rapides

1. **Créez votre Google Sheets** nommé "CongoPromotionDB"
2. **Créez les onglets** avec les colonnes indiquées ci-dessous
3. **Copiez-collez les données** depuis les fichiers CSV générés ou utilisez le script `generate_sheets_data.js`

## 📊 Structure des colonnes

### 1. Products (Produits)

Colonnes dans l'ordre :
```
id | title | description | price | currency | stock | category | coverImageUrl | imagesJson | model3dUrl | videoUrl | ratingAvg | ratingCount | likesCount | commentsCount | isPublic | isNew | isPromo | createdAt | updatedAt
```

**Exemple de ligne :**
```
PROD_1704067200000_smartphone | Smartphone Android 128GB | Description... | 150000 | CDF | 25 | electronique | https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800 | ["url1","url2"] | https://drive.google.com/uc?export=view&id=XXX | https://videos.pexels.com/... | 4.5 | 12 | 45 | 8 | TRUE | TRUE | FALSE | 2024-01-01T10:00:00Z | 2024-01-10T15:30:00Z
```

### 2. Comments (Commentaires)

Colonnes :
```
id | productId | userId | userName | content | parentId | likesCount | status | createdAt
```

**Note :** `parentId` est vide pour les commentaires racine, et contient l'ID du commentaire parent pour les réponses.

### 3. Reviews (Avis)

Colonnes :
```
id | productId | userId | userName | rating | content | status | createdAt
```

### 4. Videos (Vidéos)

Colonnes :
```
id | title | videoUrl | coverUrl | productId | likesCount | commentsCount | viewsCount | createdAt
```

### 5. AI_KB (Base de connaissances IA)

Colonnes :
```
id | intent | keywords | answer_fr | answer_en | answer_ln | priority | updatedAt
```

## 🔧 Utilisation du script generate_sheets_data.js

### Option 1 : Node.js

```bash
node generate_sheets_data.js > sheets_data.csv
```

Puis copiez-collez dans Google Sheets.

### Option 2 : Copier-coller manuel

1. Ouvrez `generate_sheets_data.js`
2. Exécutez dans la console Node.js ou copiez les données
3. Collez dans les onglets correspondants

## 📝 Données d'exemple complètes

### Produits (6 exemples)

1. **Smartphone Android** - 150000 CDF - Électronique
2. **T-shirt Premium** - 25000 CDF - Vêtements (PROMO)
3. **Lampadaire Moderne** - 75000 CDF - Maison
4. **Chaussures Running** - 60000 CDF - Sport
5. **Crème Hydratante** - 15000 CDF - Beauté (PROMO)
6. **Laptop 15.6"** - 450000 CDF - Électronique

### Vidéos (2 exemples)

- Démonstration Smartphone
- Test Chaussures Running

### AI_KB (5 intents)

- livraison
- paiement
- retour
- stock
- contact

## ✅ Vérifications après import

1. ✅ Toutes les colonnes sont présentes
2. ✅ Les types de données sont corrects (nombres, booléens)
3. ✅ Les URLs sont complètes et accessibles
4. ✅ Les dates sont au format ISO
5. ✅ Les JSON (imagesJson) sont valides

## 🚨 Erreurs communes

### "Feuille non trouvée"
- Vérifiez que les noms des onglets correspondent exactement à ceux dans `Code.gs`

### "Données manquantes"
- Assurez-vous que toutes les colonnes sont remplies (sauf optionnelles)

### "URL invalide"
- Vérifiez que les URLs Google Drive sont au format : `https://drive.google.com/uc?export=view&id=ID`

### "JSON invalide"
- Pour `imagesJson`, utilisez le format : `["url1","url2","url3"]`

## 📤 Prochaines étapes

Après avoir importé les données :

1. Vérifiez que tout s'affiche correctement
2. Testez les fonctionnalités (commentaires, avis, likes)
3. Ajoutez vos propres produits
4. Configurez Apps Script avec votre Spreadsheet ID

