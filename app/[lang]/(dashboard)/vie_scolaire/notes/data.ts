// Types
export interface Classe {
  id: string;
  nom: string;
  niveau: string;
  effectif: number;
  professeurPrincipal: string;
}

export interface Matiere {
  id: string;
  nom: string;
  professeur: string;
  coefficient: number;
}

export interface Trimestre {
  id: string;
  nom: string;
  debut: string;
  fin: string;
}

export interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  classeId: string;
  dateNaissance: string;
}

export interface Devoir {
  id: string;
  titre: string;
  classeId: string;
  date: string;
  coefficient: number;
  matiereId: string;
  trimestreId: string;
  description: string;
}

export interface Note {
  eleveId: string;
  devoirId: string;
  valeur: number | null;
}

// Données de démonstration enrichies
export const classes: Classe[] = [
  {
    id: "c1",
    nom: "6ème A",
    niveau: "6ème",
    effectif: 24,
    professeurPrincipal: "Mme. Dubois",
  },
  {
    id: "c2",
    nom: "5ème B",
    niveau: "5ème",
    effectif: 28,
    professeurPrincipal: "M. Martin",
  },
  {
    id: "c3",
    nom: "4ème C",
    niveau: "4ème",
    effectif: 26,
    professeurPrincipal: "Mme. Lambert",
  },
  {
    id: "c4",
    nom: "3ème D",
    niveau: "3ème",
    effectif: 30,
    professeurPrincipal: "M. Durand",
  },
  {
    id: "c5",
    nom: "6ème B",
    niveau: "6ème",
    effectif: 22,
    professeurPrincipal: "M. Leroux",
  },
  {
    id: "c6",
    nom: "5ème A",
    niveau: "5ème",
    effectif: 25,
    professeurPrincipal: "Mme. Garnier",
  },
  {
    id: "c7",
    nom: "4ème D",
    niveau: "4ème",
    effectif: 27,
    professeurPrincipal: "M. Petit",
  },
  {
    id: "c8",
    nom: "3ème A",
    niveau: "3ème",
    effectif: 29,
    professeurPrincipal: "Mme. Rousseau",
  },
];

export const matieres: Matiere[] = [
  { id: "m1", nom: "Mathématiques", professeur: "M. Dupont", coefficient: 3 },
  { id: "m2", nom: "Français", professeur: "Mme. Martin", coefficient: 3 },
  {
    id: "m3",
    nom: "Histoire-Géographie",
    professeur: "M. Bernard",
    coefficient: 2,
  },
  {
    id: "m4",
    nom: "Sciences Physiques",
    professeur: "Mme. Petit",
    coefficient: 2,
  },
  { id: "m5", nom: "SVT", professeur: "M. Durand", coefficient: 2 },
  { id: "m6", nom: "Anglais", professeur: "Mme. Leroy", coefficient: 2 },
  {
    id: "m7",
    nom: "Éducation Physique",
    professeur: "M. Moreau",
    coefficient: 1,
  },
  {
    id: "m8",
    nom: "Arts Plastiques",
    professeur: "Mme. Fournier",
    coefficient: 1,
  },
  { id: "m9", nom: "Musique", professeur: "M. Lefebvre", coefficient: 1 },
  { id: "m10", nom: "Technologie", professeur: "M. Girard", coefficient: 1 },
  { id: "m11", nom: "Espagnol", professeur: "Mme. Sanchez", coefficient: 2 },
  { id: "m12", nom: "Allemand", professeur: "M. Schmidt", coefficient: 2 },
];

export const trimestres: Trimestre[] = [
  { id: "t1", nom: "1er Trimestre", debut: "2024-09-01", fin: "2024-11-30" },
  { id: "t2", nom: "2ème Trimestre", debut: "2024-12-01", fin: "2025-02-29" },
  { id: "t3", nom: "3ème Trimestre", debut: "2025-03-01", fin: "2025-06-30" },

];

