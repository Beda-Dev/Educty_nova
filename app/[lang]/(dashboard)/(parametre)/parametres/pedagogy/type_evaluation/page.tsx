"use client";

import React, { useEffect } from "react";
import EvaluationTypeTable from "./type_evaluation";
import { useSchoolStore } from "@/store";
import { fetchTypeEvaluations } from "@/store/schoolservice";
// import {
//   User,
//   CashRegister,
//   UserSingle,
//   CashRegisterSession,
// } from "@/lib/interface";

function Page() {
  const { typeEvaluations, setTypeEvaluations } = useSchoolStore();

  useEffect(() => {
    const fetchTypeEval = async () => {
      const updatedTypeEvaluation = await fetchTypeEvaluations();
      setTypeEvaluations(updatedTypeEvaluation);
    };
    // Fetch transactions if needed
    // const fetchTransactionsData = async () => {
    //   const transactions = await fetchTransactions();
    //   setTransactions(transactions);
    // };

    fetchTypeEval();
    // fetchTransactionsData();
  }, [setTypeEvaluations]);

  return <EvaluationTypeTable />;
}

export default Page;
