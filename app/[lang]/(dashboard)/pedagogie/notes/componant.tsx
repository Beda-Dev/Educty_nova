
"use client"

import { useState, useEffect, useMemo } from "react"
import { useSchoolStore } from "@/store/index"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import "./notes-custom.css";
import {   BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Award,
  AlertTriangle,
  Save,
  Plus,
  Eye,
  BarChart3,
  Calculator,
    Loader2 } from "lucide-react";
import type { Evaluation } from "@/lib/interface"
import { fetchNotes, fetchProfessor, fetchStudents, fetchTypeEvaluations, fetchMatters, fetchRegistration , fetchEvaluations } from "@/store/schoolservice"

interface EvaluationFormData {
  period_id: number
  professor_id: number
  academic_id: number
  matter_id: number
  classe_id: number
  type_note_id: number
  maximum_note: string // changé de number à string
  coefficient: string  // changé de number à string
  date_evaluation: string
}

interface NoteFormData {
  evaluation_id: number
  registration_id: number
  value: number
}

interface StudentGrade {
  registration_id: number
  student_name: string
  student_first_name: string
  registration_number: string
  note: number
  coefficient_note: number
}

export default function TeacherNotesPage() {
  // Store data
  const {
    userOnline,
    professor,
    academicYearCurrent,
    matters,
    classes,
    typeEvaluations,
    periods,
    timetables,
    registrations,
    evaluations,
    notes,
    setEvaluations,
    setNotes,
  } = useSchoolStore()

  // States
  const [activeTab, setActiveTab] = useState("create-evaluation")
  const [evaluationForm, setEvaluationForm] = useState<EvaluationFormData>({
    period_id: 0,
    professor_id: 0,
    academic_id: 0,
    matter_id: 0,
    classe_id: 0,
    type_note_id: 0,
    maximum_note: "20", // string
    coefficient: "1",   // string
    date_evaluation: new Date().toISOString().split("T")[0],
  })
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Vérifier si l'utilisateur est un professeur
  const currentProfessor = useMemo(() => {
    if (!userOnline) return null
    return professor.find((p) => p.user_id === userOnline.id)
  }, [userOnline, professor])

  // Obtenir la période actuelle
  const currentPeriod = useMemo(() => {
    if (!academicYearCurrent?.periods) return null
    const today = new Date()
    return academicYearCurrent.periods.find((p) => {
      const startDate = new Date(p.pivot.start_date)
      const endDate = new Date(p.pivot.end_date)
      return today >= startDate && today <= endDate
    })
  }, [academicYearCurrent])

  // Obtenir les matières et classes disponibles pour le professeur
  const availableMattersAndClasses = useMemo(() => {
    if (!currentProfessor || !currentPeriod) return { matters: [], classes: [] }

    const professorTimetables = timetables.filter(
      (t) =>
        Number(t.professor_id) === Number(currentProfessor.id) &&
        Number(t.academic_year_id) === Number(academicYearCurrent.id) &&
        Number(t.period_id) === Number(currentPeriod.id),
    )

    const availableMatters = matters.filter(
      (m) => m.active === 1 && professorTimetables.some((t) => Number(t.matter_id) === Number(m.id)),
    )

    const availableClasses = classes.filter((c) => {
      const hasInTimetable = professorTimetables.some((t) => Number(t.class_id) === Number(c.id))
      const matterNotExcluded = evaluationForm.matter_id
        ? !c.not_studied_matters.some((nsm) => nsm.id === evaluationForm.matter_id)
        : true
      return hasInTimetable && matterNotExcluded
    })

    return { matters: availableMatters, classes: availableClasses }
  }, [currentProfessor, currentPeriod, timetables, matters, classes, academicYearCurrent, evaluationForm.matter_id])

  // Obtenir les évaluations du professeur
  const professorEvaluations = useMemo(() => {
    if (!currentProfessor) return []
    return evaluations.filter((e) => Number(e.professor_id) === Number(currentProfessor.id))
  }, [evaluations, currentProfessor])

  // Initialiser le formulaire
  useEffect(() => {
    if (currentProfessor && currentPeriod && academicYearCurrent) {
      setEvaluationForm((prev) => ({
        ...prev,
        professor_id: currentProfessor.id,
        period_id: currentPeriod.id,
        academic_year_id: academicYearCurrent.id,
      }))
    }
  }, [currentProfessor, currentPeriod, academicYearCurrent])

  // Validation du formulaire d'évaluation
  const validateEvaluationForm = (): string[] => {
    const errors: string[] = []

    if (!currentProfessor) {
      errors.push("Vous devez être connecté en tant que professeur")
    }

    if (!evaluationForm.period_id) {
      errors.push("La période est requise")
    }

    if (!evaluationForm.matter_id) {
      errors.push("La matière est requise")
    }

    if (!evaluationForm.classe_id) {
      errors.push("La classe est requise")
    }

    if (!evaluationForm.type_note_id) {
      errors.push("Le type d'évaluation est requis")
    }

    if (Number(evaluationForm.maximum_note) <= 0) {
      errors.push("La note maximale doit être supérieure à 0")
    }

    if (Number(evaluationForm.coefficient) <= 0) {
      errors.push("Le coefficient doit être supérieur à 0")
    }

    if (!evaluationForm.date_evaluation) {
      errors.push("La date d'évaluation est requise")
    }

    // Vérifier que la matière est active
    const selectedMatter = matters.find((m) => m.id === evaluationForm.matter_id)
    if (selectedMatter && selectedMatter.active === 0) {
      errors.push("La matière sélectionnée n'est pas active")
    }

    // Vérifier que la matière n'est pas dans les matières non étudiées de la classe
    const selectedClass = classes.find((c) => c.id === evaluationForm.classe_id)
    if (selectedClass && selectedMatter) {
      const isExcluded = selectedClass.not_studied_matters.some((nsm) => nsm.id === selectedMatter.id)
      if (isExcluded) {
        errors.push("Cette matière n'est pas étudiée dans cette classe")
      }
    }

    return errors
  }

  // Créer une évaluation
  const handleCreateEvaluation = async () => {
    const validationErrors = validateEvaluationForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors([])

    try {
      // Conversion avant envoi à l'API
      const payload = {
        ...evaluationForm
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/evaluations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'évaluation")
      }

      const newEvaluation = await response.json()

      await fetchEvaluations().then(setEvaluations)

      toast({
        title: "Succès",
        description: "Évaluation créée avec succès",
      })

      // Réinitialiser le formulaire
      setEvaluationForm((prev) => ({
        ...prev,
        matter_id: 0,
        classe_id: 0,
        type_note_id: 0,
        maximum_note: "20", // string
        coefficient: "1",   // string
        date_evaluation: new Date().toISOString().split("T")[0],
      }))

      // Passer à l'onglet de saisie des notes
      setSelectedEvaluation(newEvaluation)
      setActiveTab("enter-grades")
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'évaluation",
        color: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Charger les élèves pour une évaluation
  const loadStudentsForEvaluation = (evaluation: Evaluation) => {
    // console.log(`evuluation ${evaluation.id}`)
    const classRegistrations = registrations.filter(
      (r) => Number(r.class_id) === Number(evaluation.classe_id) 
    )
    
    // console.log(classRegistrations)

    const students = classRegistrations.map((reg) => {
      const existingNote = notes.find((n) => n.evaluation_id === evaluation.id && n.registration_id === reg.id)

      return {
        registration_id: reg.id,
        student_name: reg.student.name,
        student_first_name: reg.student.first_name,
        registration_number: reg.student.registration_number,
        note: existingNote?.value || 0,
        coefficient_note: existingNote ? existingNote.value * evaluation.coefficient : 0,
      }
    })
    // console.log(`final ${students}`)

    setStudentGrades(students)
  }

  // Sélectionner une évaluation pour saisir les notes
  const handleSelectEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation)
    loadStudentsForEvaluation(evaluation)
    setActiveTab("enter-grades")
  }

  // Mettre à jour une note d'élève
  const updateStudentGrade = (registrationId: number, value: number) => {
    if (!selectedEvaluation) return

    const maxNote = Number(selectedEvaluation.maximum_note)
    if (value < 0 || value > maxNote) {
      toast({
        title: "Erreur",
        description: `La note doit être entre 0 et ${maxNote}`,
        color: "destructive",
      })
      return
    }

    setStudentGrades((prev) =>
      prev.map((sg) =>
        sg.registration_id === registrationId
          ? {
              ...sg,
              note: value,
              coefficient_note: value * Number(selectedEvaluation.coefficient),
            }
          : sg,
      ),
    )
  }

  // Enregistrer toutes les notes
  const handleSaveAllGrades = async () => {
    if (!selectedEvaluation) return

    setLoading(true)

    try {
      const notesToSave = studentGrades.map((sg) => ({
        evaluation_id: selectedEvaluation.id,
        registration_id: sg.registration_id,
        value: sg.note,
      }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notesToSave),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement des notes")
      }

      const savedNotes = await response.json()

      // Mettre à jour le store
      const updatedNotes = notes.filter((n) => n.evaluation_id !== selectedEvaluation.id)
      setNotes([...updatedNotes, ...savedNotes])

      toast({
        title: "Succès",
        description: "Notes enregistrées avec succès",
      })

      setActiveTab("statistics")
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les notes",
        color: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques
  const calculateStatistics = () => {
    if (!selectedEvaluation || studentGrades.length === 0) return null

    const validGrades = studentGrades.filter((sg) => sg.note > 0)
    if (validGrades.length === 0) return null

    const total = validGrades.reduce((sum, sg) => sum + sg.note, 0)
    const average = total / validGrades.length
    const maxGrade = Math.max(...validGrades.map((sg) => sg.note))
    const minGrade = Math.min(...validGrades.map((sg) => sg.note))

    const passGrade = Number(selectedEvaluation.maximum_note) * 0.5 // 50% pour réussir
    const passCount = validGrades.filter((sg) => sg.note >= passGrade).length
    const passRate = (passCount / validGrades.length) * 100

    return {
      average: average.toFixed(2),
      maxGrade,
      minGrade,
      passRate: passRate.toFixed(1),
      totalStudents: studentGrades.length,
      gradedStudents: validGrades.length,
    }
  }

  const stats = calculateStatistics()

  if (!currentProfessor) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté en tant que professeur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Card className="mx-auto container p-2">
      <CardHeader className="">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Notes</h1>
          <p className="text-muted-foreground">Créez des évaluations et saisissez les notes de vos élèves</p>
        </div>
      </CardHeader>

      {/* Informations sur la période actuelle */}
      {currentPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période Actuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentPeriod.label}</p>
                <p className="text-sm text-muted-foreground">
                  Du {new Date(currentPeriod.pivot.start_date).toLocaleDateString()}
                  au {new Date(currentPeriod.pivot.end_date).toLocaleDateString()}
                </p>
              </div>
              <Badge color="secondary">Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger color="indigodye" value="create-evaluation" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer Évaluation
          </TabsTrigger>
          <TabsTrigger color="indigodye" value="my-evaluations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Mes Évaluations
          </TabsTrigger>
          <TabsTrigger color="indigodye" value="enter-grades" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Saisir Notes
          </TabsTrigger>
          <TabsTrigger color="indigodye" value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Créer une évaluation */}
        <TabsContent value="create-evaluation">
          <Card>
            <CardHeader>
              <CardTitle>Créer une Nouvelle Évaluation</CardTitle>
              <CardDescription>Définissez les paramètres de votre évaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.length > 0 && (
                <Alert color="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matter">Matière</Label>
                  <Select
                    value={evaluationForm.matter_id.toString()}
                    onValueChange={(value) =>
                      setEvaluationForm((prev) => ({ ...prev, matter_id: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMattersAndClasses.matters.map((matter) => (
                        <SelectItem key={matter.id} value={matter.id.toString()}>
                          {matter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classe">Classe</Label>
                  <Select
                    value={evaluationForm.classe_id.toString()}
                    onValueChange={(value) =>
                      setEvaluationForm((prev) => ({ ...prev, classe_id: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMattersAndClasses.classes.map((classe) => (
                        <SelectItem key={classe.id} value={classe.id.toString()}>
                          {classe.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_note">Type d'Évaluation *</Label>
                  <Select
                    value={evaluationForm.type_note_id.toString()}
                    onValueChange={(value) =>
                      setEvaluationForm((prev) => ({ ...prev, type_note_id: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeEvaluations.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_evaluation">Date d'Évaluation</Label>
                  <Input
                    id="date_evaluation"
                    type="date"
                    value={evaluationForm.date_evaluation}
                    onChange={(e) => setEvaluationForm((prev) => ({ ...prev, date_evaluation: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximum_note">Notée sur  </Label>
                  <Input
                    id="maximum_note"
                    type="number"
                    min="1"
                    max="100"
                    value={evaluationForm.maximum_note}
                    onChange={(e) =>
                      setEvaluationForm((prev) => ({ ...prev, maximum_note: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coefficient">Coefficient </Label>
                  <Input
                    id="coefficient"
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={evaluationForm.coefficient}
                    onChange={(e) =>
                      setEvaluationForm((prev) => ({ ...prev, coefficient: e.target.value }))
                    }
                  />
                </div>
              </div>

              <Button color="indigodye" onClick={handleCreateEvaluation} disabled={loading} className="w-full flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" /> Création en cours...
                  </>
                ) : (
                  "Créer l'Évaluation"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mes évaluations */}
        <TabsContent value="my-evaluations">
          <Card>
            <CardHeader>
              <CardTitle>Mes Évaluations</CardTitle>
              <CardDescription>Liste de toutes vos évaluations créées</CardDescription>
            </CardHeader>
            <CardContent>
              {professorEvaluations.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune évaluation créée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {professorEvaluations.map((evaluation) => {
                    const matter = matters.find((m) => m.id === evaluation.matter_id)
                    const classe = classes.find((c) => c.id === evaluation.classe_id)
                    const evaluationNotes = notes.filter((n) => n.evaluation_id === evaluation.id)

                    return (
                      <Card key={evaluation.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{matter?.name}</h3>
                              <Badge variant="outline">{classe?.label}</Badge>
                              <Badge >{evaluation.type_note.label}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Date: {new Date(evaluation.date_evaluation).toLocaleDateString()}</span>
                              <span>Note max: {evaluation.maximum_note}</span>
                              <span>Coefficient: {evaluation.coefficient}</span>
                              <span>Notes saisies: {evaluationNotes.length}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleSelectEvaluation(evaluation)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir/Modifier
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saisir les notes */}
        <TabsContent value="enter-grades">
          {selectedEvaluation ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Saisie des Notes</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{matters.find((m) => m.id === selectedEvaluation.matter_id)?.name}</Badge>
                    <Badge variant="outline">{classes.find((c) => c.id === selectedEvaluation.classe_id)?.label}</Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Évaluation du {new Date(selectedEvaluation.date_evaluation).toLocaleDateString()}- Note sur{" "}
                  {selectedEvaluation.maximum_note} (Coefficient: {selectedEvaluation.coefficient})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Inscription</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Prénom</TableHead>
                        <TableHead>Note /{selectedEvaluation.maximum_note}</TableHead>
                        <TableHead>Note Coefficientée</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentGrades.map((student) => (
                        <TableRow key={student.registration_id}>
                          <TableCell className="font-medium">{student.registration_number}</TableCell>
                          <TableCell>{student.student_name}</TableCell>
                          <TableCell>{student.student_first_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={Number(selectedEvaluation.maximum_note)}
                              step="0.25"
                              value={student.note === 0 ? '' : student.note}
                              onChange={(e) =>
                                updateStudentGrade(student.registration_id, Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge color="secondary">{student.coefficient_note.toFixed(2)}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveAllGrades} disabled={loading} className="flex items-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" /> Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Enregistrer toutes les notes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Sélectionnez une évaluation pour saisir les notes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="statistics">
          {selectedEvaluation && stats ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiques de l'Évaluation
                  </CardTitle>
                  <CardDescription>
                    {matters.find((m) => m.id === selectedEvaluation.matter_id)?.name} -
                    {classes.find((c) => c.id === selectedEvaluation.classe_id)?.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Moyenne</p>
                            <p className="text-2xl font-bold">{stats.average}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Note Max</p>
                            <p className="text-2xl font-bold">{stats.maxGrade}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Taux de Réussite</p>
                            <p className="text-2xl font-bold">{stats.passRate}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Élèves Notés</p>
                            <p className="text-2xl font-bold">
                              {stats.gradedStudents}/{stats.totalStudents}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Répartition des Notes</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>
                          {stats.gradedStudents}/{stats.totalStudents} élèves
                        </span>
                      </div>
                      <Progress value={(stats.gradedStudents / stats.totalStudents) * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Classement des Élèves</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rang</TableHead>
                          <TableHead>Élève</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>Note Coefficientée</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentGrades
                          .filter((sg) => sg.note > 0)
                          .sort((a, b) => b.note - a.note)
                          .map((student, index) => (
                            <TableRow key={student.registration_id}>
                              <TableCell>
                                <Badge variant={index < 3 ? "soft" : "outline"}>{index + 1}</Badge>
                              </TableCell>
                              <TableCell>
                                {student.student_name} {student.student_first_name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  color={
                                    student.note >= Number(selectedEvaluation.maximum_note) * 0.5 ? "default" : "destructive"
                                  }
                                >
                                  {student.note}/{selectedEvaluation.maximum_note}
                                </Badge>
                              </TableCell>
                              <TableCell>{student.coefficient_note.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez une évaluation avec des notes pour voir les statistiques
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

