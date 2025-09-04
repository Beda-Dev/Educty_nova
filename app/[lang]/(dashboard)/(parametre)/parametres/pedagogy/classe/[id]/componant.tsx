"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSchoolStore } from "@/store/index"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Calendar, BookOpen, GraduationCap, Clock, User, FileText, AlertCircle, Info, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Classe } from "@/lib/interface"

export default function ClassDetailsPage({ classe }: { classe: Classe }) {
  const router = useRouter()

  const {
    classes,
    registrations,
    students,
    academicYears,
    academicYearCurrent,
    timetables,
    matters,
    evaluations,
    notes,
    professor,
    periods,
    series,
  } = useSchoolStore()

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(academicYearCurrent?.id || 0)

  // Filtrer les inscriptions pour cette classe et année académique
  const classRegistrations = useMemo(() => {
    return registrations.filter(
      (reg) => Number(reg.class_id) === Number(classe.id) && Number(reg.academic_year_id) === selectedAcademicYear,
    )
  }, [registrations, classe.id, selectedAcademicYear])

  // Obtenir les étudiants inscrits
  const enrolledStudents = useMemo(() => {
    const studentIds = classRegistrations.map((reg) => Number(reg.student_id))
    return students.filter((student) => studentIds.includes(Number(student.id)))
  }, [classRegistrations, students])

  // Statistiques d'effectif
  const enrollmentStats = useMemo(() => {
    const total = enrolledStudents.length
    const male = enrolledStudents.filter(
      (s) => s.sexe?.toLowerCase() === "masculin" || s.sexe?.toLowerCase() === "m",
    ).length
    const female = enrolledStudents.filter(
      (s) => s.sexe?.toLowerCase() === "féminin" || s.sexe?.toLowerCase() === "f",
    ).length

    return { total, male, female }
  }, [enrolledStudents])

  // Emploi du temps de la classe
  const classTimetables = useMemo(() => {
    return timetables.filter(
      (tt) => Number(tt.class_id) === Number(classe.id) && Number(tt.academic_year_id) === selectedAcademicYear,
    )
  }, [timetables, classe.id, selectedAcademicYear])

  // Matières étudiées par la classe
  const studiedMatters = useMemo(() => {
    if (!classe) return []

    const notStudiedMatterIds = classe.not_studied_matters?.map((m) => Number(m.id)) || []
    return matters.filter((matter) => Number(matter.active) === 1 && !notStudiedMatterIds.includes(Number(matter.id)))
  }, [classe, matters])

  // Statistiques des enseignants
  const teacherStats = useMemo(() => {
    const stats = new Map()

    classTimetables.forEach((tt) => {
      const teacherId = Number(tt.professor_id)
      const matterId = Number(tt.matter_id)

      const teacher = professor.find((p) => Number(p.id) === teacherId)
      const matter = matters.find((m) => Number(m.id) === matterId)

      if (teacher && matter) {
        const key = `${teacherId}-${matterId}`
        if (!stats.has(key)) {
          stats.set(key, {
            teacher,
            matter,
            hours: 0,
            sessions: 0,
          })
        }

        const stat = stats.get(key)
        // Calculer les heures (approximation basée sur start_time et end_time)
        const startTime = new Date(`2000-01-01T${tt.start_time}`)
        const endTime = new Date(`2000-01-01T${tt.end_time}`)
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

        stat.hours += hours
        stat.sessions += 1
      }
    })

    return Array.from(stats.values())
  }, [classTimetables, professor, matters])

  // Évaluations de la classe
  const classEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => Number(evaluation.classe_id) === Number(classe.id))
  }, [evaluations, classe])

  // Année académique sélectionnée
  const selectedAcademicYearData = useMemo(() => {
    return academicYears.find((ay) => Number(ay.id) === selectedAcademicYear)
  }, [academicYears, selectedAcademicYear])

  // Période actuelle
  const currentPeriod = useMemo(() => {
    if (!selectedAcademicYearData?.periods) return null

    const now = new Date()
    return selectedAcademicYearData.periods.find((period) => {
      const startDate = new Date(period.pivot.start_date)
      const endDate = new Date(period.pivot.end_date)
      return now >= startDate && now <= endDate
    })
  }, [selectedAcademicYearData])

  useEffect(() => {
    if (academicYearCurrent?.id && !selectedAcademicYear) {
      setSelectedAcademicYear(Number(academicYearCurrent.id))
    }
  }, [academicYearCurrent, selectedAcademicYear])

  if (!classe) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Classe non trouvée. Veuillez vérifier l'identifiant de la classe.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Card className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <CardHeader>


        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>

            <div className="flex items-center gap-2">         <Button
              variant="soft"
              size="icon"
              className="mr-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
              <h1 className="text-xl font-bold tracking-tight">{classe.label}</h1></div>

            <div className="flex items-center gap-2 mt-2">
              {classe.level && (
                <Badge color="default">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {classe.level.label}
                </Badge>
              )}
              {classe.serie && (
                <Badge variant="outline">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {classe.serie.label}
                </Badge>
              )}
              <Badge color={Number(classe.active) === 1 ? "success" : "destructive"}>
                {Number(classe.active) === 1 ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedAcademicYear.toString()}
              onValueChange={(value) => setSelectedAcademicYear(Number(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Année académique" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id.toString()}>
                    {year.label}
                    {Number(year.isCurrent) === 1 && " (Actuelle)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent>

        {/* Statistiques d'effectif */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Effectif de la classe
              </CardTitle>
              <CardDescription>
                Répartition des élèves pour l'année académique {selectedAcademicYearData?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{enrollmentStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Capacité max: {classe.max_student_number}
                  </div>
                  <Progress
                    value={(enrollmentStats.total / Number(classe.max_student_number)) * 100}
                    className="rounded-full"
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{enrollmentStats.male}</div>
                  <div className="text-sm text-muted-foreground">Garçons</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {enrollmentStats.total > 0 ? Math.round((enrollmentStats.male / enrollmentStats.total) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{enrollmentStats.female}</div>
                  <div className="text-sm text-muted-foreground">Filles</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {enrollmentStats.total > 0 ? Math.round((enrollmentStats.female / enrollmentStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs pour organiser le contenu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="students">Élèves</TabsTrigger>
              <TabsTrigger value="timetable">Emploi du temps</TabsTrigger>
              <TabsTrigger value="subjects">Matières</TabsTrigger>
              <TabsTrigger value="teachers">Enseignants</TabsTrigger>
              <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
            </TabsList>

            {/* Liste des élèves */}
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des élèves inscrits</CardTitle>
                  <CardDescription>
                    {enrolledStudents.length} élève(s) inscrit(s) pour l'année {selectedAcademicYearData?.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrolledStudents.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Aucun élève inscrit dans cette classe pour l'année académique sélectionnée.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {enrolledStudents.map((student) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <Avatar>
                            {student.photo && typeof student.photo === "string" ? (
                              <img
                                src={student.photo}
                                alt={`${student.name} ${student.first_name}`}
                                className="rounded-full object-cover w-10 h-10"
                              />
                            ) : (
                              <AvatarFallback>
                                {student.name.charAt(0)}
                                {student.first_name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {student.name} {student.first_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{student.registration_number}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {student.sexe}
                              </Badge>
                              <Badge color={student.status === "actif" ? "success" : "destructive"} className="text-xs">
                                {student.status}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emploi du temps */}
            <TabsContent value="timetable">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Emploi du temps
                  </CardTitle>
                  <CardDescription>
                    Planning des cours pour l'année {selectedAcademicYearData?.label}
                    {currentPeriod && (
                      <Badge variant="outline" className="ml-2">
                        Période actuelle: {currentPeriod.label}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {classTimetables.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>Aucun emploi du temps défini pour cette classe.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map((day) => {
                        const dayTimetables = classTimetables.filter((tt) => tt.day === day)
                        if (dayTimetables.length === 0) return null

                        return (
                          <div key={day} className="space-y-2">
                            <h4 className="font-semibold text-lg">{day}</h4>
                            <div className="grid gap-2">
                              {dayTimetables
                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                .map((tt) => {
                                  const teacher = professor.find((p) => Number(p.id) === Number(tt.professor_id))
                                  const matter = matters.find((m) => Number(m.id) === Number(tt.matter_id))
                                  const period = periods.find((p) => Number(p.id) === Number(tt.period_id))

                                  return (
                                    <div
                                      key={tt.id}
                                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="text-sm font-medium">
                                          {tt.start_time} - {tt.end_time}
                                        </div>
                                        <Separator orientation="vertical" className="h-6" />
                                        <div>
                                          <div className="font-medium">{matter?.name || "Matière inconnue"}</div>
                                          <div className="text-sm text-muted-foreground">
                                            {teacher ? `${teacher.name} ${teacher.first_name}` : "Enseignant non assigné"}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-medium">{tt.room}</div>
                                        {period && (
                                          <Badge variant="outline" className="text-xs">
                                            {period.label}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Matières */}
            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Matières étudiées
                  </CardTitle>
                  <CardDescription>Liste des matières enseignées dans cette classe</CardDescription>
                </CardHeader>
                <CardContent>
                  {studiedMatters.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>Aucune matière définie pour cette classe.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {studiedMatters.map((matter) => (
                        <motion.div
                          key={matter.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{matter.name}</div>
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enseignants */}
            <TabsContent value="teachers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Équipe pédagogique
                  </CardTitle>
                  <CardDescription>Enseignants intervenant dans cette classe avec leurs statistiques</CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherStats.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>Aucun enseignant assigné à cette classe pour le moment.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {teacherStats.map((stat, index) => (
                        <motion.div
                          key={`${stat.teacher.id}-${stat.matter.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={stat.teacher.photo || undefined} />
                              <AvatarFallback>
                                {stat.teacher.name.charAt(0)}
                                {stat.teacher.first_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {stat.teacher.name} {stat.teacher.first_name}
                              </div>
                              <div className="text-sm text-muted-foreground">{stat.matter.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {stat.teacher.type}
                                </Badge>
                                {stat.teacher.official === 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    Titulaire
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-sm font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {stat.hours.toFixed(1)}h
                                </div>
                                <div className="text-xs text-muted-foreground">{stat.sessions} séance(s)</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Évaluations */}
            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Évaluations et Notes
                  </CardTitle>
                  <CardDescription>Suivi des évaluations et performances des élèves</CardDescription>
                </CardHeader>
                <CardContent>
                  {classEvaluations.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>Aucune évaluation programmée pour cette classe.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {classEvaluations.map((evaluation) => {
                        const matter = matters.find((m) => Number(m.id) === Number(evaluation.matter_id))
                        const teacher = professor.find((p) => Number(p.id) === Number(evaluation.professor_id))
                        const period = periods.find((p) => Number(p.id) === Number(evaluation.period_id))

                        // Compter les notes pour cette évaluation
                        const evaluationNotes = notes.filter(
                          (note) => Number(note.evaluation_id) === Number(evaluation.id),
                        )
                        const studentsWithNotes = evaluationNotes.length
                        const studentsWithoutNotes = enrolledStudents.length - studentsWithNotes

                        // Calculer les statistiques
                        const noteValues = evaluationNotes.map((note) => note.value)
                        const average =
                          noteValues.length > 0 ? noteValues.reduce((a, b) => a + b, 0) / noteValues.length : 0
                        const maxNote = noteValues.length > 0 ? Math.max(...noteValues) : 0
                        const minNote = noteValues.length > 0 ? Math.min(...noteValues) : 0

                        return (
                          <motion.div
                            key={evaluation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg border bg-card space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium">{matter?.name || "Matière inconnue"}</div>
                                <div className="text-sm text-muted-foreground">
                                  {teacher ? `${teacher.name} ${teacher.first_name}` : "Enseignant non défini"}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{evaluation.type_note?.label || "Type non défini"}</Badge>
                                  {period && <Badge color="skyblue">{period.label}</Badge>}
                                  <Badge color="default">/{evaluation.maximum_note}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                  {new Date(evaluation.date_evaluation).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground">Coefficient: {evaluation.coefficient}</div>
                              </div>
                            </div>

                            {evaluationNotes.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-blue-600">{average.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">Moyenne</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-green-600">{maxNote}</div>
                                  <div className="text-xs text-muted-foreground">Maximum</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-red-600">{minNote}</div>
                                  <div className="text-xs text-muted-foreground">Minimum</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-orange-600">{studentsWithoutNotes}</div>
                                  <div className="text-xs text-muted-foreground">Absents</div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {studentsWithNotes}/{enrolledStudents.length} élèves notés
                              </span>
                              <Progress value={(studentsWithNotes / enrolledStudents.length) * 100} className="w-24" />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </CardContent>
    </Card>
  )
}

