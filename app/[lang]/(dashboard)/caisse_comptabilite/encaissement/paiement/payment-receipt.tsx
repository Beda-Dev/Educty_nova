"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Student, Payment, PaymentMethod } from "@/lib/interface"
import Image from "next/image"

interface PaymentReceiptProps {
  student?: Student
  payments: Payment[]
  financialData: any
  settings: any[]
  classe: string
  niveau: string
  installmentAmounts: Record<number, number>
  paymentMethods: Record<number, Array<{ id: number; amount: number }>>
  methodPayment: PaymentMethod[]
  currency: string
}

const PaymentReceipt = ({
  student,
  payments,
  financialData,
  settings,
  classe,
  niveau,
  installmentAmounts,
  paymentMethods,
  methodPayment,
  currency,
}: PaymentReceiptProps) => {
  const schoolInfo = {
    logo: settings?.[0]?.establishment_logo || "",
    name: settings?.[0]?.establishment_name || "Nom Établissement",
    address: settings?.[0]?.address || "Adresse établissement",
    phone:
      `${settings?.[0]?.establishment_phone_1 || ""} ${settings?.[0]?.establishment_phone_2 ? "/ " + settings?.[0]?.establishment_phone_2 : ""}`.trim(),
    currency: settings?.[0]?.currency || "FCFA",
  }

  const formatAmount = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  const generateReceiptNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const time = date.getTime().toString().slice(-4)
    return `PAY${year}${month}${day}${time}`
  }

  const totalPaid = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div className="flex items-start gap-4">
          {schoolInfo.logo ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={80}
              height={80}
              className="school-logo"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              Logo
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-lg font-bold">{schoolInfo.name}</h1>
            <p className="text-sm text-gray-600">{schoolInfo.address}</p>
            <p className="text-sm text-gray-600">Tél: {schoolInfo.phone}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-lg font-semibold text-blue-600">REÇU DE PAIEMENT</h2>
          <p className="text-sm text-gray-600">N° {generateReceiptNumber()}</p>
          <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString("fr-FR")}</p>
          <p className="text-sm text-gray-600">Heure: {new Date().toLocaleTimeString("fr-FR")}</p>
        </div>
      </div>

      {/* Informations de l'élève */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="text-md font-semibold text-blue-800 mb-3">INFORMATIONS DE L'ÉLÈVE</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Nom complet:</span>
              <p className="text-gray-800">
                {student?.first_name} {student?.name}
              </p>
            </div>
            <div>
              <span className="font-medium">Matricule:</span>
              <p className="text-gray-800">{student?.registration_number}</p>
            </div>
            <div>
              <span className="font-medium">Classe:</span>
              <p className="text-gray-800">{classe}</p>
            </div>
            <div>
              <span className="font-medium">Niveau:</span>
              <p className="text-gray-800">{niveau}</p>
            </div>
            <div>
              <span className="font-medium">Type d'affectation:</span>
              <p className="text-gray-800">{student?.assignment_type?.label}</p>
            </div>
            <div>
              <span className="font-medium">Date de paiement:</span>
              <p className="text-gray-800">{new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Détail des paiements */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-blue-800 mb-4">DÉTAIL DES PAIEMENTS</h3>
        <div className="space-y-4">
          {Object.entries(installmentAmounts).map(([installmentId, amount]) => {
            const installmentDetail = financialData?.installmentDetails.find(
              (detail: any) => detail.installment.id === Number(installmentId),
            )
            const methods = paymentMethods[Number(installmentId)] || []

            return (
              <div key={installmentId} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{installmentDetail?.pricing.label}</h4>
                    <p className="text-sm text-gray-600">Type: {installmentDetail?.pricing.fee_type?.label}</p>
                    <p className="text-sm text-gray-600">
                      Échéance:{" "}
                      {installmentDetail
                        ? new Date(installmentDetail.installment.due_date).toLocaleDateString("fr-FR")
                        : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {formatAmount(amount)} {currency}
                  </Badge>
                </div>

                {/* Méthodes de paiement */}
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Méthodes de paiement:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {methods.map((method, index) => {
                      const paymentMethodName = methodPayment.find((pm) => pm.id === method.id)?.name || "Inconnu"
                      return (
                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                          <span className="text-sm">{paymentMethodName}</span>
                          <span className="text-sm font-medium">
                            {formatAmount(method.amount)} {currency}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Récapitulatif */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-md font-semibold text-blue-800 mb-3">RÉCAPITULATIF</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span>Nombre d'échéances payées:</span>
            <span className="font-medium">{Object.keys(installmentAmounts).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Montant total payé:</span>
            <span className="font-bold text-lg text-green-600">
              {formatAmount(totalPaid)} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="text-center space-y-4">
          <div className="border-t border-gray-400 h-12"></div>
          <span className="text-sm text-gray-700">Signature du parent/tuteur</span>
        </div>
        <div className="text-center space-y-4">
          <div className="border-t border-gray-400 h-12"></div>
          <span className="text-sm text-gray-700">Cachet et signature de l'établissement</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 mt-8 pt-4 border-t">
        <p className="mb-1">Document officiel de {schoolInfo.name}</p>
        <p>
          Émis le {new Date().toLocaleDateString("fr-FR")} à{" "}
          {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="mt-2 text-blue-600 font-medium">✓ Paiement enregistré dans le système</p>
      </div>
    </div>
  )
}

export default PaymentReceipt