export const eleves: Eleve[] = [
  // Classe 6ème A
  {
    id: "e1",
    nom: "Dupont",
    prenom: "Marie",
    classeId: "c1",
    dateNaissance: "2012-05-14",
  },
  {
    id: "e2",
    nom: "Martin",
    prenom: "Thomas",
    classeId: "c1",
    dateNaissance: "2012-03-22",
  },
  {
    id: "e3",
    nom: "Petit",
    prenom: "Sophie",
    classeId: "c1",
    dateNaissance: "2012-07-30",
  },
  {
    id: "e4",
    nom: "Bernard",
    prenom: "Alexandre",
    classeId: "c1",
    dateNaissance: "2012-01-15",
  },
  {
    id: "e5",
    nom: "Roux",
    prenom: "Camille",
    classeId: "c1",
    dateNaissance: "2012-11-08",
  },

  // Classe 5ème B
  {
    id: "e6",
    nom: "Durand",
    prenom: "Lucas",
    classeId: "c2",
    dateNaissance: "2011-01-18",
  },
  {
    id: "e7",
    nom: "Leroy",
    prenom: "Emma",
    classeId: "c2",
    dateNaissance: "2011-11-05",
  },
  {
    id: "e8",
    nom: "Morel",
    prenom: "Antoine",
    classeId: "c2",
    dateNaissance: "2011-04-22",
  },
  {
    id: "e9",
    nom: "Simon",
    prenom: "Léa",
    classeId: "c2",
    dateNaissance: "2011-08-30",
  },
  {
    id: "e10",
    nom: "Laurent",
    prenom: "Maxime",
    classeId: "c2",
    dateNaissance: "2011-02-14",
  },

  // Classe 4ème C
  {
    id: "e11",
    nom: "Moreau",
    prenom: "Hugo",
    classeId: "c3",
    dateNaissance: "2010-09-12",
  },
  {
    id: "e12",
    nom: "Simon",
    prenom: "Chloé",
    classeId: "c3",
    dateNaissance: "2010-04-25",
  },
  {
    id: "e13",
    nom: "Girard",
    prenom: "Enzo",
    classeId: "c3",
    dateNaissance: "2010-12-03",
  },
  {
    id: "e14",
    nom: "Fournier",
    prenom: "Manon",
    classeId: "c3",
    dateNaissance: "2010-06-19",
  },
  {
    id: "e15",
    nom: "Bonnet",
    prenom: "Quentin",
    classeId: "c3",
    dateNaissance: "2010-03-07",
  },

  // Classe 3ème D
  {
    id: "e16",
    nom: "Michel",
    prenom: "Nathan",
    classeId: "c4",
    dateNaissance: "2009-08-17",
  },
  {
    id: "e17",
    nom: "Lefebvre",
    prenom: "Clara",
    classeId: "c4",
    dateNaissance: "2009-05-21",
  },
  {
    id: "e18",
    nom: "Martinez",
    prenom: "Jules",
    classeId: "c4",
    dateNaissance: "2009-10-11",
  },
  {
    id: "e19",
    nom: "David",
    prenom: "Océane",
    classeId: "c4",
    dateNaissance: "2009-01-28",
  },
  {
    id: "e20",
    nom: "Fontaine",
    prenom: "Théo",
    classeId: "c4",
    dateNaissance: "2009-07-14",
  },

  // Classe 6ème B
  {
    id: "e21",
    nom: "Clement",
    prenom: "Lilou",
    classeId: "c5",
    dateNaissance: "2012-09-05",
  },
  {
    id: "e22",
    nom: "Perrot",
    prenom: "Mathis",
    classeId: "c5",
    dateNaissance: "2012-02-17",
  },
  {
    id: "e29",
    nom: "Fournier",
    prenom: "Jules",
    classeId: "c2",
    dateNaissance: "2011-04-19",
  },
  {
    id: "e30",
    nom: "Roux",
    prenom: "Léa",
    classeId: "c3",
    dateNaissance: "2010-12-02",
  },
  {
    id: "e31",
    nom: "Garcia",
    prenom: "Axel",
    classeId: "c4",
    dateNaissance: "2009-03-09",
  },
  {
    id: "e32",
    nom: "Noël",
    prenom: "Camille",
    classeId: "c4",
    dateNaissance: "2009-07-14",
  },

  // Classe 5ème A
  {
    id: "e23",
    nom: "Chevalier",
    prenom: "Louise",
    classeId: "c6",
    dateNaissance: "2011-06-23",
  },
  {
    id: "e24",
    nom: "Francois",
    prenom: "Baptiste",
    classeId: "c6",
    dateNaissance: "2011-12-08",
  },

  // Classe 4ème D
  {
    id: "e25",
    nom: "Mercier",
    prenom: "Eva",
    classeId: "c7",
    dateNaissance: "2010-07-30",
  },
  {
    id: "e26",
    nom: "Dupuis",
    prenom: "Romain",
    classeId: "c7",
    dateNaissance: "2010-04-12",
  },

  // Classe 3ème A
  {
    id: "e27",
    nom: "Colin",
    prenom: "Zoé",
    classeId: "c8",
    dateNaissance: "2009-11-19",
  },
  {
    id: "e28",
    nom: "Gauthier",
    prenom: "Paul",
    classeId: "c8",
    dateNaissance: "2009-03-25",
  },
];

