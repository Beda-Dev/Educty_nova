export type Cours = {
  heure: string;
  matiere: string;
  classe: string;
  salle: string;
  couleur?: string;
};

export type EmploiDuTempsProfesseur = {
  [jour: string]: Cours[];
};

export const joursSemaine = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;
export type JourSemaine = typeof joursSemaine[number];

export const classes = [
  "6ème A", "6ème B", "6ème C",
  "5ème A", "5ème B", "5ème C",
  "4ème A", "4ème B", "4ème C",
  "3ème A", "3ème B", "3ème C",
  "2nd A", "2nd B", "2nd C",
  "1ère A", "1ère B", "1ère C",
  "Terminale A", "Terminale B", "Terminale C"
] as const;

export const matieres = [
  "Mathématiques", "Français", "Histoire-Géo", 
  "Anglais", "Sciences", "Sport", 
  "Arts Plastiques", "Musique", "Technologie",
  "Philosophie", "Physique-Chimie", "SVT", 
  "EPS", "Allemand", "Espagnol", "Latin"
] as const;

export const professeurs = [
  "M. kouassi Roland", "Mme sery Tania", "M. Soro David", 
  "Mme N'gorant Arianne", "M. Kla Alexandre", "Mme Ouatara Binta",
  "M. kouame Cedric", "Mme Moreau", "M. Simon",
  "Mme Dubois", "M. Laurent", "Mme Fournier"
] as const;

export const couleursMatieres: Record<string, string> = {
  "Mathématiques": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Français": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Histoire-Géo": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "Anglais": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Sciences": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Sport": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "default": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
};

export const generateEmploiDuTempsProfesseur = (professeur: string): EmploiDuTempsProfesseur => {
  const emploi: EmploiDuTempsProfesseur = {};

  // Sélectionner aléatoirement 2 matières différentes pour ce professeur
  const matieresProf = [...matieres]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  joursSemaine.forEach(jour => {
    const nbCours = jour === 'mercredi' ? 4 : jour === 'samedi' ? 2 : 6;
    emploi[jour] = [];

    for (let i = 0; i < nbCours; i++) {
      const matiere = matieresProf[Math.floor(Math.random() * matieresProf.length)];
      const classe = classes[Math.floor(Math.random() * classes.length)];

      emploi[jour].push({
        heure: i === 0 ? "08:00 - 09:00" :
              i === 1 ? "09:00 - 10:00" :
              i === 2 ? "10:15 - 11:15" :
              i === 3 ? "11:15 - 12:15" :
              i === 4 ? "14:00 - 15:00" : "15:00 - 16:00",
        matiere,
        classe,
        salle: `Salle ${Math.floor(Math.random() * 30) + 1}`,
        couleur: couleursMatieres[matiere] || couleursMatieres.default
      });
    }
  });

  return emploi;
};


export const getEmploiDuTempsForProfesseur = (professeur: string) => {
  return generateEmploiDuTempsProfesseur(professeur);
};