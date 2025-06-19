"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSchoolStore } from "@/store"
import ControlledSelectData from "../select_data"

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
}: PricingFormProps) {
  const { levels, academicYears, assignmentTypes, feeTypes, academicYearCurrent, settings } = useSchoolStore()

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

  return (
    <div className="border rounded-lg overflow-hidden">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Libellé</Label>
                    <Input
                      id="label"
                      type="text"
                      placeholder="ex : Tarification inscription"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    />
                  </div>

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
