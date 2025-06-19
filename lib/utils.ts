import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge";
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { toast } from "sonner"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Table } from "@tanstack/react-table";

type DataSource<T> =
  | { type: "tanstack"; table: Table<T>; formatRow: (row: T) => Record<string, any> }
  | { type: "array"; data: T[]; formatRow?: (row: T) => Record<string, any> }
  | { type: "html"; tableElement: HTMLTableElement };

interface ExportOptions<T> {
  source: DataSource<T>;
  fileName?: string;
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export const isLocationMatch = (
  targetLocation: any,
  locationName: any
): boolean => {
  return (
    locationName === targetLocation ||
    locationName.startsWith(`${targetLocation}/`)
  );
};

export const isLocationMatch2 = (
  targetLocation: string,
  currentPath: string
): boolean => {
  // Normaliser les chemins en supprimant les slashs initiaux/finaux
  const normalizePath = (path: string) => path.replace(/^\/|\/$/g, '');
  const normalizedTarget = normalizePath(targetLocation);
  const normalizedCurrent = normalizePath(currentPath);

  // Cas 1: Correspondance exacte
  if (normalizedCurrent === normalizedTarget) {
    return true;
  }

  // Cas 2: La cible est un préfixe du chemin actuel (sous-route)
  if (normalizedCurrent.startsWith(`${normalizedTarget}/`)) {
    return true;
  }

  // Cas 3: Gestion des routes dynamiques (ex: /eleves/[id])
  const targetSegments = normalizedTarget.split('/');
  const currentSegments = normalizedCurrent.split('/');

  // Si les segments ont des longueurs différentes, pas de correspondance
  if (targetSegments.length !== currentSegments.length) {
    return false;
  }

  // Vérifier chaque segment
  for (let i = 0; i < targetSegments.length; i++) {
    const targetSeg = targetSegments[i];
    const currentSeg = currentSegments[i];

    // Si le segment cible est dynamique (entre crochets)
    if (targetSeg.startsWith('[') && targetSeg.endsWith(']')) {
      continue; // On ignore les segments dynamiques
    }

    if (targetSeg !== currentSeg) {
      return false;
    }
  }

  return true;
};


export const RGBToHex = (r: number, g: number, b: number): string => {
  const componentToHex = (c: number): string => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const redHex: string = componentToHex(r);
  const greenHex: string = componentToHex(g);
  const blueHex: string = componentToHex(b);

  return "#" + redHex + greenHex + blueHex;
};

export function hslToHex(hsl: string): string {
  // Remove "hsla(" and ")" from the HSL string
  let hslValues = hsl.replace("hsla(", "").replace(")", "");

  // Split the HSL string into an array of H, S, and L values
  const [h, s, l] = hslValues.split(" ").map((value) => {
    if (value.endsWith("%")) {
      // Remove the "%" sign and parse as a float
      return parseFloat(value.slice(0, -1));
    } else {
      // Parse as an integer
      return parseInt(value);
    }
  });

  // Function to convert HSL to RGB
  function hslToRgb(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    // Convert RGB values to integers
    const rInt = Math.round(r * 255);
    const gInt = Math.round(g * 255);
    const bInt = Math.round(b * 255);

    // Convert RGB values to a hex color code
    const rgbToHex = (value: number): string => {
      const hex = value.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${rgbToHex(rInt)}${rgbToHex(gInt)}${rgbToHex(bInt)}`;
  }

  // Call the hslToRgb function and return the hex color code
  return hslToRgb(h, s, l);
}


export const hexToRGB = (hex: string, alpha?: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const formatTime = (time: number | Date | string): string => {
  if (!time) return "";

  const date = new Date(time);
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formattedTime;
};

// object check
export function isObjectNotEmpty(obj: any): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return Object.keys(obj).length > 0;
}

export const formatDate = (date: string | number | Date): string => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
};



// random word
export function getWords(inputString: string): string {
  // Remove spaces from the input string
  const stringWithoutSpaces = inputString.replace(/\s/g, "");

  // Extract the first three characters
  return stringWithoutSpaces.substring(0, 3);
}


// for path name
export function getDynamicPath(pathname: any): any {
  const prefixes = ["en", "fr", "ar"];

  for (const prefix of prefixes) {
    if (pathname.startsWith(`/${prefix}/`)) {
      return `/${pathname.slice(prefix.length + 2)}`;
    }
  }

  return pathname;
}

// translate

interface Translations {
  [key: string]: string;
}

export const translate = (title: string, trans: Translations): string => {
  const lowercaseTitle = title.toLowerCase();

  if (trans?.hasOwnProperty(lowercaseTitle)) {
    return trans[lowercaseTitle];
  }

  return title;
};


// utils/pdf-utils.ts


/**
 * Génère un PDF à partir d'un élément DOM
 * @param elementRef Ref d’un élément HTML à capturer (ex: useRef<HTMLDivElement>(...))
 * @param fileName Nom du fichier à télécharger (si mode "download")
 * @param mode "print" ou "download"
 */
export async function generatePDFfromRef(
  elementRef: React.RefObject<HTMLElement>,
  fileName: string,
  mode: "print" | "download"
): Promise<void> {
  if (!elementRef.current) return

  const toastId = toast.loading("Génération du PDF...")
  try {
    const canvas = await html2canvas(elementRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    })

    const pdf = new jsPDF("p", "mm", "a4")
    const imgData = canvas.toDataURL("image/png")
    const { width, height } = canvas
    const pdfWidth = 190
    const pdfHeight = (height * pdfWidth) / width

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight)

    if (mode === "download") {
      pdf.save(`${fileName}.pdf`)
      toast.success("PDF téléchargé avec succès", { id: toastId })
    } else {
      const blob = pdf.output("blob")
      const url = URL.createObjectURL(blob)
      const printWindow = window.open(url, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          toast.success("Impression prête", { id: toastId })
        }
      } else {
        toast.error("Impossible d'ouvrir la fenêtre d'impression", { id: toastId })
      }
    }
  } catch (error) {
    toast.error("Erreur lors de la génération du PDF", { id: toastId })
    console.error("PDF generation error:", error)
  }
}

// import { generatePDFfromRef } from "@/utils/pdf-utils"

// const handlePDF = async (mode: "download" | "print") => {
//   await generatePDFfromRef(printRef, `reçu_inscription_${student?.registration_number}`, mode)
// }


// <Button onClick={() => handlePDF("download")}>Télécharger</Button>
// <Button onClick={() => handlePDF("print")}>Imprimer</Button>







export function universalExportToExcel<T extends Record<string, any>>({
  source,
  fileName = "export.xlsx",
}: ExportOptions<T>) {
  try {
    toast.info("Génération du fichier Excel...");

    let data: Record<string, any>[] = [];

    if (source.type === "tanstack") {
      data = source.table
        .getFilteredRowModel()
        .rows.map((row) => source.formatRow(row.original));
    } else if (source.type === "array") {
      data = source.data.map((row) =>
        source.formatRow ? source.formatRow(row) : row
      );
    } else if (source.type === "html") {
      const worksheet = XLSX.utils.table_to_sheet(source.tableElement);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Feuille1");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, fileName);
      toast.success(`Export réussi : ${fileName}`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);

    const colWidths = data.reduce((widths: Array<{ wch: number }>, row) => {
      Object.values(row).forEach((val, i) => {
        const length = val ? String(val).length : 0;
        widths[i] = {
          wch: Math.min(Math.max(length, 10), 50),
        };
      });
      return widths;
    }, []);

    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feuille1");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, fileName);
    toast.success(`Export réussi : ${fileName}`);
  } catch (error) {
    console.error("Erreur lors de l'export Excel :", error);
    toast.error("Erreur lors de l'export du fichier Excel");
  }
}


// EXEMPLE D'UTILISATION

// universalExportToExcel({
//   source: {
//     type: "tanstack",
//     table,
//     formatRow: (row) => ({
//       Nom: row.student.name,
//       Prénom: row.student.first_name,
//       Matricule: row.student.registration_number,
//     }),
//   },
//   fileName: "élèves.xlsx",
// });

// Avec un tableau d’objets

// const data = [
//   { nom: "Jean", age: 25 },
//   { nom: "Fatou", age: 22 },
// ];

// universalExportToExcel({
//   source: {
//     type: "array",
//     data,
//   },
//   fileName: "personnes.xlsx",
// });

// const tableElement = document.getElementById("maTable") as HTMLTableElement;

// universalExportToExcel({
//   source: {
//     type: "html",
//     tableElement,
//   },
//   fileName: "tableau-html.xlsx",
// });
