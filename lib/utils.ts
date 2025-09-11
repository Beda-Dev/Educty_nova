import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge";
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { toast } from "sonner"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Table } from "@tanstack/react-table";
import { Registration , AcademicYear  , Classe  , User , Role, Permission , CashRegisterSession , Student} from "./interface";


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

/**
 * Fonction utilitaire pour traduire un titre à partir d'un dictionnaire de traductions.
 * 
 * @param title - Le texte à traduire (ex: "Dashboard")
 * @param trans - Un objet contenant les traductions, où chaque clé est en minuscules (ex: { "dashboard": "Tableau de bord" })
 * @returns La traduction si elle existe, sinon le texte original.
 * 
 * Fonctionnement :
 * - Met le titre en minuscules pour assurer la correspondance avec les clés du dictionnaire.
 * - Si la clé existe dans l'objet de traduction, retourne la traduction.
 * - Sinon, retourne le texte original.
 */
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
// export async function generatePDFfromRef(
//   elementRef: React.RefObject<HTMLElement>,
//   fileName: string,
//   mode: "print" | "download"
// ): Promise<void> {
//   if (!elementRef.current) return

//   const toastId = toast.loading("Génération du PDF...")
//   try {
//     const canvas = await html2canvas(elementRef.current, {
//       scale: 2,
//       useCORS: true,
//       backgroundColor: "#ffffff",
//     })

//     const pdf = new jsPDF("p", "mm", "a4" , true)
//     const imgData = canvas.toDataURL("image/png")
//     const { width, height } = canvas
//     const pdfWidth = 190
//     const pdfHeight = (height * pdfWidth) / width

//     pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight)

//     if (mode === "download") {
//       pdf.save(`${fileName}.pdf`)
//       toast.success("PDF téléchargé avec succès", { id: toastId })
//     } else {
//       const blob = pdf.output("blob")
//       const url = URL.createObjectURL(blob)
//       const printWindow = window.open(url, "_blank")
//       if (printWindow) {
//         printWindow.onload = () => {
//           printWindow.print()
//           toast.success("Impression prête", { id: toastId })
//         }
//       } else {
//         toast.error("Impossible d'ouvrir la fenêtre d'impression", { id: toastId })
//       }
//     }
//   } catch (error) {
//     toast.error("Erreur lors de la génération du PDF", { id: toastId })
//     console.error("PDF generation error:", error)
//   }
// }

// import { generatePDFfromRef } from "@/utils/pdf-utils"

// const handlePDF = async (mode: "download" | "print") => {
//   await generatePDFfromRef(printRef, `reçu_inscription_${student?.registration_number}`, mode)
// }


// <Button onClick={() => handlePDF("download")}>Télécharger</Button>
// <Button onClick={() => handlePDF("print")}>Imprimer</Button>


/**
 * Convertit une image distante en base64
 */
async function convertImageToBase64(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    // Configuration CORS
    img.crossOrigin = 'anonymous'
    
    img.onload = function() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      
      ctx.drawImage(img, 0, 0)
      
      try {
        const base64 = canvas.toDataURL('image/png')
        resolve(base64)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = function() {
      // Si l'image ne charge pas, utiliser une image placeholder
      const placeholderSvg = `
        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" fill="#f0f0f0"/>
          <text x="40" y="45" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">Image</text>
        </svg>
      `
      const base64Placeholder = 'data:image/svg+xml;base64,' + btoa(placeholderSvg)
      resolve(base64Placeholder)
    }
    
    img.src = imageUrl
  })
}

/**
 * Prépare toutes les images d'un élément pour le PDF
 */
async function prepareImagesForPDF(element: HTMLElement): Promise<HTMLElement> {
  // Cloner l'élément pour ne pas modifier l'original
  const clonedElement = element.cloneNode(true) as HTMLElement
  const images = clonedElement.querySelectorAll('img')
  
  // Traiter chaque image
  const imagePromises = Array.from(images).map(async (img) => {
    const originalSrc = img.src
    
    if (originalSrc && !originalSrc.startsWith('data:')) {
      try {
        const base64Image = await convertImageToBase64(originalSrc)
        img.src = base64Image
      } catch (error) {
        console.warn('Failed to convert image:', originalSrc, error)
        // L'image d'erreur sera déjà définie par la fonction convertImageToBase64
      }
    }
  })
  
  await Promise.all(imagePromises)
  return clonedElement
}

/**
 * Version améliorée de la génération PDF
 */
export async function generatePDFfromRef(
  elementRef: React.RefObject<HTMLElement>,
  fileName: string,
  mode: "print" | "download"
): Promise<void> {
  if (!elementRef.current) return
  
  const toastId = toast.loading("Préparation des images...")
  
  try {
    // Préparer les images
    const preparedElement = await prepareImagesForPDF(elementRef.current)
    
    // Ajouter temporairement l'élément préparé au DOM (invisible)
    preparedElement.style.position = 'fixed'
    preparedElement.style.top = '-9999px'
    preparedElement.style.left = '-9999px'
    preparedElement.style.width = elementRef.current.offsetWidth + 'px'
    preparedElement.style.zIndex = '-1'
    document.body.appendChild(preparedElement)
    
    toast.loading("Génération du PDF...", { id: toastId })
    
    try {
      const canvas = await html2canvas(preparedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0, // Pas de timeout car les images sont déjà en base64
        removeContainer: true
      })
      
      const pdf = new jsPDF("p", "mm", "a4", true)
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
            URL.revokeObjectURL(url) // Libérer la mémoire
          }
        } else {
          toast.error("Impossible d'ouvrir la fenêtre d'impression", { id: toastId })
        }
      }
    } finally {
      // Nettoyer l'élément temporaire
      document.body.removeChild(preparedElement)
    }
  } catch (error) {
    toast.error("Erreur lors de la génération du PDF", { id: toastId })
    console.error("PDF generation error:", error)
  }
}





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


export async function checkAndBlockSessions(
  sessions: CashRegisterSession[],
  session_closure_time?: string | null
): Promise<void> {
  if (!session_closure_time) return;

  // Vérification format HH:mm strict
  const closureMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(session_closure_time);
  if (!closureMatch) {
    console.error("Format de session_closure_time invalide (attendu HH:mm).");
    return;
  }

  const [hours, minutes] = closureMatch.slice(1).map(Number);
  const now = new Date();

  // On construit la date/heure limite avec la date du jour courant
  const closureDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  for (const session of sessions) {
    if (session.status !== "open") continue;

    // Si la session est déjà bloquée, on ignore
    if (session.is_blocked === 1) continue;

    // Vérif stricte de la date d'ouverture
    const opening = new Date(session.opening_date.replace(" ", "T"));
    if (isNaN(opening.getTime())) {
      console.warn(`Date d'ouverture invalide pour la session ${session.id}`);
      continue;
    }

    // Condition : heure actuelle > heure limite
    if (now > closureDate) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cashRegisterSession/${session.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_blocked: 1 }),
        });

        if (!response.ok) {
          console.error(`Échec du blocage de la session ${session.id}`);
          continue;
        }

        console.log(`Session ${session.id} bloquée (is_blocked=1).`);
      } catch (error) {
        console.error(`Erreur réseau pour la session ${session.id}:`, error);
      }
    }
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
