"use client"

import React, { useEffect, useState } from "react";
import AdvancedDataTable from "./table";
import { useSchoolStore } from "@/store";
import { Registration } from "@/lib/interface";


export default function PageHistory() {
    const {registrations}= useSchoolStore();

  return (
    <AdvancedDataTable data={registrations} />
  )
}
