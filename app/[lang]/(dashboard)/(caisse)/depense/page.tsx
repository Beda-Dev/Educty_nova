"use client";

import React, { useEffect, useRef } from "react";
import { useSchoolStore } from "@/store";
import TableExpense from "./table";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";
import { fetchValidationExpenses, fetchExpenses } from "@/store/schoolservice";

function ExpensePage() {
  const {
    expenses,
    validationExpenses,
    userOnline,
    setValidationExpenses,
    setExpenses,
  } = useSchoolStore();

  const permissionRequisVoir = ["voir depenses"];
  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  useEffect(() => {
    const initData = async () => {
      try {
        const fetchedExpenses = await fetchExpenses();
        setExpenses(fetchedExpenses);

        const fetchedValidationExpenses = await fetchValidationExpenses();
        console.log("Fetched validation expenses:", fetchedValidationExpenses);
        setValidationExpenses(fetchedValidationExpenses);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    initData();
  }, []);

  if (!hasAdminAccessVoir) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <ErrorPage />
      </Card>
    );
  }

  return <TableExpense expenses={expenses} validations={validationExpenses} />;
}

export default ExpensePage;
