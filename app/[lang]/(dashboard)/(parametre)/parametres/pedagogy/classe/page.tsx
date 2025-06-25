"use client";

import { useState, useEffect } from "react";
import React from "react";
import ClassTable from "./simple-table";
import Card from "@/components/ui/card-snippet";

import { useSchoolStore } from "@/store";
import { Classe } from "@/lib/interface";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { fetchClasses, fetchSeries, fetchRegistration } from "@/store/schoolservice";

export default function ClassPage() {
  const [dataclasses, setDataClasses] = useState<Classe[]>([]);
  const { classes, userOnline, setClasses, setSeries, setRegistration } = useSchoolStore();

  const permissionRequisVoir = ["voir classe"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  useEffect(() => {
    // Met à jour les classes, les séries et les inscriptions dans le store au chargement
    fetchClasses().then((data) => setClasses(data));
    fetchSeries().then((data) => setSeries(data));
    fetchRegistration().then((data) => setRegistration(data));
  }, [setClasses, setSeries, setRegistration]);

  useEffect(() => {
    setDataClasses(classes);
  }, [classes]);

  return <ClassTable data={dataclasses} />;
}
