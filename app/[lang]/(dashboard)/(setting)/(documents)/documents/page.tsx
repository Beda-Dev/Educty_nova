"use client";
import React from "react";
import DocumentTable from "./documentTable";
import Card from "@/components/ui/card-snippet";
import { useSchoolStore } from "@/store";
import { useEffect, useState } from "react";
import { Document } from "@/lib/interface";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

export default function StudentsPage(): JSX.Element {
  const { documents, academicYears, students, userOnline } = useSchoolStore();
  const [docs, setdocs] = useState<Document[] | undefined>();
  const permissionRequis = ["voir document"];
  const hasAdminAccess = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequis
  );

  useEffect(() => {
    if (documents) {
      const activeDocument = documents.filter((doc) => doc.active === 1);
      if (activeDocument) {
        setdocs(activeDocument);
      } else {
        setdocs(documents);
      }
    }
  }, []);

  //   if(hasAdminAccess === false){
  //     return ( <Card>
  //       <ErrorPage />
  //     </Card>
  //     );
  //   }

  return (
    <Card title="document">
      <DocumentTable documents={docs || []} />
    </Card>
  );
}
