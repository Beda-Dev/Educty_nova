"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Target, BarChart3, PieChart, Activity } from "lucide-react"

interface StatisticsDashboardProps {
  data: {
    totalPayments: number
    totalExpenses: number
    netBalance: number
    transactionCount: number
    averageTransaction: number
    growthRate: number
    efficiency: number
    customerSatisfaction: number
    peakHours: string[]
    topPerformingDay: string
    currency: string
  }
}

/**
 * Composant pour afficher des statistiques avancées et des KPIs
 * Fournit une vue d'ensemble complète des performances de caisse
 */
const StatisticsDashboard = ({ data }: StatisticsDashboardProps) => {
  const {
    totalPayments,
    totalExpenses,
    netBalance,
    transactionCount,
    averageTransaction,
    growthRate,
    efficiency,
    customerSatisfaction,
    peakHours,
    topPerformingDay,
    currency,
  } = data

  // Calcul des métriques dérivées
  const profitMargin = totalPayments > 0 ? (netBalance / totalPayments) * 100 : 0
  const expenseRatio = totalPayments > 0 ? (totalExpenses / totalPayments) * 100 : 0
  const dailyAverage = transactionCount / 30 // Approximation mensuelle

  return (
    <div className="space-y-6">
      {/* KPIs Principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Bénéficiaire</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{profitMargin > 0 ? "↗️ Positif" : "↘️ Négatif"}</p>
            <Progress value={Math.abs(profitMargin)} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratio Dépenses</CardTitle>
            <PieChart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expenseRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Des encaissements</p>
            <Progress value={expenseRatio} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficacité</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{efficiency}%</div>
            <p className="text-xs text-muted-foreground">Score de performance</p>
            <Progress value={efficiency} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{customerSatisfaction}%</div>
            <p className="text-xs text-muted-foreground">Taux de satisfaction</p>
            <Progress value={customerSatisfaction} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Métriques Détaillées */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analyse des Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Transactions:</span>
                <Badge color="secondary">{transactionCount.toLocaleString()}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Moyenne/Transaction:</span>
                <span className="text-sm font-bold">
                  {averageTransaction.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transactions/Jour:</span>
                <span className="text-sm">{dailyAverage.toFixed(1)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Croissance:</span>
                <div className="flex items-center gap-1">
                  {growthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${growthRate >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(growthRate).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Analyse Temporelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium">Heures de Pointe:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {peakHours.map((hour, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {hour}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Meilleur Jour:</span>
                <Badge className="bg-green-100 text-green-700">{topPerformingDay}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Période Active:</span>
                <span className="text-sm">8h - 18h</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Temps Moyen/Trans:</span>
                <span className="text-sm">2.5 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Résumé Financier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Encaissements:</span>
                <span className="text-sm font-bold text-green-600">
                  +{totalPayments.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Décaissements:</span>
                <span className="text-sm font-bold text-red-600">
                  -{totalExpenses.toLocaleString()} {currency}
                </span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Solde Net:</span>
                  <span className={`text-sm font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {netBalance >= 0 ? "+" : ""}
                    {netBalance.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Performance:</span>
                <Badge className={netBalance >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {netBalance >= 0 ? "Excellente" : "À améliorer"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommandations et Alertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">Points Forts</h4>
              <ul className="space-y-2 text-sm">
                {efficiency > 80 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Excellente efficacité opérationnelle
                  </li>
                )}
                {customerSatisfaction > 90 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Très haute satisfaction client
                  </li>
                )}
                {growthRate > 0 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Croissance positive des transactions
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-orange-700">Points d'Amélioration</h4>
              <ul className="space-y-2 text-sm">
                {expenseRatio > 50 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Ratio de dépenses élevé
                  </li>
                )}
                {efficiency < 70 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Efficacité à améliorer
                  </li>
                )}
                {dailyAverage < 10 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Volume de transactions faible
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatisticsDashboard
