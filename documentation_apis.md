# 🔌 Documentation des APIs - Educty Nova

## 🎯 Vue d'ensemble
Educty Nova utilise une **architecture API proxy** où les routes Next.js font office d'intermédiaire vers un backend API externe. Toutes les requêtes passent par `/api/*` et sont redirigées vers l'URL configurée dans `NEXT_PUBLIC_API_BASE_URL`.

## ⚙️ Configuration
**📂 Fichiers clés :**
- `config/axios.config.ts` - Configuration Axios
- `app/api/` - Routes API Next.js

- **Base URL** : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/`
- **Client HTTP** : Axios configuré pour les appels locaux vers `/api`
- **Authentification** : Basée sur JWT/tokens (gérée côté backend)
- **Format** : JSON pour la plupart des requêtes, FormData pour les uploads

## 🔐 Endpoints Disponibles

### 🔑 1. Authentification
**📂 Fichiers :** `app/api/login/route.ts`, `app/api/send-otp/route.ts`, `app/api/password/forgot/route.ts`

#### `POST /api/login`
- **Description** : Authentification utilisateur
- **Body** : `{ email: string, password: string }`
- **Retour** : Token JWT et informations utilisateur

#### `POST /api/password/forgot`
- **Description** : Demande de réinitialisation de mot de passe
- **Body** : `{ email: string }`
- **Retour** : Confirmation d'envoi d'email

#### `POST /api/reset-password`
- **Description** : Réinitialisation du mot de passe
- **Body** : `{ token: string, email: string, password: string, password_confirmation: string }`
- **Retour** : Confirmation de changement

#### `POST /api/send-otp`
- **Description** : Envoi de code OTP
- **Body** : `{ email: string }`
- **Retour** : Code OTP envoyé

### 👥 2. Gestion des Utilisateurs
**📂 Fichiers :** `app/api/user/route.ts`, `app/api/role/route.ts`, `app/api/permission/route.ts`

#### `/api/user`
- **GET** : Récupérer tous les utilisateurs ou un utilisateur spécifique (`?id={id}`)
- **POST** : Créer un nouvel utilisateur
- **PUT** : Modifier un utilisateur (`?id={id}`)
- **DELETE** : Supprimer un utilisateur (`?id={id}`)

#### `/api/role`
- **GET** : Récupérer les rôles disponibles
- **POST** : Créer un rôle
- **PUT** : Modifier un rôle
- **DELETE** : Supprimer un rôle

#### `/api/permission`
- **GET** : Récupérer les permissions
- **POST** : Créer une permission
- **PUT** : Modifier une permission
- **DELETE** : Supprimer une permission

### 👨‍🎓 3. Gestion des Élèves
**📂 Fichiers :** `app/api/students/route.ts`, `app/api/registration/route.ts`, `app/api/tutor/route.ts`

#### `/api/students`
- **GET** : Récupérer tous les élèves ou un élève spécifique (`?id={id}`)
- **POST** : Créer un nouvel élève (FormData)
  ```typescript
  FormData:
  - assignment_type_id: string
  - registration_number: string
  - name: string
  - first_name: string
  - birth_date: string
  - status: string
  - sexe: string
  - photo: File (optionnel)
  ```
- **PUT** : Modifier un élève (FormData avec mêmes champs)
- **DELETE** : Supprimer un élève (`?id={id}`)

#### `/api/registration`
- **GET** : Récupérer les inscriptions
- **POST** : Créer une inscription
  ```json
  {
    "class_id": number,
    "academic_year_id": number,
    "student_id": number,
    "registration_date": string,
    "discount_percentage": string | null,
    "discount_amount": string | null
  }
  ```
- **PUT** : Modifier une inscription
- **DELETE** : Supprimer une inscription

#### `/api/tutor`
- **GET** : Récupérer les tuteurs
- **POST** : Créer un tuteur
  ```json
  {
    "name": string,
    "first_name": string,
    "phone_number": string,
    "sexe": string,
    "type_tutor": string
  }
  ```
- **PUT** : Modifier un tuteur
- **DELETE** : Supprimer un tuteur

#### `/api/student/assign-tutor`
- **POST** : Assigner des tuteurs à un élève
  ```json
  {
    "student_id": string,
    "tutors": [
      {
        "id": number,
        "is_tutor_legal": 0 | 1
      }
    ]
  }
  ```

### 🎓 4. Gestion Pédagogique
**📂 Fichiers :** `app/api/classe/route.ts`, `app/api/matter/route.ts`, `app/api/professors/route.ts`

#### `/api/classe`
- **GET** : Récupérer les classes
- **POST** : Créer une classe
- **PUT** : Modifier une classe
- **DELETE** : Supprimer une classe

#### `/api/level`
- **GET** : Récupérer les niveaux
- **POST** : Créer un niveau
- **PUT** : Modifier un niveau
- **DELETE** : Supprimer un niveau

#### `/api/matter`
- **GET** : Récupérer les matières
- **POST** : Créer une matière
- **PUT** : Modifier une matière
- **DELETE** : Supprimer une matière

#### `/api/professors`
- **GET** : Récupérer les professeurs
- **POST** : Créer un professeur
- **PUT** : Modifier un professeur
- **DELETE** : Supprimer un professeur

#### `/api/notes`
- **GET** : Récupérer les notes
- **POST** : Saisir des notes
- **PUT** : Modifier des notes
- **DELETE** : Supprimer des notes

#### `/api/timeTable`
- **GET** : Récupérer les emplois du temps
- **POST** : Créer un emploi du temps
- **PUT** : Modifier un emploi du temps
- **DELETE** : Supprimer un emploi du temps

#### `/api/typeEvaluation`
- **GET** : Récupérer les types d'évaluation
- **POST** : Créer un type d'évaluation
- **PUT** : Modifier un type d'évaluation
- **DELETE** : Supprimer un type d'évaluation

#### `/api/coefficient`
- **GET** : Récupérer les coefficients
- **POST** : Créer un coefficient
- **PUT** : Modifier un coefficient
- **DELETE** : Supprimer un coefficient

### 💰 5. Gestion Financière
**📂 Fichiers :** `app/api/payment/route.ts`, `app/api/transaction/route.ts`, `app/api/cashRegister/route.ts`

#### `/api/cashRegister`
- **GET** : Récupérer les registres de caisse
- **POST** : Créer un registre de caisse
- **PUT** : Modifier un registre de caisse
- **DELETE** : Supprimer un registre de caisse

#### `/api/cashRegisterSession`
- **GET** : Récupérer les sessions de caisse
- **POST** : Créer une session de caisse
- **PUT** : Modifier une session de caisse
- **DELETE** : Supprimer une session de caisse

#### `/api/payment`
- **GET** : Récupérer les paiements
- **POST** : Enregistrer un paiement
  ```json
  {
    "student_id": string,
    "installment_id": number,
    "cash_register_id": number,
    "cashier_id": number,
    "amount": string,
    "transaction_id": string,
    "payment_methods": [
      {
        "payment_method_id": number,
        "montant": string
      }
    ]
  }
  ```
- **PUT** : Modifier un paiement
- **DELETE** : Supprimer un paiement

#### `/api/transaction`
- **GET** : Récupérer les transactions
- **POST** : Créer une transaction
  ```json
  {
    "user_id": number,
    "cash_register_session_id": number,
    "transaction_date": string,
    "total_amount": string,
    "transaction_type": string
  }
  ```
- **PUT** : Modifier une transaction
- **DELETE** : Supprimer une transaction

#### `/api/expense`
- **GET** : Récupérer les dépenses
- **POST** : Enregistrer une dépense
- **PUT** : Modifier une dépense
- **DELETE** : Supprimer une dépense

#### `/api/expenseType`
- **GET** : Récupérer les types de dépenses
- **POST** : Créer un type de dépense
- **PUT** : Modifier un type de dépense
- **DELETE** : Supprimer un type de dépense

#### `/api/feeType`
- **GET** : Récupérer les types de frais
- **POST** : Créer un type de frais
- **PUT** : Modifier un type de frais
- **DELETE** : Supprimer un type de frais

#### `/api/installment`
- **GET** : Récupérer les échéanciers
- **POST** : Créer un échéancier
- **PUT** : Modifier un échéancier
- **DELETE** : Supprimer un échéancier

#### `/api/pricing`
- **GET** : Récupérer les tarifs
- **POST** : Créer un tarif
- **PUT** : Modifier un tarif
- **DELETE** : Supprimer un tarif

#### `/api/payment-methods`
- **GET** : Récupérer les méthodes de paiement
- **POST** : Créer une méthode de paiement
- **PUT** : Modifier une méthode de paiement
- **DELETE** : Supprimer une méthode de paiement

#### `/api/validationExpense`
- **GET** : Récupérer les validations de dépenses
- **POST** : Valider une dépense
- **PUT** : Modifier une validation
- **DELETE** : Supprimer une validation

### 📄 6. Documents et Médias
**📂 Fichiers :** `app/api/document/route.ts`, `app/api/downloadFile/route.ts`, `app/api/proxy-image/route.ts`

#### `/api/document`
- **GET** : Récupérer les documents
- **POST** : Uploader un document (FormData)
  ```typescript
  FormData:
  - document_type_id: string
  - student_id: string
  - label: string
  - path: File
  ```
- **PUT** : Modifier un document
- **DELETE** : Supprimer un document

#### `/api/documentType`
- **GET** : Récupérer les types de documents
- **POST** : Créer un type de document
- **PUT** : Modifier un type de document
- **DELETE** : Supprimer un type de document

#### `/api/downloadFile`
- **GET** : Télécharger un fichier

#### `/api/proxy-image`
- **GET** : Proxy pour les images (sécurité)

### 💬 7. Communication
**📂 Fichiers :** `app/api/comments/route.ts`, `app/api/send-email/route.ts`

#### `/api/comments`
- **GET** : Récupérer les commentaires
- **POST** : Ajouter un commentaire
- **PUT** : Modifier un commentaire
- **DELETE** : Supprimer un commentaire

#### `/api/send-email`
- **POST** : Envoyer un email

#### `/api/send-account-info`
- **POST** : Envoyer les informations de compte

### ⚙️ 8. Configuration
**📂 Fichiers :** `app/api/academic_year/route.ts`, `app/api/setting/route.ts`

#### `/api/academic_year`
- **GET** : Récupérer les années académiques
- **POST** : Créer une année académique
- **PUT** : Modifier une année académique
- **DELETE** : Supprimer une année académique

#### `/api/setting`
- **GET** : Récupérer les paramètres
- **POST** : Créer un paramètre
- **PUT** : Modifier un paramètre
- **DELETE** : Supprimer un paramètre

## 🔄 Patterns d'Utilisation dans le Code

### 📡 Via Axios (recommandé)
**📂 Exemple :** `config/axios.config.ts`
```typescript
import { api } from '@/config/axios.config';

