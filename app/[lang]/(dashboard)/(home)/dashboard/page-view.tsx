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
// Remplacer les imports existants par ces imports améliorés
import AdvancedStatsCards from "./components/advanced-stats-cards"
import RealTimeMetrics from "./components/real-time-metrics"
import InteractiveNotifications from "./components/interactive-notifications"

// Ajouter ces imports au début du fichier
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getLastOpenSessionForUser } from "@/lib/fonction";
import { refreshAllData } from "@/store/schoolservice"
import { toast } from "@/components/ui/use-toast"

// Ajouter l'import du toast au début du fichier (après les autres imports)
import { Toaster } from "@/components/ui/toaster"

interface DashboardViewProps {
  trans?: {
    [key: string]: string
  }
}

const DashboardView = ({ trans }: DashboardViewProps) => {
  const { registrations, classes, users, academicYearCurrent, pricing, students, payments, userOnline, setCashRegisterSessionCurrent, cashRegisterSessions , installements , expenses,
    settings } =
    useSchoolStore()

  // Remplacer le state isLoading par ces nouveaux states
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
      const lastSession = getLastOpenSessionForUser(cashRegisterSessions, userOnline.id);
      if (lastSession) {
        setCashRegisterSessionCurrent(lastSession);
        console.log("Last session found:", lastSession);
      } else {
        setCashRegisterSessionCurrent(null);
      }
    }
  }, []);

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
  const totalUsers = users.filter((use)=> use.active === 1)?.length || 0

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

  // Ajouter cette fonction de rafraîchissement après les calculs existants
  const handleRefresh = async () => {
    setRefreshing(true)

    try {
      // Afficher un toast de début
      toast({
        title: "Actualisation en cours...",
        description: "Récupération des dernières données",
      })

      // Récupérer toutes les données fraîches
      const freshData = await refreshAllData()

      // Mettre à jour le store avec les nouvelles données
      const store = useSchoolStore.getState()

      // Mettre à jour chaque type de données dans le store
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

      // Toast de succès
      toast({
        title: "✅ Actualisation réussie",
        description: "Toutes les données ont été mises à jour",
        color: "default",
      })

      console.log("🔄 Données actualisées avec succès:", {
        classes: freshData.classes?.length || 0,
        registrations: freshData.registrations?.length || 0,
        payments: freshData.payments?.length || 0,
        students: freshData.students?.length || 0,
        users: freshData.users?.length || 0,
      })
    } catch (error) {
      console.error("❌ Erreur lors de l'actualisation:", error)

      // Toast d'erreur
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
    <Card>

    
    <div className="space-y-6 p-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      {/* Remplacer le header existant par cette version améliorée */}
      <CardHeader>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, skyblue, #ff6f61, #66023c)" }}>
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre établissement - {academicYearCurrent?.label}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Période</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent  className="z-[9999]">
                      <SelectItem value="current">Année actuelle</SelectItem>
                      <SelectItem value="last">Année précédente</SelectItem>
                      <SelectItem value="comparison">Comparaison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="comparison" checked={showComparison} onCheckedChange={setShowComparison} />
                  <Label htmlFor="comparison">Mode comparaison</Label>
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
                      <Label htmlFor={key} className="capitalize">
                        {key}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover> */}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>

          {/* <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exporter
          </Button> */}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2 border-skyblue text-skyblue">
              <Calendar className="h-4 w-4" />
              {academicYearCurrent?.label}
            </Badge>
            <Badge variant="outline" className="gap-2 bg-primary/10 text-primary border-primary/20">
              <UserCheck className="h-4 w-4" />
              {userOnline?.name}
            </Badge>
          </div>
        </div>
      </motion.div>
      </CardHeader>

      {/* Statistiques principales */}
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

      {/* Onglets pour organiser le contenu */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Élèves
          </TabsTrigger>
          <TabsTrigger value="finances" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Finances
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <PieChart className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Inscriptions par mois
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <MonthlyRegistrationsChart registrations={currentYearRegistrations} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Inscriptions récentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <RecentInscriptions inscriptions={currentYearRegistrations} academicYear={academicYearCurrent} />
                </ScrollArea>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Répartition par classe</CardTitle>
              </CardHeader>
              <CardContent>
                <ClassDistributionChart registrations={currentYearRegistrations} classes={classes} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par sexe</CardTitle>
              </CardHeader>
              <CardContent>
                <GenderDistributionChart femaleCount={femaleStudents} maleCount={maleStudents} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Statistiques détaillées</CardTitle>
              </CardHeader>
              <CardContent>
                <SchoolStats registrations={currentYearRegistrations} classes={classes} users={users} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finances" className="space-y-4">
          <Card>
            <CardHeader>
            <CardTitle>Aperçu financier</CardTitle>
            </CardHeader>
            <CardContent>
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
              <CardHeader>
                <CardTitle>Taux d'occupation des classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes?.map((classe: Classe) => {
                    const studentsInClass = currentYearRegistrations.filter((reg) => reg.class_id === classe.id).length
                    const maxStudents = Number.parseInt(classe.max_student_number || "0")
                    const occupancyRate = maxStudents > 0 ? (studentsInClass / maxStudents) * 100 : 0

                    return (
                      <div key={classe.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
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
              <CardHeader>
                <CardTitle>Alertes et notifications</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <span className="text-sm">Classe {classe.label} presque pleine</span>
                      </div>
                    ))}
                  {classes?.filter((classe) => {
                    const studentsInClass = currentYearRegistrations.filter((reg) => reg.class_id === classe.id).length
                    const maxStudents = Number.parseInt(classe.max_student_number || "0")
                    return studentsInClass >= maxStudents
                  }).length === 0 && (
                      <div className="text-center text-muted-foreground py-4">Aucune alerte pour le moment</div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ajouter cette nouvelle section après les onglets existants */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">{/* Contenu principal existant */}
          <InteractiveNotifications
            registrations={currentYearRegistrations}
            payments={currentYearPayments}
            classes={classes || []}
            installments={installements || []}
            academicYearCurrent={academicYearCurrent}
          />
        </div>

        <div className="">
          <RealTimeMetrics             
            registrations={currentYearRegistrations}
            payments={currentYearPayments}
            users={users || []} />


        </div>
      </div>
      
    </div>
    </Card>
  )
}

export default DashboardView
