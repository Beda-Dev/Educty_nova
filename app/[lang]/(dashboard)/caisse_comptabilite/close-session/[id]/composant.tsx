"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Clock, User as UserIcon, Calculator, FileText, Wallet, Banknote, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useSchoolStore } from "@/store"
import { fetchCashRegisterSessions, fetchTransactions, fetchPayment } from "@/store/schoolservice"
import { CashRegisterSession, Transaction, Payment, PaymentMethod, User } from "@/lib/interface"
import Loading from "./loading"

interface Props {
  session: CashRegisterSession | null;
  isLoading: boolean;
  error: string | null;
  params: { id: string };
}

// Validation schema avec des messages d'erreur personnalisés
const formSchema = z.object({
  closing_amount: z.string()
    .min(1, "Le montant est requis")
    .refine(val => {
      const num = parseFloat(val.replace(/\s/g, ''))
      return !isNaN(num) && num >= 0
    }, "Montant invalide")
})

export default function CloseSessionPage({ session, isLoading, error, params }: Props) {
  const router = useRouter()
  const { id } = params;
  
  // États
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sessionPayments, setSessionPayments] = useState<Payment[]>([])
  const [sessionTransactions, setSessionTransactions] = useState<Transaction[]>([])

  // Store
  const { 
    userOnline,
    users,
    cashRegisterSessions,
    setCashRegisterSessions,
    transactions,
    setTransactions,
    payments,
    setPayments,
    expenses,
    settings,
    methodPayment,
    setCashRegisterSessionCurrent,
    cashRegisterSessionCurrent
  } = useSchoolStore();

  // Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closing_amount: ""
    },
  })

  // Mémo pour éviter les recalculs inutiles
  const currency = useMemo(() => settings[0]?.currency || "FCFA", [settings])
  const sessionUser = useMemo(() => 
    users.find(user => user.id === session?.user_id) || null, 
    [users, session]
  )

  // Formatage des montants avec gestion d'erreur
  const formatAmount = useCallback((amount: number | string): string => {
    try {
      const num = typeof amount === 'string' 
        ? parseFloat(amount.replace(/\s/g, '')) 
        : amount
      return isNaN(num) ? '0' : num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
    } catch {
      return '0'
    }
  }, [])

  // Conversion sécurisée des montants
  const safeParseAmount = useCallback((amount: string | number | undefined | null): number => {
    if (typeof amount === "number") return amount
    if (!amount) return 0
    try {
      const parsed = parseFloat(String(amount).replace(/\s/g, "").replace(",", "."))
      return isNaN(parsed) ? 0 : parsed
    } catch {
      return 0
    }
  }, [])

  // Calcul des totaux de session avec mémoïsation
  const {
    paymentMethods,
    paymentMethodsTotal,
    totalExpenses,
    mainMethodAmount,
    expectedAmount,
    transactionsTotal
  } = useMemo(() => {
    if (!session) {
      return {
        paymentMethods: [],
        paymentMethodsTotal: 0,
        totalExpenses: 0,
        mainMethodAmount: 0,
        expectedAmount: 0,
        transactionsTotal: 0
      }
    }

    // Calcul des paiements par méthode
    const methodMap = new Map<number, { name: string; amount: number; isPrincipal?: number }>()
    
    sessionPayments.forEach(payment => {
      payment.payment_methods?.forEach(pm => {
        if (typeof pm.id === 'number') {
          const amount = safeParseAmount(pm.pivot?.montant)
          if (methodMap.has(pm.id)) {
            methodMap.get(pm.id)!.amount += amount
          } else {
            methodMap.set(pm.id, { 
              name: pm.name, 
              amount, 
              isPrincipal: pm.isPrincipal 
            })
          }
        }
      })
    })

    const paymentMethods = Array.from(methodMap.entries()).map(([id, method]) => ({
      id,
      name: method.name,
      amount: method.amount,
      isPrincipal: method.isPrincipal,
    }))

    const paymentMethodsTotal = paymentMethods.reduce((sum, m) => sum + m.amount, 0)

    // Dépenses
    const totalExpenses = expenses
      .filter(e => e.transaction?.cash_register_session_id === session.id)
      .reduce((sum, e) => sum + Math.abs(safeParseAmount(e.amount)), 0)

    // Méthode principale
    const mainPaymentMethod = methodPayment.find(m => Number(m.isPrincipal) === 1)
    const mainMethodId = mainPaymentMethod?.id
    const mainMethodAmount = mainMethodId
      ? sessionPayments.reduce((sum, payment) => {
          const found = payment.payment_methods?.find(pm => pm.id === mainMethodId)
          return sum + (found ? safeParseAmount(found.pivot?.montant) : 0)
        }, 0)
      : 0

    const openingAmount = safeParseAmount(session.opening_amount)
    const expectedAmount = openingAmount + mainMethodAmount - totalExpenses

    const transactionsTotal = sessionTransactions.reduce(
      (sum, t) => sum + safeParseAmount(t.total_amount),
      0
    )

    return {
      paymentMethods,
      paymentMethodsTotal,
      totalExpenses,
      mainMethodAmount,
      expectedAmount,
      transactionsTotal
    }
  }, [session, sessionPayments, sessionTransactions, methodPayment, expenses, safeParseAmount])

  // Mise à jour des transactions et paiements de la session
  useEffect(() => {
    if (!session || !transactions.length || !payments.length) return

    const filteredTransactions = transactions.filter(
      t => t.cash_register_session_id === session.id
    )
    const filteredPayments = payments.filter(
      p => Number(p.transaction?.cash_register_session_id) === Number(session.id)
    )

    setSessionTransactions(filteredTransactions)
    setSessionPayments(filteredPayments)
  }, [session, transactions, payments])

  // Mise à jour du montant de fermeture par défaut
  useEffect(() => {
    if (!session || expectedAmount <= 0) return

    const currentValue = form.getValues("closing_amount")
    const formattedExpected = formatAmount(expectedAmount)
    
    if (currentValue !== formattedExpected) {
      form.setValue("closing_amount", formattedExpected)
    }
  }, [session, expectedAmount, form, formatAmount])

  // Formatage des dates avec gestion d'erreur
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }, [])

  // Calcul de la durée de session
  const calculateDuration = useCallback((openingDate: string) => {
    try {
      const start = new Date(openingDate)
      const end = new Date()
      let diffMs = end.getTime() - start.getTime()

      if (diffMs < 0) return "Durée inconnue"

      const minute = 1000 * 60
      const hour = minute * 60
      const day = hour * 24

      const days = Math.floor(diffMs / day)
      diffMs -= days * day
      const hours = Math.floor(diffMs / hour)
      diffMs -= hours * hour
      const minutes = Math.floor(diffMs / minute)

      let parts = []
      if (days > 0) parts.push(`${days} j`)
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0 || parts.length === 0) parts.push(`${minutes.toString().padStart(2, '0')}min`)

      return parts.join(' ')
    } catch {
      return "Durée inconnue"
    }
  }, [])

  // Soumission du formulaire
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) {
      setSubmitError("Session invalide")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const closingAmount = parseFloat(values.closing_amount.replace(/\s/g, ''))
      
      if (isNaN(closingAmount)) {
        throw new Error("Montant de fermeture invalide")
      }

      const now = new Date()
      const closingDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...session,
          closing_amount: closingAmount.toString(),
          status: 'closed',
          closing_date: closingDate
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Erreur lors de la fermeture de la session')
      }

      // Mise à jour du store
      
      if (session.id === cashRegisterSessionCurrent?.id) {
        setCashRegisterSessionCurrent(null)
      }

      const updatedSessions = await fetchCashRegisterSessions()
      setCashRegisterSessions(updatedSessions)

      // Animation de succès
      setShowSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 100))

      // Redirection
      router.push("/caisse_comptabilite/session_caisse")
    } catch (error) {
      console.error("Error closing session:", error)
      setSubmitError(error instanceof Error ? error.message : "Une erreur inconnue est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return (
      <ErrorDisplay 
        title="Erreur"
        message={error}
        onBack={() => router.push("/caisse_comptabilite/session_caisse")}
      />
    )
  }

  if (!session) {
    return (
      <ErrorDisplay 
        title="Session introuvable"
        message="La session demandée n'existe pas ou a déjà été fermée"
        onBack={() => router.push("/caisse_comptabilite/session_caisse")}
      />
    )
  }

  if (!methodPayment || methodPayment.length === 0) {
    return (
      <ErrorDisplay 
        title="Erreur de configuration"
        message="Aucune méthode de paiement n'est configurée. Veuillez configurer au moins une méthode de paiement dans les paramètres."
        onBack={() => router.push("/caisse_comptabilite/session_caisse")}
      />
    )
  }

  return (
    <div className="container mx-auto py-4 px-2 max-w-7xl">
      {/* Animation de succès */}
      <AnimatePresence>
        {showSuccess && <SuccessAnimation amount={form.getValues("closing_amount")} currency={currency} />}
      </AnimatePresence>

      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-5xl mx-auto shadow-lg rounded-xl border bg-background">
          <CardHeader className="border-b px-4 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg sm:text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Fermer la session de caisse
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Remplissez les informations pour fermer la session
                </CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1 text-xs sm:text-sm font-medium">
                #{session.id}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-4 px-2 sm:px-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Information sur le calcul */}
              <Alert color="info" className="mb-2 sm:mb-4">
                <AlertTitle>Information sur le calcul</AlertTitle>
                <AlertDescription>
                  Le total des encaissements additionne tous les montants reçus, quelle que soit la méthode de paiement.<br />
                  Le montant de la méthode principale additionne uniquement les montants des paiements effectués via la méthode principale définie dans les paramètres.
                </AlertDescription>
              </Alert>

              {/* Résumé de session */}
              <SessionSummary 
                session={session}
                sessionUser={sessionUser}
                formatDate={formatDate}
                calculateDuration={calculateDuration}
                sessionTransactions={sessionTransactions}
                transactionsTotal={transactionsTotal}
                openingAmount={safeParseAmount(session.opening_amount)}
                mainMethodAmount={mainMethodAmount}
                totalExpenses={totalExpenses}
                expectedAmount={expectedAmount}
                paymentMethods={paymentMethods}
                paymentMethodsTotal={paymentMethodsTotal}
                methodPayment={methodPayment}
                currency={currency}
              />

              <Separator />

              {/* Formulaire de fermeture */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="closing_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm sm:text-base">
                          <Banknote className="h-4 w-4" />
                          <span>Montant de fermeture</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`0 ${currency}`}
                            value={field.value}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\s/g, "").replace(/\D/g, "")
                              const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                              field.onChange(formatted)
                            }}
                            className="text-sm font-medium"
                            inputMode="numeric"
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormDescription>
                          Entrez le montant total contenu dans la caisse à la fermeture
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Erreur de soumission */}
                  {submitError && (
                    <Alert color="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Confirmation */}
                  <Alert color="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Confirmation requise</AlertTitle>
                    <AlertDescription>
                      En fermant cette session, vous certifiez que le montant indiqué correspond exactement au contenu
                      physique de la caisse. Cette action est irréversible.
                    </AlertDescription>
                  </Alert>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
                    <Button
                      color="destructive"
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Annuler
                    </Button>
                    <Button
                      color="indigodye"
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2 w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Confirmer la fermeture
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Composant d'affichage d'erreur
const ErrorDisplay = ({ title, message, onBack }: { title: string; message: string; onBack: () => void }) => (
  <div className="container mx-auto py-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert color="destructive">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-start border-t pt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  </div>
)

// Animation de succès
const SuccessAnimation = ({ amount, currency }: { amount: string; currency: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-xs sm:max-w-md w-full text-center shadow-xl"
    >
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
      <h3 className="text-xl sm:text-2xl font-bold mb-2">Session fermée</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
        La session a été fermée avec succès.
      </p>
      <div className="text-base sm:text-lg font-semibold bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
        Montant final: {amount} {currency}
      </div>
    </motion.div>
  </motion.div>
)

// Type pour le résumé des méthodes de paiement
type PaymentMethodSummary = {
  id: number
  name: string
  amount: number
  isPrincipal?: number
}

// Résumé de session
const SessionSummary = ({
  session,
  sessionUser,
  formatDate,
  calculateDuration,
  sessionTransactions,
  transactionsTotal,
  openingAmount,
  mainMethodAmount,
  totalExpenses,
  expectedAmount,
  paymentMethods,
  paymentMethodsTotal,
  methodPayment,
  currency
}: {
  session: CashRegisterSession
  sessionUser: User | null
  formatDate: (date: string) => string
  calculateDuration: (date: string) => string
  sessionTransactions: Transaction[]
  transactionsTotal: number
  openingAmount: number
  mainMethodAmount: number
  totalExpenses: number
  expectedAmount: number
  paymentMethods: PaymentMethodSummary[]
  paymentMethodsTotal: number
  methodPayment: PaymentMethod[]
  currency: string
}) => (
  <div className="p-3 sm:p-5 rounded-lg bg-gray-50 dark:bg-gray-800 border">
    <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
      <Calculator className="h-5 w-5" />
      <span>Résumé de la session</span>
    </h3>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div className="space-y-3">
        <InfoItem 
          icon={<Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          label="Caisse"
          value={`N° ${session.cash_register?.cash_register_number}`}
        />
        <InfoItem 
          icon={<UserIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          label="Ouverte par"
          value={sessionUser?.name || "Utilisateur inconnu"}
          secondaryValue={sessionUser?.email}
        />
      </div>
      <div className="space-y-3">
        <InfoItem 
          icon={<Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          label="Date d'ouverture"
          value={formatDate(session.opening_date)}
          secondaryValue={`Durée: ${calculateDuration(session.opening_date)}`}
        />
        <InfoItem 
          icon={<FileText className="h-4 w-4 text-green-600 dark:text-green-400" />}
          label="Transactions"
          value={`${sessionTransactions.length} opérations`}
          secondaryValue={`Total: ${transactionsTotal} ${currency}`}
        />
      </div>
    </div>

    <Separator className="my-3 sm:my-4" />

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
      <SummaryCard 
        icon={<Wallet className="h-3 w-3" />}
        label="Ouverture"
        value={openingAmount}
        currency={currency}
        color="blue"
      />
      <SummaryCard 
        icon={<Banknote className="h-3 w-3" />}
        label={methodPayment.find(m => m.isPrincipal === 1)?.name || "Méthode principale"}
        value={mainMethodAmount}
        currency={currency}
        color="green"
        isPositive
      />
      <SummaryCard 
        icon={<CreditCard className="h-3 w-3" />}
        label="Décaissement"
        value={totalExpenses}
        currency={currency}
        color="purple"
        isNegative
      />
      <SummaryCard 
        icon={<Calculator className="h-3 w-3" />}
        label="Total attendu"
        value={expectedAmount}
        currency={currency}
        color="amber"
        description={`(Ouverture + ${methodPayment.find(m => m.isPrincipal === 1)?.name || "méthode principale"} - Dépenses)`}
      />
    </div>

    {/* Détail des méthodes de paiement */}
    {paymentMethods.length > 0 && (
      <>
        <Separator className="my-3 sm:my-4" />
        <div>
          <h4 className="text-xs sm:text-sm font-medium mb-2">Détail des méthodes de paiement</h4>
          <div className="space-y-2">
            {paymentMethods.map(method => (
              <div key={method.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm">{method.name}</span>
                  {method.id === methodPayment.find(m => Number(m.isPrincipal) === 1)?.id && (
                    <Badge variant="outline" className="text-xs py-0 px-2">
                      Principale
                    </Badge>
                  )}
                </div>
                <span className="font-medium text-xs sm:text-sm">
                  +{method.amount} {currency}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs sm:text-sm font-medium">Total encaissements</span>
              <span className="font-bold text-xs sm:text-sm">
                +{paymentMethodsTotal} {currency}
              </span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)

// Composant d'information
const InfoItem = ({ 
  icon, 
  label, 
  value, 
  secondaryValue 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  secondaryValue?: string
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
      {icon}
    </div>
    <div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="font-medium text-sm sm:text-base">{value}</p>
      {secondaryValue && (
        <p className="text-xs sm:text-sm text-muted-foreground">{secondaryValue}</p>
      )}
    </div>
  </div>
)

// Carte de résumé
const SummaryCard = ({
  icon,
  label,
  value,
  currency,
  color = "blue",
  isPositive = false,
  isNegative = false,
  description
}: {
  icon: React.ReactNode
  label: string
  value: number
  currency: string
  color?: "blue" | "green" | "purple" | "amber"
  isPositive?: boolean
  isNegative?: boolean
  description?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-900 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400"
  }

  return (
    <div className={`p-2 sm:p-3 rounded-md ${colorClasses[color]} border flex flex-col`}>
      <div className="text-xs sm:text-base flex items-center gap-2">
        {icon}
        {label}
      </div>
      {description && (
        <div className="text-xs mb-1">{description}</div>
      )}
      <div className="font-bold text-xs sm:text-sm mt-1">
        {isPositive && '+'}{isNegative && '-'}{value} {currency}
      </div>
    </div>
  )
}