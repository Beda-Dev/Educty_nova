"use client"

import { useSchoolStore } from "@/store"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  UserCheck, 
  UserX, 
  Clock, 
  MessageSquare, 
  AlertCircle,
  Users,
  Calendar,
  Activity,
  Eye,
  Plus
} from "lucide-react"
import { motion } from "framer-motion"

interface EducateurDashboardProps {
  trans?: {
    [key: string]: string
  }
}

const EducateurDashboard = ({ trans }: EducateurDashboardProps) => {
  const { 
    students, 
    presences,
    correspondencesBooks,
    correspondencesEntries,
    registrations,
    classes,
    timetables
  } = useSchoolStore()

  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0,
    newMessages: 0,
    urgentMessages: 0,
    disciplinaryActions: 0
  })

  useEffect(() => {
    // Calcul des statistiques du dashboard
    const calculateStats = () => {
      const today = new Date().toISOString().split('T')[0]
      
      // Présences d'aujourd'hui
      const todayPresences = presences.filter(p => p.date === today)
      const presentToday = todayPresences.filter(p => p.status === 'present').length
      const absentToday = todayPresences.filter(p => p.status === 'absent').length
      const lateToday = todayPresences.filter(p => p.status === 'late').length
      
      // Taux de présence
      const attendanceRate = todayPresences.length > 0 
        ? Math.round((presentToday / todayPresences.length) * 100) 
        : 0

      // Messages récents (dernière semaine)
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      const recentMessages = correspondencesEntries.filter(
        entry => new Date(entry.created_at) >= lastWeek
      )
      
      // Messages urgents (disciplinaires)
      const urgentMessages = correspondencesEntries.filter(
        entry => entry.message_type.toLowerCase().includes('disciplinaire')
      ).length

      setDashboardStats({
        totalStudents: students.length,
        presentToday,
        absentToday,
        lateToday,
        attendanceRate,
        newMessages: recentMessages.length,
        urgentMessages,
        disciplinaryActions: urgentMessages
      })
    }

    calculateStats()
  }, [students, presences, correspondencesEntries])

  const quickActions = [
    {
      title: "Prendre les présences",
      description: "Enregistrer les présences du jour",
      icon: <UserCheck className="w-6 h-6" />,
      action: () => console.log("Navigate to attendance"),
      color: "bg-blue-500"
    },
    {
      title: "Nouveau message",
      description: "Créer un message pour les parents",
      icon: <MessageSquare className="w-6 h-6" />,
      action: () => console.log("Navigate to messages"),
      color: "bg-green-500"
    },
    {
      title: "Rapport disciplinaire",
      description: "Signaler un incident",
      icon: <AlertCircle className="w-6 h-6" />,
      action: () => console.log("Navigate to discipline"),
      color: "bg-red-500"
    },
    {
      title: "Planning des cours",
      description: "Consulter l'emploi du temps",
      icon: <Calendar className="w-6 h-6" />,
      action: () => console.log("Navigate to timetable"),
      color: "bg-purple-500"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "absence",
      message: "Signalement d'absence - Jean Dupont",
      time: "Il y a 10 minutes",
      urgent: false
    },
    {
      id: 2,
      type: "discipline",
      message: "Incident en classe - Marie Martin",
      time: "Il y a 1 heure",
      urgent: true
    },
    {
      id: 3,
      type: "message",
      message: "Message envoyé aux parents - Classe 6ème A",
      time: "Il y a 2 heures",
      urgent: false
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
          <h1 className="text-3xl font-bold">Tableau de Bord - Éducateur</h1>
          <p className="text-muted-foreground">
            Gestion de la vie scolaire et suivi des étudiants
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rapport
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Vue d'ensemble
          </Button>
        </div>
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
              <CardTitle className="text-sm font-medium">Présents Aujourd'hui</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.presentToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Sur {dashboardStats.totalStudents} étudiants
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
              <CardTitle className="text-sm font-medium">Absents</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {dashboardStats.absentToday}
              </div>
              <p className="text-xs text-muted-foreground">
                À justifier
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
              <CardTitle className="text-sm font-medium">Retards</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardStats.lateToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Ce matin
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
              <CardTitle className="text-sm font-medium">Taux de Présence</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats.attendanceRate}%
              </div>
              <Progress value={dashboardStats.attendanceRate} className="mt-2" />
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
              Outils essentiels pour la gestion quotidienne
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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages et Communications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages et Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Nouveaux messages</p>
                    <p className="text-sm text-muted-foreground">
                      Cette semaine
                    </p>
                  </div>
                  <Badge className="bg-blue-600">{dashboardStats.newMessages}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">Messages urgents</p>
                    <p className="text-sm text-muted-foreground">
                      Nécessitent une attention
                    </p>
                  </div>
                  <Badge color="destructive">{dashboardStats.urgentMessages}</Badge>
                </div>

                <Button className="w-full" variant="outline">
                  Voir tous les messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activités Récentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.urgent ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    {activity.urgent && (
                      <Badge color="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                Voir toutes les activités
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Résumé des Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Résumé par Classe
            </CardTitle>
            <p className="text-muted-foreground">
              État des présences aujourd'hui
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.slice(0, 6).map((classe) => {
                // Calculer les stats pour chaque classe (simulation)
                const classPresences = presences.filter(p => 
                  p.timetable?.class_id === classe.id && 
                  p.date === new Date().toISOString().split('T')[0]
                )
                const present = classPresences.filter(p => p.status === 'present').length
                const absent = classPresences.filter(p => p.status === 'absent').length
                const total = present + absent

                return (
                  <Card key={classe.id} className="p-4">
                    <h3 className="font-semibold mb-2">{classe.label}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Présents:</span>
                        <span className="text-green-600 font-medium">{present}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Absents:</span>
                        <span className="text-red-600 font-medium">{absent}</span>
                      </div>
                      {total > 0 && (
                        <Progress 
                          value={(present / total) * 100} 
                          className="h-2"
                        />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default EducateurDashboard