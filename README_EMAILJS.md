# Guide de Configuration EmailJS - PETROCI Recrutement

## 📋 Fichiers créés

1. **EMAILJS_SETUP.md** — Guide complet de configuration EmailJS
2. **emailjs-config.js** — Configuration EmailJS (À COMPLÉTER)
3. **emailjs-config.js.example** — Exemple de configuration
4. **petroci-recrutement-new.js** — Version mise à jour du JS
5. **.gitignore** — Protéger les fichiers sensibles

## 🚀 Prochaines étapes

### 1. Remplacer l'ancien JS
```bash
# Supprimer l'ancien et renommer le nouveau
rm petroci-recrutement.js
mv petroci-recrutement-new.js petroci-recrutement.js
```

### 2. Configurer EmailJS

**Lire attentivement**: [EMAILJS_SETUP.md](EMAILJS_SETUP.md)

Résumé rapide :
- Créer un compte sur [emailjs.com](https://emailjs.com)
- Ajouter un service email (Gmail, Outlook, etc.)
- Créer 2 templates d'email (voir EMAILJS_SETUP.md)
- Copier votre **Public Key**, **Service ID**, et **Template IDs**
- Remplir `emailjs-config.js` avec vos vraies valeurs

### 3. Remplir emailjs-config.js

```javascript
const EMAILJS_CONFIG = {
  publicKey: 'votre_public_key_ici',      // 👈 De Account > API Keys
  serviceId: 'service_abc123xyz',         // 👈 De Email Services
  templateAdminId: 'template_admin_recruitment',
  templateUserConfirmId: 'template_candidate_confirmation',
  adminEmail: 'recrutement@petroci.ci'
};
```

### 4. Tester en local

```bash
# Ouvrir dans un navigateur
file:///chemin/vers/petroci-recrutement.html
```

Remplir le formulaire et soumettre. Vérifier :
- Email reçu à l'admin
- Email de confirmation au candidat
- Pas d'erreur en console (F12 > Console)

## 🔒 Sécurité

- ✅ `emailjs-config.js` est dans `.gitignore` — ne sera pas commité
- ✅ Commiter uniquement `emailjs-config.js.example` pour la documentation
- ✅ La public key d'EmailJS est publique par nature (côté client)
- ⚠️ Ne jamais mettre vos vraies clés sur GitHub

## 📊 Structure des templates EmailJS

### Template Admin : `template_admin_recruitment`
```
Reçoit les données du formulaire du candidat
Variables disponibles : {{employee_id}}, {{full_name}}, {{phone}}, etc.
Destinataire : recrutement@petroci.ci
```

### Template Candidat : `template_candidate_confirmation`
```
Confirmation automatique au candidat
Variables disponibles : {{first_name}}, {{ref_number}}, {{phone}}, etc.
Destinataire : Le téléphone du candidat (identifiant unique)
```

## 🐛 Dépannage

**EmailJS non défini** :
- Vérifier que le script `https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js` se charge
- Vérifier la console (F12) pour les erreurs réseau

**Erreur "Configuration non disponible"** :
- Vérifier que `emailjs-config.js` est dans le même répertoire que `petroci-recrutement.html`
- Vérifier les valeurs dans `EMAILJS_CONFIG`

**Emails non reçus** :
- Vérifier que le service email est bien configuré dans EmailJS
- Vérifier la limite gratuite (500 emails/mois)
- Vérifier que les templates existent et sont publiés

## 📞 Support

- **EmailJS Docs** : https://www.emailjs.com/docs/
- **Forum EmailJS** : https://github.com/emailjs-com/emailjs-sdk
- **PETROCI** : recrutement@petroci.ci

---

**Status** : ✅ Configuration EmailJS ready — awaiting your credentials
