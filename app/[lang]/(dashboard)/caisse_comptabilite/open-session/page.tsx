"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2, ArrowLeft, Euro } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

interface User {
  id: number
  hierarchical_id: number | null
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface CashRegister {
  id: number
  cash_register_number: string
  active: number
  created_at: string
  updated_at: string
}

interface CashRegisterSession {
  id?: number
  user_id: number
  cash_register_id: number
  opening_date: string
  closing_date?: string
  opening_amount: string
  closing_amount?: string
  status: "open" | "closed"
  created_at?: string
  updated_at?: string
  user?: User
  cash_register?: CashRegister
}

const formSchema = z.object({
  cash_register_id: z.string().min(1, "Veuillez sélectionner une caisse"),
  opening_amount: z.string().min(1, "Veuillez entrer un montant d'ouverture"),
  opening_date: z.date({
    required_error: "Veuillez sélectionner une date d'ouverture",
  }),
})

const currentUser: User = {
  id: 1,
  hierarchical_id: null,
  name: "Tania",
  email: "k@gmail.com",
  email_verified_at: null,
  created_at: "2025-02-20T05:42:54.000000Z",
  updated_at: "2025-02-20T09:21:47.000000Z",
}

const availableCashRegisters: CashRegister[] = [
  {
    id: 1,
    cash_register_number: "1",
    active: 1,
    created_at: "2025-02-20T03:37:19.000000Z",
    updated_at: "2025-02-20T03:39:11.000000Z",
  },
  {
    id: 2,
    cash_register_number: "2",
    active: 1,
    created_at: "2025-02-20T03:37:19.000000Z",
    updated_at: "2025-02-20T03:39:11.000000Z",
  },
  {
    id: 3,
    cash_register_number: "3",
    active: 1,
    created_at: "2025-02-20T03:37:19.000000Z",
    updated_at: "2025-02-20T03:39:11.000000Z",
  },
  {
    id: 4,
    cash_register_number: "5",
    active: 1,
    created_at: "2025-02-20T03:37:19.000000Z",
    updated_at: "2025-02-20T03:39:11.000000Z",
  },
]

export default function OpenCashRegisterSession() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cash_register_id: "",
      opening_amount: "",
      opening_date: new Date(),
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      const newSession: CashRegisterSession = {
        user_id: currentUser.id,
        cash_register_id: Number.parseInt(values.cash_register_id),
        opening_date: values.opening_date.toISOString(),
        opening_amount: values.opening_amount,
        status: "open",
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "✅ Session ouverte",
        description: (
          <div className="mt-2">
            <p>La caisse {values.cash_register_id} a été ouverte avec succès.</p>
            <p className="font-semibold mt-1">Montant: {formatCurrency(values.opening_amount)} €</p>
          </div>
        ),
      })

      router.push("/cash-register/sessions")
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors de l'ouverture de la session",
        color: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    const amount = Number.parseInt(numericValue) / 100
    return amount.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    onChange(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl font-bold text-gray-800">Ouvrir une session de caisse</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Remplissez les informations pour ouvrir une nouvelle session
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                  >
                    <h3 className="font-medium text-gray-700 mb-3">Utilisateur</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-gray-500">Nom:</div>
                      <div className="font-medium">{currentUser.name}</div>
                      <div className="text-gray-500">Email:</div>
                      <div className="font-medium">{currentUser.email}</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="cash_register_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Caisse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Sélectionner une caisse" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableCashRegisters
                                .filter((register) => register.active === 1)
                                .map((register) => (
                                  <SelectItem
                                    key={register.id}
                                    value={register.id.toString()}
                                    className="hover:bg-primary/5"
                                  >
                                    Caisse {register.cash_register_number}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-gray-500">
                            Sélectionnez la caisse que vous souhaitez ouvrir
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="opening_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-gray-700">Date d'ouverture</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="h-11 pl-3 text-left font-normal border-gray-300 hover:border-primary/50 hover:bg-primary/5"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP à HH:mm", { locale: fr })
                                  ) : (
                                    <span className="text-gray-400">Sélectionner une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 text-gray-500" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-lg shadow-lg" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={fr}
                                className="border-none"
                              />
                              <div className="p-3 border-t border-gray-200">
                                <Input
                                  type="time"
                                  value={format(field.value || new Date(), "HH:mm")}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(":")
                                    const newDate = new Date(field.value || new Date())
                                    newDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                                    field.onChange(newDate)
                                  }}
                                  className="focus-visible:ring-primary/50"
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormDescription className="text-gray-500">
                            La date et l'heure d'ouverture de la session
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <FormField
                      control={form.control}
                      name="opening_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Montant d'ouverture</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="0,00"
                                value={field.value ? formatCurrency(field.value) : ""}
                                onChange={(e) => handleCurrencyChange(e, field.onChange)}
                                className="pl-9 h-11 focus-visible:ring-primary/50 border-gray-300"
                              />
                              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Entrez le montant d'ouverture de la caisse
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                    disabled={isSubmitting}
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ouverture en cours...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Ouvrir la session de caisse
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="p-6 border-t border-gray-200 flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 hover:border-primary/50 hover:bg-primary/5"
            >
              Annuler
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}