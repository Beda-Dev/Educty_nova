"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Clock, Zap, Award, CheckCircle, AlertCircle } from "lucide-react"

interface PerformanceMetricsProps {
  data: {
    performanceKPIs: any
    comparativeAnalysis: any
    totalTransactions: number
    totalAmount: number
    currency: string
  }
}

/**
 * Composant de métriques de performance avancées
 * Calcule et affiche les KPIs de performance basés sur les vraies données
 */
const PerformanceMetrics = ({ data }: PerformanceMetricsProps) => {
  const { performanceKPIs, comparativeAnalysis, totalTransactions, totalAmount, currency } = data

  /**
   * MÉTHODE DE CALCUL : Score de performance global
   * Combine plusieurs métriques pour calculer un score global de 0 à 100
   */
  const calculateOverallPerformanceScore = () => {
    const weights = {
      efficiency: 0.3, // 30% - Efficacité financière
      productivity: 0.25, // 25% - Productivité (transactions/heure)
      accuracy: 0.2, // 20% - Précision (faible taux d'erreur)
      growth: 0.15, // 15% - Croissance
      recovery: 0.1, // 10% - Taux de recouvrement
    }

    const scores = {
      efficiency: Math.max(0, Math.min(100, Number.parseFloat(performanceKPIs.productivity.financialEfficiency))),
      productivity: Math.min(100, (Number.parseFloat(performanceKPIs.productivity.transactionsPerHour) / 10) * 100),
      accuracy: Math.max(0, 100 - performanceKPIs.productivity.errorRate),
      growth: Math.max(0, Math.min(100, comparativeAnalysis.gaps.paymentAmount + 50)),
      recovery: Math.max(0, Math.min(100, comparativeAnalysis.actuals.recoveryRate)),
    }

    const weightedScore = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + scores[key] * weight
    }, 0)

    return {
      overall: Math.round(weightedScore),
      breakdown: scores,
      weights,
    }
  }

  /**
   * MÉTHODE DE CALCUL : Analyse de la productivité par période
   * Compare les performances sur différentes périodes
   */
  const calculateProductivityTrends = () => {
    const { monthly, weekly } = performanceKPIs

    // Calcul des moyennes quotidiennes
    const dailyAverages = {
      monthly: {
        transactions: monthly.payments / 30,
        amount: monthly.paymentAmount / 30,
      },
      weekly: {
        transactions: weekly.payments / 7,
        amount: weekly.paymentAmount / 7,
      },
    }

    // Projection mensuelle basée sur les performances hebdomadaires
    const weeklyProjection = {
      transactions: weekly.payments * 4.33, // 4.33 semaines par mois en moyenne
      amount: weekly.paymentAmount * 4.33,
    }

    return {
      dailyAverages,
      weeklyProjection,
      isOnTrack: weeklyProjection.amount >= comparativeAnalysis.targets.paymentAmount * 0.8,
    }
  }

  /**
   * MÉTHODE DE CALCUL : Indice de qualité de service
   * Basé sur la rapidité, la précision et la satisfaction
   */
  const calculateServiceQualityIndex = () => {
    const factors = {
      speed: Math.max(0, 100 - (performanceKPIs.productivity.averageTransactionTime - 2) * 20), // Optimal: 2 min
      accuracy: 100 - performanceKPIs.productivity.errorRate,
      efficiency: Number.parseFloat(performanceKPIs.productivity.financialEfficiency),
    }

    const qualityIndex = (factors.speed + factors.accuracy + Math.max(0, factors.efficiency)) / 3

    return {
      index: Math.round(qualityIndex),
      factors,
      rating:
        qualityIndex >= 90
          ? "Excellent"
          : qualityIndex >= 75
            ? "Très Bien"
            : qualityIndex >= 60
              ? "Bien"
              : qualityIndex >= 45
                ? "Moyen"
                : "À Améliorer",
    }
  }

  const performanceScore = calculateOverallPerformanceScore()
  const productivityTrends = calculateProductivityTrends()
  const serviceQuality = calculateServiceQualityIndex()

  return (
    <div className="space-y-6">
      {/* Score de performance global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Score de Performance Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score principal */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      performanceScore.overall >= 80
                        ? "#10b981"
                        : performanceScore.overall >= 60
                          ? "#f59e0b"
                          : "#ef4444"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${performanceScore.overall}, 100`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{performanceScore.overall}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <Badge
                className={
                  performanceScore.overall >= 80
                    ? "bg-green-100 text-green-700"
                    : performanceScore.overall >= 60
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }
              >
                {performanceScore.overall >= 80
                  ? "🏆 Excellent"
                  : performanceScore.overall >= 60
                    ? "👍 Bien"
                    : "⚠️ À Améliorer"}
              </Badge>
            </div>

            {/* Détail des scores */}
            <div className="space-y-3">
              {Object.entries(performanceScore.breakdown).map(([key, score]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">
                      {key === "efficiency"
                        ? "Efficacité"
                        : key === "productivity"
                          ? "Productivité"
                          : key === "accuracy"
                            ? "Précision"
                            : key === "growth"
                              ? "Croissance"
                              : "Recouvrement"}
                    </span>
                    <span>{Math.round(score)}/100</span>
                  </div>
                  <Progress value={score} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Poids: {(performanceScore.weights[key] * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques de productivité */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions/Heure</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{performanceKPIs.productivity.transactionsPerHour}</div>
            <p className="text-xs text-muted-foreground">Productivité horaire</p>
            <div className="mt-2 text-xs">Objectif: 8-12/h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {performanceKPIs.productivity.averageTransactionTime} min
            </div>
            <p className="text-xs text-muted-foreground">Par transaction</p>
            <div className="mt-2 text-xs">Objectif: {"<"} 3 min</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Erreur</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{performanceKPIs.productivity.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Erreurs/corrections</p>
            <div className="mt-2 text-xs">Objectif: {"<"} 2%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualité Service</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{serviceQuality.index}/100</div>
            <p className="text-xs text-muted-foreground">{serviceQuality.rating}</p>
            <Progress value={serviceQuality.index} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Analyse comparative avec objectifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance vs Objectifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Objectifs Mensuels</h4>
              {Object.entries(comparativeAnalysis.targets).map(([key, target]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {key === "paymentAmount"
                        ? "Montant Encaissements"
                        : key === "transactionCount"
                          ? "Nombre Transactions"
                          : key === "recoveryRate"
                            ? "Taux Recouvrement"
                            : "Efficacité"}
                    </span>
                    <span>
                      {typeof target === "number" && key === "paymentAmount"
                        ? `${target.toLocaleString()} ${currency}`
                        : `${target}${key.includes("Rate") || key === "efficiency" ? "%" : ""}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Réalisé:</span>
                    <span className="font-medium">
                      {typeof comparativeAnalysis.actuals[key] === "number" && key === "paymentAmount"
                        ? `${comparativeAnalysis.actuals[key].toLocaleString()} ${currency}`
                        : `${typeof comparativeAnalysis.actuals[key] === "number" ? comparativeAnalysis.actuals[key].toFixed(1) : comparativeAnalysis.actuals[key]}${key.includes("Rate") || key === "efficiency" ? "%" : ""}`}
                    </span>
                  </div>
                  <Progress value={Math.min(100, (comparativeAnalysis.actuals[key] / target) * 100)} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Écart:</span>
                    <span
                      className={`font-medium ${comparativeAnalysis.gaps[key] >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {comparativeAnalysis.gaps[key] >= 0 ? "+" : ""}
                      {comparativeAnalysis.gaps[key].toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Tendances de Productivité</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Moyenne Quotidienne</span>
                    <Badge variant="secondary">
                      {productivityTrends.dailyAverages.monthly.transactions.toFixed(1)} trans/jour
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {productivityTrends.dailyAverages.monthly.amount.toLocaleString()} {currency}/jour
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Projection Mensuelle</span>
                    <Badge
                      className={
                        productivityTrends.isOnTrack ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }
                    >
                      {productivityTrends.isOnTrack ? "✓ Sur la bonne voie" : "⚠️ En retard"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Basée sur les performances hebdomadaires</div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Score Global</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {comparativeAnalysis.overallScore.toFixed(1)}/100
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Performance générale vs objectifs</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceMetrics
