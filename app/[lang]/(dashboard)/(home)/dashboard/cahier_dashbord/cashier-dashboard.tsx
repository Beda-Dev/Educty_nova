"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolStore } from "@/store"
import { useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  AlertCircle,
  BarChart3,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Receipt,
  Timer,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  fetchPayment,
  fetchExpenses,
  fetchCashRegisterSessions,
  fetchDemands,
  fetchRegistration,
  fetchpricing,
  fetchInstallment,
  fetchPaymentMethods,
} from "@/store/schoolservice"
import FinancialAnalytics from "./components/financial-analytics"
import TemporalAnalysis from "./components/temporal-analysis"
import type {

  OverduePayment,
  FinancialMetrics,
  TemporalTrends,
  PerformanceData,
  PaymentMethodAnalysis,
} from "./types/cashier-dashboard"
import {
  Payment, Expense,
  CashRegisterSession,
  Demand,
  Registration, Student
} from "@/lib/interface"
import Loading from "../loading"

interface CashierDashboardProps {
  trans?: Record<string, string>
}

/**
 * Composant principal du tableau de bord caissier
 * Affiche les informations relatives aux opérations de caisse basées sur les données réelles
 */
const CashierDashboard = ({ trans }: CashierDashboardProps) => {
  const {
    payments,
    expenses,
    cashRegisterSessions,
    demands,
    registrations,
    pricing,
    installements,
    methodPayment,
    userOnline,
    academicYearCurrent,
    settings,
    cashRegisterCurrent,
    cashRegisterSessionCurrent,
    students, academicYears
  } = useSchoolStore()

  // États pour la gestion du composant
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(academicYearCurrent?.id || 0)
  const [refreshing, setRefreshing] = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState({
    stats: true,
    payments: true,
    expenses: true,
    sessions: true,
    demands: true,
    overdue: true,
  })


  /**
   * Filtrer les données par année académique et utilisateur connecté
   */
  const currentYearRegistrations: Registration[] =
    registrations?.filter((reg: Registration) => reg.academic_year_id === selectedAcademicYear) || []

  // Paiements effectués par le caissier connecté
  const cashierPayments: Payment[] = payments?.filter((payment: Payment) => payment.cashier_id === userOnline?.id) || []

  // Dépenses validées par le caissier connecté
  const cashierExpenses: Expense[] =
    expenses?.filter((expense: Expense) => expense.cash_register_id === cashRegisterCurrent?.id) || []

  // Sessions de caisse du caissier connecté
  const cashierSessions: CashRegisterSession[] =
    cashRegisterSessions?.filter((session: CashRegisterSession) => session.user_id === userOnline?.id) || []

  // Demandes de décaissement faites par le caissier
  const cashierDemands: Demand[] = demands?.filter((demand: Demand) => demand.applicant_id === userOnline?.id) || []

  /**
   * Calcul des statistiques principales basées sur les données réelles
   */
  const totalPaymentsAmount: number = cashierPayments.reduce(
    (sum, payment) => sum + Number.parseFloat(payment.amount || "0"),
    0,
  )

  const totalExpensesAmount: number = cashierExpenses.reduce(
    (sum, expense) => sum + Number.parseFloat(expense.amount || "0"),
    0,
  )

  const totalTransactionsCount: number = cashierPayments.length + cashierExpenses.length
  const activeSessionsCount: number = cashierSessions.filter((session) => session.status === "open").length
  const pendingDemandsCount: number = cashierDemands.filter((demand) => demand.status === "en attente").length

  /**
   * Statistiques par méthode de paiement basées sur les données réelles
   */
  const paymentsByMethod: PaymentMethodAnalysis[] =
    methodPayment?.map((method) => {
      const methodPayments = cashierPayments.filter((payment) =>
        payment.payment_methods?.some((pm) => pm.id === method.id),
      )
      const totalAmount = methodPayments.reduce((sum, payment) => {
        const methodAmount = payment.payment_methods?.find((pm) => pm.id === method.id)?.pivot?.montant || "0"
        return sum + Number.parseFloat(methodAmount)
      }, 0)

      return {
        method: method.name,
        count: methodPayments.length,
        amount: totalAmount,
        percentage: totalPaymentsAmount > 0 ? (totalAmount / totalPaymentsAmount) * 100 : 0,
      }
    }) || []

  /**
   * Calcul des retards de paiement basé sur les données réelles
   */
  const calculateOverduePayments = (): OverduePayment[] => {
    const overduePayments: OverduePayment[] = []

    currentYearRegistrations.forEach((registration) => {
      const Eleve = students.find((student) => Number(student.id) === Number(registration.student_id)) as Student
      const relevantPricing =
        pricing?.filter(
          (p) =>
            p.academic_years_id === registration.academic_year_id &&
            p.level_id === registration.classe?.level_id &&
            p.assignment_type_id === registration.student?.assignment_type_id,
        ) || []

      relevantPricing.forEach((price) => {
        const relevantInstallments =
          installements?.filter((inst) => inst.pricing_id === price.id && inst.status !== "paid") || []

        relevantInstallments.forEach((installment) => {
          const dueDate = new Date(installment.due_date)
          const today = new Date()
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysOverdue > 0) {
            const paymentMade = payments?.some(
              (payment) => payment.student_id === registration.student_id && payment.installment_id === installment.id,
            )

            if (!paymentMade) {
              overduePayments.push({
                student: Eleve,
                registration,
                pricing: price,
                installment,
                daysOverdue,
              })
            }
          }
        })
      })
    })

    return overduePayments
  }

  const overduePayments: OverduePayment[] = calculateOverduePayments()

  /**
   * CALCULS STATISTIQUES BASÉS SUR LES DONNÉES RÉELLES
   */

  // 1. ANALYSE TEMPORELLE - Calcul des tendances par période
  const calculateTemporalTrends = (): TemporalTrends => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Paiements par mois (12 derniers mois)
    const monthlyPayments = Array.from({ length: 12 }, (_, i) => {
      const targetMonth = (currentMonth - i + 12) % 12
      const targetYear = currentYear - (i > currentMonth ? 1 : 0)

      const monthPayments = cashierPayments.filter((payment) => {
        const paymentDate = new Date(payment.created_at)
        return paymentDate.getMonth() === targetMonth && paymentDate.getFullYear() === targetYear
      })

      return {
        month: new Date(targetYear, targetMonth).toLocaleDateString("fr-FR", { month: "short" }),
        year: targetYear,
        count: monthPayments.length,
        amount: monthPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0),
        avgAmount:
          monthPayments.length > 0
            ? monthPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0) / monthPayments.length
            : 0,
      }
    }).reverse()

    // Paiements par jour de la semaine
    const weeklyDistribution = Array.from({ length: 7 }, (_, i) => {
      const dayPayments = cashierPayments.filter((payment) => {
        const paymentDate = new Date(payment.created_at)
        return paymentDate.getDay() === i
      })

      return {
        day: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][i],
        count: dayPayments.length,
        amount: dayPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0),
        percentage: cashierPayments.length > 0 ? (dayPayments.length / cashierPayments.length) * 100 : 0,
      }
    })

    // Paiements par heure (distribution horaire)
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourPayments = cashierPayments.filter((payment) => {
        const paymentDate = new Date(payment.created_at)
        return paymentDate.getHours() === hour
      })

      return {
        hour: `${hour.toString().padStart(2, "0")}h`,
        count: hourPayments.length,
        amount: hourPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0),
      }
    })

    return { monthlyPayments, weeklyDistribution, hourlyDistribution }
  }

  // 2. ANALYSE FINANCIÈRE - Calcul des métriques financières
  const calculateFinancialMetrics = (): FinancialMetrics => {
    // Calcul du chiffre d'affaires par étudiant
    const revenuePerStudent = new Map<number, number>()
    cashierPayments.forEach((payment) => {
      const studentId = payment.student_id
      const amount = Number.parseFloat(payment.amount || "0")
      revenuePerStudent.set(studentId, (revenuePerStudent.get(studentId) || 0) + amount)
    })

    // Top 10 des étudiants par montant payé
    const topPayingStudents = Array.from(revenuePerStudent.entries())
      .map(([studentId, amount]) => {
        const student = students.find((reg) => Number(reg.id) === Number(studentId))

        return { student, amount, studentId }
      })
      .filter(
        (item): item is { student: NonNullable<typeof item.student>; amount: number; studentId: number } =>
          item.student !== undefined,
      )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    // Analyse des échéances
    const installmentAnalysis = installements?.reduce(
      (acc, installment) => {
        const dueDate = new Date(installment.due_date)
        const today = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilDue < 0) {
          acc.overdue.count++
          acc.overdue.amount += Number.parseFloat(installment.amount_due || "0")
        } else if (daysUntilDue <= 7) {
          acc.upcoming.count++
          acc.upcoming.amount += Number.parseFloat(installment.amount_due || "0")
        } else if (daysUntilDue <= 30) {
          acc.thisMonth.count++
          acc.thisMonth.amount += Number.parseFloat(installment.amount_due || "0")
        }

        return acc
      },
      {
        overdue: { count: 0, amount: 0 },
        upcoming: { count: 0, amount: 0 },
        thisMonth: { count: 0, amount: 0 },
      },
    ) || { overdue: { count: 0, amount: 0 }, upcoming: { count: 0, amount: 0 }, thisMonth: { count: 0, amount: 0 } }

    // Calcul du taux de recouvrement
    const totalDue = installements?.reduce((sum, inst) => sum + Number.parseFloat(inst.amount_due || "0"), 0) || 0
    const totalPaid = totalPaymentsAmount
    const recoveryRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0

    return {
      topPayingStudents,
      installmentAnalysis,
      recoveryRate,
      averagePaymentPerStudent: revenuePerStudent.size > 0 ? totalPaymentsAmount / revenuePerStudent.size : 0,
      totalStudentsWithPayments: revenuePerStudent.size,
    }
  }

  // 3. ANALYSE DE PERFORMANCE - Calcul des performances par période
  const calculatePerformanceData = (): PerformanceData => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))

    // Performances mensuelles
    const monthlyPayments = cashierPayments.filter((p) => new Date(p.created_at) >= startOfMonth)
    const monthlyExpenses = cashierExpenses.filter((e) => new Date(e.expense_date) >= startOfMonth)

    // Performances hebdomadaires
    const weeklyPayments = cashierPayments.filter((p) => new Date(p.created_at) >= startOfWeek)
    const weeklyExpenses = cashierExpenses.filter((e) => new Date(e.expense_date) >= startOfWeek)

    return {
      monthly: {
        payments: monthlyPayments.length,
        paymentAmount: monthlyPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0),
        expenses: monthlyExpenses.length,
        expenseAmount: monthlyExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount || "0"), 0),
      },
      weekly: {
        payments: weeklyPayments.length,
        paymentAmount: weeklyPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0),
        expenses: weeklyExpenses.length,
        expenseAmount: weeklyExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount || "0"), 0),
      },
    }
  }

  // Exécution des calculs
  const temporalTrends = calculateTemporalTrends()
  const financialMetrics = calculateFinancialMetrics()
  const performanceData = calculatePerformanceData()

  /**
   * Fonction de rafraîchissement des données
   */
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true)
    try {
      toast({
        title: "Actualisation en cours...",
        description: "Récupération des dernières données de caisse",
      })

      const [
        paymentsData,
        expensesData,
        sessionsData,
        demandsData,
        registrationsData,
        pricingData,
        installmentsData,
        methodsData,
      ] = await Promise.all([
        fetchPayment(),
        fetchExpenses(),
        fetchCashRegisterSessions(),
        fetchDemands(),
        fetchRegistration(),
        fetchpricing(),
        fetchInstallment(),
        fetchPaymentMethods(),
      ])

      const store = useSchoolStore.getState()
      if (paymentsData?.length > 0) store.setPayments(paymentsData)
      if (expensesData?.length > 0) store.setExpenses(expensesData)
      if (sessionsData?.length > 0) store.setCashRegisterSessions(sessionsData)
      if (demandsData?.length > 0) store.setDemands(demandsData)
      if (registrationsData?.length > 0) store.setRegistration(registrationsData)
      if (pricingData?.length > 0) store.setPricing(pricingData)
      if (installmentsData?.length > 0) store.setInstallments(installmentsData)
      if (methodsData?.length > 0) store.setmethodPayment(methodsData)

      toast({
        title: "✅ Actualisation réussie",
        description: "Données de caisse mises à jour avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error)
      toast({
        title: "❌ Erreur d'actualisation",
        description: "Impossible de récupérer les dernières données",
        color: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  /**
   * Chargement initial des données
   */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setIsLoading(true)
      try {
        await handleRefresh()
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Affichage du loader pendant le chargement
  if (isLoading) {
    return (
      <Loading />
    )
  }


  const currency = settings?.[0]?.currency || "FCFA"

  return (
    <Card className="border-0 w-full">
      <div className="space-y-6 p-6 animate-in fade-in-50 duration-500">
        {/* Header avec informations caissier */}
        <CardHeader className="p-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 lg:gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1
                className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #10b981, #059669, #047857)" }}
              >
                Tableau de bord Caissier
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Bienvenue {userOnline?.name} - Caisse {cashRegisterCurrent?.cash_register_number}
              </p>
              {cashRegisterSessionCurrent && (
                <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                  <Timer className="h-3 w-3 mr-1" />
                  Session active depuis {new Date(cashRegisterSessionCurrent.opening_date).toLocaleDateString()}
                </Badge>
              )}
            </div>

            {/* Contrôles et filtres */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                <Select
                  value={selectedAcademicYear.toString()}
                  onValueChange={(value) => setSelectedAcademicYear(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Année académique" />
                  </SelectTrigger>
                  <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem
                    key={year.id}
                    value={year.id.toString()}
                    className="text-xs"
                  >
                    {year.label}
                  </SelectItem>
                ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm">
                      <Filter className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="hidden sm:inline">Filtres</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Widgets visibles</Label>
                        {Object.entries(visibleWidgets).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Switch
                              id={key}
                              checked={value}
                              onCheckedChange={(checked) => setVisibleWidgets((prev) => ({ ...prev, [key]: checked }))}
                            />
                            <Label htmlFor={key} className="capitalize">
                              {key === "stats"
                                ? "Statistiques"
                                : key === "payments"
                                  ? "Paiements"
                                  : key === "expenses"
                                    ? "Dépenses"
                                    : key === "sessions"
                                      ? "Sessions"
                                      : key === "demands"
                                        ? "Demandes"
                                        : "Retards"}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm"
                >
                  <RefreshCw className={`h-3 w-3 lg:h-4 lg:w-4 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Actualiser</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1 lg:gap-2 border-green-500 text-green-600 text-xs">
                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">{academicYearCurrent?.label}</span>
                </Badge>
                <Badge className="gap-1 lg:gap-2 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  <CreditCard className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Caissier</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          {/* Statistiques principales */}
          {visibleWidgets.stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Encaissements</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {totalPaymentsAmount.toLocaleString()} {currency}
                    </div>
                    <p className="text-xs text-muted-foreground">{cashierPayments.length} paiements</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Décaissements</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {totalExpensesAmount.toLocaleString()} {currency}
                    </div>
                    <p className="text-xs text-muted-foreground">{cashierExpenses.length} dépenses</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions actives</CardTitle>
                    <Timer className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{activeSessionsCount}</div>
                    <p className="text-xs text-muted-foreground">{cashierSessions.length} total</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{pendingDemandsCount}</div>
                    <p className="text-xs text-muted-foreground">{cashierDemands.length} total</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Contenu principal avec onglets */}
          <Tabs defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 min-w-[500px] lg:min-w-0">
                <TabsTrigger value="overview" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <CreditCard className="h-3 w-3 lg:h-4 lg:w-4" />
                  Paiements
                </TabsTrigger>
                <TabsTrigger value="expenses" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Wallet className="h-3 w-3 lg:h-4 lg:w-4" />
                  Dépenses
                </TabsTrigger>
                <TabsTrigger value="sessions" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Timer className="h-3 w-3 lg:h-4 lg:w-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="demands" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Receipt className="h-3 w-3 lg:h-4 lg:w-4" />
                  Demandes
                </TabsTrigger>
                <TabsTrigger value="overdue" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4" />
                  Retards
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Onglet Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-4">
              {/* Analyses basées sur les données réelles */}
              <FinancialAnalytics
                data={{
                  financialMetrics,
                  temporalTrends,
                  paymentsByMethod,
                  performanceData,
                  currency,
                }}
              />

              <TemporalAnalysis
                data={{
                  temporalTrends,
                  cashierPayments,
                  cashierExpenses,
                  currency,
                }}
              />
            </TabsContent>

            {/* Autres onglets restent identiques... */}
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mes paiements récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {cashierPayments.length > 0 ? (
                      <div className="space-y-3">
                        {cashierPayments.slice(0, 50).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {payment.student?.first_name} {payment.student?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString()} -{" "}
                                {new Date(payment.created_at).toLocaleTimeString()}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {payment.payment_methods?.map((method) => (
                                  <Badge key={method.id} color="secondary" className="text-xs">
                                    {method.name}: {Number.parseFloat(method.pivot?.montant || "0").toLocaleString()}{" "}
                                    {currency}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-green-600">
                                {Number.parseFloat(payment.amount).toLocaleString()} {currency}
                              </p>
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Encaissé
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun paiement effectué pour le moment</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Dépenses */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mes dépenses récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {cashierExpenses.length > 0 ? (
                      <div className="space-y-3">
                        {cashierExpenses.slice(0, 50).map((expense) => (
                          <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{expense.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {expense.expense_type.name} - {new Date(expense.expense_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-red-600">
                                {Number.parseFloat(expense.amount).toLocaleString()} {currency}
                              </p>
                              <Badge className="bg-red-100 text-red-700">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                Décaissé
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune dépense effectuée pour le moment</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Sessions */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mes sessions de caisse</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {cashierSessions.length > 0 ? (
                      <div className="space-y-3">
                        {cashierSessions.map((session) => (
                          <div key={session.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium">
                                  Session du {new Date(session.opening_date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Caisse {session.cash_register.cash_register_number}
                                </p>
                              </div>
                              <Badge
                                className={
                                  session.status === "open"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }
                              >
                                {session.status === "open" ? "Ouverte" : "Fermée"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Ouverture:</span>
                                <p>
                                  {Number.parseFloat(session.opening_amount).toLocaleString()} {currency}
                                </p>
                              </div>
                              {session.status === "closed" && (
                                <div>
                                  <span className="font-medium">Fermeture:</span>
                                  <p>
                                    {Number.parseFloat(session.closing_amount || "0").toLocaleString()} {currency}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune session de caisse trouvée</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Demandes */}
            <TabsContent value="demands" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mes demandes de décaissement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {cashierDemands.length > 0 ? (
                      <div className="space-y-3">
                        {cashierDemands.map((demand) => (
                          <div key={demand.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{demand.pattern}</p>
                              <p className="text-xs text-muted-foreground">
                                Demandé le {new Date(demand.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {demand.amount.toLocaleString()} {currency}
                              </p>
                              <Badge
                                className={
                                  demand.status === "en attente"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : demand.status === "validée"
                                      ? "bg-blue-100 text-blue-700"
                                      : demand.status === "approuvée"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }
                              >
                                {demand.status === "en attente" && <Clock className="h-3 w-3 mr-1" />}
                                {demand.status === "validée" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {demand.status === "approuvée" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {demand.status === "refusée" && <XCircle className="h-3 w-3 mr-1" />}
                                {demand.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune demande de décaissement effectuée</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Retards */}
            <TabsContent value="overdue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Retards de paiement ({overduePayments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {overduePayments.length > 0 ? (
                      <div className="space-y-3">
                        {overduePayments.map((overdue, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-red-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {overdue.student.first_name} {overdue.student.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {overdue.registration.classe.label} - {overdue.pricing.label}
                                </p>
                                <p className="text-xs text-red-600">
                                  Échéance du {new Date(overdue.installment.due_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-red-600">
                                  {Number.parseFloat(overdue.installment.amount_due).toLocaleString()} {currency}
                                </p>
                                <Badge className="bg-red-100 text-red-700">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {overdue.daysOverdue} jours de retard
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                        <p>Aucun retard de paiement détecté</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Toaster />
        </CardContent>
      </div>
    </Card>
  )
}

export default CashierDashboard
