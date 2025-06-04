"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchoolStore } from "@/store/index"
import type { PaymentFormData, PaymentMethod } from "@/lib/interface"
import { AlertTriangle } from "lucide-react"

interface Step3Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step3Pricing({ onNext, onPrevious }: Step3Props) {
  const { 
    methodPayment, 
    availablePricing, 
    paymentsForm, 
    setPaymentsForm, 
    paidAmount, 
    setPaidAmount, 
    cashRegisterSessionCurrent 
  } = useSchoolStore()

  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([])
  const [installmentAmounts, setInstallmentAmounts] = useState<Record<number, number>>({})
  const [paymentMethods, setPaymentMethods] = useState<Record<number, Array<{ id: number; amount: number }>>>({})
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)
  const [givenAmount, setGivenAmount] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(methodPayment[0]?.id || 0)

  // Get all installments from available pricing
  const allInstallments = availablePricing.flatMap((pricing) => pricing.installments || [])

  useEffect(() => {
    // Calculate total paid amount
    const total = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
    setTotalPaidAmount(total)
    setPaidAmount(total)
    // Set given amount to total by default
    setGivenAmount(total)
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
        setInstallmentAmounts({
          ...installmentAmounts,
          [installmentId]: Number.parseInt(installment.amount_due),
        })
        setPaymentMethods({
          ...paymentMethods,
          [installmentId]: [{ id: selectedPaymentMethod, amount: Number.parseInt(installment.amount_due) }],
        })
      }
    }
  }

  const handleAmountChange = (installmentId: number, amount: number) => {
    setInstallmentAmounts({
      ...installmentAmounts,
      [installmentId]: amount,
    })

    // Update payment methods to match new amount
    const currentMethods = paymentMethods[installmentId] || []
    if (currentMethods.length === 1) {
      setPaymentMethods({
        ...paymentMethods,
        [installmentId]: [{ ...currentMethods[0], amount }],
      })
    }
    // Update given amount to match the new total
    setGivenAmount(Object.values({...installmentAmounts, [installmentId]: amount}).reduce((sum, amount) => sum + amount, 0))
  }

  const addPaymentMethod = (installmentId: number) => {
    const currentMethods = paymentMethods[installmentId] || []
    setPaymentMethods({
      ...paymentMethods,
      [installmentId]: [...currentMethods, { id: selectedPaymentMethod, amount: 0 }],
    })
  }

  const removePaymentMethod = (installmentId: number, index: number) => {
    const currentMethods = paymentMethods[installmentId] || []
    setPaymentMethods({
      ...paymentMethods,
      [installmentId]: currentMethods.filter((_, i) => i !== index),
    })
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
    if (selectedInstallments.length === 0) {
      alert("Veuillez sélectionner au moins une échéance")
      return
    }

    if (totalPaidAmount === 0) {
      alert("Le montant total versé doit être supérieur à 0")
      return
    }

    if (givenAmount < totalPaidAmount) {
      alert("Le montant donné par l'élève doit être supérieur ou égal au montant total à payer")
      return
    }

    // Validate payment methods for each installment
    for (const installmentId of selectedInstallments) {
      if (!validatePaymentMethods(installmentId)) {
        alert(`La répartition des méthodes de paiement pour l'échéance ${installmentId} ne correspond pas au montant`)
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
      transaction_id: "0",
      methods: (paymentMethods[installmentId] || []).map((method) => ({
        id: method.id,
        montant: method.amount.toString(),
      })),
    }))

    setPaymentsForm(paymentObjects)
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choix de la tarification et options de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nouvelle section pour le montant donné et méthode de paiement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Montant donné par l'élève</Label>
              <Input
                type="number"
                value={givenAmount}
                onChange={(e) => setGivenAmount(Number(e.target.value) || 0)}
                min={totalPaidAmount}
              />
              <p className="text-sm text-muted-foreground">
                Le montant doit être supérieur ou égal au total à payer
              </p>
            </div>
            <div className="space-y-2">
              <Label>Méthode de paiement principale</Label>
              <Select
                value={selectedPaymentMethod.toString()}
                onValueChange={(value) => setSelectedPaymentMethod(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une méthode" />
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

          {availablePricing.map((pricing) => (
            <div key={pricing.id} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-4">
                {pricing.fee_type.label} - {Number.parseInt(pricing.amount).toLocaleString()} FCFA
              </h4>

              {pricing.installments && pricing.installments.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {pricing.installments.length === 1 ? "Paiement unique" : "Paiement par échéances"}
                  </p>

                  {pricing.installments.map((installment) => (
                    <div key={installment.id} className="border rounded-md p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedInstallments.includes(installment.id)}
                          onCheckedChange={() => handleInstallmentToggle(installment.id)}
                        />
                        <Label className="flex-1">
                          {installment.status} - {Number.parseInt(installment.amount_due).toLocaleString()} FCFA
                          <span className="text-sm text-gray-500 ml-2">
                            (Échéance: {new Date(installment.due_date).toLocaleDateString("fr-FR")})
                          </span>
                        </Label>
                      </div>

                      {selectedInstallments.includes(installment.id) && (
                        <div className="ml-6 space-y-4">
                          <div className="space-y-2">
                            <Label>Montant à verser</Label>
                            <Input
                              type="number"
                              value={installmentAmounts[installment.id] || 0}
                              onChange={(e) => handleAmountChange(installment.id, Number.parseInt(e.target.value) || 0)}
                              max={Number.parseInt(installment.amount_due)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Méthodes de paiement</Label>
                            {(paymentMethods[installment.id] || []).map((method, index) => (
                              <div key={index} className="flex space-x-2">
                                <Select
                                  value={method.id.toString()}
                                  onValueChange={(value) =>
                                    updatePaymentMethod(installment.id, index, "id", Number.parseInt(value))
                                  }
                                >
                                  <SelectTrigger className="flex-1">
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
                                <Input
                                  type="number"
                                  placeholder="Montant"
                                  value={method.amount}
                                  onChange={(e) =>
                                    updatePaymentMethod(
                                      installment.id,
                                      index,
                                      "amount",
                                      Number.parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-32"
                                />
                                {(paymentMethods[installment.id] || []).length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removePaymentMethod(installment.id, index)}
                                  >
                                    Supprimer
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button color="indigodye" variant="outline" size="sm" onClick={() => addPaymentMethod(installment.id)}>
                              Ajouter une méthode
                            </Button>

                            {!validatePaymentMethods(installment.id) && (
                              <Alert color="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  La somme des méthodes de paiement ne correspond pas au montant à verser
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
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

          {totalPaidAmount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold">Récapitulatif du paiement</h4>
              <p className="text-lg">
                Montant total à payer: <span className="font-bold">{totalPaidAmount.toLocaleString()} FCFA</span>
              </p>
              <p className="text-lg">
                Montant donné: <span className="font-bold">{givenAmount.toLocaleString()} FCFA</span>
              </p>
              <p className="text-lg">
                Monnaie à rendre: <span className="font-bold">{(givenAmount - totalPaidAmount).toLocaleString()} FCFA</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Précédent
        </Button>
        <Button onClick={handleNext}>Suivant</Button>
      </div>
    </div>
  )
}