// Devoirs avec matières et trimestres
export const devoirs: Devoir[] = [
  // 1er Trimestre - Mathématiques
  {
    id: "d1",
    titre: "Contrôle sur les fractions",
    classeId: "c1",
    date: "2023-09-20",
    coefficient: 2,
    matiereId: "m1",
    trimestreId: "t1",
    description: "Opérations sur les fractions",
  },
  {
    id: "d2",
    titre: "Devoir maison géométrie",
    classeId: "c1",
    date: "2023-10-15",
    coefficient: 1,
    matiereId: "m1",
    trimestreId: "t1",
    description: "Figures géométriques",
  },
  {
    id: "d3",
    titre: "Contrôle de fin de trimestre",
    classeId: "c1",
    date: "2023-11-25",
    coefficient: 3,
    matiereId: "m1",
    trimestreId: "t1",
    description: "Bilan du trimestre",
  },

  // 1er Trimestre - Français
  {
    id: "d4",
    titre: "Dictée",
    classeId: "c1",
    date: "2023-09-10",
    coefficient: 1,
    matiereId: "m2",
    trimestreId: "t1",
    description: "Dictée préparée",
  },
  {
    id: "d5",
    titre: "Analyse de texte",
    classeId: "c1",
    date: "2023-10-05",
    coefficient: 2,
    matiereId: "m2",
    trimestreId: "t1",
    description: "Analyse d'un extrait de roman",
  },
  {
    id: "d6",
    titre: "Rédaction",
    classeId: "c1",
    date: "2023-11-15",
    coefficient: 2,
    matiereId: "m2",
    trimestreId: "t1",
    description: "Rédaction d'un récit",
  },

  // 1er Trimestre - Histoire-Géo
  {
    id: "d7",
    titre: "Contrôle d'histoire",
    classeId: "c1",
    date: "2023-09-30",
    coefficient: 2,
    matiereId: "m3",
    trimestreId: "t1",
    description: "La préhistoire",
  },
  {
    id: "d8",
    titre: "Exposé de géographie",
    classeId: "c1",
    date: "2023-11-05",
    coefficient: 1,
    matiereId: "m3",
    trimestreId: "t1",
    description: "Les continents",
  },

  // 2ème Trimestre - Mathématiques
  {
    id: "d9",
    titre: "Contrôle sur les décimaux",
    classeId: "c1",
    date: "2023-12-10",
    coefficient: 2,
    matiereId: "m1",
    trimestreId: "t2",
    description: "Opérations sur les nombres décimaux",
  },
  {
    id: "d10",
    titre: "Devoir maison algèbre",
    classeId: "c1",
    date: "2024-01-20",
    coefficient: 1,
    matiereId: "m1",
    trimestreId: "t2",
    description: "Équations simples",
  },
  {
    id: "d11",
    titre: "Contrôle de mi-trimestre",
    classeId: "c1",
    date: "2024-02-05",
    coefficient: 2,
    matiereId: "m1",
    trimestreId: "t2",
    description: "Bilan intermédiaire",
  },

  // 2ème Trimestre - Français
  {
    id: "d12",
    titre: "Contrôle de grammaire",
    classeId: "c1",
    date: "2023-12-15",
    coefficient: 2,
    matiereId: "m2",
    trimestreId: "t2",
    description: "Les classes grammaticales",
  },
  {
    id: "d13",
    titre: "Exposé sur un livre",
    classeId: "c1",
    date: "2024-01-25",
    coefficient: 1,
    matiereId: "m2",
    trimestreId: "t2",
    description: "Présentation d'un livre lu",
  },
  {
    id: "d14",
    titre: "Contrôle de conjugaison",
    classeId: "c1",
    date: "2024-02-15",
    coefficient: 2,
    matiereId: "m2",
    trimestreId: "t2",
    description: "Les temps de l'indicatif",
  },

  // 3ème Trimestre - Mathématiques
  {
    id: "d15",
    titre: "Contrôle sur les pourcentages",
    classeId: "c1",
    date: "2024-03-10",
    coefficient: 2,
    matiereId: "m1",
    trimestreId: "t3",
    description: "Calcul de pourcentages",
  },
  {
    id: "d16",
    titre: "Devoir maison statistiques",
    classeId: "c1",
    date: "2024-04-15",
    coefficient: 1,
    matiereId: "m1",
    trimestreId: "t3",
    description: "Représentations graphiques",
  },
  {
    id: "d17",
    titre: "Contrôle final",
    classeId: "c1",
    date: "2024-06-10",
    coefficient: 3,
    matiereId: "m1",
    trimestreId: "t3",
    description: "Bilan de l'année",
  },
  {
    id: "d17",
    titre: "Contrôle final",
    classeId: "c1",
    date: "2024-06-20",
    coefficient: 3,
    matiereId: "m1",
    trimestreId: "t3",
    description: "Synthèse de l'année scolaire",
  },
  {
    id: "d18",
    titre: "Évaluation d'anglais",
    classeId: "c2",
    date: "2024-03-22",
    coefficient: 2,
    matiereId: "m6",
    trimestreId: "t3",
    description: "Compréhension orale",
  },
  {
    id: "d19",
    titre: "TP Physique",
    classeId: "c3",
    date: "2024-04-05",
    coefficient: 2,
    matiereId: "m4",
    trimestreId: "t3",
    description: "Manipulations sur le circuit électrique",
  },
  {
    id: "d20",
    titre: "Rédaction finale",
    classeId: "c4",
    date: "2024-05-18",
    coefficient: 2,
    matiereId: "m2",
    trimestreId: "t3",
    description: "Écriture d'invention",
  },

  // 3ème Trimestre - Français
  {
    id: "d18",
    titre: "Dictée finale",
    classeId: "c1",
    date: "2024-03-20",
    coefficient: 1,
    matiereId: "m2",
    trimestreId: "t3",
    description: "Dictée non préparée",
  },
  {
    id: "d19",
    titre: "Dissertation",
    classeId: "c1",
    date: "2024-05-05",
    coefficient: 3,
    matiereId: "m2",
    trimestreId: "t3",
    description: "Rédaction argumentative",
  },
  {
    id: "d20",
    titre: "Contrôle de littérature",
    classeId: "c1",
    date: "2024-06-01",
    coefficient: 2,
    matiereId: "m2",
    trimestreId: "t3",
    description: "Les genres littéraires",
  },

  // Devoirs pour d'autres classes
  // 5ème B - Mathématiques
  {
    id: "d21",
    titre: "Contrôle sur les nombres relatifs",
    classeId: "c2",
    date: "2023-09-18",
    coefficient: 2,
    matiereId: "m1",
    trimestreId: "t1",
    description: "Addition et soustraction de nombres relatifs",
  },
  {
    id: "d22",
    titre: "Devoir maison sur les fractions",
    classeId: "c2",
    date: "2023-10-20",
    coefficient: 1,
    matiereId: "m1",
    trimestreId: "t1",
    description: "Problèmes avec fractions",
  },

  // 4ème C - SVT
  {
    id: "d23",
    titre: "Contrôle sur la reproduction",
    classeId: "c3",
    date: "2023-09-25",
    coefficient: 2,
    matiereId: "m5",
    trimestreId: "t1",
    description: "La reproduction humaine",
  },

  // 3ème D - Physique
  {
    id: "d24",
    titre: "TP Chimie évaluation",
    classeId: "c4",
    date: "2023-10-10",
    coefficient: 1,
    matiereId: "m4",
    trimestreId: "t1",
    description: "Réactions chimiques",
  },

  // 6ème B - Anglais
  {
    id: "d25",
    titre: "Contrôle de vocabulaire",
    classeId: "c5",
    date: "2023-09-15",
    coefficient: 1,
    matiereId: "m6",
    trimestreId: "t1",
    description: "Vocabulaire de base",
  },

  // 5ème A - Histoire
  {
    id: "d26",
    titre: "Évaluation sur le Moyen-Âge",
    classeId: "c6",
    date: "2023-10-05",
    coefficient: 2,
    matiereId: "m3",
    trimestreId: "t1",
    description: "La société médiévale",
  },

  // 4ème D - Musique
  {
    id: "d27",
    titre: "Présentation d'un instrument",
    classeId: "c7",
    date: "2023-11-10",
    coefficient: 1,
    matiereId: "m9",
    trimestreId: "t1",
    description: "Exposé oral sur un instrument de musique",
  },

  // 3ème A - Technologie
  {
    id: "d28",
    titre: "Projet robotique",
    classeId: "c8",
    date: "2023-11-20",
    coefficient: 2,
    matiereId: "m10",
    trimestreId: "t1",
    description: "Conception d'un robot simple",
  },
];

