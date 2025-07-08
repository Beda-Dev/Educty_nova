"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Payment, AcademicYear, Expense } from "@/lib/interface"

interface FinancialOverviewChartProps {
  payments: Payment[]
  expenses: Expense[]
  academicYear: AcademicYear
  currency?: string
}

const FinancialOverviewChart = ({
  payments,
  expenses,
  academicYear,
  currency = "FCFA",
}: FinancialOverviewChartProps) => {
  const [chartType, setChartType] = useState<"area" | "line" | "bar" | "composed">("composed")
  const [timeRange, setTimeRange] = useState<"3months" | "6months" | "12months" | "all">("6months")
  const [viewMode, setViewMode] = useState<"monthly" | "weekly" | "daily">("monthly")

  // Fonction pour formater les montants avec la devise
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${currency}`
  }

  // Grouper les données par période
  const getTimeKey = (date: Date) => {
    switch (viewMode) {
      case "daily":
        return date.toISOString().split("T")[0] // YYYY-MM-DD
      case "weekly":
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split("T")[0]
      case "monthly":
      default:
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    }
  }

  const getTimeLabel = (date: Date) => {
    switch (viewMode) {
      case "daily":
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
      case "weekly":
        return `S${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString("fr-FR", { month: "short" })}`
      case "monthly":
      default:
        return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
    }
  }

  // Traitement des données financières
  const financialData = (() => {
    const dataMap = new Map()

    // Traiter les paiements
    payments.forEach((payment) => {
      const date = new Date(payment.created_at)
      const timeKey = getTimeKey(date)
      const timeLabel = getTimeLabel(date)

      if (!dataMap.has(timeKey)) {
        dataMap.set(timeKey, {
          period: timeLabel,
          date: date,
          income: 0,
          expenses: 0,
          net: 0,
          paymentCount: 0,
          expenseCount: 0,
          avgPayment: 0,
          avgExpense: 0,
        })
      }

      const entry = dataMap.get(timeKey)
      const amount = Number.parseFloat(payment.amount || "0")
      entry.income += amount
      entry.paymentCount++
    })

    // Traiter les dépenses
    expenses.forEach((expense) => {
      const date = new Date(expense.created_at)
      const timeKey = getTimeKey(date)
      const timeLabel = getTimeLabel(date)

      if (!dataMap.has(timeKey)) {
        dataMap.set(timeKey, {
          period: timeLabel,
          date: date,
          income: 0,
          expenses: 0,
          net: 0,
          paymentCount: 0,
          expenseCount: 0,
          avgPayment: 0,
          avgExpense: 0,
        })
      }

      const entry = dataMap.get(timeKey)
      const amount = Number.parseFloat(expense.amount || "0")
      entry.expenses += amount
      entry.expenseCount++
    })

    // Calculer les moyennes et le net
    const data = Array.from(dataMap.values()).map((entry) => ({
      ...entry,
      net: entry.income - entry.expenses,
      avgPayment: entry.paymentCount > 0 ? entry.income / entry.paymentCount : 0,
      avgExpense: entry.expenseCount > 0 ? entry.expenses / entry.expenseCount : 0,
    }))

    // Filtrer par période
    const now = new Date()
    let filteredData = data

    if (timeRange !== "all") {
      const monthsBack = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
      filteredData = data.filter((item) => item.date >= cutoffDate)
    }

    return filteredData.sort((a, b) => a.date.getTime() - b.date.getTime())
  })()

  // Calculs des statistiques
  const totalIncome = financialData.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = financialData.reduce((sum, item) => sum + item.expenses, 0)
  const netProfit = totalIncome - totalExpenses
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0

  // Calcul de la tendance
  const recentPeriods = financialData.slice(-3)
  const previousPeriods = financialData.slice(-6, -3)
  const recentAvgNet =
    recentPeriods.length > 0 ? recentPeriods.reduce((sum, item) => sum + item.net, 0) / recentPeriods.length : 0
  const previousAvgNet =
    previousPeriods.length > 0 ? previousPeriods.reduce((sum, item) => sum + item.net, 0) / previousPeriods.length : 0
  const trendPercentage =
    previousAvgNet !== 0 ? Math.round(((recentAvgNet - previousAvgNet) / Math.abs(previousAvgNet)) * 100) : 0

  // Identifier les périodes à risque
  const riskPeriods = financialData.filter((item) => item.net < 0)
  const bestPeriod = financialData.reduce(
    (max, item) => (item.net > max.net ? item : max),
    financialData[0] || { net: 0, period: "" },
  )
  const worstPeriod = financialData.reduce(
    (min, item) => (item.net < min.net ? item : min),
    financialData[0] || { net: 0, period: "" },
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 border rounded-lg shadow-xl border-border min-w-[200px]"
        >
          <p className="font-semibold text-foreground mb-3">{data.period}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Revenus:
              </span>
              <span className="font-medium text-green-600">{formatCurrency(data.income)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />
                Dépenses:
              </span>
              <span className="font-medium text-red-600">{formatCurrency(data.expenses)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net:</span>
                <span className={cn("font-bold", data.net >= 0 ? "text-green-600" : "text-red-600")}>
                  {formatCurrency(data.net)}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {data.paymentCount > 0 && <div>📈 {data.paymentCount} paiement(s)</div>}
              {data.expenseCount > 0 && <div>📉 {data.expenseCount} dépense(s)</div>}
            </div>
          </div>
        </motion.div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: financialData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#666" }} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        )

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#666" }} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        )

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#666" }} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} fillOpacity={0.8} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} fillOpacity={0.8} />
            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
          </ComposedChart>
        )

      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#666" }} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          </AreaChart>
        )
    }
  }

  if (!financialData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Aperçu financier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <DollarSign className="h-12 w-12 mx-auto opacity-50" />
              <p>Aucune donnée financière disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques financières principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <div className="text-xs text-green-700">Revenus totaux</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <div className="text-xs text-red-700">Dépenses totales</div>
        </div>
        <div
          className={cn(
            "text-center p-4 rounded-lg border",
            netProfit >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200",
          )}
        >
          <div className={cn("text-lg font-bold", netProfit >= 0 ? "text-blue-600" : "text-orange-600")}>
            {formatCurrency(netProfit)}
          </div>
          <div className={cn("text-xs", netProfit >= 0 ? "text-blue-700" : "text-orange-700")}>Bénéfice net</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div
            className={cn(
              "text-lg font-bold flex items-center justify-center gap-1",
              profitMargin >= 0 ? "text-purple-600" : "text-red-600",
            )}
          >
            {profitMargin >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {profitMargin}%
          </div>
          <div className="text-xs text-purple-700">Marge bénéficiaire</div>
        </div>
      </div>

      {/* Alertes et insights */}
      {riskPeriods.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-orange-800">Périodes à risque détectées</span>
          </div>
          <p className="text-sm text-orange-700">
            {riskPeriods.length} période(s) avec des pertes. Pire période: {worstPeriod.period} (
            {formatCurrency(worstPeriod.net)})
          </p>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 mois</SelectItem>
                  <SelectItem value="6months">6 mois</SelectItem>
                  <SelectItem value="12months">12 mois</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={chartType === "composed" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("composed")}
                  className="h-7 px-2"
                >
                  <PieChart className="h-3 w-3" />
                </Button>
                <Button
                  variant={chartType === "area" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("area")}
                  className="h-7 px-2"
                >
                  <AreaChart className="h-3 w-3" />
                </Button>
                <Button
                  variant={chartType === "line" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className="h-7 px-2"
                >
                  <LineChartIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant={chartType === "bar" ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className="h-7 px-2"
                >
                  <BarChart3 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Badge color={trendPercentage >= 0 ? "default" : "destructive"} className="gap-1">
              {trendPercentage >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              Tendance: {Math.abs(trendPercentage)}%
            </Badge>
          </div>

          {/* Graphique principal */}
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
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance par période</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Meilleure période:</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{bestPeriod.period}</div>
                    <div className="text-xs text-green-700">{formatCurrency(bestPeriod.net)}</div>
                  </div>
                </div>
                {worstPeriod.net < 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Pire période:</span>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{worstPeriod.period}</div>
                      <div className="text-xs text-red-700">{formatCurrency(worstPeriod.net)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Moyennes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenus moyens:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(financialData.length > 0 ? totalIncome / financialData.length : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dépenses moyennes:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(financialData.length > 0 ? totalExpenses / financialData.length : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bénéfice moyen:</span>
                  <span
                    className={cn(
                      "font-medium",
                      (financialData.length > 0 ? netProfit / financialData.length : 0) >= 0
                        ? "text-blue-600"
                        : "text-orange-600",
                    )}
                  >
                    {formatCurrency(financialData.length > 0 ? netProfit / financialData.length : 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Revenus mensuels</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Contrôle des coûts</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Prévisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mois prochain:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(Math.round((totalIncome / financialData.length) * 1.05))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trimestre:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(Math.round((totalIncome / financialData.length) * 3 * 1.08))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {netProfit < 0 && <div className="text-red-600">⚠️ Réduire les dépenses</div>}
                  {profitMargin < 20 && <div className="text-orange-600">📈 Optimiser les revenus</div>}
                  {riskPeriods.length === 0 && <div className="text-green-600">✅ Performance stable</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialOverviewChart
