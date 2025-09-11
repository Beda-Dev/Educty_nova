"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSchoolStore } from "@/store/index"
import { Download, PrinterIcon as Print } from "lucide-react"
import { generatePDFfromRef } from "@/lib/utils"
import { useRegistrationStore } from "@/hooks/use-registration-store"
import Image from "next/image"
import { generationNumero } from "@/lib/fonction"
import { Installment, Pricing } from "@/lib/interface"
import {TableauPaiement} from "@/components/common/tableauPaiement"

interface RegistrationReceiptProps {
  onNewRegistration: () => void
}

export function RegistrationReceipt({ onNewRegistration }: RegistrationReceiptProps) {
  const { studentData, selectedTutors, newTutors, registrationData, payments, paidAmount , availablePricing } = useRegistrationStore()
  const { academicYearCurrent, settings, classes, methodPayment, registrations, pricing, installements } = useSchoolStore()
  const [totalPayer, setTotalPayer] = useState(0)
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Calculate receipt number
  const inscription = registrations.find(registration => 
    registration.class_id === registrationData?.class_id && 
    registration.academic_year_id === academicYearCurrent.id && 
    registration.registration_date === registrationData?.registration_date
    && registration.student.registration_number.trim() === studentData?.registration_number.trim()
  )
  const receiptNumber = inscription ? generationNumero(inscription.id, inscription.created_at, "inscription") : ""

  // School info
  const schoolInfo = {
    logo: settings?.[0].establishment_logo || "",
    name: settings?.[0].establishment_name || "Nom Établissement",
    address: settings?.[0].address || "Adresse établissement",
    phone: `${settings?.[0].establishment_phone_1} / ${settings?.[0].establishment_phone_2 || ""}`.trim(),
    academicYear: academicYearCurrent.label,
    receiptNumber,
    currency: settings?.[0].currency || "FCFA"
  }

  const Classe = classes?.find(classe => classe.id === registrationData?.class_id)

  // Calculate total amount to pay
  useEffect(() => {
    if (payments.length > 0) {
      const total = payments.reduce((sum, payment) => {
        const feeType = SearchFeeType(Number(payment.installment_id))
        const amount = Number(feeType?.amount) || 0
        return sum + amount
      }, 0)
      setTotalPayer(total)
    }


  }, [payments])

  const SearchFeeType = (id: number): Pricing | undefined => {
    const installment = installements?.find((install: Installment) => install.id === id)
    return pricing?.find((price: Pricing) => price.id === installment?.pricing_id)
  }

  const handlePDF = async (mode: "download" | "print") => {
    try {
      setIsPrinting(true)
      await generatePDFfromRef(
        printRef, 
        `reçu_inscription_${studentData?.name}_${studentData?.first_name}`, 
        mode
      )
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePrint = () => handlePDF("print")
  const handleDownload = () => handlePDF("download")

  const ReceiptCopy = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm" style={{ fontSize: '12px' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-3 mb-4">
        <div className="flex items-start gap-3">
          {schoolInfo.logo ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={80}
              height={80}
              className="school-logo"
              crossOrigin="anonymous" // Ajoutez cette ligne
              onError={(e) => {
                // Gérer les erreurs de chargement d'image
                e.currentTarget.src = '/images/default-logo.png'
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              Logo
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-sm font-bold leading-snug">{schoolInfo.name}</h1>
            <p className="text-xs text-gray-600 leading-snug">
              {schoolInfo.address} | Tél: {schoolInfo.phone}
            </p>
            <p className="text-xs text-gray-600 leading-snug">
              Année scolaire: {academicYearCurrent.label}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-sm font-semibold leading-snug">REÇU D'INSCRIPTION</h2>
          <p className="text-xs text-gray-600 leading-snug">
            N° {schoolInfo.receiptNumber}
          </p>
          <p className="text-xs text-gray-600 leading-snug">
            Date: {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-3 space-y-4">
          {/* Student Info */}
          {studentData && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">INFORMATIONS DE L'ÉLÈVE</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Info label="Nom complet" value={`${studentData.name} ${studentData.first_name}`} />
                <Info label="Matricule" value={studentData.registration_number} />
                <Info label="Date de naissance" value={new Date(studentData.birth_date).toLocaleDateString("fr-FR")} />
                <Info label="Sexe" value={studentData.sexe} />
                <Info label="Classe" value={Classe?.label || "N/A"} />
                <Info label="Date d'inscription" value={registrationData ? new Date(registrationData.registration_date).toLocaleDateString("fr-FR") : "N/A"} />
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Payment Summary */}
          <div className="mb-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center justify-between">
          <span>Récapitulatif des paiements</span>

          {/* Encadré Montant Versé */}
          <span className="bg-blue-50 border border-blue-200 rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
            <span className="text-blue-700">Montant Versé :</span>
            <span className="text-green-600 font-bold">
              {paidAmount.toLocaleString()} {schoolInfo.currency}
            </span>
          </span>
        </h3>
            <div className="my-2">
              <TableauPaiement
                payments={payments}
                availablePricing={availablePricing}
                paidAmount={paidAmount}
                settings={settings}
                discount_amount={registrationData?.discount_amount || null}
                discount_percentage={registrationData?.discount_percentage || null}
                pricing_id={registrationData?.pricing_id || null}
              />
            </div>
          </div>
          

          <Separator className="my-4" />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-xs text-gray-700 text-center space-y-2">
              <div className="border-t border-gray-400 h-10 w-40 mx-auto"></div>
              <span>Signature du parent/tuteur</span>
            </div>
            <div className="text-xs text-gray-700 text-center space-y-2">
              <div className="border-t border-gray-400 h-10 w-40 mx-auto"></div>
              <span>Cachet et signature de l'établissement</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t">
            <p className="mb-1">Document officiel de {schoolInfo.name}</p>
            <p>Émis le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div ref={printRef} className="space-y-6">
        <ReceiptCopy />
        <div className="text-xs text-center text-gray-500 py-2">---------------------------- ---------------------------- ----------------------------</div>
        <ReceiptCopy />
      </div>

      <div className="flex justify-center gap-3 mt-6 print:hidden">
        <Button 
          onClick={handlePrint} 
          variant="outline" 
          size="sm" 
          className="h-9 px-4 text-sm"
          disabled={isPrinting}
        >
          <Print className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm" 
          className="h-9 px-4 text-sm"
          disabled={isPrinting}
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
        <Button 
          color="indigodye"
          onClick={onNewRegistration} 
          size="sm" 
          className="h-9 px-4 text-sm "
        >
          Nouvelle inscription
        </Button>
      </div>
    </div>
  )
}

const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-start">
    <span className="font-semibold min-w-[120px]">{label}:</span>
    <span className="text-gray-800 ml-2">{value || "N/A"}</span>
  </div>
)