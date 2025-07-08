"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Calendar, Users, BarChart3, LineChartIcon, AreaChartIcon } from "lucide-react"
import type { Registration } from "@/lib/interface"

interface MonthlyRegistrationsChartProps {
  registrations: Registration[]
}

const MonthlyRegistrationsChart = ({ registrations }: MonthlyRegistrationsChartProps) => {
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("area")
  const [timeRange, setTimeRange] = useState<"6months" | "12months" | "all">("12months")

  // Grouper les inscriptions par mois avec plus de détails
  const monthlyData = registrations.reduce(
    (acc, reg) => {
      const date = new Date(reg.registration_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
      const shortMonth = date.toLocaleDateString("fr-FR", { month: "short" })

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          shortMonth: shortMonth,
          count: 0,
          femaleCount: 0,
          maleCount: 0,
          date: date,
          fullDate: monthKey,
        }
      }

      acc[monthKey].count++

      // Compter par sexe
      if (["f", "féminin", "feminin", "female"].includes(reg.student?.sexe?.toLowerCase())) {
        acc[monthKey].femaleCount++
      } else if (["m", "masculin", "male"].includes(reg.student?.sexe?.toLowerCase())) {
        acc[monthKey].maleCount++
      }

      return acc
    },
    {} as Record<
      string,
      {
        month: string
        shortMonth: string
        count: number
        femaleCount: number
        maleCount: number
        date: Date
        fullDate: string
      }
    >,
  )

  // Trier et filtrer les données selon la période sélectionnée
  let data = Object.values(monthlyData).sort((a, b) => a.date.getTime() - b.date.getTime())

  const now = new Date()
  if (timeRange === "6months") {
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    data = data.filter((item) => item.date >= sixMonthsAgo)
  } else if (timeRange === "12months") {
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1)
    data = data.filter((item) => item.date >= twelveMonthsAgo)
  }

  // Calculer les statistiques
  const totalRegistrations = data.reduce((sum, item) => sum + item.count, 0)
  const avgPerMonth = data.length > 0 ? Math.round(totalRegistrations / data.length) : 0
  const maxMonth = data.reduce((max, item) => (item.count > max.count ? item : max), data[0] || { count: 0, month: "" })

  // Calculer la tendance (comparaison des 3 derniers mois vs 3 mois précédents)
  const recentMonths = data.slice(-3)
  const previousMonths = data.slice(-6, -3)
  const recentAvg =
    recentMonths.length > 0 ? recentMonths.reduce((sum, item) => sum + item.count, 0) / recentMonths.length : 0
  const previousAvg =
    previousMonths.length > 0 ? previousMonths.reduce((sum, item) => sum + item.count, 0) / previousMonths.length : 0
  const trendPercentage = previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100) : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 border rounded-lg shadow-xl border-border"
        >
          <p className="font-semibold text-foreground mb-2">{data.month}</p>
          <div className="space-y-1">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Users className="h-3 w-3" />
              {data.count} inscription{data.count > 1 ? "s" : ""}
            </p>
            {data.femaleCount > 0 && (
              <p className="text-xs text-pink-600">
                👩 {data.femaleCount} fille{data.femaleCount > 1 ? "s" : ""}
              </p>
            )}
            {data.maleCount > 0 && (
              <p className="text-xs text-blue-600">
                👨 {data.maleCount} garçon{data.maleCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="shortMonth" tick={{ fontSize: 12, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
              animationDuration={1000}
            />
          </LineChart>
        )

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="shortMonth" tick={{ fontSize: 12, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} />
          </BarChart>
        )

      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="shortMonth" tick={{ fontSize: 12, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorGradient)"
              animationDuration={1000}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </AreaChart>
        )
    }
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Inscriptions par mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 mx-auto opacity-50" />
              <p>Aucune inscription pour cette période</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="12months">12 mois</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={chartType === "area" ? null : "ghost"}
              size="sm"
              onClick={() => setChartType("area")}
              className="h-7 px-2"
            >
              <AreaChartIcon className="h-3 w-3" />
            </Button>
            <Button
              variant={chartType === "line" ? null : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className="h-7 px-2"
            >
              <LineChartIcon className="h-3 w-3" />
            </Button>
            <Button
              variant={chartType === "bar" ? null : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="h-7 px-2"
            >
              <BarChart3 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{totalRegistrations}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-skyblue">{avgPerMonth}</div>
            <div className="text-xs text-muted-foreground">Moy/mois</div>
          </div>
          <div className="text-center">
            <Badge color={trendPercentage >= 0 ? "default" : "destructive"} className="gap-1">
              {trendPercentage >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trendPercentage)}%
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Tendance</div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </motion.div>

      {/* Informations supplémentaires */}
      {maxMonth.count > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <span>
            Meilleur mois: <strong className="text-foreground">{maxMonth.month}</strong>
          </span>
          <span>
            <strong className="text-primary">{maxMonth.count}</strong> inscriptions
          </span>
        </div>
      )}
    </div>
  )
}

export default MonthlyRegistrationsChart
