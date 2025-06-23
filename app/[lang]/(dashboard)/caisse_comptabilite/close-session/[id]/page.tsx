"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { CashRegisterSession, Transaction, Payment, PaymentMethod } from "@/lib/interface"

// Validation schema
const formSchema = z.object({
  closing_amount: z.string().min(1, "Veuillez entrer un montant de fermeture"),
  comment: z.string().optional(),
})

interface Props {
  params: { 
    id: string;
  };
}

interface PaymentMethodSummary {
  id: number;
  name: string;
  amount: number;
}

export default function CloseSessionPage({ params }: Props) {
  const router = useRouter()
  const { id } = params;
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
    settings ,
    setCashRegisterSessionCurrent,
    cashRegisterSessionCurrent
  } = useSchoolStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<CashRegisterSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [sessionTransactions, setSessionTransactions] = useState<Transaction[]>([])
  const [sessionPayments, setSessionPayments] = useState<Payment[]>([])
  const [paymentMethodsSummary, setPaymentMethodsSummary] = useState<PaymentMethodSummary[]>([])

  // Initialize form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closing_amount: "",
      comment: "",
    },
  })

  const currency = settings[0]?.currency || "FCFA"

  // Format amount with spaces as thousand separators
  const formatAmount = (amount: number | string): string => {
    try {
      const num = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount
      if (isNaN(num)) return '0'
      return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
    } catch {
      return '0'
    }
  }

  // Parse formatted amount back to number
  const parseAmount = (formattedAmount: string): number => {
    try {
      return parseFloat(formattedAmount.replace(/\s/g, '')) || 0
    } catch {
      return 0
    }
  }

  const fetchSessionData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate session ID
      const sessionId = Number(id)
      if (isNaN(sessionId)) {
        throw new Error("ID de session invalide")
      }

      // Fetch all necessary data
      const [updatedSessions, updatedTransactions, updatedPayments] = await Promise.all([
        fetchCashRegisterSessions(),
        fetchTransactions(),
        fetchPayment()
      ])

      setCashRegisterSessions(updatedSessions)
      setTransactions(updatedTransactions)
      setPayments(updatedPayments)

      // Find the session
      const foundSession = updatedSessions.find((s: CashRegisterSession) => s.id === sessionId)
      if (!foundSession) {
        throw new Error("Session introuvable")
      }

      if (foundSession.status === "closed") {
        throw new Error("Cette session est déjà fermée")
      }

      // Filter transactions and payments for this session
      const sessionTransactions = transactions.filter(
        (t: Transaction) => t.cash_register_session_id === sessionId && (expenses.some(e => e.transaction_id === t.id) || payments.some(p => p.transaction_id === t.id))
      )

      const sessionPayments = payments.filter(
        (p: Payment) => p.transaction_id && sessionTransactions.some(t => t.id === p.transaction_id)
      )

      // Calculate payment methods summary
      const methodsSummary: PaymentMethodSummary[] = []
      sessionPayments.forEach(payment => {
        payment.payment_method?.forEach(method => {
          const existingMethod = methodsSummary.find(m => m.id === method.id)
          const amount = parseFloat(payment.amount) / (payment.payment_method?.length || 1)
          
          if (existingMethod) {
            existingMethod.amount += amount
          } else {
            methodsSummary.push({
              id: method.id,
              name: method.name,
              amount: amount
            })
          }
        })
      })

      setSessionTransactions(sessionTransactions)
      setSessionPayments(sessionPayments)
      setSession(foundSession)
      
      // Calculate expected closing amount
      const transactionsTotal = sessionTransactions.reduce(
        (sum: number, t: Transaction) => sum + parseFloat(t.total_amount),
        0
      )
      const expectedAmount = parseFloat(foundSession.opening_amount) + transactionsTotal

      // Set initial form value
      // form.setValue("closing_amount", formatAmount(expectedAmount))
    } catch (error) {
      console.error("Error fetching session:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }, [id, form, setCashRegisterSessions, setTransactions, setPayments])

  useEffect(() => {
    fetchSessionData()
  }, [fetchSessionData])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Validate closing amount
      const closingAmount = parseAmount(values.closing_amount)
      if (isNaN(closingAmount) || closingAmount < 0) {
        throw new Error("Montant de fermeture invalide")
      }

      // Fonction utilitaire pour formater la date au format 'Y-m-d H:i:s'
      function formatDateToYMDHIS(date: Date) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return (
          date.getFullYear() + '-' +
          pad(date.getMonth() + 1) + '-' +
          pad(date.getDate()) + ' ' +
          pad(date.getHours()) + ':' +
          pad(date.getMinutes()) + ':' +
          pad(date.getSeconds())
        );
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...session,
          closing_amount: closingAmount.toString(),
          comment: values.comment,
          status: 'closed',
          closing_date: formatDateToYMDHIS(new Date())
        })
      })

      if (!response.ok) {
        throw new Error(await response.text() || 'Erreur lors de la fermeture de la session')
      }

      const updatedSession = await response.json()

      if(session.id === cashRegisterSessionCurrent?.id){
        setCashRegisterSessionCurrent(null)
      }
      const update = await fetchCashRegisterSessions()
      setCashRegisterSessions(update)
      

      // Show success animation
      setShowSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 500))


      // Redirect to sessions list
      router.push("/caisse_comptabilite/session_caisse")
    } catch (error) {
      console.error("Error closing session:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    // Allow only numbers and spaces
    const value = e.target.value.replace(/[^0-9\s]/g, "")
    onChange(value)
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  // Calculate session duration
  const calculateDuration = (openingDate: string) => {
    try {
      const start = new Date(openingDate)
      const end = new Date()
      const diffMs = end.getTime() - start.getTime()
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      return `${diffHrs}h${diffMins.toString().padStart(2, '0')}`
    } catch {
      return "Durée inconnue"
    }
  }

  // Find user by id
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId) || null
  }

  // Calculate totals with better type safety
  const calculateTotals = useCallback(() => {
    if (!session) return {
      transactionsTotal: 0,
      expectedAmount: 0,
      paymentMethodsTotal: 0,
      cashTotal: 0,
      otherMethodsTotal: 0,
      paymentMethods: [] as PaymentMethodSummary[]
    }

    // Calculate transactions total (both income and expenses)
    const transactionsTotal = sessionTransactions.reduce(
      (sum, t) => sum + parseFloat(t.total_amount),
      0
    )

    // Calculate payments total and group by method
    let cashTotal = 0
    const methodMap = new Map<number, {name: string, amount: number}>()

    sessionPayments.forEach(payment => {
      const paymentAmount = parseFloat(payment.amount)
      
      if (payment.payment_method && payment.payment_method.length > 0) {
        // Split amount between methods if multiple methods
        const amountPerMethod = paymentAmount / payment.payment_method.length
        
        payment.payment_method.forEach(method => {
          // Sum cash payments (handle different spellings)
          const isCash = method.name.toLowerCase().includes('espece') || 
                         method.name.toLowerCase().includes('espèce') ||
                         method.name.toLowerCase().includes('cash')
          
          if (isCash) {
            cashTotal += amountPerMethod
          }

          // Track all methods
          const existing = methodMap.get(method.id)
          if (existing) {
            existing.amount += amountPerMethod
          } else {
            methodMap.set(method.id, {
              name: method.name,
              amount: amountPerMethod
            })
          }
        })
      } else {
        // If no method specified, consider as cash
        cashTotal += paymentAmount
      }
    })

    // Convert method map to array
    const paymentMethods = Array.from(methodMap.values()).map((method, index) => ({
      id: index + 1, // temporary ID if method doesn't have one
      name: method.name,
      amount: method.amount
    }))

    // Calculer le total des décaissements (transactions négatives et expenses)
    const totalExpenses = [
      ...sessionTransactions
        .filter(t => parseFloat(t.total_amount) >= 0)
        .map(t => ({ amount: t.total_amount })),
      ...expenses
        .filter(e => e.transaction?.cash_register_session_id === session.id)
        .map(e => ({ amount: e.amount }))
    ].reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    // Calculer le montant attendu : ouverture + cash - décaissements
    const expectedAmount = parseFloat(session.opening_amount) + cashTotal - totalExpenses

    // Calculate other methods total
    const otherMethodsTotal = paymentMethods
      .filter(m => !m.name.toLowerCase().includes('espece') && 
                   !m.name.toLowerCase().includes('espèce') &&
                   !m.name.toLowerCase().includes('cash'))
      .reduce((sum, m) => sum + m.amount, 0)

    return {
      transactionsTotal,
      expectedAmount,
      paymentMethodsTotal: cashTotal + otherMethodsTotal,
      cashTotal,
      otherMethodsTotal,
      paymentMethods
    }
  }, [session, sessionTransactions, sessionPayments])

  const {
    transactionsTotal,
    expectedAmount,
    paymentMethodsTotal,
    cashTotal,
    otherMethodsTotal,
    paymentMethods
  } = calculateTotals()

  useEffect(() => {
    if (session) {
      setPaymentMethodsSummary(paymentMethods)
    }
  }, [session, paymentMethods])
  const sessionUser = getUserById(session?.user_id || 0)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
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
                Erreur
              </CardTitle>
              <CardDescription>Impossible de fermer la session</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert color="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-start border-t pt-6">
              <Button variant="outline" onClick={() => router.push("/caisse_comptabilite/session_caisse")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Session introuvable</CardTitle>
              <CardDescription>La session demandée n'existe pas</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert color="destructive">
                <AlertTitle>Session introuvable</AlertTitle>
                <AlertDescription>
                  La session que vous essayez de fermer n'existe pas ou a déjà été fermée.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-start border-t pt-6">
              <Button color="destructive"  onClick={() => router.push("/caisse_comptabilite/session_caisse")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <AnimatePresence>
        {showSuccess && (
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
              className="bg-white dark:bg-gray-900 p-8 rounded-lg max-w-md text-center shadow-xl"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Session fermée</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                La session #{session.id} a été fermée avec succès.
              </p>
              <div className="text-lg font-semibold bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                Montant final: {formatAmount(form.getValues("closing_amount"))} {currency}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Fermer la session de caisse
                </CardTitle>
                <CardDescription>Remplissez les informations pour fermer la session</CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                #{session.id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Session information */}
              <div className="p-5 rounded-lg bg-gray-50 dark:bg-gray-800 border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <span>Résumé de la session</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Caisse</p>
                        <p className="font-medium">N° {session.cash_register?.cash_register_number}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <UserIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ouverte par</p>
                        <p className="font-medium">{sessionUser?.name || "Utilisateur inconnu"}</p>
                        {sessionUser?.email && (
                          <p className="text-sm text-muted-foreground">{sessionUser.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date d'ouverture</p>
                        <p className="font-medium">{formatDate(session.opening_date)}</p>
                        <p className="text-sm text-muted-foreground">
                          Durée: {calculateDuration(session.opening_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                        <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                        <p className="font-medium">{sessionTransactions.length} opérations</p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatAmount(transactionsTotal)} {currency}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900 flex flex-col">
                    <div className="text-l text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Wallet className="h-3 w-3" />
                      Ouverture
                    </div>
                    <div className="font-bold text-sm mt-1">
                      {formatAmount(session.opening_amount)} {currency}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900 flex flex-col">
                    <div className="text-l text-green-600 dark:text-green-400 flex items-center gap-2">
                      <Banknote className="h-3 w-3" />
                      Espèces
                    </div>
                    <div className="font-bold text-sm mt-1">
                      +{formatAmount(cashTotal)} {currency}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-900 flex flex-col">
                    <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <CreditCard className="h-3 w-3" />
                      Autres méthodes
                    </div>
                    <div className="font-bold text-l mt-1">
                      +{formatAmount(otherMethodsTotal)} {currency}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900 flex flex-col">
                    <div className="text-l text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <Calculator className="h-3 w-3" />
                      Total attendu
                    </div>
                    <div className="font-bold text-sm mt-1">
                      {formatAmount(expectedAmount)} {currency}
                    </div>
                  </div>
                </div>

                {/* Payment methods summary */}
                {paymentMethodsSummary.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Détail des méthodes de paiement</h4>
                      <div className="space-y-2">
                        {paymentMethodsSummary.map(method => {
                          const isCash = method.name.toLowerCase().includes('espece') || 
                                         method.name.toLowerCase().includes('espèce') ||
                                         method.name.toLowerCase().includes('cash')
                          return (
                            <div key={method.id} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{method.name}</span>
                                {isCash && (
                                  <Badge variant="outline" className="text-xs py-0 px-2">
                                    Espèces
                                  </Badge>
                                )}
                              </div>
                              <span className="font-medium">
                                +{formatAmount(method.amount)} {currency}
                              </span>
                            </div>
                          )
                        })}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-medium">Total encaissements</span>
                          <span className="font-bold">
                            +{formatAmount(paymentMethodsTotal)} {currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Closing Amount */}
                  <FormField
                    control={form.control}
                    name="closing_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span>Montant de fermeture</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`0 ${currency}`}
                            value={field.value}
                            onChange={(e) => {
                              // Supprime tous les espaces et caractères non numériques
                              let raw = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                              // Formate avec des espaces tous les 3 chiffres
                              const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                              field.onChange(formatted);
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

                  {/* Comment */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Commentaire (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ajoutez des observations sur cette session..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Vous pouvez noter des remarques sur les opérations effectuées
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Alert color="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Confirmation requise</AlertTitle>
                      <AlertDescription>
                        En fermant cette session, vous certifiez que le montant indiqué correspond exactement au contenu
                        physique de la caisse. Cette action est irréversible.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      color="destructive"
                      type="button"
                      variant="outline"
                      onClick={() => router.replace("/caisse_comptabilite/session_caisse")}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Annuler
                    </Button>
                    <Button
                      color="indigodye"
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2"
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