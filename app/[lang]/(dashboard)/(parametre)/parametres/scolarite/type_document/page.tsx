"use client";

import { useState, useEffect } from "react";
import React from "react";
import DocumentTypeComponant from "./documentType_page";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";

const DocumentTypePage = () => {
  const { documentTypes, userOnline } = useSchoolStore();
  const permissionRequisVoir = ["voir frais_Scolaires"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  // if (hasAdminAccessVoir === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  return <DocumentTypeComponant data={documentTypes} />;
};

export default DocumentTypePage;
