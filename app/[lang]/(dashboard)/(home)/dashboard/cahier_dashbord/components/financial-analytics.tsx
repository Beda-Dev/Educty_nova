"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, TrendingDown, Users, CreditCard, AlertTriangle, CheckCircle, Calendar, Clock } from "lucide-react"
import type {
  FinancialMetrics,
  TemporalTrends,
  PaymentMethodAnalysis,
  PerformanceData,
} from "../types/cashier-dashboard"

interface FinancialAnalyticsProps {
  data: {
    financialMetrics: FinancialMetrics
    temporalTrends: TemporalTrends
    paymentsByMethod: PaymentMethodAnalysis[]
    performanceData: PerformanceData
    currency: string
  }
}

/**
 * Composant d'analyse financière basé uniquement sur les données réelles
 * Calcule et affiche les métriques financières sans données fictives
 */
const FinancialAnalytics = ({ data }: FinancialAnalyticsProps) => {
  const { financialMetrics, temporalTrends, paymentsByMethod, performanceData, currency } = data

  /**
   * MÉTHODE DE CALCUL : Analyse de la croissance mensuelle
   * Compare le mois actuel avec le mois précédent pour calculer le taux de croissance
   */
  const calculateGrowthRate = (): number => {
    const monthlyData = temporalTrends.monthlyPayments
    if (monthlyData.length < 2) return 0

    const currentMonth = monthlyData[monthlyData.length - 1]
    const previousMonth = monthlyData[monthlyData.length - 2]

    if (previousMonth.amount === 0) return currentMonth.amount > 0 ? 100 : 0
    return ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100
  }

  /**
   * MÉTHODE DE CALCUL : Score de diversification des paiements
   * Mesure la répartition équilibrée entre les différentes méthodes de paiement
   * Utilise l'indice de Herfindahl-Hirschman
   */
  const calculateDiversificationScore = (): number => {
    if (paymentsByMethod.length === 0) return 0

    const totalAmount = paymentsByMethod.reduce((sum, method) => sum + method.amount, 0)
    if (totalAmount === 0) return 0

    // Calcul de l'indice de Herfindahl-Hirschman pour mesurer la concentration
    const hhi = paymentsByMethod.reduce((sum, method) => {
      const marketShare = method.amount / totalAmount
      return sum + marketShare * marketShare
    }, 0)

    // Conversion en score de diversification (0-100, 100 = parfaitement diversifié)
    const maxHHI = 1 // Monopole complet
    const minHHI = 1 / paymentsByMethod.length // Parfaitement équilibré

    return ((maxHHI - hhi) / (maxHHI - minHHI)) * 100
  }

  /**
   * MÉTHODE DE CALCUL : Analyse de la régularité des paiements
   * Mesure la consistance des montants dans le temps
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

  const growthRate = calculateGrowthRate()
  const diversificationScore = calculateDiversificationScore()
  const consistencyScore = calculateConsistencyScore()

  return (
    <div className="space-y-6">
      {/* Métriques financières principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance Mensuelle</CardTitle>
            {growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
              {growthRate >= 0 ? "+" : ""}
              {growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs mois précédent</p>
            <Progress value={Math.min(Math.abs(growthRate), 100)} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Recouvrement</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{financialMetrics.recoveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Échéances recouvrées</p>
            <Progress value={Math.min(financialMetrics.recoveryRate, 100)} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{diversificationScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Score de diversification</p>
            <Progress value={diversificationScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants Actifs</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{financialMetrics.totalStudentsWithPayments}</div>
            <p className="text-xs text-muted-foreground">Avec paiements</p>
            <div className="mt-2 text-xs">
              Moy: {financialMetrics.averagePaymentPerStudent.toLocaleString()} {currency}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse des échéances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Analyse des Échéances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700">En Retard</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {financialMetrics.installmentAnalysis.overdue.count}
              </div>
              <div className="text-sm text-muted-foreground">
                {financialMetrics.installmentAnalysis.overdue.amount.toLocaleString()} {currency}
              </div>
              <Progress
                value={
                  (financialMetrics.installmentAnalysis.overdue.count /
                    Math.max(
                      1,
                      financialMetrics.installmentAnalysis.overdue.count +
                        financialMetrics.installmentAnalysis.upcoming.count +
                        financialMetrics.installmentAnalysis.thisMonth.count,
                    )) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-700">Cette Semaine</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {financialMetrics.installmentAnalysis.upcoming.count}
              </div>
              <div className="text-sm text-muted-foreground">
                {financialMetrics.installmentAnalysis.upcoming.amount.toLocaleString()} {currency}
              </div>
              <Progress
                value={
                  (financialMetrics.installmentAnalysis.upcoming.count /
                    Math.max(
                      1,
                      financialMetrics.installmentAnalysis.overdue.count +
                        financialMetrics.installmentAnalysis.upcoming.count +
                        financialMetrics.installmentAnalysis.thisMonth.count,
                    )) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700">Ce Mois</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {financialMetrics.installmentAnalysis.thisMonth.count}
              </div>
              <div className="text-sm text-muted-foreground">
                {financialMetrics.installmentAnalysis.thisMonth.amount.toLocaleString()} {currency}
              </div>
              <Progress
                value={
                  (financialMetrics.installmentAnalysis.thisMonth.count /
                    Math.max(
                      1,
                      financialMetrics.installmentAnalysis.overdue.count +
                        financialMetrics.installmentAnalysis.upcoming.count +
                        financialMetrics.installmentAnalysis.thisMonth.count,
                    )) *
                  100
                }
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyses détaillées */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top étudiants payeurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Étudiants Payeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {financialMetrics.topPayingStudents.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge color="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">
                          {item.student.first_name} {item.student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Matricule: {item.student.registration_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {item.amount.toLocaleString()} {currency}
                      </p>
                      <Badge className={index < 3 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}>
                        {index < 3 ? "🏆 Top" : "✓ Actif"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Analyse des méthodes de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Méthodes de Paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentsByMethod.map((method, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
                        }}
                      />
                      <span className="text-sm font-medium">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {method.amount.toLocaleString()} {currency}
                      </p>
                      <p className="text-xs text-muted-foreground">{method.count} transactions</p>
                    </div>
                  </div>
                  <Progress value={method.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{method.percentage.toFixed(1)}% du total</span>
                    <span>
                      Moy: {(method.amount / (method.count || 1)).toLocaleString()} {currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métriques de performance */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Performance Mensuelle</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Paiements ce mois:</span>
                  <Badge color="secondary">{performanceData.monthly.payments}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Montant encaissé:</span>
                  <span className="font-medium">
                    {performanceData.monthly.paymentAmount.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dépenses ce mois:</span>
                  <Badge color="secondary">{performanceData.monthly.expenses}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Montant décaissé:</span>
                  <span className="font-medium">
                    {performanceData.monthly.expenseAmount.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Performance Hebdomadaire</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Paiements cette semaine:</span>
                  <Badge color="secondary">{performanceData.weekly.payments}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Montant encaissé:</span>
                  <span className="font-medium">
                    {performanceData.weekly.paymentAmount.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dépenses cette semaine:</span>
                  <Badge color="secondary">{performanceData.weekly.expenses}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Montant décaissé:</span>
                  <span className="font-medium">
                    {performanceData.weekly.expenseAmount.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{consistencyScore.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Score de Régularité</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {(
                    ((performanceData.monthly.paymentAmount - performanceData.monthly.expenseAmount) /
                      Math.max(1, performanceData.monthly.paymentAmount)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Marge Mensuelle</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {(
                    performanceData.monthly.paymentAmount / Math.max(1, performanceData.monthly.payments)
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Montant Moyen ({currency})</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialAnalytics
