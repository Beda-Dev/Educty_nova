"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, BookOpen, Calendar, User, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { notesEleve, devoirs, eleves, trimestres, matieres, classes, Note, Devoir, Eleve, Trimestre, Classe, Matiere } from "./data"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function GestionNotesEleve() {
  const [eleveSelectionne, setEleveSelectionne] = useState<string>("e1")
  const [trimestreSelectionne, setTrimestreSelectionne] = useState<string>("all")
  const [matiereSelectionnee, setMatiereSelectionnee] = useState<string>("all")
  const [matieresExpanded, setMatieresExpanded] = useState<Record<string, boolean>>({})

  // Récupérer l'élève sélectionné
  const eleve = eleves.find((e) => e.id === eleveSelectionne)

  // Récupérer la classe de l'élève
  const classeEleve = eleve ? classes.find((c) => c.id === eleve.classeId) : null

  // Filtrer les devoirs en fonction du trimestre et de la matière sélectionnés
  const devoirsFiltres = devoirs.filter((devoir) => {
    const trimestreMatch = trimestreSelectionne === "all" || devoir.trimestreId === trimestreSelectionne
    const matiereMatch = matiereSelectionnee === "all" || devoir.matiereId === matiereSelectionnee
    const classeMatch = eleve && devoir.classeId === eleve.classeId
    return trimestreMatch && matiereMatch && classeMatch
  })

  // Récupérer les notes de l'élève pour les devoirs filtrés
  const notesFiltrees = notesEleve.filter(
    (note) => note.eleveId === eleveSelectionne && devoirsFiltres.some((devoir) => devoir.id === note.devoirId),
  )

  // Calculer la moyenne par matière et par trimestre
  const calculerMoyenneMatiere = (matiereId: string, trimestreId: string): number | null => {
    const devoirsMatiere = devoirs.filter(
      (d) =>
        d.matiereId === matiereId &&
        (trimestreId === "all" || d.trimestreId === trimestreId) &&
        eleve &&
        d.classeId === eleve.classeId,
    )

    const notesMatiere = notesEleve.filter(
      (n) => n.eleveId === eleveSelectionne && devoirsMatiere.some((d) => d.id === n.devoirId) && n.valeur !== null,
    )

    if (notesMatiere.length === 0) return null

    let sommeCoef = 0
    let sommeNotes = 0

    notesMatiere.forEach((note) => {
      const devoir = devoirsMatiere.find((d) => d.id === note.devoirId)
      if (devoir && note.valeur !== null) {
        sommeCoef += devoir.coefficient
        sommeNotes += note.valeur * devoir.coefficient
      }
    })

    return sommeCoef > 0 ? Number((sommeNotes / sommeCoef).toFixed(2)) : null
  }

  // Calculer la moyenne générale
  const calculerMoyenneGenerale = (trimestreId: string): number | null => {
    const moyennes = matieres
      .map((matiere) => {
        const moyenne = calculerMoyenneMatiere(matiere.id, trimestreId)
        return moyenne !== null ? { valeur: moyenne, coefficient: matiere.coefficient } : null
      })
      .filter((m) => m !== null) as { valeur: number; coefficient: number }[]

    if (moyennes.length === 0) return null

    const sommeCoef = moyennes.reduce((acc, m) => acc + m.coefficient, 0)
    const sommeNotes = moyennes.reduce((acc, m) => acc + m.valeur * m.coefficient, 0)

    return sommeCoef > 0 ? Number((sommeNotes / sommeCoef).toFixed(2)) : null
  }

  // Toggle expansion d'une matière
  const toggleMatiereExpansion = (matiereId: string) => {
    setMatieresExpanded(prev => ({
      ...prev,
      [matiereId]: !prev[matiereId]
    }))
  }

  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardHover = {
    hover: { 
      y: -2,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Titre de la page avec animation */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={fadeIn}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-lg bg-primary/10">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulletin de Notes</h1>
          <p className="text-muted-foreground">Suivi des performances académiques</p>
        </div>
      </motion.div>

      {/* Sélection de l'élève */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          ...fadeIn,
          visible: {
            ...fadeIn.visible,
            transition: { ...fadeIn.visible.transition, delay: 0.2 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div whileHover="hover" variants={cardHover}>
          <Card className="border-primary/20 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Élève
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={eleveSelectionne} onValueChange={setEleveSelectionne}>
                <SelectTrigger className="hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Sélectionner un élève" />
                </SelectTrigger>
                <SelectContent>
                  {eleves.map((eleve) => (
                    <SelectItem key={eleve.id} value={eleve.id}>
                      <div className="flex flex-col">
                        <span>
                          {eleve.nom} {eleve.prenom}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {classes.find((c) => c.id === eleve.classeId)?.nom} • Né(e) le:{" "}
                          {new Date(eleve.dateNaissance).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover="hover" variants={cardHover}>
          <Card className="border-primary/20 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Période
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={trimestreSelectionne} onValueChange={setTrimestreSelectionne}>
                <SelectTrigger className="hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Sélectionner un trimestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les trimestres</SelectItem>
                  {trimestres.map((trimestre) => (
                    <SelectItem key={trimestre.id} value={trimestre.id}>
                      <div className="flex flex-col">
                        <span>{trimestre.nom}</span>
                        <span className="text-xs text-muted-foreground">
                          Du {new Date(trimestre.debut).toLocaleDateString()} au{" "}
                          {new Date(trimestre.fin).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover="hover" variants={cardHover}>
          <Card className="border-primary/20 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Matière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={matiereSelectionnee} onValueChange={setMatiereSelectionnee}>
                <SelectTrigger className="hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id}>
                      <div className="flex flex-col">
                        <span>{matiere.nom}</span>
                        <span className="text-xs text-muted-foreground">
                          {matiere.professeur} • Coefficient: {matiere.coefficient}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Informations de l'élève */}
      {eleve && classeEleve && (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{
            ...fadeIn,
            visible: {
              ...fadeIn.visible,
              transition: { ...fadeIn.visible.transition, delay: 0.4 }
            }
          }}
          className="bg-gradient-to-r from-primary/5 to-background p-6 rounded-lg border"
        >
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {eleve.nom} {eleve.prenom}
                </h2>
                <p className="text-muted-foreground">Né(e) le {new Date(eleve.dateNaissance).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{classeEleve.nom}</h3>
                <p className="text-muted-foreground">Professeur principal: {classeEleve.professeurPrincipal}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">Moyenne générale</span>
                <span className="text-3xl font-bold text-primary">
                  {calculerMoyenneGenerale(trimestreSelectionne)?.toFixed(2) ?? "N/A"}
                  <span className="text-xl text-muted-foreground">/20</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Affichage des notes par trimestre */}
      <Tabs defaultValue={trimestreSelectionne === "all" ? "t1" : trimestreSelectionne} className="w-full">
        <motion.div variants={fadeIn}>
          <TabsList className="grid grid-cols-3 mb-6 bg-secondary/50 backdrop-blur-sm">
            {trimestres.map((trimestre) => (
              <TabsTrigger
                key={trimestre.id}
                value={trimestre.id}
                onClick={() => trimestreSelectionne !== trimestre.id && setTrimestreSelectionne(trimestre.id)}
                className="text-sm py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {trimestre.nom}
              </TabsTrigger>
            ))}
          </TabsList>
        </motion.div>

        {trimestres.map((trimestre) => (
          <TabsContent key={trimestre.id} value={trimestre.id} className="space-y-6">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={stagger}
              className="space-y-6"
            >
              {/* Moyenne du trimestre */}
              <motion.div variants={fadeIn}>
                <Card className="border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{trimestre.nom}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Du {new Date(trimestre.debut).toLocaleDateString()} au {new Date(trimestre.fin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Moyenne du trimestre</span>
                        <span className="text-2xl font-bold text-primary">
                          {calculerMoyenneGenerale(trimestre.id)?.toFixed(2) ?? "N/A"}
                          <span className="text-lg text-muted-foreground">/20</span>
                        </span>
                      </div>
                      <div className="w-32">
                        <Progress 
                          value={(calculerMoyenneGenerale(trimestre.id) ?? 0) * 5} 
                          className="h-2 bg-primary/10"
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Notes par matière */}
              <AnimatePresence>
                {matieres.map((matiere) => {
                  const devoirsMatiere = devoirs.filter(
                    (d) =>
                      d.matiereId === matiere.id &&
                      d.trimestreId === trimestre.id &&
                      eleve &&
                      d.classeId === eleve.classeId,
                  )

                  const notesMatiere = notesEleve.filter(
                    (n) => n.eleveId === eleveSelectionne && devoirsMatiere.some((d) => d.id === n.devoirId),
                  )

                  // Ne pas afficher les matières sans notes
                  if (notesMatiere.length === 0) return null

                  const moyenneMatiere = calculerMoyenneMatiere(matiere.id, trimestre.id)
                  const isExpanded = matieresExpanded[matiere.id] ?? true

                  return (
                    <motion.div 
                      key={matiere.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card className="overflow-hidden border-primary/20">
                        <motion.div
                          onClick={() => toggleMatiereExpansion(matiere.id)}
                          className="cursor-pointer"
                          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                        >
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-lg">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle>{matiere.nom}</CardTitle>
                                <p className="text-sm text-muted-foreground">Professeur: {matiere.professeur}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge color="skyblue" className="px-3 py-1">
                                Coef: {matiere.coefficient}
                              </Badge>
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-muted-foreground">Moyenne</span>
                                <span className={cn(
                                  "text-xl font-bold",
                                  moyenneMatiere === null ? "text-muted-foreground" :
                                  moyenneMatiere >= 10 ? "text-green-600" : "text-red-600"
                                )}>
                                  {moyenneMatiere?.toFixed(2) ?? "N/A"}
                                  <span className="text-sm text-muted-foreground">/20</span>
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </CardHeader>
                        </motion.div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial="collapsed"
                              animate="open"
                              exit="collapsed"
                              variants={{
                                open: { opacity: 1, height: 'auto' },
                                collapsed: { opacity: 0, height: 0 }
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <CardContent className="p-0">
                                <Table>
                                  <TableHeader className="bg-secondary/50">
                                    <TableRow>
                                      <TableHead className="w-[40%]">Devoir</TableHead>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Coef.</TableHead>
                                      <TableHead className="text-right">Note</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {devoirsMatiere.map((devoir) => {
                                      const note = notesMatiere.find((n) => n.devoirId === devoir.id)
                                      const noteValue = note?.valeur
                                      const notePercentage = noteValue ? (noteValue / 20) * 100 : 0

                                      return (
                                        <TableRow key={devoir.id} className="hover:bg-secondary/10">
                                          <TableCell>
                                            <div className="font-medium">{devoir.titre}</div>
                                            <div className="text-xs text-muted-foreground">{devoir.description}</div>
                                          </TableCell>
                                          <TableCell>
                                            {new Date(devoir.date).toLocaleDateString()}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline">{devoir.coefficient}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-3">
                                              <div className="w-20">
                                                <Progress 
                                                  value={notePercentage} 
                                                  className={cn(
                                                    "h-2",
                                                    !noteValue
                                                      ? "bg-gray-300"
                                                      : noteValue >= 10
                                                      ? "bg-green-500"
                                                      : "bg-red-500"
                                                  )}
                                                  
                                                />
                                              </div>
                                              <Badge
                                                color={!noteValue ? "secondary" : noteValue >= 10 ? "success" : "destructive"}
                                                className="px-3 py-1 text-sm font-medium"
                                              >
                                                {noteValue ?? "N/R"}
                                                {noteValue ? "/20" : ""}
                                              </Badge>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}