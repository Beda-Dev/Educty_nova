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
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Step3Props {
  onNext: () => void
  onPrevious: () => void
}

export function Step3Pricing({ onNext, onPrevious }: Step3Props) {
  const { availablePricing, payments, setPayments, paidAmount, setPaidAmount } = useReinscriptionStore()
  const { cashRegisterSessionCurrent, methodPayment, settings } = useSchoolStore()

  const [studentPaidAmount, setStudentPaidAmount] = useState(0)

  // Synchronisation des montants répartis et méthodes de paiement quand studentPaidAmount change
  useEffect(() => {
    // Cas particulier : tout à zéro
    if (studentPaidAmount === 0) {
      setInstallmentAmounts({});
      setPaymentMethods({});
      setInstallmentErrors({});
      setGlobalError("");
      return;
    }
    let total = 0;
    let changed = false;
    let adjustedIds: number[] = [];
    const newInstallmentAmounts: Record<number, number> = {};
    const newPaymentMethods: Record<number, Array<{ id: number; amount: number }>> = {};
    const newInstallmentErrors: Record<number, string> = {};
    selectedInstallments.forEach((id) => {
      const prevRaw = installmentAmounts[id];
      const prev = typeof prevRaw === 'string' ? Number(prevRaw) || 0 : prevRaw || 0;
      let newVal = prev;
      if (total + prev > studentPaidAmount) {
        newVal = Math.max(0, studentPaidAmount - total);
        changed = true;
        adjustedIds.push(id);
        total = studentPaidAmount;
      } else {
        newVal = prev;
        total += prev;
      }
      newInstallmentAmounts[id] = newVal;
    
      // Recalcule précisément l'erreur locale
      if (newVal < 0) {
        newInstallmentErrors[id] = "Montant négatif non autorisé.";
      } else if (newVal === 0) {
        newInstallmentErrors[id] = "Veuillez saisir un montant positif.";
      } else {
        newInstallmentErrors[id] = "";
      }
    });
    if (changed) {
      setInstallmentAmounts(newInstallmentAmounts);
      
      toast("Certaines répartitions ont été ajustées car le montant total a été réduit.", { position: "top-center", icon: "⚠️" });
    }
    // Nettoie les erreurs globales si la somme devient correcte
    if (total <= studentPaidAmount && globalError) {
      setGlobalError("");
    }
    // Réinitialise ou met à jour précisément les erreurs locales
    setInstallmentErrors(newInstallmentErrors);
  }, [studentPaidAmount]);
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([])
  const [installmentAmounts, setInstallmentAmounts] = useState<Record<number, number>>({})
  const [paymentMethods, setPaymentMethods] = useState<Record<number, Array<{ id: number; amount: number }>>>({})
  const [totalDistributedAmount, setTotalDistributedAmount] = useState(0)
  const [openConfirmModal, setOpenConfirmModal] = useState(false)
  const [installmentErrors, setInstallmentErrors] = useState<Record<number, string>>({})
  const [globalError, setGlobalError] = useState("")
  const currency = (settings && settings[0]?.currency) || 'FCFA';

  const allInstallments = availablePricing.flatMap((pricing) => pricing.installments || [])
  const totalDue = availablePricing.reduce((sum, pricing) => sum + Number.parseInt(pricing.amount), 0)

  // Ajout du recalcul automatique et nettoyage des erreurs
  useEffect(() => {
    // Recalcule le total distribué
    const total = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
    setTotalDistributedAmount(total)
    setPaidAmount(total)

    // Vérifie la cohérence des montants méthodes/échéances
    const newErrors: Record<number, string> = {};
    let hasGlobalError = false;
    Object.entries(paymentMethods).forEach(([installmentId, methods]) => {
      const totalMethodAmount = methods.reduce((sum, method) => sum + method.amount, 0);
      const installmentAmount = installmentAmounts[Number(installmentId)] || 0;
      if (Math.abs(totalMethodAmount - installmentAmount) > 0.01) {
        newErrors[Number(installmentId)] =
          `La somme des méthodes (${totalMethodAmount}) ne correspond pas au montant de l'échéance (${installmentAmount}).`;
        hasGlobalError = true;
      } else {
        newErrors[Number(installmentId)] = '';
      }
    });
    setInstallmentErrors(newErrors);

    // Nettoie l'erreur globale si la somme est correcte
    if (!hasGlobalError && globalError) {
      setGlobalError('');
    }
  }, [installmentAmounts, paymentMethods, setPaidAmount])

  // Vérification de l'absence de méthodes de paiement
  const noPaymentMethod = !methodPayment || methodPayment.length === 0;

  const handleInstallmentToggle = (installmentId  : number) => {
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
          [installmentId]: [{ id: methodPayment[0].id, amount: Math.max(0, defaultAmount) }],
        })
      }
    }
  }

