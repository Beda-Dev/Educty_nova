import { Student , Registration , Installment ,Pricing , AcademicYear , Payment, Document } from '@/lib/interface';

export function findStudentByMatricule(matricule: string, Students: Student[]): Student | null {
  return Students.find(student => student.registration_number.trim() === matricule.trim() ) || null;
} 


export interface CompleteStudentOptions {
  students: Student[];
  registrations: Registration[];
  documents: Document[]; // Ensure this matches the imported Document type
  payments: Payment[];
}

export function getCompleteStudentData(
  student: Student,
  data: CompleteStudentOptions
): Student | undefined {
  const { students, registrations, documents, payments } = data;

  // On cherche l'étudiant complet dans la liste par son id
  const fullStudent = students.find((s) => s.id === student.id);
  if (!fullStudent) return undefined;

  // On filtre les documents, paiements et inscriptions associés
  const studentDocuments = documents.filter((d) => d.student_id === student.id);
  const studentPayments = payments.filter((p) => p.student_id === student.id);
  const studentRegistrations = registrations.filter((r) => r.student_id === student.id);

  return {
    ...fullStudent,
    documents: studentDocuments,
    payments: studentPayments,
    registrations: studentRegistrations,
  };
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
    pourcentageRecouvrement: number; // Nouveau champ
  };
  detailsFrais?: {
    typeFrais: string;
    montantDu: number;
    montantPaye: number;
    resteAPayer: number;
    pourcentageRecouvrement: number; // Nouveau champ
    echeanceIds: number[];
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
  // 1. Trouver l'étudiant
  const etudiant = etudiants.find((e) => e.registration_number === matricule);
  if (!etudiant) {
    console.error(`Aucun étudiant trouvé avec le matricule: ${matricule}`);
    return null;
  }

  // 2. Vérifier l'année académique
  const anneeAcademiqueCourante = anneesAcademiques;
  if (!anneeAcademiqueCourante) {
    console.error("Aucune année académique courante trouvée");
    return { informationsEtudiant: etudiant };
  }

  // 3. Trouver l'inscription
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
      resumePaiements: {
        montantTotalDu: 0,
        montantTotalPaye: 0,
        soldeRestant: 0,
        pourcentageRecouvrement: 0
      },
      detailsFrais: [],
    };
  }

  // 4. Trouver les tarifs applicables
  const tarifsApplicables = listeTarifs.filter(
    (tarif) =>
      tarif.assignment_type_id === etudiant.assignment_type_id &&
      tarif.academic_years_id === anneeAcademiqueCourante.id &&
      tarif.level_id === inscription?.classe?.level_id
  );

  // 5. Trouver les échéances
  const echeancesApplicables = echeances.filter(echeance =>
    tarifsApplicables.some(tarif => tarif.id === echeance.pricing_id)
  );

  // 6. Trouver les paiements
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
  
  // Nouveau : Calcul du pourcentage de recouvrement global
  const pourcentageRecouvrementGlobal = montantTotalDu > 0 
    ? Math.round((montantTotalPaye / montantTotalDu) * 100)
    : 0;

  // 8. Détails par type de frais avec pourcentage
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
    
    // Calcul du pourcentage par type de frais
    const pourcentageRecouvrement = montantDu > 0 
      ? Math.round((montantPaye / montantDu) * 100)
      : 0;
    
    return {
      typeFrais: tarif.fee_type.label,
      montantDu,
      montantPaye,
      resteAPayer: montantDu - montantPaye,
      pourcentageRecouvrement,
      echeanceIds: echeancesTarif.map(e => e.id)
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
      pourcentageRecouvrement: pourcentageRecouvrementGlobal
    },
    detailsFrais,
    detailsPaiements: paiementsEtudiant,
  };

  return donneesFusionnees;
}