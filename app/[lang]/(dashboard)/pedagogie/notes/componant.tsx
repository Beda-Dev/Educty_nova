"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Save, FileEdit, ChevronDown, Book, Calculator, Mail, School, GraduationCap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Types
interface Classe {
  id: string
  nom: string
  niveau: string
  effectif: number
  professeurPrincipal: string
}

interface Devoir {
  id: string
  titre: string
  classeId: string
  date: string
  coefficient: number
  matiere: string
  description: string
}

interface Eleve {
  id: string
  nom: string
  prenom: string
  classeId: string
  dateNaissance: string
}

interface Note {
  eleveId: string
  devoirId: string
  valeur: number | null
}

// Données de démonstration enrichies
const classes: Classe[] = [
  { id: "c1", nom: "6ème A", niveau: "6ème", effectif: 24, professeurPrincipal: "Mme. Dubois" },
  { id: "c2", nom: "5ème B", niveau: "5ème", effectif: 28, professeurPrincipal: "M. Martin" },
  { id: "c3", nom: "4ème C", niveau: "4ème", effectif: 26, professeurPrincipal: "Mme. Lambert" },
  { id: "c4", nom: "3ème D", niveau: "3ème", effectif: 30, professeurPrincipal: "M. Durand" },
  { id: "c5", nom: "2nde A", niveau: "Seconde", effectif: 32, professeurPrincipal: "Mme. Petit" },
  { id: "c6", nom: "1ère B", niveau: "Première", effectif: 29, professeurPrincipal: "M. Leroy" },
  { id: "c7", nom: "Terminale C", niveau: "Terminale", effectif: 27, professeurPrincipal: "Mme. Moreau" },
]

const devoirs: Devoir[] = [
  { 
    id: "d1", 
    titre: "Contrôle de mathématiques", 
    classeId: "c1", 
    date: "2023-10-15", 
    coefficient: 2,
    matiere: "Mathématiques",
    description: "Contrôle sur les fractions et les nombres décimaux"
  },
  { 
    id: "d2", 
    titre: "Interrogation surprise", 
    classeId: "c1", 
    date: "2023-10-22", 
    coefficient: 1,
    matiere: "Français",
    description: "Analyse grammaticale de phrases complexes"
  },
  { 
    id: "d3", 
    titre: "Devoir maison", 
    classeId: "c1", 
    date: "2023-11-05", 
    coefficient: 1.5,
    matiere: "Histoire-Géographie",
    description: "Rédaction sur la Révolution française"
  },
  { 
    id: "d4", 
    titre: "Examen trimestriel", 
    classeId: "c2", 
    date: "2023-10-18", 
    coefficient: 3,
    matiere: "Sciences Physiques",
    description: "Examen couvrant les chapitres 1 à 3"
  },
  { 
    id: "d5", 
    titre: "Contrôle de français", 
    classeId: "c2", 
    date: "2023-11-02", 
    coefficient: 2,
    matiere: "Français",
    description: "Commentaire de texte sur un extrait de Victor Hugo"
  },
  { 
    id: "d6", 
    titre: "Test d'histoire", 
    classeId: "c3", 
    date: "2023-10-20", 
    coefficient: 1,
    matiere: "Histoire",
    description: "Dates clés de la Première Guerre mondiale"
  },
  { 
    id: "d7", 
    titre: "Évaluation de sciences", 
    classeId: "c4", 
    date: "2023-11-10", 
    coefficient: 2,
    matiere: "SVT",
    description: "Génétique et hérédité"
  },
  { 
    id: "d8", 
    titre: "Devoir de philosophie", 
    classeId: "c7", 
    date: "2023-11-15", 
    coefficient: 2,
    matiere: "Philosophie",
    description: "Dissertation sur le thème de la liberté"
  },
]

