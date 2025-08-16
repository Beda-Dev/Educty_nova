"use client";

import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSchoolStore } from "@/store/index";
import { Timetable, Professor } from "@/lib/interface";
import { 
  Loader2, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  BarChart3,
  User,
  GraduationCap,
  Timer,
  MapPin
} from "lucide-react";
import { generatePDFfromRef, universalExportToExcel } from "@/lib/utils";
import { useEffect } from "react";

// Utilitaire pour détecter les conflits d'horaires
function hasConflict(timetable: Timetable, all: Timetable[]) {
  return all.some(
    (t) =>
      t.id !== timetable.id &&
      t.day === timetable.day &&
      t.professor_id === timetable.professor_id &&
      (
        (timetable.start_time >= t.start_time && timetable.start_time < t.end_time) ||
        (timetable.end_time > t.start_time && timetable.end_time <= t.end_time) ||
        (timetable.start_time <= t.start_time && timetable.end_time >= t.end_time)
      )
  );
}

// Couleurs pour les matières
const SUBJECT_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
  "bg-yellow-100 border-yellow-300 text-yellow-800",
  "bg-red-100 border-red-300 text-red-800",
  "bg-teal-100 border-teal-300 text-teal-800",
  "bg-cyan-100 border-cyan-300 text-cyan-800"
];

