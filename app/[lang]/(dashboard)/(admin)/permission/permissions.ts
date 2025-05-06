type Permission = {
    name: string;
    description?: string;
  };
  
  type EntityPermissions = {
    voir: Permission;
    creer: Permission;
    modifier: Permission;
    supprimer: Permission;
    // Ajout de permissions spécifiques si nécessaire
    [key: string]: Permission;
  };
  
  type AppPermissions = {
    eleve: EntityPermissions & {
      inscrire: Permission;
    };
    utilisateur: EntityPermissions;
    caisse: EntityPermissions 
    annee_Academique: EntityPermissions & {
      activer: Permission;
    };
    classe: EntityPermissions;
    niveau: EntityPermissions;
    frais_Scolaires: EntityPermissions ;
    depenses: EntityPermissions ;
    paiement: EntityPermissions  ;
    historique_Paiement: EntityPermissions & {
      exporter: Permission;
      voir_tous: Permission;
    };
    historique_Depenses: EntityPermissions & {
      exporter: Permission;
    };
    role: EntityPermissions & {
      assigner: Permission;
    };
    permission: EntityPermissions & {
      assigner: Permission;
    };
  };
  
export const permissions: AppPermissions = {
    eleve: {
      voir: { name: "voir", description: "Voir les informations des élèves" },
      creer: { name: "creer", description: "Créer un nouvel élève" },
      modifier: { name: "modifier", description: "Modifier les informations d'un élève" },
      supprimer: { name: "supprimer", description: "Supprimer un élève" },
      inscrire: { name: "inscrire", description: "Inscrire un élève dans une classe" }
    },
    utilisateur: {
      voir: { name: "voir", description: "Voir les informations des utilisateurs"},
      creer: { name: "creer", description: "Créer un nouvel utilisateur"},
      modifier: { name: "modifier", description: "Modifier les informations d'un utilisateur"},
      supprimer: { name: "supprimer", description: "Supprimer un utilisateur"}
    },
    caisse: {
      voir: { name: "voir", description: "Voir l'état de la caisse" },
      creer: { name: "creer", description: "Créer une opération de caisse" },
      modifier: { name: "modifier", description: "Modifier une opération de caisse"},
      supprimer: { name: "supprimer", description: "Supprimer une opération de caisse" },
      ouvrir: { name: "ouvrir", description: "Ouvrir la caisse" }
    },
    annee_Academique: {
      voir: { name: "voir", description: "Voir les années académiques" },
      creer: { name: "creer", description: "Créer une nouvelle année académique" },
      modifier: { name: "modifier", description: "Modifier une année académique" },
      supprimer: { name: "supprimer", description: "Supprimer une année académique" },
      activer: { name: "activer", description: "Activer une année académique" }
    },
    classe: {
      voir: { name: "voir", description: "Voir les classes" },
      creer: { name: "creer", description: "Créer une nouvelle classe" },
      modifier: { name: "modifier", description: "Modifier une classe" },
      supprimer: { name: "supprimer", description: "Supprimer une classe" }
    },
    niveau: {
      voir: { name: "voir", description: "Voir les niveaux" },
      creer: { name: "creer", description: "Créer un nouveau niveau" },
      modifier: { name: "modifier", description: "Modifier un niveau" },
      supprimer: { name: "supprimer", description: "Supprimer un niveau" }
    },
    frais_Scolaires: {
      voir: { name: "voir", description: "Voir les frais scolaires" },
      creer: { name: "creer", description: "Créer de nouveaux frais scolaires" },
      modifier: { name: "modifier", description: "Modifier des frais scolaires" },
      supprimer: { name: "supprimer", description: "Supprimer des frais scolaires" },
    },
    depenses: {
      voir: { name: "voir", description: "Voir les dépenses" },
      creer: { name: "creer", description: "Créer une nouvelle dépense" },
      modifier: { name: "modifier", description: "Modifier une dépense" },
      supprimer: { name: "supprimer", description: "Supprimer une dépense" }
    },
    paiement: {
      voir: { name: "voir", description: "Voir les paiements" },
      creer: { name: "creer", description: "Créer un nouveau paiement" },
      modifier: { name: "modifier", description: "Modifier un paiement" },
      supprimer: { name: "supprimer", description: "Supprimer un paiement" },
      valider: { name: "valider", description: "Valider un paiement" }
    },
    historique_Paiement: {
      voir: { name: "voir", description: "Voir l'historique des paiements qu l'utilisateur a valider" },
      creer: { name: "creer", description: "Créer un historique de paiement" },
      modifier: { name: "modifier", description: "Modifier un historique de paiement" },
      supprimer: { name: "supprimer", description: "Supprimer un historique de paiement" },
      exporter: { name: "exporter", description: "Exporter l'historique des paiements" },
      voir_tous: { name: "voir_tous", description: "Voir tous les paiements" }
    },
    historique_Depenses: {
      voir: { name: "voir", description: "Voir l'historique des dépenses" },
      creer: { name: "creer", description: "Créer un historique de dépense" },
      modifier: { name: "modifier", description: "Modifier un historique de dépense" },
      supprimer: { name: "supprimer", description: "Supprimer un historique de dépense" },
      exporter: { name: "exporter", description: "Exporter l'historique des dépenses" }
    },
    role: {
      voir: { name: "voir", description: "Voir les rôles" },
      creer: { name: "creer", description: "Créer un nouveau rôle" },
      modifier: { name: "modifier", description: "Modifier un rôle" },
      supprimer: { name: "supprimer", description: "Supprimer un rôle" },
      assigner: { name: "assigner", description: "Assigner un rôle à un utilisateur" }
    },
    permission: {
      voir: { name: "voir", description: "Voir les permissions" },
      creer: { name: "creer", description: "Créer une nouvelle permission" },
      modifier: { name: "modifier", description: "Modifier une permission" },
      supprimer: { name: "supprimer", description: "Supprimer une permission" },
      assigner: { name: "assigner", description: "Assigner une permission à un rôle" }
  }
}