"use client";

import React, { useEffect } from "react";
import MatterTable from "./matterComponant";
import { useSchoolStore } from "@/store";
import { fetchMatters } from "@/store/schoolservice";
// import {
//   User,
//   CashRegister,
//   UserSingle,
//   CashRegisterSession,
// } from "@/lib/interface";

function Page() {
  const { matters, setMatters } = useSchoolStore();

  useEffect(() => {
    const fetchMatte = async () => {
      const updatedMatter = await fetchMatters();
      setMatters(updatedMatter);
    };
    // Fetch transactions if needed
    // const fetchTransactionsData = async () => {
    //   const transactions = await fetchTransactions();
    //   setTransactions(transactions);
    // };

    fetchMatte();
    // fetchTransactionsData();
  }, [setMatters]);

  return <MatterTable />;
}

export default Page;
