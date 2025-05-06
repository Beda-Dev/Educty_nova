"use client";

import React from "react";
import { useSchoolStore } from "@/store";
import TableExpense from "./table";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";

function ExpensePage() {
  const { expenses, userOnline } = useSchoolStore();
  const permissionRequisVoir = ["voir depenses"];
  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );
  if (!hasAdminAccessVoir) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <ErrorPage />
      </Card>
    );
  }
  return <TableExpense expenses={expenses} />;
}

export default ExpensePage;
