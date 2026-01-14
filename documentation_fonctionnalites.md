# 📚 Documentation des Fonctionnalités - Educty Nova

## 🎯 Vue d'ensemble
Educty Nova est une **plateforme de gestion éducative complète** développée avec **Next.js 14**, **TypeScript** et **Tailwind CSS**. L'application permet la gestion intégrale d'un établissement éducatif avec différents rôles utilisateurs et une architecture modulaire.

## 🏗️ Architecture des Données

### 🔄 Fonctionnalités Dynamiques (Données depuis API)
La majorité de l'application utilise un système de données dynamiques chargées depuis des APIs externes via le composant `update.tsx`. Ces données sont stockées dans un store Zustand (`useSchoolStore`) et mises à jour automatiquement au démarrage de l'application.

**📂 Fichiers clés :**
- `app/[lang]/update.tsx` - Chargement automatique des données
- `store/index.ts` - Store Zustand principal
- `store/schoolservice.ts` - Services API

**Données chargées automatiquement :**
- 📚 Classes, niveaux, années académiques
- 👨‍🎓 Élèves, inscriptions, tuteurs
- 👥 Utilisateurs, rôles, permissions
- 💰 Paiements, transactions, méthodes de paiement
- 📖 Matières, professeurs, notes
- 📄 Documents, types de documents
- ⚙️ Paramètres système, caisses, sessions de caisse
- 📊 Types d'évaluation, coefficients
- 💸 Dépenses, types de dépenses, frais

### 📝 Fonctionnalités Statiques (Données Mockées)
Certaines pages utilisent des données écrites en dur dans le code (mock data) et ne font pas d'appels API réels. Ces fonctionnalités sont considérées comme non utilisables en production.

## ✅ Fonctionnalités Utilisables (Données Dynamiques)

### 🔐 1. Authentification
**📂 Fichiers :** `app/[lang]/login-form.tsx`, `app/[lang]/forgot/forgot-form.tsx`, `components/auth/verify-form.tsx`

**🔄 Workflow :**
1. **Connexion** : Saisie email/mot de passe → Validation API → Token JWT
2. **Vérification OTP** : Envoi code par email → Saisie code → Validation
3. **Reset MDP** : Demande reset → Email envoyé → Nouveau mot de passe

- **Page de connexion** : Interface de login avec formulaire sécurisé
- **Vérification OTP** : Système de vérification à deux facteurs
- **Réinitialisation de mot de passe** : Processus de récupération de compte
- **Gestion des sessions** : Suivi de l'état de connexion utilisateur

### 📊 2. Tableaux de Bord Multi-Rôles
**📂 Fichiers :** `app/[lang]/(dashboard)/(home)/dashboard/test.tsx`, `app/[lang]/(dashboard)/(home)/dashboard/admin_dashbord/page-view.tsx`

L'application propose différents tableaux de bord selon les rôles :

#### 👑 Administrateur/Directeur
- Vue complète de toutes les fonctionnalités
- Gestion des utilisateurs et permissions
- Configuration globale du système
- Supervision de tous les modules

#### 💼 Comptable
- Gestion financière et comptable
- Suivi des paiements et transactions
- Rapports financiers
- Gestion des frais et tarifs

#### 💰 Caissier
- Interface de paiement
- Gestion des encaissements
- Suivi des transactions quotidiennes
- Gestion des registres de caisse

#### 👨‍🏫 Professeur/Enseignant
- Accès aux classes et élèves
- Saisie des notes et évaluations
- Consultation des emplois du temps
- Gestion des matières enseignées

#### 👮 Censeur
- Supervision pédagogique
- Gestion disciplinaire
- Suivi des absences et retards
- Rapports sur les élèves

#### 🤝 Éducateur
- Suivi du bien-être des élèves
- Accompagnement personnalisé
- Gestion des conseils et orientations

### 👨‍🎓 3. Gestion des Élèves
**📂 Fichiers :** `app/[lang]/(dashboard)/eleves/`, `components/registration/`, `components/reinscription/`

**🔄 Workflow d'Inscription :**
1. **Étape 1** : Infos personnelles élève
2. **Étape 2** : Infos scolaires (classe, année)
3. **Étape 3** : Tarification et paiements
4. **Étape 4** : Upload documents
5. **Étape 5** : Confirmation et création (API calls)

