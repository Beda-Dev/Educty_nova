"use client";

import { useState, useEffect } from "react";
import React from "react";
import SeriePage from "./serie_page";
import { Serie } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";
import { fetchSeries } from "@/store/schoolservice";

const SerieComponent = () => {
  const { series, setSeries, userOnline } = useSchoolStore();
  const permissionRequisVoir = ["voir serie"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  useEffect(() => {
    // Met à jour le store et le state local avec les séries depuis l'API
    fetchSeries().then((seriesData) => {
      setSeries(seriesData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return <SeriePage />;
};

export default SerieComponent;