const eleves: Eleve[] = [
  { id: "e1", nom: "Dupont", prenom: "Marie", classeId: "c1", dateNaissance: "2012-05-14" },
  { id: "e2", nom: "Martin", prenom: "Thomas", classeId: "c1", dateNaissance: "2012-03-22" },
  { id: "e3", nom: "Petit", prenom: "Sophie", classeId: "c1", dateNaissance: "2012-07-30" },
  { id: "e4", nom: "Durand", prenom: "Lucas", classeId: "c1", dateNaissance: "2012-01-18" },
  { id: "e5", nom: "Leroy", prenom: "Emma", classeId: "c1", dateNaissance: "2012-11-05" },
  { id: "e6", nom: "Moreau", prenom: "Hugo", classeId: "c2", dateNaissance: "2011-09-12" },
  { id: "e7", nom: "Simon", prenom: "Chloé", classeId: "c2", dateNaissance: "2011-04-25" },
  { id: "e8", nom: "Michel", prenom: "Nathan", classeId: "c2", dateNaissance: "2011-08-17" },
  { id: "e9", nom: "Lefebvre", prenom: "Léa", classeId: "c3", dateNaissance: "2010-02-28" },
  { id: "e10", nom: "Garcia", prenom: "Maxime", classeId: "c3", dateNaissance: "2010-06-15" },
  { id: "e11", nom: "Roux", prenom: "Camille", classeId: "c4", dateNaissance: "2009-12-03" },
  { id: "e12", nom: "Fournier", prenom: "Théo", classeId: "c4", dateNaissance: "2009-10-22" },
  { id: "e13", nom: "Bernard", prenom: "Manon", classeId: "c5", dateNaissance: "2008-07-19" },
  { id: "e14", nom: "Girard", prenom: "Antoine", classeId: "c5", dateNaissance: "2008-03-11" },
  { id: "e15", nom: "Bonnet", prenom: "Sarah", classeId: "c6", dateNaissance: "2007-05-08" },
  { id: "e16", nom: "Dumont", prenom: "Alexandre", classeId: "c7", dateNaissance: "2006-09-27" },
]

// Notes initiales enrichies
const notesInitiales: Note[] = [
  { eleveId: "e1", devoirId: "d1", valeur: 15 },
  { eleveId: "e2", devoirId: "d1", valeur: 12 },
  { eleveId: "e3", devoirId: "d1", valeur: 18 },
  { eleveId: "e4", devoirId: "d1", valeur: 10 },
  { eleveId: "e5", devoirId: "d1", valeur: 14 },
  { eleveId: "e1", devoirId: "d2", valeur: 16 },
  { eleveId: "e2", devoirId: "d2", valeur: 13 },
  { eleveId: "e3", devoirId: "d2", valeur: null },
  { eleveId: "e4", devoirId: "d2", valeur: 11 },
  { eleveId: "e5", devoirId: "d2", valeur: null },
  { eleveId: "e6", devoirId: "d4", valeur: 17 },
  { eleveId: "e7", devoirId: "d4", valeur: 14 },
  { eleveId: "e8", devoirId: "d4", valeur: 12 },
  { eleveId: "e9", devoirId: "d6", valeur: 15 },
  { eleveId: "e10", devoirId: "d6", valeur: 9 },
  { eleveId: "e11", devoirId: "d7", valeur: 13 },
  { eleveId: "e12", devoirId: "d7", valeur: 16 },
  { eleveId: "e16", devoirId: "d8", valeur: 14 },
]