- **Inscription** : Processus d'inscription en plusieurs étapes avec appels API
- **Réinscription** : Renouvellement annuel des inscriptions
- **Gestion des documents** : Upload et gestion des documents administratifs
- **Historique scolaire** : Suivi du parcours académique
- **Gestion des tuteurs** : Association élèves-parents/tuteurs

### 🎓 4. Gestion Pédagogique
**📂 Fichiers :** `app/[lang]/(dashboard)/pedagogie/`, `app/[lang]/(dashboard)/vie_scolaire/`

- **Classes et niveaux** : Organisation des classes par niveaux
- **Matières** : Gestion du catalogue des matières
- **Professeurs** : Affectation des enseignants aux matières/classes
- **Emplois du temps** : Planification et visualisation des cours
- **Notes et évaluations** : Saisie et gestion des résultats
- **Types d'évaluation** : Configuration des modalités d'évaluation
- **Coefficients** : Gestion des coefficients d'évaluation

### 💰 5. Gestion Financière
**📂 Fichiers :** `app/[lang]/(dashboard)/caisse_comptabilite/`, `components/registration/step-3-pricing.tsx`

**🔄 Workflow de Paiement :**
1. **Sélection frais** : Choix des frais à payer
2. **Calcul total** : Application des remises
3. **Choix méthode** : Sélection mode de paiement
4. **Création transaction** : Enregistrement en base
5. **Validation paiement** : Confirmation et reçu

- **Caisse** : Gestion des opérations de caisse
- **Comptabilité** : Suivi comptable complet
- **Paiements** : Gestion des paiements et échéanciers
- **Transactions** : Historique des transactions financières
- **Frais et tarifs** : Configuration des frais scolaires
- **Validation des dépenses** : Processus d'approbation

### ⚙️ 6. Paramètres et Configuration
**📂 Fichiers :** `app/[lang]/(dashboard)/(parametre)/parametres/`

- **Paramètres établissement** : Configuration globale
- **Gestion des utilisateurs** : CRUD utilisateurs
- **Rôles et permissions** : Système de contrôle d'accès
- **Années académiques** : Gestion des périodes scolaires
- **Types de documents** : Configuration des documents requis

### 🏫 7. Vie Scolaire
**📂 Fichiers :** `app/[lang]/(dashboard)/vie_scolaire/`

- **Suivi quotidien** : Gestion des présences/absences
- **Discipline** : Gestion des incidents et sanctions
- **Activités parascolaires** : Organisation d'événements
- **Communication** : Messagerie interne

### 🛠️ 8. Outils et Utilitaires
**📂 Fichiers :** `components/ui/`, `lib/`

- **Calendrier intégré** : Visualisation des événements
- **Cartes interactives** : Géolocalisation (élèves, établissements)
- **Génération de rapports** : Exports PDF/Excel
- **Notifications** : Système de notifications en temps réel
- **Mode hors ligne** : Fonctionnalités offline avec IndexedDB

### 🔧 9. Debug et Maintenance
**📂 Fichiers :** `app/[lang]/(dashboard)/debug/page.tsx`, `app/[lang]/(dashboard)/maintenance/page.tsx`

- **Outil de recherche** : Recherche avancée dans toutes les données
- **Maintenance système** : Outils de maintenance et réparation

## ❌ Fonctionnalités Non Utilisables (Données Statiques/Mockées)

### 📦 Modules Non Implémentés
Ces modules contiennent des interfaces utilisateur mais utilisent des données fictives écrites en dur dans le code.

#### 1. Inventaire
**📂 Fichiers :** `app/[lang]/(dashboard)/inventaire/`

- **Entrepôts** : Gestion des entrepôts avec données mockées
  ```typescript
  // 📄 app/[lang]/(dashboard)/inventaire/entrepots/page.tsx
  const [entrepots, setEntrepots] = useState<Entrepot[]>([
    {
      id: 1,
      nom: "Entrepôt Principal",
      emplacement: "Bâtiment Administratif",
      capacite: "500m²",
      description: "Entrepôt principal pour les fournitures scolaires",
      statut: "actif",
    },
    // ...
  ]);
  ```
- **Produits** : Gestion des produits avec données mockées
  ```typescript
  // 📄 app/[lang]/(dashboard)/inventaire/produits/page.tsx
  const [produits, setProduits] = useState<Produit[]>([
    {
      id: 1,
      nom: "Cahiers",
      categorie: "Fournitures",
      quantite: 250,
      entrepot: "Entrepôt Principal",
      seuil: 50,
      description: "Cahiers de 100 pages, grands carreaux",
    },
    // ...
  ]);
  ```
