"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Payment, AcademicYear } from "@/lib/interface"

interface PaymentOverviewChartProps {
  payments: Payment[]
  academicYear: AcademicYear
}

const PaymentOverviewChart = ({ payments, academicYear }: PaymentOverviewChartProps) => {
  // Grouper les paiements par mois
  const monthlyPayments = payments.reduce(
    (acc, payment) => {
      const date = new Date(payment.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("fr-FR", { month: "short" })

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          amount: 0,
          count: 0,
        }
      }
      acc[monthKey].amount += Number.parseFloat(payment.amount || "0")
      acc[monthKey].count++
      return acc
    },
    {} as Record<string, { month: string; amount: number; count: number }>,
  )

  const data = Object.values(monthlyPayments).sort((a, b) => a.month.localeCompare(b.month))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-600">Montant: {data.amount.toLocaleString()} FCFA</p>
          <p className="text-sm text-muted-foreground">
            {data.count} paiement{data.count > 1 ? "s" : ""}
          </p>
        </div>
      )
    }
    return null
  }

  if (!data.length) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Aucun paiement enregistré</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PaymentOverviewChart
