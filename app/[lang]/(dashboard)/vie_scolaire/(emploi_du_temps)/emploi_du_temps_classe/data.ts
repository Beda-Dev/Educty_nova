export type Cours = {
    heure: string;
    matiere: string;
    professeur: string;
    salle?: string;
    couleur?: string;
  };
  
  export type EmploiDuTemps = {
    [classe: string]: {
      [jour: string]: Cours[];
    };
  };
  
  export const joursSemaine = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;
  export type JourSemaine = typeof joursSemaine[number];
  
  export const classes = [
    "6ème A", "6ème 2", "6ème C",
    "5ème A", "5ème B", "5ème C",
    "4ème A", "4ème B", "4ème C",
    "3ème A", "3ème B", "3ème C",
    "2nd A", "2nd C",
    "1ère A", "1ère C", "1ère D",
    "Terminale A", "Terminale C", "Terminale D"
  ] as const;
  
  export const matieres = [
    "Mathématiques", "Français", "Histoire-Géo", 
    "Anglais", "Sciences", "Sport", 
    "Arts Plastiques", "Musique", "Technologie",
    "Éducation civique", "Vie de classe", "Philosophie",
    "Physique-Chimie", "SVT", "EPS",
    "Allemand", "Espagnol", "Latin"
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
  
  // Données factices générées pour toutes les classes
  export const generateEmploiDuTemps = (): EmploiDuTemps => {
    const emploi: EmploiDuTemps = {};
    
    classes.forEach(classe => {
      emploi[classe] = {};
      joursSemaine.forEach(jour => {
        if (jour === 'samedi' && !classe.includes('Terminale')) {
          // Pas de cours le samedi sauf pour les terminales
          emploi[classe][jour] = [];
        } else {
          const nbCours = jour === 'mercredi' ? 3 : jour === 'samedi' ? 2 : 6;
          emploi[classe][jour] = [];
          
          for (let i = 0; i < nbCours; i++) {
            const matiere = matieres[Math.floor(Math.random() * matieres.length)];
            emploi[classe][jour].push({
              heure: i === 0 ? "08:00 - 09:00" : 
                    i === 1 ? "09:00 - 10:00" :
                    i === 2 ? "10:15 - 11:15" :
                    i === 3 ? "11:15 - 12:15" :
                    i === 4 ? "14:00 - 15:00" : "15:00 - 16:00",
              matiere,
              professeur: `Prof. ${['Dupont', 'Martin', 'Bernard', 'Robert', 'Petit', 'Leroy', 'Roux', 'Moreau'][Math.floor(Math.random() * 8)]}`,
              salle: `Salle ${Math.floor(Math.random() * 30) + 1}`,
              couleur: couleursMatieres[matiere] || couleursMatieres.default
            });
          }
        }
      });
    });
    
    return emploi;
  };
  
  export const emploiDuTemps = generateEmploiDuTemps();