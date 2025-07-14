"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolStore } from "@/store"
import type { Registration, Payment, Classe, User, Professor } from "@/lib/interface"
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
import SchoolStats from "../components/school-stats"
import RecentInscriptions from "../components/recent-inscriptions"
import GenderDistributionChart from "../components/gender-distribution-chart"
import ClassDistributionChart from "../components/class-distribution-chart"
import MonthlyRegistrationsChart from "../components/monthly-registrations-chart"
import QuickActions from "../components/quick-actions"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Imports améliorés avec vraies données
import AdvancedStatsCards from "../components/advanced-stats-cards"
import RealTimeMetrics from "../components/real-time-metrics"
import InteractiveNotifications from "../components/interactive-notifications"
import FinancialOverviewChart from "../components/financial-overview-chart"

// Autres imports
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Download, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// Ajouter l'import du service au début du fichier
import { refreshAllData } from "@/store/schoolservice"
import { toast } from "@/components/ui/use-toast"

// Ajouter l'import du toast au début du fichier (après les autres imports)
import { Toaster } from "@/components/ui/toaster"
import Loading from "../loading"

interface DashboardViewProps {
  trans?: {
    [key: string]: string
  }
}

const DashboardView = ({ trans }: DashboardViewProps) => {
  const {
    registrations,
    classes,
    users,
    professor, // Ajouter professors
    academicYearCurrent,
    pricing,
    students,
    payments,
    userOnline,
    installements,
    expenses,
    settings,
  } = useSchoolStore()

  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [showComparison, setShowComparison] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState({
    stats: true,
  })

  // Filtrer les données par année académique actuelle
  const currentYearRegistrations =
    registrations?.filter((reg: Registration) => reg.academic_year_id === academicYearCurrent?.id) || []

  const currentYearPayments =
    payments?.filter((payment: Payment) => {
      const studentRegistration = currentYearRegistrations.find((reg) => reg.student_id === payment.student_id)
      return !!studentRegistration
    }) || []

  // Calculs des statistiques avec vraies données
  const totalStudents = currentYearRegistrations.length
  const totalClasses = classes?.length || 0

  // Utilisateurs actifs (active == 1)
  const activeUsers = users?.filter((user: User) => user.active === 1) || []
  const totalActiveUsers = activeUsers.length

  // Professeurs actifs
  const activeProfessors =
    professor?.filter((prof: Professor) => prof.user && activeUsers.some((user) => user.id === prof.user_id)) || []
  const totalActiveProfessors = activeProfessors.length

  // Professeurs par type
  const permanentProfessors = activeProfessors.filter((prof) => prof.type === "permanent").length
  const vacataireProfessors = activeProfessors.filter((prof) => prof.type === "vacataire").length

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

  // Dans la fonction handleRefresh, remplacer le contenu par :
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
      <Loading/>
    )
  }

  return (
    <Card className="border-0 w-full ">
      <div className="space-y-6 p-6 animate-in fade-in-50 duration-500">
        {/* Header amélioré et responsive avec nouveau gradient */}
        <CardHeader className="p-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 lg:gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1
                className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, skyblue, #ff6f61, #66023c)" }}
              >
                Tableau de bord
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                <span className="hidden sm:inline">Vue d'ensemble de votre établissement - </span>
                {academicYearCurrent?.label}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm">
                      <Filter className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="hidden sm:inline">Filtres</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">

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

                {/* <Button variant="outline" size="sm" className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm">
                  <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </Button> */}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1 lg:gap-2 border-skyblue text-skyblue text-xs">
                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">{academicYearCurrent?.label}</span>
                  <span className="sm:hidden">{academicYearCurrent?.label?.split(" ")[0]}</span>
                </Badge>
                <Badge color="secondary" className="gap-1 lg:gap-2 bg-primary/10 text-primary border-primary/20 text-xs">
                  <UserCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">{userOnline?.name}</span>
                  <span className="sm:hidden">{userOnline?.name?.split(" ")[0]}</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent>



          {/* Statistiques principales avec vraies données */}
          {visibleWidgets.stats && (
            <AdvancedStatsCards
              totalStudents={totalStudents}
              totalClasses={totalClasses}
              totalRevenue={totalRevenue}
              totalUsers={totalActiveUsers}
              totalProfessors={totalActiveProfessors}
              permanentProfessors={permanentProfessors}
              vacataireProfessors={vacataireProfessors}
              femaleStudents={femaleStudents}
              maleStudents={maleStudents}
              classOccupancyRate={classOccupancyRate}
              showComparison={showComparison}
              currency={settings?.[0]?.currency || "FCFA"}
            />
          )}

          {/* Layout principal responsive */}
          <div className="grid gap-4 lg:grid-cols-4">
            {/* Contenu principal */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
              {/* Onglets pour organiser le contenu */}
              <Tabs defaultValue="overview" className="space-y-4">
                <div className="overflow-x-auto">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 min-w-[400px] lg:min-w-0">
                    <TabsTrigger value="overview" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                      <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="hidden sm:inline">Vue d'ensemble</span>
                      <span className="sm:hidden">Vue</span>
                    </TabsTrigger>
                    <TabsTrigger value="students" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                      <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                      Élèves
                    </TabsTrigger>
                    <TabsTrigger value="finances" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                      <DollarSign className="h-3 w-3 lg:h-4 lg:w-4" />
                      Finances
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                      <PieChart className="h-3 w-3 lg:h-4 lg:w-4" />
                      Analyses
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                          <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="hidden sm:inline">Inscriptions par mois</span>
                          <span className="sm:hidden">Inscriptions</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pl-2">
                        <MonthlyRegistrationsChart registrations={currentYearRegistrations} />
                      </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                          <BookOpen className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="hidden sm:inline">Actions rapides</span>
                          <span className="sm:hidden">Actions</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <QuickActions />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-7">
                    <Card className="lg:col-span-3">
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="text-lg lg:text-xl">
                          <span className="hidden sm:inline">Inscriptions récentes</span>
                          <span className="sm:hidden">Récentes</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[300px] lg:h-[400px]">
                          <RecentInscriptions inscriptions={currentYearRegistrations} academicYear={academicYearCurrent} />
                        </ScrollArea>
                      </CardContent>
                    </Card>
                    <Card className="lg:col-span-4">
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="text-lg lg:text-xl">
                          <span className="hidden sm:inline">Répartition par classe</span>
                          <span className="sm:hidden">Classes</span>
                        </CardTitle>
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
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="text-lg lg:text-xl">Répartition par sexe</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <GenderDistributionChart femaleCount={femaleStudents} maleCount={maleStudents} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="text-lg lg:text-xl">
                          <span className="hidden sm:inline">Statistiques détaillées</span>
                          <span className="sm:hidden">Statistiques</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SchoolStats
                          registrations={currentYearRegistrations}
                          classes={classes}
                          users={activeUsers}
                          professors={activeProfessors}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="finances" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2 lg:pb-3">
                      <CardTitle className="text-lg lg:text-xl">Aperçu financier</CardTitle>
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
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="text-lg lg:text-xl">
                          <span className="hidden sm:inline">Taux d'occupation des classes</span>
                          <span className="sm:hidden">Occupation</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {classes?.map((classe: Classe) => {
                            const studentsInClass = currentYearRegistrations.filter(
                              (reg) => reg.class_id === classe.id,
                            ).length
                            const maxStudents = Number.parseInt(classe.max_student_number || "0")
                            const occupancyRate = maxStudents > 0 ? (studentsInClass / maxStudents) * 100 : 0

                            return (
                              <div key={classe.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="truncate">
                                    {classe.label}
                                    {classe.level && ` (${classe.level.label})`}
                                    {classe.serie && ` - ${classe.serie.label}`}
                                  </span>
                                  <span className="text-xs lg:text-sm">
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
                      <CardHeader className="pb-2 lg:pb-3">
                        <CardTitle className="text-lg lg:text-xl">
                          <span className="hidden sm:inline">Alertes et notifications</span>
                          <span className="sm:hidden">Alertes</span>
                        </CardTitle>
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
                                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <span className="text-sm truncate">
                                  Classe {classe.label}
                                  {classe.level && ` (${classe.level.label})`}
                                  {classe.serie && ` - ${classe.serie.label}`} presque pleine
                                </span>
                              </div>
                            ))}
                          {classes?.filter((classe) => {
                            const studentsInClass = currentYearRegistrations.filter(
                              (reg) => reg.class_id === classe.id,
                            ).length
                            const maxStudents = Number.parseInt(classe.max_student_number || "0")
                            return studentsInClass >= maxStudents
                          }).length === 0 && (
                              <div className="text-center text-muted-foreground py-4 text-sm">
                                Aucune alerte pour le moment
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar avec métriques temps réel et notifications - masquée sur mobile */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="col-span-1">
                  <InteractiveNotifications
                    registrations={currentYearRegistrations}
                    payments={currentYearPayments}
                    classes={classes || []}
                    installments={installements || []}
                    academicYearCurrent={academicYearCurrent}
                  />
                </div>
                <div className="col-span-1 hidden lg:block ">
                  <RealTimeMetrics
                    registrations={currentYearRegistrations}
                    payments={currentYearPayments}
                    users={activeUsers}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Métriques temps réel pour mobile - affichées en bas */}
          <div className="lg:hidden mt-6">
            <RealTimeMetrics registrations={currentYearRegistrations} payments={currentYearPayments} users={activeUsers} />
          </div>
          <Toaster />
        </CardContent>
      </div>

    </Card >
  )
}

export default DashboardView
