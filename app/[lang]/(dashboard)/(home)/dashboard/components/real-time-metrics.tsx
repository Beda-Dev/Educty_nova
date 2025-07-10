"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Wifi, WifiOff, Zap, Clock, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Registration, Payment, User } from "@/lib/interface"

interface RealTimeMetricsProps {
  registrations: Registration[]
  payments: Payment[]
  users: User[]
}

const RealTimeMetrics = ({ registrations, payments, users }: RealTimeMetricsProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [systemMetrics, setSystemMetrics] = useState({
    responseTime: 0,
    dataFreshness: 0,
    activeUsers: 0,
  })

  // Calculer les utilisateurs actifs (connectés dans les dernières 24h)
  const calculateActiveUsers = () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Simuler l'activité basée sur les données récentes
    const recentRegistrations = registrations.filter((reg) => new Date(reg.created_at) > yesterday).length

    const recentPayments = payments.filter((payment) => new Date(payment.created_at) > yesterday).length

    // Estimer les utilisateurs actifs basé sur l'activité récente
    return Math.min(users.length, Math.max(1, recentRegistrations + recentPayments + Math.floor(users.length * 0.3)))
  }

  // Calculer la fraîcheur des données
  const calculateDataFreshness = () => {
    const now = new Date()
    const recentData = [
      ...registrations.map((r) => new Date(r.updated_at || r.created_at)),
      ...payments.map((p) => new Date(p.updated_at || p.created_at)),
    ].sort((a, b) => b.getTime() - a.getTime())

    if (recentData.length === 0) return 0

    const latestUpdate = recentData[0]
    const timeDiff = now.getTime() - latestUpdate.getTime()
    const hoursAgo = timeDiff / (1000 * 60 * 60)

    // Plus les données sont récentes, plus le score est élevé
    return Math.max(0, 100 - hoursAgo * 10)
  }

  // Générer l'activité récente basée sur les vraies données
  const generateRecentActivity = () => {
    const now = new Date()
    const activities: any[] = []

    // Inscriptions récentes (dernières 24h)
    const recentRegistrations = registrations
      .filter((reg) => {
        const regDate = new Date(reg.created_at)
        return now.getTime() - regDate.getTime() < 24 * 60 * 60 * 1000
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)

    recentRegistrations.forEach((reg) => {
      const timeAgo = getTimeAgo(new Date(reg.created_at))
      activities.push({
        id: `reg-${reg.id}`,
        action: `Inscription de ${reg.student.first_name} ${reg.student.name}`,
        time: timeAgo,
        type: "success",
        details: `Classe: ${reg.classe.label}`,
      })
    })

    // Paiements récents (dernières 24h)
    const recentPayments = payments
      .filter((payment) => {
        const paymentDate = new Date(payment.created_at)
        return now.getTime() - paymentDate.getTime() < 24 * 60 * 60 * 1000
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)

    recentPayments.forEach((payment) => {
      const timeAgo = getTimeAgo(new Date(payment.created_at))
      activities.push({
        id: `pay-${payment.id}`,
        action: `Paiement reçu de ${payment.student.first_name} ${payment.student.name}`,
        time: timeAgo,
        type: "info",
        details: `Montant: ${Number(payment.amount).toLocaleString()} FCFA`,
      })
    })

    // Trier par date décroissante
    return activities
      .sort((a, b) => {
        const aTime = getTimeFromAgo(a.time)
        const bTime = getTimeFromAgo(b.time)
        return aTime - bTime
      })
      .slice(0, 5)
  }

  // Fonction utilitaire pour calculer le temps écoulé
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return `Il y a ${Math.floor(diffHours / 24)} jour(s)`
  }

  // Fonction utilitaire pour convertir le temps en millisecondes (pour le tri)
  const getTimeFromAgo = (timeAgo: string) => {
    if (timeAgo === "À l'instant") return 0
    if (timeAgo.includes("min")) return Number.parseInt(timeAgo.match(/\d+/)?.[0] || "0") * 60 * 1000
    if (timeAgo.includes("h")) return Number.parseInt(timeAgo.match(/\d+/)?.[0] || "0") * 60 * 60 * 1000
    if (timeAgo.includes("jour")) return Number.parseInt(timeAgo.match(/\d+/)?.[0] || "0") * 24 * 60 * 60 * 1000
    return 0
  }

  // Simuler le temps de réponse basé sur la charge de données
  const calculateResponseTime = () => {
    const dataLoad = registrations.length + payments.length + users.length
    const baseTime = 50 // temps de base en ms
    const loadFactor = Math.floor(dataLoad / 100) * 10
    return baseTime + loadFactor + Math.floor(Math.random() * 20)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())

      // Mettre à jour les métriques système
      setSystemMetrics({
        responseTime: calculateResponseTime(),
        dataFreshness: calculateDataFreshness(),
        activeUsers: calculateActiveUsers(),
      })

      // Mettre à jour l'activité récente
      setRecentActivity(generateRecentActivity())
    }, 5000) // Mise à jour toutes les 5 secondes

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initialisation
    setSystemMetrics({
      responseTime: calculateResponseTime(),
      dataFreshness: calculateDataFreshness(),
      activeUsers: calculateActiveUsers(),
    })
    setRecentActivity(generateRecentActivity())

    return () => {
      clearInterval(timer)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [registrations, payments, users])

  const metrics = [
    // {
    //   label: "Utilisateurs actifs",
    //   value: systemMetrics.activeUsers,
    //   total: users.length,
    //   icon: Users,
    //   color: "skyblue",
    //   pulse: systemMetrics.activeUsers > 0,
    //   description: "Connectés aujourd'hui",
    // },
    {
      label: "Connexion",
      value: isOnline ? "En ligne" : "Hors ligne",
      icon: isOnline ? Wifi : WifiOff,
      color: isOnline ? "success" : "destructive",
      pulse: !isOnline,
      description: isOnline ? "Stable" : "Vérifiez votre connexion",
    }
    // {
    //   label: "Performance",
    //   value: `${systemMetrics.responseTime}ms`,
    //   icon: Zap,
    //   color:
    //     systemMetrics.responseTime < 100 ? "success" : systemMetrics.responseTime < 200 ? "warning" : "destructive",
    //   pulse: systemMetrics.responseTime > 200,
    //   description: "Temps de réponse",
    // }
  ]

  return (
    <div className="space-y-4">
      {/* Métriques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {typeof metric.value === "number" ? metric.value : metric.value}
                      </span>
                      {metric.pulse && (
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            metric.color === "skyblue" && "bg-skyblue",
                            metric.color === "success" && "bg-success",
                            metric.color === "destructive" && "bg-destructive",
                            metric.color === "warning" && "bg-warning",
                          )}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      metric.color === "skyblue" && "bg-skyblue/20 text-skyblue",
                      metric.color === "success" && "bg-success/20 text-success",
                      metric.color === "destructive" && "bg-destructive/20 text-destructive",
                      metric.color === "warning" && "bg-warning/20 text-warning",
                    )}
                  >
                    <metric.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité récente
            <span className="text-sm font-normal text-muted-foreground">(Dernières 24h)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        activity.type === "success" && "bg-success animate-pulse",
                        activity.type === "info" && "bg-skyblue animate-pulse",
                        activity.type === "default" && "bg-muted-foreground",
                      )}
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-medium">{activity.action}</span>
                      {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune activité récente</p>
                <p className="text-xs">Les nouvelles activités apparaîtront ici</p>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Horloge en temps réel */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-mono font-bold text-primary">
              {currentTime.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-success animate-pulse" : "bg-destructive")} />
              <span className="text-muted-foreground">{isOnline ? "Synchronisé" : "Hors ligne"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealTimeMetrics
