"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import type { PaymentFormData, PaymentMethod } from "@/lib/interface"
import { AlertTriangle, Info, CreditCard, Banknote } from "lucide-react"
import { useSchoolStore } from "@/store/index"


interface Step3Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step3Pricing({ onNext, onPrevious }: Step3Props) {
  const { availablePricing, payments, setPayments, paidAmount, setPaidAmount } = useReinscriptionStore()
  const { cashRegisterSessionCurrent, methodPayment } = useSchoolStore()

  const [studentPaidAmount, setStudentPaidAmount] = useState(0)
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([])
  const [installmentAmounts, setInstallmentAmounts] = useState<Record<number, number>>({})
  const [paymentMethods, setPaymentMethods] = useState<Record<number, Array<{ id: number; amount: number }>>>({})
  const [totalDistributedAmount, setTotalDistributedAmount] = useState(0)

  // Get all installments from available pricing
  const allInstallments = availablePricing.flatMap((pricing) => pricing.installments || [])
  const totalDue = availablePricing.reduce((sum, pricing) => sum + Number.parseInt(pricing.amount), 0)

  useEffect(() => {
    // Calculate total distributed amount
    const total = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
    setTotalDistributedAmount(total)
    setPaidAmount(total)
  }, [installmentAmounts, setPaidAmount])

  const handleInstallmentToggle = (installmentId: number) => {
    if (selectedInstallments.includes(installmentId)) {
      setSelectedInstallments(selectedInstallments.filter((id) => id !== installmentId))
      const newAmounts = { ...installmentAmounts }
      delete newAmounts[installmentId]
      setInstallmentAmounts(newAmounts)
      const newMethods = { ...paymentMethods }
      delete newMethods[installmentId]
      setPaymentMethods(newMethods)
    } else {
      setSelectedInstallments([...selectedInstallments, installmentId])
      const installment = allInstallments.find((i) => i.id === installmentId)
      if (installment) {
        const defaultAmount = Math.min(
          Number.parseInt(installment.amount_due),
          studentPaidAmount - totalDistributedAmount,
        )
        setInstallmentAmounts({
          ...installmentAmounts,
          [installmentId]: Math.max(0, defaultAmount),
        })
        setPaymentMethods({
          ...paymentMethods,
          [installmentId]: [{ id: methodPayment[2].id, amount: Math.max(0, defaultAmount) }], // Default to "Espèces"
        })
      }
    }
  }

  const handleAmountChange = (installmentId: number, amount: number | string) => {
    // Si le montant est une chaîne vide, on le convertit en 0
    const numericAmount = amount === '' ? 0 : Number(amount) || 0;
    
    const maxAmount = Math.min(
      Number.parseInt(allInstallments.find((i) => i.id === installmentId)?.amount_due || "0"),
      studentPaidAmount - totalDistributedAmount + (installmentAmounts[installmentId] || 0),
    )

    const finalAmount = Math.min(numericAmount, maxAmount)

    setInstallmentAmounts(prev => ({
      ...prev,
      [installmentId]: finalAmount,
    }))

    // Update payment methods to match new amount
    const currentMethods = paymentMethods[installmentId] || []
    if (currentMethods.length === 1) {
      setPaymentMethods({
        ...paymentMethods,
        [installmentId]: [{ ...currentMethods[0], amount: finalAmount }],
      })
    }
  }

  const updatePaymentMethod = (installmentId: number, index: number, field: "id" | "amount", value: number) => {
    const currentMethods = paymentMethods[installmentId] || []
    const updatedMethods = currentMethods.map((method, i) => (i === index ? { ...method, [field]: value } : method))
    setPaymentMethods({
      ...paymentMethods,
      [installmentId]: updatedMethods,
    })
  }

  const validatePaymentMethods = (installmentId: number): boolean => {
    const methods = paymentMethods[installmentId] || []
    const totalMethodAmount = methods.reduce((sum, method) => sum + method.amount, 0)
    const installmentAmount = installmentAmounts[installmentId] || 0
    return totalMethodAmount === installmentAmount
  }

