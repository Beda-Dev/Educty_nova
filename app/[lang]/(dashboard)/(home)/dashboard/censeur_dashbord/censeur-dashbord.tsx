"use client"

import { useSchoolStore } from "@/store"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  UserCheck, 
  AlertTriangle,
  Calendar,
  FileText,
  Eye
} from "lucide-react"
import { motion } from "framer-motion"

interface CenseurDashboardProps {
  trans?: {
    [key: string]: string
  }
}

const CenseurDashboard = ({ trans }: CenseurDashboardProps) => {
  const { 
    students, 
    registrations, 
    classes, 
    reportCards, 
    presences,
    homeroomTeachers,
    averages,
    evaluations,
    professor,
    academicYearCurrent
  } = useSchoolStore()

  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    averageClassAverage: 0,
    absentStudentsToday: 0,
    pendingReports: 0,
    excellentStudents: 0,
    needsAttention: 0
  })

  useEffect(() => {
    // Calcul des statistiques du dashboard
    const calculateStats = () => {
      const today = new Date().toISOString().split('T')[0]
      
      // Étudiants absents aujourd'hui
      const todayPresences = presences.filter(p => p.date === today && p.status === 'absent')
      
      // Étudiants excellents (moyenne >= 16)
      const excellentStudents = averages.filter(avg => avg.value >= 16).length
      
      // Étudiants nécessitant attention (moyenne < 10)
      const needsAttentionStudents = averages.filter(avg => avg.value < 10).length
      
      // Moyenne générale des classes
      const totalAverage = averages.reduce((sum, avg) => sum + avg.value, 0)
      const averageClassAverage = averages.length > 0 ? totalAverage / averages.length : 0

      setDashboardStats({
        totalStudents: students.length,
        totalClasses: classes.length,
        averageClassAverage: Number(averageClassAverage.toFixed(2)),
        absentStudentsToday: todayPresences.length,
        pendingReports: reportCards.filter(rc => !rc.council_decision).length,
        excellentStudents,
        needsAttention: needsAttentionStudents
      })
    }

    calculateStats()
  }, [students, classes, averages, presences, reportCards])

  const quickActions = [
    {
      title: "Consulter les bulletins",
      description: "Voir les bulletins de notes des étudiants",
      icon: <FileText className="w-6 h-6" />,
      action: () => console.log("Navigate to bulletins"),
      color: "bg-blue-500"
    },
    {
      title: "Gérer les absences",
      description: "Consulter et traiter les absences du jour",
      icon: <UserCheck className="w-6 h-6" />,
      action: () => console.log("Navigate to presences"),
      color: "bg-orange-500"
    },
    {
      title: "Rapport disciplinaire",
      description: "Créer ou consulter des rapports disciplinaires",
      icon: <ClipboardList className="w-6 h-6" />,
      action: () => console.log("Navigate to discipline"),
      color: "bg-red-500"
    },
    {
      title: "Statistiques détaillées",
      description: "Voir les analyses approfondies",
      icon: <TrendingUp className="w-6 h-6" />,
      action: () => console.log("Navigate to stats"),
      color: "bg-green-500"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord - Censeur</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la vie scolaire et du suivi pédagogique
          </p>
        </div>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Rapport complet
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Répartis dans {dashboardStats.totalClasses} classes
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.averageClassAverage}/20</div>
              <p className="text-xs text-muted-foreground">
                Moyenne de l'établissement
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absences Aujourd'hui</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardStats.absentStudentsToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Étudiants absents ce jour
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Étudiants Excellents</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.excellentStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                Moyenne ≥ 16/20
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <p className="text-muted-foreground">
              Accès direct aux fonctionnalités principales
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-white mb-3`}>
                        {action.icon}
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Alertes Prioritaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">Étudiants en difficulté</p>
                    <p className="text-sm text-muted-foreground">
                      {dashboardStats.needsAttention} étudiants avec moyenne &lt; 10
                    </p>
                  </div>
                  <Badge color="destructive">{dashboardStats.needsAttention}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Bulletins en attente</p>
                    <p className="text-sm text-muted-foreground">
                      Décisions de conseil manquantes
                    </p>
                  </div>
                  <Badge color="secondary">{dashboardStats.pendingReports}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Performances Exceptionnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Étudiants excellents</p>
                    <p className="text-sm text-muted-foreground">
                      Moyenne générale ≥ 16/20
                    </p>
                  </div>
                  <Badge className="bg-green-600">{dashboardStats.excellentStudents}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Classes performantes</p>
                    <p className="text-sm text-muted-foreground">
                      Classes avec moyenne &gt; 12/20
                    </p>
                  </div>
                  <Badge className="bg-blue-600">
                    {averages.filter(avg => avg.value > 12).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default CenseurDashboard