export default function ProfessorTimetable() {
  const {
    timetables,
    classes,
    professor,
    academicYearCurrent,
    matters,
    userOnline
  } = useSchoolStore();

  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Trouver le professeur connecté
  const currentProfessor = useMemo(() => {
    return professor.find(p => p.user_id === userOnline?.id);
  }, [professor, userOnline]);

  // Obtenir la période actuelle basée sur la date d'aujourd'hui
  const currentPeriod = useMemo(() => {
    if (!academicYearCurrent?.periods) return null;
    
    const today = new Date();
    return academicYearCurrent.periods.find(period => {
      const startDate = new Date(period.pivot.start_date);
      const endDate = new Date(period.pivot.end_date);
      return today >= startDate && today <= endDate;
    });
  }, [academicYearCurrent]);

  // Période sélectionnée (par défaut la période actuelle)
  const activePeriod = useMemo(() => {
    if (selectedPeriod) {
      return academicYearCurrent?.periods?.find(p => p.id.toString() === selectedPeriod);
    }
    return currentPeriod;
  }, [selectedPeriod, currentPeriod, academicYearCurrent]);

  // Filtrer les emplois du temps du professeur connecté pour l'année académique courante et la période sélectionnée
  const professorTimetables = useMemo(() => {
    if (!currentProfessor || !academicYearCurrent || !activePeriod) return [];
    return timetables.filter(t => 
      Number(t.professor_id) === Number(currentProfessor.id) &&
      Number(t.academic_year_id) === Number(academicYearCurrent.id) &&
      Number(t.period_id) === Number(activePeriod.id)
    );
  }, [timetables, currentProfessor, academicYearCurrent, activePeriod]);

  // Initialiser la période sélectionnée avec la période actuelle
  useEffect(() => {
    if (currentPeriod && !selectedPeriod) {
      setSelectedPeriod(currentPeriod.id.toString());
    }
    // console.log("Emploie du temps sélectionnée :", professorTimetables);
  }, [currentPeriod, selectedPeriod]);

  // Jours de la semaine
  const DAYS_OF_WEEK = [
    { key: "lundi", label: "Lundi" },
    { key: "mardi", label: "Mardi" },
    { key: "mercredi", label: "Mercredi" },
    { key: "jeudi", label: "Jeudi" },
    { key: "vendredi", label: "Vendredi" },
    { key: "samedi", label: "Samedi" },
  ];

  // Extraire tous les créneaux horaires uniques et les trier
  const timeSlots = useMemo(() => {
    const slots = Array.from(new Set(professorTimetables.map(t => `${t.start_time}-${t.end_time}`)));
    return slots.sort();
  }, [professorTimetables]);

  // Fonction pour obtenir le cours à un créneau donné
  const getCourseAtSlot = (day: string, timeSlot: string) => {
    return professorTimetables.find(
      t => t.day.toLowerCase() === day.toLowerCase() && `${t.start_time}-${t.end_time}` === timeSlot
    );
  };

  // Statistiques du professeur
  const stats = useMemo(() => {
    const uniqueClasses = Array.from(new Set(professorTimetables.map(t => t.class_id)));
    const uniqueMatters = Array.from(new Set(professorTimetables.map(t => t.matter_id)));
    
    const totalHours = professorTimetables.reduce((sum, t) => {
      const start = t.start_time.split(":").map(Number);
      const end = t.end_time.split(":").map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      return sum + Math.max(0, (endMinutes - startMinutes) / 60);
    }, 0);

    return {
      totalClasses: uniqueClasses.length,
      totalMatters: uniqueMatters.length,
      totalCourses: professorTimetables.length,
      totalHours: totalHours,
      conflicts: professorTimetables.filter(t => hasConflict(t, professorTimetables)).length
    };
  }, [professorTimetables]);

  // Données pour les tableaux de statistiques
  const classesData = useMemo(() => {
    const classMap = new Map();
    professorTimetables.forEach(t => {
      const classe = classes.find(c => Number(c.id) === Number(t.class_id)  );
      if (classe) {
        const key = classe.id.toString();
        if (!classMap.has(key)) {
          classMap.set(key, {
            name: classe.label,
            courses: 0,
            hours: 0
          });
        }
        const data = classMap.get(key);
        data.courses += 1;
        
        const start = t.start_time.split(":").map(Number);
        const end = t.end_time.split(":").map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        data.hours += Math.max(0, (endMinutes - startMinutes) / 60);
      }
    });
    return Array.from(classMap.values());
  }, [professorTimetables, classes]);

  const mattersData = useMemo(() => {
    const matterMap = new Map();
    professorTimetables.forEach(t => {
      const matter = matters.find(m => Number(m.id) === Number(t.matter_id));
      if (matter) {
        const key = matter.id.toString();
        if (!matterMap.has(key)) {
          matterMap.set(key, {
            name: matter.name,
            courses: 0,
            hours: 0
          });
        }
        const data = matterMap.get(key);
        data.courses += 1;
        
        const start = t.start_time.split(":").map(Number);
        const end = t.end_time.split(":").map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        data.hours += Math.max(0, (endMinutes - startMinutes) / 60);
      }
    });
    return Array.from(matterMap.values());
  }, [professorTimetables, matters]);

  // Export PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    await generatePDFfromRef(pdfRef, `emploi_du_temps_${currentProfessor?.name}_${currentProfessor?.first_name}`, "download");
    setIsExporting(false);
  };

  // Export Excel
  const handleExportExcel = () => {
    // Préparer les données pour l'export Excel dans le même format que l'affichage
    const excelData: any[] = [];
    
    // En-tête
    const header = ["Horaires", ...DAYS_OF_WEEK.map(d => d.label)];
    excelData.push(header);
    
    // Données des créneaux
    timeSlots.forEach(timeSlot => {
      const row = [timeSlot];
      DAYS_OF_WEEK.forEach(day => {
        const course = getCourseAtSlot(day.key, timeSlot);
        if (course) {
          const classe = classes.find(c => Number(c.id) === Number(course.class_id) );
          const matter = matters.find(m => Number(m.id) === Number(course.matter_id) );
          row.push(`${matter?.name || 'N/A'} - ${classe?.label || 'N/A'} - ${course.room || 'N/A'}`);
        } else {
          row.push('');
        }
      });
      excelData.push(row);
    });

    universalExportToExcel({
      source: {
        type: "array",
        data: excelData.slice(1).map((row, index) => {
          const obj: any = {};
          header.forEach((h, i) => {
            obj[h] = row[i];
          });
          return obj;
        })
      },
      fileName: `emploi_du_temps_${currentProfessor?.name}_${currentProfessor?.first_name}.xlsx`,
    });
  };

  if (!currentProfessor) {
    return (
      <Card className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Vous devez être connecté en tant que professeur pour voir votre emploi du temps.</p>
            </div>
          </CardContent>
        </Card>
      </Card>
    );
  }

  return (
    <Card className="container mx-auto py-8 px-4 space-y-8">
      {/* En-tête avec informations du professeur */}
      <Card className=" border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {currentProfessor.name} {currentProfessor.first_name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {currentProfessor.sexe === "masculin"
                    ? "Enseignant"
                    : currentProfessor.sexe === "féminin"
                    ? "Enseignante"
                    : "Enseignant(e)"
                  } {currentProfessor.type} • {academicYearCurrent?.label}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExportPDF} disabled={isExporting} className="">
                {isExporting ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline" className="">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtre de période */}
      {academicYearCurrent?.periods && academicYearCurrent.periods.length > 0 && (
        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Période :</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  {academicYearCurrent.periods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.label} 
                      {currentPeriod?.id === period.id && " (Actuelle)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activePeriod && (
                <div className="text-sm text-gray-600">
                  Du {new Date(activePeriod.pivot.start_date).toLocaleDateString()}  {" "}
                  au {new Date(activePeriod.pivot.end_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalClasses}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Matières</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalMatters}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cours</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalCourses}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Heures</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conflits</p>
                <p className={`text-3xl font-bold ${stats.conflicts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.conflicts}
                </p>
              </div>
              <Timer className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emploi du temps principal */}
      <Card className="" ref={pdfRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Emploi du temps - {activePeriod?.label || "Période sélectionnée"}
          </CardTitle>
          {activePeriod && (
            <CardDescription>
              Période du {new Date(activePeriod.pivot.start_date).toLocaleDateString()} {" "}
              au {new Date(activePeriod.pivot.end_date).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {professorTimetables.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Aucun cours programmé pour cette période
              </p>
              {!activePeriod && (
                <p className="text-gray-400 text-sm mt-2">
                  Veuillez sélectionner une période
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-collapse border border-gray-300">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="border border-gray-300 text-center  min-w-[120px]">
                      Horaires/Jours
                    </TableHead>
                    {DAYS_OF_WEEK.map((day) => (
                      <TableHead
                        key={day.key}
                        className="border border-gray-300 text-center font-semibold min-w-[180px]"
                      >
                        {day.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((timeSlot) => (
                    <TableRow key={timeSlot}>
                      <TableCell className="border border-gray-300 bg-gray-50 text-xs text-center">
                        {timeSlot.replace('-', ' - ')}
                      </TableCell>
                      {DAYS_OF_WEEK.map((day) => {
                        const course = getCourseAtSlot(day.key, timeSlot);
                        if (!course) {
                          return (
                            <TableCell key={day.key} className="border border-gray-300 h-20">
                              {/* Cellule vide */}
                            </TableCell>
                          );
                        }

                        const classe = classes.find(c => Number(c.id) === Number(course.class_id) );
                        const matter = matters.find(m => Number(m.id) === Number(course.matter_id) );
                        const isConflict = hasConflict(course, professorTimetables);
                        const colorIndex = matters.findIndex(m => Number(m.id) === Number(course.matter_id)) % SUBJECT_COLORS.length;

                        return (
                          <TableCell key={day.key} className="border border-gray-300 p-2">
                            <div className={`${SUBJECT_COLORS[colorIndex]} border-l-4 p-3 rounded-r h-full min-h-[80px] flex flex-col justify-center relative ${isConflict ? 'ring-2 ring-red-500' : ''}`}>
                              <div className="space-y-1">
                                <Badge color="secondary" className="text-xs font-medium mb-1">
                                  {matter?.name || "Matière inconnue"}
                                </Badge>
                                <p className="text-sm font-semibold">{classe?.label || "Classe inconnue"}</p>
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <MapPin className="inline-block h-4 w-4 text-gray-500" />
                                  {course.room || "Salle non définie"}
                                </p>
                              </div>
                              {isConflict && (
                                <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded animate-pulse">
                                  ⚠️
                                </div>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableaux de statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition par classes */}
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Répartition par classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead className="text-center">Cours</TableHead>
                  <TableHead className="text-center">Heures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classesData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.courses}</TableCell>
                    <TableCell className="text-center">{item.hours.toFixed(1)}h</TableCell>
                  </TableRow>
                ))}
                {classesData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                      Aucune donnée disponible
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Répartition par matières */}
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Répartition par matières
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matière</TableHead>
                  <TableHead className="text-center">Cours</TableHead>
                  <TableHead className="text-center">Heures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mattersData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.courses}</TableCell>
                    <TableCell className="text-center">{item.hours.toFixed(1)}h</TableCell>
                  </TableRow>
                ))}
                {mattersData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                      Aucune donnée disponible
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Légende */}
      <Card className="">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Légende
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Cours programmé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
              <span>Créneau libre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
              <span>Conflit d'horaire</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="inline-block h-4 w-4 text-gray-500 bg-gray-100 rounded p-0.5" />
              <span>Salle de cours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Card>
  );
}