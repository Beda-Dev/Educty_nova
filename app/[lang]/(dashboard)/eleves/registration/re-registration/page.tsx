"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import { ReinscriptionStepper } from "@/components/reinscription/reinscription-stepper"
import { Step1PersonalInfo } from "@/components/reinscription/step-1-personal-info"
import { Step2SchoolInfo } from "@/components/reinscription/step-2-school-info"
import { Step3Pricing } from "@/components/reinscription/step-3-pricing"
import { Step4Documents } from "@/components/reinscription/step-4-documents"
import { Step5Confirmation } from "@/components/reinscription/step-5-confirmation"
import { ReinscriptionReceipt } from "@/components/reinscription/reinscription-receipt"
import type { Student } from "@/lib/interface"
import { Search, User, AlertTriangle } from "lucide-react"
import { useSchoolStore } from "@/store/index"


export default function ReinscriptionPage() {
  const { currentStep, setCurrentStep, selectedStudent, setSelectedStudent, reset } = useReinscriptionStore()
  const { students } = useSchoolStore()
  const [showReceipt, setShowReceipt] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showStepper, setShowStepper] = useState(false)

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_number.includes(searchTerm),
  )

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setShowStepper(true)
    setCurrentStep(1)
  }

  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleComplete = () => {
    setShowReceipt(true)
  }

  const handleNewReinscription = () => {
    reset()
    setShowReceipt(false)
    setShowStepper(false)
    setSearchTerm("")
  }

  if (showReceipt) {
    return <ReinscriptionReceipt onNewReinscription={handleNewReinscription} />
  }

  if (!showStepper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Réinscription d'un élève</h1>
            <p className="text-gray-600 text-center">Recherchez un élève existant pour procéder à sa réinscription</p>
          </div>

          {/* Student Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Rechercher un élève</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Nom, prénom ou matricule</Label>
                <Input
                  id="search"
                  placeholder="Tapez pour rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm && filteredStudents.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-center space-x-3"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {student.name} {student.first_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Matricule: {student.registration_number} - {student.sexe}
                        </p>
                      </div>
                      <Badge color={student.status === "actif" ? "default" : "secondary"}>{student.status}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && filteredStudents.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Aucun élève trouvé avec ces critères de recherche.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Réinscription d'un élève</h1>
          <p className="text-gray-600 text-center">
            Réinscription de {selectedStudent?.name} {selectedStudent?.first_name}
          </p>
        </div>

        <ReinscriptionStepper currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && <Step1PersonalInfo onNext={handleNext} />}
          {currentStep === 2 && <Step2SchoolInfo onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 3 && <Step3Pricing onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 4 && <Step4Documents onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 5 && <Step5Confirmation onPrevious={handlePrevious} onComplete={handleComplete} />}
        </div>
      </div>
    </div>
  )
}
