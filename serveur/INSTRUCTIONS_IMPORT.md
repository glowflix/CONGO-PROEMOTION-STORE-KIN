# 📊 Guide d'Importation Professionnel - Google Sheets

## 🎯 Vue d'ensemble

Ce dossier contient tous les fichiers CSV prêts à être importés dans Google Sheets pour configurer votre base de données Congo Promotion Store.

## 📋 Étapes d'importation

### Étape 1 : Créer le Spreadsheept

1. Allez sur [sheets.google.com](https://sheets.google.com)
2. Créez un nouveau spreadsheet
3. Renommez-le en **"CongoPromotionDB"**

### Étape 2 : Créer les onglets

Créez les 8 onglets suivants (clic droit sur l'onglet existant > Insérer une feuille) :

1. **Products** - Produits du store
2. **Videos** - Vidéos de démonstration
3. **AI_KB** - Base de connaissances pour l'IA
4. **Users** - Utilisateurs
5. **Comments** - Commentaires
6. **ProductLikes** - Likes sur produits
7. **Reviews** - Avis clients
8. **AI_Logs** - Logs de l'assistant IA

### Étape 3 : Importer les données

Pour chaque onglet :

1. **Ouvrez l'onglet** correspondant
2. **Fichier** > **Importer** > **Télécharger**
3. **Sélectionnez le fichier CSV** du dossier `serveur/`
4. **Choisissez** : "Remplacer la feuille de calcul"
5. **Cliquez sur** "Importer les données"

**Ordre recommandé :**
1. Users (d'abord)
2. Products
3. Videos
4. AI_KB
5. Comments (vide pour l'instant)
6. ProductLikes (vide)
7. Reviews (vide)
8. AI_Logs (vide)

### Étape 4 : Vérifier les données

Après import, vérifiez que :

- ✅ **Toutes les colonnes** sont présentes
- ✅ **Les types de données** sont corrects :
  - Nombres : `price`, `stock`, `ratingAvg`, etc.
  - Booléens : `TRUE` ou `FALSE` pour `isPublic`, `isNew`, `isPromo`
  - Dates : Format ISO `2024-01-01T10:00:00Z`
  - JSON : `imagesJson` doit être un JSON valide
- ✅ **Les URLs** sont complètes et accessibles

## 📁 Fichiers disponibles

| Fichier | Description | Lignes |
|---------|-------------|--------|
| `Products.csv` | 6 produits d'exemple complets | 7 (header + 6 produits) |
| `Videos.csv` | 2 vidéos de démonstration | 3 (header + 2 vidéos) |
| `AI_KB.csv` | 5 intents pour l'assistant IA | 6 (header + 5 intents) |
| `Users.csv` | 2 utilisateurs d'exemple | 3 (header + 2 users) |
| `Comments.csv` | Structure vide (header uniquement) | 1 |
| `ProductLikes.csv` | Structure vide (header uniquement) | 1 |
| `Reviews.csv` | Structure vide (header uniquement) | 1 |
| `AI_Logs.csv` | Structure vide (header uniquement) | 1 |

## 🔧 Configuration des URLs

### Images et Vidéos

Les URLs dans les fichiers CSV sont des **exemples** (Unsplash, Pexels). 

**Pour vos propres fichiers Google Drive :**

1. Uploadez vos fichiers dans Google Drive
2. Partagez en "Tous ceux qui ont le lien peuvent voir"
3. Obtenez l'ID depuis l'URL :
   ```
   https://drive.google.com/file/d/1ABC123XYZ/view
   ID = 1ABC123XYZ
   ```
4. Construisez l'URL :
   ```
   https://drive.google.com/uc?export=view&id=1ABC123XYZ
   ```
5. Remplacez dans la colonne correspondante

### Modèles 3D

Pour les modèles 3D (.glb) :
- Uploadez dans Google Drive
- Utilisez le même format d'URL
- **Important** : Compressez les fichiers pour le mobile

## 📝 Structure des colonnes

### Products
```
id | title | description | price | currency | stock | category | 
coverImageUrl | imagesJson | model3dUrl | videoUrl | 
ratingAvg | ratingCount | likesCount | commentsCount | 
isPublic | isNew | isPromo | createdAt | updatedAt
```

### Videos
```
id | title | videoUrl | coverUrl | productId | 
likesCount | commentsCount | viewsCount | createdAt
```

### AI_KB
```
id | intent | keywords | answer_fr | answer_en | answer_ln | 
priority | updatedAt
```

### Users
```
id | displayName | avatarUrl | emailHash | role | 
theme | createdAt | lastSeenAt | status
```

## ⚠️ Points d'attention

### 1. Format JSON pour imagesJson

Dans Products, la colonne `imagesJson` doit contenir un JSON valide :
```json
["https://url1.com","https://url2.com","https://url3.com"]
```

### 2. Booléens

Les colonnes booléennes (`isPublic`, `isNew`, `isPromo`) doivent être :
- `TRUE` pour vrai
- `FALSE` pour faux

### 3. Dates

Format ISO 8601 : `2024-01-01T10:00:00Z`

### 4. IDs uniques

Tous les IDs doivent être uniques :
- Products : `PROD_` + timestamp + suffixe
- Videos : `VID_` + timestamp + suffixe
- Users : `USER_` + timestamp + suffixe
- etc.

## ✅ Checklist finale

Avant de configurer Apps Script :

- [ ] Tous les onglets sont créés
- [ ] Tous les fichiers CSV sont importés
- [ ] Les colonnes sont correctes
- [ ] Les types de données sont valides
- [ ] Les URLs sont accessibles (ou remplacées)
- [ ] Les booléens sont TRUE/FALSE
- [ ] Les dates sont au format ISO
- [ ] Les JSON sont valides

## 🔗 Prochaines étapes

1. **Copiez l'ID du Spreadsheet** depuis l'URL :
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

2. **Ouvrez `Code.gs`** dans le projet principal

3. **Remplacez** `YOUR_SPREADSHEET_ID` par votre ID

4. **Déployez Apps Script** en Web App

5. **Testez** les endpoints API

## 📞 Support

Si vous rencontrez des problèmes :
- Vérifiez que les noms des onglets correspondent exactement
- Vérifiez le format des données
- Consultez les logs Apps Script

---

**Généré automatiquement** - Congo Promotion Store  
**Date** : ${new Date().toLocaleString('fr-FR')}

