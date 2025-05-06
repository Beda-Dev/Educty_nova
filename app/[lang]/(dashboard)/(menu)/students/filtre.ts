import { AcademicYear , Registration , Student , RegistrationMerge } from '@/lib/interface';

export function filterRegistrationsByCurrentAcademicYear(
    academicYears: AcademicYear,
    registrations: RegistrationMerge[]
  ): RegistrationMerge[] {
 
    return registrations.filter(
      (registration) => registration.academic_year.id === academicYears.id
    );
  }
  
  
  //Cette fonction récupère l’image et la convertit en blob, puis génère un objet URL :
 export const fetchImageAsBlob = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Erreur lors de la récupération de l'image");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Erreur lors de la conversion de l'image :", error);
    return ""; // Retourne une URL vide si erreur
  }
};

//Pour fusionner les données de registrations avec les données correspondantes de students
export function mergeRegistrationsWithStudents(registrations: Registration[], students: Student[]): Registration[] | RegistrationMerge[] {
  return registrations.map(registration => {
    const student = students.find(student => student.id === registration.student_id);
    if (student) {
      return {
        ...registration,
        student: {
          ...registration.student,
          ...student
        }
      };
    }
    return registration;
  });
}
  