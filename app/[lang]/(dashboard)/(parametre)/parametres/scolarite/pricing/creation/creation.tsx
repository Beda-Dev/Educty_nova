"use client"

import { useState, useRef } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSchoolStore } from "@/store"
import { generatePDFfromRef } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import type { Paiement, PricingData, InstallmentData } from "./data"
import { fetchpricing, fetchInstallment } from "@/store/schoolservice"
import { ArrowLeft, Printer, Download } from "lucide-react"
import PricingForm from "./pricing-form"
import PaymentSchedule from "./payment-schedule"

export default function TarificationPage() {
  const router = useRouter()
  const { setPricing, settings, setInstallments } = useSchoolStore()

  const [label, setLabel] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)
  const [assignmentTypeId, setAssignmentTypeId] = useState<number | null>(null)
  const [academicYearId, setAcademicYearId] = useState<number | null>(null)
  const [feeTypeId, setFeeTypeId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [useEcheancier, setUseEcheancier] = useState<boolean>(false)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [echeancierValide, setEcheancierValide] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const InstallmentIdCreated: number[] = []

  // Format currency based on settings
  const currency = settings[0]?.currency || "FCFA"

  const update = async () => {
    const Pric = await fetchpricing()
    setPricing(Pric)
    const Install = await fetchInstallment()
    setInstallments(Install)
  }

  // Calculate remaining amount
  const montantRestant = Math.max(
    0,
    Number.parseInt(amount || "0") - (useEcheancier ? paiements.reduce((sum, p) => sum + p.montant, 0) : 0),
  )

  // Format amount with spaces as thousand separators
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR").format(montant) + ` ${currency}`
  }

  // Return to modification mode
  const retourModification = () => {
    setEcheancierValide(false)
    // Reset form
    setLabel("")
    setAmount("")
    setSelectedLevelId(null)
    setAssignmentTypeId(null)
    setAcademicYearId(null)
    setFeeTypeId(null)
    setUseEcheancier(false)
    setPaiements([])
  }

  // Generate PDF for print or download
  const generatePDF = async (action: "download" | "print") => {
    if (!printRef.current) {
      return
    }

    setIsProcessing(true)

    try {
      await generatePDFfromRef(printRef, "tarification", action)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du PDF",
        color: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    const basicFormValid =
      label.trim() &&
      amount.trim() &&
      Number(amount.replace(/\s/g, "")) > 0 &&
      selectedLevelId !== null &&
      assignmentTypeId !== null &&
      academicYearId !== null &&
      feeTypeId !== null

    // If using échéancier, must have payments and remaining amount must be 0
    if (useEcheancier) {
      return basicFormValid && paiements.length > 0 && montantRestant === 0
    }

    return basicFormValid
  }

  // Rollback created pricing and installments if error occurs
  const rollbackCreation = async (pricingId: number) => {
    const failedInstallments: number[] = []

    try {
      if (!Array.isArray(InstallmentIdCreated)) {
        throw new Error("InstallmentIdCreated must be an array")
      }

      // Delete installments individually
      for (const id of InstallmentIdCreated) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            failedInstallments.push(id)
          }
        } catch (err) {
          failedInstallments.push(id)
        }
      }

      // Delete pricing
      const deletePricingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pricing/${pricingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!deletePricingResponse.ok) {
        throw new Error(`Failed to delete pricing with ID: ${pricingId}`)
      }
    } catch (error) {
      console.error("Critical error during rollback:", error)
      throw error
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs correctement.",
        color: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    let pricingId: number | null = null

    try {
      // Prepare pricing data
      const pricingData: PricingData = {
        assignment_type_id: assignmentTypeId!,
        academic_years_id: academicYearId!,
        level_id: selectedLevelId!,
        fee_type_id: feeTypeId!,
        label: label,
        amount: amount.replace(/\s/g, ""),
      }

      // Create pricing
      const pricingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pricingData),
      })

      if (!pricingResponse.ok) {
        const errorData = await pricingResponse.json()
        throw new Error(errorData.message || "Erreur lors de l'ajout de la tarification")
      }

      const pricingResult = await pricingResponse.json()
      pricingId = pricingResult.id

      // If payment schedule is used, create installments sequentially
      if (useEcheancier && paiements.length > 0) {
        const paiementsTries = [...paiements].sort((a, b) => a.date.getTime() - b.date.getTime())

        try {
          for (let i = 0; i < paiementsTries.length; i++) {
            const paiement = paiementsTries[i]
            const installmentData: InstallmentData = {
              pricing_id: pricingResult.id,
              amount_due: paiement.montant.toString(),
              due_date: format(paiement.date, "yyyy-MM-dd"),
              status: `${i + 1}er versement`,
            }

            const installmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/installment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(installmentData),
            })

            if (!installmentResponse.ok) {
              const errorData = await installmentResponse.json()
              throw new Error(errorData.message || `Erreur lors de l'ajout du versement ${i + 1}`)
            }

            const installmentResult = await installmentResponse.json()
            InstallmentIdCreated.push(Number(installmentResult.id))
          }
        } catch (error) {
          console.error("Error creating installment:", error)
          if (pricingId) {
            await rollbackCreation(pricingId)
          }
          throw error
        }
      }

      await update()

      toast({
        title: "Succès",
        description: "La tarification a été enregistrée avec succès.",
      })

      if (useEcheancier) {
        setEcheancierValide(true)
      } else {
        router.back()
      }
    } catch (error) {
      console.error("Error during submission:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement.",
        color: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Sort payments by date
  const paiementsTries = [...paiements].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Validated payment schedule view
  if (echeancierValide) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-background rounded-lg border p-6"
        >
          <div className="mb-6">
            <h1 className="text-xl font-bold text-skyblue">Échéancier de Paiement Validé</h1>
            <p className="text-lg text-muted-foreground">
              {label} - Montant total:{" "}
              <span className="font-semibold">{formatMontant(Number.parseInt(amount.replace(/\s/g, "")))}</span>
            </p>
          </div>

          <div ref={printRef} className="space-y-6">
            {/* Establishment header for print */}
            <div className="hidden print:block space-y-2 border-b pb-4 mb-4">
              {settings[0]?.establishment_logo && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${settings[0].establishment_logo}`}
                  alt="Logo"
                  className="h-16 mx-auto"
                />
              )}
              <h2 className="text-xl font-bold text-center">{settings[0]?.establishment_name || "Établissement"}</h2>
              {settings[0]?.approval_number && (
                <p className="text-sm text-center">N° Approbation: {settings[0].approval_number}</p>
              )}
              {settings[0]?.address && <p className="text-sm text-center">{settings[0].address}</p>}
              <div className="flex justify-center gap-4 text-sm">
                {settings[0]?.establishment_phone_1 && <span>Tél: {settings[0].establishment_phone_1}</span>}
                {settings[0]?.email && <span>Email: {settings[0].email}</span>}
              </div>
            </div>

            <Table className="border rounded-lg">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-bold">N°</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Montant</TableHead>
                  <TableHead className="font-bold">Solde restant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiementsTries.map((paiement, index) => {
                  const soldeAvant =
                    Number.parseInt(amount.replace(/\s/g, "")) -
                    paiementsTries.slice(0, index).reduce((sum, p) => sum + p.montant, 0)

                  const soldeApres = soldeAvant - paiement.montant

                  return (
                    <TableRow key={paiement.id} className="hover:bg-muted/50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{format(paiement.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{formatMontant(paiement.montant)}</TableCell>
                      <TableCell>{formatMontant(soldeApres)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
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

          <div className="flex gap-4 justify-end border-t pt-4 mt-6">
            <Button variant="outline" onClick={() => router.push("/parametres/scolarite/pricing")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button color="indigodye" onClick={retourModification} disabled={isProcessing}>
                    Nouvelle Tarification
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ajouter une nouvelle tarification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => generatePDF("print")} disabled={isProcessing}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Imprimer l'échéancier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => generatePDF("download")} disabled={isProcessing}>
                    <Download className="mr-2 h-4 w-4" /> Télécharger en PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Télécharger l'échéancier au format PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main form view
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background rounded-lg border p-6"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-skyblue">Définir une tarification</h1>
          </div>
        </div>

        <div className="space-y-8">
          {/* Pricing Information Section */}
          <PricingForm
            label={label}
            setLabel={setLabel}
            amount={amount}
            setAmount={setAmount}
            selectedLevelId={selectedLevelId}
            setSelectedLevelId={setSelectedLevelId}
            assignmentTypeId={assignmentTypeId}
            setAssignmentTypeId={setAssignmentTypeId}
            academicYearId={academicYearId}
            setAcademicYearId={setAcademicYearId}
            feeTypeId={feeTypeId}
            setFeeTypeId={setFeeTypeId}
            useEcheancier={useEcheancier}
            setUseEcheancier={setUseEcheancier}
          />

          {/* Payment Schedule Section */}
          <AnimatePresence>
            <PaymentSchedule
              amount={amount}
              paiements={paiements}
              setPaiements={setPaiements}
              useEcheancier={useEcheancier}
            />
          </AnimatePresence>

          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-around gap-4 pt-6"
          >
            <Button variant="outline" onClick={() => router.push("/parametres/scolarite/pricing")}>
              Annuler
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    color="indigodye"
                    className="w-full md:w-auto px-8 py-6 text-lg"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting
                      ? "Enregistrement..."
                      : useEcheancier
                        ? "Valider l'échéancier"
                        : "Enregistrer la tarification"}
                  </Button>
                </TooltipTrigger>
                {!isFormValid() && (
                  <TooltipContent side="top">
                    <p>Veuillez remplir tous les champs obligatoires</p>
                    {useEcheancier && (paiements.length === 0 || montantRestant !== 0) && (
                      <p>
                        {paiements.length === 0
                          ? "Veuillez créer au moins un échéancier de paiement"
                          : "Le montant total des paiements doit correspondre au montant défini"}
                      </p>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
