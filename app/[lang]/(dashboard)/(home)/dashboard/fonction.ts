import {
  AcademicYear,
  Registration,
  Pricing,
  Student,
  Installment,
  Payment,
} from "@/lib/interface";
import { saveAs } from "file-saver";

export interface DonneesClasseRecouvrement {
  classeId: number;
  classeLabel: string;
  tauxRecouvrementParFrais: {
    typeFrais: string;
    montantTotalDu: number;
    montantTotalPaye: number;
    tauxRecouvrement: number;
  }[];
}

export function calculerRecouvrementParClasse(
  anneesAcademiques: AcademicYear,
  inscriptions: Registration[],
  listeTarifs: Pricing[],
  etudiants: Student[],
  echeances: Installment[],
  paiements: Payment[]
): DonneesClasseRecouvrement[] {
  try {
    const classes = inscriptions.reduce((acc, inscription) => {
      const { classe } = inscription;
      if (!classe || typeof classe.id !== "number") return acc;

      if (!acc[classe.id]) {
        acc[classe.id] = { classe, inscriptions: [] };
      }
      acc[classe.id].inscriptions.push(inscription);
      return acc;
    }, {} as Record<number, { classe: any; inscriptions: Registration[] }>);

    return Object.values(classes).map(({ classe, inscriptions }) => {
      const etudiantsClasse = etudiants.filter((etudiant) =>
        inscriptions.some((inscription) => inscription.student_id === etudiant.id)
      );

      const tarifsApplicables = listeTarifs.filter(
        (tarif) =>
          tarif.academic_years_id === anneesAcademiques.id &&
          tarif.level_id === classe.level_id
      );

      const echeancesApplicables = echeances.filter((echeance) =>
        tarifsApplicables.some((tarif) => tarif.id === echeance.pricing_id)
      );

      const paiementsClasse = paiements.filter((paiement) =>
        etudiantsClasse.some((etudiant) => etudiant.id === paiement.student_id)
      );

      const tauxRecouvrementParFrais = tarifsApplicables.map((tarif) => {
        const echeancesTarif = echeancesApplicables.filter(
          (echeance) => echeance.pricing_id === tarif.id
        );

        const montantTotalDu = echeancesTarif.reduce((somme, echeance) => {
          const montant = parseFloat(echeance.amount_due);
          return somme + (isNaN(montant) ? 0 : montant);
        }, 0);

        const montantTotalPaye = paiementsClasse
          .filter((paiement) =>
            echeancesTarif.some((echeance) => echeance.id === paiement.installment_id)
          )
          .reduce((somme, paiement) => {
            const montant = parseFloat(paiement.amount);
            return somme + (isNaN(montant) ? 0 : montant);
          }, 0);

        const taux =
          montantTotalDu > 0 ? (montantTotalPaye / montantTotalDu) * 100 : 0;

        return {
          typeFrais: tarif?.fee_type?.label ?? "Inconnu",
          montantTotalDu,
          montantTotalPaye,
          tauxRecouvrement: parseFloat(taux.toFixed(2)),
        };
      });

      return {
        classeId: classe.id,
        classeLabel: classe.label ?? "Classe sans nom",
        tauxRecouvrementParFrais,
      };
    });
  } catch (error) {
    console.error("Erreur dans calculerRecouvrementParClasse:", error);
    return [];
  }
}

// utils/downloadFile.ts
export async function downloadFile(url: string, filename?: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Ajoute ici les headers nécessaires (ex : Auth)
        // Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Échec du téléchargement");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename ?? "download";
    document.body.appendChild(link);
    link.click();

    // Nettoyage
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Erreur de téléchargement :", error);
  }
}

export async function downloadFile1(url: string, filename: string) {

  const response = await fetch(url);
  const blob = await response.blob();
  saveAs(blob, filename);
}

export const downloadFile3: (fileUrl: string) => Promise<void> = async (fileUrl: string) => {
  const response = await fetch(`/api/downloadFile?url=${encodeURIComponent(fileUrl)}`);
  const blob = await response.blob();
  
  // Créer un lien de téléchargement
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileUrl.split('/').pop() || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};



