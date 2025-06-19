"use client";

import { useState, useEffect } from "react";
import React from "react";
import FeeTable from "./simple-table";
import Card from "@/components/ui/card-snippet";
import DialogForm from "./modal_form";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { fetchpricing } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { Pricing } from "@/lib/interface";

export default function PricingPage() {
  const { pricing, userOnline, setPricing } = useSchoolStore();
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const router = useRouter();

  // Fonction pour gérer le succès du composant enfant
  const handleSuccess = (success: boolean) => {
    setIsSuccessful(success);
    if (success) {
      refreshPricingData();
    }
  };

  // Récupère les données de tarification mises à jour
  const refreshPricingData = async () => {
    try {
      const updatedPricing = await fetchpricing();
      if (updatedPricing) {
        setPricing(updatedPricing);
      }
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la récupération des tarifs :", error);
    }
  };

  // Vérification des permissions
  const permissionRequisVoir = ["voir frais_Scolaires"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  // Affichage des erreurs si l'utilisateur n'a pas accès
  // if (hasAdminAccessVoir === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  return <FeeTable data={pricing} />;
}
