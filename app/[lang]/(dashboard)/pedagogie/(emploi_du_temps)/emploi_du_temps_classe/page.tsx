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
      const [tt, cl, pr, ay, pe, ma] = await Promise.all([
        fetchTimetable(),
        fetchClasses(),
        fetchProfessor(),
        fetchAcademicYears(),
        fetchPeriods(),
        fetchMatters(),
      ]);
      setTimetables(tt || []);
      setClasses(cl || []);
      setProfessor(pr || []);
      setAcademicYears(ay || []);
      setPeriods(pe || []);
      setMatters(ma || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <EmploiDuTempsClasse />;
}
