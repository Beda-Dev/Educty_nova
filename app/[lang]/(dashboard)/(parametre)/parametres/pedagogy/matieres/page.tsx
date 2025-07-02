"use client";

import React, { useEffect } from "react";
import MatterTable from "./matterComponant";
import { useSchoolStore } from "@/store";
import { fetchMatters, fetchLevels, fetchCoefficient } from "@/store/schoolservice";

function Page() {
  const { matters, setMatters, setLevels, setCoefficients } = useSchoolStore();

  useEffect(() => {
    const fetchAll = async () => {
      const [updatedMatter, updatedLevels, updatedCoefficients] = await Promise.all([
        fetchMatters(),
        fetchLevels(),
        fetchCoefficient(),
      ]);
      setMatters(updatedMatter);
      setLevels(updatedLevels);
      setCoefficients(updatedCoefficients);
    };

    fetchAll();
    // fetchTransactionsData();
  }, []);

  return <MatterTable />;
}

export default Page;
