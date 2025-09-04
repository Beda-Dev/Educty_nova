"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Eye,
  ExternalLink,
  GraduationCap,
  CreditCard,
  AlertCircle,
  Database,
  Trash2,
  BookMarkedIcon as MarkAsRead,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Registration, Payment, Classe, Installment } from "@/lib/interface"

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high"
  category: "system" | "payment" | "registration" | "class" | "deadline"
  action?: {
    label: string
    onClick: () => void
  }
  data?: any
  details?: {
    items: any[]
    totalCount: number
    summary: string
  }
}

interface NotificationDB extends DBSchema {
  notifications: {
    key: string
    value: {
      id: string
      type: string
      title: string
      message: string
      timestamp: string
      read: boolean
      priority: string
      category: string
      data: any
      details: any
    }
  }
}

interface InteractiveNotificationsProps {
  registrations: Registration[]
  payments: Payment[]
  classes: Classe[]
  installments: Installment[]
  academicYearCurrent: any
}

const InteractiveNotifications = ({
  registrations,
  payments,
  classes,
  installments,
  academicYearCurrent,
}: InteractiveNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [db, setDb] = useState<IDBPDatabase<NotificationDB> | null>(null)
  const router = useRouter()

  // Initialiser IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<NotificationDB>("NotificationsDB", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("notifications")) {
              db.createObjectStore("notifications", { keyPath: "id" })
            }
          },
        })
        setDb(database)
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la base de données:", error)
      }
    }

    initDB()
  }, [])

  // Sauvegarder les notifications dans IndexedDB
  const saveNotificationToDB = async (notification: Notification) => {
    if (!db) return

    try {
      await db.put("notifications", {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp.toISOString(),
        read: notification.read,
        priority: notification.priority,
        category: notification.category,
        data: notification.data,
        details: notification.details,
      })
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    }
  }

  // Charger les notifications depuis IndexedDB
  const loadNotificationsFromDB = async () => {
    if (!db) return []

    try {
      const storedNotifications = await db.getAll("notifications")
      return storedNotifications.map((notif) => ({
        ...notif,
        timestamp: new Date(notif.timestamp),
      }))
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      return []
    }
  }

  // Mettre à jour une notification dans IndexedDB
  const updateNotificationInDB = async (id: string, updates: Partial<Notification>) => {
    if (!db) return

    try {
      const existing = await db.get("notifications", id)
      if (existing) {
        await db.put("notifications", {
          ...existing,
          ...updates,
          timestamp: updates.timestamp ? updates.timestamp.toISOString() : existing.timestamp,
        })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    }
  }

  // Supprimer une notification de IndexedDB
  const deleteNotificationFromDB = async (id: string) => {
    if (!db) return

    try {
      await db.delete("notifications", id)
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  useEffect(() => {
    if (!db) return

    const generateEnhancedNotifications = async () => {
      const newNotifs: Notification[] = []
      const now = new Date()

      // Charger les notifications existantes
      const existingNotifications = await loadNotificationsFromDB()
      const existingIds = new Set(existingNotifications.map((n) => n.id))

      // 1. Alertes de capacité des classes avec détails complets
      classes.forEach((classe) => {
        const studentsInClass = registrations.filter(
          (reg) => reg.class_id === classe.id && reg.academic_year_id === academicYearCurrent?.id,
        )
        const maxStudents = Number.parseInt(classe.max_student_number || "0")
        const occupancyRate = maxStudents > 0 ? (studentsInClass.length / maxStudents) * 100 : 0

        if (occupancyRate >= 85) {
          const notificationId = `capacity-${classe.id}`

          if (!existingIds.has(notificationId)) {
            const notification: Notification = {
              id: notificationId,
              type: occupancyRate >= 100 ? "error" : occupancyRate >= 95 ? "warning" : "info",
              title:
                occupancyRate >= 100
                  ? "Classe complète"
                  : occupancyRate >= 95
                    ? "Classe presque pleine"
                    : "Classe en voie de saturation",
              message: `${classe.label}: ${studentsInClass.length}/${maxStudents} élèves (${Math.round(occupancyRate)}%)`,
              timestamp: new Date(now.getTime() - Math.random() * 3600000),
              read: false,
              priority: occupancyRate >= 100 ? "high" : occupancyRate >= 95 ? "medium" : "low",
              category: "class",
              data: { classe, studentsInClass, maxStudents, occupancyRate },
              details: {
                items: studentsInClass.map((reg) => ({
                  id: reg.student.id,
                  name: `${reg.student.first_name} ${reg.student.name}`,
                  photo: reg.student.photo,
                  registrationDate: reg.registration_date,
                  sexe: reg.student.sexe,
                  age: reg.student.birth_date
                    ? new Date().getFullYear() - new Date(reg.student.birth_date).getFullYear()
                    : null,
                })),
                totalCount: studentsInClass.length,
                summary: `${studentsInClass.length} élèves inscrits sur ${maxStudents} places disponibles`,
              },
              action: {
                label: "Voir détails",
                onClick: () => {
                  setSelectedNotification(notification)
                  setIsModalOpen(true)
                },
              },
            }

            newNotifs.push(notification)
            saveNotificationToDB(notification)
          }
        }
      })

      // 2. Paiements récents avec détails complets
      const recentPayments = payments.filter((payment) => {
        const paymentDate = new Date(payment.created_at)
        return now.getTime() - paymentDate.getTime() < 24 * 60 * 60 * 1000
      })

      if (recentPayments.length > 0) {
        const notificationId = "recent-payments-today"

        if (!existingIds.has(notificationId)) {
          const totalAmount = recentPayments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount || "0"), 0)
          const avgAmount = totalAmount / recentPayments.length

          const notification: Notification = {
            id: notificationId,
            type: "success",
            title: "Paiements du jour",
            message: `${recentPayments.length} paiement${recentPayments.length > 1 ? "s" : ""} reçu${recentPayments.length > 1 ? "s" : ""} - ${totalAmount.toLocaleString()} FCFA`,
            timestamp: new Date(now.getTime() - 1800000),
            read: false,
            priority: totalAmount > 500000 ? "high" : "medium",
            category: "payment",
            data: { payments: recentPayments, totalAmount, avgAmount },
            details: {
              items: recentPayments.map((payment) => ({
                id: payment.id,
                studentId: payment.student.id,
                studentName: `${payment.student.first_name} ${payment.student.name}`,
                amount: Number.parseFloat(payment.amount || "0"),
                paymentDate: payment.created_at,
                method: payment.payment_methods || "Non spécifié",
                photo: payment.student.photo,
              })),
              totalCount: recentPayments.length,
              summary: `Total: ${totalAmount.toLocaleString()} FCFA - Moyenne: ${avgAmount.toLocaleString()} FCFA`,
            },
            action: {
              label: "Voir paiements",
              onClick: () => {
                setSelectedNotification(notification)
                setIsModalOpen(true)
              },
            },
          }

          newNotifs.push(notification)
          saveNotificationToDB(notification)
        }
      }

      // 3. Nouvelles inscriptions avec détails complets
      const recentRegistrations = registrations.filter((reg) => {
        const regDate = new Date(reg.created_at)
        return (
          now.getTime() - regDate.getTime() < 7 * 24 * 60 * 60 * 1000 &&
          reg.academic_year_id === academicYearCurrent?.id
        )
      })

      if (recentRegistrations.length > 0) {
        const notificationId = "recent-registrations-week"

        if (!existingIds.has(notificationId)) {
          const femaleCount = recentRegistrations.filter((reg) =>
            ["f", "féminin", "feminin", "female"].includes(reg.student?.sexe?.toLowerCase()),
          ).length
          const maleCount = recentRegistrations.length - femaleCount

          const notification: Notification = {
            id: notificationId,
            type: "info",
            title: "Nouvelles inscriptions",
            message: `${recentRegistrations.length} nouvelle${recentRegistrations.length > 1 ? "s" : ""} inscription${recentRegistrations.length > 1 ? "s" : ""} cette semaine`,
            timestamp: new Date(now.getTime() - 7200000),
            read: false,
            priority: recentRegistrations.length > 10 ? "medium" : "low",
            category: "registration",
            data: { registrations: recentRegistrations, femaleCount, maleCount },
            details: {
              items: recentRegistrations.map((reg) => ({
                id: reg.id,
                studentId: reg.student.id,
                studentName: `${reg.student.first_name} ${reg.student.name}`,
                className: reg.classe.label,
                registrationDate: reg.registration_date,
                sexe: reg.student.sexe,
                age: reg.student.birth_date
                  ? new Date().getFullYear() - new Date(reg.student.birth_date).getFullYear()
                  : null,
                photo: reg.student.photo,
              })),
              totalCount: recentRegistrations.length,
              summary: `${femaleCount} filles, ${maleCount} garçons - Répartis dans ${new Set(recentRegistrations.map((r) => r.classe.label)).size} classes`,
            },
            action: {
              label: "Voir inscriptions",
              onClick: () => {
                setSelectedNotification(notification)
                setIsModalOpen(true)
              },
            },
          }

          newNotifs.push(notification)
          saveNotificationToDB(notification)
        }
      }

      // // 4. Échéances de paiement avec détails complets
      // const upcomingDueInstallments = installments.filter((installment) => {
      //   const dueDate = new Date(installment.due_date)
      //   const daysDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      //   return daysDiff <= 7 && daysDiff >= 0 && installment.status !== "paid"
      // })

      // if (upcomingDueInstallments.length > 0) {
      //   const notificationId = "upcoming-due-installments"

      //   if (!existingIds.has(notificationId)) {
      //     const totalAmount = upcomingDueInstallments.reduce(
      //       (sum, inst) => sum + Number.parseFloat(inst.amount_due || "0"),
      //       0,
      //     )

      //     const notification: Notification = {
      //       id: notificationId,
      //       type: "warning",
      //       title: "Échéances à venir",
      //       message: `${upcomingDueInstallments.length} échéance${upcomingDueInstallments.length > 1 ? "s" : ""} dans les 7 prochains jours - ${totalAmount.toLocaleString()} FCFA`,
      //       timestamp: new Date(now.getTime() - 3600000),
      //       read: false,
      //       priority: "high",
      //       category: "deadline",
      //       data: { installments: upcomingDueInstallments, totalAmount },
      //       details: {
      //         items: upcomingDueInstallments.map((inst) => ({
      //           id: inst.id,
      //           amount: Number.parseFloat(inst.amount_due || "0"),
      //           dueDate: inst.due_date,
      //           status: inst.status,
      //           daysRemaining: Math.ceil((new Date(inst.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      //         })),
      //         totalCount: upcomingDueInstallments.length,
      //         summary: `Montant total attendu: ${totalAmount.toLocaleString()} FCFA`,
      //       },
      //       action: {
      //         label: "Voir échéances",
      //         onClick: () => {
      //           setSelectedNotification(notification)
      //           setIsModalOpen(true)
      //         },
      //       },
      //     }

      //     newNotifs.push(notification)
      //     saveNotificationToDB(notification)
      //   }
      // }

      // // 5. Échéances dépassées avec détails complets
      // const overdueInstallments = installments.filter((installment) => {
      //   const dueDate = new Date(installment.due_date)
      //   return dueDate < now && installment.status !== "paid"
      // })

      // if (overdueInstallments.length > 0) {
      //   const notificationId = "overdue-installments"

      //   if (!existingIds.has(notificationId)) {
      //     const totalOverdueAmount = overdueInstallments.reduce(
      //       (sum, inst) => sum + Number.parseFloat(inst.amount_due || "0"),
      //       0,
      //     )

      //     const notification: Notification = {
      //       id: notificationId,
      //       type: "error",
      //       title: "Échéances dépassées",
      //       message: `${overdueInstallments.length} paiement${overdueInstallments.length > 1 ? "s" : ""} en retard - ${totalOverdueAmount.toLocaleString()} FCFA`,
      //       timestamp: new Date(now.getTime() - 1800000),
      //       read: false,
      //       priority: "high",
      //       category: "deadline",
      //       data: { installments: overdueInstallments, totalOverdueAmount },
      //       details: {
      //         items: overdueInstallments.map((inst) => ({
      //           id: inst.id,
      //           amount: Number.parseFloat(inst.amount_due || "0"),
      //           dueDate: inst.due_date,
      //           status: inst.status,
      //           daysOverdue: Math.ceil((now.getTime() - new Date(inst.due_date).getTime()) / (1000 * 60 * 60 * 24)),
      //         })),
      //         totalCount: overdueInstallments.length,
      //         summary: `Montant total en retard: ${totalOverdueAmount.toLocaleString()} FCFA`,
      //       },
      //       action: {
      //         label: "Traiter retards",
      //         onClick: () => {
      //           setSelectedNotification(notification)
      //           setIsModalOpen(true)
      //         },
      //       },
      //     }

      //     newNotifs.push(notification)
      //     saveNotificationToDB(notification)
      //   }
      // }

      // Combiner avec les notifications existantes et trier
      // Définition des valeurs autorisées
      const ALLOWED_TYPES = ["success", "warning", "info", "error"] as const;
      const ALLOWED_PRIORITIES = ["low", "medium", "high"] as const;
      const ALLOWED_CATEGORIES = ["system", "payment", "registration", "class", "deadline"] as const;

      const allNotifications = [...existingNotifications, ...newNotifs]
        .map(notification => ({
          ...notification,
          type: ALLOWED_TYPES.includes(notification.type as any) 
            ? notification.type as typeof ALLOWED_TYPES[number]
            : "info", // Valeur par défaut
          priority: ALLOWED_PRIORITIES.includes(notification.priority as any)
            ? notification.priority as typeof ALLOWED_PRIORITIES[number]
            : "medium", // Valeur par défaut
          category: ALLOWED_CATEGORIES.includes(notification.category as any)
            ? notification.category as typeof ALLOWED_CATEGORIES[number]
            : "system" // Valeur par défaut
        }))
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 } as const;
          type PriorityLevel = keyof typeof priorityOrder;
          const aPriority = a.priority as PriorityLevel;
          const bPriority = b.priority as PriorityLevel;
          
          if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
            return priorityOrder[bPriority] - priorityOrder[aPriority];
          }
          return b.timestamp.getTime() - a.timestamp.getTime();
        })

      setNotifications(allNotifications)
      setUnreadCount(allNotifications.filter((n) => !n.read).length)
    }

    generateEnhancedNotifications()

    // Mettre à jour les notifications toutes les 30 secondes
    const interval = setInterval(generateEnhancedNotifications, 30000)

    return () => clearInterval(interval)
  }, [registrations, payments, classes, installments, academicYearCurrent, db])

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

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    updateNotificationInDB(id, { read: true })
  }

  const removeNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    const notif = notifications.find((n) => n.id === id)
    if (notif && !notif.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    deleteNotificationFromDB(id)
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read)

    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    setUnreadCount(0)

    // Mettre à jour toutes les notifications non lues dans IndexedDB
    for (const notif of unreadNotifications) {
      updateNotificationInDB(notif.id, { read: true })
    }
  }

  const clearAllNotifications = async () => {
    if (!db) return

    try {
      const tx = db.transaction("notifications", "readwrite")
      await tx.objectStore("notifications").clear()
      await tx.done

      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes les notifications:", error)
    }
  }

  const getIcon = (category: string, type: string) => {
    switch (category) {
      case "payment":
        return DollarSign
      case "registration":
        return Users
      case "class":
        return GraduationCap
      case "deadline":
        return Calendar
      case "system":
        return type === "success" ? CheckCircle : Database
      default:
        return type === "success" ? CheckCircle : type === "warning" ? AlertTriangle : Info
    }
  }

  const getColorClasses = (type: string, priority: string) => {
    const baseClasses = {
      success: {
        bg: "bg-success/10 border-success/20",
        text: "text-success",
        icon: "text-success",
      },
      warning: {
        bg: "bg-warning/10 border-warning/20",
        text: "text-warning",
        icon: "text-warning",
      },
      error: {
        bg: "bg-destructive/10 border-destructive/20",
        text: "text-destructive",
        icon: "text-destructive",
      },
      info: {
        bg: "bg-skyblue/10 border-skyblue/20",
        text: "text-skyblue",
        icon: "text-skyblue",
      },
    }

    return baseClasses[type as keyof typeof baseClasses] || baseClasses.info
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge color="destructive" className="text-xs">
            Urgent
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="text-xs border-warning text-warning">
            Important
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            Info
          </Badge>
        )
      default:
        return null
    }
  }

  const handleItemClick = (item: any, category: string) => {
    switch (category) {
      case "payment":
        router.push(`/caisse_comptabilite/encaissement/historique_paiement/${item.id}`)
        break
      case "registration":
        router.push(`/eleves/historique/${item.studentId}`)
        break
      case "class":
        router.push(`/students/${item.id}`)
        break
      case "deadline":
        router.push(`/payments/installments/${item.id}`)
        break
      default:
        break
    }
    setIsModalOpen(false)
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              <span className="text-sm font-normal text-muted-foreground">(Temps réel)</span>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge color="destructive" className="animate-pulse">
                  {unreadCount}
                </Badge>
              )}
              {notifications.length > 0 && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-6 text-xs"
                    title="Marquer tout comme lu"
                  >
                    <MarkAsRead className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="h-6 text-xs text-destructive hover:text-destructive"
                    title="Supprimer toutes les notifications"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              <AnimatePresence>
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.category, notification.type)
                  const colors = getColorClasses(notification.type, notification.priority)

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={cn(
                        "relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                        colors.bg,
                        !notification.read && "ring-2 ring-primary/20",
                        notification.priority === "high" && "border-l-4 border-l-destructive",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("h-5 w-5 mt-0.5", colors.icon)} />

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/20"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground">{notification.message}</p>

                          {notification.details && (
                            <p className="text-xs text-muted-foreground italic">{notification.details.summary}</p>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(notification.timestamp)}
                            </span>

                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Marquer lu
                                </Button>
                              )}

                              {notification.action && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs bg-transparent"
                                  onClick={notification.action.onClick}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {!notification.read && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                  <p className="text-xs">Les notifications apparaîtront automatiquement</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modale de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && (
                <>
                  {(() => {
                    const Icon = getIcon(selectedNotification.category, selectedNotification.type)
                    return <Icon className="h-5 w-5" />
                  })()}
                  {selectedNotification.title}
                  {getPriorityBadge(selectedNotification.priority)}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedNotification?.details && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedNotification.details.summary}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {selectedNotification.details.totalCount} élément
                  {selectedNotification.details.totalCount > 1 ? "s" : ""}
                </p>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {selectedNotification.details.items.map((item: any, index: number) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.photo && (
                          <Avatar className="h-10 w-10">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${item.photo}`}
                              alt={item.name || item.studentName}
                              className="rounded-full object-cover w-10 h-10"
                            />
                            <AvatarFallback>{(item.name || item.studentName)?.charAt(0)?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}

                        <div className="space-y-1">
                          <p className="font-medium text-sm">{item.name || item.studentName}</p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {item.className && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {item.className}
                              </span>
                            )}

                            {item.amount && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {item.amount.toLocaleString()} FCFA
                              </span>
                            )}

                            {item.age && <span>{item.age} ans</span>}

                            {item.sexe && (
                              <Badge variant="outline" className="text-xs">
                                {item.sexe}
                              </Badge>
                            )}

                            {item.daysRemaining !== undefined && (
                              <span
                                className={cn(
                                  "flex items-center gap-1",
                                  item.daysRemaining <= 2 ? "text-destructive" : "text-warning",
                                )}
                              >
                                <Clock className="h-3 w-3" />
                                {item.daysRemaining > 0 ? `${item.daysRemaining} jour(s)` : "Échu"}
                              </span>
                            )}

                            {item.daysOverdue !== undefined && (
                              <span className="flex items-center gap-1 text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                {item.daysOverdue} jour(s) de retard
                              </span>
                            )}
                          </div>

                          {(item.phone || item.address) && (
                            <div className="text-xs text-muted-foreground">
                              {item.phone && <span>📞 {item.phone}</span>}
                              {item.address && <span className="ml-2">📍 {item.address}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleItemClick(item, selectedNotification.category)}
                        className="gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Voir
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InteractiveNotifications
