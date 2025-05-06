"use client";

import { useState, useEffect } from "react";
import React from "react";
import ClassTable from "./simple-table";
import Card from "@/components/ui/card-snippet";
import DialogForm from "./modal_form";
import { useSchoolStore } from "@/store";
import { Classe } from "@/lib/interface";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

export default function ClassPage() {
  const [dataclasses, setDataClasses] = useState<Classe[]>([]);
  const { classes, userOnline } = useSchoolStore();

  const permissionRequisVoir = ["voir classe"];
  const permissionRequisCreer = ["creer classe"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
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
    <Card>
      {hasAdminAccessCreer ? (
        <div className="flex flex-wrap items-center gap-4 mb-1">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-default-700 mb-2">
              Classes
            </h3>
          </div>
          <div className="flex-none">
            <DialogForm />
          </div>
        </div>
      ) : null}

      <ClassTable data={dataclasses} />
    </Card>
  );
}
