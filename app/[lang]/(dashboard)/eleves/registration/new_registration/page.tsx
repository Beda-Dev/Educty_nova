"use client"

import { useState, useEffect } from "react"
import { useSchoolStore } from "@/store/index"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RegistrationStepper } from "@/components/registration/registration-stepper"
import { Step1PersonalInfo } from "@/components/registration/step-1-personal-info"
import { Step2SchoolInfo } from "@/components/registration/step-2-school-info"
import { Step3Pricing } from "@/components/registration/step-3-pricing"
import { Step4Documents } from "@/components/registration/step-4-documents"
import { Step5Confirmation } from "@/components/registration/step-5-confirmation"
import { RegistrationReceipt } from "@/components/registration/registration-receipt"
import { fetchTutors, fetchPaymentMethods, fetchStudents, fetchRegistration, fetchPayment } from "@/store/schoolservice"
import { useRegistrationStore } from "@/hooks/use-registration-store"
import { updateStudentCountByClass } from "@/lib/fonction";

export default function InscriptionPage() {
  const { studentData } = useRegistrationStore();
  const { setTutors, methodPayment, setmethodPayment, setRegistration, setStudents, setPayments, academicYearCurrent, classes, registrations } = useSchoolStore()
  const { currentStep, setCurrentStep, reset } = useRegistrationStore()

  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    const fetchUpdate = async () => {
      const updatedTutors = await fetchTutors()
      setTutors(updatedTutors)
      const updatedMethodPayment = await fetchPaymentMethods()
      setmethodPayment(updatedMethodPayment)
    }
    fetchUpdate()
  }, [])

  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleComplete = async () => {
    const response = await fetchRegistration()
    setRegistration(response)
    const responseStudents = await fetchStudents()
    setStudents(responseStudents)
    const responsePayments = await fetchPayment()
    setPayments(responsePayments)

    await updateStudentCountByClass(registrations, academicYearCurrent, classes);
    setShowReceipt(true)
  }

  const handleNewRegistration = () => {
    reset()
    setShowReceipt(false)
  }

  if (showReceipt) {
    return <RegistrationReceipt onNewRegistration={handleNewRegistration} />
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-3xl font-bold text-center mb-2">Inscription d'un élève</h1>
        <p className="text-gray-600 text-center">
          Suivez les étapes pour inscrire un nouvel élève dans l'établissement
        </p>

      </CardHeader>
      <CardContent>



        <RegistrationStepper currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && <Step1PersonalInfo onNext={handleNext} />}
          {currentStep === 2 && <Step2SchoolInfo onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 3 && <Step3Pricing onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 4 && <Step4Documents onNext={handleNext} onPrevious={handlePrevious} />}
          {currentStep === 5 && (
            <Step5Confirmation
              onPrevious={handlePrevious}
              onComplete={handleComplete}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
