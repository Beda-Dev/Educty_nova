"use client"

import { motion, Variants } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, DollarSign, Activity, ArrowUpRight, ArrowDownRight, UserCheck, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

// Types pour les couleurs de thème
type ThemeColor = "skyblue" | "success" | "primary" | "indigodye" | "warning"

// Type pour les formats de valeur
type ValueFormat = "currency" | "number"

// Type pour les tendances statistiques
interface StatTrend {
  value: number
  isPositive: boolean
}

// Type pour chaque statistique
interface StatItem {
  title: string
  value: number
  icon: LucideIcon
  color: ThemeColor
  trend: StatTrend
  details: string
  format?: ValueFormat
}

// Props du composant principal
interface AdvancedStatsCardsProps {
  totalStudents: number
  totalClasses: number
  totalRevenue: number
  totalUsers: number
  totalProfessors: number
  permanentProfessors: number
  vacataireProfessors: number
  femaleStudents: number
  maleStudents: number
  classOccupancyRate: number
  showComparison?: boolean
  currency?: string
}

// Variants pour les animations Framer Motion
const containerVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

// Fonction utilitaire pour formater les valeurs
const formatValue = (value: number, format: ValueFormat = "number", currency: string = "FCFA"): string => {
  if (format === "currency") {
    return `${value.toLocaleString()} ${currency}`
  }
  return value.toLocaleString()
}

// Fonction utilitaire pour obtenir les classes CSS selon la couleur
const getColorClasses = (color: ThemeColor): {
  borderClass: string
  gradientClass: string
  iconBgClass: string
  iconTextClass: string
  decorativeClass: string
} => {
  const colorMap = {
    skyblue: {
      borderClass: "border-l-skyblue",
      gradientClass: "bg-gradient-to-br from-skyblue/5 to-skyblue/10",
      iconBgClass: "bg-skyblue/20",
      iconTextClass: "text-skyblue",
      decorativeClass: "bg-skyblue",
    },
    success: {
      borderClass: "border-l-success",
      gradientClass: "bg-gradient-to-br from-success/5 to-success/10",
      iconBgClass: "bg-success/20",
      iconTextClass: "text-success",
      decorativeClass: "bg-success",
    },
    primary: {
      borderClass: "border-l-primary",
      gradientClass: "bg-gradient-to-br from-primary/5 to-primary/10",
      iconBgClass: "bg-primary/20",
      iconTextClass: "text-primary",
      decorativeClass: "bg-primary",
    },
    indigodye: {
      borderClass: "border-l-indigodye",
      gradientClass: "bg-gradient-to-br from-indigodye/5 to-indigodye/10",
      iconBgClass: "bg-indigodye/20",
      iconTextClass: "text-indigodye",
      decorativeClass: "bg-indigodye",
    },
    warning: {
      borderClass: "border-l-warning",
      gradientClass: "bg-gradient-to-br from-warning/5 to-warning/10",
      iconBgClass: "bg-warning/20",
      iconTextClass: "text-warning",
      decorativeClass: "bg-warning",
    },
  }
  
  return colorMap[color]
}

const AdvancedStatsCards: React.FC<AdvancedStatsCardsProps> = ({
  totalStudents,
  totalClasses,
  totalRevenue,
  totalUsers,
  totalProfessors,
  permanentProfessors,
  vacataireProfessors,
  femaleStudents,
  maleStudents,
  classOccupancyRate,
  showComparison = false,
  currency = "FCFA",
}) => {
  const stats: StatItem[] = [
    {
      title: "Total Élèves",
      value: totalStudents,
      icon: Users,
      color: "skyblue",
      trend: { value: 12, isPositive: true },
      details: `${femaleStudents} filles, ${maleStudents} garçons`,
    },
    {
      title: "Classes Actives",
      value: totalClasses,
      icon: GraduationCap,
      color: "success",
      trend: { value: 5, isPositive: true },
      details: `${classOccupancyRate}% d'occupation`,
    },
    {
      title: "Revenus Totaux",
      value: totalRevenue,
      icon: DollarSign,
      color: "primary",
      trend: { value: 8, isPositive: true },
      details: `Monnaie : ${currency}`,
      format: "currency" as const,
    },
    {
      title: "Personnel Actif",
      value: totalUsers,
      icon: Activity,
      color: "indigodye",
      trend: { value: 2, isPositive: false },
      details: "Utilisateurs avec accès",
    },
    {
      title: "Professeurs",
      value: totalProfessors,
      icon: UserCheck,
      color: "warning",
      trend: { value: 3, isPositive: true },
      details: `${permanentProfessors} permanents, ${vacataireProfessors} vacataires`,
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
    >
      {stats.map((stat: StatItem, index: number) => {
        const colorClasses = getColorClasses(stat.color)
        
        return (
          <motion.div key={`stat-${index}`} variants={cardVariants}>
            <Card
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105",
                "border-l-4",
                colorClasses.borderClass,
                colorClasses.gradientClass
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    colorClasses.iconBgClass,
                    colorClasses.iconTextClass
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-l font-bold">
                    {formatValue(stat.value, stat.format, currency)}
                  </div>

                  {showComparison && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-xs",
                        stat.trend.isPositive
                          ? "border-success/50 text-success bg-success/10"
                          : "border-destructive/50 text-destructive bg-destructive/10"
                      )}
                    >
                      {stat.trend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.trend.value}%
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">{stat.details}</p>
              </CardContent>

              {/* Effet de fond décoratif */}
              <div
                className={cn(
                  "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-5",
                  colorClasses.decorativeClass
                )}
              />
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default AdvancedStatsCards