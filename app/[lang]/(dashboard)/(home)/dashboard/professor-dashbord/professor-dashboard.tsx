"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolStore } from "@/store"
import type { Registration, Classe, Professor, Timetable, Note, Matter } from "@/lib/interface"
import { useEffect, useState } from "react"
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  FileText,
  Award,
  RefreshCw,
  Filter,
  BarChart3,
  CalendarDays,
  UserIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  fetchProfessor,
  fetchMatters,
  fetchTimetable,
  fetchClasses,
  fetchRegistration,
  fetchNotes,
  fetchPeriods,
  fetchEvaluations,
} from "@/store/schoolservice"
import TimetableGrid from "./components/timetable-grid"

interface ProfessorDashboardProps {
  trans?: {
    [key: string]: string
  }
}

const ProfessorDashboard = ({ trans }: ProfessorDashboardProps) => {
  const {
    registrations,
    classes,
    userOnline,
    professor,
    academicYearCurrent,
    settings,
    timetables,
    notes,
    matters,
    periods,
    evaluations,
    setEvaluations,
  } = useSchoolStore()

  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [refreshing, setRefreshing] = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState({
    stats: true,
    schedule: true,
    classes: true,
  })

  // Vérifications de type et conversion des IDs en nombres
  const isValidProfessor = (prof: any): prof is Professor => {
    if (!prof) return false;
    const id = Number(prof.id);
    const userId = Number(prof.user_id);
    return !isNaN(id) && !isNaN(userId);
  }

  const isValidTimetable = (timetable: any): timetable is Timetable => {
    if (!timetable) return false;
    const id = Number(timetable.id);
    const professorId = Number(timetable.professor_id);
    const classId = Number(timetable.class_id);
    const matterId = Number(timetable.matter_id);
    return !isNaN(id) && !isNaN(professorId) && !isNaN(classId) && !isNaN(matterId);
  }

  const isValidRegistration = (reg: any): reg is Registration => {
    if (!reg) return false;
    const id = Number(reg.id);
    const academicYearId = Number(reg.academic_year_id);
    const classId = Number(reg.class_id);
    return !isNaN(id) && !isNaN(academicYearId) && !isNaN(classId);
  }

  // Trouver le professeur connecté avec vérification
  const currentProfessor = professor?.find((prof: Professor) => {
    // Si aucun utilisateur n'est connecté, retourne false immédiatement
    if (!userOnline) return false;
    
    // Convertit l'ID utilisateur du professeur en nombre
    const userId = Number(prof.user_id);
    // Convertit l'ID de l'utilisateur connecté en nombre
    const onlineUserId = Number(userOnline.id);
    
    // Retourne true uniquement si :
    // 1. userId est un nombre valide
    // 2. onlineUserId est un nombre valide
    // 3. L'ID utilisateur du professeur correspond à celui de l'utilisateur connecté
    return !isNaN(userId) && !isNaN(onlineUserId) && userId === onlineUserId;
  });

 
  // Filtrer les données avec vérifications
  const currentYearRegistrations =
    registrations?.filter((reg: Registration) => {
      if (!isValidRegistration(reg) || !academicYearCurrent) return false;
      const academicYearId = Number(academicYearCurrent.id);
      const regYearId = Number(reg.academic_year_id);
      return !isNaN(academicYearId) && !isNaN(regYearId) && academicYearId === regYearId;
    }) || [];

  // Trouver la période active actuelle
  const currentDate = new Date();
  const activePeriod = academicYearCurrent?.periods?.find((period) => {
    if (!period || !period.pivot?.start_date || !period.pivot?.end_date) return false;
    const startDate = new Date(period.pivot.start_date);
    const endDate = new Date(period.pivot.end_date);
    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) &&
      currentDate >= startDate && currentDate <= endDate;
  });

  // Emploi du temps du professeur filtré par période active
  const professorTimetables =
    timetables?.filter((timetable: Timetable) => {
      if (!isValidTimetable(timetable) || !currentProfessor || !academicYearCurrent) return false;

      const professorId = Number(currentProfessor.id);
      const academicYearId = Number(academicYearCurrent.id);
      const timetableProfId = Number(timetable.professor_id);
      const timetableYearId = Number(timetable.academic_year_id);

      if (isNaN(professorId) || isNaN(academicYearId) || isNaN(timetableProfId) || isNaN(timetableYearId)) {
        return false;
      }

      const periodId = activePeriod ? Number(activePeriod.id) : null;
      const timetablePeriodId = timetable.period_id ? Number(timetable.period_id) : null;

      if (periodId && (timetablePeriodId === null || isNaN(timetablePeriodId) || timetablePeriodId !== periodId)) {
        return false;
      }

      return professorId === timetableProfId && academicYearId === timetableYearId;
    }) || [];

  // Classes du professeur
  const professorClasses = professorTimetables.reduce((acc, timetable) => {
    if (!timetable.class_id) return acc;
    const classId = Number(timetable.class_id);
    if (isNaN(classId)) return acc;

    const classe = classes?.find((c: Classe) => {
      const classIdNum = Number(c.id);
      return !isNaN(classIdNum) && classIdNum === classId;
    });

    if (classe && !acc.some((c: Classe) => c.id === classe.id)) {
      acc.push(classe);
    }
    return acc
  }, [] as Classe[])

  // Matières du professeur
  const professorMatters = professorTimetables.reduce((acc, timetable) => {
    const matter = matters?.find((m) => Number(m.id) === Number(timetable.matter_id))
    if (matter && !acc.find((m) => Number(m.id) === Number(matter.id))) {
      acc.push(matter)
    }
    return acc
  }, [] as Matter[])

  // Élèves du professeur (tous les élèves de ses classes)
  const professorStudents = currentYearRegistrations.filter((reg) =>
    professorClasses.some((classe) => classe.id === reg.class_id),
  )

  // Évaluations du professeur
  const professorEvaluations = evaluations.filter(
    (evaluation) => evaluation.professor_id === currentProfessor?.id
  )

  // Notes saisies par le professeur
  const notesByEvaluation = professorEvaluations.map((evaluation) => {
    const evaluationNotes = notes.filter((note) => note.evaluation_id === evaluation.id)
    const matter = matters?.find((m) => m.id === evaluation.matter_id)
    const period = periods?.find((p) => p.id === evaluation.period_id)
    const classe = classes?.find((c) => c.id === evaluation.classe_id)
    
    return {
      evaluation,
      matter,
      period,
      classe,
      notes: evaluationNotes.map(note => ({
        ...note,
        registration: currentYearRegistrations.find((reg) => reg.id === note.registration_id)
      }))
    }
  })

  // Statistiques
  const totalClasses = professorClasses.length
  const totalMatters = professorMatters.length
  const totalStudents = professorStudents.length
  const totalEvaluations = professorEvaluations.length

  // Cours aujourd'hui
  const today = new Date().toLocaleDateString("en-CA") // Format YYYY-MM-DD
  const todayClasses = professorTimetables.filter((timetable) => {
    const currentDate = new Date()
    const dayNames = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
    const currentDay = dayNames[currentDate.getDay()]
    return timetable.day.toLowerCase() === currentDay.toLowerCase()
  })

  // Prochains cours (cette semaine)
  const upcomingClasses = professorTimetables.slice(0, 5)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      toast({
        title: "Actualisation en cours...",
        description: "Récupération des dernières données",
      })

      // Recharger les données
      const [professorsData, mattersData, timetablesData, classesData, registrationsData, notesData, periodsData, evaluationsData] =
        await Promise.all([
          fetchProfessor(),
          fetchMatters(),
          fetchTimetable(),
          fetchClasses(),
          fetchRegistration(),
          fetchNotes(),
          fetchPeriods(),
          fetchEvaluations(),
        ])

      // Mettre à jour le store
      const store = useSchoolStore.getState()
      if (professorsData?.length > 0) store.setProfessor(professorsData)
      if (mattersData?.length > 0) store.setMatters(mattersData)
      if (timetablesData?.length > 0) store.setTimetables(timetablesData)
      if (classesData?.length > 0) store.setClasses(classesData)
      if (registrationsData?.length > 0) store.setRegistration(registrationsData)
      if (notesData?.length > 0) store.setNotes(notesData)
      if (periodsData?.length > 0) store.setPeriods(periodsData)
      if (evaluationsData?.length > 0) store.setEvaluations(evaluationsData)

      toast({
        title: "✅ Actualisation réussie",
        description: "Vos données ont été mises à jour",
      })
    } catch (error) {
      toast({
        title: "❌ Erreur d'actualisation",
        description: "Impossible de récupérer les dernières données",
        color: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Charger uniquement les données nécessaires pour le professeur
        const [professorsData, mattersData, timetablesData, classesData, registrationsData, notesData, periodsData, evaluationsData] =
          await Promise.all([
            fetchProfessor(),
            fetchMatters(),
            fetchTimetable(),
            fetchClasses(),
            fetchRegistration(),
            fetchNotes(),
            fetchPeriods(),
            fetchEvaluations(),
          ])

        // Mettre à jour le store
        const store = useSchoolStore.getState()
        if (professorsData?.length > 0) store.setProfessor(professorsData)
        if (mattersData?.length > 0) store.setMatters(mattersData)
        if (timetablesData?.length > 0) store.setTimetables(timetablesData)
        if (classesData?.length > 0) store.setClasses(classesData)
        if (registrationsData?.length > 0) store.setRegistration(registrationsData)
        if (notesData?.length > 0) store.setNotes(notesData)
        if (periodsData?.length > 0) store.setPeriods(periodsData)
        if (evaluationsData?.length > 0) store.setEvaluations(evaluationsData)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        toast({
          title: "❌ Erreur de chargement",
          description: "Impossible de charger certaines données",
          color: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!currentProfessor) {
    return (
      <Card className="border-0 w-full">
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté en tant que professeur pour accéder à ce tableau de bord.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 w-full">
      <div className="space-y-6 p-6 animate-in fade-in-50 duration-500">
        {/* Header */}
        <CardHeader className="p-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 lg:gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1
                className="text-l md:text-xl lg:text-2xl font-bold bg-gradient-to-r bg-clip-text uppercase mb-2 text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, skyblue, #ff6f61, #66023c)" }}
              >
                Tableau de bord
              </h1>

            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm">
                      <Filter className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="hidden sm:inline">Filtres</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Widgets visibles</Label>
                        {Object.entries(visibleWidgets).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Switch
                              id={key}
                              checked={value}
                              onCheckedChange={(checked) => setVisibleWidgets((prev) => ({ ...prev, [key]: checked }))}
                            />
                            <Label htmlFor={key} className="capitalize">
                              {key === "stats" ? "Statistiques" : key === "schedule" ? "Emploi du temps" : "Classes"}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm"
                >
                  <RefreshCw className={`h-3 w-3 lg:h-4 lg:w-4 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Actualiser</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* <Badge variant="outline" className="gap-1 lg:gap-2 border-blue-500 text-blue-600 text-xs">
                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">{academicYearCurrent?.label}</span>
                </Badge> */}
                <Badge className="gap-1 lg:gap-2 bg-green-100 text-green-700 border-green-200 text-xs">
                  <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Professeur</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          {/* Statistiques principales */}
          {visibleWidgets.stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mes Classes</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{totalClasses}</div>
                    <p className="text-xs text-muted-foreground">Classes assignées</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mes Matières</CardTitle>
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{totalMatters}</div>
                    <p className="text-xs text-muted-foreground">Matières enseignées</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mes Élèves</CardTitle>
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Élèves au total</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mes Évaluations</CardTitle>
                    <Award className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{totalEvaluations}</div>
                    <p className="text-xs text-muted-foreground">Évaluations enregistrées</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Contenu principal avec onglets */}
          <Tabs defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 min-w-[400px] lg:min-w-0">
                <TabsTrigger value="overview" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <CalendarDays className="h-3 w-3 lg:h-4 lg:w-4" />
                  Emploi du temps
                </TabsTrigger>
                <TabsTrigger value="classes" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                  Mes Classes
                </TabsTrigger>
                <TabsTrigger value="evaluations" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                  Évaluations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-7">
                {/* Cours d'aujourd'hui */}
                <Card className="lg:col-span-4">
                  <CardHeader className="pb-2 lg:pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                      <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                      Cours d'aujourd'hui
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {todayClasses.length > 0 ? (
                        <div className="space-y-3">
                          {todayClasses.map((timetable) => {
                            const classe = classes?.find((c) => Number(c.id) === Number(timetable.class_id))
                            const matter = matters?.find((m) => Number(m.id) === Number(timetable.matter_id))
                            return (
                              <div
                                key={timetable.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{matter?.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {classe?.label} - Salle {timetable.room}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {timetable.start_time} - {timetable.end_time}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Aucun cours prévu aujourd'hui</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Actions rapides */}
                <Card className="lg:col-span-3">
                  <CardHeader className="pb-2 lg:pb-3">
                    <CardTitle className="text-lg lg:text-xl">Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                        <FileText className="h-4 w-4" />
                        Saisir des notes
                      </Button>
                      <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                        <Calendar className="h-4 w-4" />
                        Voir mon emploi du temps
                      </Button>
                      <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                        <Users className="h-4 w-4" />
                        Gérer mes classes
                      </Button>
                      <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                        <BookOpen className="h-4 w-4" />
                        Mes matières
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Répartition des élèves par classe */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition de mes élèves par classe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {professorClasses.map((classe) => {
                      const studentsInClass = professorStudents.filter((reg) => reg.class_id === classe.id).length
                      const maxStudents = Number.parseInt(classe.max_student_number || "0")
                      const percentage = maxStudents > 0 ? (studentsInClass / maxStudents) * 100 : 0

                      return (
                        <div key={classe.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {classe.label}
                              {classe.level && ` (${classe.level.label})`}
                              {classe.serie && ` - ${classe.serie.label}`}
                            </span>
                            <span>{studentsInClass} élèves</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <TimetableGrid timetables={professorTimetables} classes={classes || []} matters={matters || []} />

              {/* Informations sur la période active */}
              {activePeriod && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Période active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Période</p>
                        <p className="text-lg font-semibold">{activePeriod.label}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date de début</p>
                        <p className="text-lg font-semibold">
                          {activePeriod.pivot?.start_date
                            ? new Date(activePeriod.pivot.start_date).toLocaleDateString("fr-FR")
                            : "Non définie"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date de fin</p>
                        <p className="text-lg font-semibold">
                          {activePeriod.pivot?.end_date
                            ? new Date(activePeriod.pivot.end_date).toLocaleDateString("fr-FR")
                            : "Non définie"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {professorClasses.map((classe) => {
                  const studentsInClass = professorStudents.filter((reg) => reg.class_id === classe.id)
                  const classMatters = professorTimetables
                    .filter((t) => Number(t.class_id) === Number(classe.id))
                    .map((t) => matters?.find((m) => Number(m.id) === Number(t.matter_id)))
                    .filter(Boolean)

                  return (
                    <Card key={classe.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{classe.label}</span>
                          <Badge >{studentsInClass.length} élèves</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Matières enseignées :</p>
                            <div className="flex flex-wrap gap-1">
                              {classMatters.map((matter) => (
                                <Badge key={matter?.id} variant="outline" className="text-xs">
                                  {matter?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Niveau :</p>
                            <p className="text-sm text-muted-foreground">
                              {classe.level?.label}
                              {classe.serie && ` - ${classe.serie.label}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mes évaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {professorEvaluations.length > 0 ? (
                      <div className="space-y-3">
                        {professorEvaluations.map((evaluation) => {
                          const matter = matters?.find((m) => m.id === evaluation.matter_id)
                          const period = periods?.find((p) => p.id === evaluation.period_id)
                          const classe = classes?.find((c) => c.id === evaluation.classe_id)
                          const evaluationNotes = notes.filter((note) => note.evaluation_id === evaluation.id)

                          return (
                            <div key={evaluation.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{evaluation.type_note?.label || 'Évaluation'}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {matter?.name} - {classe?.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {period?.label} • {new Date(evaluation.date_evaluation).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">
                                    {evaluationNotes.length} notes
                                  </p>
                                  <p className="text-sm">
                                    Max: {evaluation.maximum_note} • Coef: {evaluation.coefficient}
                                  </p>
                                </div>
                              </div>
                              
                              {evaluationNotes.length > 0 && (
                                <div className="mt-3 border-t pt-2">
                                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Notes des élèves :</h5>
                                  <div className="space-y-1">
                                    {evaluationNotes.slice(0, 3).map((note) => {
                                      const registration = currentYearRegistrations.find((reg) => reg.id === note.registration_id)
                                      return (
                                        <div key={note.id} className="flex justify-between text-sm">
                                          <span>{registration?.student.first_name} {registration?.student.name}</span>
                                          <span className="font-medium">{note.value}/{evaluation.maximum_note}</span>
                                        </div>
                                      )
                                    })}
                                    {evaluationNotes.length > 3 && (
                                      <p className="text-xs text-muted-foreground text-center mt-1">
                                        + {evaluationNotes.length - 3} autres notes
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune évaluation créée pour le moment</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes des élèves</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {notesByEvaluation.length > 0 ? (
                      <div className="space-y-4">
                        {notesByEvaluation.map(({ evaluation, matter, period, classe, notes }) => (
                          <div key={evaluation.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">{matter?.name} - {evaluation.type_note?.label}</h3>
                              <Badge variant="outline" className="text-xs">
                                {classe?.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {period?.label} • {new Date(evaluation.date_evaluation).toLocaleDateString('fr-FR')}
                            </p>
                            
                            <div className="space-y-2">
                              {notes.map(({ registration, value, id }) => (
                                <div key={id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                  <span className="text-sm">
                                    {registration?.student.first_name} {registration?.student.name}
                                  </span>
                                  <div className="text-right">
                                    <span className="font-medium">
                                      {value}/{evaluation.maximum_note}
                                    </span>
                                    <span className="text-xs text-muted-foreground block">
                                      Coef: {evaluation.coefficient}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                              Moyenne: {(notes.reduce((sum, note) => sum + note.value, 0) / notes.length).toFixed(2)}/{evaluation.maximum_note}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune note disponible pour le moment</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Toaster />
        </CardContent>
      </div>
    </Card>
  )
}

export default ProfessorDashboard
