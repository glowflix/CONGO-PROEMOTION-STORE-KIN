# Guide pour obtenir des images et vidéos d'exemple

## 📸 Images de produits

### Sources recommandées (libres de droits)

1. **Unsplash** (https://unsplash.com)
   - Recherchez : "smartphone", "t-shirt", "lamp", "shoes", "beauty product"
   - Téléchargez en haute résolution
   - Format recommandé : JPG ou PNG, 800x800px minimum

2. **Pexels** (https://www.pexels.com)
   - Recherchez par catégorie de produit
   - Téléchargez gratuitement

3. **Pixabay** (https://pixabay.com)
   - Images libres de droits
   - Filtrez par "Free for commercial use"

### Exemples de recherches

- **Électronique** : "smartphone", "laptop", "headphones", "tablet"
- **Vêtements** : "t-shirt", "jeans", "dress", "shoes"
- **Maison** : "lamp", "furniture", "decoration", "home decor"
- **Sport** : "sports shoes", "gym equipment", "sportswear"
- **Beauté** : "cosmetics", "skincare", "makeup", "beauty product"

## 🎥 Vidéos verticales

### Format requis

- **Ratio** : 9:16 (vertical, format TikTok/Reels)
- **Résolution** : 1080x1920px minimum
- **Durée** : 15-60 secondes
- **Format** : MP4

### Sources pour vidéos

1. **Pexels Videos** (https://www.pexels.com/videos/)
   - Recherchez "product demonstration", "unboxing", "review"
   - Filtrez par orientation verticale

2. **Pixabay Videos** (https://pixabay.com/videos/)
   - Vidéos libres de droits
   - Recherchez "product", "unboxing", "review"

3. **Créer vos propres vidéos**
   - Utilisez votre smartphone en mode portrait
   - Filmez des démonstrations de produits
   - Éditez avec des apps comme CapCut, InShot

## 🎨 Modèles 3D (.glb)

### Sources pour modèles 3D

1. **Sketchfab** (https://sketchfab.com)
   - Recherchez des modèles 3D de produits
   - Filtrez par licence "CC0" ou "CC-BY" (libre)
   - Téléchargez en format .glb

2. **Poly Haven** (https://polyhaven.com)
   - Modèles 3D gratuits
   - Format GLTF/GLB disponible

3. **Google Poly** (archivé, mais certains modèles disponibles)
   - Recherchez dans les archives

### Compression des modèles 3D

Les fichiers .glb peuvent être volumineux. Pour optimiser :

1. **Utilisez gltf-pipeline** :
   ```bash
   npm install -g gltf-pipeline
   gltf-pipeline -i model.glb -o model-compressed.glb -d
   ```

2. **Ou utilisez des outils en ligne** :
   - https://gltf.report (analyse et optimisation)
   - https://github.com/KhronosGroup/glTF-Sample-Models

### Exemples de modèles à rechercher

- "smartphone 3d model"
- "shoe 3d model"
- "lamp 3d model"
- "product 3d model"

## 📤 Upload sur Google Drive

### Étapes

1. **Créez un dossier** "CongoPromotionStore_Media" dans Google Drive

2. **Uploadez vos fichiers** :
   - Images : JPG/PNG
   - Vidéos : MP4
   - Modèles 3D : .glb

3. **Partagez le dossier** :
   - Clic droit sur le dossier > Partager
   - Sélectionnez "Tous ceux qui ont le lien peuvent voir"
   - Copiez le lien

4. **Obtenez l'ID du fichier** :
   - Ouvrez le fichier dans Google Drive
   - L'URL ressemble à : `https://drive.google.com/file/d/1ABC123XYZ/view`
   - L'ID est : `1ABC123XYZ`

5. **Utilisez cette URL** :
   ```
   https://drive.google.com/uc?export=view&id=1ABC123XYZ
   ```

### Pour les images
```
https://drive.google.com/uc?export=view&id=VOTRE_ID_IMAGE
```

### Pour les vidéos
```
https://drive.google.com/uc?export=view&id=VOTRE_ID_VIDEO
```

### Pour les modèles 3D
```
https://drive.google.com/uc?export=view&id=VOTRE_ID_GLB
```

## ✅ Vérification

Avant d'ajouter dans Google Sheets, vérifiez que :

1. ✅ Les images s'affichent correctement dans le navigateur
2. ✅ Les vidéos se lisent (testez dans un lecteur vidéo)
3. ✅ Les modèles 3D se chargent (testez avec model-viewer)
4. ✅ Les fichiers sont accessibles publiquement
5. ✅ Les tailles sont raisonnables (images < 2MB, vidéos < 50MB, modèles < 10MB)

## 📝 Exemple de données complètes

### Produit : Smartphone Android

**Images** (ajoutez dans `imagesJson` en JSON) :
```json
[
  "https://drive.google.com/uc?export=view&id=1IMAGE1",
  "https://drive.google.com/uc?export=view&id=1IMAGE2",
  "https://drive.google.com/uc?export=view&id=1IMAGE3"
]
```

**Modèle 3D** :
```
https://drive.google.com/uc?export=view&id=1MODEL3D
```

**Vidéo** :
```
https://drive.google.com/uc?export=view&id=1VIDEO
```

## 🎯 Conseils

- **Images** : Utilisez des images de qualité, bien éclairées, fond neutre
- **Vidéos** : Courtes et engageantes, montrez le produit sous différents angles
- **3D** : Testez le modèle avant de l'uploader, vérifiez qu'il tourne correctement
- **Organisation** : Créez des sous-dossiers dans Drive par catégorie de produit

## ⚠️ Important

- Respectez les droits d'auteur
- Utilisez uniquement des contenus libres de droits ou que vous avez créés
- Vérifiez les licences avant utilisation commerciale
- Pour les produits réels, prenez vos propres photos/vidéos

