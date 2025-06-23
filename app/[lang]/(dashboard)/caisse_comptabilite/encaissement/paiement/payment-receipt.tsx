"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Student, Payment, PaymentMethod, Pricing, Installment } from "@/lib/interface"
import Image from "next/image"
import { useSchoolStore } from "@/store"
import { generationNumero } from "@/lib/fonction"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
    phone: `${settings?.[0]?.establishment_phone_1 || ""} ${settings?.[0]?.establishment_phone_2 ? "/ " + settings?.[0]?.establishment_phone_2 : ""}`.trim(),
    currency: settings?.[0]?.currency || "FCFA"
  }

  const formatAmount = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  const generateReceiptNumber = () => {
    return generationNumero(payments[0]?.id, payments[0]?.created_at || new Date().toISOString(), "encaissement")
  }

  // Calcul des totaux
  const totalPaid = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
  const totalDue = financialData?.totalDue || 0
  const totalRemaining = financialData?.totalRemaining || 0
  const totalPaidOverall = financialData?.totalPaid || 0

  // Créer un résumé des paiements par type de frais
  const paymentSummary = financialData?.installmentDetails.reduce((acc: any[], detail: any) => {
    const existing = acc.find(item => item.label === detail.pricing.fee_type.label)
    const amountPaid = installmentAmounts[detail.installment.id] || 0
    
    if (existing) {
      existing.total += Number(detail.installment.amount_due)
      existing.paid += amountPaid
    } else {
      acc.push({
        label: detail.pricing.fee_type.label,
        total: Number(detail.installment.amount_due),
        paid: amountPaid
      })
    }
    return acc
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm" style={{ fontSize: "12px" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-3 mb-4">
        <div className="flex items-start gap-3">
          {schoolInfo.logo ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={80}
              height={80}
              className="school-logo"
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
              Année scolaire: {financialData?.academicYearCurrent?.label || "N/A"}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-sm font-semibold leading-snug">REÇU DE PAIEMENT</h2>
          <p className="text-xs text-gray-600 leading-snug">
            {generateReceiptNumber()}
          </p>
          <p className="text-xs text-gray-600 leading-snug">
            Date: {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-3 space-y-4">
          {/* Student Info */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">INFORMATIONS DE L'ÉLÈVE</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Info label="Nom complet" value={`${student?.first_name} ${student?.name}`} />
              <Info label="Matricule" value={student?.registration_number} />
              <Info label="Date de naissance" value={student?.birth_date ? new Date(student.birth_date).toLocaleDateString("fr-FR") : "N/A"} />
              <Info label="Sexe" value={student?.sexe} />
              <Info label="Classe" value={classe} />
              <Info label="Niveau" value={niveau} />
              <Info label="Type d'affectation" value={student?.assignment_type?.label} />
            </div>
          </div>

          <Separator className="" />

          {/* Payment Details */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center justify-between">
              <span>Détails du paiement</span>
              <span className="bg-blue-50 border border-blue-200 rounded-md px-3 py-1 text-sm font-medium flex items-center gap-2">
                <span className="text-blue-700">Montant Versé :</span>
                <span className="text-green-600 font-bold">
                  {formatAmount(totalPaid)} {currency}
                </span>
              </span>
            </h3>
            <div className="my-2">
              <PaymentTable
                payments={paymentSummary || []}
                totalAmount={totalDue}
                totalPaid={totalPaidOverall + totalPaid}
                remainingAmount={totalRemaining - totalPaid}
                currency={currency}
              />
            </div>
          </div>

          <Separator className="" />

          {/* Détail des échéances payées */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">DÉTAIL DES ÉCHÉANCES PAYÉES</h3>
            <div className="space-y-3">
              {Object.entries(installmentAmounts).map(([installmentId, amount]) => {
                const installmentDetail = financialData?.installmentDetails.find(
                  (detail: any) => detail.installment.id === Number(installmentId)
                ); // <-- Ajout du point-virgule manquant ici
                const methods = paymentMethods[Number(installmentId)] || []

                return (
                  <div key={installmentId} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{installmentDetail?.pricing.fee_type.label}</h4>
                        <p className="text-xs text-gray-600">
                          {installmentDetail?.pricing.label} - Échéance: {new Date(installmentDetail?.installment.due_date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span className="font-bold">{formatAmount(amount)} {currency}</span>
                    </div>

                    {/* Méthodes de paiement */}
                    {methods.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-medium mb-1">Méthodes de paiement:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {methods.map((method, index) => {
                            const paymentMethodName = methodPayment.find((pm) => pm.id === method.id)?.name || "Inconnu"
                            return (
                              <div key={index} className="flex justify-between items-center text-xs">
                                <span>{paymentMethodName}</span>
                                <span className="font-medium">
                                  {formatAmount(method.amount)} {currency}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <Separator className="" />

          {/* Payment Method */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">INFORMATIONS DE PAIEMENT</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Info label="Caissier" value={payments[0]?.cashier?.name || "N/A"} />
              <Info label="Caisse" value={payments[0]?.cash_register?.cash_register_number || "N/A"} />
              <Info label="Numéro de transaction" value={payments[0]?.transaction_id || "N/A"} />
            </div>
          </div>

          <Separator className="" />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 mt-4">
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
          <div className="text-center text-xs text-gray-600 mt-4 pt-4 border-t">
            <p className="mb-1">Document officiel de {schoolInfo.name}</p>
            <p>Émis le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface PaymentTableProps {
  payments: {
    label: string;
    total: number;
    paid: number;
  }[];
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  currency: string;
}

const PaymentTable = ({ payments, totalAmount, totalPaid, remainingAmount, currency }: PaymentTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse" style={{ fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 text-left">Type de frais</th>
            <th className="border border-gray-300 p-2 text-right">Montant total</th>
            <th className="border border-gray-300 p-2 text-right">Montant payé</th>
            <th className="border border-gray-300 p-2 text-right">Reste à payer</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={4} className="border border-gray-300 p-2 text-center text-gray-500">
                Aucun paiement enregistré
              </td>
            </tr>
          ) : (
            payments.map((payment, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{payment.label}</td>
                <td className="border border-gray-300 p-2 text-right">{formatAmount(payment.total)} {currency}</td>
                <td className="border border-gray-300 p-2 text-right">{formatAmount(payment.paid)} {currency}</td>
                <td className={`border border-gray-300 p-2 text-right ${payment.total - payment.paid > 0 ? "text-red-600 font-medium" : "text-green-600 font-semibold"}`}>
                  {formatAmount(payment.total - payment.paid)} {currency}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">Total</td>
            <td className="border border-gray-300 p-2 font-semibold text-right">
              {formatAmount(totalAmount)} {currency}
            </td>
            <td className={`border border-gray-300 p-2 font-semibold text-right text-green-600`}>
              {formatAmount(totalPaid)} {currency}
            </td>
            <td className={`border border-gray-300 p-2 font-semibold text-right ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatAmount(remainingAmount)} {currency}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

const Info = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-start">
    <span className="font-semibold min-w-[100px]">{label}:</span>
    <span className="text-gray-800 ml-2">{value || "N/A"}</span>
  </div>
)

function formatAmount(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

export default PaymentReceipt