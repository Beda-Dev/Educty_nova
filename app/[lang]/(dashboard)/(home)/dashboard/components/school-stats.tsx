"use client"

import { cn } from "@/lib/utils"
import { Users, GraduationCap, UserCheck, Building, User } from "lucide-react"
import type { User as UserType, Classe, Registration, Professor } from "@/lib/interface"

interface StatsProps {
  registrations: Registration[]
  classes: Classe[]
  users: UserType[]
  professors: Professor[]
}

const SchoolStats = ({ registrations, classes, users, professors }: StatsProps) => {
  const totalStudents = registrations.length
  const totalClasses = classes.length
  const totalActiveUsers = users.length // Déjà filtrés pour active === 1
  const totalProfessors = professors.length

  const femaleStudents = registrations.filter((reg) =>
    ["f", "féminin", "feminin", "female"].includes(reg.student?.sexe?.toLowerCase()),
  ).length

  const maleStudents = registrations.filter((reg) =>
    ["m", "masculin", "male"].includes(reg.student?.sexe?.toLowerCase()),
  ).length

  // Statistiques des professeurs
  const permanentProfessors = professors.filter((prof) => prof.type === "permanent").length
  const vacataireProfessors = professors.filter((prof) => prof.type === "vacataire").length

  const stats = [
    {
      title: "Total Élèves",
      value: totalStudents,
      icon: Users,
      color: "blue",
      description: `${femaleStudents} filles, ${maleStudents} garçons`,
    },
    {
      title: "Classes",
      value: totalClasses,
      icon: GraduationCap,
      color: "green",
      description: "Classes actives",
    },
    {
      title: "Personnel Actif",
      value: totalActiveUsers,
      icon: UserCheck,
      color: "purple",
      description: "Utilisateurs avec accès",
    },
    {
      title: "Professeurs",
      value: totalProfessors,
      icon: User,
      color: "orange",
      description: `${permanentProfessors} permanents, ${vacataireProfessors} vacataires`,
    },
    {
      title: "Taux de remplissage",
      value:
        classes.length > 0
          ? Math.round(
              (totalStudents / classes.reduce((sum, cls) => sum + Number.parseInt(cls.max_student_number || "0"), 0)) *
                100,
            )
          : 0,
      icon: Building,
      color: "orange",
      description: "Capacité utilisée",
      suffix: "%",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            "relative overflow-hidden rounded-lg border p-4 transition-all duration-300 hover:shadow-lg",
            "bg-gradient-to-br from-background to-muted/20",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">
                {stat.value}
                {stat.suffix}
              </p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
            <div
              className={cn(
                "rounded-full p-3",
                stat.color === "blue" && "bg-blue-100 text-blue-600",
                stat.color === "green" && "bg-green-100 text-green-600",
                stat.color === "purple" && "bg-purple-100 text-purple-600",
                stat.color === "orange" && "bg-orange-100 text-orange-600",
              )}
            >
              <stat.icon className="h-6 w-6" />
            </div>
          </div>

          {/* Effet de fond décoratif */}
          <div
            className={cn(
              "absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10",
              stat.color === "blue" && "bg-blue-500",
              stat.color === "green" && "bg-green-500",
              stat.color === "purple" && "bg-purple-500",
              stat.color === "orange" && "bg-orange-500",
            )}
          />
        </div>
      ))}
    </div>
  )
}

export default SchoolStats
