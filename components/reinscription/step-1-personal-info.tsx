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
import { X, Plus, AlertTriangle, RefreshCw, User, Info, VenusAndMars, User2, Hash, Calendar, Image as ImageIcon, Upload } from "lucide-react"
import { useSchoolStore } from "@/store/index"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

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
  const [isPhotoLoading, setIsPhotoLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [tutorSearch, setTutorSearch] = useState("")
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => handleFileChange(files[0]),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1
  })

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

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

      // Set preview image if photo exists
      if (selectedStudent.photo && typeof selectedStudent.photo === 'string') {
        setPreviewImage(selectedStudent.photo)
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
    setIsPhotoLoading(true)

    if (!file) {
      setFormData({ ...formData, photo: null })
      setPreviewImage(null)
      setIsPhotoLoading(false)
      return
    }

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Le fichier ne doit pas dépasser 5 Mo")
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Format de fichier non supporté. Utilisez JPG, PNG ou GIF")
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreviewImage(previewUrl)

      setFormData({ ...formData, photo: file ? { file } : null })

      // Stocker immédiatement dans IndexedDB
      try {
        const fileId = await storeFileInIndexedDB(file)
        console.log("Photo stored in IndexedDB with ID:", fileId)
      } catch (error) {
        console.error("Error storing photo in IndexedDB:", error)
      }
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Une erreur est survenue")
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsPhotoLoading(false)
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

  const handleTutorSelect = (tutor: Tutor) => {
    const hasLegalTutor = [...existingTutors, ...newTutors].some((t) => t.is_tutor_legal)
    const tutorWithLegal = { ...tutor, is_tutor_legal: !hasLegalTutor }

    if (!existingTutors.find((t) => t.id === tutor.id)) {
      setExistingTutors([...existingTutors, tutorWithLegal])
    }
    setTutorSearch("")
  }

  useEffect(() => {
    if (tutorSearch) {
      const filtered = tutors.filter(
        (tutor) =>
          tutor.name.toLowerCase().includes(tutorSearch.toLowerCase()) ||
          tutor.first_name.toLowerCase().includes(tutorSearch.toLowerCase()),
      )
      setFilteredTutors(filtered)
    } else {
      setFilteredTutors([])
    }
  }, [tutorSearch, tutors])

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
        {/* Student Information Card */}
        <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow h-fit">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span>Informations personnelles de l'élève</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Type d'affectation</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sélectionnez le type d'affectation de l'élève</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={formData.assignment_type_id.toString()}
                  onValueChange={(value) => handleStudentChange("assignment_type_id", Number.parseInt(value))}
                >
                  <SelectTrigger className="group">
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="registration_number">Matricule</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Numéro Matricule unique de l'élève</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="registration_number"
                    className="pl-9"
                    value={formData.registration_number}
                    onChange={(e) => handleStudentChange("registration_number", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-9"
                    value={formData.name}
                    onChange={(e) => handleStudentChange("name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    className="pl-9"
                    value={formData.first_name}
                    onChange={(e) => handleStudentChange("first_name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birth_date"
                    type="date"
                    className="pl-9"
                    value={formData.birth_date}
                    onChange={(e) => handleStudentChange("birth_date", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Sexe</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sélectionnez le sexe de l'élève</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <VenusAndMars className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select value={formData.sexe} onValueChange={(value) => handleStudentChange("sexe", value)}>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Sélectionner le sexe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculin">Masculin</SelectItem>
                      <SelectItem value="Féminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            </div>

            {/* Photo Upload Zone */}
            <div className="space-y-2 md:col-span-2 mt-4">
              <Label>Photo (optionnel - max 5Mo)</Label>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                {previewImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onLoad={() => URL.revokeObjectURL(previewImage)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour changer ou glissez-déposez une nouvelle image
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive ? (
                        "Déposez l'image ici..."
                      ) : (
                        <>
                          Glissez-déposez une image ici, ou cliquez pour sélectionner
                          <br />
                          <span className="text-xs">Taille maximale : 5Mo</span>
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
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
                    Photo restaurée. Vous pouvez la remplacer si nécessaire.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tutors Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow h-fit">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-primary" />
                <span>Informations sur les parents/tuteurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Rechercher un tuteur existant</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recherchez un tuteur déjà enregistré dans le système</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tapez le nom ou prénom du tuteur..."
                    className="pl-9"
                    value={tutorSearch}
                    onChange={(e) => setTutorSearch(e.target.value)}
                  />
                </div>
                {(filteredTutors.length > 0 || tutorSearch) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border rounded-md overflow-hidden"
                  >
                    {filteredTutors.length > 0 ? (
                      filteredTutors.map((tutor) => (
                        <motion.div
                          key={tutor.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="p-2 hover:bg-accent cursor-pointer border-b"
                          onClick={() => handleTutorSelect(tutor)}
                        >
                          {tutor.name} {tutor.first_name} - {tutor.phone_number}
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-2 text-muted-foreground text-sm text-center">
                        Aucun tuteur trouvé
                      </div>
                    )}
                      <div className="border-t p-2 text-center">
                      {/* Button to open add new tutor modal */}
                      <TutorEditModal isNew />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Existing Tutors */}
              {existingTutors.length > 0 && (
                <div className="space-y-2">
                  <Label>Tuteurs assignés</Label>
                  {existingTutors.map((tutor) => (
                    <motion.div
                      key={tutor.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-skyblue" />
                        <div>
                          <span className="font-medium">
                            {tutor.name} {tutor.first_name}
                          </span>
                          {tutor.is_tutor_legal && (
                            <Badge className="ml-2 bg-skyblue hover:bg-skyblue">
                              Tuteur légal
                            </Badge>
                          )}
                          {tutor.isModified && (
                            <Badge variant="outline" className="ml-2">
                              Modifié
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Checkbox
                            id={`legal-${tutor.id}`}
                            checked={tutor.is_tutor_legal}
                            onCheckedChange={() => toggleTutorLegal(tutor.id)}
                          />
                          <Label htmlFor={`legal-${tutor.id}`} className="text-sm cursor-pointer">
                            Légal
                          </Label>
                        </div>
                        <TutorEditModal tutor={tutor} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setExistingTutors(existingTutors.filter((t) => t.id !== tutor.id))
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* New Tutors */}
              {newTutors.length > 0 && (
                <div className="space-y-2">
                  <Label>Nouveaux tuteurs créés</Label>
                  {newTutors.map((tutor, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-primary" />
                        <div>
                          <span className="font-medium">
                            {tutor.name} {tutor.first_name}
                          </span>
                          {tutor.is_tutor_legal && (
                            <Badge className="ml-2 bg-primary hover:bg-primary">
                              Tuteur légal
                            </Badge>
                          )}
                          <Badge variant="outline" className="ml-2">
                            Nouveau
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Checkbox
                            id={`new-legal-${index}`}
                            checked={tutor.is_tutor_legal}
                            onCheckedChange={() => toggleNewTutorLegal(index)}
                          />
                          <Label htmlFor={`new-legal-${index}`} className="text-sm cursor-pointer">
                            Légal
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewTutor(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div style={{ display: "none" }}>
                <TutorEditModal isNew />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 flex justify-end"
        >
          <Button
            onClick={handleNext}
            className="px-6 py-3 text-lg font-medium"
          >
            Suivant
          </Button>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}