export interface Student {
  nom: string
  prenom: string
  classe: string
  matricule: string
  niveau?: string
  dateNaissance?: Date
  adresse?: string
  telephone?: string
  email?: string
  dateInscription?: Date
  photo?: string
  sexe?: "M" | "F"
  nationalite?: string
}

export interface CorrespondenceEntry {
  id: string
  date: Date
  titre: string
  contenu: string
  auteur: string
  type: "absence" | "retard" | "note"
}
