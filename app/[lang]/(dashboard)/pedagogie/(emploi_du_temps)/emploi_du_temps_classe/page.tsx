"use client";

import React, { useEffect } from "react";
import { useSchoolStore } from "@/store/index";
import {
  fetchTimetable,
  fetchClasses,
  fetchProfessor,
  fetchAcademicYears,
  fetchPeriods,
  fetchMatters,
} from "@/store/schoolservice";
import EmploiDuTempsClasse from "./componant";

export default function Page() {
  const {
    setTimetables,
    setClasses,
    setProfessor,
    setAcademicYears,
    setPeriods,
    setMatters,
  } = useSchoolStore();

  useEffect(() => {
    (async () => {
      const tt = await fetchTimetable();
      setTimetables(tt || []);
      const cl = await fetchClasses();
      setClasses(cl || []);
      const pr = await fetchProfessor();
      setProfessor(pr || []);
      const ay = await fetchAcademicYears();
      setAcademicYears(ay || []);
      const pe = await fetchPeriods();
      setPeriods(pe || []);
      const ma = await fetchMatters();
      setMatters(ma || []);
    })();
    
  }, []);

  return <EmploiDuTempsClasse />;
}