// GET
const response = await api.get('/students');

// POST JSON
const response = await api.post('/students', studentData);

// POST FormData
const formData = new FormData();
formData.append('name', 'value');
const response = await api.post('/students', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// PUT
const response = await api.put('/students?id=123', updateData);

// DELETE
const response = await api.delete('/students?id=123');
```

### 🌐 Via Fetch (utilisé dans certains composants)
**📂 Exemple :** `components/registration/step-5-confirmation.tsx`
```typescript
// POST JSON
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Doe",
    first_name: "John",
    // ... autres champs
  }),
});

// POST FormData
const formData = new FormData();
formData.append('name', 'Doe');
formData.append('photo', file);
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student`, {
  method: "POST",
  body: formData,
});
```

## 🚨 Gestion des Erreurs
- Toutes les routes capturent les erreurs et retournent un objet JSON avec un champ `error`
- Status codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)
- Logging des erreurs côté serveur

## 🔒 Sécurité
- Proxy API pour éviter l'exposition directe du backend
- Validation des données côté client et serveur
- Authentification JWT
- Gestion des CORS
- Rate limiting (page 429 pour trop de requêtes)

## ⚡ Performance
- Utilisation de React Query pour le cache et la synchronisation
- Lazy loading des composants
- Optimisation des images avec Next.js
- Compression des réponses API

## 🔄 Workflows API Principaux

### 👨‍🎓 Workflow d'Inscription Complet
**📂 Fichiers :** `components/registration/step-5-confirmation.tsx`
```
1. 📝 POST /api/student (FormData) → Création élève
2. 👨‍👩‍👧 POST /api/tutor → Création tuteurs
3. 🔗 POST /api/student/assign-tutor → Assignation tuteurs
4. 📋 POST /api/registration → Inscription
5. 💰 POST /api/transaction → Création transaction
6. 💳 POST /api/payment → Enregistrement paiement
7. 📄 POST /api/document (FormData) → Upload documents
```

### 💰 Workflow de Paiement
**📂 Fichiers :** `components/registration/step-3-pricing.tsx`
```
1. 💾 POST /api/transaction → Création transaction
2. 💳 POST /api/payment → Enregistrement paiement
3. ✅ Validation côté client
```

### 🔐 Workflow d'Authentification
**📂 Fichiers :** `app/[lang]/login-form.tsx`
```
1. 🔑 POST /api/login → Authentification
2. 📧 POST /api/send-otp → Envoi OTP (si nécessaire)
3. 🔄 POST /api/password/forgot → Reset MDP (si oublié)
4. 🔑 POST /api/reset-password → Nouveau MDP
```