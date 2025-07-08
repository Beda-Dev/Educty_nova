"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface GenderDistributionChartProps {
  femaleCount: number
  maleCount: number
}

const GenderDistributionChart = ({ femaleCount, maleCount }: GenderDistributionChartProps) => {
  const data = [
    {
      name: "Filles",
      value: femaleCount,
      color: "#ec4899",
    },
    {
      name: "Garçons",
      value: maleCount,
      color: "#3b82f6",
    },
  ]

  const COLORS = ["#ec4899", "#3b82f6"]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} élèves ({((data.value / (femaleCount + maleCount)) * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (femaleCount === 0 && maleCount === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Aucune donnée disponible</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GenderDistributionChart
