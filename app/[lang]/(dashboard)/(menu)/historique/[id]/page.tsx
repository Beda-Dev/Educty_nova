"use client";
import { useState, useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import { Registration, Pricing } from "@/lib/interface";
import RegistrationFinal from "./detail_registration";
import { findRegistrationById, getTarificationData } from "./fonction";

interface Props {
  params: {
    id: string;
  };
}

const Registrationview = ({ params }: Props) => {
  const { id } = params;
  const { registrations, pricing } = useSchoolStore();
  const [data, setData] = useState<Registration | null>(null);
  const [feeData, setFeeData] = useState<{ fees: { label: string; amount: number }[]; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Trouver l'inscription correspondante
      const registration = findRegistrationById(Number(id), registrations);
      if (!registration) {
        throw new Error("Inscription non trouvée");
      }

      // Récupérer les données de tarification
      const fees = getTarificationData(
        pricing,
        registration.classe.level_id,
        registration.student.assignment_type_id,
        registration.academic_year_id
      );

      // Mettre à jour les états
      setData(registration);
      setFeeData(fees);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  }, [id, registrations, pricing]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Affichage en fonction de l'état
  if (isLoading) {
    return <div>Chargement en cours...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  if (!data || !feeData) {
    return <div>Aucune donnée disponible</div>;
  }

  return <RegistrationFinal registration={data} finance={feeData} />;
};

export default Registrationview;