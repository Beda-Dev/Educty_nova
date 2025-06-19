"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { useSchoolStore } from "@/store"
import { useMemo } from "react"

interface SessionStatisticsProps {
  statistics: {
    totalTransactions: number
    totalEncaissements: number
    totalDecaissements: number
    nombreEncaissements: number
    nombreDecaissements: number
    soldeNet: number
  }
  formatAmount: (amount: number | string) => string
  sessionTransactions: any[]
  payments: any[]
}

export default function SessionStatistics({
  statistics,
  formatAmount,
  sessionTransactions,
  payments,
}: SessionStatisticsProps) {
  const { methodPayment } = useSchoolStore()

  // Calculer les totaux par méthode de paiement
  const paymentMethodStats = useMemo(() => {
    const stats: Record<number, { totalEncaissements: number; totalDecaissements: number; soldeNet: number }> = {}

    // Initialiser les stats pour chaque méthode de paiement
    methodPayment.forEach((method) => {
      stats[method.id] = {
        totalEncaissements: 0,
        totalDecaissements: 0,
        soldeNet: 0,
      }
    })

    // Calculer les encaissements par méthode de paiement
    payments.forEach((payment) => {
      if (payment.payment_methods && Array.isArray(payment.payment_methods)) {
        payment.payment_methods.forEach((pm: any) => {
          if (stats[pm.payment_method_id]) {
            stats[pm.payment_method_id].totalEncaissements += Number(pm.amount) || 0
          }
        })
      }
    })

    // Calculer le solde net pour chaque méthode
    Object.keys(stats).forEach((methodId) => {
      const id = Number(methodId)
      stats[id].soldeNet = stats[id].totalEncaissements - stats[id].totalDecaissements
    })

    return stats
  }, [methodPayment, payments])

  return (
    <>
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{statistics.totalTransactions}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encaissements</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(statistics.totalEncaissements)}</p>
                <p className="text-xs text-muted-foreground">{statistics.nombreEncaissements} transaction(s)</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Décaissements</p>
                <p className="text-2xl font-bold text-red-600">{formatAmount(statistics.totalDecaissements)}</p>
                <p className="text-xs text-muted-foreground">{statistics.nombreDecaissements} transaction(s)</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solde Net</p>
                <p className={`text-2xl font-bold ${statistics.soldeNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatAmount(statistics.soldeNet)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par méthode de paiement */}
      {methodPayment.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Totaux par méthode de paiement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {methodPayment.map((method) => {
                const stats = paymentMethodStats[method.id]
                return (
                  <div key={method.id} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">{method.name}</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Encaissements:</span>
                        <span className="text-green-600 font-medium">
                          {formatAmount(stats?.totalEncaissements || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Décaissements:</span>
                        <span className="text-red-600 font-medium">{formatAmount(stats?.totalDecaissements || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold border-t pt-1">
                        <span>Solde net:</span>
                        <span className={stats?.soldeNet >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatAmount(stats?.soldeNet || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
