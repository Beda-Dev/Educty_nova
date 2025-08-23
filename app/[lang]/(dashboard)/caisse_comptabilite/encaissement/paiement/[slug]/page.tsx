"use client";
import { useState, useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import { Registration, Pricing, Student, AcademicYear, Installment, Payment } from "@/lib/interface";
import RegistrationFinal from "./detail_registration";
import { obtenirDonneesCompletesEtudiant  , DonneesEtudiantFusionnees} from "../fonction";
import { Button } from "@/components/ui/button";
interface Props {
  params: {
    slug: string;
  };
}

const DetailPaymentPage = ({ params }: Props) => {
  const { slug } = params;
  const { 
    registrations, 
    pricing,
    students,
    academicYears,
    installements,
    payments,
    userOnline,
    academicYearCurrent
  } = useSchoolStore();
  
  const [studentData, setStudentData] = useState<DonneesEtudiantFusionnees | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données complètes
  const loadData = useCallback(async () => {
    // console.log("Chargement des données pour le matricule:", slug);
    try {
      setIsLoading(true);
      setError(null);

      // Obtenir les données fusionnées
      const completeData = obtenirDonneesCompletesEtudiant(
        academicYearCurrent,
        registrations,
        pricing,
        students,
        installements,
        payments,
        slug
      );

      if (!completeData) {
        throw new Error("Impossible de générer les données financières");
      }

      setStudentData(completeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
      console.error("Erreur de chargement:", err);
    } finally {
      setIsLoading(false);
    }
  }, [slug, registrations, students, pricing, academicYears, installements, payments]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Affichage des états
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p className="font-bold">Erreur</p>
        <p>{error}</p>
        <Button 
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (!studentData || !studentData.informationsInscription) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
        Aucune donnée financière disponible pour cette inscription
      </div>
    );
  }

  return (
    <RegistrationFinal 
      registration={studentData.informationsInscription} 
      studentData={studentData} 
    />
  );
};

export default DetailPaymentPage;