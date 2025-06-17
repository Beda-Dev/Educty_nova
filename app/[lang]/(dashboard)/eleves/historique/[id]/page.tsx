"use client";
import { useState, useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import { Registration, Pricing, Payment, Setting } from "@/lib/interface";
import RegistrationFinal from "./detail_registration";
import { findRegistrationById } from "./fonction";

interface Props {
  params: {
    id: string;
  };
}

const Registrationview = ({ params }: Props) => {
  const { id } = params;
  const { registrations, pricing , payments , settings } = useSchoolStore();
  const [data, setData] = useState<Registration | null>(null);
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

      // Mettre à jour les états
      setData(registration);
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

  if (!data || !payments || !settings) {
    return <div>Aucune donnée disponible</div>;
  }

  return <RegistrationFinal registration={data} payments={payments} settings={settings} />;
};

export default Registrationview;