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
import { fetchPaymentMethods, fetchStudents, fetchRegistration, fetchPayment , fetchTutors , fetchClasses } from "@/store/schoolservice"
import { useRegistrationStore } from "@/hooks/use-registration-store"
import { updateStudentCountByClass } from "@/lib/fonction"
import { Loader2 } from "lucide-react"

export default function InscriptionPage() {
  const { studentData } = useRegistrationStore();
  const { setTutors, methodPayment, setmethodPayment, setRegistration, setStudents, setPayments, academicYearCurrent, classes, registrations , setClasses  } = useSchoolStore()
  const { currentStep, setCurrentStep, reset , setDiscountAmount,setDiscountPercentage , setDiscounts, isCompleted, setIsCompleted  } = useRegistrationStore()

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
    // Marquer comme terminé (déclenche le loader)
    setIsCompleted(true)
    
    const response = await fetchRegistration()
    setRegistration(response)
    const responseStudents = await fetchStudents()
    setStudents(responseStudents)
    const responsePayments = await fetchPayment()
    setPayments(responsePayments)
    const responseTutors = await fetchTutors()
    setTutors(responseTutors)
    const responseClasses = await fetchClasses()
    setClasses(responseClasses)

    await updateStudentCountByClass(response, academicYearCurrent, responseClasses);
    
    // Afficher le reçu
    setShowReceipt(true)
    // Le loader sera masqué automatiquement quand RegistrationReceipt s'affiche
  }

  const handleNewRegistration = () => {
    reset()
    setShowReceipt(false)
    setDiscountAmount(null)
    setDiscountPercentage(null)
    setDiscounts(null , null , null)
    setIsCompleted(false) // Réinitialiser l'état de completion
  }

  if (showReceipt) {
    return <RegistrationReceipt onNewRegistration={handleNewRegistration} />
  }

  return (
    <>
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

      {/* Overlay de chargement */}
      {isCompleted && !showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Arrière-plan flouté et grisé */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          
          {/* Contenu du loader */}
          <div className="relative z-10 flex flex-col items-center justify-center bg-white rounded-lg shadow-2xl p-8 mx-4">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                Inscription en cours...
              </h3>
              <p className="text-gray-600 max-w-md">
                Veuillez patienter pendant que nous finalisons l'inscription de l'élève.
                Cette opération peut prendre quelques instants.
              </p>
            </div>
            
            {/* Animation de points */}
            <div className="flex space-x-1 mt-6">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}