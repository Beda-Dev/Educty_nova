"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-hot-toast"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import { TutorEditModal } from "./tutor-edit-modal"
import { StudentFormData, AssignmentType, Tutor, StudentPhoto } from "@/lib/interface"
import { X, Plus, AlertTriangle, RefreshCw , User } from "lucide-react"
import { useSchoolStore } from "@/store/index"
import { motion } from "framer-motion"



interface Step1Props {
  onNext: () => void
}

export function Step1PersonalInfo({ onNext }: Step1Props) {
  const {
    selectedStudent,
    studentModifications,
    setStudentModifications,
    existingTutors,
    newTutors,
    setExistingTutors,
    setNewTutors,
    removeNewTutor,
    updateExistingTutor,
    storeFileInIndexedDB,
  } = useReinscriptionStore()

  const { methodPayment, assignmentTypes, tutors } = useSchoolStore()

  const [formData, setFormData] = useState({
    assignment_type_id: 0,
    registration_number: "",
    name: "",
    first_name: "",
    birth_date: "",
    status: "actif",
    photo: null as StudentPhoto,
    sexe: "",
  })

  const [fileError, setFileError] = useState("")
  const [hasRestoredPhoto, setHasRestoredPhoto] = useState(false)

  useEffect(() => {
    if (selectedStudent) {
      setFormData({
        assignment_type_id: selectedStudent.assignment_type_id,
        registration_number: selectedStudent.registration_number,
        name: selectedStudent.name,
        first_name: selectedStudent.first_name,
        birth_date: selectedStudent.birth_date,
        status: selectedStudent.status,
        photo: selectedStudent.photo ?? null,
        sexe: selectedStudent.sexe,
      })

      // Set existing tutors
      if (selectedStudent.tutors) {
        const tutorsWithLegal = selectedStudent.tutors.map((tutor) => ({
          ...tutor,
          is_tutor_legal: tutor.pivot?.is_tutor_legal === 1,
        }))
        setExistingTutors(tutorsWithLegal)
      }
    }

    // Check if there's a restored photo from IndexedDB
    if (studentModifications?.photo?.stored?.isRestored) {
      setHasRestoredPhoto(true)
    }
  }, [selectedStudent, setExistingTutors, studentModifications])

  const handleStudentChange = async (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value }
    if (field === "name" || field === "first_name") {
      updatedData[field] = value.toUpperCase()
    }
    setFormData(updatedData)
  }

  const handleFileChange = async (file: File | null) => {
    setFileError("")
    setHasRestoredPhoto(false)

    if (!file) {
      setFormData({ ...formData, photo: null })
      return
    }

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Le fichier ne doit pas dépasser 5 Mo")
      return
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setFileError("Format de fichier non supporté. Utilisez JPG, PNG ou GIF")
      return
    }

    setFormData({ ...formData, photo: file ? { file } : null })

    // Stocker immédiatement dans IndexedDB
    try {
      const fileId = await storeFileInIndexedDB(file)
      console.log("Photo stored in IndexedDB with ID:", fileId)
    } catch (error) {
      console.error("Error storing photo in IndexedDB:", error)
      // Continue même si le stockage échoue
    }
  }

  const toggleTutorLegal = (tutorId: number) => {
    // Automatically uncheck other legal tutors
    const updatedTutors = existingTutors.map((tutor) => ({
      ...tutor,
      is_tutor_legal: tutor.id === tutorId ? !tutor.is_tutor_legal : false,
      isModified: tutor.id === tutorId || tutor.is_tutor_legal ? true : tutor.isModified,
    }))

    // Also uncheck legal status for new tutors
    const updatedNewTutors = newTutors.map((tutor) => ({
      ...tutor,
      is_tutor_legal: false,
    }))

    setExistingTutors(updatedTutors)
    setNewTutors(updatedNewTutors)
  }

  const toggleNewTutorLegal = (index: number) => {
    // Automatically uncheck other legal tutors
    const updatedNewTutors = newTutors.map((tutor, i) => ({
      ...tutor,
      is_tutor_legal: i === index ? !tutor.is_tutor_legal : false,
    }))

    // Also uncheck legal status for existing tutors
    const updatedExistingTutors = existingTutors.map((tutor) => ({
      ...tutor,
      is_tutor_legal: false,
      isModified: tutor.is_tutor_legal ? true : tutor.isModified,
    }))

    setNewTutors(updatedNewTutors)
    setExistingTutors(updatedExistingTutors)
  }

  const handleNext = async () => {
    if (
      !formData.assignment_type_id ||
      !formData.name ||
      !formData.first_name ||
      !formData.birth_date ||
      !formData.sexe ||
      !formData.registration_number
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (existingTutors.length === 0 && newTutors.length === 0) {
      toast.error("L'élève doit avoir au moins un tuteur")
      return
    }

    if (fileError) {
      toast.error("Veuillez corriger l'erreur de fichier avant de continuer")
      return
    }

    try {
      // Prepare modifications data
      const modifications: any = {}
      if (selectedStudent) {
        for (const key of Object.keys(formData)) {
          const typedKey = key as keyof typeof formData
          if (formData[typedKey] !== (selectedStudent as any)[key]) {
            if (key === "photo") {
              if (formData.photo && typeof formData.photo === "object" && "file" in formData.photo && formData.photo.file) {
                // Nouvelle photo sélectionnée
                try {
                  const fileId = await storeFileInIndexedDB(formData.photo.file)
                  modifications[key] = {
                    stored: {
                      fileId,
                      originalName: formData.photo.file.name,
                      size: formData.photo.file.size,
                      type: formData.photo.file.type,
                      isRestored: false,
                    },
                  }
                } catch (error) {
                  modifications[key] = { file: formData.photo.file }
                }
              } else {
                // Pas de nouvelle photo sélectionnée, on envoie null
                modifications[key] = formData[typedKey]
              }
            }
          }
        }
      }

      setStudentModifications(modifications)
      onNext()
    } catch (error) {
      console.error("Error processing modifications:", error)
      toast.error("Une erreur s'est produite lors du traitement des données")
    }
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow h-fit">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span>Informations personnelles de l'élève</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type d'affectation *</Label>
                <Select
                  value={formData.assignment_type_id.toString()}
                  onValueChange={(value) => handleStudentChange("assignment_type_id", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Matricule *</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleStudentChange("registration_number", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleStudentChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleStudentChange("first_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleStudentChange("birth_date", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Sexe *</Label>
                <Select value={formData.sexe} onValueChange={(value) => handleStudentChange("sexe", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le sexe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Féminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleStudentChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo (optionnel)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
                {/* Affichage de la photo actuelle */}
                {formData.photo && typeof formData.photo === "string" && (
                  <div className="mt-2">
                    <img
                      src={formData.photo}
                      alt="Photo élève"
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <div className="text-xs text-gray-500">Photo actuelle (lien externe)</div>
                  </div>
                )}
                {formData.photo && typeof formData.photo === "object" && formData.photo instanceof File && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(formData.photo)}
                      alt="Nouvelle photo élève"
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <div className="text-xs text-gray-500">Nouvelle photo sélectionnée</div>
                  </div>
                )}
                {fileError && (
                  <Alert color="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}
                {hasRestoredPhoto && (
                  <Alert>
                    <RefreshCw className="h-4 w-4" />
                    <AlertDescription>
                      Photo restaurée depuis IndexedDB. Vous pouvez la remplacer si nécessaire.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations sur les parents/tuteurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tutor Selection */}
            <div className="space-y-2">
              <Label>Sélectionner un tuteur</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value === "new") {
                    // Open modal for new tutor
                    const modal = document.querySelector('[data-state="closed"]') as HTMLElement
                    modal?.click()
                  } else {
                    // Add existing tutor
                    const tutorId = Number.parseInt(value)
                    const tutor = tutors.find((t) => t.id === tutorId)
                    if (tutor && !existingTutors.find((et) => et.id === tutor.id)) {
                      const hasLegalTutor = [...existingTutors, ...newTutors].some((t) => t.is_tutor_legal)
                      const tutorWithLegal = { ...tutor, is_tutor_legal: !hasLegalTutor }
                      setExistingTutors([...existingTutors, tutorWithLegal])
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un tuteur..." />
                </SelectTrigger>
                <SelectContent>
                  {tutors
                    .filter((tutor) => !existingTutors.find((et) => et.id === tutor.id))
                    .map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id.toString()}>
                        {tutor.name} {tutor.first_name} - {tutor.phone_number}
                      </SelectItem>
                    ))}
                  <SelectItem value="new">
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un nouveau tuteur
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Existing Tutors */}
            {existingTutors.length > 0 && (
              <div className="space-y-2">
                <Label>Tuteurs assignés</Label>
                {existingTutors.map((tutor) => (
                  <div key={tutor.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <span>
                        {tutor.name} {tutor.first_name} - {tutor.phone_number}
                      </span>
                      {tutor.is_tutor_legal && <Badge color="secondary">Tuteur légal</Badge>}
                      {tutor.isModified && <Badge variant="outline">Modifié</Badge>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={tutor.is_tutor_legal} onCheckedChange={() => toggleTutorLegal(tutor.id)} />
                      <Label className="text-sm">Légal</Label>
                      <TutorEditModal tutor={tutor} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setExistingTutors(existingTutors.filter((t) => t.id !== tutor.id))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Tutors */}
            {newTutors.length > 0 && (
              <div className="space-y-2">
                <Label>Nouveaux tuteurs créés</Label>
                {newTutors.map((tutor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <span>
                        {tutor.name} {tutor.first_name} - {tutor.phone_number}
                      </span>
                      {tutor.is_tutor_legal && <Badge color="secondary">Tuteur légal</Badge>}
                      <Badge variant="outline">Nouveau</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={tutor.is_tutor_legal} onCheckedChange={() => toggleNewTutorLegal(index)} />
                      <Label className="text-sm">Légal</Label>
                      <Button variant="ghost" size="sm" onClick={() => removeNewTutor(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "none" }}>
              <TutorEditModal isNew />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleNext}>Suivant</Button>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
