"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/store/index";
import { Timetable, AcademicYear, Period, Classe } from "@/lib/interface";
import { Loader2, Download, FileSpreadsheet, Calendar } from "lucide-react";
import { exportEmploiDuTempsGrilleExcel } from "./fonction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Définition des créneaux horaires fixes
const TIME_SLOTS = [
  { start: "07:15", end: "08:05", label: "07:15 - 08:05" },
  { start: "08:05", end: "09:00", label: "08:05 - 09:00" },
  { start: "08:55", end: "09:45", label: "08:55 - 09:45" },
  { start: "09:05", end: "10:15", label: "09:05 - 10:15" },
  { start: "10:15", end: "10:30", label: "Récréation" },
  { start: "10:30", end: "11:15", label: "10:30 - 11:15" },
  { start: "11:15", end: "12:05", label: "11:15 - 12:05" },
  { start: "12:30", end: "13:00", label: "Pause Midi" },
  { start: "13:00", end: "14:00", label: "13:00 - 14:00" },
  { start: "14:00", end: "15:00", label: "14:00 - 15:00" },
  { start: "15:00", end: "16:00", label: "15:00 - 16:00" },
  { start: "16:00", end: "17:00", label: "16:00 - 17:00" },
  { start: "17:00", end: "18:00", label: "17:00 - 18:00" },
  { start: "18:00", end: "19:00", label: "18:00 - 19:00" },
  { start: "19:00", end: "20:00", label: "19:00 - 20:00" }
];

// Jours de la semaine
const DAYS_OF_WEEK = [
  { value: "lundi", label: "Lundi" },
  { value: "mardi", label: "Mardi" },
  { value: "mercredi", label: "Mercredi" },
  { value: "jeudi", label: "Jeudi" },
  { value: "vendredi", label: "Vendredi" },
  { value: "samedi", label: "Samedi" },
];

export default function EmploiDuTempsComplet() {
  const { 
    timetables, 
    academicYears, 
    periods, 
    classes 
  } = useSchoolStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Filtre les emplois du temps selon les sélections
  const filteredTimetables = useMemo(() => {
    return timetables.filter(t => {
      if (selectedClass && t.class_id.toString() !== selectedClass) return false;
      if (selectedYear && t.academic_year_id.toString() !== selectedYear) return false;
      if (selectedPeriod && t.period_id.toString() !== selectedPeriod) return false;
      return true;
    });
  }, [timetables, selectedClass, selectedYear, selectedPeriod]);

  // Groupe les emplois du temps filtrés par année académique et période
  const timetableByYearAndPeriod = useMemo(() => {
    const result: Record<string, Record<string, Timetable[]>> = {};
    
    for (const t of filteredTimetables) {
      if (!result[t.academic_year_id]) result[t.academic_year_id] = {};
      if (!result[t.academic_year_id][t.period_id]) result[t.academic_year_id][t.period_id] = [];
      result[t.academic_year_id][t.period_id].push(t);
    }
    
    return result;
  }, [filteredTimetables]);

  // Export Excel
  const handleExportExcel = () => {
    if (!selectedClass || filteredTimetables.length === 0) return;
    exportEmploiDuTempsGrilleExcel(filteredTimetables, {
      classes,
      academicYears,
      periods,
      fileName: "emploi_du_temps.xlsx",
    });
  };

  // Vérifie si un créneau existe pour un jour et une plage horaire donnés
  const getCourseForSlot = (
    day: string,
    timeSlot: typeof TIME_SLOTS[0],
    courses: Timetable[]
  ) => {
    // On cherche un créneau dont la plage couvre le timeSlot
    return courses.find((c) => {
      if (c.day !== day) return false;
      // c.start_time <= timeSlot.start && c.end_time >= timeSlot.end
      return (
        c.start_time <= timeSlot.start &&
        c.end_time >= timeSlot.end
      );
    });
  };

  return (
    <div className="container mx-auto py-8 px-2 sm:px-6">
      <Card className="w-full overflow-hidden shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-t-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2 text-white">
                <Calendar className="h-7 w-7" />
                Emploi du Temps Complet
              </CardTitle>
              <CardDescription className="text-white/80">
                Visualisation de l'emploi du temps avec filtres par classe, année et période
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleExportExcel} 
                className="shadow bg-green-600 hover:bg-green-700"
                disabled={!selectedClass || filteredTimetables.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-gray-50">
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Année académique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les années</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-64">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les périodes</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-64">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les classes</SelectItem>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id.toString()}>
                      {classe.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Affichage des emplois du temps */}
          <div className="bg-gray-50 p-0">
            {!selectedClass ? (
              <div className="text-center text-gray-500 py-8">
                Veuillez sélectionner une classe pour afficher l'emploi du temps.
              </div>
            ) : Object.entries(timetableByYearAndPeriod).length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucun emploi du temps disponible pour les filtres sélectionnés.
              </div>
            ) : (
              Object.entries(timetableByYearAndPeriod).map(([yearId, periodsObj]) => {
                const yearLabel = academicYears.find(a => a.id.toString() === yearId)?.label || yearId;
                
                return Object.entries(periodsObj).map(([periodId, courses]) => {
                  const periodLabel = periods.find(p => p.id.toString() === periodId)?.label || periodId;
                  
                  return (
                    <div key={`${yearId}-${periodId}`} className="mb-10 p-6 bg-white rounded-lg shadow">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="font-bold text-xl text-indigo-700">{yearLabel}</span>
                        <span className="font-semibold text-lg text-blue-700">{periodLabel}</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table className="min-w-max">
                          <TableHeader className="bg-gray-100">
                            <TableRow>
                              <TableHead className="w-32 border border-gray-200">Horaire</TableHead>
                              {DAYS_OF_WEEK.map((d) => (
                                <TableHead key={d.value} className="text-center min-w-40 border border-gray-200">
                                  {d.label}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {TIME_SLOTS.map((timeSlot) => (
                              <TableRow key={timeSlot.start} className="hover:bg-gray-50">
                                <TableCell className="font-medium border border-gray-200">
                                  {timeSlot.label}
                                </TableCell>
                                
                                {DAYS_OF_WEEK.map((day) => {
                                  const course = getCourseForSlot(day.value, timeSlot, courses);
                                  
                                  return (
                                    <TableCell key={day.value} className="text-center p-2 border border-gray-200">
                                      {course ? (
                                        <div className="border rounded p-2 bg-blue-50">
                                          <div className="font-semibold text-blue-800">
                                            {course.matter?.name || ''}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {course.professor?.name} {course.professor?.first_name}
                                          </div>
                                          <div className="text-xs text-blue-600">
                                            {course.room}
                                          </div>
                                          {!selectedClass && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              {course.class?.label}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-gray-300">-</div>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                });
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}