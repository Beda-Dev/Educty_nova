import {
  AcademicYear,
  Registration,
  Pricing,
  Student,
  Installment,
  Payment,
} from "@/lib/interface";
import { toast } from 'react-hot-toast';

export function formatDateYMDHIS(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    ' ' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds())
  );
}

interface PaymentData {
  student_id: string;
  installment_id: string;
  cash_register_id: string;
  cashier_id: string;
  amount: string;
}

export async function postPayment(data: PaymentData): Promise<boolean> {
  // Vérification des champs obligatoires
  if (!data.student_id || !data.installment_id || !data.cash_register_id || !data.cashier_id || !data.amount) {
    toast.error('Tous les champs sont obligatoires');
    return false;
  }

  // Vérification que le montant est un nombre valide
  const amountNumber = parseFloat(data.amount);
  if (isNaN(amountNumber)) {
    toast.error('Le montant doit être un nombre valide');
    return false;
  }

  // Vérification que le montant est positif
  if (amountNumber <= 0) {
    toast.error('Le montant doit être supérieur à zéro');
    return false;
  }

  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(`Erreur lors de l'envoi: ${errorData.message || 'Erreur inconnue'}`);
      return false;
    }

    const result = await response.json();
    toast.success('Paiement enregistré avec succès!');
    return true;
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Une erreur réseau est survenue');
    return false;
  }
}

export interface DonneesEtudiantFusionnees {
  informationsEtudiant: Student;
  informationsInscription?: Registration;
  anneeAcademiqueCourante?: AcademicYear;
  informationsTarifs?: Pricing[];
  resumePaiements?: {
    montantTotalDu: number;
    montantTotalPaye: number;
    soldeRestant: number;
  };
  detailsFrais?: {
    typeFrais: string;
    montantDu: number;
    montantPaye: number;
    resteAPayer: number;
    echeanceIds: number[]; // Nouveau champ pour les IDs des échéances
  }[];
  detailsPaiements?: Payment[];
}

export function obtenirDonneesCompletesEtudiant(
  anneesAcademiques: AcademicYear,
  inscriptions: Registration[],
  listeTarifs: Pricing[],
  etudiants: Student[],
  echeances: Installment[],
  paiements: Payment[],
  matricule: string
): DonneesEtudiantFusionnees | null {
  // 1. Trouver l'étudiant dans la liste des étudiants
  const etudiant = etudiants.find((e) => e.registration_number === matricule);

  if (!etudiant) {
    console.error(`Aucun étudiant trouvé avec le matricule: ${matricule}`);
    return null;
  }

  // 2. Trouver l'année académique active et courante
  const anneeAcademiqueCourante = anneesAcademiques;

  if (!anneeAcademiqueCourante) {
    console.error("Aucune année académique courante trouvée");
    return { informationsEtudiant: etudiant };
  }

  // 3. Trouver l'inscription de l'étudiant pour l'année académique courante
  const inscription = inscriptions.find(
    (ins) =>
      ins.student_id === etudiant.id &&
      ins.academic_year_id === anneeAcademiqueCourante.id
  );

  if (!inscription) {
    console.error("Erreur : L'étudiant n'est pas inscrit cette année.");
    return {
      informationsEtudiant: etudiant,
      anneeAcademiqueCourante,
      resumePaiements: { montantTotalDu: 0, montantTotalPaye: 0, soldeRestant: 0 },
      detailsFrais: [],
    };
  }

  // 4. Trouver les tarifs applicables pour le type d'affectation de l'étudiant
  const tarifsApplicables = listeTarifs.filter(
    (tarif) =>
      tarif.assignment_type_id === etudiant.assignment_type_id &&
      tarif.academic_years_id === anneeAcademiqueCourante.id &&
      tarif.level_id === inscription?.classe?.level_id
  );

  // 5. Trouver les échéances correspondant aux tarifs applicables
  const echeancesApplicables = echeances.filter(echeance =>
    tarifsApplicables.some(tarif => tarif.id === echeance.pricing_id)
  );

  // 6. Trouver les paiements de l'étudiant pour ces échéances
  const paiementsEtudiant = paiements.filter(paiement =>
    paiement.student_id === etudiant.id &&
    echeancesApplicables.some(echeance => echeance.id === paiement.installment_id)
  );

  // 7. Calcul des sommes
  const montantTotalDu = echeancesApplicables.reduce(
    (somme, echeance) => somme + parseFloat(echeance.amount_due),
    0
  );

  const montantTotalPaye = paiementsEtudiant.reduce(
    (somme, paiement) => somme + parseFloat(paiement.amount),
    0
  );

  const soldeRestant = montantTotalDu - montantTotalPaye;

  // 8. Détails par type de frais avec les IDs des échéances
  const detailsFrais = tarifsApplicables.map(tarif => {
    const echeancesTarif = echeancesApplicables.filter(
      echeance => echeance.pricing_id === tarif.id
    );

    const montantDu = echeancesTarif.reduce(
      (somme, echeance) => somme + parseFloat(echeance.amount_due),
      0
    );

    const paiementsTarif = paiementsEtudiant.filter(paiement =>
      echeancesTarif.some(echeance => echeance.id === paiement.installment_id)
    );

    const montantPaye = paiementsTarif.reduce(
      (somme, paiement) => somme + parseFloat(paiement.amount),
      0
    );

    return {
      typeFrais: tarif.fee_type.label,
      montantDu,
      montantPaye,
      resteAPayer: montantDu - montantPaye,
      echeanceIds: echeancesTarif.map(e => e.id) // Ajout des IDs des échéances
    };
  });

  // 9. Fusionner les données
  const donneesFusionnees: DonneesEtudiantFusionnees = {
    informationsEtudiant: etudiant,
    ...(inscription && { informationsInscription: inscription }),
    anneeAcademiqueCourante,
    ...(tarifsApplicables.length > 0 && { informationsTarifs: tarifsApplicables }),
    resumePaiements: {
      montantTotalDu,
      montantTotalPaye,
      soldeRestant,
    },
    detailsFrais,
    detailsPaiements: paiementsEtudiant,
  };

  return donneesFusionnees;
}

interface TarificationResult {
  fees: { label: string; amount: number }[];
  total: number;
}

export const getTarificationData = (
  tarifications: Pricing[],
  level_id: number,
  assignmenttype_id: number,
  academicyear_id: number
): TarificationResult => {
  // Filtrer les tarifications selon les paramètres donnés
  const filteredTarifications = tarifications.filter(
    (tarif) =>
      tarif.level_id === level_id &&
      tarif.assignment_type_id === assignmenttype_id &&
      tarif.academic_years_id === academicyear_id
  );

  // Transformer les données au format requis
  const fees = filteredTarifications.map((tarif) => ({
    label: tarif.fee_type.label,
    amount: Number(tarif.amount),
  }));

  // Calculer le total
  const total = fees.reduce((acc, fee) => acc + fee.amount, 0);

  return { fees, total };
};

export default getTarificationData;

export const formatAmount = (amount: number | string): string => {
  try {
    const num = typeof amount === 'string'
      ? parseFloat(amount.replace(/\s/g, ''))
      : amount
    return isNaN(num) ? '0' : num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  } catch {
    return '0'
  }
}