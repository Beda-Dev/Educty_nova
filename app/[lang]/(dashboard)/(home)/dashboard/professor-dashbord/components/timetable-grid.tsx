"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Timetable, Classe, Matter } from "@/lib/interface"

interface TimetableGridProps {
  timetables: Timetable[]
  classes: Classe[]
  matters: Matter[]
}

const TimetableGrid = ({ timetables, classes, matters }: TimetableGridProps) => {
  // Jours de la semaine
  const daysOfWeek = [
    { key: "lundi", label: "Lundi" },
    { key: "mardi", label: "Mardi" },
    { key: "mercredi", label: "Mercredi" },
    { key: "jeudi", label: "Jeudi" },
    { key: "vendredi", label: "Vendredi" },
    { key: "samedi", label: "Samedi" },
  ]

  // Extraire tous les créneaux horaires uniques et les trier
  const timeSlots = Array.from(new Set(timetables.map((t) => `${t.start_time}-${t.end_time}`))).sort()

  // Fonction pour obtenir le cours à un créneau donné
  const getCourseAtSlot = (day: string, timeSlot: string) => {
    return timetables.find(
      (t) => t.day.toLowerCase() === day.toLowerCase() && `${t.start_time}-${t.end_time}` === timeSlot,
    )
  }

  // Fonction pour obtenir les détails d'un cours
  const getCourseDetails = (timetable: Timetable) => {
    const classe = classes.find((c) => Number(c.id) === Number(timetable.class_id))
    const matter = matters.find((m) => Number(m.id) === Number(timetable.matter_id))
    return { classe, matter }
  }

  if (timetables.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <p>Aucun emploi du temps configuré pour la période active</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emploi du temps - Période active</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            {/* En-tête avec les jours */}
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50 font-semibold text-sm min-w-[100px]">Horaires</th>
                {daysOfWeek.map((day) => (
                  <th
                    key={day.key}
                    className="border border-gray-300 p-2 bg-gray-50 font-semibold text-sm min-w-[150px]"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot) => (
                <tr key={timeSlot}>
                  {/* Colonne des horaires */}
                  <td className="border border-gray-300 p-2 bg-gray-50 font-medium text-xs text-center">{timeSlot}</td>
                  {/* Colonnes des jours */}
                  {daysOfWeek.map((day) => {
                    const course = getCourseAtSlot(day.key, timeSlot)
                    if (!course) {
                      return (
                        <td key={day.key} className="border border-gray-300 p-2 h-16">
                          {/* Cellule vide */}
                        </td>
                      )
                    }

                    const { classe, matter } = getCourseDetails(course)
                    return (
                      <td key={day.key} className="border border-gray-300 p-1">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded-r h-full min-h-[60px] flex flex-col justify-center">
                          <div className="space-y-1">
                            <Badge color="secondary" className="text-xs font-medium">
                              {matter?.name || "Matière inconnue"}
                            </Badge>
                            <p className="text-xs font-medium text-gray-700">{classe?.label || "Classe inconnue"}</p>
                            <p className="text-xs text-gray-500">{course.room}</p>
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">
            <strong>Légende :</strong>
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>Cours programmé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-gray-300 rounded"></div>
              <span>Créneau libre</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TimetableGrid
