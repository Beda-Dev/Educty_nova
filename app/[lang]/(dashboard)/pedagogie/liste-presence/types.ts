
export interface Classe {
    id: string;
    nom: string;
    niveau: string;
    effectif: number;
  }
  
  export interface Eleve {
    id: string;
    nom: string;
    prenom: string;
    classeId: string;
    photo?: string;
  }
  
  export interface Cours {
    id: string;
    nom: string;
    jour: string;
    heureDebut: string;
    heureFin: string;
    classeId: string;
    salle: string;
    professeur: string;
  }
  
  export interface Presence {
    eleveId: string;
    present: boolean;
    date: string;
    coursId: string;
  }