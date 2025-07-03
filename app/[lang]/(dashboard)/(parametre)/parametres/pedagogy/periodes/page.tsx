"use client";

import { fetchPeriods, fetchTypePeriods } from "@/store/schoolservice";
import { useSchoolStore } from "@/store/index";
import { useEffect } from "react";
import PeriodsPage from "./componant";

const Page = () => {
  const { setPeriods, setTypePeriods } = useSchoolStore();

  useEffect(() => {
    let isMounted = true;
    const loadPeriodsAndTypes = async () => {
      const [periods, typePeriods] = await Promise.all([
        fetchPeriods(),
        fetchTypePeriods(),
      ]);
      if (isMounted) {
        setPeriods(periods);
        setTypePeriods(typePeriods);
      }
    };
    loadPeriodsAndTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  return <PeriodsPage />;
};

export default Page;