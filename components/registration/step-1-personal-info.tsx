"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Info, User, User2, Calendar, Hash, Image as ImageIcon, VenusAndMars, Upload } from "lucide-react"
import { useSchoolStore } from "@/store/index"
import { TutorModal } from "./tutor-modal"
import type { StudentFormData, AssignmentType, Tutor } from "@/lib/interface"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

interface Step1Props {
  onNext: () => void
}

export function Step1PersonalInfo({ onNext }: Step1Props) {
  const { assignmentTypes, tutors, studentData, setStudentData, selectedTutors, setSelectedTutors, newTutors, removeNewTutor } =
    useSchoolStore()

  const [formData, setFormData] = useState<StudentFormData>({
    assignment_type_id: 0,
    registration_number: "",
    name: "",
    first_name: "",
    birth_date: "",
    status: "actif",
    photo: null,
    sexe: "",
  })

  const [tutorSearch, setTutorSearch] = useState("")
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (studentData) {
      setFormData(studentData)
      if (studentData.photo && (typeof studentData.photo === 'object' && !!(studentData.photo as File | Blob))) {
        setPreviewImage(URL.createObjectURL(studentData.photo))
      } else if (typeof studentData.photo === 'string') {
        setPreviewImage(studentData.photo)
      }
    }
  }, [studentData])

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
  }, [tutorSearch])

  const handleStudentChange = (field: keyof StudentFormData, value: any) => {
    const updatedData = { ...formData, [field]: value }
    if (field === "name" || field === "first_name") {
      updatedData[field] = value.toUpperCase()
    }
    setFormData(updatedData)
  }

  const handleTutorSelect = (tutor: Tutor) => {
    const hasLegalTutor = [...selectedTutors, ...newTutors].some((t) => t.is_tutor_legal)
    const tutorWithLegal = { ...tutor, is_tutor_legal: !hasLegalTutor }

    if (!selectedTutors.find((t) => t.id === tutor.id)) {
      setSelectedTutors([...selectedTutors, tutorWithLegal])
    }
    setTutorSearch("")
  }

  const removeTutor = (tutorId: number) => {
    setSelectedTutors(selectedTutors.filter((t) => t.id !== tutorId))
  }

  const toggleTutorLegal = (tutorId: number) => {
    const hasOtherLegalTutor = [...selectedTutors, ...newTutors]
      .filter((t) => ("id" in t ? t.id !== tutorId : true))
      .some((t) => t.is_tutor_legal)

    if (hasOtherLegalTutor) {
      alert("Un tuteur légal existe déjà. Il ne peut y avoir qu'un seul tuteur légal.")
      return
    }

    setSelectedTutors(selectedTutors.map((t) => (t.id === tutorId ? { ...t, is_tutor_legal: !t.is_tutor_legal } : t)))
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("La taille de la photo ne doit pas excéder 3Mo")
        return
      }
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide")
        return
      }
      setPreviewImage(URL.createObjectURL(file))
      setPhotoFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 3 * 1024 * 1024,
    maxFiles: 1
  })

  const handleNext = () => {
    if (
      !formData.assignment_type_id ||
      !formData.name ||
      !formData.first_name ||
      !formData.birth_date ||
      !formData.sexe ||
      !formData.registration_number
    ) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }
  
    if (selectedTutors.length === 0 && newTutors.length === 0) {
      alert("Veuillez ajouter au moins un tuteur")
      return
    }
  
    // Ajouter la photo au formData si elle existe
    const dataToSend = { ...formData }
    if (photoFile) {
      dataToSend.photo = photoFile
    }
  
    setStudentData(dataToSend)
    onNext()
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Carte Informations personnelles */}
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
                      <p>Numéro d'identification unique de l'élève</p>
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
                  <Select 
                    value={formData.sexe} 
                    onValueChange={(value) => handleStudentChange("sexe", value)}
                  >
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
            </div>

            {/* Zone de téléchargement de photo */}
            <div className="space-y-2 md:col-span-2 mt-4">
              <Label>Photo (optionnel - max 3Mo)</Label>
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
                          <span className="text-xs">Taille maximale : 3Mo</span>
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Tuteurs */}
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
                {filteredTutors.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border rounded-md overflow-hidden"
                  >
                    {filteredTutors.map((tutor) => (
                      <motion.div
                        key={tutor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                        onClick={() => handleTutorSelect(tutor)}
                      >
                        {tutor.name} {tutor.first_name} - {tutor.phone_number}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              <TutorModal />

              {/* Selected Tutors */}
              {selectedTutors.length > 0 && (
                <div className="space-y-2">
                  <Label>Tuteurs sélectionnés</Label>
                  <div className="space-y-3">
                    {selectedTutors.map((tutor) => (
                      <motion.div 
                        key={tutor.id} 
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeTutor(tutor.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Tutors */}
              {newTutors.length > 0 && (
                <div className="space-y-2">
                  <Label>Nouveaux tuteurs créés</Label>
                  <div className="space-y-3">
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
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeNewTutor(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bouton Suivant */}
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