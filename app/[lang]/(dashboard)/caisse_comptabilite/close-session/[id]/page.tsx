"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Euro, Clock, User as UserIcon, Calculator, FileText } from "lucide-react"
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
import { fetchCashRegisterSessions , fetchTransactions } from "@/store/schoolservice"
import { CashRegisterSession, Transaction } from "@/lib/interface"

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

export default function CloseSessionPage({ params }: Props) {
  const router = useRouter()
  const { id } = params;
  const { userOnline, users, cashRegisterSessions, setCashRegisterSessions, transactions , setTransactions } = useSchoolStore();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<CashRegisterSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [sessionTransactions, setSessionTransactions] = useState<Transaction[]>([])

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closing_amount: "",
      comment: "",
    },
  })

    const fetchSessionData = useCallback(async () => {
    setIsLoading(true)
    try {
      const updatedSessions: CashRegisterSession[] = await fetchCashRegisterSessions()
      const updatedTransactions: Transaction[] = await fetchTransactions()

      setCashRegisterSessions(updatedSessions)
      setTransactions(updatedTransactions)

      const sessionId = Number(id)
      const foundSession = updatedSessions.find((s: CashRegisterSession) => s.id === sessionId)

      if (!foundSession) {
        setError("Session introuvable")
        return
      }

      if (foundSession.status === "closed") {
        setError("Cette session est déjà fermée")
        return
      }

      // Filter transactions for this session
      const sessionTransactions = updatedTransactions.filter(
        (t) => t.cash_register_session_id === sessionId
      )

      setSessionTransactions(sessionTransactions)
      setSession(foundSession)
      
      // Calculate total from transactions if not provided
      const transactionsTotal = sessionTransactions.reduce(
        (sum, t) => sum + parseInt(t.total_amount),
        0
      )

      // Pre-fill closing amount with expected value (opening + transactions)
      const expectedAmount = parseInt(foundSession.opening_amount) + transactionsTotal
      form.setValue("closing_amount", expectedAmount.toString())
    } catch (error) {
      console.error("Error fetching session:", error)
      setError("Une erreur est survenue lors de la récupération des données")
    } finally {
      setIsLoading(false)
    }
  }, [id, form, setCashRegisterSessions, setTransactions])

  useEffect(() => {
    fetchSessionData()
  }, [fetchSessionData]) //

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/cashRegisterSession?id=${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          closing_amount: values.closing_amount,
          comment: values.comment,
          status: 'closed',
          closing_date: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la fermeture de la session')
      }

      const updatedSession = await response.json()

      // Update store with the closed session
      const updatedSessions = cashRegisterSessions.map(s => 
        s.id === session.id ? updatedSession : s
      )
      setCashRegisterSessions(updatedSessions)

      // Show success animation
      setShowSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to sessions list
      router.push("/caisse_comptabilite/session_caisse")
    } catch (error) {
      console.error("Error closing session:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de la fermeture")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format FCFA currency
  const formatFCFA = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseInt(value || "0") : value
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      currencyDisplay: 'narrowSymbol'
    }).format(numericValue / 100).replace('CFA', 'FCFA')
  }

  // Handle currency input change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    onChange(value)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })
  }

  // Calculate session duration
  const calculateDuration = (openingDate: string) => {
    const start = new Date(openingDate)
    const end = new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffHrs}h${diffMins.toString().padStart(2, '0')}`
  }

  // Find user by id
  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId)
  }

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
              <Alert>
                <AlertTitle>Session introuvable</AlertTitle>
                <AlertDescription>
                  La session que vous essayez de fermer n'existe pas ou a déjà été fermée.
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
        </motion.div>
      </div>
    )
  }

  const sessionUser = getUserById(session.user_id)
  const transactionsTotal = sessionTransactions.reduce(
    (sum, t) => sum + parseInt(t.total_amount),
    0
  )

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
                Montant final: {formatFCFA(form.getValues("closing_amount"))}
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
                  <FileText className="h-6 w-6 text-skyblue" />
                  Fermer la session de caisse
                </CardTitle>
                <CardDescription>Remplissez les informations pour fermer la session</CardDescription>
              </div>
              <Badge color="skyblue" className="px-3 py-1 text-sm font-medium">
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
                        <Euro className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                          Total: {formatFCFA(transactionsTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900 flex flex-col">
                    <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Euro className="h-3 w-3" />
                      Ouverture
                    </div>
                    <div className="font-bold text-lg mt-1">{formatFCFA(session.opening_amount)}</div>
                  </div>
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900 flex flex-col">
                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Transactions
                    </div>
                    <div className="font-bold text-lg mt-1">+{formatFCFA(transactionsTotal)}</div>
                  </div>
                  <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-900 flex flex-col">
                    <div className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <Calculator className="h-3 w-3" />
                      Attendu
                    </div>
                    <div className="font-bold text-lg mt-1">
                      {formatFCFA(parseInt(session.opening_amount) + transactionsTotal)}
                    </div>
                  </div>
                </div>
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
                          <Euro className="h-4 w-4" />
                          <span>Montant de fermeture</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="0,00 FCFA"
                              value={field.value ? formatFCFA(field.value) : ""}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              className="pl-10 text-lg font-medium"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <Euro className="h-4 w-4" />
                            </span>
                          </div>
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
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2 bg-green-600 hover:bg-green-700"
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