export default function GestionNotes() {
  const [classeSelectionnee, setClasseSelectionnee] = useState<string>("")
  const [devoirSelectionne, setDevoirSelectionne] = useState<string>("")
  const [notes, setNotes] = useState<Note[]>(notesInitiales)
  const [notesModifiees, setNotesModifiees] = useState<Note[]>([])
  const [modeEdition, setModeEdition] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
// Filtrer les devoirs et élèves
const devoirsFiltres = devoirs.filter((devoir) => devoir.classeId === classeSelectionnee)
const elevesFiltres = eleves.filter((eleve) => eleve.classeId === classeSelectionnee)

useEffect(() => {
  setDevoirSelectionne("")
  setModeEdition(false)
}, [classeSelectionnee])

const getNoteEleve = (eleveId: string): number | null => {
  const note = notes.find((n) => n.eleveId === eleveId && n.devoirId === devoirSelectionne)
  return note ? note.valeur : null
}

const updateNote = (eleveId: string, valeur: string) => {
  const noteValue = valeur === "" ? null : Number.parseFloat(valeur)
  if (noteValue !== null && (isNaN(noteValue) || noteValue < 0 || noteValue > 20)) return

  const notesCopy = [...notes]
  const index = notesCopy.findIndex((n) => n.eleveId === eleveId && n.devoirId === devoirSelectionne)

  if (index !== -1) {
    notesCopy[index].valeur = noteValue
  } else if (noteValue !== null) {
    notesCopy.push({ eleveId, devoirId: devoirSelectionne, valeur: noteValue })
  }

  setNotes(notesCopy)

  const noteModifieeIndex = notesModifiees.findIndex((n) => n.eleveId === eleveId && n.devoirId === devoirSelectionne)
  if (noteModifieeIndex !== -1) {
    const notesModifieesCopy = [...notesModifiees]
    notesModifieesCopy[noteModifieeIndex].valeur = noteValue
    setNotesModifiees(notesModifieesCopy)
  } else {
    setNotesModifiees([...notesModifiees, { eleveId, devoirId: devoirSelectionne, valeur: noteValue }])
  }
}

const saveChanges = () => {
  console.log("Notes sauvegardées:", notesModifiees)
  setNotesModifiees([])
  setModeEdition(false)
  setShowSaveConfirmation(true)
}

const calculerMoyenneClasse = (): string => {
  const notesDevoir = notes.filter((n) => n.devoirId === devoirSelectionne && n.valeur !== null)
  if (notesDevoir.length === 0) return "N/A"
  const somme = notesDevoir.reduce((acc, note) => acc + (note.valeur || 0), 0)
  return (somme / notesDevoir.length).toFixed(2)
}

const devoirActuel = devoirs.find((d) => d.id === devoirSelectionne)
const classeActuelle = classes.find((c) => c.id === classeSelectionnee)

// Animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
}

const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
}

