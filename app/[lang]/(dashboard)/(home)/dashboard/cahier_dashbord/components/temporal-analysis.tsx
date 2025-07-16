"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, TrendingUp, BarChart3, Activity } from "lucide-react"
import type { TemporalTrends  } from "../types/cashier-dashboard"
import {Expense , Payment} from "@/lib/interface"


interface TemporalAnalysisProps {
  data: {
    temporalTrends: TemporalTrends
    cashierPayments: Payment[]
    cashierExpenses: Expense[]
    currency: string
  }
}

/**
 * Composant d'analyse temporelle basé uniquement sur les données réelles
 * Analyse les patterns temporels des transactions sans données fictives
 */
const TemporalAnalysis = ({ data }: TemporalAnalysisProps) => {
  const { temporalTrends, cashierPayments, cashierExpenses, currency } = data

  /**
   * MÉTHODE DE CALCUL : Analyse des heures de pointe
   * Identifie les créneaux horaires les plus actifs basés sur les données réelles
   */
  const calculatePeakHours = () => {
    const hourlyData = temporalTrends.hourlyDistribution
    const maxTransactions = Math.max(...hourlyData.map((h) => h.count))

    return hourlyData.map((hour) => ({
      ...hour,
      intensity: maxTransactions > 0 ? (hour.count / maxTransactions) * 100 : 0,
      category:
        hour.count >= maxTransactions * 0.8
          ? "peak"
          : hour.count >= maxTransactions * 0.5
            ? "busy"
            : hour.count >= maxTransactions * 0.2
              ? "moderate"
              : "quiet",
    }))
  }

  /**
   * MÉTHODE DE CALCUL : Analyse de la régularité
   * Mesure la consistance des performances dans le temps
   */
  const calculateConsistencyScore = (): number => {
    const monthlyAmounts = temporalTrends.monthlyPayments.map((m) => m.amount)
    if (monthlyAmounts.length < 2) return 100

    const mean = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length
    const variance = monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / monthlyAmounts.length
    const standardDeviation = Math.sqrt(variance)

    // Coefficient de variation (plus c'est bas, plus c'est régulier)
    const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0

    // Score de consistance (0-100, 100 = parfaitement régulier)
    return Math.max(0, 100 - coefficientOfVariation)
  }

  /**
   * MÉTHODE DE CALCUL : Efficacité temporelle par période
   * Analyse l'efficacité selon les différentes périodes de la journée
   */
  const calculateTemporalEfficiency = () => {
    const periods = {
      morning: { start: 8, end: 12, transactions: 0, amount: 0 },
      afternoon: { start: 12, end: 17, transactions: 0, amount: 0 },
      evening: { start: 17, end: 20, transactions: 0, amount: 0 },
    }

    cashierPayments.forEach((payment) => {
      const hour = new Date(payment.created_at).getHours()
      const amount = Number.parseFloat(payment.amount || "0")

      if (hour >= periods.morning.start && hour < periods.morning.end) {
        periods.morning.transactions++
        periods.morning.amount += amount
      } else if (hour >= periods.afternoon.start && hour < periods.afternoon.end) {
        periods.afternoon.transactions++
        periods.afternoon.amount += amount
      } else if (hour >= periods.evening.start && hour < periods.evening.end) {
        periods.evening.transactions++
        periods.evening.amount += amount
      }
    })

    return Object.entries(periods).map(([period, data]) => ({
      period,
      ...data,
      avgAmount: data.transactions > 0 ? data.amount / data.transactions : 0,
      efficiency: data.transactions > 0 ? data.amount / data.transactions / ((data.end - data.start) * 60) : 0,
    }))
  }

  const peakHours = calculatePeakHours()
  const consistencyScore = calculateConsistencyScore()
  const temporalEfficiency = calculateTemporalEfficiency()

  // Trouver les heures les plus actives
  const topPeakHours = peakHours
    .filter((h) => h.category === "peak")
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Métriques temporelles principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Régularité</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{consistencyScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Score de consistance</p>
            <Progress value={consistencyScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures de Pointe</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{topPeakHours.length}</div>
            <p className="text-xs text-muted-foreground">Créneaux très actifs</p>
            <div className="mt-2 text-xs">{topPeakHours.map((h) => h.hour).join(", ")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleur Jour</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                temporalTrends.weeklyDistribution.reduce(
                  (best, day) => (day.amount > best.amount ? day : best),
                  temporalTrends.weeklyDistribution[0] || { day: "N/A", amount: 0 },
                ).day
              }
            </div>
            <p className="text-xs text-muted-foreground">Plus forte activité</p>
            <div className="mt-2 text-xs">
              {temporalTrends.weeklyDistribution
                .reduce(
                  (best, day) => (day.amount > best.amount ? day : best),
                  temporalTrends.weeklyDistribution[0] || { amount: 0 },
                )
                .amount.toLocaleString()}{" "}
              {currency}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Période Optimale</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {
                temporalEfficiency.reduce(
                  (best, period) => (period.efficiency > best.efficiency ? period : best),
                  temporalEfficiency[0] || { period: "N/A" },
                ).period
              }
            </div>
            <p className="text-xs text-muted-foreground">Plus efficace</p>
            <div className="mt-2 text-xs">
              {temporalEfficiency
                .reduce(
                  (best, period) => (period.efficiency > best.efficiency ? period : best),
                  temporalEfficiency[0] || { avgAmount: 0 },
                )
                .avgAmount.toLocaleString()}{" "}
              {currency}/trans
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse des patterns hebdomadaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Patterns Hebdomadaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2 grid-cols-7">
              {temporalTrends.weeklyDistribution.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium mb-2">{day.day}</div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded transition-all duration-500 hover:from-blue-600 hover:to-blue-400 mx-auto"
                    style={{
                      height: `${Math.max(20, day.percentage * 2)}px`,
                    }}
                    title={`${day.count} transactions - ${day.amount.toLocaleString()} ${currency}`}
                  />
                  <div className="text-xs mt-2 text-muted-foreground">{day.count}</div>
                  <Badge color="secondary" className="text-xs mt-1">
                    {day.percentage.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {temporalTrends.weeklyDistribution.slice(0, 3).map((day, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{day.day}</span>
                    <Badge color={day.percentage > 20 ? "default" : "secondary"}>{day.percentage.toFixed(1)}%</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{day.count} transactions</div>
                  <div className="text-sm font-medium">
                    {day.amount.toLocaleString()} {currency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyse horaire détaillée */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Distribution Horaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid gap-1 grid-cols-12">
                {peakHours
                  .filter((h) => Number.parseInt(h.hour) >= 8 && Number.parseInt(h.hour) <= 19)
                  .map((hour, index) => (
                    <div key={index} className="text-center">
                      <div
                        className={`w-full rounded transition-all duration-500 mx-auto ${
                          hour.category === "peak"
                            ? "bg-gradient-to-t from-red-500 to-red-300"
                            : hour.category === "busy"
                              ? "bg-gradient-to-t from-orange-500 to-orange-300"
                              : hour.category === "moderate"
                                ? "bg-gradient-to-t from-yellow-500 to-yellow-300"
                                : "bg-gradient-to-t from-gray-400 to-gray-200"
                        }`}
                        style={{
                          height: `${Math.max(10, hour.intensity)}px`,
                        }}
                        title={`${hour.hour}: ${hour.count} transactions - ${hour.amount.toLocaleString()} ${currency}`}
                      />
                      <div className="text-xs mt-1 transform -rotate-45 origin-center">
                        {hour.hour.replace("h", "")}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Pointe</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span>Actif</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span>Modéré</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded" />
                  <span>Calme</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Efficacité par Période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {temporalEfficiency.map((period, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {period.period === "morning"
                        ? "Matin (8h-12h)"
                        : period.period === "afternoon"
                          ? "Après-midi (12h-17h)"
                          : "Soir (17h-20h)"}
                    </span>
                    <Badge color="secondary">{period.transactions} trans</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Montant total:</span>
                      <div className="font-medium">
                        {period.amount.toLocaleString()} {currency}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Moyenne/trans:</span>
                      <div className="font-medium">
                        {period.avgAmount.toLocaleString()} {currency}
                      </div>
                    </div>
                  </div>

                  <Progress
                    value={Math.min(
                      100,
                      (period.efficiency / Math.max(...temporalEfficiency.map((p) => p.efficiency))) * 100,
                    )}
                    className="h-2"
                  />

                  <div className="text-xs text-muted-foreground">
                    Efficacité: {period.efficiency.toFixed(2)} {currency}/min
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution mensuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution Mensuelle (12 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 flex items-end justify-between gap-1">
              {temporalTrends.monthlyPayments.map((month, index) => (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all duration-500 group-hover:from-green-600 group-hover:to-green-400"
                    style={{
                      height: `${Math.max(10, (month.amount / Math.max(...temporalTrends.monthlyPayments.map((m) => m.amount))) * 200)}px`,
                    }}
                    title={`${month.month} ${month.year}: ${month.count} transactions - ${month.amount.toLocaleString()} ${currency}`}
                  />
                  <span className="text-xs mt-2 text-muted-foreground">{month.month}</span>
                  <span className="text-xs font-medium">{month.count}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {temporalTrends.monthlyPayments.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total 12 mois ({currency})</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {temporalTrends.monthlyPayments.reduce((sum, m) => sum + m.count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(
                    temporalTrends.monthlyPayments.reduce((sum, m) => sum + m.avgAmount, 0) /
                    Math.max(1, temporalTrends.monthlyPayments.length)
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Moyenne/trans ({currency})</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TemporalAnalysis
