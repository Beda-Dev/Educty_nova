"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolStore } from "@/store"
import type { Registration, Payment, Classe } from "@/lib/interface"
import { useEffect, useState } from "react"
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  BookOpen,
  UserCheck,
  AlertCircle,
  PieChart,
  BarChart3,
} from "lucide-react"
import SchoolStats from "./components/school-stats"
import RecentInscriptions from "./components/recent-inscriptions"
import GenderDistributionChart from "./components/gender-distribution-chart"
import ClassDistributionChart from "./components/class-distribution-chart"
import PaymentOverviewChart from "./components/payment-overview-chart"
import MonthlyRegistrationsChart from "./components/monthly-registrations-chart"
import QuickActions from "./components/quick-actions"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import FinancialOverviewChart from "./components/financial-overview-chart"
import AdvancedStatsCards from "./components/advanced-stats-cards"
import RealTimeMetrics from "./components/real-time-metrics"
import InteractiveNotifications from "./components/interactive-notifications"

import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getLastOpenSessionForUser } from "@/lib/fonction"
import { refreshAllData } from "@/store/schoolservice"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface DashboardViewProps {
  trans?: {
    [key: string]: string
  }
}

const DashboardView = ({ trans }: DashboardViewProps) => {
  const { registrations, classes, users, academicYearCurrent, pricing, students, payments, userOnline, setCashRegisterSessionCurrent, cashRegisterSessions, installements, expenses, settings } =
    useSchoolStore()

  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [showComparison, setShowComparison] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState({
    stats: true,
    charts: true,
    recent: true,
    alerts: true,
  })

  useEffect(() => {
    if (cashRegisterSessions && userOnline) {
      const lastSession = getLastOpenSessionForUser(cashRegisterSessions, userOnline.id)
      if (lastSession) {
        setCashRegisterSessionCurrent(lastSession)
        console.log("Last session found:", lastSession)
      } else {
        setCashRegisterSessionCurrent(null)
      }
    }
  }, [])

  // Filtrer les données par année académique actuelle
  const currentYearRegistrations =
    registrations?.filter((reg: Registration) => reg.academic_year_id === academicYearCurrent?.id) || []

  const currentYearPayments =
    payments?.filter((payment: Payment) => {
      const studentRegistration = currentYearRegistrations.find((reg) => reg.student_id === payment.student_id)
      return !!studentRegistration
    }) || []

  // Calculs des statistiques
  const totalStudents = currentYearRegistrations.length
  const totalClasses = classes?.length || 0
  const totalUsers = users.filter((use) => use.active === 1)?.length || 0

  const femaleStudents = currentYearRegistrations.filter((reg) =>
    ["f", "féminin", "feminin", "female"].includes(reg.student?.sexe?.toLowerCase()),
  ).length

  const maleStudents = currentYearRegistrations.filter((reg) =>
    ["m", "masculin", "male"].includes(reg.student?.sexe?.toLowerCase()),
  ).length

  const totalRevenue = currentYearPayments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount || "0"), 0)

  // Calcul du taux d'occupation des classes
  const classOccupancyRate =
    classes?.length > 0
      ? Math.round(
        (totalStudents / classes.reduce((sum, cls) => sum + Number.parseInt(cls.max_student_number || "0"), 0)) * 100,
      )
      : 0

  const handleRefresh = async () => {
    setRefreshing(true)

    try {
      toast({
        title: "Actualisation en cours...",
        description: "Récupération des dernières données",
      })

      const freshData = await refreshAllData()
      const store = useSchoolStore.getState()

      if (freshData.classes?.length > 0) {
        store.setClasses(freshData.classes)
      }

      if (freshData.levels?.length > 0) {
        store.setLevels(freshData.levels)
      }

      if (freshData.academicYears?.length > 0) {
        store.setAcademicYears(freshData.academicYears)
      }

      if (freshData.students?.length > 0) {
        store.setStudents(freshData.students)
      }

      if (freshData.users?.length > 0) {
        store.setUsers(freshData.users)
      }

      if (freshData.roles?.length > 0) {
        store.setRoles(freshData.roles)
      }

      if (freshData.pricing?.length > 0) {
        store.setPricing(freshData.pricing)
      }

      if (freshData.registrations?.length > 0) {
        store.setRegistration(freshData.registrations)
      }

      if (freshData.payments?.length > 0) {
        store.setPayments(freshData.payments)
      }

      if (freshData.installments?.length > 0) {
        store.setInstallments(freshData.installments)
      }

      if (freshData.tutors?.length > 0) {
        store.setTutors(freshData.tutors)
      }

      if (freshData.transactions?.length > 0) {
        store.setTransactions(freshData.transactions)
      }

      if (freshData.expenses?.length > 0) {
        store.setExpenses(freshData.expenses)
      }

      toast({
        title: "✅ Actualisation réussie",
        description: "Toutes les données ont été mises à jour",
        color: "default",
      })
    } catch (error) {
      console.error("❌ Erreur lors de l'actualisation:", error)
      toast({
        title: "❌ Erreur d'actualisation",
        description: "Impossible de récupérer les dernières données. Vérifiez votre connexion.",
        color: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <div className="space-y-4 p-4 md:p-6 animate-in fade-in-50 duration-500">
        {/* Header responsive */}
        <CardHeader className="p-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, skyblue, #ff6f61, #66023c)" }}>
                Tableau de bord
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                <span className="hidden sm:inline">Vue d'ensemble de votre établissement - </span>
                {academicYearCurrent?.label}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-1 p-2 md:p-2"
              >
                <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="sr-only md:not-sr-only">Actualiser</span>
              </Button>

              <div className="flex items-center gap-1">
                <Badge variant="outline" className="gap-1 border-skyblue text-skyblue text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>{academicYearCurrent?.label?.split(" ")[0]}</span>
                </Badge>
                <Badge className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs">
                  <UserCheck className="h-3 w-3" />
                  <span>{userOnline?.name?.split(" ")[0]}</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        </CardHeader>

        {/* Statistiques principales - version mobile */}
        {visibleWidgets.stats && (
          <AdvancedStatsCards
            totalStudents={totalStudents}
            totalClasses={totalClasses}
            totalRevenue={totalRevenue}
            totalUsers={totalUsers}
            femaleStudents={femaleStudents}
            maleStudents={maleStudents}
            classOccupancyRate={classOccupancyRate}
            showComparison={showComparison}
            currency={settings?.[0]?.currency || "FCFA"}
          />
        )}

        {/* Onglets responsive */}
        <Tabs defaultValue="overview" className="space-y-4">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="grid w-full grid-cols-4 gap-1 md:gap-2">
              <TabsTrigger value="overview" className="text-xs md:text-sm gap-1">
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                <span>Vue</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="text-xs md:text-sm gap-1">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span>Élèves</span>
              </TabsTrigger>
              <TabsTrigger value="finances" className="text-xs md:text-sm gap-1">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                <span>Finances</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm gap-1">
                <PieChart className="h-3 w-3 md:h-4 md:w-4" />
                <span>Analyses</span>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                    <TrendingUp className="h-4 w-4" />
                    Inscriptions par mois
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:pl-2">
                  <MonthlyRegistrationsChart registrations={currentYearRegistrations} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                    <BookOpen className="h-4 w-4" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <QuickActions />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-sm md:text-base">Inscriptions récentes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[250px] md:h-[300px]">
                    <RecentInscriptions inscriptions={currentYearRegistrations} academicYear={academicYearCurrent} />
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card className="col-span-4">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-sm md:text-base">Répartition par classe</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ClassDistributionChart registrations={currentYearRegistrations} classes={classes} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-sm md:text-base">Répartition par sexe</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <GenderDistributionChart femaleCount={femaleStudents} maleCount={maleStudents} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-sm md:text-base">Statistiques détaillées</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <SchoolStats registrations={currentYearRegistrations} classes={classes} users={users} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="finances" className="space-y-4">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-sm md:text-base">Aperçu financier</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <FinancialOverviewChart
                  payments={currentYearPayments}
                  expenses={expenses || []}
                  academicYear={academicYearCurrent}
                  currency={settings?.[0]?.currency || "FCFA"}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-sm md:text-base">Taux d'occupation des classes</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {classes?.map((classe: Classe) => {
                      const studentsInClass = currentYearRegistrations.filter((reg) => reg.class_id === classe.id).length
                      const maxStudents = Number.parseInt(classe.max_student_number || "0")
                      const occupancyRate = maxStudents > 0 ? (studentsInClass / maxStudents) * 100 : 0

                      return (
                        <div key={classe.id} className="space-y-2">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span>{classe.label}</span>
                            <span>
                              {studentsInClass}/{maxStudents}
                            </span>
                          </div>
                          <Progress value={occupancyRate} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-sm md:text-base">Alertes et notifications</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {classes
                      ?.filter((classe) => {
                        const studentsInClass = currentYearRegistrations.filter(
                          (reg) => reg.class_id === classe.id,
                        ).length
                        const maxStudents = Number.parseInt(classe.max_student_number || "0")
                        return studentsInClass >= maxStudents * 0.9
                      })
                      .map((classe) => (
                        <div key={classe.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs md:text-sm">Classe {classe.label} presque pleine</span>
                        </div>
                      ))}
                    {classes?.filter((classe) => {
                      const studentsInClass = currentYearRegistrations.filter((reg) => reg.class_id === classe.id).length
                      const maxStudents = Number.parseInt(classe.max_student_number || "0")
                      return studentsInClass >= maxStudents
                    }).length === 0 && (
                        <div className="text-center text-muted-foreground py-4 text-xs md:text-sm">Aucune alerte pour le moment</div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Section responsive pour les notifications et métriques */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <InteractiveNotifications
              registrations={currentYearRegistrations}
              payments={currentYearPayments}
              classes={classes || []}
              installments={installements || []}
              academicYearCurrent={academicYearCurrent}
            />
          </div>

          <div className="space-y-4">
            <RealTimeMetrics
              registrations={currentYearRegistrations}
              payments={currentYearPayments}
              users={users || []}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </Card>
  )
}

export default DashboardView