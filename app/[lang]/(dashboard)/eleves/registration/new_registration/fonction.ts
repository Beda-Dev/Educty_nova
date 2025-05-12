import {Classe , AcademicYear , Student , Pricing} from '@/lib/interface'

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
  