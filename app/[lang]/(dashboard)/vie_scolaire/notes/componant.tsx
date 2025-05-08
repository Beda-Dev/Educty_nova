"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, BookOpen, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {notesEleve ,devoirs , eleves , trimestres , matieres , classes , Note , Devoir , Eleve , Trimestre , Classe , Matiere } from "./data"



export default function GestionNotesEleve() {
  const [eleveSelectionne, setEleveSelectionne] = useState<string>("e1")
  const [trimestreSelectionne, setTrimestreSelectionne] = useState<string>("all")
  const [matiereSelectionnee, setMatiereSelectionnee] = useState<string>("all")

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
  const calculerMoyenneMatiere = (matiereId: string, trimestreId: string): string => {
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

    if (notesMatiere.length === 0) return "N/A"

    let sommeCoef = 0
    let sommeNotes = 0

    notesMatiere.forEach((note) => {
      const devoir = devoirsMatiere.find((d) => d.id === note.devoirId)
      if (devoir && note.valeur !== null) {
        sommeCoef += devoir.coefficient
        sommeNotes += note.valeur * devoir.coefficient
      }
    })

    return sommeCoef > 0 ? (sommeNotes / sommeCoef).toFixed(2) : "N/A"
  }

  // Calculer la moyenne générale
  const calculerMoyenneGenerale = (trimestreId: string): string => {
    const moyennes = matieres
      .map((matiere) => {
        const moyenne = calculerMoyenneMatiere(matiere.id, trimestreId)
        return moyenne !== "N/A" ? { valeur: Number.parseFloat(moyenne), coefficient: matiere.coefficient } : null
      })
      .filter((m) => m !== null) as { valeur: number; coefficient: number }[]

    if (moyennes.length === 0) return "N/A"

    const sommeCoef = moyennes.reduce((acc, m) => acc + m.coefficient, 0)
    const sommeNotes = moyennes.reduce((acc, m) => acc + m.valeur * m.coefficient, 0)

    return sommeCoef > 0 ? (sommeNotes / sommeCoef).toFixed(2) : "N/A"
  }

  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <div className="space-y-8">
      {/* Titre de la page avec animation */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex items-center gap-4">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Bulletin de Notes</h1>
      </motion.div>

      {/* Sélection de l'élève */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="hover:shadow-md transition-shadow border-primary/20">
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

        <Card className="hover:shadow-md transition-shadow border-primary/20">
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

        <Card className="hover:shadow-md transition-shadow border-primary/20">
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

      {/* Informations de l'élève */}
      {eleve && classeEleve && (
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-primary/5 p-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {eleve.nom} {eleve.prenom}
              </h2>
              <p className="text-muted-foreground">Né(e) le {new Date(eleve.dateNaissance).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{classeEleve.nom}</h3>
              <p className="text-muted-foreground">Professeur principal: {classeEleve.professeurPrincipal}</p>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-md flex flex-col items-center justify-center">
              <span className="text-sm font-medium">Moyenne générale</span>
              <span className="text-2xl font-bold text-primary">
                {calculerMoyenneGenerale(trimestreSelectionne)}/20
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Affichage des notes par trimestre */}
      <Tabs defaultValue={trimestreSelectionne === "all" ? "t1" : trimestreSelectionne} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          {trimestres.map((trimestre) => (
            <TabsTrigger
              key={trimestre.id}
              value={trimestre.id}
              onClick={() => trimestreSelectionne !== trimestre.id && setTrimestreSelectionne(trimestre.id)}
              className="text-sm"
            >
              {trimestre.nom}
            </TabsTrigger>
          ))}
        </TabsList>

        {trimestres.map((trimestre) => (
          <TabsContent key={trimestre.id} value={trimestre.id} className="space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="grid grid-cols-1 gap-6">
              {/* Moyenne du trimestre */}
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">{trimestre.nom}</h3>
                <div className="bg-primary/10 px-4 py-2 rounded-md">
                  <span className="text-sm font-medium mr-2">Moyenne du trimestre:</span>
                  <span className="text-xl font-bold text-primary">{calculerMoyenneGenerale(trimestre.id)}/20</span>
                </div>
              </div>

              {/* Notes par matière */}
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

                return (
                  <Card key={matiere.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {matiere.nom}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Coefficient: {matiere.coefficient}</span>
                          <div className="bg-primary/10 px-3 py-1 rounded-md">
                            <span className="text-sm font-medium mr-1">Moyenne:</span>
                            <span className="font-bold text-primary">
                              {calculerMoyenneMatiere(matiere.id, trimestre.id)}/20
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Professeur: {matiere.professeur}</p>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Devoir</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Coefficient</TableHead>
                            <TableHead className="text-right">Note</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {devoirsMatiere.map((devoir) => {
                            const note = notesMatiere.find((n) => n.devoirId === devoir.id)
                            return (
                              <TableRow key={devoir.id}>
                                <TableCell>
                                  <div className="font-medium">{devoir.titre}</div>
                                  <div className="text-xs text-muted-foreground">{devoir.description}</div>
                                </TableCell>
                                <TableCell>{new Date(devoir.date).toLocaleDateString()}</TableCell>
                                <TableCell>{devoir.coefficient}</TableCell>
                                <TableCell className="text-right">
                                  <span
                                    className={cn(
                                      "inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium",
                                      !note?.valeur
                                        ? "bg-muted text-muted-foreground"
                                        : note.valeur >= 10
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800",
                                    )}
                                  >
                                    {note?.valeur ?? "Non noté"}
                                    {note?.valeur ? "/20" : ""}
                                  </span>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              })}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
