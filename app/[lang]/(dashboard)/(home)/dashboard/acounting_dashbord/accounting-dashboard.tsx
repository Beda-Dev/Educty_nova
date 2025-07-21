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
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Calculator,
  Eye,
  UserCheck,
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
import { Progress } from "@/components/ui/progress"
import {
  fetchPayment,
  fetchExpenses,
  fetchCashRegisterSessions,
  fetchDemands,
  fetchRegistration,
  fetchpricing,
  fetchInstallment,
  fetchPaymentMethods,
  fetchUsers,
  fetchCashRegister,
} from "@/store/schoolservice"
import type {
  AccountingDashboardProps,
  CashierPerformance,
  SessionIrregularity,
  FinancialSummary,
  PaymentMethodStats,
  MonthlyFinancialData,
  OverdueStudentPayment,
  DemandAnalysis,
  AccountingFilters,
} from "./types/accounting-dashboard"
import type { Payment, Expense, CashRegisterSession, Demand } from "@/lib/interface"
import Loading from "../loading"

/**
 * Composant principal du tableau de bord comptable
 * Affiche toutes les informations financières et comptables de l'établissement
 */
const AccountingDashboard = ({ trans }: AccountingDashboardProps) => {
  const {
    payments,
    expenses,
    cashRegisterSessions,
    demands,
    registrations,
    pricing,
    installements,
    methodPayment,
    users,
    cashRegisters,
    students,
    userOnline,
    academicYearCurrent,
    academicYears,
    settings,
  } = useSchoolStore()

  // États pour la gestion du composant
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<AccountingFilters>({
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    academicYear: academicYearCurrent?.id || 0,
  })
  const [visibleWidgets, setVisibleWidgets] = useState({
    summary: true,
    cashiers: true,
    irregularities: true,
    overdue: true,
    demands: true,
    analytics: true,
  })


  /**
   * Filtrage des données selon les critères sélectionnés
   */
  const filteredPayments: Payment[] =
    payments?.filter((payment) => {
      const paymentDate = new Date(payment.created_at)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)

      return (
        paymentDate >= startDate &&
        paymentDate <= endDate &&
        (!filters.cashier || payment.cashier_id === filters.cashier) &&
        (!filters.cashRegister || payment.cash_register_id === filters.cashRegister)
      )
    }) || []

  const filteredExpenses: Expense[] =
    expenses?.filter((expense) => {
      const expenseDate = new Date(expense.expense_date)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)

      return (
        expenseDate >= startDate &&
        expenseDate <= endDate &&
        (!filters.cashRegister || expense.cash_register_id === filters.cashRegister)
      )
    }) || []

  const filteredSessions: CashRegisterSession[] =
    cashRegisterSessions?.filter((session) => {
      const sessionDate = new Date(session.opening_date)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)

      return (
        sessionDate >= startDate &&
        sessionDate <= endDate &&
        (!filters.cashier || session.user_id === filters.cashier) &&
        (!filters.cashRegister || session.cash_register_id === filters.cashRegister)
      )
    }) || []

  const filteredDemands: Demand[] =
    demands?.filter((demand) => {
      const demandDate = new Date(demand.created_at)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)

      return (
        demandDate >= startDate &&
        demandDate <= endDate &&
        (!filters.demandStatus || demand.status === filters.demandStatus)
      )
    }) || []

  /**
   * Calcul du résumé financier
   */
  const calculateFinancialSummary = (): FinancialSummary => {
    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount || "0"), 0)

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount || "0"), 0)

    const netBalance = totalRevenue - totalExpenses

    // Calcul des paiements en retard
    const overduePayments = calculateOverduePayments()
    const overdueAmount = overduePayments.reduce((sum, overdue) => sum + overdue.amountDue, 0)

    // Calcul des paiements en attente (échéances à venir)
    const pendingInstallments =
      installements?.filter((inst) => {
        const dueDate = new Date(inst.due_date)
        const today = new Date()
        return dueDate > today && inst.status !== "paid"
      }) || []

    const pendingPayments = pendingInstallments.reduce(
      (sum, inst) => sum + Number.parseFloat(inst.amount_due || "0"),
      0,
    )

    // Calcul de l'argent en caisse (sessions ouvertes)
    const activeSessions = filteredSessions.filter((session) => session.status === "open")
    const cashInHand = activeSessions.reduce(
      (sum, session) => sum + Number.parseFloat(session.opening_amount || "0"),
      0,
    )

    return {
      totalRevenue,
      totalExpenses,
      netBalance,
      pendingPayments,
      overdueAmount,
      cashInHand,
      activeSessions: activeSessions.length,
    }
  }

  /**
   * Analyse des performances des caissiers
   */
  const calculateCashierPerformances = (): CashierPerformance[] => {
    const cashiers =
      users?.filter((user) =>
        user.roles?.some(
          (role) => role.name.toLowerCase().includes("caissier") || role.name.toLowerCase().includes("cashier"),
        ),
      ) || []

    return cashiers.map((cashier) => {
      const cashierPayments = filteredPayments.filter((p) => p.cashier_id === cashier.id)
      const cashierExpenses = filteredExpenses.filter((e) =>
        filteredSessions.some((s) => s.user_id === cashier.id && s.cash_register_id === e.cash_register_id),
      )
      const cashierSessions = filteredSessions.filter((s) => s.user_id === cashier.id)

      const totalPayments = cashierPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0)
      const totalExpenses = cashierExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount || "0"), 0)
      const transactionCount = cashierPayments.length + cashierExpenses.length
      const averageTransactionAmount = transactionCount > 0 ? (totalPayments + totalExpenses) / transactionCount : 0

      const lastSession = cashierSessions.sort(
        (a, b) => new Date(b.opening_date).getTime() - new Date(a.opening_date).getTime(),
      )[0]

      return {
        cashier,
        totalPayments,
        totalExpenses,
        transactionCount,
        sessionsCount: cashierSessions.length,
        averageTransactionAmount,
        lastSessionDate: lastSession?.opening_date || "",
      }
    })
  }

  /**
   * Détection des irrégularités dans les sessions de caisse
   */
  const detectSessionIrregularities = (): SessionIrregularity[] => {
    const irregularities: SessionIrregularity[] = []

    // Grouper les sessions par caissier et caisse
    const sessionsByUserAndRegister = new Map<string, CashRegisterSession[]>()

    filteredSessions.forEach((session) => {
      const key = `${session.user_id}-${session.cash_register_id}`
      if (!sessionsByUserAndRegister.has(key)) {
        sessionsByUserAndRegister.set(key, [])
      }
      sessionsByUserAndRegister.get(key)!.push(session)
    })

    sessionsByUserAndRegister.forEach((sessions) => {
      // Trier les sessions par date d'ouverture
      const sortedSessions = sessions.sort(
        (a, b) => new Date(a.opening_date).getTime() - new Date(b.opening_date).getTime(),
      )

      for (let i = 1; i < sortedSessions.length; i++) {
        const currentSession = sortedSessions[i]
        const previousSession = sortedSessions[i - 1]

        // Vérifier si la session précédente est fermée
        if (previousSession.status === "closed" && previousSession.closing_amount) {
          const previousClosing = Number.parseFloat(previousSession.closing_amount)
          const currentOpening = Number.parseFloat(currentSession.opening_amount)
          const discrepancy = Math.abs(currentOpening - previousClosing)

          // Seuil de tolérance (peut être configuré)
          const tolerance = 1000 // 1000 unités de devise

          if (discrepancy > tolerance) {
            const severity: "low" | "medium" | "high" =
              discrepancy > 10000 ? "high" : discrepancy > 5000 ? "medium" : "low"

            irregularities.push({
              session: currentSession,
              previousSession,
              discrepancy,
              discrepancyType: "session_gap",
              severity,
              description: `Écart de ${discrepancy.toLocaleString()} entre la fermeture de la session précédente et l'ouverture de cette session`,
            })
          }
        }

        // Vérifier les sessions avec des montants d'ouverture/fermeture suspects
        if (currentSession.status === "closed" && currentSession.closing_amount) {
          const opening = Number.parseFloat(currentSession.opening_amount)
          const closing = Number.parseFloat(currentSession.closing_amount)

          // Calculer les transactions de la session
          const sessionPayments = filteredPayments.filter((p) => {
            const paymentDate = new Date(p.created_at)
            const sessionStart = new Date(currentSession.opening_date)
            const sessionEnd = currentSession.closing_date ? new Date(currentSession.closing_date) : new Date()
            return (
              paymentDate >= sessionStart &&
              paymentDate <= sessionEnd &&
              p.cash_register_id === currentSession.cash_register_id
            )
          })

          const sessionExpenses = filteredExpenses.filter((e) => {
            const expenseDate = new Date(e.expense_date)
            const sessionStart = new Date(currentSession.opening_date)
            const sessionEnd = currentSession.closing_date ? new Date(currentSession.closing_date) : new Date()
            return (
              expenseDate >= sessionStart &&
              expenseDate <= sessionEnd &&
              e.cash_register_id === currentSession.cash_register_id
            )
          })

          const totalPayments = sessionPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0)
          const totalExpenses = sessionExpenses.reduce((sum, e) => sum + Number.parseFloat(e.amount || "0"), 0)
          const expectedClosing = opening + totalPayments - totalExpenses
          const tolerance = 1000
          const actualDiscrepancy = Math.abs(closing - expectedClosing)

          if (actualDiscrepancy > tolerance) {
            const severity: "low" | "medium" | "high" =
              actualDiscrepancy > 10000 ? "high" : actualDiscrepancy > 5000 ? "medium" : "low"

            irregularities.push({
              session: currentSession,
              discrepancy: actualDiscrepancy,
              discrepancyType: "opening_closing",
              severity,
              description: `Écart de ${actualDiscrepancy.toLocaleString()} entre le montant de fermeture déclaré et le montant calculé`,
            })
          }
        }
      }
    })

    return irregularities.filter((irreg) => !filters.irregularityLevel || irreg.severity === filters.irregularityLevel)
  }

  /**
   * Calcul des étudiants en retard de paiement
   */
  const calculateOverduePayments = (): OverdueStudentPayment[] => {
    const overduePayments: OverdueStudentPayment[] = []
    const currentYearRegistrations = registrations?.filter((reg) => reg.academic_year_id === filters.academicYear) || []

    currentYearRegistrations.forEach((registration) => {
      const student = students?.find((s) => s.id === registration.student_id)
      if (!student) return

      const relevantPricing =
        pricing?.filter(
          (p) =>
            p.academic_years_id === registration.academic_year_id &&
            p.level_id === registration.classe?.level_id &&
            p.assignment_type_id === student.assignment_type_id,
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
              (payment) => payment.student_id === student.id && payment.installment_id === installment.id,
            )

            if (!paymentMade) {
              // Trouver le dernier paiement de l'étudiant
              const studentPayments = payments?.filter((p) => p.student_id === student.id) || []
              const lastPayment = studentPayments.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              )[0]

              overduePayments.push({
                student,
                registration,
                installment,
                daysOverdue,
                amountDue: Number.parseFloat(installment.amount_due || "0"),
                lastPaymentDate: lastPayment?.created_at,
              })
            }
          }
        })
      })
    })

    return overduePayments.sort((a, b) => b.daysOverdue - a.daysOverdue)
  }

  /**
   * Analyse des demandes de décaissement
   */
  const calculateDemandAnalysis = (): DemandAnalysis => {
    const totalDemands = filteredDemands.length
    const pendingDemands = filteredDemands.filter((d) => d.status === "en attente").length
    const approvedDemands = filteredDemands.filter((d) => d.status === "approuvée").length
    const rejectedDemands = filteredDemands.filter((d) => d.status === "refusée").length

    const totalPendingAmount = filteredDemands
      .filter((d) => d.status === "en attente")
      .reduce((sum, d) => sum + d.amount, 0)

    const totalApprovedAmount = filteredDemands
      .filter((d) => d.status === "approuvée")
      .reduce((sum, d) => sum + d.amount, 0)

    // Calcul approximatif du temps de traitement moyen (en jours)
    const processedDemands = filteredDemands.filter((d) => d.status !== "en attente")
    const averageProcessingTime =
      processedDemands.length > 0
        ? processedDemands.reduce((sum, d) => {
            const created = new Date(d.created_at)
            const updated = new Date(d.updated_at)
            return sum + Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          }, 0) / processedDemands.length
        : 0

    return {
      totalDemands,
      pendingDemands,
      approvedDemands,
      rejectedDemands,
      totalPendingAmount,
      totalApprovedAmount,
      averageProcessingTime,
    }
  }

  /**
   * Statistiques par méthode de paiement
   */
  const calculatePaymentMethodStats = (): PaymentMethodStats[] => {
    return (
      methodPayment
        ?.map((method) => {
          const methodPayments = filteredPayments.filter((payment) =>
            payment.payment_methods?.some((pm) => pm.id === method.id),
          )

          const totalAmount = methodPayments.reduce((sum, payment) => {
            const methodAmount = payment.payment_methods?.find((pm) => pm.id === method.id)?.pivot?.montant || "0"
            return sum + Number.parseFloat(methodAmount)
          }, 0)

          const transactionCount = methodPayments.length
          const totalPaymentsAmount = filteredPayments.reduce((sum, p) => sum + Number.parseFloat(p.amount || "0"), 0)

          return {
            method,
            totalAmount,
            transactionCount,
            percentage: totalPaymentsAmount > 0 ? (totalAmount / totalPaymentsAmount) * 100 : 0,
            averageAmount: transactionCount > 0 ? totalAmount / transactionCount : 0,
          }
        })
        .sort((a, b) => b.totalAmount - a.totalAmount) || []
    )
  }

  /**
   * Données financières mensuelles
   */
  const calculateMonthlyFinancialData = (): MonthlyFinancialData[] => {
    const monthlyData = new Map<string, MonthlyFinancialData>()

    // Traiter les paiements
    filteredPayments.forEach((payment) => {
      const date = new Date(payment.created_at)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const month = date.toLocaleDateString("fr-FR", { month: "short" })
      const year = date.getFullYear()

      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          month,
          year,
          revenue: 0,
          expenses: 0,
          netBalance: 0,
          transactionCount: 0,
        })
      }

      const data = monthlyData.get(key)!
      data.revenue += Number.parseFloat(payment.amount || "0")
      data.transactionCount += 1
    })

    // Traiter les dépenses
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.expense_date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const month = date.toLocaleDateString("fr-FR", { month: "short" })
      const year = date.getFullYear()

      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          month,
          year,
          revenue: 0,
          expenses: 0,
          netBalance: 0,
          transactionCount: 0,
        })
      }

      const data = monthlyData.get(key)!
      data.expenses += Number.parseFloat(expense.amount || "0")
      data.transactionCount += 1
    })

    // Calculer le solde net
    monthlyData.forEach((data) => {
      data.netBalance = data.revenue - data.expenses
    })

    return Array.from(monthlyData.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth()
    })
  }

  // Exécution des calculs
  const financialSummary = calculateFinancialSummary()
  const cashierPerformances = calculateCashierPerformances()
  const sessionIrregularities = detectSessionIrregularities()
  const overduePayments = calculateOverduePayments()
  const demandAnalysis = calculateDemandAnalysis()
  const paymentMethodStats = calculatePaymentMethodStats()
  const monthlyFinancialData = calculateMonthlyFinancialData()

  /**
   * Fonction de rafraîchissement des données
   */
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true)
    try {
      toast({
        title: "Actualisation en cours...",
        description: "Récupération des dernières données comptables",
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
        usersData,
        cashRegistersData,
      ] = await Promise.all([
        fetchPayment(),
        fetchExpenses(),
        fetchCashRegisterSessions(),
        fetchDemands(),
        fetchRegistration(),
        fetchpricing(),
        fetchInstallment(),
        fetchPaymentMethods(),
        fetchUsers(),
        fetchCashRegister(),
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
      if (usersData?.length > 0) store.setUsers(usersData)
      if (cashRegistersData?.length > 0) store.setCashRegisters(cashRegistersData)

      toast({
        title: "✅ Actualisation réussie",
        description: "Données comptables mises à jour avec succès",
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
    return <Loading />
  }


  const currency = settings?.[0]?.currency || "FCFA"

  return (
    <Card className="border-0 w-full">
      <div className="space-y-6 p-6 animate-in fade-in-50 duration-500">
        {/* Header avec informations comptable */}
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
                Tableau de bord Comptabilité
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Bienvenue {userOnline?.name} - Gestion financière et comptable
              </p>
            </div>

            {/* Contrôles et filtres */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                <Select
                  value={filters.academicYear.toString()}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, academicYear: Number.parseInt(value) }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Année académique" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears?.map((year) => (
                      <SelectItem key={year.id} value={year.id.toString()}>
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
                        <Label>Période</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="start-date" className="text-xs">
                              Du
                            </Label>
                            <input
                              id="start-date"
                              type="date"
                              value={filters.dateRange.start}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, start: e.target.value },
                                }))
                              }
                              className="w-full px-2 py-1 text-xs border rounded"
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date" className="text-xs">
                              Au
                            </Label>
                            <input
                              id="end-date"
                              type="date"
                              value={filters.dateRange.end}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, end: e.target.value },
                                }))
                              }
                              className="w-full px-2 py-1 text-xs border rounded"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Caissier</Label>
                        <Select
                          value={filters.cashier?.toString() || ""}
                          onValueChange={(value) =>
                            setFilters((prev) => ({
                              ...prev,
                              cashier: value ? Number.parseInt(value) : undefined,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tous les caissiers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Tous les caissiers</SelectItem>
                            {users
                              ?.filter((user) =>
                                user.roles?.some(
                                  (role) =>
                                    role.name.toLowerCase().includes("caissier") ||
                                    role.name.toLowerCase().includes("cashier"),
                                ),
                              )
                              .map((cashier) => (
                                <SelectItem key={cashier.id} value={cashier.id.toString()}>
                                  {cashier.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Widgets visibles</Label>
                        {Object.entries(visibleWidgets).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Switch
                              id={key}
                              checked={value}
                              onCheckedChange={(checked) => setVisibleWidgets((prev) => ({ ...prev, [key]: checked }))}
                            />
                            <Label htmlFor={key} className="capitalize text-xs">
                              {key === "summary"
                                ? "Résumé financier"
                                : key === "cashiers"
                                  ? "Caissiers"
                                  : key === "irregularities"
                                    ? "Irrégularités"
                                    : key === "overdue"
                                      ? "Retards"
                                      : key === "demands"
                                        ? "Demandes"
                                        : "Analyses"}
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
                  <Calculator className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Comptable</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          {/* Résumé financier principal */}
          {visibleWidgets.summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recettes totales</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {financialSummary.totalRevenue.toLocaleString()} {currency}
                    </div>
                    <p className="text-xs text-muted-foreground">{filteredPayments.length} paiements</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {financialSummary.totalExpenses.toLocaleString()} {currency}
                    </div>
                    <p className="text-xs text-muted-foreground">{filteredExpenses.length} dépenses</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Solde net</CardTitle>
                    <DollarSign
                      className={`h-4 w-4 ${financialSummary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${financialSummary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {financialSummary.netBalance.toLocaleString()} {currency}
                    </div>
                    <p className="text-xs text-muted-foreground">Recettes - Dépenses</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Retards de paiement</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {financialSummary.overdueAmount.toLocaleString()} {currency}
                    </div>
                    <p className="text-xs text-muted-foreground">{overduePayments.length} étudiants en retard</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Contenu principal avec onglets */}
          <Tabs defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 min-w-[600px] lg:min-w-0">
                <TabsTrigger value="overview" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="cashiers" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                  Caissiers
                </TabsTrigger>
                <TabsTrigger value="irregularities" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                  Irrégularités
                </TabsTrigger>
                <TabsTrigger value="overdue" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                  Retards
                </TabsTrigger>
                <TabsTrigger value="demands" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                  Demandes
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                  <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                  Analyses
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Onglet Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution financière mensuelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyFinancialData.slice(-6).map((data, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {data.month} {data.year}
                            </span>
                            <span
                              className={`text-sm font-bold ${data.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {data.netBalance.toLocaleString()} {currency}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-green-600">
                              Recettes: {data.revenue.toLocaleString()} {currency}
                            </div>
                            <div className="text-red-600">
                              Dépenses: {data.expenses.toLocaleString()} {currency}
                            </div>
                          </div>
                          <Progress
                            value={
                              data.revenue > 0
                                ? Math.min((data.revenue / Math.max(data.revenue, data.expenses)) * 100, 100)
                                : 0
                            }
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Méthodes de paiement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentMethodStats.slice(0, 5).map((stat, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{stat.method.name}</span>
                              {stat.method.isPrincipal === 1 && (
                                <Badge variant="outline" className="text-xs">
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm font-bold">
                              {stat.totalAmount.toLocaleString()} {currency}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{stat.transactionCount} transactions</span>
                            <span>{stat.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={stat.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions de caisse actives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{financialSummary.activeSessions}</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Argent en caisse: {financialSummary.cashInHand.toLocaleString()} {currency}
                    </p>
                    <div className="space-y-2">
                      {filteredSessions
                        .filter((s) => s.status === "open")
                        .slice(0, 3)
                        .map((session) => (
                          <div key={session.id} className="flex justify-between items-center text-sm">
                            <span>{session.user.name}</span>
                            <span className="font-medium">
                              {Number.parseFloat(session.opening_amount).toLocaleString()} {currency}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Paiements en attente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {financialSummary.pendingPayments.toLocaleString()} {currency}
                    </div>
                    <p className="text-sm text-muted-foreground">Échéances à venir</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Demandes en cours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{demandAnalysis.pendingDemands}</div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Montant: {demandAnalysis.totalPendingAmount.toLocaleString()} {currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Temps moyen de traitement: {demandAnalysis.averageProcessingTime.toFixed(1)} jours
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Caissiers */}
            <TabsContent value="cashiers" className="space-y-4">
              <div className="grid gap-4">
                {cashierPerformances.map((performance, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5" />
                          {performance.cashier.name}
                        </CardTitle>
                        <Badge variant="outline">{performance.sessionsCount} sessions</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Encaissements</p>
                          <p className="text-lg font-bold text-green-600">
                            {performance.totalPayments.toLocaleString()} {currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Décaissements</p>
                          <p className="text-lg font-bold text-red-600">
                            {performance.totalExpenses.toLocaleString()} {currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Transactions</p>
                          <p className="text-lg font-bold">{performance.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Montant moyen</p>
                          <p className="text-lg font-bold">
                            {performance.averageTransactionAmount.toLocaleString()} {currency}
                          </p>
                        </div>
                      </div>
                      {performance.lastSessionDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Dernière session: {new Date(performance.lastSessionDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Onglet Irrégularités */}
            <TabsContent value="irregularities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Irrégularités détectées ({sessionIrregularities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {sessionIrregularities.length > 0 ? (
                      <div className="space-y-3">
                        {sessionIrregularities.map((irregularity, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg ${
                              irregularity.severity === "high"
                                ? "bg-red-50 border-red-200"
                                : irregularity.severity === "medium"
                                  ? "bg-orange-50 border-orange-200"
                                  : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-sm">
                                  {irregularity.session.user.name} - Caisse{" "}
                                  {irregularity.session.cash_register.cash_register_number}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Session du {new Date(irregularity.session.opening_date).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                className={
                                  irregularity.severity === "high"
                                    ? "bg-red-100 text-red-700"
                                    : irregularity.severity === "medium"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {irregularity.severity === "high"
                                  ? "Critique"
                                  : irregularity.severity === "medium"
                                    ? "Moyen"
                                    : "Faible"}
                              </Badge>
                            </div>
                            <p className="text-sm">{irregularity.description}</p>
                            <p className="text-lg font-bold mt-2 text-red-600">
                              Écart: {irregularity.discrepancy.toLocaleString()} {currency}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                        <p>Aucune irrégularité détectée</p>
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
                    <Clock className="h-5 w-5 text-orange-500" />
                    Étudiants en retard de paiement ({overduePayments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {overduePayments.length > 0 ? (
                      <div className="space-y-3">
                        {overduePayments.slice(0, 50).map((overdue, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-red-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {overdue.student.first_name} {overdue.student.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {overdue.registration.classe.label} - Échéance du{" "}
                                  {new Date(overdue.installment.due_date).toLocaleDateString()}
                                </p>
                                {overdue.lastPaymentDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Dernier paiement: {new Date(overdue.lastPaymentDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-red-600">
                                  {overdue.amountDue.toLocaleString()} {currency}
                                </p>
                                <Badge className="bg-red-100 text-red-700">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {overdue.daysOverdue} jours
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

            {/* Onglet Demandes */}
            <TabsContent value="demands" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{demandAnalysis.totalDemands}</div>
                    <p className="text-sm text-muted-foreground">Total demandes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">{demandAnalysis.pendingDemands}</div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{demandAnalysis.approvedDemands}</div>
                    <p className="text-sm text-muted-foreground">Approuvées</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{demandAnalysis.rejectedDemands}</div>
                    <p className="text-sm text-muted-foreground">Refusées</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Toutes les demandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {filteredDemands.length > 0 ? (
                      <div className="space-y-3">
                        {filteredDemands.map((demand) => (
                          <div key={demand.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{demand.pattern}</p>
                              <p className="text-xs text-muted-foreground">
                                Par {demand.applicant.name} - {new Date(demand.created_at).toLocaleDateString()}
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
                                {demand.status === "validée" && <Eye className="h-3 w-3 mr-1" />}
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
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune demande trouvée pour cette période</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Analyses */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des recettes par méthode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethodStats.map((stat, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{stat.method.name}</span>
                              {stat.method.isPrincipal === 1 && (
                                <Badge variant="outline" className="text-xs">
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm font-bold">{stat.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {stat.totalAmount.toLocaleString()} {currency}
                            </span>
                            <span>{stat.transactionCount} transactions</span>
                          </div>
                          <Progress value={stat.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance des caissiers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cashierPerformances.slice(0, 5).map((performance, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{performance.cashier.name}</span>
                            <span className="text-sm font-bold">{performance.transactionCount} transactions</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Encaissements: {performance.totalPayments.toLocaleString()} {currency}
                            </span>
                            <span>Sessions: {performance.sessionsCount}</span>
                          </div>
                          <Progress
                            value={Math.min(
                              (performance.transactionCount /
                                Math.max(...cashierPerformances.map((p) => p.transactionCount))) *
                                100,
                              100,
                            )}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques générales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Nombre de caissiers actifs</span>
                        <span className="font-bold">{cashierPerformances.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Sessions ouvertes</span>
                        <span className="font-bold">{financialSummary.activeSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Irrégularités détectées</span>
                        <span className="font-bold text-orange-600">{sessionIrregularities.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Étudiants en retard</span>
                        <span className="font-bold text-red-600">{overduePayments.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ratios financiers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Ratio recettes/dépenses</span>
                        <span className="font-bold">
                          {financialSummary.totalExpenses > 0
                            ? (financialSummary.totalRevenue / financialSummary.totalExpenses).toFixed(2)
                            : "∞"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Marge nette</span>
                        <span
                          className={`font-bold ${
                            financialSummary.totalRevenue > 0
                              ? (financialSummary.netBalance / financialSummary.totalRevenue) * 100 >= 0
                                ? "text-green-600"
                                : "text-red-600"
                              : ""
                          }`}
                        >
                          {financialSummary.totalRevenue > 0
                            ? `${((financialSummary.netBalance / financialSummary.totalRevenue) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Taux de retard</span>
                        <span className="font-bold text-orange-600">
                          {registrations?.length > 0
                            ? `${((overduePayments.length / registrations.length) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alertes et recommandations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sessionIrregularities.filter((i) => i.severity === "high").length > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span className="text-sm">
                            {sessionIrregularities.filter((i) => i.severity === "high").length} irrégularité(s)
                            critique(s)
                          </span>
                        </div>
                      )}

                      {overduePayments.length > 10 && (
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                          <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <span className="text-sm">Nombreux retards de paiement ({overduePayments.length})</span>
                        </div>
                      )}

                      {demandAnalysis.pendingDemands > 5 && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                          <FileText className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="text-sm">{demandAnalysis.pendingDemands} demandes en attente</span>
                        </div>
                      )}

                      {financialSummary.netBalance < 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <DollarSign className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span className="text-sm">Solde négatif: attention aux dépenses</span>
                        </div>
                      )}

                      {sessionIrregularities.length === 0 &&
                        overduePayments.length < 5 &&
                        demandAnalysis.pendingDemands < 3 &&
                        financialSummary.netBalance >= 0 && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">Situation financière saine</span>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Toaster />
        </CardContent>
      </div>
    </Card>
  )
}

export default AccountingDashboard
