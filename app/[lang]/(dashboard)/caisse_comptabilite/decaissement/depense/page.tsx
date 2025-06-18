"use client";

import React, { useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import TableExpense from "./table";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  fetchValidationExpenses, 
  fetchExpenses, 
  fetchDemands 
} from "@/store/schoolservice";
import { toast } from "react-hot-toast";
import Loading from "./loading";

function ExpensePage() {
  const {
    expenses,
    validationExpenses,
    demands,
    userOnline,
    setValidationExpenses,
    setExpenses,
    setDemands,
  } = useSchoolStore();

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Mémoïsation des permissions pour éviter des recalculs inutiles
  const hasAdminAccessVoir = React.useMemo(() => (
    verificationPermission(
      { permissionNames: userOnline?.permissionNames || [] },
      ["voir depenses"]
    )
  ), [userOnline?.permissionNames]);

  // Chargement des données avec gestion d'erreur centralisée
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [fetchedExpenses, fetchedValidationExpenses, fetchedDemands] = 
        await Promise.all([
          fetchExpenses(),
          fetchValidationExpenses(),
          fetchDemands()
        ]);

      setExpenses(fetchedExpenses);
      setValidationExpenses(fetchedValidationExpenses);
      setDemands(fetchedDemands);
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
      setError("Échec du chargement des données. Veuillez réessayer.");
      // toast.error("Impossible de charger les données des dépenses");
    } finally {
      setIsLoading(false);
    }
  }, [setExpenses, setValidationExpenses, setDemands]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Affichage conditionnel
  if (!hasAdminAccessVoir) {
    return (
      <Card className="w-full h-full flex items-center justify-center min-h-[400px]">
        <ErrorPage />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error}</p>
        <Button 
          color="indigodye"
          onClick={loadData}
          className="px-4 py-2 rounded "
        >
          Réessayer
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TableExpense 
        expenses={expenses} 
        validations={validationExpenses} 
        demands={demands} 
        onRefresh={loadData}
      />
    </div>
  );
}

export default React.memo(ExpensePage);