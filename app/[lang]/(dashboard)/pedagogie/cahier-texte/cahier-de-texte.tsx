"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, Filter, SortDesc, SortAsc, School, Calendar, BookOpen, Info, AlertCircle, Home, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddEntryDialog } from "./add-entry-dialog"
import { EntryType, type Entry } from "./types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { useAutoAnimate } from "@formkit/auto-animate/react"

// Sample data with more entries
const initialEntries: Entry[] = [
  {
    id: "1",
    date: new Date("2023-09-15"),
    subject: "Mathématiques",
    title: "Équations du second degré",
    content: "Résolution d'équations du second degré par la méthode du discriminant.\n\nExercices :\n- Page 25 : Exercices 1 à 5\n- Page 26 : Problèmes 1 et 2",
    type: EntryType.LESSON,
    class: "Terminale S",
    academicYear: "2023-2024",
  },
  {
    id: "2",
    date: new Date("2023-09-16"),
    subject: "Français",
    title: "Analyse de texte - Victor Hugo",
    content: "Lecture et analyse du poème 'Demain dès l'aube' de Victor Hugo.\n\nQuestions à préparer pour la prochaine séance :\n1. Quel est le thème principal du poème ?\n2. Analysez les procédés stylistiques utilisés",
    type: EntryType.HOMEWORK,
    class: "Seconde A",
    academicYear: "2023-2024",
  },
  {
    id: "3",
    date: new Date("2023-09-18"),
    subject: "Histoire",
    title: "La Révolution française",
    content: "Étude des causes et conséquences de la Révolution française.\n\nÀ préparer :\n- Présentation orale pour le 25/09\n- Lecture des pages 45 à 52",
    type: EntryType.EXAM,
    class: "Première ES",
    academicYear: "2023-2024",
  },
  {
    id: "4",
    date: new Date("2023-09-19"),
    subject: "Physique-Chimie",
    title: "Les lois de Newton",
    content: "Introduction aux lois du mouvement de Newton.\n\nExpériences réalisées :\n- Plan incliné\n- Chute libre\n\nÀ faire : Compte-rendu d'expérience à rendre pour le 26/09",
    type: EntryType.LESSON,
    class: "Terminale S",
    academicYear: "2023-2024",
  },
  {
    id: "5",
    date: new Date("2023-09-20"),
    subject: "SVT",
    title: "Génétique moléculaire",
    content: "Structure de l'ADN et mécanisme de réplication.\n\nTravaux pratiques : Extraction d'ADN de banane\n\nÀ réviser pour le contrôle du 28/09",
    type: EntryType.HOMEWORK,
    class: "Première S",
    academicYear: "2023-2024",
  },
  {
    id: "6",
    date: new Date("2023-09-21"),
    subject: "Anglais",
    title: "Present perfect tense",
    content: "Révision du present perfect et différences avec le prétérit.\n\nExercices :\n- Workbook pages 34-35\n- Préparer un dialogue utilisant ces temps",
    type: EntryType.LESSON,
    class: "Seconde B",
    academicYear: "2023-2024",
  },
  {
    id: "7",
    date: new Date("2023-09-22"),
    subject: "Philosophie",
    title: "La conscience",
    content: "Définition et problématiques autour de la notion de conscience.\n\nTextes étudiés :\n- Descartes, Méditations métaphysiques\n- Freud, Métapsychologie\n\nDissertation à rendre pour le 30/09",
    type: EntryType.HOMEWORK,
    class: "Terminale L",
    academicYear: "2023-2024",
  },
  {
    id: "8",
    date: new Date("2023-09-25"),
    subject: "Mathématiques",
    title: "Contrôle de géométrie",
    content: "Contrôle sur les vecteurs et les équations de droites dans le plan.\n\nDurée : 2 heures\n\nMatériel autorisé : Calculatrice scientifique",
    type: EntryType.EXAM,
    class: "Première S",
    academicYear: "2023-2024",
  },
  {
    id: "9",
    date: new Date("2023-09-26"),
    subject: "Espagnol",
    title: "El subjuntivo",
    content: "Introduction au subjonctif présent en espagnol.\n\nExercices :\n- Conjuguer les verbes pages 42-43\n- Rédiger 10 phrases utilisant ce temps",
    type: EntryType.LESSON,
    class: "Terminale ES",
    academicYear: "2023-2024",
  },
  {
    id: "10",
    date: new Date("2023-09-27"),
    subject: "Histoire-Géographie",
    title: "La mondialisation",
    content: "Étude de cas : Le commerce du café\n\nDocuments analysés :\n- Carte des flux mondiaux\n- Graphique de l'évolution des prix\n\nÀ faire : Fiche de révision pour le bac blanc",
    type: EntryType.LESSON,
    class: "Terminale ES",
    academicYear: "2023-2024",
  },
]

