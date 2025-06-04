"use client";

import React, { useEffect, useState } from "react";
import EvaluationTypeTable from "./type_evaluation";
import { useSchoolStore } from "@/store";
import { fetchTypeEvaluations } from "@/store/schoolservice";
import { Skeleton } from "@/components/ui/skeleton";

function Page() {
  const { typeEvaluations, setTypeEvaluations } = useSchoolStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const updatedTypeEvaluation = await fetchTypeEvaluations();
        setTypeEvaluations(updatedTypeEvaluation);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setTypeEvaluations]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <EvaluationTypeTable />;
}

export default Page;