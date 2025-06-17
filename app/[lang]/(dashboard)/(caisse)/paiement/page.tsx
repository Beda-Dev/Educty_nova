"use client"

import { useState, useMemo, useEffect } from "react"
import { useSchoolStore } from "@/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Check,
  ChevronDown,
  Search,
  User,
  Calendar,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Printer,
  AwardIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Student, Pricing, Installment, Payment, Transaction, Registration } from "@/lib/interface"
import { fetchPayment, fetchStudents, fetchTransactions } from "@/store/schoolservice"

interface StudentFinancialData {
  student: Student
  applicablePricing: Pricing[]
  totalDue: number
  totalPaid: number
  totalRemaining: number
  overdueAmount: number
  registration?: Registration
  installmentDetails: {
    installment: Installment
    pricing: Pricing
    payments: Payment[]
    amountPaid: number
    remainingAmount: number
    isOverdue: boolean
  }[]
}

const formatAmount = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

export default function PaymentManagementPage() {
  const {
    registrations,
    students,
    pricing,
    installements,
    payments,
    academicYearCurrent,
    methodPayment,
    settings,
    cashRegisterSessionCurrent,
    userOnline,
    setPayments,
    setTransactions,
    levels,
    classes,
  } = useSchoolStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")
  const [isProcessing, setIsProcessing] = useState(false)
  const [CurrentClass, setCurrentClass] = useState("")
  const [CurrentLevel, setCurrentLevel] = useState("")

  // États pour le formulaire de paiement
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([])
  const [installmentAmounts, setInstallmentAmounts] = useState<Record<number, number>>({})
  const [paymentMethods, setPaymentMethods] = useState<Record<number, Array<{ id: number; amount: number }>>>({})
  const [givenAmount, setGivenAmount] = useState(0)
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(methodPayment[0]?.id || 0)
  const [openConfirmModal, setOpenConfirmModal] = useState(false)
  const [openSuccessModal, setOpenSuccessModal] = useState(false)
  const [installmentErrors, setInstallmentErrors] = useState<Record<number, string>>({})
  const [globalError, setGlobalError] = useState<string>("")
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null)
  const [createdPayments, setCreatedPayments] = useState<Payment[]>([])

  const currency = settings && settings[0]?.currency ? settings[0].currency : "FCFA"

  // Filtrer les élèves inscrits pour l'année académique courante
  const currentYearStudents = useMemo(() => {
    const currentRegistrations = registrations.filter((reg) => reg.academic_year_id === academicYearCurrent.id)

    return currentRegistrations
      .map((reg) => {
        const student = students.find((s) => s.id === reg.student_id)
        return student ? { ...student, registration: reg } : null
      })
      .filter(Boolean) as (Student & { registration: any })[]
  }, [registrations, students, academicYearCurrent])

  // Filtrer les élèves selon le terme de recherche
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return []

    return currentYearStudents.filter(
      (student) =>
        student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.first_name} ${student.name}`.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [currentYearStudents, searchTerm])

  // Calculer les données financières de l'élève sélectionné
  const financialData = useMemo((): StudentFinancialData | null => {
    if (!selectedStudent) return null

    const studentRegistration = registrations.find(
      (reg) => reg.student_id === selectedStudent.id && reg.academic_year_id === academicYearCurrent.id,
    )

    if (!studentRegistration) return null
    // mis a jour des classe et niveau
    setCurrentClass(studentRegistration.classe.label)
    const niveauCurrent = levels.find((level) => Number(level.id) === Number(studentRegistration.classe.level_id))
    setCurrentLevel(niveauCurrent?.label || "")

    // Trouver les pricing applicables
    const applicablePricing = pricing.filter(
      (p) =>
        p.assignment_type_id === selectedStudent.assignment_type_id &&
        p.academic_years_id === academicYearCurrent.id &&
        p.level_id === studentRegistration.classe.level_id,
    )

    // Calculer les détails des échéances
    const installmentDetails = []
    let totalDue = 0
    let totalPaid = 0
    let overdueAmount = 0

    for (const pricingItem of applicablePricing) {
      const pricingInstallments = installements.filter((inst) => inst.pricing_id === pricingItem.id)

      for (const installment of pricingInstallments) {
        // Filtrer les paiements pour cette échéance ET cet élève
        const installmentPayments = Array.isArray(payments)
          ? payments.filter((p) => p.installment_id === installment.id && p.student_id === selectedStudent.id)
          : []

        // Calculer le montant total payé pour cette échéance
        const amountPaid = installmentPayments.reduce((sum, payment) => {
          const paymentAmount = Number.parseFloat(payment.amount) || 0
          return sum + paymentAmount
        }, 0)

        const amountDue = Number.parseFloat(installment.amount_due) || 0
        const remainingAmount = Math.max(0, amountDue - amountPaid)
        const isOverdue = new Date(installment.due_date) < new Date() && remainingAmount > 0

        totalDue += amountDue
        totalPaid += amountPaid

        if (isOverdue) {
          overdueAmount += remainingAmount
        }

        installmentDetails.push({
          installment,
          pricing: pricingItem,
          payments: installmentPayments,
          amountPaid,
          remainingAmount,
          isOverdue,
        })
      }
    }

    return {
      student: selectedStudent,
      applicablePricing,
      totalDue,
      totalPaid,
      totalRemaining: totalDue - totalPaid,
      overdueAmount,
      registration:studentRegistration,
      installmentDetails,
    }
  }, [selectedStudent, registrations, academicYearCurrent, pricing, installements, payments])

  useEffect(() => {
    setSelectedInstallments([])
    setInstallmentAmounts({})
    setPaymentMethods({})
    setGivenAmount(0)
    setTotalPaidAmount(0)
    setInstallmentErrors({})
    setGlobalError("")
    setCurrentClass("")
    setCurrentLevel("")
  }, [selectedStudent])

  useEffect(() => {
    const total = Object.values(installmentAmounts).reduce((sum, amount) => sum + amount, 0)
    setTotalPaidAmount(total)
  }, [installmentAmounts])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

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

      const installmentDetail = financialData?.installmentDetails.find(
        (detail) => detail.installment.id === installmentId,
      )

      if (installmentDetail && installmentDetail.remainingAmount > 0) {
        const maxAvailable = Math.min(
          installmentDetail.remainingAmount,
          Math.max(0, givenAmount - totalPaidAmount),
        )

        const defaultAmount = maxAvailable > 0 ? maxAvailable : installmentDetail.remainingAmount

        setInstallmentAmounts({
          ...installmentAmounts,
          [installmentId]: defaultAmount,
        })

        setPaymentMethods({
          ...paymentMethods,
          [installmentId]: [
            {
              id: methodPayment[0]?.id || 0,
              amount: defaultAmount,
            },
          ],
        })
      }
    }
  }

  const handleAmountChange = (installmentId: number, amount: number | string) => {
    const numericAmount = amount === "" ? 0 : Number(amount) || 0

    const installmentDetail = financialData?.installmentDetails.find(
      (detail) => detail.installment.id === installmentId,
    )

    if (installmentDetail) {
      const maxAmount = installmentDetail.remainingAmount
      if (numericAmount > maxAmount) {
        setInstallmentErrors({
          ...installmentErrors,
          [installmentId]: `Le montant ne peut pas dépasser ${formatAmount(maxAmount)} ${currency}`,
        })
        return
      }

      const totalSansActuel = Object.entries(installmentAmounts)
        .filter(([id]) => Number(id) !== installmentId)
        .reduce((sum, [, amt]) => sum + amt, 0)

      if (numericAmount + totalSansActuel > givenAmount) {
        setGlobalError("La somme répartie dépasse le montant donné.")
        return
      } else {
        setGlobalError("")
      }

      setInstallmentErrors({
        ...installmentErrors,
        [installmentId]: "",
      })

      setInstallmentAmounts((prev) => ({
        ...prev,
        [installmentId]: numericAmount,
      }))

      const currentMethods = paymentMethods[installmentId] || []
      if (currentMethods.length === 1) {
        setPaymentMethods((prev) => ({
          ...prev,
          [installmentId]: [{ ...currentMethods[0], amount: numericAmount }],
        }))
      }
    }
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

    const totalMethodAmount = updatedMethods.reduce((sum, method) => sum + method.amount, 0)
    const installmentAmount = installmentAmounts[installmentId] || 0

    setInstallmentErrors((prev) => ({
      ...prev,
      [installmentId]:
        totalMethodAmount !== installmentAmount
          ? `La somme des méthodes (${formatAmount(totalMethodAmount)} ${currency}) ne correspond pas au montant de l'échéance (${formatAmount(installmentAmount)} ${currency}).`
          : "",
    }))
  }

  const validatePaymentMethods = (installmentId: number): boolean => {
    const methods = paymentMethods[installmentId] || []
    if (methods.length === 0) return false

    for (const m of methods) {
      if (!m.id || m.amount <= 0 || Number.isNaN(m.amount)) return false
    }

    const totalMethodAmount = methods.reduce((sum, method) => sum + method.amount, 0)
    const installmentAmount = installmentAmounts[installmentId] || 0
    return totalMethodAmount === installmentAmount
  }

  const rollbackTransaction = async (transactionId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transaction/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Échec de la suppression de la transaction')
      }

      return true
    } catch (error) {
      console.error('Erreur lors du rollback:', error)
      return false
    }
  }

  const handlePayment = async () => {
    if (!cashRegisterSessionCurrent) {
      toast({
        title: "Erreur",
        description: "Aucune session de caisse ouverte. Veuillez ouvrir une session avant de procéder au paiement.",
        color: "destructive",
      })
      return
    }

    if (selectedInstallments.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une échéance",
        color: "destructive",
      })
      return
    }

    if (totalPaidAmount === 0) {
      toast({
        title: "Erreur",
        description: "Le montant total versé doit être supérieur à 0",
        color: "destructive",
      })
      return
    }

    if (totalPaidAmount > givenAmount) {
      toast({
        title: "Erreur",
        description: "La somme répartie ne peut pas dépasser le montant donné.",
        color: "destructive",
      })
      return
    }

    for (const installmentId of selectedInstallments) {
      if (!validatePaymentMethods(installmentId)) {
        toast({
          title: "Erreur",
          description: `Veuillez choisir des méthodes de paiement valides pour l'échéance`,
          color: "destructive",
        })
        return
      }
    }

    setIsProcessing(true)

    try {
      const paymentResults = []
      const createdTransactions = []
      const createdPayments = []

      // Traiter chaque échéance sélectionnée individuellement
      for (const installmentId of selectedInstallments) {
        const installmentDetail = financialData?.installmentDetails.find(
          (detail) => detail.installment.id === installmentId,
        )

        if (!installmentDetail) continue

        const methods = paymentMethods[installmentId].map(method => ({
          id: method.id,
          montant: method.amount.toString()
        }))

        // Créer une transaction pour ce paiement
        const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userOnline?.id || 0,
            cash_register_session_id: cashRegisterSessionCurrent.id,
            transaction_date: new Date().toISOString().split("T")[0],
            total_amount: installmentAmounts[installmentId].toString(),
            transaction_type: "encaissement",
          }),
        })

        if (!transactionResponse.ok) {
          throw new Error(`Échec de la création de la transaction pour l'échéance ${installmentId}`)
        }

        const transactionData = await transactionResponse.json()
        createdTransactions.push(transactionData)

        // Créer le paiement associé
        const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: selectedStudent?.id,
            installment_id: installmentId,
            cash_register_id: cashRegisterSessionCurrent.cash_register.id,
            cashier_id: userOnline?.id,
            amount: installmentAmounts[installmentId].toString(),
            transaction_id: transactionData.id,
            methods: methods
          }),
        })

        if (!paymentResponse.ok) {
          // Rollback de la transaction si le paiement échoue
          await rollbackTransaction(transactionData.id)
          throw new Error(`Échec de la création du paiement pour l'échéance ${installmentId}`)
        }

        const paymentData = await paymentResponse.json()
        createdPayments.push(paymentData)

        paymentResults.push({
          transaction: transactionData,
          payment: paymentData,
          installment: installmentDetail
        })
      }

      // Mettre à jour le store avec les nouvelles données
      const updatedTransactions = await fetchTransactions()
      const updatedPayments = await fetchPayment()
      setTransactions(updatedTransactions)
      setPayments(updatedPayments)

      // Sauvegarder les données créées pour l'affichage du récapitulatif
      setCreatedTransaction(createdTransactions[0]) // On garde la première transaction pour l'affichage
      setCreatedPayments(createdPayments)

      // Afficher le modal de succès
      setOpenSuccessModal(true)
      setIsProcessing(false)

      toast({
        title: "Succès",
        description: `${createdTransactions.length} paiement(s) effectué(s) avec succès`,
        color: "success",
      })

    } catch (error) {
      setIsProcessing(false)
      let errorMessage = "Une erreur est survenue lors du paiement"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      console.error('Erreur lors du paiement:', error)

      toast({
        title: "Erreur",
        description: errorMessage,
        color: "destructive",
      })
    }
  }

  const resetPaymentForm = () => {
    setSelectedInstallments([])
    setInstallmentAmounts({})
    setPaymentMethods({})
    setGivenAmount(0)
    setTotalPaidAmount(0)
    setInstallmentErrors({})
    setGlobalError("")
    setOpenSuccessModal(false)
    setCreatedTransaction(null)
    setCreatedPayments([])
    setActiveTab("summary")
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
            <p className="text-muted-foreground">Consultez et effectuez des paiements pour les élèves</p>
          </div>

        </div>
      </CardHeader>
      <CardContent>

      

      {/* Recherche d'élève */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher un élève
          </CardTitle>
          <CardDescription>Recherchez par matricule, nom ou prénom</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <Popover  open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    {selectedStudent
                      ? `${selectedStudent.registration_number} - ${selectedStudent.first_name} ${selectedStudent.name}`
                      : "Sélectionner un élève..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full md:w-[600px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Rechercher un élève..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun élève inscrit trouvé.</CommandEmpty>
                      <CommandGroup>
                        {filteredStudents.map((student) => {
                          const classe = classes.find((classe) => classe.id === student.registration?.classe_id)
                          const niveau = levels.find((niveau) => niveau.id === classe?.level_id)
                          return (
                            <CommandItem
                              key={student.id}
                              value={`${student.registration_number} ${student.first_name} ${student.name}`}
                              onSelect={() => {
                                setSelectedStudent(student)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStudent?.id === student.id ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {student.first_name} {student.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {student.registration_number} - {student.assignment_type.label}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Classe : {student.registration?.classe.label ?? "-"}
                                </span>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal - Résumé financier et formulaire de paiement */}
      {financialData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Résumé Financier</TabsTrigger>
            <TabsTrigger value="payment">Effectuer un Paiement</TabsTrigger>
          </TabsList>

          {/* Onglet Résumé Financier */}
          <TabsContent value="summary" className="space-y-6">
            {/* Informations de l'élève */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations de l'élève
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nom complet</Label>
                    <p className="text-lg font-semibold">
                      {financialData.student.first_name} {financialData.student.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Matricule</Label>
                    <p className="text-lg font-semibold">{financialData.student.registration_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type d'affectation</Label>
                    <p className="text-lg font-semibold">{financialData.student.assignment_type.label}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Classe</Label>
                    <p className="text-lg font-semibold">
                      {financialData.registration?.classe?.label ?? "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Niveau</Label>
                    <p className="text-lg font-semibold">
                      {levels.find((level) =>
                        level.id ===
                        classes.find((classe) => classe.id === financialData.registration?.class_id)?.level_id
                      )?.label ?? "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date d'inscription</Label>
                    <p className="text-lg font-semibold">
                      {financialData.registration?.registration_date ?? "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Résumé des montants */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total dû</p>
                      <p className="text-2xl font-bold">{`${formatAmount(financialData.totalDue)} ${currency}`}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total payé</p>
                      <p className="text-2xl font-bold text-green-600">{`${formatAmount(financialData.totalPaid)} ${currency}`}</p>
                    </div>
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reste à payer</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {`${formatAmount(financialData.totalRemaining)} ${currency}`}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">En retard</p>
                      <p className="text-2xl font-bold text-red-600">{`${formatAmount(financialData.overdueAmount)} ${currency}`}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Détail des échéances */}
            <Card>
              <CardHeader>
                <CardTitle>Détail des échéances</CardTitle>
                <CardDescription>Liste complète des frais, échéances et paiements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type de frais</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Montant dû</TableHead>
                      <TableHead>Montant payé</TableHead>
                      <TableHead>Reste</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.installmentDetails.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{detail.pricing.label}</p>
                            <p className="text-sm text-muted-foreground">{detail.pricing.fee_type.label}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(detail.installment.due_date)}</TableCell>
                        <TableCell>{`${formatAmount(Number.parseFloat(detail.installment.amount_due))} ${currency}`}</TableCell>
                        <TableCell className="text-green-600">{`${formatAmount(detail.amountPaid)} ${currency}`}</TableCell>
                        <TableCell className={detail.remainingAmount > 0 ? "text-orange-600" : "text-green-600"}>
                          {`${formatAmount(detail.remainingAmount)} ${currency}`}
                        </TableCell>
                        <TableCell>
                          {detail.remainingAmount === 0 ? (
                            <Badge color="success" className="">
                              Payé
                            </Badge>
                          ) : detail.isOverdue ? (
                            <Badge color="destructive">En retard</Badge>
                          ) : (
                            <Badge color="warning">En attente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Liste des paiements effectués */}
            {financialData.installmentDetails.some((detail) => detail.payments.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique des paiements</CardTitle>
                  <CardDescription>Tous les paiements effectués par l'élève</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type de frais</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Caissier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialData.installmentDetails
                        .flatMap((detail) =>
                          detail.payments.map((payment) => ({
                            ...payment,
                            pricingLabel: detail.pricing.label,
                          })),
                        )
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(payment.created_at)}</TableCell>
                            <TableCell>{payment.pricingLabel}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              {formatAmount(Number.parseFloat(payment.amount))}
                            </TableCell>
                            <TableCell>{payment.cashier.name}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}


            <div className="flex justify-end">
              <Button color="indigodye" onClick={() => setActiveTab("payment")}>Effectuer un paiement</Button>
            </div>
          </TabsContent>

          {/* Onglet Effectuer un Paiement */}
          <TabsContent value="payment" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="text-2xl font-bold tracking-tight">Paiement des frais scolaires</CardTitle>
                <CardDescription>
                  Élève: {financialData.student.first_name} {financialData.student.name} (
                  {financialData.student.registration_number})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium leading-none">Montant donné</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                      value={givenAmount ? givenAmount.toLocaleString("fr-FR").replace(/,/g, " ") : ""}
                      onChange={(e) => {
                        // On enlève tous les caractères non numériques
                        const raw = e.target.value.replace(/\D/g, "")
                        setGivenAmount(raw ? Number(raw) : 0)
                      }}
                      className="h-10"
                      autoComplete="off"
                    />
                    <p className="text-sm text-muted-foreground">
                      Minimum: {totalPaidAmount.toLocaleString()} {currency}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium leading-none">Méthode de paiement par défaut</Label>
                    <Select
                      value={selectedPaymentMethod.toString()}
                      onValueChange={(value) => setSelectedPaymentMethod(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {methodPayment.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Cette méthode sera utilisée par défaut pour les nouvelles échéances
                    </p>
                  </div>
                </div>

                {globalError && (
                  <Alert color="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{globalError}</AlertDescription>
                  </Alert>
                )}

                {financialData.applicablePricing.map((pricing) => (
                  <div key={pricing.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-lg">
                        {pricing.fee_type.label} - {Number.parseInt(pricing.amount).toLocaleString()} {currency}
                      </h4>
                      <Badge variant="outline">
                        {pricing.installments?.length || 0} échéance{pricing.installments?.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {pricing.installments && pricing.installments.length > 0 ? (
                      <div className="space-y-6">
                        <Separator />

                        {pricing.installments.map((installment) => {
                          // Trouver les détails de cette échéance
                          const installmentDetail = financialData.installmentDetails.find(
                            (detail) => detail.installment.id === installment.id,
                          )

                          // Ne pas afficher les échéances déjà entièrement payées
                          if (installmentDetail && installmentDetail.remainingAmount <= 0) {
                            return (
                              <div key={installment.id} className="border rounded-md p-4 bg-green-50 border-green-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-green-800">Échéance entièrement payée</p>
                                    <p className="text-sm text-green-600">
                                      Échéance: {formatDate(installment.due_date)} - Montant payé:{" "}
                                      {`${formatAmount(installmentDetail.amountPaid)} ${currency}`}
                                    </p>
                                  </div>
                                  <Badge color="success">
                                    Payé
                                  </Badge>
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div key={installment.id} className="border rounded-md p-4 space-y-4">
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
                                      {installmentDetail
                                        ? `${formatAmount(installmentDetail.remainingAmount)} ${currency}`
                                        : `${formatAmount(Number.parseInt(installment.amount_due))} ${currency}`}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Échéance: {formatDate(installment.due_date)}
                                    {installmentDetail?.isOverdue && (
                                      <span className="text-red-500 ml-2">(En retard)</span>
                                    )}
                                  </p>
                                </Label>
                              </div>

                              {selectedInstallments.includes(installment.id) && (
                                <div className="ml-8 space-y-6">
                                  <div className="space-y-2">
                                    <Label>Montant à verser</Label>
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9 ]*"
                                        value={
                                          installmentAmounts[installment.id]
                                            ? installmentAmounts[installment.id]
                                              .toLocaleString("fr-FR")
                                              .replace(/,/g, " ")
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const raw = e.target.value.replace(/\D/g, "")
                                          handleAmountChange(installment.id, raw ? Number(raw) : "")
                                        }}
                                        max={
                                          installmentDetail
                                            ? installmentDetail.remainingAmount
                                            : Number(installment.amount_due)
                                        }
                                        min={0}
                                        className="h-10"
                                        autoComplete="off"
                                        placeholder={`Montant (${currency})`}
                                      />
                                      <span className="text-gray-500 text-sm">{currency}</span>
                                    </div>
                                    {installmentDetail && (
                                      <Progress
                                        value={
                                          ((installmentAmounts[installment.id] || 0) /
                                            installmentDetail.remainingAmount) *
                                          100
                                        }
                                        className="h-2"
                                      />
                                    )}
                                    {installmentErrors[installment.id] && (
                                      <p className="text-sm text-red-500">{installmentErrors[installment.id]}</p>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <Label>Méthodes de paiement</Label>
                                    {(paymentMethods[installment.id] || []).map((method, index) => (
                                      <div key={index} className="flex gap-3 items-center">
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
                                          type="text"
                                          placeholder="Montant"
                                          inputMode="numeric"
                                          pattern="[0-9 ]*"
                                          value={
                                            method.amount
                                              ? method.amount.toLocaleString("fr-FR").replace(/,/g, " ")
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, "")
                                            updatePaymentMethod(installment.id, index, "amount", raw ? Number(raw) : 0)
                                          }}
                                          className="w-32 h-10"
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
                                      </div>
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
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune échéance définie</p>
                    )}
                  </div>
                ))}

                {totalPaidAmount > 0 && (
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                    <h4 className="font-semibold text-lg mb-4">Récapitulatif</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total à payer</p>
                        <p className="text-xl font-bold text-primary">
                          {totalPaidAmount.toLocaleString()} {currency}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Montant donné</p>
                        <p className="text-xl font-bold">
                          {givenAmount.toLocaleString()} {currency}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Monnaie à rendre</p>
                        <p className="text-xl font-bold">
                          {Math.max(givenAmount - totalPaidAmount, 0).toLocaleString()} {currency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button color="destructive" variant="outline" onClick={() => setActiveTab("summary")}>
                  Retour au résumé
                </Button>
                <Button
                  color="indigodye"
                  onClick={handlePayment}
                  disabled={
                    selectedInstallments.length === 0 ||
                    totalPaidAmount === 0 ||
                    givenAmount < totalPaidAmount ||
                    !!globalError ||
                    Object.values(installmentErrors).some((err) => !!err) ||
                    selectedInstallments.some((id) => !validatePaymentMethods(id))
                  }
                >
                  Effectuer le paiement
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedStudent && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun élève sélectionné</h3>
            <p className="text-muted-foreground">
              Utilisez la barre de recherche ci-dessus pour trouver et sélectionner un élève
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmation de paiement réussi */}
      {/* Modal de confirmation de paiement réussi */}
      <Dialog open={openSuccessModal} onOpenChange={setOpenSuccessModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Paiement(s) effectué(s) avec succès
            </DialogTitle>
            <DialogDescription>{createdPayments.length} paiement(s) enregistré(s) dans le système.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="payments">Détails des paiements</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions">
                <div className="space-y-4">
                  {createdPayments.map((payment, index) => {
                    const transaction = payments.find(t => t.id === payment.transaction_id)
                    const installmentDetail = financialData?.installmentDetails.find(
                      detail => detail.installment.id === payment.installment_id
                    )

                    return (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Transaction #{transaction?.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              {transaction ? formatDate(transaction.created_at) : ''}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {`${formatAmount(Number(payment.amount))} ${currency}`}
                          </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Échéance:</span>
                            <p>{installmentDetail?.pricing.label || payment.installment_id}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date échéance:</span>
                            <p>{installmentDetail ? formatDate(installmentDetail.installment.due_date) : '-'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="payments">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Échéance</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthodes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {createdPayments.map((payment, index) => {
                        const transaction = payments.find(t => t.id === payment.transaction_id)
                        const installmentDetail = financialData?.installmentDetails.find(
                          detail => detail.installment.id === payment.installment_id
                        )
                        const methods = paymentMethods[payment.installment_id] || []

                        return (
                          <TableRow key={index}>
                            <TableCell>#{transaction?.id}</TableCell>
                            <TableCell>
                              {installmentDetail
                                ? `${installmentDetail.pricing.label} (${formatDate(installmentDetail.installment.due_date)})`
                                : `Échéance #${payment.installment_id}`}
                            </TableCell>
                            <TableCell className="font-medium">
                              {`${formatAmount(Number(payment.amount))} ${currency}`}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {methods.map((method, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {methodPayment.find(m => m.id === method.id)?.name}: {`${formatAmount(method.amount)} ${currency}`}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={resetPaymentForm}>
              Fermer
            </Button>
            <Button onClick={resetPaymentForm}>Nouveau paiement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </CardContent>
    </Card>
  )
}
