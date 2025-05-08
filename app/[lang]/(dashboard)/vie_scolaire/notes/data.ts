// Types
export interface Classe {
  id: string
  nom: string
  niveau: string
  effectif: number
  professeurPrincipal: string
}

export interface Matiere {
  id: string
  nom: string
  professeur: string
  coefficient: number
}

export interface Trimestre {
  id: string
  nom: string
  debut: string
  fin: string
}

export interface Eleve {
  id: string
  nom: string
  prenom: string
  classeId: string
  dateNaissance: string
}

export interface Devoir {
  id: string
  titre: string
  classeId: string
  date: string
  coefficient: number
  matiereId: string
  trimestreId: string
  description: string
}

export interface Note {
  eleveId: string
  devoirId: string
  valeur: number | null
}

// Données de démonstration enrichies
export const classes: Classe[] = [
  { id: "c1", nom: "6ème A", niveau: "6ème", effectif: 24, professeurPrincipal: "Mme. Dubois" },
  { id: "c2", nom: "5ème B", niveau: "5ème", effectif: 28, professeurPrincipal: "M. Martin" },
  { id: "c3", nom: "4ème C", niveau: "4ème", effectif: 26, professeurPrincipal: "Mme. Lambert" },
  { id: "c4", nom: "3ème D", niveau: "3ème", effectif: 30, professeurPrincipal: "M. Durand" },
]

export const matieres: Matiere[] = [
  { id: "m1", nom: "Mathématiques", professeur: "M. Dupont", coefficient: 3 },
  { id: "m2", nom: "Français", professeur: "Mme. Martin", coefficient: 3 },
  { id: "m3", nom: "Histoire-Géographie", professeur: "M. Bernard", coefficient: 2 },
  { id: "m4", nom: "Sciences Physiques", professeur: "Mme. Petit", coefficient: 2 },
  { id: "m5", nom: "SVT", professeur: "M. Durand", coefficient: 2 },
  { id: "m6", nom: "Anglais", professeur: "Mme. Leroy", coefficient: 2 },
  { id: "m7", nom: "Éducation Physique", professeur: "M. Moreau", coefficient: 1 },
  { id: "m8", nom: "Arts Plastiques", professeur: "Mme. Fournier", coefficient: 1 },
]

export const trimestres: Trimestre[] = [
  { id: "t1", nom: "1er Trimestre", debut: "2023-09-01", fin: "2023-11-30" },
  { id: "t2", nom: "2ème Trimestre", debut: "2023-12-01", fin: "2024-02-29" },
  { id: "t3", nom: "3ème Trimestre", debut: "2024-03-01", fin: "2024-06-30" },
]

export const eleves: Eleve[] = [
  { id: "e1", nom: "Dupont", prenom: "Marie", classeId: "c1", dateNaissance: "2012-05-14" },
  { id: "e2", nom: "Martin", prenom: "Thomas", classeId: "c1", dateNaissance: "2012-03-22" },
  { id: "e3", nom: "Petit", prenom: "Sophie", classeId: "c1", dateNaissance: "2012-07-30" },
  { id: "e4", nom: "Durand", prenom: "Lucas", classeId: "c2", dateNaissance: "2011-01-18" },
  { id: "e5", nom: "Leroy", prenom: "Emma", classeId: "c2", dateNaissance: "2011-11-05" },
  { id: "e6", nom: "Moreau", prenom: "Hugo", classeId: "c3", dateNaissance: "2010-09-12" },
  { id: "e7", nom: "Simon", prenom: "Chloé", classeId: "c3", dateNaissance: "2010-04-25" },
  { id: "e8", nom: "Michel", prenom: "Nathan", classeId: "c4", dateNaissance: "2009-08-17" },
]

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
]

// Notes pour un élève spécifique (Marie Dupont)
export const notesEleve: Note[] = [
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
]