// Notes pour plusieurs élèves
export const notesEleve: Note[] = [
  // Marie Dupont (e1)
  // 1er Trimestre - Mathématiques
  { eleveId: "e1", devoirId: "d1", valeur: 15 },
  { eleveId: "e1", devoirId: "d2", valeur: 17 },
  { eleveId: "e1", devoirId: "d3", valeur: 14 },

  // 1er Trimestre - Français
  { eleveId: "e1", devoirId: "d4", valeur: 16 },
  { eleveId: "e1", devoirId: "d5", valeur: 13 },
  { eleveId: "e1", devoirId: "d6", valeur: 15 },

  // 1er Trimestre - Histoire-Géo
  { eleveId: "e1", devoirId: "d7", valeur: 12 },
  { eleveId: "e1", devoirId: "d8", valeur: 18 },

  // 2ème Trimestre - Mathématiques
  { eleveId: "e1", devoirId: "d9", valeur: 16 },
  { eleveId: "e1", devoirId: "d10", valeur: 14 },
  { eleveId: "e1", devoirId: "d11", valeur: 15 },

  // 2ème Trimestre - Français
  { eleveId: "e1", devoirId: "d12", valeur: 17 },
  { eleveId: "e1", devoirId: "d13", valeur: 19 },
  { eleveId: "e1", devoirId: "d14", valeur: 16 },

  // 3ème Trimestre - Mathématiques
  { eleveId: "e1", devoirId: "d15", valeur: 13 },
  { eleveId: "e1", devoirId: "d16", valeur: 15 },
  { eleveId: "e1", devoirId: "d17", valeur: 14 },

  // 3ème Trimestre - Français
  { eleveId: "e1", devoirId: "d18", valeur: 12 },
  { eleveId: "e1", devoirId: "d19", valeur: 16 },
  { eleveId: "e1", devoirId: "d20", valeur: 15 },

  // Thomas Martin (e2)
  { eleveId: "e2", devoirId: "d1", valeur: 12 },
  { eleveId: "e2", devoirId: "d2", valeur: 14 },
  { eleveId: "e2", devoirId: "d3", valeur: 11 },
  { eleveId: "e2", devoirId: "d4", valeur: 15 },
  { eleveId: "e2", devoirId: "d5", valeur: 10 },
  { eleveId: "e2", devoirId: "d7", valeur: 14 },

  // Sophie Petit (e3)
  { eleveId: "e3", devoirId: "d1", valeur: 18 },
  { eleveId: "e3", devoirId: "d2", valeur: 16 },
  { eleveId: "e3", devoirId: "d4", valeur: 17 },
  { eleveId: "e3", devoirId: "d5", valeur: 15 },
  { eleveId: "e3", devoirId: "d8", valeur: 19 },

  // Lucas Durand (e6)
  { eleveId: "e6", devoirId: "d21", valeur: 13 },
  { eleveId: "e6", devoirId: "d22", valeur: 15 },

  // Emma Leroy (e7)
  { eleveId: "e7", devoirId: "d21", valeur: 16 },
  { eleveId: "e7", devoirId: "d22", valeur: 18 },

  // Hugo Moreau (e11)
  { eleveId: "e11", devoirId: "d23", valeur: 14 },

  // Chloé Simon (e12)
  { eleveId: "e12", devoirId: "d23", valeur: 17 },

  // Nathan Michel (e16)
  { eleveId: "e16", devoirId: "d24", valeur: 12 },

  // Lilou Clement (e21)
  { eleveId: "e21", devoirId: "d25", valeur: 15 },

  // Louise Chevalier (e23)
  { eleveId: "e23", devoirId: "d26", valeur: 14 },

  // Eva Mercier (e25)
  { eleveId: "e25", devoirId: "d27", valeur: 16 },

  // Zoé Colin (e27)
  { eleveId: "e27", devoirId: "d28", valeur: 13 },

  { eleveId: "e1", devoirId: "d1", valeur: 14 },
  { eleveId: "e1", devoirId: "d2", valeur: 12 },
  { eleveId: "e1", devoirId: "d3", valeur: 15 },
  { eleveId: "e1", devoirId: "d4", valeur: 13 },
  { eleveId: "e2", devoirId: "d1", valeur: 10 },
  { eleveId: "e2", devoirId: "d2", valeur: 9 },
  { eleveId: "e2", devoirId: "d3", valeur: 11 },
  { eleveId: "e2", devoirId: "d4", valeur: 12 },
  { eleveId: "e3", devoirId: "d1", valeur: 17 },
  { eleveId: "e3", devoirId: "d2", valeur: 16 },
  { eleveId: "e3", devoirId: "d3", valeur: 18 },
  { eleveId: "e3", devoirId: "d4", valeur: 14 },
  { eleveId: "e4", devoirId: "d18", valeur: 11 },
  { eleveId: "e5", devoirId: "d18", valeur: 15 },
  { eleveId: "e6", devoirId: "d19", valeur: 13 },
  { eleveId: "e7", devoirId: "d19", valeur: 14 },
  { eleveId: "e8", devoirId: "d20", valeur: 12 },
  { eleveId: "e11", devoirId: "d20", valeur: 16 },
  { eleveId: "e12", devoirId: "d20", valeur: 14 },
];
