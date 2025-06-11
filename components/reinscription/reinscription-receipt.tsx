"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import { Download, PrinterIcon as Print } from "lucide-react"
import { useSchoolStore } from "@/store/index"
import { generatePDFfromRef } from "@/lib/utils"
import { useRef, useState } from "react"
import Image from "next/image"
import { generationNumero } from "@/lib/fonction"

interface ReinscriptionReceiptProps {
  onNewReinscription: () => void
}

export function ReinscriptionReceipt({ onNewReinscription }: ReinscriptionReceiptProps) {
  const { selectedStudent, registrationData, payments, paidAmount } = useReinscriptionStore()
  const { academicYearCurrent, settings, classes, registrations, installements, pricing } = useSchoolStore()
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const SearchFeeType = (id: number) => {
    const installment = installements?.find(install => install.id === id)
    return pricing?.find(price => price.id === installment?.pricing_id)
  }

  // Calculate receipt number
  const reinscription = registrations.find(registration => 
    registration.student_id === selectedStudent?.id && 
    registration.academic_year_id === academicYearCurrent.id
  )
  const receiptNumber = reinscription ? generationNumero(reinscription.id, reinscription.created_at, "inscription") : ""

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
  const totalPayer = payments.reduce((sum, payment) => {
    const feeType = SearchFeeType(Number(payment.installment_id))
    const amount = Number(feeType?.amount) || 0
    return sum + amount
  }, 0)



  const handlePDF = async (mode: "download" | "print") => {
    try {
      setIsPrinting(true)
      await generatePDFfromRef(
        printRef, 
        `reçu_reinscription_${selectedStudent?.name}_${selectedStudent?.first_name}`, 
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
            <Image
              src={schoolInfo.logo}
              alt="Logo"
              width={56}
              height={56}
              className="object-contain"
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
          <h2 className="text-sm font-semibold leading-snug">REÇU DE RÉINSCRIPTION</h2>
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
          {selectedStudent && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">INFORMATIONS DE L'ÉLÈVE</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Info label="Nom complet" value={`${selectedStudent.name} ${selectedStudent.first_name}`} />
                <Info label="Matricule" value={selectedStudent.registration_number} />
                <Info label="Date de naissance" value={new Date(selectedStudent.birth_date).toLocaleDateString("fr-FR")} />
                <Info label="Sexe" value={selectedStudent.sexe} />
                <Info label="Classe" value={Classe?.label || "N/A"} />
                <Info label="Date de réinscription" value={registrationData ? new Date(registrationData.registration_date).toLocaleDateString("fr-FR") : "N/A"} />
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Payment Summary */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">DÉTAIL DES PAIEMENTS</h3>
            <div className="space-y-2 mb-4">
              {payments.reduce((acc, payment) => {
                const feeType = SearchFeeType(Number(payment.installment_id))
                if (!feeType) return acc
                
                const existing = acc.find(item => item.feeType === feeType.fee_type.label)
                if (existing) {
                  existing.amount += Number(payment.amount)
                  existing.count++
                } else {
                  acc.push({
                    feeType: feeType.fee_type.label,
                    amount: Number(payment.amount),
                    count: 1
                  })
                }
                return acc
              }, [] as { feeType: string; amount: number; count: number }[])
              .sort((a, b) => a.feeType.localeCompare(b.feeType))
              .map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm">
                    {item.feeType} {item.count > 1 ? `(${item.count}x)` : ''}
                  </span>
                  <span className="text-sm font-medium">{item.amount.toLocaleString()} {schoolInfo.currency}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between py-1">
                <span>Total à payer:</span>
                <span className="font-medium">{totalPayer.toLocaleString()} {schoolInfo.currency}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Montant payé:</span>
                <span className="font-medium text-green-600">{paidAmount.toLocaleString()} {schoolInfo.currency}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold">
                <span>Reste à payer:</span>
                <span className={`${totalPayer - paidAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(totalPayer - paidAmount).toLocaleString()} {schoolInfo.currency}
                </span>
              </div>
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
          onClick={onNewReinscription} 
          size="sm" 
          className="h-9 px-4 text-sm"
        >
          Nouvelle réinscription
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