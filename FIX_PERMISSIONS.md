# 🔧 Correction Erreur Permissions Google Sheets

## ❌ Erreur actuelle

```
{"error":"Exception: Unexpected error while getting the method or property openById on object SpreadsheetApp."}
```

## ✅ Solution - Autoriser l'accès au Google Sheets

Cette erreur signifie que **Apps Script n'a pas les permissions** pour accéder à votre Google Sheets.

### Étape 1 : Exécuter une fonction de test (OBLIGATOIRE)

1. **Allez sur [script.google.com](https://script.google.com)**
2. **Ouvrez** votre projet Apps Script
3. **Dans l'éditeur**, sélectionnez la fonction **`testConnection`** dans le menu déroulant (en haut)
4. **Cliquez** sur le bouton **▶️ Exécuter** (triangle vert)
5. **Google va demander les permissions** → Cliquez sur **"Autoriser l'accès"**
6. **Sélectionnez votre compte Google**
7. **Cliquez sur "Avancé"** puis **"Aller à [nom du projet] (non sécurisé)"**
8. **Autorisez** toutes les permissions demandées

### Étape 2 : Vérifier que le spreadsheet existe

1. **Ouvrez** cette URL dans votre navigateur :
   ```
   https://docs.google.com/spreadsheets/d/1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q/edit
   ```
2. **Vérifiez** que le spreadsheet s'ouvre correctement
3. **Vérifiez** que vous avez les **permissions d'édition** (pas seulement lecture)

### Étape 3 : Vérifier les onglets dans le spreadsheet

Assurez-vous que votre Google Sheets contient ces onglets :
- ✅ `Products`
- ✅ `Users`
- ✅ `Comments`
- ✅ `ProductLikes`
- ✅ `Reviews`
- ✅ `Videos`
- ✅ `AI_KB`
- ✅ `AI_Logs`

### Étape 4 : Tester à nouveau

1. **Rechargez** votre page frontend (Ctrl+F5)
2. **Ouvrez** la console (F12)
3. **Regardez** les messages

Vous devriez maintenant voir :
- ✅ `[API] GET products`
- ✅ `[API] Response status: 200`
- ✅ `[API] Succès:` avec les données

## 🧪 Fonction de test à ajouter dans Apps Script

Ajoutez cette fonction dans votre `Code.gs` pour tester la connexion :

```javascript
function testConnection() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Products');
    if (sheet) {
      Logger.log('✅ Connexion réussie !');
      Logger.log('Nombre de lignes: ' + sheet.getLastRow());
      return 'Connexion réussie !';
    } else {
      Logger.log('❌ L\'onglet Products n\'existe pas');
      return 'L\'onglet Products n\'existe pas';
    }
  } catch (error) {
    Logger.log('❌ Erreur: ' + error.toString());
    return 'Erreur: ' + error.toString();
  }
}
```

## 📝 Checklist

- [ ] Apps Script ouvert
- [ ] Fonction `testConnection` exécutée
- [ ] Permissions accordées à Apps Script
- [ ] Spreadsheet accessible via l'URL
- [ ] Tous les onglets existent dans le spreadsheet
- [ ] Page frontend rechargée
- [ ] Test dans la console

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifiez** que vous utilisez le **bon compte Google** (celui qui possède le spreadsheet)
2. **Vérifiez** que le **SPREADSHEET_ID** dans `Code.gs` est correct
3. **Créez un nouveau spreadsheet** et copiez les données si nécessaire
4. **Partagez** le spreadsheet avec le compte qui exécute Apps Script

---

**L'étape la plus importante est d'exécuter une fonction dans Apps Script pour déclencher la demande de permissions.** ✅

