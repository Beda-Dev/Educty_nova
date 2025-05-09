// Types pour les données des élèves
export interface Student {
    id: string
    name: string
    grades: {
      math: number
      french: number
      history: number
      science: number
      english: number
      physicalEducation: number
      arts: number
      geography: number
    }
  }
  
  // Données fictives des élèves
  const students: Student[] = [
    {
      id: "1",
      name: "Thomas Dubois",
      grades: {
        math: 17.5,
        french: 15.0,
        history: 14.5,
        science: 16.0,
        english: 15.5,
        physicalEducation: 13.0,
        arts: 14.0,
        geography: 16.5
      },
    },
    {
      id: "2",
      name: "Emma Martin",
      grades: {
        math: 12.5,
        french: 16.5,
        history: 15.0,
        science: 13.0,
        english: 17.0,
        physicalEducation: 14.5,
        arts: 16.0,
        geography: 15.5
      },
    },
    {
      id: "3",
      name: "Lucas Bernard",
      grades: {
        math: 9.5,
        french: 11.0,
        history: 10.5,
        science: 8.5,
        english: 10.0,
        physicalEducation: 12.0,
        arts: 9.0,
        geography: 11.5
      },
    },
    {
      id: "4",
      name: "Chloé Petit",
      grades: {
        math: 14.0,
        french: 13.5,
        history: 12.0,
        science: 15.5,
        english: 14.5,
        physicalEducation: 16.0,
        arts: 17.5,
        geography: 13.0
      },
    },
    {
      id: "5",
      name: "Hugo Leroy",
      grades: {
        math: 7.5,
        french: 9.0,
        history: 8.0,
        science: 7.0,
        english: 8.5,
        physicalEducation: 11.5,
        arts: 10.0,
        geography: 9.5
      },
    },
    {
      id: "6",
      name: "Léa Moreau",
      grades: {
        math: 18.0,
        french: 17.5,
        history: 16.0,
        science: 18.5,
        english: 19.0,
        physicalEducation: 15.0,
        arts: 16.5,
        geography: 17.0
      },
    },
    {
      id: "7",
      name: "Nathan Roux",
      grades: {
        math: 13.0,
        french: 12.0,
        history: 14.0,
        science: 13.5,
        english: 14.0,
        physicalEducation: 13.5,
        arts: 12.5,
        geography: 14.5
      },
    },
  ]
  
  // Fonction pour récupérer tous les élèves
  export function getStudents(): Student[] {
    return students
  }
  
  // Fonction pour récupérer un élève par son ID
  export function getStudentById(id: string): Student | undefined {
    return students.find((student) => student.id === id)
  }