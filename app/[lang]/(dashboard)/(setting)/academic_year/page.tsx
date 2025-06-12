"use client";

import { useState, useEffect } from "react";
import React from "react";
import AcademicYearPage from "./academic_page";
import { AcademicYear } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";
import { fetchAcademicYears , fetchPeriods } from "@/store/schoolservice";

const ServerComponent = () => {
  const { academicYears, userOnline , periods , setPeriods, setAcademicYears } = useSchoolStore();
  const permissionRequis = ["voir annee_Academique"];
  const hasAdminAccess = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequis
  );

  useEffect(() => {
    const fetchAcademicYearsData = async () => {
      const data = await fetchAcademicYears();
      setAcademicYears(data);
    };
    const fetchPeriodsData = async () => {
      const data = await fetchPeriods();
      setPeriods(data);
    };
    fetchAcademicYearsData();
    fetchPeriodsData();
  }, []);

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
