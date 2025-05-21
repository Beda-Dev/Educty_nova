"use client";

import { useState, useEffect } from "react";
import React from "react";
import AcademicYearPage from "./academic_page";
import { AcademicYear } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";

const ServerComponent = () => {
  const { academicYears, userOnline } = useSchoolStore();
  const permissionRequis = ["voir annee_Academique"];
  const hasAdminAccess = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequis
  );

  if (hasAdminAccess === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return <AcademicYearPage data={academicYears} />;
};

export default ServerComponent;
