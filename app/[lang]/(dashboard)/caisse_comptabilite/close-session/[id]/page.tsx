"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Euro } from "lucide-react"
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

// Types
interface User {
  id: number
  hierarchical_id: number | null
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  photo?: string
}

interface CashRegister {
  id: number
  cash_register_number: string
  active: number
  created_at: string
  updated_at: string
  location?: string
}

interface CashRegisterSession {
  id: number
  user_id: number
  cash_register_id: number
  opening_date: string
  closing_date: string | null
  opening_amount: string
  closing_amount: string | null
  status: "open" | "closed"
  created_at: string
  updated_at: string
  user?: User
  cash_register?: CashRegister
  comment?: string
  transactions_count?: number
  transactions_total?: string
}

// Mock data for demonstration
const mockSessions: CashRegisterSession[] = [
  {
    id: 3,
    user_id: 1,
    cash_register_id: 2,
    opening_date: "2025-05-15 07:45:00",
    closing_date: null,
    opening_amount: "500000", // 5000 FCFA
    closing_amount: null,
    status: "open",
    created_at: "2025-05-15T07:45:00.000000Z",
    updated_at: "2025-05-15T07:45:00.000000Z",
    transactions_count: 24,
    transactions_total: "1250000", // 12500 FCFA
    user: {
      id: 1,
      hierarchical_id: null,
      name: "Tania Kaboré",
      email: "tania.kabore@example.com",
      email_verified_at: null,
      created_at: "2025-02-20T05:42:54.000000Z",
      updated_at: "2025-02-20T09:21:47.000000Z",
      photo: "/avatars/tania.jpg"
    },
    cash_register: {
      id: 2,
      cash_register_number: "CAISSE-002",
      active: 1,
      created_at: "2025-02-20T03:37:19.000000Z",
      updated_at: "2025-02-20T03:39:11.000000Z",
      location: "Salle des professeurs"
    },
  },
  {
    id: 4,
    user_id: 3,
    cash_register_id: 3,
    opening_date: "2025-05-15 08:30:00",
    closing_date: null,
    opening_amount: "750000", // 7500 FCFA
    closing_amount: null,
    status: "open",
    created_at: "2025-05-15T08:30:00.000000Z",
    updated_at: "2025-05-15T08:30:00.000000Z",
    transactions_count: 18,
    transactions_total: "980000", // 9800 FCFA
    user: {
      id: 3,
      hierarchical_id: null,
      name: "Sophie Martin",
      email: "sophie.martin@example.com",
      email_verified_at: null,
      created_at: "2025-02-20T05:42:54.000000Z",
      updated_at: "2025-02-20T09:21:47.000000Z",
      photo: "/avatars/sophie.jpg"
    },
    cash_register: {
      id: 3,
      cash_register_number: "CAISSE-003",
      active: 1,
      created_at: "2025-02-20T03:37:19.000000Z",
      updated_at: "2025-02-20T03:39:11.000000Z",
      location: "Accueil principal"
    },
  }
]

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<CashRegisterSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closing_amount: "",
      comment: "",
    },
  })

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        const sessionId = Number(id)
        const foundSession = mockSessions.find((s) => s.id === sessionId)

        if (!foundSession) {
          setError("Session introuvable")
          return
        }

        if (foundSession.status === "closed") {
          setError("Cette session est déjà fermée")
          return
        }

        setSession(foundSession)
        // Pre-fill closing amount with expected value (opening + transactions)
        const expectedAmount = (parseInt(foundSession.opening_amount) + parseInt(foundSession.transactions_total || "0")).toString()
        form.setValue("closing_amount", expectedAmount)
      } catch (error) {
        console.error("Error fetching session:", error)
        setError("Une erreur est survenue lors de la récupération des données")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [params.id, form])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success animation
      setShowSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to sessions list
      router.push("/caisse_comptabilite/session_caisse")
    } catch (error) {
      console.error("Error closing session:", error)
      setError("Une erreur est survenue lors de la fermeture")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format FCFA currency
  const formatFCFA = (value: string) => {
    const numericValue = parseInt(value || "0")
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
              <CardTitle className="text-2xl">Erreur</CardTitle>
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
              <Button variant="outline" onClick={() => router.push("/cash-register/sessions")}>
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
              <Button variant="outline" onClick={() => router.push("/cash-register/sessions")}>
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
              className="bg-white dark:bg-gray-900 p-8 rounded-lg max-w-md text-center"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Session fermée</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                La session #{session.id} a été fermée avec succès.
              </p>
              <div className="text-lg font-semibold">
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
                <CardTitle className="text-2xl">Fermer la session de caisse</CardTitle>
                <CardDescription>Remplissez les informations pour fermer la session</CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                #{session.id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Session information */}
              <div className="p-5 rounded-lg bg-gray-50 dark:bg-gray-800 border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>Résumé de la session</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Caisse:</span>
                      <span className="font-medium">N° {session.cash_register?.cash_register_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Lieu:</span>
                      <span className="font-medium">{session.cash_register?.location || "Non spécifié"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Ouverte par:</span>
                      <span className="font-medium">{session.user?.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date d'ouverture:</span>
                      <span className="font-medium">{formatDate(session.opening_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Durée:</span>
                      <span className="font-medium">{calculateDuration(session.opening_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Transactions:</span>
                      <span className="font-medium">{session.transactions_count || 0}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Ouverture</div>
                    <div className="font-bold text-lg">{formatFCFA(session.opening_amount)}</div>
                  </div>
                  <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900">
                    <div className="text-sm text-green-600 dark:text-green-400">Transactions</div>
                    <div className="font-bold text-lg">+{formatFCFA(session.transactions_total || "0")}</div>
                  </div>
                  <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-900">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Attendu</div>
                    <div className="font-bold text-lg">
                      {formatFCFA((parseInt(session.opening_amount) + parseInt(session.transactions_total || "0")).toString())}
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">FCFA</span>
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
                        <FormLabel>Commentaire (optionnel)</FormLabel>
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