- **Opérations** : Interface pour les opérations d'inventaire (non implémentée)

#### 2. Templates d'Email (React Email)
**📂 Fichiers :** `app/[lang]/(dashboard)/react-email/`

- **Templates prédéfinis** : Bibliothèque de templates d'email
- **Prévisualisation** : Interface de prévisualisation des emails
- **Templates disponibles** : Basic welcome, corporate, blog, photography, agency, auth, etc.

### 🚨 Pages d'Erreur et États Spéciaux
**📂 Fichiers :** `app/[lang]/error-page/`

- **404 - Page non trouvée** : Page d'erreur standard
- **401 - Non autorisé** : Accès refusé
- **403 - Interdit** : Permissions insuffisantes
- **419 - Session expirée** : Timeout de session
- **429 - Trop de requêtes** : Rate limiting
- **500 - Erreur serveur** : Erreur interne
- **503 - Service indisponible** : Maintenance

### 🎨 Composants Génériques
**📂 Fichiers :** `components/blank.tsx`

- **Blank** : Composant pour afficher du contenu vide
- **Loading** : Indicateurs de chargement

## 🔄 Analyse des Patterns d'Implémentation

### 📡 Pages Dynamiques (API)
```typescript
// 🔄 Pattern typique des pages utilisables
// 📄 Exemple: app/[lang]/(dashboard)/(home)/dashboard/admin_dashbord/page-view.tsx
"use client";
import { useSchoolStore } from "@/store";

export default function Page() {
  const { students, classes, payments } = useSchoolStore();

  // Utilise les données chargées depuis update.tsx
  return <Dashboard data={{ students, classes, payments }} />;
}
```

### 📝 Pages Statiques (Mock Data)
```typescript
// 📝 Pattern des pages non utilisables
// 📄 Exemple: app/[lang]/(dashboard)/inventaire/entrepots/page.tsx
"use client";
import { useState } from "react";

export default function Page() {
  // Données écrites en dur
  const [data, setData] = useState([
    { id: 1, name: "Mock Item 1", ... },
    { id: 2, name: "Mock Item 2", ... },
  ]);

  return <Component data={data} />;
}
```

## 🛠️ Technologies Utilisées
- **Frontend** : Next.js 14, React 18, TypeScript
- **UI/UX** : Tailwind CSS, Radix UI, Framer Motion
- **État** : Zustand pour les données dynamiques
- **API** : Axios pour les appels API, fetch pour certains composants
- **Base de données** : APIs externes pour données dynamiques, données mockées pour modules statiques
- **Authentification** : Système basé sur JWT/tokens
- **Internationalisation** : Support multi-langues (fr, en, ar, bn)

## 📊 État d'Implémentation
- **Fonctionnalités Core** : ✅ Implémentées et utilisables (Gestion élèves, pédagogie, finance)
- **Modules Secondaires** : ✅ Implémentés (Paramètres, vie scolaire, debug)
- **Modules Non-Core** : ❌ Non implémentés (Inventaire avec données mockées)
- **Utilitaires** : ✅ Templates email, pages d'erreur

## 🎯 Workflows Principaux

### 👨‍🎓 Workflow d'Inscription d'un Élève
```
1. 📝 Saisie infos personnelles → 2. 🏫 Choix classe/année → 3. 💰 Calcul frais →
4. 📄 Upload documents → 5. ✅ Confirmation → 6. 💾 Sauvegarde API
```

### 💰 Workflow de Paiement
```
1. 🛒 Sélection frais → 2. 🧮 Calcul total → 3. 💳 Choix méthode →
4. 💾 Transaction → 5. ✅ Validation → 6. 🧾 Reçu
```

### 👨‍🏫 Workflow de Saisie des Notes
```
1. 📚 Sélection classe/matière → 2. 📝 Saisie notes → 3. 💾 Sauvegarde →
4. 📊 Calcul moyennes → 5. 📋 Génération bulletins
```

## 🚀 Recommandations
1. **Priorité haute** : Migrer les modules avec données mockées vers des APIs réelles
2. **Priorité moyenne** : Améliorer les interfaces des modules existants
3. **Priorité basse** : Ajouter de nouvelles fonctionnalités aux modules core