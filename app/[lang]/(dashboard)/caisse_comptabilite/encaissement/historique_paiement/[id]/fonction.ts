import {Classe , AcademicYear , Student , Pricing , Registration , Payment , Installment } from '@/lib/interface'

export function TrieDeClasse(levelId: number, classes: Classe[]): Classe[] {
    return classes.filter((classe) => classe.level_id === levelId);
}

export function findCurrentAcademicYear(data : AcademicYear[]):AcademicYear{
    const currentYear = data.find(item => item.active === 1 && item.isCurrent === 1);
    if (!currentYear) {
        throw new Error('Current academic year not found');
    }
    return currentYear;
  }

export function findStudentById(id: number, Students: Student[]): Student | null {
    return Students.find(student => Number(student.id) === Number(id) ) || null;
  }

export function findRegistrationById(id: number, Registrations: Registration[]): Registration | null {
    return Registrations.find(register => Number(register.id) === Number(id) ) || null;
  }  

  export interface DetailsPaiement {
    anneeAcademique: AcademicYear;
    typeFrais: string;
    montantPaye: number;
    soldeRestantAvantPaiement: number;
    soldeRestantApresPaiement: number; // Nouveau champ ajouté
  }

  export function obtenirDetailsPaiement(
    paymentId: number,
    paiements: Payment[],
    etudiants: Student[],
    inscriptions: Registration[],
    listeTarifs: Pricing[],
    echeances: Installment[],
    anneesAcademiques: AcademicYear[]
  ): DetailsPaiement | null {
    // Trouver le paiement correspondant
    const paiement = paiements.find((p) => p.id === paymentId);
    if (!paiement) {
      console.error(`Aucun paiement trouvé avec l'ID: ${paymentId}`);
      return null;
    }
  
    // Trouver l'étudiant associé au paiement
    const etudiant = etudiants.find((e) => e.id === paiement.student_id);
    if (!etudiant) {
      console.error("Aucun étudiant trouvé pour ce paiement");
      return null;
    }
  
    // Trouver l'échéance correspondant au paiement
    const echeance = echeances.find((e) => e.id === paiement.installment_id);
    if (!echeance) {
      console.error("Aucune échéance trouvée pour ce paiement");
      return null;
    }
  
    // Trouver le tarif associé à cette échéance
    const tarif = listeTarifs.find((t) => t.id === echeance.pricing_id);
    if (!tarif) {
      console.error("Aucun tarif trouvé pour cette échéance");
      return null;
    }
  
    // Trouver l'année académique correspondant au tarif
    const anneeAcademique = anneesAcademiques.find(
      (annee) => annee.id === tarif.academic_years_id
    );
    if (!anneeAcademique) {
      console.error("Aucune année académique trouvée pour ce tarif");
      return null;
    }
  
    // Convertir les dates en objets Date pour une comparaison correcte
    const datePaiement = new Date(paiement.created_at);
  
    // Filtrer les paiements antérieurs ou égaux (en ignorant les millisecondes)
    const paiementsAnterieurs = paiements.filter(
      (p) => 
        p.student_id === etudiant.id && 
        p.installment_id === echeance.id &&
        new Date(p.created_at).getTime() < datePaiement.getTime()
    );
  
    // Calcul du montant total payé avant ce paiement
    const montantTotalPayeAvant = paiementsAnterieurs.reduce(
      (somme, p) => somme + parseFloat(p.amount),
      0
    );
  
    // Calcul du montant total dû pour ce tarif
    const montantTotalDu = echeances
      .filter((e) => e.pricing_id === tarif.id)
      .reduce((somme, e) => somme + parseFloat(e.amount_due), 0);
  
    const soldeRestantAvantPaiement = montantTotalDu - montantTotalPayeAvant;
    const montantPayeActuel = parseFloat(paiement.amount);
    const soldeRestantApresPaiement = soldeRestantAvantPaiement - montantPayeActuel;
  
    return {
      anneeAcademique,
      typeFrais: tarif.fee_type.label,
      montantPaye: montantPayeActuel,
      soldeRestantAvantPaiement,
      soldeRestantApresPaiement, // Nouveau champ ajouté
    };
  }
  
  
export interface TarificationResult {
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
  