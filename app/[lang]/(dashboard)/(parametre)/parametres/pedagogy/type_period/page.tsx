"use client";

import { useState, useEffect } from "react";
import React from "react";
// Make sure the file exists as 'type_period_page.tsx' or 'type_period_page/index.tsx' in the same directory.
// If the file is actually named './type_period_page.tsx', update the import as follows:
import TypePeriodPage from "./typePeriodPage"
import { TypePeriod } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";
import { fetchTypePeriods } from "@/store/schoolservice";

const TypePeriodComponent = () => {
  const [data, setData] = useState<TypePeriod[]>([]);
  const { typePeriods, setTypePeriods, userOnline } = useSchoolStore();
  const permissionRequisVoir = ["voir type période"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  useEffect(() => {
    // Récupère les types de périodes depuis l'API et met à jour le store
    const fetchAndSetTypePeriods = async () => {
      const fetched = await fetchTypePeriods();
      setTypePeriods(fetched);
    };
    fetchAndSetTypePeriods();
  }, [setTypePeriods]);

  useEffect(() => {
    setData(typePeriods);
  }, [typePeriods]);

  // if (hasAdminAccessVoir === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  return <TypePeriodPage data={data} />;
};

export default TypePeriodComponent;
