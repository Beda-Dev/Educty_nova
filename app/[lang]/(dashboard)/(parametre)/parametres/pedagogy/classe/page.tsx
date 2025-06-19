"use client";

import { useState, useEffect } from "react";
import React from "react";
import ClassTable from "./simple-table";
import Card from "@/components/ui/card-snippet";

import { useSchoolStore } from "@/store";
import { Classe } from "@/lib/interface";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

export default function ClassPage() {
  const [dataclasses, setDataClasses] = useState<Classe[]>([]);
  const { classes, userOnline } = useSchoolStore();

  const permissionRequisVoir = ["voir classe"];
  

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );



  useEffect(() => {
    setDataClasses(classes);
  }, [classes]);

  if (hasAdminAccessVoir === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (


      <ClassTable data={dataclasses} />
  
  );
}
