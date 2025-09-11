"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchoolStore } from "@/store/index"
import type { RegistrationFormData, Classe, AcademicYear, Pricing } from "@/lib/interface"
import { AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { useRegistrationStore } from "@/hooks/use-registration-store"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface Step2Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step2SchoolInfo({ onNext, onPrevious }: Step2Props) {
  const { classes, levels, academicYearCurrent, pricing , feeTypes } = useSchoolStore()
  const { studentData, registrationData, setRegistrationData, setAvailablePricing } =
    useRegistrationStore()

  const [formData, setFormData] = useState<RegistrationFormData>({
    class_id: 0,
    academic_year_id: academicYearCurrent.id,
    student_id: 0,
    registration_date: new Date().toISOString().split("T")[0],
  })

  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)

  const [selectedClass, setSelectedClass] = useState<Classe | null>(null)
  const [availablePricing, setLocalAvailablePricing] = useState<Pricing[]>([])
  const [classWarning, setClassWarning] = useState("")
  const [pricingError, setPricingError] = useState("")
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

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
          // console.log("Tarification trouvée pour ces paramètres." , matchingPricing )
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
      toast.error("Veuillez sélectionner une classe", {
        position: "top-center",
      })
      return
    }

    if (pricingError) {
      toast.error("Veuillez résoudre les problèmes de tarification avant de continuer", {
        position: "top-center",
      })
      return
    }

    if (classWarning) {
      setOpenConfirmModal(true)
      return
    }

    setRegistrationData(formData)
    onNext()
  }

  const handleConfirm = () => {
    setRegistrationData(formData)
    setOpenConfirmModal(false)
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl font-bold tracking-tight">Informations scolaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Label className="text-sm font-medium leading-none">Niveau *</Label>
              <Select
                value={selectedLevelId ? selectedLevelId.toString() : ''}
                onValueChange={(value) => {
                  const newLevelId = Number.parseInt(value)
                  setSelectedLevelId(newLevelId)
                  setFormData({ ...formData, class_id: 0 }) // reset class if level changes
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Label className="text-sm font-medium leading-none">Classe *</Label>
              <Select
                value={formData.class_id ? formData.class_id.toString() : ''}
                onValueChange={(value) => setFormData({ ...formData, class_id: Number.parseInt(value) })}
                disabled={!selectedLevelId}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={!selectedLevelId ? "Sélectionnez d'abord un niveau" : "Sélectionner une classe"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.filter((classe) => classe.level_id === selectedLevelId).length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Aucune classe pour ce niveau</div>
                  ) : (
                    classes.filter((classe) => classe.level_id === selectedLevelId).map((classe) => (
                      <SelectItem key={classe.id} value={classe.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{classe.label} ({classe.serie?.label || ''})</span>
                          <Badge variant="outline">
                            {classe.student_number}/{classe.max_student_number}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {classWarning && (
                <Alert color="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{classWarning}</AlertDescription>
                </Alert>
              )}
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Label className="text-sm font-medium leading-none">Année académique</Label>
              <Select value={academicYearCurrent.id.toString()} disabled>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={academicYearCurrent.id.toString()}>
                    {academicYearCurrent.label}
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div 
              className="space-y-2 md:col-span-2"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Label className="text-sm font-medium leading-none">Date d'inscription</Label>
              <Input
                type="date"
                className="h-10"
                value={formData.registration_date}
                onChange={(e) =>
                  setFormData({ ...formData, registration_date: e.target.value })
                }
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Preview */}
      {Array.isArray(availablePricing) && availablePricing.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="text-2xl font-bold tracking-tight">Frais à payer</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {availablePricing.map((pricing) => (
                  <motion.div 
                    key={pricing.id} 
                    className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-lg">{ feeTypes.find((ft) => ft.id === pricing.fee_type_id)?.label || pricing.fee_type.label  || pricing.fee_type_id}</h4>
                      <span className="text-xl font-bold text-skyblue">
                        {Number.parseInt(pricing.amount).toLocaleString()} FCFA
                      </span>
                    </div>
                    {Array.isArray(pricing.installments) && pricing.installments.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            Échéances de paiement :
                          </span>
                          <Badge color="secondary">
                            {pricing.installments.length} tranches
                          </Badge>
                        </div>
                        <Separator />
                        {pricing.installments.map((installment) => (
                          <div key={installment.id} className="grid grid-cols-3 gap-4 items-center">
                            <div className="col-span-1">
                              <Badge variant="outline" className="capitalize">
                                {installment.status}
                              </Badge>
                            </div>
                            <div className="col-span-1 text-right">
                              <span className="font-medium">
                                {Number.parseInt(installment.amount_due).toLocaleString()} FCFA
                              </span>
                            </div>
                            <div className="col-span-1 text-right text-sm text-muted-foreground">
                              {new Date(installment.due_date).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {pricingError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Alert color="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{pricingError}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div 
        className="flex justify-between pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button variant="outline" onClick={onPrevious} className="h-10 px-6">
          Précédent
        </Button>
        <Button  onClick={handleNext} disabled={!!pricingError} className="h-10 px-6">
          Suivant
        </Button>
      </motion.div>

      {/* Confirmation Modal */}
      <Dialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Classe complète</DialogTitle>
            <DialogDescription>
              La classe sélectionnée a atteint sa capacité maximale. Voulez-vous vraiment continuer ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Classe: {selectedClass?.label}</Label>
              <div className="flex items-center gap-2">
                <Progress
                  value={
                    (Number.parseInt(selectedClass?.student_number || "0") /
                      Number.parseInt(selectedClass?.max_student_number || "1")) *
                    100
                  }
                  className="h-2"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedClass?.student_number}/{selectedClass?.max_student_number} élèves
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-around gap-2">

            
            <Button variant="outline" color="destructive" onClick={() => setOpenConfirmModal(false)}>
              Annuler
            </Button>
            <Button color="indigodye" onClick={handleConfirm}>
              Confirmer
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}