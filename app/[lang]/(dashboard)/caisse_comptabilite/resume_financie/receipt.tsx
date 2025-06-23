"use client"

import { forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Payment, Student, Transaction } from "@/lib/interface"
import { Phone, Mail, MapPin, Calendar, CreditCard, User, FileText, CheckCircle } from "lucide-react"
import dayjs from "dayjs"
import { formatCurrency } from "../../(parametre)/parametres/caisse/echeanciers_paiement/[id]/fonction"

interface ReceiptProps {
  transaction: Transaction
  payments: Payment[]
  student: Student
  schoolName?: string
  schoolLogo?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  receiptNumber?: string
  currency?: string
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  (
    {
      transaction,
      payments,
      student,
      schoolName = "École Exemple",
      schoolLogo = "/placeholder.svg?height=80&width=80",
      schoolAddress = "123 Rue de l'Éducation, Ville",
      schoolPhone = "+123 456 789",
      schoolEmail = "contact@ecole-exemple.com",
      receiptNumber,
      currency,
    },
    ref,
  ) => {
    // Calculer le montant total
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

    // Formater la monnaie
// Utilise la fonction importée pour formater la monnaie

    // Formater la date
    const formatDate = (date: string | Date) => {
      return dayjs(date).format("DD/MM/YYYY")
    }

    return (
      <div ref={ref} className="p-8 bg-white max-w-2xl mx-auto">
        {/* En-tête du reçu */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b">
          <div className="flex items-center gap-4">
            <img src={schoolLogo || "/placeholder.svg"} alt="Logo" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold">{schoolName}</h1>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                <span>{schoolAddress}</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{schoolPhone}</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{schoolEmail}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block border border-primary/20 rounded-md px-3 py-1 bg-primary/5">
              <h2 className="font-semibold text-primary">REÇU DE PAIEMENT</h2>
              <p className="text-sm text-muted-foreground">
                N° {receiptNumber || `REC-${transaction.id.toString().padStart(6, "0")}`}
              </p>
            </div>
            <div className="mt-2 text-sm text-muted-foreground flex items-center justify-end gap-1">
              <Calendar className="h-3 w-3" />
              <span>Date: {formatDate(transaction.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Informations de l'élève */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              INFORMATIONS DE L'ÉLÈVE
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">
                  {student.first_name} {student.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matricule</p>
                <p className="font-medium">{student.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type d'affectation</p>
                <p className="font-medium">{student.assignment_type.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails du paiement */}
        <div className="mb-6">
          <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <FileText className="h-4 w-4" />
            DÉTAILS DU PAIEMENT
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-2 text-left text-sm font-medium">Description</th>
                <th className="py-2 px-2 text-left text-sm font-medium">Échéance</th>
                <th className="py-2 px-2 text-right text-sm font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="border-b border-dashed">
                  <td className="py-3 px-2 text-sm">{payment.installment?.pricing?.label || "Frais scolaires"}</td>
                  <td className="py-3 px-2 text-sm">
                    {payment.installment?.due_date ? formatDate(payment.installment.due_date) : "-"}
                  </td>
                  <td className="py-3 px-2 text-sm text-right font-medium">{formatCurrency(Number(payment.amount))}</td>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td colSpan={2} className="py-3 px-2 text-right font-medium">
                  Total
                </td>
                <td className="py-3 px-2 text-right font-bold">{formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Méthodes de paiement */}
        <div className="mb-6">
          <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            MÉTHODES DE PAIEMENT
          </h3>
          <div className="border rounded-md p-3 bg-muted/10">
            {payments.some((payment) => payment.payment_methods) ? (
              <table className="w-full">
                <tbody>
                  {payments.flatMap((payment, paymentIndex) =>
                    payment.payment_methods
                      ? payment.payment_methods.map((method, methodIndex) => (
                          <tr key={`${paymentIndex}-${methodIndex}`}>
                            <td className="py-1 text-sm">{method.name}</td>
                          </tr>
                        ))
                      : [],
                  )}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground">Paiement en espèces</p>
            )}
          </div>
        </div>

        {/* Signature et confirmation */}
        <div className="mt-8 pt-4 border-t flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1 text-green-600 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Paiement confirmé</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Merci pour votre paiement. Ce reçu sert de preuve de paiement officielle.
            </p>
          </div>
          <div className="text-right">
            <div className="h-16 mb-1">{/* Espace pour signature */}</div>
            <div className="border-t border-dashed pt-1 w-40">
              <p className="text-sm text-muted-foreground">Signature autorisée</p>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>Ce document est généré électroniquement et ne nécessite pas de signature manuscrite.</p>
        </div>
      </div>
    )
  },
)

Receipt.displayName = "Receipt"

export { Receipt }
