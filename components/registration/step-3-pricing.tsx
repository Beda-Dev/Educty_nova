"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Fonction utilitaire pour formater les nombres avec séparateurs de milliers
const formatNumber = (value: string): string => {
  const num = value.replace(/\D/g, '');
  return num ? parseInt(num, 10).toLocaleString('fr-FR') : '';
};

// Fonction pour convertir la valeur formatée en nombre
const parseFormattedNumber = (formatted: string): string => {
  return formatted.replace(/\s/g, '');
};
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchoolStore } from "@/store/index"
import type { PaymentFormData, PaymentMethod } from "@/lib/interface"
import { AlertTriangle, Percent, DollarSign, Info, Tag, ArrowDownCircle, CheckCircle2, X } from "lucide-react"
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

// Types stricts pour la gestion des remises
interface DiscountValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface PaymentValidation {
  isValid: boolean
  errors: string[]
  canProceed: boolean
}

export function Step3Pricing({ onNext, onPrevious }: Step3Props) {
  const { methodPayment, cashRegisterSessionCurrent } = useSchoolStore()
  const { setPaidAmount, setPayments, payments, paidAmount, availablePricing, setAvailablePricing, setDiscounts } =
    useRegistrationStore()

  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([])
  const [installmentAmounts, setInstallmentAmounts] = useState<Record<number, number>>({})
  const [paymentMethods, setPaymentMethods] = useState<Record<number, Array<{ id: number; amount: number }>>>({})
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0)
  const { settings } = useSchoolStore();
  const currency = (settings && settings[0]?.currency) || 'FCFA';

  // Gestion stricte des remises avec validation
  const [selectedPricingId, setSelectedPricingId] = useState<number | null>(null)
  const [discountAmount, setDiscountAmount] = useState<string>("")
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0)
  const [discountValidation, setDiscountValidation] = useState<DiscountValidation>({
    isValid: true,
    errors: [],
    warnings: []
  })

  // Montant donné avec validation stricte
  const [givenAmount, setGivenAmount] = useState<number>(0)
  const [paymentValidation, setPaymentValidation] = useState<PaymentValidation>({
    isValid: true,
    errors: [],
    canProceed: true
  })

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(methodPayment[0]?.id || 0)
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false)
  const [showDiscountConfirmModal, setShowDiscountConfirmModal] = useState<boolean>(false)
  const [installmentErrors, setInstallmentErrors] = useState<Record<number, string>>({})
  const [globalError, setGlobalError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exceedsDiscountedPrice, setExceedsDiscountedPrice] = useState(false)

  const allInstallments = availablePricing.flatMap((pricing) => pricing.installments || [])

  // Fonction utilitaire pour la validation des montants
  const validateAmount = useCallback((amount: string | number): { value: number; isValid: boolean; error?: string } => {
    const numValue = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numValue)) {
      return { value: 0, isValid: false, error: "Montant invalide" }
    }

    if (numValue < 0) {
      return { value: 0, isValid: false, error: "Le montant ne peut pas être négatif" }
    }

    // Vérifier les décimales (max 2)
    const decimalPlaces = numValue.toString().split('.')[1]?.length || 0
    if (decimalPlaces > 2) {
      return { value: Math.round(numValue * 100) / 100, isValid: true, error: "Montant arrondi à 2 décimales" }
    }

    return { value: numValue, isValid: true }
  }, [])

  // Calcul des totaux avec validation stricte
  const calculateTotals = useCallback(() => {
    const totalTariffs = availablePricing.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const totalAfterDiscount = totalTariffs - appliedDiscount
    const totalSelected = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
    const remainingAmount = Math.max(totalAfterDiscount - totalSelected, 0)
    const changeAmount = Math.max(givenAmount - totalSelected, 0)

    return {
      totalTariffs,
      totalAfterDiscount,
      totalSelected,
      remainingAmount,
      changeAmount,
      isOverpaid: totalSelected > totalAfterDiscount,
      isUnderpaid: totalSelected < totalAfterDiscount && totalSelected > 0
    }
  }, [availablePricing, appliedDiscount, installmentAmounts, givenAmount])

  // Validation stricte des remises
  const validateDiscount = useCallback((pricingId: number | null, amount: string): DiscountValidation => {
    const validation: DiscountValidation = { isValid: true, errors: [], warnings: [] }

    if (!pricingId || !amount) {
      return validation
    }

    const selectedPricing = availablePricing.find(p => p.id === pricingId)
    if (!selectedPricing) {
      validation.isValid = false
      validation.errors.push("Tarification sélectionnée non trouvée")
      return validation
    }

    const pricingAmount = parseFloat(selectedPricing.amount)
    const discountValue = parseFloat(amount)

    if (isNaN(pricingAmount) || pricingAmount <= 0) {
      validation.isValid = false
      validation.errors.push("Montant de la tarification invalide")
      return validation
    }

    if (isNaN(discountValue)) {
      validation.isValid = false
      validation.errors.push("Montant de remise invalide")
      return validation
    }

    if (discountValue < 0) {
      validation.isValid = false
      validation.errors.push("La remise ne peut pas être négative")
      return validation
    }

    if (discountValue > pricingAmount) {
      validation.isValid = false
      validation.errors.push(`La remise (${discountValue.toLocaleString()} ${currency}) ne peut pas dépasser le montant de la tarification (${pricingAmount.toLocaleString()} ${currency})`)
      return validation
    }

    // Avertissements pour des remises importantes
    const discountPercentage = (discountValue / pricingAmount) * 100
    if (discountPercentage > 50) {
      validation.warnings.push(`Remise importante: ${discountPercentage.toFixed(1)}% du montant total`)
    }

    if (discountPercentage > 90) {
      validation.warnings.push("Remise supérieure à 90% - Vérifiez l'exactitude")
    }

    return validation
  }, [availablePricing, currency])

  // Validation des paiements
  const validatePayments = useCallback((): PaymentValidation => {
    const validation: PaymentValidation = { isValid: true, errors: [], canProceed: true }
    const totals = calculateTotals()

    // Vérifier si la somme des échéances dépasse le montant après remise
    if (selectedPricingId && appliedDiscount > 0) {
      const selectedPricing = availablePricing.find(p => p.id === selectedPricingId)
      if (selectedPricing && selectedPricing.installments) {
        const pricingAmount = parseFloat(selectedPricing.amount)
        const discountedAmount = pricingAmount - appliedDiscount
        
        // Filtrer uniquement les échéances qui appartiennent au pricing sélectionné
        const pricingInstallmentIds = new Set(selectedPricing.installments.map(i => i.id))
        const pricingInstallmentsTotal = Object.entries(installmentAmounts)
          .filter(([installmentId]) => pricingInstallmentIds.has(Number(installmentId)))
          .reduce((sum, [, amount]) => sum + amount, 0)
        
        if (pricingInstallmentsTotal > discountedAmount) {
          setExceedsDiscountedPrice(true)
          validation.errors.push(`La somme des échéances (${pricingInstallmentsTotal.toLocaleString()} ${currency}) dépasse le montant après remise (${discountedAmount.toLocaleString()} ${currency})`)
          validation.canProceed = false
          validation.isValid = false
          
          toast.error(`Erreur: La somme des échéances dépasse le montant après remise (${discountedAmount.toLocaleString()} ${currency})`, {
            duration: 5000,
            style: {
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            },
          })
        } else {
          setExceedsDiscountedPrice(false)
        }
      }
    }

    if (selectedInstallments.length === 0) {
      validation.errors.push("Aucune échéance sélectionnée")
      validation.canProceed = false
      validation.isValid = false
    }

    if (totals.totalSelected === 0) {
      validation.errors.push("Le montant total à payer doit être supérieur à 0")
      validation.canProceed = false
      validation.isValid = false
    }

    if (totals.isOverpaid) {
      validation.errors.push(`Le montant payé (${totals.totalSelected.toLocaleString()} ${currency}) dépasse le montant dû après remise (${totals.totalAfterDiscount.toLocaleString()} ${currency})`)
      validation.canProceed = false
      validation.isValid = false
    }

    if (givenAmount < totals.totalSelected) {
      validation.errors.push(`Le montant donné (${givenAmount.toLocaleString()} ${currency}) est insuffisant pour couvrir le montant à payer (${totals.totalSelected.toLocaleString()} ${currency})`)
      validation.canProceed = false
      validation.isValid = false
    }

    // Vérifier les méthodes de paiement pour chaque échéance
    for (const installmentId of selectedInstallments) {
      const methods = paymentMethods[installmentId] || []
      const installmentAmount = installmentAmounts[installmentId] || 0

      if (methods.length === 0) {
        validation.errors.push(`Aucune méthode de paiement définie pour une échéance`)
        validation.canProceed = false
        continue
      }

      const totalMethodAmount = methods.reduce((sum, method) => sum + method.amount, 0)
      if (Math.abs(totalMethodAmount - installmentAmount) > 0.01) {
        validation.errors.push(`Montant des méthodes de paiement incohérent pour une échéance`)
        validation.canProceed = false
        validation.isValid = false
      }

      // Vérifier que chaque méthode est valide
      for (const method of methods) {
        if (!method.id || method.amount <= 0) {
          validation.errors.push(`Méthode de paiement invalide détectée`)
          validation.canProceed = false
          validation.isValid = false
        }
      }
    }

    return validation
  }, [selectedInstallments, installmentAmounts, paymentMethods, givenAmount, calculateTotals, currency])

  // Gestion des remises avec validation stricte
  useEffect(() => {
    const validation = validateDiscount(selectedPricingId, discountAmount)
    setDiscountValidation(validation)

    if (validation.isValid && selectedPricingId && discountAmount) {
      const selectedPricing = availablePricing.find(p => p.id === selectedPricingId)
      const pricingAmount = selectedPricing ? parseFloat(selectedPricing.amount) : 0
      const discount = parseFloat(discountAmount)

      if (!isNaN(discount) && !isNaN(pricingAmount) && discount >= 0 && discount <= pricingAmount) {
        const percentage = pricingAmount > 0 ? ((discount / pricingAmount) * 100).toFixed(2) : '0.00'

        setAppliedDiscount(discount)
        setDiscounts(discountAmount, percentage, selectedPricingId)

        // Vérifier si le paiement dépasse le nouveau montant dû
        const totals = calculateTotals()
        if (totals.isOverpaid) {
          toast.error(`Le montant payé dépasse le montant dû après remise`)
        }
      } else {
        setAppliedDiscount(0)
        setDiscounts(null, null, null)
      }
    } else {
      setAppliedDiscount(0)
      setDiscounts(null, null, null)
    }
  }, [selectedPricingId, discountAmount, availablePricing, validateDiscount, setDiscounts, calculateTotals])

  // Validation des paiements en temps réel
  useEffect(() => {
    const validation = validatePayments()
    setPaymentValidation(validation)
  }, [validatePayments])

  // Synchronisation du montant total
  useEffect(() => {
    const total = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
    setTotalPaidAmount(total)
    setPaidAmount(total)
  }, [installmentAmounts, setPaidAmount])

  // Gestion stricte des échéances sélectionnées
  const handleInstallmentToggle = useCallback((installmentId: number) => {
    const installment = allInstallments.find((i) => i.id === installmentId)
    if (!installment) {
      toast.error("Échéance non trouvée")
      return
    }

    if (selectedInstallments.includes(installmentId)) {
      setSelectedInstallments(prev => prev.filter((id) => id !== installmentId))

      setInstallmentAmounts(prev => {
        const newAmounts = { ...prev }
        delete newAmounts[installmentId]
        return newAmounts
      })

      setPaymentMethods(prev => {
        const newMethods = { ...prev }
        delete newMethods[installmentId]
        return newMethods
      })
    } else {
      const amountDue = parseFloat(installment.amount_due)
      if (isNaN(amountDue) || amountDue < 0) {
        toast.error("Montant de l'échéance invalide")
        return
      }

      setSelectedInstallments(prev => [...prev, installmentId])
      setInstallmentAmounts(prev => ({ ...prev, [installmentId]: amountDue }))

      if (methodPayment.length > 0) {
        setPaymentMethods(prev => ({
          ...prev,
          [installmentId]: [{ id: methodPayment[0].id, amount: amountDue }]
        }))
      }
    }
  }, [allInstallments, selectedInstallments, methodPayment])

  // Gestion stricte des changements de montant
  const handleAmountChange = useCallback((installmentId: number, amount: string | number) => {
    const validation = validateAmount(amount)

    if (!validation.isValid && validation.error) {
      toast.error(validation.error)
      return
    }

    const totals = calculateTotals()
    const currentAmount = installmentAmounts[installmentId] || 0
    const newTotalWithoutCurrent = totals.totalSelected - currentAmount + validation.value

    if (newTotalWithoutCurrent > totals.totalAfterDiscount) {
      toast.error("Le montant total dépasserait le montant dû après remise")
      return
    }

    setInstallmentAmounts(prev => ({ ...prev, [installmentId]: validation.value }))

    // Mettre à jour la méthode de paiement si une seule existe
    const currentMethods = paymentMethods[installmentId] || []
    if (currentMethods.length === 1) {
      setPaymentMethods(prev => ({
        ...prev,
        [installmentId]: [{ ...currentMethods[0], amount: validation.value }]
      }))
    }
  }, [validateAmount, calculateTotals, installmentAmounts, paymentMethods])

  // Gestion des méthodes de paiement avec validation
  const addPaymentMethod = useCallback((installmentId: number) => {
    if (methodPayment.length === 0) {
      toast.error("Aucune méthode de paiement disponible")
      return
    }

    const currentMethods = paymentMethods[installmentId] || []
    setPaymentMethods(prev => ({
      ...prev,
      [installmentId]: [...currentMethods, { id: selectedPaymentMethod, amount: 0 }]
    }))
  }, [paymentMethods, selectedPaymentMethod, methodPayment])

  const removePaymentMethod = useCallback((installmentId: number, index: number) => {
    const currentMethods = paymentMethods[installmentId] || []
    if (currentMethods.length <= 1) {
      toast.error("Au moins une méthode de paiement est requise")
      return
    }

    setPaymentMethods(prev => ({
      ...prev,
      [installmentId]: currentMethods.filter((_, i) => i !== index)
    }))
  }, [paymentMethods])

  const updatePaymentMethod = useCallback((installmentId: number, index: number, field: "id" | "amount", value: number) => {
    if (field === "amount") {
      const validation = validateAmount(value)
      if (!validation.isValid && validation.error) {
        toast.error(validation.error)
        return
      }
      value = validation.value
    }

    const currentMethods = paymentMethods[installmentId] || []
    const updatedMethods = currentMethods.map((method, i) =>
      i === index ? { ...method, [field]: value } : method
    )

    setPaymentMethods(prev => ({ ...prev, [installmentId]: updatedMethods }))
  }, [paymentMethods, validateAmount])

  // Gestion stricte du montant donné
  const handleGivenAmountChange = useCallback((value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    const numericValue = cleanValue ? parseInt(cleanValue, 10) : 0

    const totals = calculateTotals()
    if (numericValue < totals.totalSelected && totals.totalSelected > 0) {
      
      toast("Le montant donné est inférieur au montant à payer", {
        icon: '⚠️',
        // Optional: add custom styles or duration
        style: {
          background: '#fff3cd',
          color: '#856404',
        },
        duration: 4000
      })
    }

    setGivenAmount(numericValue)
  }, [calculateTotals])

  // Procédure de confirmation et progression
  const confirmAndProceed = useCallback(() => {
    const validation = validatePayments()
    if (!validation.canProceed) {
      toast.error("Impossible de continuer: " + (validation.errors[0] || "Erreur inconnue"))
      return false
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
    setShowDiscountConfirmModal(false)
    onNext()
    return true
  }, [validatePayments, selectedInstallments, installmentAmounts, paymentMethods, cashRegisterSessionCurrent, setPayments, onNext])

  const handleNext = useCallback(() => {
    if (!cashRegisterSessionCurrent) {
      toast.error("Aucune caisse n'est ouverte. Veuillez ouvrir une caisse avant de continuer.")
      return
    }

    const validation = validatePayments()
    setPaymentValidation(validation)

    if (!validation.canProceed || exceedsDiscountedPrice) {
      return
    }

    // console.log(`montant reduction : ${appliedDiscount}`)

    // Si une remise est appliquée, on affiche la modale de confirmation
    if (appliedDiscount > 0) {
      setShowDiscountConfirmModal(true)
    } else {
      // Sinon on procède directement
      confirmAndProceed()
    }
  }, [cashRegisterSessionCurrent, validatePayments, exceedsDiscountedPrice, onNext])

  const noPaymentMethod = !methodPayment || methodPayment.length === 0
  const totals = calculateTotals()

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

          {/* Alerte méthodes de paiement */}
          {noPaymentMethod && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Aucune méthode de paiement n'est définie dans les paramètres. Veuillez en ajouter une avant de continuer.
              </AlertDescription>
            </Alert>
          )}

          {/* Montant donné */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="space-y-2"
            >
              <Label className="text-sm font-medium leading-none">Montant donné</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={givenAmount ? givenAmount.toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                onChange={e => handleGivenAmountChange(e.target.value)}
                className="h-10 no-spinner"
                autoComplete="off"
              />
              <p className="text-sm text-muted-foreground">
                Minimum requis: {totals.totalSelected.toLocaleString()} {currency}
              </p>
            </motion.div>
          </div>

          {/* Section Remise améliorée */}
          {availablePricing.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-center gap-2 mb-4">
                <Percent className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-lg">Remise (optionnel)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Frais concerné</Label>
                  <Select
                    value={selectedPricingId?.toString() || ""}
                    onValueChange={(value) => setSelectedPricingId(value ? parseInt(value, 10) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une tarification" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePricing.map((pricing) => (
                        <SelectItem key={pricing.id} value={pricing.id.toString()}>
                          {pricing.fee_type.label} - {parseFloat(pricing.amount).toLocaleString()} {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Montant de la remise</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={discountAmount ? formatNumber(discountAmount) : ''}
                      onChange={(e) => {
                        // Supprime tous les caractères non numériques
                        const raw = e.target.value.replace(/\D/g, '');
                        setDiscountAmount(raw);
                      }}
                      placeholder="0"
                      disabled={!selectedPricingId}
                      className="h-10 no-spinner"
                      autoComplete="off"
                    />
                    <span className="text-gray-500 text-sm">{currency}</span>
                  </div>

                  {/* Messages de validation des remises */}
                  {!discountValidation.isValid && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {discountValidation.errors[0]}
                      </AlertDescription>
                    </Alert>
                  )}

                  {discountValidation.warnings.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {discountValidation.warnings[0]}
                      </AlertDescription>
                    </Alert>
                  )}

                  {selectedPricingId && discountAmount && discountValidation.isValid && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Montant de la remise: {parseFloat(discountAmount).toLocaleString()} {currency}
                      </p>
                      {(() => {
                        const selectedPricing = availablePricing.find(p => p.id === selectedPricingId)
                        const pricingAmount = selectedPricing ? parseFloat(selectedPricing.amount) : 0
                        const percent = pricingAmount > 0
                          ? ((parseFloat(discountAmount) / pricingAmount) * 100).toFixed(2)
                          : '0.00'

                        return (
                          <p className="text-xs text-muted-foreground">
                            Soit {percent}% du montant total
                          </p>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {appliedDiscount > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Remise appliquée: -{appliedDiscount.toLocaleString()} {currency}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Messages d'erreur de validation */}
          {!paymentValidation.isValid && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {paymentValidation.errors[0]}
              </AlertDescription>
            </Alert>
          )}

          {/* Tarifications et échéances */}
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
                  {pricing.fee_type.label} - {parseFloat(pricing.amount).toLocaleString()} {currency}
                  {selectedPricingId === pricing.id && appliedDiscount > 0 && (
                    <span className="ml-2 text-sm text-green-600 font-normal">
                      (Après remise: {(parseFloat(pricing.amount) - appliedDiscount).toLocaleString()} {currency})
                    </span>
                  )}
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
                            <span className="text-blue-600 font-semibold">
                              {parseFloat(installment.amount_due).toLocaleString()} {currency}
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
                                pattern="[0-9]*"
                                value={installmentAmounts[installment.id] ?
                                  installmentAmounts[installment.id].toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, '')
                                  handleAmountChange(installment.id, raw ? parseInt(raw, 10) : 0)
                                }}
                                max={parseFloat(installment.amount_due)}
                                min={0}
                                className="h-10 no-spinner"
                                autoComplete="off"
                                placeholder={`Montant (${currency})`}
                              />
                              <span className="text-gray-500 text-sm">{currency}</span>
                            </div>
                            <Progress
                              value={
                                ((installmentAmounts[installment.id] || 0) /
                                  parseFloat(installment.amount_due)) *
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
                                    updatePaymentMethod(installment.id, index, "id", parseInt(value, 10))
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
                                  pattern="[0-9]*"
                                  value={method.amount ? method.amount.toLocaleString('fr-FR').replace(/,/g, ' ') : ''}
                                  onChange={e => {
                                    const raw = e.target.value.replace(/\D/g, '')
                                    updatePaymentMethod(
                                      installment.id,
                                      index,
                                      "amount",
                                      raw ? parseInt(raw, 10) : 0
                                    )
                                  }}
                                  className="w-32 h-10 no-spinner"
                                  autoComplete="off"
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

                            {/* Validation des méthodes de paiement */}
                            {(() => {
                              const methods = paymentMethods[installment.id] || []
                              const totalMethodAmount = methods.reduce((sum, method) => sum + method.amount, 0)
                              const installmentAmount = installmentAmounts[installment.id] || 0
                              const isValid = Math.abs(totalMethodAmount - installmentAmount) <= 0.01

                              return !isValid && installmentAmount > 0 && (
                                <Alert>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    La somme des méthodes ({totalMethodAmount.toLocaleString()} {currency}) ne correspond pas au montant à verser ({installmentAmount.toLocaleString()} {currency})
                                  </AlertDescription>
                                </Alert>
                              )
                            })()}
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

          {/* Récapitulatif amélioré */}
          {totals.totalSelected > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <h4 className="font-semibold text-lg mb-4">Récapitulatif des paiements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total des frais</p>
                  <p className="text-xl font-bold text-blue-600">
                    {totals.totalTariffs.toLocaleString()} {currency}
                  </p>
                  {appliedDiscount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Avant remise
                    </p>
                  )}
                </div>

                {appliedDiscount > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Remise appliquée</p>
                    <p className="text-xl font-bold text-green-600">
                      -{appliedDiscount.toLocaleString()} {currency}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {appliedDiscount > 0 ? "Total après remise" : "Total à payer"}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {totals.totalAfterDiscount.toLocaleString()} {currency}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Montant versé</p>
                  <p className="text-xl font-bold">
                    {totals.totalSelected.toLocaleString()} {currency}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Montant donné</p>
                  <p className="text-xl font-bold">
                    {givenAmount.toLocaleString()} {currency}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reste à payer</p>
                  <p className={`text-xl font-bold ${totals.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {totals.remainingAmount.toLocaleString()} {currency}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monnaie à rendre</p>
                  <p className={`text-xl font-bold ${totals.changeAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totals.changeAmount.toLocaleString()} {currency}
                  </p>
                </div>

                {totals.isOverpaid && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Attention:</strong> Le montant versé dépasse le montant dû après remise.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>

              {/* Indicateur de progression */}
              {totals.totalAfterDiscount > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression du paiement</span>
                    <span>{((totals.totalSelected / totals.totalAfterDiscount) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={(totals.totalSelected / totals.totalAfterDiscount) * 100}
                    className="h-3"
                  />
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Boutons de navigation */}
      <motion.div
        className="flex justify-between pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button variant="outline" onClick={onPrevious} className="h-10 px-6">
          Précédent
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isSubmitting || !paymentValidation.canProceed || exceedsDiscountedPrice || totals.changeAmount > 0}
          className="w-full sm:w-auto"
          title={
            exceedsDiscountedPrice 
              ? "La somme des échéances dépasse le montant après remise" 
              : totals.changeAmount > 0 
                ? "Veuillez ajuster le montant donné pour qu'il n'y ait pas de monnaie à rendre"
                : ""
          }
        >
          Suivant
        </Button>
      </motion.div>

      {/* Modal de confirmation de remise */}
      <Dialog open={showDiscountConfirmModal} onOpenChange={setShowDiscountConfirmModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="relative
            before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:opacity-30
            after:absolute after:inset-0 after:bg-gradient-to-tl after:from-primary/5 after:to-transparent after:opacity-20">
            <div className="relative z-10">
              <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold">Confirmation de remise</DialogTitle>
                    <DialogDescription className="text-sm mt-1">
                      Vérifiez les détails de la remise avant de continuer
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-muted-foreground">
                    Une remise a été appliquée à cette inscription :
                  </p>

                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 bg-gradient-to-br from-muted/30 to-muted/10 p-5 rounded-lg border border-muted/20 shadow-sm"
                  >
                    {(() => {
                      const selectedPricing = availablePricing.find(p => p.id === selectedPricingId)
                      if (!selectedPricing) return null

                      const originalAmount = parseFloat(selectedPricing.amount)
                      const discountPercentage = originalAmount > 0 ?
                        ((appliedDiscount / originalAmount) * 100).toFixed(2) : '0.00'

                      return (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Tag className="h-4 w-4" />
                              <span className="text-sm">Tarif {selectedPricing.fee_type.label}</span>
                            </div>
                            <span className="font-medium">
                              {originalAmount.toLocaleString()} {currency}
                            </span>
                          </div>
                          
                          <motion.div 
                            className="flex items-center justify-between text-red-500"
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="flex items-center space-x-2">
                              <ArrowDownCircle className="h-4 w-4" />
                              <span className="text-sm">Remise appliquée</span>
                            </div>
                            <span className="font-medium">
                              -{appliedDiscount.toLocaleString()} {currency} <span className="text-xs">({discountPercentage}%)</span>
                            </span>
                          </motion.div>

                          <Separator className="my-1" />
                          
                          <motion.div 
                            className="flex items-center justify-between text-green-600 dark:text-green-400 pt-2"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="flex items-center space-x-2 font-semibold">
                              <CheckCircle2 className="h-5 w-5" />
                              <span>Montant final</span>
                            </div>
                            <span className="text-lg font-bold">
                              {(originalAmount - appliedDiscount).toLocaleString()} {currency}
                            </span>
                          </motion.div>
                        </motion.div>
                      )
                    })()}
                  </motion.div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-2"
                >
                  <p className="text-xs text-muted-foreground text-center">
                    Voulez-vous confirmer cette remise et continuer ?
                  </p>
                </motion.div>
              </div>

              <DialogFooter className="px-6 py-4 bg-muted/10 border-t flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowDiscountConfirmModal(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Annuler</span>
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={() => confirmAndProceed() && setShowDiscountConfirmModal(false)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirmer et continuer</span>
                  </Button>
                </motion.div>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Styles CSS pour masquer les spinners */}
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
    </motion.div>
  )
}