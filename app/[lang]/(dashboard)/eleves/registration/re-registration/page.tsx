"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReinscriptionStore } from "@/hooks/use-reinscription-store";
import { ReinscriptionStepper } from "@/components/reinscription/reinscription-stepper";
import { Step1PersonalInfo } from "@/components/reinscription/step-1-personal-info";
import { Step2SchoolInfo } from "@/components/reinscription/step-2-school-info";
import { Step3Pricing } from "@/components/reinscription/step-3-pricing";
import { Step4Documents } from "@/components/reinscription/step-4-documents";
import { Step5Confirmation } from "@/components/reinscription/step-5-confirmation";
import { ReinscriptionReceipt } from "@/components/reinscription/reinscription-receipt";
import type { Student } from "@/lib/interface";
import { Search, User, AlertTriangle } from "lucide-react";
import { useSchoolStore } from "@/store/index";
import { fetchTutors, fetchPaymentMethods, fetchStudents, fetchRegistration, fetchPayment } from "@/store/schoolservice"

export default function ReinscriptionPage() {
  const {
    currentStep,
    setCurrentStep,
    selectedStudent,
    setSelectedStudent,
    reset,
  } = useReinscriptionStore();
  const { students } = useSchoolStore();
  const { setTutors, methodPayment, setmethodPayment, setRegistration, setStudents, setPayments, academicYearCurrent, classes, registrations } = useSchoolStore()
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStepper, setShowStepper] = useState(false);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_number.includes(searchTerm)
  );

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowStepper(true);
    setCurrentStep(1);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    const response = await fetchRegistration()
    setRegistration(response)
    const responseStudents = await fetchStudents()
    setStudents(responseStudents)
    const responsePayments = await fetchPayment()
    setPayments(responsePayments)

    await updateStudentCountByClass(registrations, academicYearCurrent, classes);
    setShowReceipt(true);
  };

  const handleNewReinscription = () => {
    reset();
    setShowReceipt(false);
    setShowStepper(false);
    setSearchTerm("");
  };

  if (showReceipt) {
    return <ReinscriptionReceipt onNewReinscription={handleNewReinscription} />;
  }

  if (!showStepper) {
    return (
      <Card className="p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold mb-1">
            Réinscription d'un élève
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Recherchez un élève existant pour procéder à sa réinscription
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-base font-semibold">
              Nom, prénom ou matricule
            </Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Tapez pour rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {searchTerm && filteredStudents.length > 0 && (
            <div className="border rounded-lg max-h-64 overflow-y-auto divide-y">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className="p-4 hover:bg-muted cursor-pointer flex items-center space-x-4 transition-colors"
                >
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {student.name} {student.first_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Matricule: {student.registration_number} - {student.sexe}
                    </p>
                  </div>
                  <Badge
                    color={
                      student.status === "actif" ? "default" : "secondary"
                    }
                  >
                    {student.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {searchTerm && filteredStudents.length === 0 && (
            <Alert color="destructive">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Aucun élève trouvé avec ces critères de recherche.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-3xl font-bold text-center mb-2">
          Réinscription d'un élève
        </h1>
        <p className="text-gray-600 text-center">
          Réinscription de {selectedStudent?.name} {selectedStudent?.first_name}
        </p>
      </CardHeader>
      <CardContent>
        <ReinscriptionStepper currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && <Step1PersonalInfo onNext={handleNext} />}
          {currentStep === 2 && (
            <Step2SchoolInfo onNext={handleNext} onPrevious={handlePrevious} />
          )}
          {currentStep === 3 && (
            <Step3Pricing onNext={handleNext} onPrevious={handlePrevious} />
          )}
          {currentStep === 4 && (
            <Step4Documents onNext={handleNext} onPrevious={handlePrevious} />
          )}
          {currentStep === 5 && (
            <Step5Confirmation
              onPrevious={handlePrevious}
              onComplete={handleComplete}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
