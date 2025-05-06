import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Table } from "@tanstack/react-table";

interface ExportOptions<T> {
  table: Table<T>;
  fileName?: string;
  formatRow: (row: T) => Record<string, any>;
}

export function exportToExcel<T>({
  table,
  fileName = "export.xlsx",
  formatRow,
}: ExportOptions<T>) {
  const rows = table.getFilteredRowModel().rows;

  // Convertir les données avec le format personnalisé
  const data = rows.map((row) => formatRow(row.original));

  // Créer la feuille de calcul
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Calculer la largeur maximale pour chaque colonne
  const colWidths = data.reduce((widths: Array<{ wch: number }>, row) => {
    Object.values(row).forEach((value, colIndex) => {
      const length = value ? String(value).length : 0;
      if (!widths[colIndex] || widths[colIndex].wch < length) {
        widths[colIndex] = { wch: Math.min(Math.max(length, 10), 50) }; // Limite entre 10 et 50 caractères
      }
    });
    return widths;
  }, []);

  // Appliquer les largeurs de colonnes
  worksheet['!cols'] = colWidths;

  // Créer le classeur Excel
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Feuille1");

  // Générer le fichier Excel
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Télécharger le fichier
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
}