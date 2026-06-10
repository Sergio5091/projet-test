# Configuration EmailJS - PETROCI Recrutement

## 📋 Étapes de configuration

### 1. Créer un compte EmailJS
- Allez sur [emailjs.com](https://emailjs.com)
- Créez un compte gratuit (500 emails/mois)
- Connectez-vous

### 2. Ajouter un service d'email (Gmail, Outlook, etc.)
- Dans le dashboard, cliquez sur **Email Services**
- Cliquez sur **Add New Service**
- Choisissez votre service (exemple : Gmail)
- Configurez votre adresse email et mot de passe d'application
- Copier votre **Service ID** (exemple: `service_abc123xyz`)

### 3. Récupérer votre Public Key
- Allez dans **Account** > **API Keys**
- Copier votre **Public Key** (commence par `m...`)

### 4. Créer un Template d'Email

#### Template 1 : Email à l'administrateur PETROCI

**Nom du Template**: `template_admin_recruitment`

**Contenu du Template** :
```
Subject: Nouvelle candidature PETROCI - {{employee_id}}

Candidature reçue le: {{submission_date}}

--- INFORMATIONS PERSONNELLES ---
ID Employé: {{employee_id}}
Nom Complet: {{full_name}}
Téléphone: {{phone}}

--- CONTACT D'URGENCE ---
Nom: {{emergency_name}}
Téléphone: {{emergency_phone}}

--- DISPONIBILITÉ ---
Date de prise de poste: {{availability_date}}
Problème de santé: {{health_issue}}

--- DOCUMENTS ---
Statut CNPS: {{cnps_status}}
Preuve de paiement CNPS: {{cnps_proof_name}}
Pièce d'identité: {{identity_card_name}}

--- CONFIRMATIONS ---
Exactitude certifiée: {{confirm_accuracy}}
Conditions acceptées: {{accept_terms}}

Référence: {{ref_number}}
```

#### Template 2 : Email de confirmation au candidat

**Nom du Template**: `template_candidate_confirmation`

**Contenu du Template** :
```
Subject: Candidature PETROCI reçue - Référence: {{ref_number}}

Bonjour {{first_name}},

Merci pour votre candidature auprès de PETROCI !

Vos informations ont été reçues et traitées :
- ID Employé: {{employee_id}}
- Date de disponibilité: {{availability_date}}

Référence de votre dossier: {{ref_number}}

Nous vous contacterons au numéro {{phone}} dans les 48 heures pour la suite.

Cordialement,
Équipe RH PETROCI
recrutement@petroci.ci
```

### 5. Configurer les paramètres du Template

Dans EmailJS, pour chaque template, aller à **Settings** et vérifier :
- Sender Name: `PETROCI RH`
- Sender Email: Votre email configuré
- Reply To: `recrutement@petroci.ci`

### 6. Copier votre Template ID

Chaque template a un ID (exemple: `template_xyz789`). Copier les IDs de vos templates.

### 7. Mettre à jour le fichier de configuration

Ouvrir `emailjs-config.js` et remplacer :
```javascript
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',        // Votre clé publique
  serviceId: 'service_abc123',         // Service ID
  templateAdminId: 'template_admin_recruitment',     // Template pour admin
  templateUserConfirmId: 'template_candidate_confirmation'  // Template pour candidat
};
```

---

## 🧪 Tester la configuration

### Test 1 : Vérifier l'initialisation
Ouvrir la console du navigateur (F12) et exécuter:
```javascript
console.log('EmailJS initialized:', emailjs.init);
console.log('Config:', EMAILJS_CONFIG);
```

### Test 2 : Envoyer un email de test
```javascript
emailjs.send(
  EMAILJS_CONFIG.serviceId,
  EMAILJS_CONFIG.templateAdminId,
  {
    employee_id: 'TEST123',
    full_name: 'Jean Dupont',
    phone: '+225 07 00 00 00 00',
    emergency_name: 'Marie Dupont',
    emergency_phone: '+225 07 11 11 11 11',
    availability_date: '2026-07-01',
    health_issue: 'Aucun',
    cnps_status: 'Non',
    cnps_proof_name: 'test.pdf',
    identity_card_name: 'carte.jpg',
    confirm_accuracy: 'Oui',
    accept_terms: 'Oui',
    ref_number: 'PETROCI-RECRUT-2026-TEST01',
    submission_date: new Date().toLocaleDateString('fr-FR'),
    first_name: 'Jean'
  }
).then(() => {
  console.log('✅ Email envoyé avec succès!');
}).catch(err => {
  console.error('❌ Erreur:', err);
});
```

---

## ⚠️ Points importants

1. **Ne pas mettre vos vraies clés sur GitHub**
   - Ajoutez `emailjs-config.js` au `.gitignore`
   - Commettez seulement `emailjs-config.js.example`

2. **Limite gratuite EmailJS**
   - 500 emails/mois
   - Pour production, envisager un plan payant

3. **Fichiers attachés**
   - Actuellement, les fichiers (CNPS, identité) ne sont pas envoyés
   - Possible à ajouter avec `emailjs.send()` avec paramètre `attachment`

4. **Zone SMTP**
   - EmailJS supporte Gmail, Outlook, Yahoo, etc.
   - Certains services nécessitent un mot de passe d'application spécial

---

## 🔒 Variables d'environnement (Production)

Si tu déploies sur Vercel, Netlify, etc. :

1. Crée un fichier `.env.local` (ne pas committer)
```
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ADMIN=template_id_1
VITE_EMAILJS_TEMPLATE_CONFIRM=template_id_2
```

2. Dans l'interface de déploiement, ajoute ces variables dans **Environment Variables**

3. Dans le code :
```javascript
const EMAILJS_CONFIG = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateAdminId: import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN,
  templateUserConfirmId: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRM
};
```

---

## 📞 Support

- **EmailJS Docs**: https://www.emailjs.com/docs/
- **EmailJS Forum**: https://github.com/emailjs-com/emailjs-sdk
