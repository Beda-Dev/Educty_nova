"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useSchoolStore } from "@/store"
import type { Paiement } from "../data"

interface PaymentScheduleProps {
  amount: string
  paiements: Paiement[]
  setPaiements: (paiements: Paiement[]) => void
  useEcheancier: boolean
}

export default function PaymentSchedule({ amount, paiements, setPaiements, useEcheancier }: PaymentScheduleProps) {
  const { settings, academicYearCurrent } = useSchoolStore()
  const [nouvelleDatePaiement, setNouvelleDatePaiement] = useState<Date | undefined>(undefined)
  const [nouveauMontantPaiement, setNouveauMontantPaiement] = useState<string>("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateWarning, setDateWarning] = useState<string>("")

  const currency = settings[0]?.currency || "FCFA"

  // Calculate remaining amount
  const montantRestant = Math.max(
    0,
    Number.parseInt(amount || "0") - (useEcheancier ? paiements.reduce((sum, p) => sum + p.montant, 0) : 0),
  )

  // Format amount with spaces as thousand separators
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR").format(montant) + ` ${currency}`
  }

  // Format input value with spaces as thousand separators
  const formatInputAmount = (value: string) => {
    const num = value.replace(/\s/g, "")
    if (num === "") return ""
    return new Intl.NumberFormat("fr-FR").format(Number.parseInt(num))
  }

  // Validate date selection
  const validateDateSelection = (selectedDate: Date) => {
    let warning = ""

    // Check if date is chronologically after the last selected date
    if (paiements.length > 0) {
      const sortedDates = [...paiements].sort((a, b) => a.date.getTime() - b.date.getTime())
      const lastDate = sortedDates[sortedDates.length - 1].date

      if (selectedDate <= lastDate) {
        warning = "La date sélectionnée doit être chronologiquement après la dernière date choisie."
        return warning
      }
    }

    // Check if date is within academic year range
    if (academicYearCurrent) {
      const startDate = new Date(academicYearCurrent.start_date)
      const endDate = new Date(academicYearCurrent.end_date)

      if (selectedDate < startDate || selectedDate > endDate) {
        warning = `⚠️ Attention: La date sélectionnée n'est pas comprise dans l'année académique courante (${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}).`
      }
    }

    return warning
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setNouvelleDatePaiement(undefined)
      setDateWarning("")
      return
    }

    const warning = validateDateSelection(date)
    setDateWarning(warning)

    // Only set the date if there's no chronological error
    if (!warning.includes("chronologiquement")) {
      setNouvelleDatePaiement(date)
    }
  }

  // Add payment to schedule
  const ajouterPaiement = () => {
    if (
      !nouvelleDatePaiement ||
      !nouveauMontantPaiement ||
      Number.parseInt(nouveauMontantPaiement.replace(/\s/g, "")) <= 0
    ) {
      return
    }

    const montant = Number.parseInt(nouveauMontantPaiement.replace(/\s/g, ""))
    if (montant > montantRestant) {
      toast({
        title: "Erreur",
        description: "Le montant saisi dépasse le montant restant",
        variant: "destructive",
      })
      return
    }

    // Final date validation before adding
    const warning = validateDateSelection(nouvelleDatePaiement)
    if (warning.includes("chronologiquement")) {
      toast({
        title: "Erreur de date",
        description: warning,
        variant: "destructive",
      })
      return
    }

    const nouveauPaiement: Paiement = {
      id: Date.now().toString(),
      date: nouvelleDatePaiement,
      montant: montant,
    }

    setPaiements([...paiements, nouveauPaiement])
    setNouvelleDatePaiement(undefined)
    setNouveauMontantPaiement("")
    setDateWarning("")
    setCalendarOpen(false)
  }

  // Remove payment from schedule
  const supprimerPaiement = (id: string) => {
    setPaiements(paiements.filter((p) => p.id !== id))
  }

  // Sort payments by date
  const paiementsTries = [...paiements].sort((a, b) => a.date.getTime() - b.date.getTime())

  if (!useEcheancier) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-8 md:grid-cols-2"
    >
      {/* Add Payment Form */}
      <div className="border rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Ajouter un paiement</h2>
          <p className="text-muted-foreground">Définissez les paiements échelonnés</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="date-paiement">Date du paiement</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !nouvelleDatePaiement && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nouvelleDatePaiement ? (
                    format(nouvelleDatePaiement, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={nouvelleDatePaiement}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>

            {dateWarning && (
              <Alert variant={dateWarning.includes("chronologiquement") ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{dateWarning}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="montant-paiement">Montant du paiement ({currency})</Label>
            <Input
              id="montant-paiement"
              type="text"
              placeholder={`Max: ${formatInputAmount(montantRestant.toString())}`}
              value={formatInputAmount(nouveauMontantPaiement)}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, "")
                if (value === "" || /^\d+$/.test(value)) {
                  setNouveauMontantPaiement(value)
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

          <Button
            onClick={ajouterPaiement}
            disabled={
              !nouvelleDatePaiement ||
              !nouveauMontantPaiement ||
              Number.parseInt(nouveauMontantPaiement.replace(/\s/g, "")) <= 0 ||
              dateWarning.includes("chronologiquement")
            }
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Ajouter ce paiement
          </Button>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="border rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Récapitulatif de l'échéancier</h2>
          <p className="text-muted-foreground">
            {amount ? (
              <>
                Montant total:{" "}
                <span className="font-semibold">{formatMontant(Number.parseInt(amount.replace(/\s/g, "")))}</span>
              </>
            ) : (
              "Veuillez saisir un montant total"
            )}
          </p>
        </div>

        {paiements.length > 0 ? (
          <div className="space-y-6">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiementsTries.map((paiement) => (
                  <motion.tr
                    key={paiement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>{format(paiement.date, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{formatMontant(paiement.montant)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => supprimerPaiement(paiement.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression:</span>
                  <span>
                    {Math.round(
                      (paiements.reduce((sum, p) => sum + p.montant, 0) /
                        Number.parseInt(amount.replace(/\s/g, "") || "1")) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (paiements.reduce((sum, p) => sum + p.montant, 0) /
                      Number.parseInt(amount.replace(/\s/g, "") || "1")) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-lg">
                <span>Total payé:</span>
                <span className="font-bold">{formatMontant(paiements.reduce((sum, p) => sum + p.montant, 0))}</span>
              </div>
              <div className="flex justify-between font-medium text-lg">
                <span>Reste à payer:</span>
                <span className={montantRestant > 0 ? "text-destructive font-bold" : "text-success font-bold"}>
                  {formatMontant(montantRestant)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">Aucun paiement défini.</p>
            <p>Utilisez le formulaire pour ajouter des paiements à votre échéancier.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