// Remplacer la fonction handleAmountChange
const handleAmountChange = (installmentId: number, amount: number | string) => {
  const numericAmount = amount === '' ? 0 : Number(amount) || 0;
  
  // Vérifier si le montant est valide
  if (numericAmount < 0) {
    setInstallmentErrors(prev => ({
      ...prev,
      [installmentId]: "Le montant ne peut pas être négatif"
    }));
    return;
  }

  const totalSansActuel = Object.entries(installmentAmounts)
    .filter(([id]) => Number(id) !== installmentId)
    .reduce((sum, [, amt]) => sum + amt, 0);

  const nouveauTotal = totalSansActuel + numericAmount;

  if (nouveauTotal > studentPaidAmount) {
    setGlobalError("La somme répartie dépasse le montant donné.");
    return;
  } else {
    setGlobalError("");
  }

  // Mettre à jour le montant de l'échéance
  const newAmounts = {
    ...installmentAmounts,
    [installmentId]: numericAmount
  };
  
  setInstallmentAmounts(newAmounts);

  // Mettre à jour les méthodes de paiement
  const currentMethods = paymentMethods[installmentId] || [];
  if (currentMethods.length === 1) {
    const updatedMethods = [{
      ...currentMethods[0],
      amount: numericAmount
    }];
    
    setPaymentMethods(prev => ({
      ...prev,
      [installmentId]: updatedMethods
    }));

    // Vérifier la cohérence
    const totalMethodAmount = updatedMethods.reduce((sum, m) => sum + m.amount, 0);
    setInstallmentErrors(prev => ({
      ...prev,
      [installmentId]: totalMethodAmount !== numericAmount
        ? `La somme des méthodes (${totalMethodAmount}) ne correspond pas au montant de l'échéance (${numericAmount}).`
        : ''
    }));
  }

  // Mettre à jour le montant total distribué
  const newTotalDistributed = Object.values({
    ...installmentAmounts,
    [installmentId]: numericAmount
  }).reduce((sum, amt) => sum + amt, 0);
  
  setTotalDistributedAmount(newTotalDistributed);
  setPaidAmount(newTotalDistributed);
}

  const addPaymentMethod = (installmentId: number) => {
    const currentMethods = paymentMethods[installmentId] || []
    setPaymentMethods({
      ...paymentMethods,
      [installmentId]: [...currentMethods, { id: methodPayment[0]?.id || 0, amount: 0 }],
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
    const totalMethodAmount = updatedMethods.reduce((sum, method) => sum + method.amount, 0)
    const installmentAmount = installmentAmounts[installmentId] || 0
    setInstallmentErrors(prev => ({
      ...prev,
      [installmentId]: totalMethodAmount !== installmentAmount
        ? `La somme des méthodes (${totalMethodAmount}) ne correspond pas au montant de l'échéance (${installmentAmount}).`
        : ''
    }))
  }

  // Vérifie que les méthodes de paiement sont valides et complètes pour une échéance donnée
  const validatePaymentMethods = (installmentId: number): boolean => {
    const methods = paymentMethods[installmentId] || []
    if (methods.length === 0) return false // aucune méthode

    // toutes les méthodes doivent avoir un id valide et un montant positif
    for (const m of methods) {
      if (!m.id || m.amount <= 0 || Number.isNaN(m.amount)) return false
    }

    const totalMethodAmount = methods.reduce((sum, method) => sum + method.amount, 0)
    const installmentAmount = installmentAmounts[installmentId] || 0
    return totalMethodAmount === installmentAmount
  }

  const handleNext = () => {
    if (studentPaidAmount === 0) {
      toast.error("Veuillez saisir le montant versé par l'élève", {
        position: "top-center",
      })
      return
    }

    if (selectedInstallments.length === 0) {
      toast.error("Veuillez sélectionner au moins une échéance à payer", {
        position: "top-center",
      })
      return
    }

    if (studentPaidAmount < totalDistributedAmount) {
      toast.error("Le montant donné doit être au moins égal au total à payer pour pouvoir continuer.", {
        position: "top-center",
      })
      return
    }

    if (totalDistributedAmount > studentPaidAmount) {
      toast.error("Le montant total réparti ne peut pas dépasser le montant versé par l'élève", {
        position: "top-center",
      })
      return
    }

    for (const installmentId of selectedInstallments) {
      if (!validatePaymentMethods(installmentId)) {
        toast.error(`Veuillez choisir des méthodes de paiement valides pour l'échéance ${installmentId}`, {
          position: "top-center",
        })
        return
      }
    }

    if (studentPaidAmount < totalDistributedAmount) {
      setOpenConfirmModal(true)
      return
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
          <CardTitle className="text-2xl font-bold tracking-tight">Paiement des frais de réinscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Affichage d'une alerte si aucune méthode de paiement n'est définie */}
          {noPaymentMethod && (
            <Alert color="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Aucune méthode de paiement n'est définie dans les paramètres. Veuillez en ajouter une avant de continuer.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="space-y-2"
            >
              <Label className="text-sm font-medium leading-none">Montant versé par l'élève</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9 ]*"
                value={studentPaidAmount ? studentPaidAmount.toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setStudentPaidAmount(raw ? Number(raw) : 0);
                }}
                min={totalDistributedAmount}
                className="h-10 no-spinner"
                autoComplete="off"
                style={{ MozAppearance: 'textfield' }}
              />
              <style jsx global>{`
                input.no-spinner::-webkit-outer-spin-button,
                input.no-spinner::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                input.no-spinner[type=text] {
                  appearance: textfield;
                  -moz-appearance: textfield;
                }
              `}</style>
              <p className="text-sm text-muted-foreground">
                Minimum: {totalDistributedAmount.toLocaleString()} {currency}
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
                  {pricing.label} - {Number.parseInt(pricing.amount).toLocaleString()} {currency}
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
                            <span className="text-skyblue font-semibold">
                              {Number.parseInt(installment.amount_due).toLocaleString()} {currency}
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
                            <div className="flex items-center space-x-2">
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9 ]*"
                                value={installmentAmounts[installment.id] ? installmentAmounts[installment.id].toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  handleAmountChange(installment.id, raw ? Number(raw) : '');
                                }}
                                max={Number(installment.amount_due) || 0}
                                min={0}
                                className="h-10 no-spinner"
                                autoComplete="off"
                                style={{ MozAppearance: 'textfield' }}
                                placeholder={`Montant (${currency})`}
                              />
                              <span className="text-gray-500 text-sm">{currency}</span>
                            </div>
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
                            {/* Désactive l'ajout si aucune méthode n'est dispo */}
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
                                  disabled={noPaymentMethod}
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
                                  type="text"
                                  placeholder="Montant"
                                  inputMode="numeric"
                                  pattern="[0-9 ]*"
                                  value={method.amount ? method.amount.toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                                  onChange={e => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    updatePaymentMethod(
                                      installment.id,
                                      index,
                                      "amount",
                                      raw ? Number(raw) : 0
                                    );
                                  }}
                                  className="w-32 h-10 no-spinner"
                                  autoComplete="off"
                                  style={{ MozAppearance: 'textfield' }}
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
                              disabled={noPaymentMethod}
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

          {totalDistributedAmount > 0 && (
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
                  <p className="text-xl font-bold text-skyblue">
                    {totalDistributedAmount.toLocaleString()} {currency}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Montant donné</p>
                  <p className="text-xl font-bold">
                    {studentPaidAmount.toLocaleString()} {currency}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monnaie à rendre</p>
                  <p className="text-xl font-bold">
                    0 {currency}
                  </p>
                </div>
              </div>
              {/* Affiche un message si la monnaie à rendre n'est pas 0 */}
              {studentPaidAmount - totalDistributedAmount !== 0 && (
                <Alert color="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Attention : la monnaie à rendre doit toujours être 0. Vérifiez les montants saisis.
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {studentPaidAmount < totalDistributedAmount ? (
        <motion.div
          className="flex justify-between pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
            <Button variant="outline" onClick={onPrevious} className="h-10 px-6">
              Précédent
            </Button>
            <Button onClick={handleNext} className="h-10 px-6" disabled={
                !!globalError ||
                Object.values(installmentErrors).some((err) => !!err) ||
                studentPaidAmount < totalDistributedAmount ||
                noPaymentMethod
              }>
                Suivant
              </Button>
        </motion.div>
      ) : (
        <motion.div
          className="flex justify-between pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="outline" onClick={onPrevious} className="h-10 px-6">
            Précédent
          </Button>
          <Button onClick={handleNext} className="h-10 px-6" disabled={
            !!globalError ||
            Object.values(installmentErrors).some((err) => !!err) ||
            studentPaidAmount < totalDistributedAmount ||
            noPaymentMethod
          }>
            Suivant
          </Button>
        </motion.div>
      )}

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
                  <p className="font-medium">{totalDistributedAmount.toLocaleString()} {currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant donné</p>
                  <p className="font-medium text-destructive">
                    {studentPaidAmount.toLocaleString()} {currency}
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <p className="font-semibold">
                Différence: {(totalDistributedAmount - studentPaidAmount).toLocaleString()} {currency}
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