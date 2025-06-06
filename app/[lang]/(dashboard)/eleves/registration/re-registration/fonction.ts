import {Classe , AcademicYear , Student } from '@/lib/interface'

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

export function formatFileSize(bytes: number): string {
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  if (bytes === 0) return '0 octet';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(1)} ${sizes[i]}`;
}
