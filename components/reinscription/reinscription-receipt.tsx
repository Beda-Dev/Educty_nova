"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import { CheckCircle, Download, PrinterIcon as Print } from "lucide-react"
import { useSchoolStore } from "@/store/index"
import { generatePDFfromRef } from "@/lib/utils"
import { useRef, useState } from "react"
import Image from "next/image"
import { generationNumero } from "@/lib/fonction"

interface ReinscriptionReceiptProps {
  onNewReinscription: () => void
}

export function ReinscriptionReceipt({ onNewReinscription }: ReinscriptionReceiptProps) {
  const { selectedStudent, existingTutors, newTutors, registrationData, payments, newDocuments, paidAmount } =
    useReinscriptionStore()

  const { academicYearCurrent, settings, classes, methodPayment, registrations, installements, pricing } = useSchoolStore()
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

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

  const SearchFeeType = (id: number) => {
    const installment = installements?.find(install => install.id === id)
    return pricing?.find(price => price.id === installment?.pricing_id)
  }

  const handlePDF = async (mode: "download" | "print") => {
    try {
      setIsPrinting(true)
      await generatePDFfromRef(
        printRef, 
        `reçu_inscription_${selectedStudent?.name}_${selectedStudent?.first_name}`, 
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
    <div className="p-3 bg-white" style={{ fontSize: '11px' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-1 mb-1">
        <div className="flex items-start gap-1">
          {schoolInfo.logo ? (
            <Image
              src={schoolInfo.logo}
              alt="Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
              Logo
            </div>
          )}
          <div>
            <h1 className="text-xs font-bold leading-tight">{schoolInfo.name}</h1>
            <p className="text-[10px] text-gray-600 leading-tight">
              {schoolInfo.address} | Tél: {schoolInfo.phone}
            </p>
            <p className="text-[10px] text-gray-600 leading-tight">
              Année: {academicYearCurrent.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xs font-semibold leading-tight">REÇU DE D'INSCRIPTION</h2>
          <p className="text-[10px] text-gray-600 leading-tight">
            N° {schoolInfo.receiptNumber}
          </p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-1">
          {/* Student Info */}
          {selectedStudent && (
            <div className="mb-1">
              <h3 className="text-xs font-semibold text-blue-800 mb-0.5">ÉLÈVE</h3>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                <Info label="Nom" value={`${selectedStudent.name} ${selectedStudent.first_name}`} />
                <Info label="Matricule" value={selectedStudent.registration_number} />
                <Info label="Naissance" value={new Date(selectedStudent.birth_date).toLocaleDateString("fr-FR")} />
                <Info label="Sexe" value={selectedStudent.sexe} />
                <Info label="Classe" value={Classe?.label || "N/A"} />
                <Info label="Réinscription" value={registrationData ? new Date(registrationData.registration_date).toLocaleDateString("fr-FR") : "N/A"} />
              </div>
            </div>
          )}


          <Separator className="my-1 h-[0.5px]" />

          {/* Payment Summary */}
          <div className="mb-1">
            <h3 className="text-xs font-semibold text-blue-800 mb-0.5">PAIEMENTS</h3>
            <div className="space-y-0.5">
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
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs">
                    {item.feeType} {item.count > 1 ? `(${item.count}x)` : ''}
                  </span>
                  <span className="text-xs font-medium">{item.amount.toLocaleString()} {schoolInfo.currency}</span>
                </div>
              ))}
            </div>

            <div className="mt-1 space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span>Total à payer:</span>
                <span className="font-medium">{totalPayer.toLocaleString()} {schoolInfo.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant payé:</span>
                <span className="font-medium text-green-600">{paidAmount.toLocaleString()} {schoolInfo.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Reste à payer:</span>
                <span className={`font-medium ${totalPayer - paidAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(totalPayer - paidAmount).toLocaleString()} {schoolInfo.currency}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-1 h-[0.5px]" />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-1 mt-1">
            <div className="text-[10px] text-gray-700 text-center">
              <div className="border-t border-gray-400 h-6 w-32 mx-auto"></div>
              <span>Signature du parent</span>
            </div>
            <div className="text-[10px] text-gray-700 text-center">
              <div className="border-t border-gray-400 h-6 w-32 mx-auto"></div>
              <span>Cachet et signature</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-600 mt-1 pt-1 border-t">
            <p>Document officiel de {schoolInfo.name}</p>
            <p>Émis le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div ref={printRef} className="space-y-1">
        <ReceiptCopy />
        <ReceiptCopy />
      </div>

      <div className="flex justify-center gap-1.5 mt-3 print:hidden">
        <Button 
          onClick={handlePrint} 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs"
          disabled={isPrinting}
        >
          <Print className="w-3 h-3 mr-1" />
          Imprimer
        </Button>
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs"
          disabled={isPrinting}
        >
          <Download className="w-3 h-3 mr-1" />
          PDF
        </Button>
        <Button 
          onClick={onNewReinscription} 
          size="sm" 
          className="h-7 px-2 text-xs"
        >
          Nouvelle réinscription
        </Button>
      </div>
    </div>
  )
}

const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <p className="text-xs truncate">
    <span className="font-semibold">{label}:</span>{" "}
    <span className="text-gray-800">{value || "N/A"}</span>
  </p>
)