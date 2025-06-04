"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchoolStore } from "@/store/index"
import type { RegistrationFormData, Classe, AcademicYear, Pricing } from "@/lib/interface"
import { AlertTriangle } from "lucide-react"


interface Step2Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step2SchoolInfo({ onNext, onPrevious }: Step2Props) {
  const { classes, academicYearCurrent , pricing, studentData, registrationData, setRegistrationData, setAvailablePricing } = useSchoolStore()

  const [formData, setFormData] = useState<RegistrationFormData>({
    class_id: 0,
    academic_year_id: academicYearCurrent.id,
    student_id: 0,
    registration_date: new Date().toISOString().split("T")[0],
  })

  const [selectedClass, setSelectedClass] = useState<Classe | null>(null)
  const [availablePricing, setLocalAvailablePricing] = useState<Pricing[]>([])
  const [classWarning, setClassWarning] = useState("")
  const [pricingError, setPricingError] = useState("")

  useEffect(() => {
    if (registrationData) {
      setFormData(registrationData)
    }
  }, [registrationData])

  useEffect(() => {
    if (formData.class_id && studentData) {
      const classe = classes.find((c) => c.id === formData.class_id)
      setSelectedClass(classe || null)

      if (classe) {
        // Check if class is full
        if (Number.parseInt(classe.student_number) >= Number.parseInt(classe.max_student_number)) {
          setClassWarning("Cette classe a atteint sa capacité maximale d'élèves.")
        } else {
          setClassWarning("")
        }

        // Find matching pricing
        const matchingPricing = pricing.filter(
          (p) =>
            p.assignment_type_id === studentData.assignment_type_id &&
            p.academic_years_id === academicYearCurrent.id &&
            p.level_id === classe.level_id,
        )

        if (matchingPricing.length > 0) {
          setLocalAvailablePricing(matchingPricing)
          setAvailablePricing(matchingPricing)
          setPricingError("")
        } else {
          setLocalAvailablePricing([])
          setAvailablePricing([])
          setPricingError("Aucune tarification trouvée pour ces paramètres. Veuillez vérifier vos paramètres.")
        }
      }
    }
  }, [formData.class_id, studentData, setAvailablePricing])

  const handleNext = () => {
    if (!formData.class_id) {
      alert("Veuillez sélectionner une classe")
      return
    }

    if (pricingError) {
      alert("Veuillez résoudre les problèmes de tarification avant de continuer")
      return
    }

    if (classWarning) {
      const confirm = window.confirm("La classe sélectionnée est pleine. Voulez-vous continuer ?")
      if (!confirm) return
    }

    setRegistrationData(formData)
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations scolaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classe *</Label>
              <Select
                value={formData.class_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, class_id: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id.toString()}>
                      {classe.label} ({classe.student_number}/{classe.max_student_number} élèves)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {classWarning && (
                <Alert color="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{classWarning}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label>Année académique</Label>
              <Select value={academicYearCurrent.id.toString()} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={academicYearCurrent.id.toString()}>{academicYearCurrent.label}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Date d'inscription</Label>
              <Select value={formData.registration_date} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={formData.registration_date}>
                    {new Date(formData.registration_date).toLocaleDateString("fr-FR")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Preview */}
      {availablePricing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frais à payer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availablePricing.map((pricing) => (
                <div key={pricing.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{pricing.label}</h4>
                    <span className="text-lg font-bold">{Number.parseInt(pricing.amount).toLocaleString()} FCFA</span>
                  </div>
                  {pricing.installments && pricing.installments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Échéances de paiement :</p>
                      {pricing.installments.map((installment) => (
                        <div key={installment.id} className="flex justify-between text-sm">
                          <span>{installment.status}</span>
                          <span>
                            {Number.parseInt(installment.amount_due).toLocaleString()} FCFA -{" "}
                            {new Date(installment.due_date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pricingError && (
        <Alert color="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{pricingError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Précédent
        </Button>
        <Button onClick={handleNext} disabled={!!pricingError}>
          Suivant
        </Button>
      </div>
    </div>
  )
}
