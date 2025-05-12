"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function CategoriesChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")

      if (ctx) {
        // Destroy existing chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        // Create new chart
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: [
              "Littérature",
              "Sciences",
              "Histoire",
              "Mathématiques",
              "Géographie",
              "Langues",
              "Arts",
              "Informatique",
            ],
            datasets: [
              {
                label: "Nombre de livres",
                data: [342, 256, 189, 145, 98, 87, 76, 55],
                backgroundColor: [
                  "rgba(59, 130, 246, 0.7)", // blue
                  "rgba(16, 185, 129, 0.7)", // green
                  "rgba(234, 179, 8, 0.7)", // yellow
                  "rgba(239, 68, 68, 0.7)", // red
                  "rgba(168, 85, 247, 0.7)", // purple
                  "rgba(236, 72, 153, 0.7)", // pink
                  "rgba(249, 115, 22, 0.7)", // orange
                  "rgba(79, 70, 229, 0.7)", // indigo
                ],
                borderColor: [
                  "rgba(59, 130, 246, 1)",
                  "rgba(16, 185, 129, 1)",
                  "rgba(234, 179, 8, 1)",
                  "rgba(239, 68, 68, 1)",
                  "rgba(168, 85, 247, 1)",
                  "rgba(236, 72, 153, 1)",
                  "rgba(249, 115, 22, 1)",
                  "rgba(79, 70, 229, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        })
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