export function CahierDeTexte() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterSubject, setFilterSubject] = useState<string | null>(null)
  const [filterClass, setFilterClass] = useState<string | null>(null)
  const [filterAcademicYear, setFilterAcademicYear] = useState<string | null>(null)
  const [parent] = useAutoAnimate()

  const handleAddEntry = (newEntry: Omit<Entry, "id">) => {
    const entry: Entry = {
      ...newEntry,
      id: Date.now().toString(),
    }
    setEntries([...entries, entry])
    setIsDialogOpen(false)
  }

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  // Apply all filters
  let filteredEntries = entries
  if (filterSubject) {
    filteredEntries = filteredEntries.filter((entry) => entry.subject === filterSubject)
  }
  if (filterClass) {
    filteredEntries = filteredEntries.filter((entry) => entry.class === filterClass)
  }
  if (filterAcademicYear) {
    filteredEntries = filteredEntries.filter((entry) => entry.academicYear === filterAcademicYear)
  }

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.date.getTime() - b.date.getTime()
    } else {
      return b.date.getTime() - a.date.getTime()
    }
  })

  const uniqueSubjects = Array.from(new Set(entries.map((entry) => entry.subject)))
  const uniqueClasses = Array.from(new Set(entries.map((entry) => entry.class)))
  const uniqueAcademicYears = Array.from(new Set(entries.map((entry) => entry.academicYear)))

  const getEntryIcon = (type: EntryType) => {
    switch (type) {
      case EntryType.LESSON:
        return <BookOpen className="h-5 w-5" />
      case EntryType.HOMEWORK:
        return <Home className="h-5 w-5" />
      case EntryType.EXAM:
        return <ClipboardList className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cahier de texte numérique</h1>
            <p className="text-sm text-muted-foreground">
              Gestion des cours, devoirs et évaluations
            </p>
          </div>

          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle entrée
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class filter */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <School className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrer par classe</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select value={filterClass || ""} onValueChange={(value) => setFilterClass(value || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic year filter */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrer par année scolaire</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select value={filterAcademicYear || ""} onValueChange={(value) => setFilterAcademicYear(value || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les années" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {uniqueAcademicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject filter */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Filter className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrer par matière</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select value={filterSubject || ""} onValueChange={(value) => setFilterSubject(value || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les matières" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleSortDirection} className="gap-2">
                  {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  Trier par date
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sortDirection === "asc" ? "Du plus ancien au plus récent" : "Du plus récent au plus ancien"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge variant="outline" className="ml-auto">
            {filteredEntries.length} entrée{filteredEntries.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </motion.div>

      <div ref={parent}>
        {sortedEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 gap-4 text-center rounded-lg border border-dashed"
          >
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Aucune entrée trouvée</h3>
              <p className="text-sm text-muted-foreground">
                Essayez de modifier vos filtres ou ajoutez une nouvelle entrée
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {sortedEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getEntryIcon(entry.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{entry.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <span>{entry.subject}</span>
                              <span>•</span>
                              <span>{entry.class}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          color={
                            entry.type === EntryType.LESSON
                              ? "default"
                              : entry.type === EntryType.HOMEWORK
                                ? "secondary"
                                : "destructive"
                          }
                          className="shrink-0"
                        >
                          {entry.type === EntryType.LESSON
                            ? "Cours"
                            : entry.type === EntryType.HOMEWORK
                              ? "Devoir"
                              : "Examen"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{entry.content}</pre>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Badge variant="outline">
                        {entry.academicYear}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {format(entry.date, "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AddEntryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddEntry={handleAddEntry}
        existingSubjects={uniqueSubjects}
        existingClasses={uniqueClasses}
        existingAcademicYears={uniqueAcademicYears}
      />
    </div>
  )
}