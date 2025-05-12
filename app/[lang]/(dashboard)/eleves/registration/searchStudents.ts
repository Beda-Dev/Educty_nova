import { Registration } from "@/lib/interface";

export function getLastMatchingRegistration(
  matricule: string,
  registrations: Registration[]
): Registration | null {
  const matchingRegistrations = registrations.filter(
    (reg) => reg.student?.registration_number === matricule
  );

  if (matchingRegistrations.length === 0) {
    return null;
  }

  return matchingRegistrations[matchingRegistrations.length - 1]; // Retourne le dernier élément
}
