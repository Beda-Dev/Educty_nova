"use client";

import React, { useMemo, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/store/index";
import { Timetable, Classe, Professor, AcademicYear, Period, Matter } from "@/lib/interface";
import { Loader2, Download, FileSpreadsheet, Calendar, Users, BookOpen, Clock, X } from "lucide-react";
import { generatePDFfromRef, universalExportToExcel } from "@/lib/utils";

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

// Palette de couleurs par défaut
const DEFAULT_COLORS = [
  "#a5b4fc", "#fca5a5", "#fdba74", "#6ee7b7", "#fcd34d", "#f472b6", "#38bdf8", "#818cf8", "#fbbf24", "#34d399"
];

export default function EmploiDuTempsProfesseur() {
  const {
    timetables,
    classes,
    professor,
    academicYears,
    periods,
    matters,
  } = useSchoolStore();

  // Filtres
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [selectedClasse, setSelectedClasse] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Couleurs personnalisées
  const [colorMode, setColorMode] = useState<"matiere" | "classe" | "aucune">("matiere");
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  const handleColorChange = useCallback((id: string, color: string) => {
    setCustomColors((prev) => ({ ...prev, [id]: color }));
  }, []);

  const handleRemoveColor = useCallback((id: string) => {
    setCustomColors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Liste des jours
  const DAYS_OF_WEEK = [
    { value: "lundi", label: "Lundi" },
    { value: "mardi", label: "Mardi" },
    { value: "mercredi", label: "Mercredi" },
    { value: "jeudi", label: "Jeudi" },
    { value: "vendredi", label: "Vendredi" },
    { value: "samedi", label: "Samedi" },
  ];

  // Liste des heures uniques
  const allHours = useMemo(() => {
    const hours = Array.from(
      new Set(
        timetables.map((t) => `${t.start_time} - ${t.end_time}`)
      )
    );
    return hours.sort();
  }, [timetables]);

  // Recherche textuelle et filtres
  const filteredTimetables = useMemo(() => {
    let result = timetables.filter((t) => {
      if (selectedProfessor && t.professor_id !== selectedProfessor) return false;
      if (selectedClasse && t.class_id !== selectedClasse) return false;
      if (selectedYear && t.academic_year_id !== selectedYear) return false;
      if (selectedPeriod && t.period_id !== selectedPeriod) return false;
      if (selectedDay && t.day !== selectedDay) return false;
      if (selectedHour && `${t.start_time} - ${t.end_time}` !== selectedHour) return false;
      return true;
    });
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter((t) => {
        const matiere = t.matter?.name?.toLowerCase() || "";
        const classe = classes.find((c) => c.id.toString() === t.class_id)?.label?.toLowerCase() || "";
        const salle = t.room?.toLowerCase() || "";
        return matiere.includes(s) || classe.includes(s) || salle.includes(s);
      });
    }
    return result;
  }, [
    timetables,
    selectedProfessor,
    selectedClasse,
    selectedYear,
    selectedPeriod,
    selectedDay,
    selectedHour,
    search,
    classes,
  ]);

  // Export PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    await generatePDFfromRef(pdfRef, "emploi_du_temps_professeur", "download");
    setIsExporting(false);
  };

  // Export Excel
  const handleExportExcel = () => {
    universalExportToExcel({
      source: {
        type: "array",
        data: filteredTimetables,
        formatRow: (row) => ({
          "Professeur": professor.find((p) => p.id.toString() === row.professor_id)?.name + " " + professor.find((p) => p.id.toString() === row.professor_id)?.first_name || "",
          "Classe": classes.find((c) => c.id.toString() === row.class_id)?.label || "",
          "Année académique": academicYears.find((a) => a.id.toString() === row.academic_year_id)?.label || "",
          "Période": periods.find((p) => p.id.toString() === row.period_id)?.label || "",
          "Jour": DAYS_OF_WEEK.find((d) => d.value === row.day)?.label || "",
          "Heure": `${row.start_time} - ${row.end_time}`,
          "Matière": row.matter?.name || "",
          "Salle": row.room,
        }),
      },
      fileName: "emploi_du_temps_professeur.xlsx",
    });
  };

  // Regroupe les emplois du temps par année académique et période
  const timetableByYearAndPeriod = useMemo(() => {
    const result: Record<string, Record<string, Timetable[]>> = {};
    for (const t of filteredTimetables) {
      if (!result[t.academic_year_id]) result[t.academic_year_id] = {};
      if (!result[t.academic_year_id][t.period_id]) result[t.academic_year_id][t.period_id] = [];
      result[t.academic_year_id][t.period_id].push(t);
    }
    return result;
  }, [filteredTimetables]);

  // Liste unique des intervalles d'heures (triées)
  const allIntervals = useMemo(() => {
    const intervals = Array.from(
      new Set(
        filteredTimetables.map((t) => `${t.start_time} - ${t.end_time}`)
      )
    );
    return intervals.sort();
  }, [filteredTimetables]);

  // Génère les libellés d'heure (1ère H, 2e H, etc.)
  const getHourLabel = (idx: number) => {
    if (idx === 0) return "1ère H";
    if (idx === 1) return "2e H";
    return `${idx + 1}e H`;
  };

  // Statistiques du professeur sélectionné
  const selectedProfessorObj = useMemo(
    () => professor.find((p) => p.id.toString() === selectedProfessor),
    [professor, selectedProfessor]
  );

  const profTimetables = useMemo(
    () => filteredTimetables.filter((t) => t.professor_id === selectedProfessor),
    [filteredTimetables, selectedProfessor]
  );

  const profClasses = useMemo(() => {
    const ids = Array.from(new Set(profTimetables.map((t) => t.class_id)));
    return classes.filter((c) => ids.includes(c.id.toString()));
  }, [profTimetables, classes]);

  const profMatters = useMemo(() => {
    const ids = Array.from(new Set(profTimetables.map((t) => t.matter_id)));
    return matters.filter((m) => ids.includes(m.id.toString()));
  }, [profTimetables, matters]);

  const totalHours = useMemo(() => {
    return profTimetables.reduce((sum, t) => {
      const start = t.start_time.split(":").map(Number);
      const end = t.end_time.split(":").map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      return sum + Math.max(0, (endMinutes - startMinutes) / 60);
    }, 0);
  }, [profTimetables]);

  // Couleur pour une matière ou une classe
  const getCellColor = useCallback(
    (cours: Timetable) => {
      if (colorMode === "matiere") {
        if (customColors[cours.matter_id]) return customColors[cours.matter_id];
        const idx = profMatters.findIndex((m) => m.id.toString() === cours.matter_id);
        return DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      }
      if (colorMode === "classe") {
        if (customColors[cours.class_id]) return customColors[cours.class_id];
        const idx = profClasses.findIndex((c) => c.id.toString() === cours.class_id);
        return DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      }
      return undefined;
    },
    [colorMode, customColors, profMatters, profClasses]
  );

  // Liste des matières/classes pour la personnalisation des couleurs
  const colorOptions = useMemo(() => {
    if (colorMode === "matiere") {
      return profMatters;
    }
    if (colorMode === "classe") {
      return profClasses;
    }
    return [];
  }, [colorMode, profMatters, profClasses]);

  return (
    <div className="container mx-auto py-8 px-2 sm:px-6">
      <Card className="w-full overflow-hidden shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-skyblue-500 text-white rounded-t-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2 text-white">
                <Calendar className="h-7 w-7" />
                Emploi du Temps des Enseignants
              </CardTitle>
              <CardDescription className="text-white/80">
                Visualisez et exportez l'emploi du temps filtré par enseignant, classe, année, période, jour ou heure.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExportPDF} disabled={isExporting} className="shadow">
                {isExporting ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter PDF
              </Button>
              <Button color="success" onClick={handleExportExcel} className="shadow">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-gray-50">
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-4 justify-center">
            <div className="w-48">
              <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder="Professeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les professeurs</SelectItem>
                  {professor.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} {p.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                <SelectTrigger className="bg-white shadow-sm">
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
            <div className="w-48">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder="Année académique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les années</SelectItem>
                  {academicYears.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les périodes</SelectItem>
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder="Jour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les jours</SelectItem>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder="Heure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les heures</SelectItem>
                  {allHours.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Recherche textuelle */}
            <div className="w-64">
              <input
                type="text"
                placeholder="Recherche matière, classe, salle..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-skyblue"
              />
            </div>
          </div>

          {/* Couleurs personnalisables */}
          <div className="flex flex-wrap gap-4 mb-8 items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Couleur par :</span>
              <Select value={colorMode} onValueChange={v => setColorMode(v as any)}>
                <SelectTrigger className="w-32 bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matiere">Matière</SelectItem>
                  <SelectItem value="classe">Classe</SelectItem>
                  <SelectItem value="aucune">Aucune</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {colorMode !== "aucune" && (
              <div className="flex flex-wrap gap-2 items-center">
                {colorOptions.map((item) => (
                  <div key={item.id} className="flex items-center gap-1">
                    <label className="text-xs text-gray-700">
                      {colorMode === "matiere"
                        ? "name" in item
                          ? item.name
                          : ""
                        : "label" in item
                        ? item.label
                        : ""}
                    </label>
                    <input
                      type="color"
                      value={customColors[item.id.toString()] || DEFAULT_COLORS[item.id % DEFAULT_COLORS.length]}
                      onChange={e => handleColorChange(item.id.toString(), e.target.value)}
                      className="w-6 h-6 border-0 p-0"
                      style={{ cursor: "pointer" }}
                    />
                    {customColors[item.id.toString()] && (
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveColor(item.id.toString())}
                        title="Réinitialiser la couleur"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations et statistiques du professeur */}
          {selectedProfessorObj && (
            <div className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border">
              <div>
                <div className="text-xl font-bold text-indigo-700 mb-1">
                  {selectedProfessorObj.name} {selectedProfessorObj.first_name}
                </div>
                <div className="text-gray-600 text-sm">
                  Type : <b>{selectedProfessorObj.type}</b>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-green-50 rounded-lg px-4 py-2 flex flex-col items-center min-w-[90px]">
                  <Users className="h-5 w-5 text-green-600 mb-1" />
                  <span className="font-bold text-lg">{profClasses.length}</span>
                  <span className="text-xs text-gray-600">Classes</span>
                </div>
                <div className="bg-skyblue-50 rounded-lg px-4 py-2 flex flex-col items-center min-w-[90px]">
                  <BookOpen className="h-5 w-5 text-skyblue-600 mb-1" />
                  <span className="font-bold text-lg">{profMatters.length}</span>
                  <span className="text-xs text-gray-600">Matières</span>
                </div>
                <div className="bg-orange-50 rounded-lg px-4 py-2 flex flex-col items-center min-w-[90px]">
                  <Clock className="h-5 w-5 text-orange-600 mb-1" />
                  <span className="font-bold text-lg">{profTimetables.length}</span>
                  <span className="text-xs text-gray-600">Cours</span>
                </div>
                <div className="bg-purple-50 rounded-lg px-4 py-2 flex flex-col items-center min-w-[90px]">
                  <Clock className="h-5 w-5 text-purple-600 mb-1" />
                  <span className="font-bold text-lg">{totalHours.toFixed(1)}h</span>
                  <span className="text-xs text-gray-600">Heures</span>
                </div>
              </div>
            </div>
          )}

          {/* Emploi du temps différencié par année académique et période */}
          {Object.entries(timetableByYearAndPeriod).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Aucun créneau trouvé pour les filtres sélectionnés.
            </div>
          )}
          {Object.entries(timetableByYearAndPeriod).map(([yearId, periodsObj]) => {
            const yearLabel = academicYears.find(a => a.id.toString() === yearId)?.label || yearId;
            return Object.entries(periodsObj).map(([periodId, tts]) => {
              const periodLabel = periods.find(p => p.id.toString() === periodId)?.label || periodId;
              // Pour chaque intervalle d'heure, on prépare une ligne
              return (
                <div key={yearId + "-" + periodId} className="mb-10">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-bold text-lg text-indigo-700">{yearLabel}</span>
                    <span className="font-semibold text-skyblue-700">{periodLabel}</span>
                  </div>
                  <div
                    ref={pdfRef}
                    className="overflow-x-auto bg-white rounded-md border shadow-sm"
                    style={{
                      minHeight: 300,
                      WebkitOverflowScrolling: "touch",
                      maxWidth: "100vw",
                    }}
                  >
                    <Table className="min-w-max">
                      <TableHeader>
                        <TableRow className="bg-gray-100 sticky top-0 z-10">
                          <TableHead className="text-center" colSpan={2}>Horaire</TableHead>
                          {DAYS_OF_WEEK.map((d) => (
                            <TableHead key={d.value} className="text-center">{d.label}</TableHead>
                          ))}
                        </TableRow>
                        <TableRow className="sticky top-8 z-10 bg-gray-50">
                          <TableHead className="text-center w-24">N° H</TableHead>
                          <TableHead className="text-center w-40">Intervalle</TableHead>
                          {DAYS_OF_WEEK.map((d) => (
                            <TableHead key={d.value + "-sub"} className="text-center"></TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allIntervals.map((interval, idx) => (
                          <TableRow key={interval}>
                            <TableCell className="text-center font-semibold sticky left-0 bg-white z-10">{getHourLabel(idx)}</TableCell>
                            <TableCell className="text-center sticky left-20 bg-white z-10">{interval}</TableCell>
                            {DAYS_OF_WEEK.map((d) => {
                              // On cherche le créneau pour ce jour et cet intervalle
                              const cours = tts.find(
                                (t) =>
                                  t.day === d.value &&
                                  `${t.start_time} - ${t.end_time}` === interval
                              );
                              if (!cours) {
                                return <TableCell key={d.value} className="text-center text-gray-300">-</TableCell>;
                              }
                              // Conflit ?
                              const isConflict = hasConflict(cours, tts);
                              // Couleur personnalisée
                              const bgColor = colorMode !== "aucune" ? getCellColor(cours) : undefined;
                              return (
                                <TableCell
                                  key={d.value}
                                  className={`text-center relative transition-all`}
                                  style={{
                                    background: bgColor,
                                    border: isConflict ? "2px solid #ef4444" : undefined,
                                    boxShadow: isConflict ? "0 0 0 2px #ef4444" : undefined,
                                  }}
                                >
                                  <div className="font-semibold text-indigo-800">{cours.matter?.name || ""}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {classes.find((c) => c.id.toString() === cours.class_id)?.label || ""}
                                  </div>
                                  <div className="text-xs text-skyblue-700 mt-1">
                                    {cours.room ? `/${cours.room}` : ""}
                                  </div>
                                  {isConflict && (
                                    <div className="absolute top-1 right-1 text-xs text-red-600 font-bold animate-pulse" title="Conflit d'horaire">
                                      !
                                    </div>
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
          })}
        </CardContent>
      </Card>
    </div>
  );
}