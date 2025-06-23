"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useSchoolStore } from "@/store"
import ControlledSelectData from "../select_data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingFormProps {
  label: string
  setLabel: (value: string) => void
  amount: string
  setAmount: (value: string) => void
  selectedLevelId: number | null
  setSelectedLevelId: (value: number | null) => void
  assignmentTypeId: number | null
  setAssignmentTypeId: (value: number | null) => void
  academicYearId: number | null
  setAcademicYearId: (value: number | null) => void
  feeTypeId: number | null
  setFeeTypeId: (value: number | null) => void
  useEcheancier: boolean
  setUseEcheancier: (value: boolean) => void
  setShowWarningModal?: (value: boolean) => void
}

export default function PricingForm({
  label,
  setLabel,
  amount,
  setAmount,
  selectedLevelId,
  setSelectedLevelId,
  assignmentTypeId,
  setAssignmentTypeId,
  academicYearId,
  setAcademicYearId,
  feeTypeId,
  setFeeTypeId,
  useEcheancier,
  setUseEcheancier,
  setShowWarningModal,
}: PricingFormProps) {
  const { levels, academicYears, assignmentTypes, feeTypes, academicYearCurrent, settings, students, registrations, classes } = useSchoolStore()
  setLabel("tarif")


  const [isFormExpanded, setIsFormExpanded] = useState(true)
  const currency = settings[0]?.currency || "FCFA"

  useEffect(() => {
    if (academicYearCurrent && academicYears.length > 0) {
      const currentYear = academicYears.find((y) => y.id === academicYearCurrent.id)
      if (currentYear) {
        setAcademicYearId(currentYear.id)
      }
    }
  }, [academicYearCurrent, academicYears, setAcademicYearId])

  // Format input value with spaces as thousand separators
  const formatInputAmount = (value: string) => {
    const num = value.replace(/\s/g, "")
    if (num === "") return ""
    return new Intl.NumberFormat("fr-FR").format(Number.parseInt(num))
  }

  // Ajout de la logique de détection d'élèves déjà inscrits
  const [internalShowWarningModal, internalSetShowWarningModal] = useState(false);

  // Recherche la classe liée au niveau sélectionné
  const selectedClass = classes?.find((c) => c.level_id === selectedLevelId);

  // Vérifie s'il existe des élèves inscrits avec les critères donnés
  useEffect(() => {
    if (
      selectedLevelId &&
      assignmentTypeId &&
      academicYearId &&
      selectedClass &&
      registrations &&
      students
    ) {
      const hasMatchingStudent = registrations.some((reg) => {
        const student = students.find((s) => s.id === reg.student_id);
        return (
          Number(reg.class_id) === Number(selectedClass.id) &&
          Number(reg.academic_year_id) === Number(academicYearId) &&
          student &&
          Number(student.assignment_type_id) === Number(assignmentTypeId)
        );
      });
      if (setShowWarningModal) {
        setShowWarningModal(hasMatchingStudent);
      }
      internalSetShowWarningModal(hasMatchingStudent);
    } else {
      if (setShowWarningModal) {
        setShowWarningModal(false);
      }
      internalSetShowWarningModal(false);
    }
  }, [selectedLevelId, assignmentTypeId, academicYearId, selectedClass, registrations, students]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Modale d'avertissement */}
      <Dialog
        open={internalShowWarningModal}
        onOpenChange={internalSetShowWarningModal}
      >
        <DialogContent color="destructive">
          <DialogHeader>
            <DialogTitle className="text-destructive">⚠️ Attention : Risque de double facturation</DialogTitle>
            <DialogDescription className="text-destructive">
              <b>Des élèves sont déjà inscrits</b> dans cette classe, pour cette année académique et ce type d'affectation.<br /><br />
              <b>Ajouter cette tarification</b> entraînera une augmentation des frais à payer pour ces élèves, qui ont déjà reçu un reçu de paiement.<br /><br />
              <span className="font-semibold">Si vous continuez, ces élèves devront payer un supplément correspondant à cette nouvelle tarification.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button color="destructive" onClick={() => internalSetShowWarningModal(false)}>J'ai compris</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        className="cursor-pointer hover:bg-muted/10 transition-colors p-6"
        onClick={() => setIsFormExpanded(!isFormExpanded)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Informations de la tarification</h2>
            <p className="text-muted-foreground">Définissez les détails de la tarification</p>
          </div>
          {isFormExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      <AnimatePresence>
        {isFormExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 pt-0">
              <ScrollArea className="h-auto max-h-[500px]">
                {/* Affiche une alerte si l'échéancier n'est pas activé */}
                {!useEcheancier && (
                  <Alert color="info" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Vous devez définir un échéancier de paiement pour pouvoir soumettre ce formulaire.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant ({currency})</Label>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="ex : 1 000 000"
                      value={formatInputAmount(amount)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, "")
                        if (value === "" || /^\d+$/.test(value)) {
                          setAmount(value)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault()
                        }
                      }}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Niveau</Label>
                    <ControlledSelectData
                      datas={levels}
                      onSelect={setSelectedLevelId}
                      placeholder="Choisir un niveau"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type d'affectation</Label>
                    <ControlledSelectData
                      datas={assignmentTypes}
                      onSelect={setAssignmentTypeId}
                      placeholder="Choisir un type d'affectation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Année académique</Label>
                    <ControlledSelectData
                      datas={academicYears}
                      onSelect={setAcademicYearId}
                      placeholder="Choisir une année académique"
                      defaultValue={academicYearCurrent?.id}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type de frais</Label>
                    <ControlledSelectData
                      datas={feeTypes}
                      onSelect={setFeeTypeId}
                      placeholder="Choisir un type de frais"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <Label htmlFor="use-echeancier" className="font-medium">
                        Définir un échéancier de paiement
                      </Label>
                      <Switch id="use-echeancier" checked={useEcheancier} onCheckedChange={setUseEcheancier} />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


