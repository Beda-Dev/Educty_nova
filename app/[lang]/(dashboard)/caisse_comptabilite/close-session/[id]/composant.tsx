"use client"
import { useState, useEffect, useCallback } from "react"
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
import { CashRegisterSession, Transaction, Payment, PaymentMethod } from "@/lib/interface"
import Loading from "./loading"

// Validation schema
const formSchema = z.object({
  closing_amount: z.string().min(1, "Veuillez entrer un montant de fermeture"),
})

interface Props {
  session: CashRegisterSession | null;
  isLoading: boolean;
  error: string | null;
  params: { id: string };
}

interface PaymentMethodSummary {
  id: number;
  name: string;
  amount: number;
}

export default function CloseSessionPage({ session, isLoading, error, params }: Props) {
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
    settings,
    methodPayment,
    setCashRegisterSessionCurrent,
    cashRegisterSessionCurrent
  } = useSchoolStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [sessionTransactions, setSessionTransactions] = useState<Transaction[]>([])
  const [sessionPayments, setSessionPayments] = useState<Payment[]>([])
  const [paymentMethodsSummary, setPaymentMethodsSummary] = useState<PaymentMethodSummary[]>([])
  // Ajout d'un état local pour l'erreur de soumission
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closing_amount: ""
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

  // Fonction utilitaire robuste pour convertir un montant en nombre
  const safeParseAmount = (amount: string | number | undefined | null): number => {
    if (typeof amount === "number") return amount;
    if (!amount) return 0;
    const parsed = parseFloat(String(amount).replace(/\s/g, "").replace(",", "."));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Centralise le calcul du montant attendu et des totaux
  const calculateSessionTotals = (
    session: CashRegisterSession | null,
    sessionPayments: Payment[],
    sessionTransactions: Transaction[],
    methodPayment: PaymentMethod[],
    expenses: any[]
  ) => {
    // Paiements par méthode (toujours via pivot.montant)
    const methodMap = new Map<number, { name: string; amount: number }>();
    sessionPayments.forEach(payment => {
      payment.payment_methods?.forEach(method => {
        const amount = safeParseAmount(method.pivot?.montant);
        if (methodMap.has(method.id)) {
          methodMap.get(method.id)!.amount += amount;
        } else {
          methodMap.set(method.id, { name: method.name, amount });
        }
      });
    });
    const paymentMethods = Array.from(methodMap.entries()).map(([id, method]) => ({
      id,
      name: method.name,
      amount: method.amount,
    }));

    // Total des paiements toutes méthodes confondues
    const paymentMethodsTotal = paymentMethods.reduce((sum, m) => sum + m.amount, 0);

    // Dépenses (décaissements) : toutes les transactions liées à une dépense
    const totalExpenses = expenses
      .filter((e: any) => e.transaction?.cash_register_session_id === session?.id)
      .reduce((sum: number, e: any) => sum + Math.abs(safeParseAmount(e.amount)), 0);

    // Méthode principale
    const mainPaymentMethod = methodPayment.find((m) => m.isPrincipal === 1);
    const mainMethodAmount = mainPaymentMethod
      ? paymentMethods.find((m) => m.id === mainPaymentMethod.id)?.amount || 0
      : 0;

    // Montant d'ouverture
    const openingAmount = safeParseAmount(session?.opening_amount);

    // Montant attendu
    const expectedAmount = openingAmount + mainMethodAmount - totalExpenses;

    // Total des transactions (pour affichage)
    const transactionsTotal = sessionTransactions.reduce(
      (sum, t) => sum + safeParseAmount(t.total_amount),
      0
    );

    return {
      paymentMethods,
      paymentMethodsTotal,
      totalExpenses,
      mainMethodAmount,
      expectedAmount,
      transactionsTotal,
    };
  };

  // Vérification si aucune méthode de paiement n'est configurée
  if (!methodPayment || methodPayment.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Erreur de configuration
            </CardTitle>
            <CardDescription>
              Aucune méthode de paiement n'est configurée. Veuillez configurer au moins une méthode de paiement dans les paramètres de l'établissement avant de fermer une session de caisse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert color="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Impossible de procéder à la fermeture de la session sans méthode de paiement.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-start border-t pt-6">
            <Button variant="outline" onClick={() => router.push("/caisse_comptabilite/session_caisse")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) return

    setIsSubmitting(true)
    setSubmitError(null)

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
      setSubmitError(error instanceof Error ? error.message : "Une erreur est survenue")
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
      let diffMs = end.getTime() - start.getTime()

      if (diffMs < 0) return "Durée inconnue"

      const minute = 1000 * 60
      const hour = minute * 60
      const day = hour * 24
      const week = day * 7
      const month = day * 30.44 // approximation

      const months = Math.floor(diffMs / month)
      diffMs -= months * month
      const weeks = Math.floor(diffMs / week)
      diffMs -= weeks * week
      const days = Math.floor(diffMs / day)
      diffMs -= days * day
      const hours = Math.floor(diffMs / hour)
      diffMs -= hours * hour
      const minutes = Math.floor(diffMs / minute)

      let parts = []
      if (months > 0) parts.push(`${months} mois`)
      if (weeks > 0) parts.push(`${weeks} sem.`)
      if (days > 0) parts.push(`${days} j`)
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0 || parts.length === 0) parts.push(`${minutes.toString().padStart(2, '0')}min`)

      return parts.join(' ')
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
    if (!session) {
      return {
        transactionsTotal: 0,
        expectedAmount: 0,
        paymentMethodsTotal: 0,
        paymentMethods: [] as PaymentMethodSummary[],
        totalExpenses: 0,
        mainMethodAmount: 0,
      };
    }
    return calculateSessionTotals(
      session,
      sessionPayments,
      sessionTransactions,
      methodPayment,
      expenses
    );
  }, [session, sessionPayments, sessionTransactions, methodPayment, expenses])

  const {
    transactionsTotal,
    expectedAmount,
    paymentMethodsTotal,
    paymentMethods,
    totalExpenses,
    mainMethodAmount,
  } = calculateTotals()

  useEffect(() => {
    if (session) {
      setPaymentMethodsSummary(paymentMethods);
      form.setValue("closing_amount", formatAmount(expectedAmount));
    }
  }, [session, paymentMethods, expectedAmount, form, formatAmount])

  // Met à jour les transactions liées à la session
  useEffect(() => {
    if (!session || !transactions) {
      setSessionTransactions([]);
      return;
    }
    const filtered = transactions.filter(
      (t: any) => t.cash_register_session_id === session.id
    );
    setSessionTransactions(filtered);
  }, [session, transactions]);

  // Met à jour les paiements liés à la session
  useEffect(() => {
    if (!session || !payments) {
      setSessionPayments([]);
      return;
    }
    const filtered = payments.filter(
      (p: any) => Number(p.cash_register_session_id) === Number(session.id)
    );
    setSessionPayments(filtered);
  }, [session, payments]);

  const sessionUser = getUserById(session?.user_id || 0)

  if (isLoading) {
    return <Loading />
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
    <div className="container mx-auto py-8 max-w-7xl">
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
        <Card className="max-w-5xl mx-auto"> {/* élargir la card */}
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
                      {methodPayment.find((m) => m.isPrincipal === 1)?.name || "Méthode principale"}
                    </div>
                    <div className="font-bold text-sm mt-1">
                      +{formatAmount(mainMethodAmount)} {currency}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-900 flex flex-col">
                    <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <CreditCard className="h-3 w-3" />
                      Décaissement
                    </div>
                    <div className="font-bold text-l mt-1">
                      -{formatAmount(totalExpenses)} {currency}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900 flex flex-col">
                    <div className="text-l text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <Calculator className="h-3 w-3" />
                      Total attendu
                    </div>
                    <div className="text-xs mb-1">
                      (Ouverture + {methodPayment.find((m) => m.isPrincipal === 1)?.name || "méthode principale"} - Dépenses)
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
                        {paymentMethodsSummary.map(method => (
                          <div key={method.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{method.name}</span>
                              {method.id === methodPayment.find((m) => m.isPrincipal === 1)?.id && (
                                <Badge variant="outline" className="text-xs py-0 px-2">
                                  Principale
                                </Badge>
                              )}
                            </div>
                            <span className="font-medium">
                              +{formatAmount(method.amount)} {currency}
                            </span>
                          </div>
                        ))}
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

                  {/* Affichage de l'erreur de soumission si présente */}
                  {submitError && (
                    <Alert color="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-4">
                    <Alert color="warning">
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
                      onClick={() => router.back()}
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