  const handleNext = () => {
    if (studentPaidAmount === 0) {
      toast.error("Veuillez saisir le montant versé par l'élève")
      return
    }

    if (selectedInstallments.length === 0) {
      toast.error("Veuillez sélectionner au moins une échéance à payer")
      return
    }

    if (totalDistributedAmount > studentPaidAmount) {
      toast.error("Le montant total réparti ne peut pas dépasser le montant versé par l'élève")
      return
    }

    // Validate payment methods for each installment
    for (const installmentId of selectedInstallments) {
      if (!validatePaymentMethods(installmentId)) {
        toast.error(`La répartition des méthodes de paiement pour l'échéance ${installmentId} ne correspond pas au montant`)
        return
      }
    }

    // Create payment objects
    const paymentObjects: PaymentFormData[] = selectedInstallments.map((installmentId) => ({
      student_id: "0", // Will be updated after student creation
      installment_id: installmentId.toString(),
      cash_register_id: cashRegisterSessionCurrent?.cash_register.id.toString() || "",
      cashier_id: cashRegisterSessionCurrent?.user_id.toString() || "",
      amount: installmentAmounts[installmentId],
      transaction_id: "0", // Default transaction
      methods: (paymentMethods[installmentId] || []).map((method) => ({
        id: method.id,
        montant: method.amount.toString(),
      })),
    }))

    setPayments(paymentObjects)
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Comment ça marche ?</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Saisissez le montant total que l'élève verse aujourd'hui</p>
                <p>• Choisissez les échéances à payer avec ce montant</p>
                <p>• Le système répartira automatiquement le montant</p>
                <p>• Vous pouvez payer partiellement une échéance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Banknote className="w-5 h-5" />
            <span>Montant versé aujourd'hui</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-amount">Montant total versé (FCFA)</Label>
            <Input
              id="student-amount"
              type="number"
              value={studentPaidAmount || ''}
              onChange={(e) => {
                const value = e.target.value;
                setStudentPaidAmount(value === '' ? 0 : Number.parseInt(value, 10) || 0);
              }}
              placeholder="Ex: 50000"
              className="text-lg"
            />
          </div>

          {studentPaidAmount > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-3 rounded-md text-center">
                <p className="text-sm text-green-600">Montant versé</p>
                <p className="text-lg font-bold text-green-700">{studentPaidAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md text-center">
                <p className="text-sm text-blue-600">Montant réparti</p>
                <p className="text-lg font-bold text-blue-700">{totalDistributedAmount.toLocaleString()} FCFA</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-md text-center">
                <p className="text-sm text-orange-600">Reste à répartir</p>
                <p className="text-lg font-bold text-orange-700">
                  {(studentPaidAmount - totalDistributedAmount).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          )}

          {totalDue > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Total des frais de réinscription:</span> {totalDue.toLocaleString()} FCFA
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Distribution */}
      {studentPaidAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Répartition du paiement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {availablePricing.map((pricing) => (
              <div key={pricing.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">{pricing.label}</h4>
                  <Badge variant="outline">{Number.parseInt(pricing.amount).toLocaleString()} FCFA</Badge>
                </div>

                {pricing.installments && pricing.installments.length > 0 ? (
                  <div className="space-y-3">
                    {pricing.installments.map((installment) => (
                      <div key={installment.id} className="border rounded-md p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedInstallments.includes(installment.id)}
                              onCheckedChange={() => handleInstallmentToggle(installment.id)}
                            />
                            <div>
                              <p className="font-medium">{installment.status}</p>
                              <p className="text-sm text-gray-600">
                                {Number.parseInt(installment.amount_due).toLocaleString()} FCFA - Échéance:{" "}
                                {new Date(installment.due_date).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedInstallments.includes(installment.id) && (
                          <div className="ml-6 space-y-3 bg-gray-50 p-3 rounded">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Montant à payer</Label>
                                <Input
                                  type="number"
                                  value={installmentAmounts[installment.id] || ''}
                                  onChange={(e) =>
                                    handleAmountChange(installment.id, e.target.value)
                                  }
                                  max={Math.min(
                                    Number.parseInt(installment.amount_due),
                                    studentPaidAmount -
                                    totalDistributedAmount +
                                    (installmentAmounts[installment.id] || 0),
                                  )}
                                  placeholder="Montant"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Méthode de paiement</Label>
                                <Select
                                  value={(
                                    paymentMethods[installment.id]?.[0]?.id || methodPayment[2].id
                                  ).toString()}
                                  onValueChange={(value) =>
                                    updatePaymentMethod(installment.id, 0, "id", Number.parseInt(value))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {methodPayment.map((pm) => (
                                      <SelectItem key={pm.id} value={pm.id.toString()}>
                                        {pm.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {!validatePaymentMethods(installment.id) && (
                              <Alert color="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  Le montant de la méthode de paiement ne correspond pas au montant à payer
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune échéance définie pour cette tarification</p>
                )}
              </div>
            ))}

            {totalDistributedAmount > studentPaidAmount && (
              <Alert color="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Le montant total réparti ({totalDistributedAmount.toLocaleString()} FCFA) dépasse le montant versé par
                  l'élève ({studentPaidAmount.toLocaleString()} FCFA)
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Précédent
        </Button>
        <Button onClick={handleNext} disabled={studentPaidAmount === 0 || selectedInstallments.length === 0}>
          Suivant
        </Button>
      </div>
    </div>
  )
}
