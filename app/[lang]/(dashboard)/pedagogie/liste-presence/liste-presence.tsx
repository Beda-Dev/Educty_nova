"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock, User, BookOpen, School, Clock3, CheckCircle2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAutoAnimate } from "@formkit/auto-animate/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {  Presence } from "./types";
import { classes, eleves, cours, jours } from "./data"

export default function ListePresence() {
  const [classeSelectionnee, setClasseSelectionnee] = useState<string>("")
  const [jourSelectionne, setJourSelectionne] = useState<string>(jours[0])
  const [presences, setPresences] = useState<Record<string, Presence[]>>({})
  const [dateActuelle, setDateActuelle] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [parent] = useAutoAnimate()

  useEffect(() => {
    setIsLoading(true)
    const date = new Date()
    setDateActuelle(
      format(date, "EEEE d MMMM yyyy", { locale: fr })
        .split("")
        .map((char, i) => (i === 0 ? char.toUpperCase() : char))
        .join(""),
    )
    
    // Simuler un chargement
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Filtrer les élèves par classe
  const elevesClasse = eleves.filter((eleve) => eleve.classeId === classeSelectionnee)

  // Filtrer les cours par classe et jour
  const coursClasse = cours.filter((cours) => cours.classeId === classeSelectionnee && cours.jour === jourSelectionne)

  // Filtrer les élèves par recherche
  const filteredEleves = elevesClasse.filter(
    (eleve) =>
      eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Initialiser les présences pour un cours
  const initialiserPresences = (coursId: string) => {
    if (!presences[coursId]) {
      const nouvellesPresences = elevesClasse.map((eleve) => ({
        eleveId: eleve.id,
        present: false,
        date: dateActuelle,
        coursId: coursId,
      }))
      setPresences((prev) => ({ ...prev, [coursId]: nouvellesPresences }))
    }
  }

  // Mettre à jour la présence d'un élève
  const mettreAJourPresence = (coursId: string, eleveId: string, present: boolean) => {
    setPresences((prev) => {
      const coursPresences = [...(prev[coursId] || [])]
      const index = coursPresences.findIndex((p) => p.eleveId === eleveId)

      if (index !== -1) {
        coursPresences[index] = { ...coursPresences[index], present }
      } else {
        coursPresences.push({ eleveId, present, date: dateActuelle, coursId })
      }

      return { ...prev, [coursId]: coursPresences }
    })
  }

  // Enregistrer les présences
  const enregistrerPresences = (coursId: string) => {
    setIsLoading(true)
    // Simulation d'envoi à une API
    setTimeout(() => {
      toast({
        title: "✅ Présences enregistrées",
        description: `Les présences ont été enregistrées pour le cours de ${cours.find((c) => c.id === coursId)?.nom}`,
      })
      setIsLoading(false)
    }, 1000)
  }

  // Calculer le pourcentage de présence
  const calculerPourcentagePresence = (coursId: string) => {
    const coursPresences = presences[coursId] || []
    if (coursPresences.length === 0) return 0
    
    const presents = coursPresences.filter(p => p.present).length
    return Math.round((presents / coursPresences.length) * 100)
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
      >
        <div className="space-y-2 w-full">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des présences</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1">
              <Label htmlFor="classe" className="mb-2 block">
                Sélectionner une classe
              </Label>
              <Select 
                value={classeSelectionnee} 
                onValueChange={(value) => {
                  setClasseSelectionnee(value)
                  setSearchTerm("")
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="classe" className="w-full">
                  <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <span>{classe.nom}</span>
                        <Badge variant="outline" className="ml-auto">
                          {classe.effectif} élèves
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">{dateActuelle}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {classeSelectionnee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={jourSelectionne} onValueChange={setJourSelectionne} className="w-full">
            <TabsList className="w-full grid grid-cols-5 md:grid-cols-6 h-auto">
              {jours.slice(0, 5).map((jour) => (
                <TabsTrigger 
                  key={jour} 
                  value={jour} 
                  className="text-xs sm:text-sm py-2 h-auto flex-col gap-1"
                >
                  <span>{jour.substring(0, 3)}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {coursClasse.filter(c => c.jour === jour).length} cours
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div ref={parent} className="mt-6">
              {jours.map((jour) => (
                <TabsContent key={jour} value={jour}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      <BookOpen className="inline mr-2 h-5 w-5 text-skyblue" />
                      Emploi du temps - {classes.find((c) => c.id === classeSelectionnee)?.nom} - {jour}
                    </h2>
                    <Badge variant="outline" className="text-sm">
                      {elevesClasse.length} élèves
                    </Badge>
                  </div>

                  {coursClasse.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 text-muted-foreground rounded-lg border border-dashed"
                    >
                      Aucun cours prévu pour cette classe ce jour-là
                    </motion.div>
                  ) : (
                    <div className="grid gap-6">
                      {coursClasse.map((coursItem) => {
                        initialiserPresences(coursItem.id)
                        const pourcentage = calculerPourcentagePresence(coursItem.id)
                        
                        return (
                          <motion.div
                            key={coursItem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="overflow-hidden">
                              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-2">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-skyblue" />
                                    {coursItem.nom}
                                  </CardTitle>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>
                                        {coursItem.heureDebut} - {coursItem.heureFin}
                                      </span>
                                    </div>
                                    <Badge color="skyblue" className="px-2 py-1 text-xs">
                                      {coursItem.salle}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Professeur: {coursItem.professeur}
                                </div>
                              </CardHeader>
                              <CardContent className="pt-4">
                                <div className="mb-4">
                                  <div className="flex justify-between items-center mb-1">
                                    <Label>Rechercher un élève:</Label>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        Présence: {pourcentage}%
                                      </span>
                                      <div className="w-16 bg-secondary rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full" 
                                          style={{ width: `${pourcentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <Input
                                    placeholder="Rechercher par nom ou prénom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mb-4"
                                  />
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="grid grid-cols-12 font-medium text-sm border-b pb-2 gap-2">
                                    <div className="col-span-1"></div>
                                    <div className="col-span-4">Nom</div>
                                    <div className="col-span-4">Prénom</div>
                                    <div className="col-span-3 text-center">Statut</div>
                                  </div>
                                  
                                  <AnimatePresence>
                                    {filteredEleves.length === 0 ? (
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-8 text-muted-foreground"
                                      >
                                        Aucun élève trouvé
                                      </motion.div>
                                    ) : (
                                      filteredEleves.map((eleve) => {
                                        const isPresent = presences[coursItem.id]?.find((p) => p.eleveId === eleve.id)?.present || false
                                        
                                        return (
                                          <motion.div
                                            key={eleve.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="grid grid-cols-12 items-center gap-2 py-2 border-b"
                                          >
                                            <div className="col-span-1">
                                              <Avatar className="h-8 w-8">
                                                <AvatarImage src={eleve.photo} />
                                                <AvatarFallback>
                                                  {eleve.prenom[0]}{eleve.nom[0]}
                                                </AvatarFallback>
                                              </Avatar>
                                            </div>
                                            <div className="col-span-4 font-medium">{eleve.nom}</div>
                                            <div className="col-span-4">{eleve.prenom}</div>
                                            <div className="col-span-3 flex justify-center">
                                              <Button
                                                color={isPresent ? "default" : "info"}
                                                variant={isPresent ? "soft" : "outline"}
                                                size="sm"
                                                className="gap-1 w-full max-w-[120px]"
                                                onClick={() => mettreAJourPresence(coursItem.id, eleve.id, !isPresent)}
                                              >
                                                {isPresent ? (
                                                  <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Présent</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <XCircle className="h-4 w-4" />
                                                    <span>Absent</span>
                                                  </>
                                                )}
                                              </Button>
                                            </div>
                                          </motion.div>
                                        )
                                      })
                                    )}
                                  </AnimatePresence>
                                </div>
                              </CardContent>
                              <CardFooter className="bg-muted/50">
                                <Button 
                                  onClick={() => enregistrerPresences(coursItem.id)}
                                  className="w-full sm:w-auto ml-auto gap-1"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <Clock3 className="h-4 w-4 animate-spin" />
                                      <span>Enregistrement...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span>Enregistrer les présences</span>
                                    </>
                                  )}
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </motion.div>
      )}

      {!classeSelectionnee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-20 text-muted-foreground rounded-lg border border-dashed"
        >
          <div className="flex flex-col items-center gap-4">
            <School className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-medium">Aucune classe sélectionnée</h3>
              <p className="text-sm mt-1">
                Veuillez sélectionner une classe pour afficher l'emploi du temps et la liste des élèves
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}