return (
  <div className="space-y-8">
    {/* Titre de la page avec animation */}
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex items-center gap-4"
    >
      <GraduationCap className="h-8 w-8 text-skyblue" />
      <h1 className="text-3xl font-bold tracking-tight">Gestion des Notes Scolaires</h1>
    </motion.div>

    {/* Sélecteurs de classe et devoir */}
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <motion.div variants={slideIn}>
        <Card className="hover:shadow-md transition-shadow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <School className="h-5 w-5 text-skyblue" />
              Sélection de la classe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={classeSelectionnee} onValueChange={setClasseSelectionnee}>
              <SelectTrigger className="hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classe) => (
                  <motion.div 
                    key={classe.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SelectItem value={classe.id}>
                      <div className="flex flex-col">
                        <span>{classe.nom}</span>
                        <span className="text-xs text-muted-foreground">
                          {classe.niveau} • {classe.effectif} élèves • {classe.professeurPrincipal}
                        </span>
                      </div>
                    </SelectItem>
                  </motion.div>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={slideIn}>
        <Card className="hover:shadow-md transition-shadow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Book className="h-5 w-5 text-skyblue" />
              Sélection du devoir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={devoirSelectionne} 
              onValueChange={setDevoirSelectionne} 
              disabled={!classeSelectionnee}
            >
              <SelectTrigger className="hover:border-primary/50 transition-colors">
                <SelectValue
                  placeholder={classeSelectionnee ? "Sélectionner un devoir" : "Sélectionnez d'abord une classe"}
                />
              </SelectTrigger>
              <SelectContent>
                {devoirsFiltres.map((devoir) => (
                  <motion.div
                    key={devoir.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SelectItem value={devoir.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{devoir.titre}</span>
                        <span className="text-xs text-muted-foreground">
                          {devoir.matiere} • Coef. {devoir.coefficient} • {new Date(devoir.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">{devoir.description}</span>
                      </div>
                    </SelectItem>
                  </motion.div>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>

    {/* Tableau des notes */}
    <AnimatePresence>
      {classeSelectionnee && devoirSelectionne && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeIn}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-background p-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calculator className="h-6 w-6" />
                  Notes des élèves - {classeActuelle?.nom}
                </CardTitle>
                {devoirActuel && (
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="mt-2 space-y-1"
                  >
                    <p className="text-sm font-medium">
                      <span className="font-semibold">Matière:</span> {devoirActuel.matiere} • 
                      <span className="font-semibold ml-2">Coefficient:</span> {devoirActuel.coefficient} • 
                      <span className="font-semibold ml-2">Date:</span> {new Date(devoirActuel.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{devoirActuel.description}</p>
                    <p className="text-sm font-medium text-skyblue mt-1">
                      Moyenne de la classe: {calculerMoyenneClasse()}/20
                    </p>
                  </motion.div>
                )}
              </div>
              <div className="flex space-x-2">
                {!modeEdition ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => setModeEdition(true)} 
                      className="flex items-center gap-2 shadow-sm"
                    >
                      <FileEdit className="h-4 w-4" />
                      Modifier les notes
                    </Button>
                  </motion.div>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="flex items-center gap-2 shadow-sm bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4" />
                          Enregistrer
                        </Button>
                      </motion.div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={popIn}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Save className="h-5 w-5" />
                            Confirmer l'enregistrement
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir enregistrer les modifications pour {devoirActuel?.titre} ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <AlertDialogAction 
                              onClick={saveChanges}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirmer
                            </AlertDialogAction>
                          </motion.div>
                        </AlertDialogFooter>
                      </motion.div>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableCaption className="text-muted-foreground">
                  Liste des {elevesFiltres.length} élèves de {classeActuelle?.nom} - Professeur principal: {classeActuelle?.professeurPrincipal}
                </TableCaption>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[150px]">Nom</TableHead>
                    <TableHead className="w-[150px]">Prénom</TableHead>
                    <TableHead className="text-right w-[120px]">Note (/20)</TableHead>
                    {modeEdition && <TableHead className="text-right w-[50px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elevesFiltres.map((eleve) => (
                    <motion.tr 
                      key={eleve.id}
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "border-t",
                        modeEdition ? "bg-secondary/20" : "bg-transparent"
                      )}
                    >
                      <TableCell className="font-medium">{eleve.nom}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{eleve.prenom}</span>
                          <span className="text-xs text-muted-foreground">
                            Né(e) le: {new Date(eleve.dateNaissance).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {modeEdition ? (
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={getNoteEleve(eleve.id) === null ? "" : getNoteEleve(eleve.id)!.toString()}
                              onChange={(e) => updateNote(eleve.id, e.target.value)}
                              className="w-24 text-right shadow-sm hover:border-primary/50 transition-colors"
                            />
                          </motion.div>
                        ) : (
                          <motion.span 
                            className={cn(
                              "inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium",
                              getNoteEleve(eleve.id) === null 
                                ? "bg-muted text-muted-foreground" 
                                : getNoteEleve(eleve.id)! >= 10 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                            )}
                            whileHover={{ scale: 1.05 }}
                          >
                            {getNoteEleve(eleve.id) === null ? "Non noté" : getNoteEleve(eleve.id)}
                          </motion.span>
                        )}
                      </TableCell>
                      {modeEdition && (
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => updateNote(eleve.id, "")}
                            className="text-red-500 hover:text-red-700"
                          >
                            Effacer
                          </Button>
                        </TableCell>
                      )}
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Confirmation de sauvegarde */}
    <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
      <AlertDialogContent>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={popIn}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-green-500" />
              Notes enregistrées avec succès
            </AlertDialogTitle>
            <AlertDialogDescription>
              Les modifications pour {devoirActuel?.titre} ont été sauvegardées dans le système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AlertDialogAction className="bg-green-600 hover:bg-green-700">
                Continuer
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
)
}