import {
  AcademicYear,
  Registration,
  Pricing,
  Student,
  Installment,
  Payment,
} from "@/lib/interface";

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

