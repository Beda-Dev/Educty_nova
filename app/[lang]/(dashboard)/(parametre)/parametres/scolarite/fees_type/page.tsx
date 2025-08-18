"use client";

import { useState, useEffect } from "react";
import React from "react";
import FeesTypePage from "./feeType_page";
import { FeeType } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";

const FeesTypeComponant = () => {
  const { feeTypes, userOnline } = useSchoolStore();
  const permissionRequisVoir = ["voir frais_Scolaires"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  return <FeesTypePage data={feeTypes} />;
};

export default FeesTypeComponant;
