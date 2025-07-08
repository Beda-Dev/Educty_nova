"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck } from "lucide-react"

interface EnhancedGenderChartProps {
  femaleCount: number
  maleCount: number
}

const EnhancedGenderChart = ({ femaleCount, maleCount }: EnhancedGenderChartProps) => {
  const total = femaleCount + maleCount
  const data = [
    {
      name: "Filles",
      value: femaleCount,
      color: "#ec4899",
      percentage: total > 0 ? ((femaleCount / total) * 100).toFixed(1) : 0,
    },
    {
      name: "Garçons",
      value: maleCount,
      color: "#3b82f6",
      percentage: total > 0 ? ((maleCount / total) * 100).toFixed(1) : 0,
    },
  ]

  const COLORS = ["#ec4899", "#3b82f6"]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 border rounded-lg shadow-xl border-border"
        >
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} élèves ({data.payload.percentage}%)
          </p>
        </motion.div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium">{entry.value}</span>
            <Badge variant="outline" className="text-xs">
              {entry.payload.percentage}%
            </Badge>
          </motion.div>
        ))}
      </div>
    )
  }

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Répartition par sexe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <UserCheck className="h-12 w-12 mx-auto opacity-50" />
              <p>Aucune donnée disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Répartition par sexe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="text-2xl font-bold text-pink-600">{femaleCount}</div>
            <div className="text-sm text-pink-700">Filles</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{maleCount}</div>
            <div className="text-sm text-blue-700">Garçons</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EnhancedGenderChart
