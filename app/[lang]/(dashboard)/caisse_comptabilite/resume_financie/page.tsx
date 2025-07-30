"use client";

import React, { useEffect } from "react";
import FinancialSummaryPage from "./conposant";
import { useSchoolStore } from "@/store";
import {  fetchTransactions ,fetchPayment  } from "@/store/schoolservice";


function Page() {
  const { setCashRegisterSessions , setTransactions , setPayments } = useSchoolStore();

  useEffect(() => {
    // Fetch transactions if needed
    const fetchTransactionsData = async () => {
      const transactions = await fetchTransactions();
      setTransactions(transactions);
    };
    // Fetch payments if needed
    const fetchPaymentData = async () => {
      const payments = await fetchPayment();
      setPayments(payments);
    } 


    
    fetchTransactionsData();
    fetchPaymentData();
  }, []);

  return <FinancialSummaryPage />;
}

export default Page;
