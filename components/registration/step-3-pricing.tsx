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
import { useRegistrationStore } from "@/hooks/use-registration-store"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface Step3Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step3Pricing({ onNext, onPrevious }: Step3Props) {
  const { methodPayment, cashRegisterSessionCurrent } = useSchoolStore()
  const { setPaidAmount, setPayments, payments, paidAmount, availablePricing, setAvailablePricing } =
    useRegistrationStore()

  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([])
  const [installmentAmounts, setInstallmentAmounts] = useState<Record<number, number>>({})
  const [paymentMethods, setPaymentMethods] = useState<Record<number, Array<{ id: number; amount: number }>>>({})
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)
  const [givenAmount, setGivenAmount] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(methodPayment[0]?.id || 0)
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const allInstallments = availablePricing.flatMap((pricing) => pricing.installments || [])

  useEffect(() => {
    const total = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
    setTotalPaidAmount(total)
    setPaidAmount(total)
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
          [installmentId]: [{
            id: methodPayment[0]?.id || 0,
            amount: Number.parseInt(installment.amount_due)
          }],
        })
      }
    }
  }

  const handleAmountChange = (installmentId: number, amount: number | string) => {
    // Convertir une chaîne vide en 0, sinon convertir en nombre
    const numericAmount = amount === '' ? 0 : Number(amount) || 0;
    
    setInstallmentAmounts(prev => ({
      ...prev,
      [installmentId]: numericAmount,
    }))

    const currentMethods = paymentMethods[installmentId] || []
    if (currentMethods.length === 1) {
      setPaymentMethods(prev => ({
        ...prev,
        [installmentId]: [{ ...currentMethods[0], amount: numericAmount }],
      }))
    }
    setGivenAmount(prev => {
      const newAmounts = { ...installmentAmounts, [installmentId]: numericAmount };
      return Object.values(newAmounts).reduce((sum, amt) => sum + amt, 0);
    })
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
      toast.error("Veuillez sélectionner au moins une échéance", {
        position: "top-center",
        style: {
          background: "#fff",
          color: "#000",
        },
      })
      return
    }

    if (totalPaidAmount === 0) {
      toast.error("Le montant total versé doit être supérieur à 0", {
        position: "top-center",
      })
      return
    }

    if (givenAmount < totalPaidAmount) {
      setOpenConfirmModal(true)
      return
    }

    for (const installmentId of selectedInstallments) {
      if (!validatePaymentMethods(installmentId)) {
        toast.error(
          `La répartition des méthodes de paiement pour l'échéance ne correspond pas au montant`,
          {
            position: "top-center",
          }
        )
        return
      }
    }

    const paymentObjects: PaymentFormData[] = selectedInstallments.map((installmentId) => ({
      student_id: "0",
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

    setPayments(paymentObjects)
    onNext()
  }

  const handleConfirmPayment = () => {
    setOpenConfirmModal(false)
    const paymentObjects: PaymentFormData[] = selectedInstallments.map((installmentId) => ({
      student_id: "0",
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

    setPayments(paymentObjects)
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl font-bold tracking-tight">Paiement des frais scolaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="space-y-2"
            >
              <Label className="text-sm font-medium leading-none">Montant donné</Label>
              <Input
                type="number"
                value={givenAmount}
                onChange={(e) => setGivenAmount(Number(e.target.value) || 0)}
                min={totalPaidAmount}
                className="h-10"
              />
              <p className="text-sm text-muted-foreground">
                Minimum: {totalPaidAmount.toLocaleString()} FCFA
              </p>
            </motion.div>
          </div>

          {availablePricing.map((pricing) => (
            <motion.div
              key={pricing.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">
                  {pricing.fee_type.label} - {Number.parseInt(pricing.amount).toLocaleString()} FCFA
                </h4>
                <Badge color="secondary">
                  {pricing.installments?.length || 0} échéance{pricing.installments?.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {pricing.installments && pricing.installments.length > 0 ? (
                <div className="space-y-6">
                  <Separator />

                  {pricing.installments.map((installment) => (
                    <motion.div
                      key={installment.id}
                      whileHover={{ y: -2 }}
                      className="border rounded-md p-4 space-y-4"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`installment-${installment.id}`}
                          checked={selectedInstallments.includes(installment.id)}
                          onCheckedChange={() => handleInstallmentToggle(installment.id)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor={`installment-${installment.id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{installment.status}</span>
                            <span className="text-primary font-semibold">
                              {Number.parseInt(installment.amount_due).toLocaleString()} FCFA
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Échéance: {new Date(installment.due_date).toLocaleDateString("fr-FR")}
                          </p>
                        </Label>
                      </div>

                      {selectedInstallments.includes(installment.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="ml-8 space-y-6"
                        >
                          <div className="space-y-2">
                            <Label>Montant à verser</Label>
                            <Input
                              type="number"
                              value={installmentAmounts[installment.id] || ''}
                              onChange={(e) => handleAmountChange(installment.id, e.target.value)}
                              max={Number(installment.amount_due) || 0}
                              min={0}
                              className="h-10"
                            />
                            <Progress
                              value={
                                ((installmentAmounts[installment.id] || 0) /
                                Number.parseInt(installment.amount_due)) *
                                100
                              }
                              className="h-2"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>Méthodes de paiement</Label>
                            {(paymentMethods[installment.id] || []).map((method, index) => (
                              <motion.div
                                key={index}
                                layout
                                className="flex gap-3 items-center"
                              >
                                <Select
                                  value={method.id.toString()}
                                  onValueChange={(value) =>
                                    updatePaymentMethod(installment.id, index, "id", Number.parseInt(value))
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
                                <Input
                                  type="number"
                                  placeholder="Montant"
                                  value={method.amount || ''}
                                  onChange={(e) =>
                                    updatePaymentMethod(
                                      installment.id,
                                      index,
                                      "amount",
                                      e.target.value === '' ? 0 : (Number(e.target.value) || 0)
                                    )
                                  }
                                  className="w-32 h-10"
                                />
                                {(paymentMethods[installment.id] || []).length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removePaymentMethod(installment.id, index)}
                                    className="h-10"
                                  >
                                    Supprimer
                                  </Button>
                                )}
                              </motion.div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addPaymentMethod(installment.id)}
                              className="h-10"
                            >
                              Ajouter une méthode
                            </Button>

                            {!validatePaymentMethods(installment.id) && (
                              <Alert color="destructive" className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  La somme des méthodes ne correspond pas au montant à verser
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune échéance définie</p>
              )}
            </motion.div>
          ))}

          {totalPaidAmount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-skyblue-50 dark:bg-skyblue-900/20 p-6 rounded-lg border border-skyblue-200 dark:border-skyblue-800"
            >
              <h4 className="font-semibold text-lg mb-4">Récapitulatif</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total à payer</p>
                  <p className="text-xl font-bold text-primary">
                    {totalPaidAmount.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Montant donné</p>
                  <p className="text-xl font-bold">
                    {givenAmount.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monnaie à rendre</p>
                  <p className="text-xl font-bold">
                    {(givenAmount - totalPaidAmount).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <motion.div
        className="flex justify-between pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button variant="outline" onClick={onPrevious} className="h-10 px-6">
          Précédent
        </Button>
        <Button onClick={handleNext} className="h-10 px-6">
          Suivant
        </Button>
      </motion.div>

      {/* Confirmation Modal */}
      <Dialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Montant insuffisant</DialogTitle>
            <DialogDescription>
              Le montant donné est inférieur au montant total à payer. Voulez-vous vraiment continuer ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Détails du paiement</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total à payer</p>
                  <p className="font-medium">{totalPaidAmount.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant donné</p>
                  <p className="font-medium text-destructive">
                    {givenAmount.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <p className="font-semibold">
                Différence: {(totalPaidAmount - givenAmount).toLocaleString()} FCFA
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" color="destructive" onClick={() => setOpenConfirmModal(false)}>
              Annuler
            </Button>
            <Button color="indigodye" onClick={handleConfirmPayment}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}