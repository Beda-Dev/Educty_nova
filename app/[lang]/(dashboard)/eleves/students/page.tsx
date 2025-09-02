"use client";
import React from "react";
import StudentTableStatus from "./table";
import Card from "@/components/ui/card-snippet";
import { useSchoolStore } from "@/store";
import { useEffect, useState } from "react";
import { Registration, RegistrationMerge } from "@/lib/interface";
import {
  filterRegistrationsByCurrentAcademicYear,
  mergeRegistrationsWithStudents,
} from "./filtre";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fetchSeries } from "@/store/schoolservice";

export default function StudentsPage(): JSX.Element {
  const { 
    registrations, 
    academicYears, 
    students, 
    userOnline, 
    academicYearCurrent, 
    series,
    setSeries 
  } = useSchoolStore();
  const [dataRegistrationsStudents, setdataRegistrationsStudents] =
    useState<RegistrationMerge[]>();
  const permissionRequis = ["voir eleve"];
  const hasAdminAccess = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequis
  );

  // Charger les séries si elles ne sont pas déjà chargées
  useEffect(() => {
    if (series.length === 0) {
      fetchSeries().then(data => setSeries(data));
    }
  }, [series.length, setSeries]);

  useEffect(() => {
    // j'applique le filtre sur les inscriptions
    const fusion = mergeRegistrationsWithStudents(
      registrations,
      students
    ) as RegistrationMerge[];

    // je filtre les inscriptions par année académique
    setdataRegistrationsStudents(
      filterRegistrationsByCurrentAcademicYear(academicYearCurrent, fusion)
    );
  }, [registrations, academicYearCurrent, students]);

  // if (hasAdminAccess === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  return (
    <TooltipProvider>
      <Card title="Eleves inscrit">
        <StudentTableStatus Register={(dataRegistrationsStudents || []).slice().reverse()} />
      </Card>
    </TooltipProvider>
  );
}
