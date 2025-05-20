"use client"

import { useEffect, useState } from "react"
import {  useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Printer, FileSpreadsheet } from "lucide-react"
import { PaymentSchedule } from "./payment-schedule"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import * as XLSX from "xlsx"
import { Separator } from "@/components/ui/separator"
import { FeeType, Pricing, Level } from "@/lib/interface"
import { useSchoolStore } from "@/store"

interface Props {
  params: {
    id: string
  }
}


export default function LevelInstallement({ params }: Props) {
    const { levels , feeTypes , assignmentTypes , pricing , installements } = useSchoolStore()
  const router = useRouter()
  const levelId = Number(params.id)
  const [pricingData, setPricingData] = useState<Pricing[]>([])
  const [levelInfo, setLevelInfo] = useState<Level | null>(null)
  const [activeAssignmentType, setActiveAssignmentType] = useState("affecté")

useEffect(() => {
  const levelId = Number(params.id)

  // Trouver le niveau actuel
  const level = levels.find((l) => l.id === levelId)
  if (level) {
    setLevelInfo(level)
  }

  // Associer les installments aux pricing correspondants
  const enrichedPricing = pricing
    .filter((p) => p.level_id === levelId)
    .map((p) => ({
      ...p,
      installments: installements.filter((i) => i.pricing_id === p.id),
    }))
  
  setPricingData(enrichedPricing)
}, [levels, pricing, installements, params.id])
  const handlePrint = (assignmentType: string, feeTypeId: number) => {
    const content = document.getElementById(`schedule-${assignmentType}-${feeTypeId}`)
    if (content) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write("<html><head><title>Échéancier de paiements</title>")
        printWindow.document.write('<link rel="stylesheet" href="/styles.css" />')
        printWindow.document.write("</head><body>")
        printWindow.document.write(content.innerHTML)
        printWindow.document.write("</body></html>")
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

  const handleDownloadPDF = async (assignmentType: string, feeTypeId: number) => {
    const content = document.getElementById(`schedule-${assignmentType}-${feeTypeId}`)
    if (content) {
      const canvas = await html2canvas(content, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

      const feeType = feeTypes.find((ft) => ft.id === feeTypeId)
      pdf.save(`echeancier-${levelInfo?.label}-${assignmentType}-${feeType?.slug}.pdf`)
    }
  }

  const handleExportExcel = (assignmentType: string, feeTypeId: number) => {
    const data = pricingData.find((p) => p.assignment_type.label === assignmentType && p.fee_type_id === feeTypeId)

    if (data && data.installments) {
      const excelData = data.installments.map((installment) => ({
        Libellé: data.label,
        "Type de frais": data.fee_type.label,
        "Montant dû": installment.amount_due,
        "Date d'échéance": new Date(installment.due_date).toLocaleDateString(),
        Statut: installment.status,
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Échéancier")

      const feeType = feeTypes.find((ft) => ft.id === feeTypeId)
      XLSX.writeFile(workbook, `echeancier-${levelInfo?.label}-${assignmentType}-${feeType?.slug}.xlsx`)
    }
  }

  // Calculer le montant total par type d'affectation
  const calculateTotalByAssignmentType = (assignmentType: string) => {
    return pricingData
      .filter((p) => p.assignment_type.label === assignmentType)
      .reduce((total, pricing) => total + Number(pricing.amount), 0)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold ml-4">Échéanciers de paiements - {levelInfo?.label || "Niveau"}</h1>
      </div>

      <Tabs defaultValue="affecté" className="w-full" onValueChange={setActiveAssignmentType}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="affecté">Affecté</TabsTrigger>
          <TabsTrigger value="non-affecté">Non-affecté</TabsTrigger>
        </TabsList>

        {["affecté", "non-affecté"].map((assignmentType) => (
          <TabsContent key={assignmentType} value={assignmentType} className="mt-6 space-y-8">
            {/* Résumé des montants totaux */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé des frais - {assignmentType}</CardTitle>
                <CardDescription>Montant total à payer pour tous les types de frais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {feeTypes.map((feeType) => {
                    const pricing = pricingData.find(
                      (p) => p.assignment_type.label === assignmentType && p.fee_type_id === feeType.id,
                    )
                    return (
                      <Card key={feeType.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{feeType.label}</div>
                            <div className="text-xl font-bold">
                              {pricing ? Number(pricing.amount).toLocaleString("fr-FR") : 0} €
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center">
                  <div className="text-lg font-medium">Montant total</div>
                  <div className="text-2xl font-bold">
                    {calculateTotalByAssignmentType(assignmentType).toLocaleString("fr-FR")} €
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Échéanciers par type de frais */}
            {feeTypes.map((feeType) => {
              const pricing = pricingData.find(
                (p) => p.assignment_type.label === assignmentType && p.fee_type_id === feeType.id,
              )

              if (!pricing) return null

              return (
                <Card key={feeType.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>
                        {feeType.label} - {assignmentType}
                      </CardTitle>
                      <CardDescription>Échéancier de paiement pour {feeType.label}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handlePrint(assignmentType, feeType.id)}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(assignmentType, feeType.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportExcel(assignmentType, feeType.id)}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div id={`schedule-${assignmentType}-${feeType.id}`}>
                      <PaymentSchedule pricing={pricing} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
