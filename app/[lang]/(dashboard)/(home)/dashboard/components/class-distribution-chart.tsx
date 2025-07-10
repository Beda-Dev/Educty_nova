"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Users, AlertTriangle, BarChart3, PieChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Registration, Classe } from "@/lib/interface"

interface ClassDistributionChartProps {
  registrations: Registration[]
  classes: Classe[]
}

const ClassDistributionChart = ({ registrations, classes }: ClassDistributionChartProps) => {
  // Tableau de couleurs pour le camembert
  const CHART_COLORS = [
    "#3b82f6", // Bleu
    "#ef4444", // Rouge
    "#10b981", // Vert
    "#f59e0b", // Orange
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange foncé
    "#ec4899", // Rose
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#eab308", // Jaune
    "#dc2626", // Rouge foncé
    "#059669", // Vert émeraude
    "#7c3aed", // Violet foncé
    "#0891b2", // Cyan foncé
  ]
  const [viewType, setViewType] = useState<"bar" | "pie" | "detailed">("detailed")
  const [sortBy, setSortBy] = useState<"name" | "occupancy" | "students">("occupancy")

  // Préparer les données avec plus de détails
  const classData =
    classes?.map((classe, index) => {
      const studentsInClass = registrations.filter((reg) => reg.class_id === classe.id)
      const maxStudents = Number.parseInt(classe.max_student_number || "0")
      const occupancyRate = maxStudents > 0 ? Math.round((studentsInClass.length / maxStudents) * 100) : 0

      // Compter par sexe
      const femaleCount = studentsInClass.filter((reg) =>
        ["f", "féminin", "feminin", "female"].includes(reg.student?.sexe?.toLowerCase()),
      ).length
      const maleCount = studentsInClass.length - femaleCount

      // Déterminer le statut de la classe
      let status: "empty" | "low" | "medium" | "high" | "full" | "overflow" = "empty"
      if (occupancyRate === 0) status = "empty"
      else if (occupancyRate < 50) status = "low"
      else if (occupancyRate < 75) status = "medium"
      else if (occupancyRate < 90) status = "high"
      else if (occupancyRate < 100) status = "full"
      else status = "overflow"

      // Créer le nom d'affichage avec série si disponible
      const displayName = classe.level?.label ? `${classe.label} (${classe.level.label})` : classe.label

      const shortDisplayName = classe.level?.label ? `${classe.label} - ${classe.level.label}` : classe.label

      return {
        id: classe.id,
        name: classe.label,
        level: classe.level?.label || null,
        displayName,
        shortDisplayName,
        students: studentsInClass.length,
        capacity: maxStudents,
        occupancyRate,
        femaleCount,
        maleCount,
        available: Math.max(0, maxStudents - studentsInClass.length),
        status,
        color: CHART_COLORS[index % CHART_COLORS.length], // Utiliser le tableau de couleurs
      }
    }) || []

  // Trier les données
  const sortedData = [...classData].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "occupancy":
        return b.occupancyRate - a.occupancyRate
      case "students":
        return b.students - a.students
      default:
        return 0
    }
  })

  // Statistiques globales
  const totalStudents = classData.reduce((sum, cls) => sum + cls.students, 0)
  const totalCapacity = classData.reduce((sum, cls) => sum + cls.capacity, 0)
  const globalOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0
  const fullClasses = classData.filter((cls) => cls.occupancyRate >= 100).length
  const nearFullClasses = classData.filter((cls) => cls.occupancyRate >= 85 && cls.occupancyRate < 100).length

  function getStatusColor(status: string) {
    switch (status) {
      case "empty":
        return "#94a3b8"
      case "low":
        return "#22d3ee"
      case "medium":
        return "#3b82f6"
      case "high":
        return "#f59e0b"
      case "full":
        return "#ef4444"
      case "overflow":
        return "#dc2626"
      default:
        return "#6b7280"
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "empty":
        return "Vide"
      case "low":
        return "Faible"
      case "medium":
        return "Modéré"
      case "high":
        return "Élevé"
      case "full":
        return "Pleine"
      case "overflow":
        return "Dépassée"
      default:
        return "Inconnu"
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 border rounded-lg shadow-xl border-border"
        >
          <p className="font-semibold text-foreground mb-2">{data.fullName || data.displayName}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Élèves:</span>
              <span className="font-medium">
                {data.students}/{data.capacity}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taux:</span>
              <Badge
                color={data.occupancyRate >= 90 ? "destructive" : data.occupancyRate >= 75 ? "skyblue" : "secondary"}
              >
                {data.occupancyRate}%
              </Badge>
            </div>
            {data.level && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Série:</span>
                <Badge variant="outline" className="text-xs">
                  {data.level}
                </Badge>
              </div>
            )}
            {data.femaleCount > 0 && (
              <div className="text-xs text-pink-600">
                👩 {data.femaleCount} fille{data.femaleCount > 1 ? "s" : ""}
              </div>
            )}
            {data.maleCount > 0 && (
              <div className="text-xs text-blue-600">
                👨 {data.maleCount} garçon{data.maleCount > 1 ? "s" : ""}
              </div>
            )}
            <div className="text-xs text-muted-foreground">Places disponibles: {data.available}</div>
          </div>
        </motion.div>
      )
    }
    return null
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="displayName"
          tick={{ fontSize: 10, fill: "#666" }}
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis tick={{ fontSize: 12, fill: "#666" }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} />
        <Bar dataKey="capacity" fill="#e5e7eb" radius={[4, 4, 0, 0]} animationDuration={1200} />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => {
    const pieData = classData.map((cls) => ({
      name: cls.shortDisplayName, // Utiliser le nom court pour la légende
      fullName: cls.displayName, // Nom complet pour le tooltip
      value: cls.students,
      color: cls.color,
      level: cls.level,
    }))

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            animationDuration={1000}
            label={({ name, value, percent }) => (value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null)}
            labelLine={false}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value, entry) => <span style={{ color: entry.color }}>{entry?.payload?.value || ""}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderDetailedView = () => (
    <div className="space-y-3">
      {sortedData.map((classe, index) => (
        <motion.div
          key={classe.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "p-3 lg:p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
            classe.status === "overflow" && "border-destructive/50 bg-destructive/5",
            classe.status === "full" && "border-warning/50 bg-warning/5",
            classe.status === "empty" && "border-muted bg-muted/20",
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
              <div
                className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  classe.status === "overflow" && "bg-destructive animate-pulse",
                  classe.status === "full" && "bg-warning animate-pulse",
                  classe.status === "high" && "bg-orange-500",
                  classe.status === "medium" && "bg-blue-500",
                  classe.status === "low" && "bg-cyan-500",
                  classe.status === "empty" && "bg-muted-foreground",
                )}
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm lg:text-base truncate">{classe.name}</h4>
                {classe.level && <p className="text-xs text-muted-foreground truncate">Niveau : {classe.level}</p>}
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {getStatusLabel(classe.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {classe.students}/{classe.capacity}
                </div>
                <div className="text-xs text-muted-foreground">élèves</div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-sm font-bold",
                    classe.occupancyRate >= 100 && "text-destructive",
                    classe.occupancyRate >= 85 && classe.occupancyRate < 100 && "text-warning",
                    classe.occupancyRate < 85 && "text-success",
                  )}
                >
                  {classe.occupancyRate}%
                </div>
                <div className="text-xs text-muted-foreground">occupation</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Progress
              value={classe.occupancyRate}
              className={cn(
                "h-2",
                classe.occupancyRate >= 100 && "[&>div]:bg-destructive",
                classe.occupancyRate >= 85 && classe.occupancyRate < 100 && "[&>div]:bg-warning",
                classe.occupancyRate < 85 && "[&>div]:bg-success",
              )}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2 lg:gap-4">
                {classe.femaleCount > 0 && <span className="text-pink-600">👩 {classe.femaleCount}</span>}
                {classe.maleCount > 0 && <span className="text-blue-600">👨 {classe.maleCount}</span>}
              </div>
              <span>
                {classe.available > 0 ? (
                  <span className="text-success">+{classe.available} places</span>
                ) : classe.available === 0 ? (
                  <span className="text-warning">Complète</span>
                ) : (
                  <span className="text-destructive">{Math.abs(classe.available)} en trop</span>
                )}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  if (!classData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Répartition par classe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <GraduationCap className="h-12 w-12 mx-auto opacity-50" />
              <p>Aucune classe disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-lg font-bold text-primary">{totalStudents}</div>
          <div className="text-xs text-muted-foreground">Total élèves</div>
        </div>
        <div className="text-center p-3 bg-skyblue/10 rounded-lg">
          <div className="text-lg font-bold text-skyblue">{globalOccupancy}%</div>
          <div className="text-xs text-muted-foreground">Occupation</div>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <div className="text-lg font-bold text-warning">{nearFullClasses}</div>
          <div className="text-xs text-muted-foreground">Presque pleines</div>
        </div>
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <div className="text-lg font-bold text-destructive">{fullClasses}</div>
          <div className="text-xs text-muted-foreground">Complètes</div>
        </div>
      </div>

      {/* Alertes */}
      <AnimatePresence>
        {fullClasses > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert className="border-destructive/50 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>{fullClasses}</strong> classe{fullClasses > 1 ? "s" : ""} {fullClasses > 1 ? "sont" : "est"}{" "}
                complète{fullClasses > 1 ? "s" : ""} ou dépassée{fullClasses > 1 ? "s" : ""}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contrôles responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            variant={viewType === "detailed" ? "soft" : "outline"}
            size="sm"
            onClick={() => setViewType("detailed")}
            className="gap-1 lg:gap-2 flex-shrink-0"
          >
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Détaillé</span>
          </Button>
          <Button
            variant={viewType === "bar" ? "soft" : "outline"}
            size="sm"
            onClick={() => setViewType("bar")}
            className="gap-1 lg:gap-2 flex-shrink-0"
          >
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Barres</span>
          </Button>
          <Button
            variant={viewType === "pie" ? "soft" : "outline"}
            size="sm"
            onClick={() => setViewType("pie")}
            className="gap-1 lg:gap-2 flex-shrink-0"
          >
            <PieChartIcon className="h-3 w-3" />
            <span className="hidden sm:inline">Camembert</span>
          </Button>
        </div>

        {viewType === "detailed" && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm bg-background min-w-0"
          >
            <option value="occupancy">Par occupation</option>
            <option value="students">Par élèves</option>
            <option value="name">Par nom</option>
          </select>
        )}
      </div>

      {/* Contenu principal */}
      <motion.div
        key={viewType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={viewType === "detailed" ? "max-h-96 overflow-y-auto" : "h-80"}
      >
        {viewType === "detailed" && renderDetailedView()}
        {viewType === "bar" && renderBarChart()}
        {viewType === "pie" && renderPieChart()}
      </motion.div>
    </div>
  )
}

export default ClassDistributionChart
