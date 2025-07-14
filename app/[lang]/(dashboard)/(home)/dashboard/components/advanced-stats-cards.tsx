"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, DollarSign, Activity, ArrowUpRight, ArrowDownRight, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"

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

const AdvancedStatsCards = ({
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
}: AdvancedStatsCardsProps) => {
  const stats = [
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
      format: "currency",
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
      details: `${permanentProfessors} permanents,${vacataireProfessors} vacataires`,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={cardVariants}>
          <Card
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105",
              "border-l-4",
              stat.color === "skyblue" && "border-l-skyblue bg-gradient-to-br from-skyblue/5 to-skyblue/10",
              stat.color === "success" && "border-l-success bg-gradient-to-br from-success/5 to-success/10",
              stat.color === "primary" && "border-l-primary bg-gradient-to-br from-primary/5 to-primary/10",
              stat.color === "indigodye" && "border-l-indigodye bg-gradient-to-br from-indigodye/5 to-indigodye/10",
              stat.color === "warning" && "border-l-warning bg-gradient-to-br from-warning/5 to-warning/10",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div
                className={cn(
                  "rounded-full p-2 transition-colors",
                  stat.color === "skyblue" && "bg-skyblue/20 text-skyblue",
                  stat.color === "success" && "bg-success/20 text-success",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "indigodye" && "bg-indigodye/20 text-indigodye",
                  stat.color === "warning" && "bg-warning/20 text-warning",
                )}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-l font-bold">
                  {stat.format === "currency"
                    ? `${stat.value.toLocaleString()} ${currency}`
                    : stat.value.toLocaleString()}
                </div>

                {showComparison && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 text-xs",
                      stat.trend.isPositive
                        ? "border-success/50 text-success bg-success/10"
                        : "border-destructive/50 text-destructive bg-destructive/10",
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
                stat.color === "skyblue" && "bg-skyblue",
                stat.color === "success" && "bg-success",
                stat.color === "primary" && "bg-primary",
                stat.color === "indigodye" && "bg-indigodye",
                stat.color === "warning" && "bg-warning",
              )}
            />
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default AdvancedStatsCards
