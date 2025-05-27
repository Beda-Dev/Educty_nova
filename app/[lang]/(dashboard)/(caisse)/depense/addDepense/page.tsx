"use client";

import React, { useEffect, useRef } from "react";
import { useSchoolStore } from "@/store";
import CreateExpensePage from "./formDepenses";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";
import { fetchValidationExpenses, fetchExpenses } from "@/store/schoolservice";

function ExpensePage() {
  const { userOnline, setValidationExpenses, setExpenses } = useSchoolStore();

  const permissionRequisVoir = ["voir depenses"];
  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const initData = async () => {
    return
    try {
      const fetchedExpenses = await fetchExpenses();
      setExpenses(fetchedExpenses);
      const fetchedValidationExpenses = await fetchValidationExpenses();
      setValidationExpenses(fetchedValidationExpenses);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    }
  };

  // if (!hasAdminAccessVoir) {
  //   return (
  //     <Card className="w-full h-full flex items-center justify-center">
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  return <CreateExpensePage onSuccess={initData} />;
}

export default ExpensePage;
