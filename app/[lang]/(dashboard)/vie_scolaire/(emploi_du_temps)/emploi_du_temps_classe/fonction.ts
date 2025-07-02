import { toast } from "sonner";
import { Timetable, Classe, AcademicYear, Period, Matter, Professor } from "@/lib/interface";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Jours de la semaine
const DAYS_OF_WEEK = [
  { value: "lundi", label: "Lundi" },
  { value: "mardi", label: "Mardi" },
  { value: "mercredi", label: "Mercredi" },
  { value: "jeudi", label: "Jeudi" },
  { value: "vendredi", label: "Vendredi" },
  { value: "samedi", label: "Samedi" },
];

// Créneaux horaires fixes (doivent correspondre à ceux de la grille)
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

// Helpers pour les rowspans
function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function slotIsCoveredByTimetable(timeSlot: typeof TIME_SLOTS[0], timetable: Timetable) {
  return (
    timeToMinutes(timeSlot.start) >= timeToMinutes(timetable.start_time) &&
    timeToMinutes(timeSlot.end) <= timeToMinutes(timetable.end_time)
  );
}
function getTimetableRowSpan(day: string, startIdx: number, courses: Timetable[]) {
  const slot = TIME_SLOTS[startIdx];
  const timetable = courses.find(
    (c) => c.day === day && slotIsCoveredByTimetable(slot, c)
  );
  if (!timetable) return { timetable: null, rowSpan: 1 };

  let rowSpan = 1;
  for (let i = startIdx + 1; i < TIME_SLOTS.length; i++) {
    const nextSlot = TIME_SLOTS[i];
    if (
      slotIsCoveredByTimetable(nextSlot, timetable)
    ) {
      rowSpan++;
    } else {
      break;
    }
  }
  return { timetable, rowSpan };
}

/**
 * Exporte l'emploi du temps sous forme de grille Excel (comme l'affichage visuel).
 * @param timetables Liste des créneaux (Timetable[])
 * @param options { classes, academicYears, periods, fileName }
 */
export function exportEmploiDuTempsGrilleExcel(
  timetables: Timetable[],
  {
    classes = [],
    academicYears = [],
    periods = [],
    fileName = "emploi_du_temps_grille.xlsx",
  }: {
    classes?: Classe[];
    academicYears?: AcademicYear[];
    periods?: Period[];
    fileName?: string;
  } = {}
) {
  try {
    toast.info("Génération du fichier Excel...");

    // On groupe par année académique et période
    const timetableByYearAndPeriod: Record<string, Record<string, Timetable[]>> = {};
    for (const t of timetables) {
      if (!timetableByYearAndPeriod[t.academic_year_id]) timetableByYearAndPeriod[t.academic_year_id] = {};
      if (!timetableByYearAndPeriod[t.academic_year_id][t.period_id]) timetableByYearAndPeriod[t.academic_year_id][t.period_id] = [];
      timetableByYearAndPeriod[t.academic_year_id][t.period_id].push(t);
    }

    // Pour chaque année/période, on crée une feuille Excel
    const sheets: Record<string, any[][]> = {};

    Object.entries(timetableByYearAndPeriod).forEach(([yearId, periodsObj]) => {
      const yearLabel = academicYears.find(a => a.id.toString() === yearId)?.label || yearId;
      Object.entries(periodsObj).forEach(([periodId, courses]) => {
        const periodLabel = periods.find(p => p.id.toString() === periodId)?.label || periodId;
        const sheetName = `${yearLabel} - ${periodLabel}`.substring(0, 31); // Excel max 31 chars

        // En-tête
        const header = ["Horaire", ...DAYS_OF_WEEK.map(d => d.label)];
        const rows: any[][] = [header];

        // Pour chaque time slot, on construit la ligne
        for (let slotIdx = 0; slotIdx < TIME_SLOTS.length; slotIdx++) {
          const timeSlot = TIME_SLOTS[slotIdx];
          const row: any[] = [timeSlot.label];

          for (const day of DAYS_OF_WEEK) {
            const { timetable, rowSpan } = getTimetableRowSpan(day.value, slotIdx, courses);

            if (timetable) {
              // Vérifie si c'est le premier slot du cours (le slot précédent n'est pas couvert)
              const isFirstSlot =
                slotIdx === 0 ||
                !slotIsCoveredByTimetable(TIME_SLOTS[slotIdx - 1], timetable);

              if (isFirstSlot) {
                let cellValue = "";
                // Matière en MAJUSCULES
                if (timetable.matter?.name) {
                  cellValue += timetable.matter.name.toUpperCase();
                }
                // Professeur
                if (timetable.professor) {
                  cellValue += `\n${timetable.professor.name ?? ""} ${timetable.professor.first_name ?? ""}`;
                }
                // Salle
                if (timetable.room) {
                  cellValue += `\nSalle: ${timetable.room}`;
                }
                // Classe
                if (timetable.class?.label) {
                  cellValue += `\nClasse: ${timetable.class.label}`;
                }
                // Horaires
                cellValue += `\n${timetable.start_time} - ${timetable.end_time}`;
                // Style centré et retour à la ligne
                row.push({
                  v: cellValue.trim(),
                  s: {
                    alignment: { horizontal: "center", vertical: "center", wrapText: true },
                    font: { bold: false }
                  },
                  rowspan: rowSpan,
                });
              } else {
                row.push(null);
              }
            } else {
              row.push("-");
            }
          }
          rows.push(row);
        }

        sheets[sheetName] = rows;
      });
    });

    import("xlsx").then(XLSX => {
      const workbook = XLSX.utils.book_new();

      Object.entries(sheets).forEach(([sheetName, rows]) => {
        const ws = XLSX.utils.aoa_to_sheet(rows.map(row =>
          row.map(cell => (cell && typeof cell === "object" && "v" in cell ? cell.v : cell))
        ));

        // Gestion des rowspans (fusion verticale)
        let merges: any[] = [];
        for (let col = 1; col < DAYS_OF_WEEK.length + 1; col++) {
          let row = 1;
          while (row < rows.length) {
            const cell = rows[row][col];
            if (cell && typeof cell === "object" && cell.rowspan && cell.rowspan > 1) {
              merges.push({
                s: { r: row, c: col },
                e: { r: row + cell.rowspan - 1, c: col },
              });
              row += cell.rowspan;
            } else {
              row++;
            }
          }
        }
        if (merges.length) ws["!merges"] = merges;

        // Définir la largeur des colonnes (plus large pour matière/prof/salle)
        ws["!cols"] = [
          { wch: 18 }, // Horaire
          ...DAYS_OF_WEEK.map(() => ({ wch: 32 }))
        ];
        // Définir la hauteur des lignes (plus grande pour permettre le texte multi-ligne)
        ws["!rows"] = rows.map((_, idx) => ({
          hpt: idx === 0 ? 24 : 48 // 24 pour l'en-tête, 48 pour les autres
        }));

        XLSX.utils.book_append_sheet(workbook, ws, sheetName);
      });

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, fileName);
      toast.success(`Export réussi : ${fileName}`);
    });
  } catch (error) {
    toast.error("Erreur lors de l'export du fichier Excel");
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
