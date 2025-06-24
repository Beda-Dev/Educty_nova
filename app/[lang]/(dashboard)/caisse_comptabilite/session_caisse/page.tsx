"use client";

import React, { useEffect } from "react";
import CashRegisterSessionsPage from "./sessioncomponant";
import { useSchoolStore } from "@/store";
import { fetchCashRegisterSessions , fetchTransactions , fetchExpenses ,fetchPayment  } from "@/store/schoolservice";


function SessionCaissePage() {
  const { cashRegisterSessions, setCashRegisterSessions , setTransactions , setPayments , setExpenses} = useSchoolStore();

  useEffect(() => {
    const fetchsession = async () => {
      const updatedSession = await fetchCashRegisterSessions();
      setCashRegisterSessions(updatedSession);
    };
    // Fetch transactions if needed
    const fetchTransactionsData = async () => {
      const transactions = await fetchTransactions();
      setTransactions(transactions);
    };
    // Fetch expenses if needed
    const fetchExpensesData = async () => {
      const expenses = await fetchExpenses();
      setExpenses(expenses);
    }
    // Fetch payments if needed
    const fetchPaymentData = async () => {
      const payments = await fetchPayment();
      setPayments(payments);
    } 


    fetchsession();
    fetchTransactionsData();
    fetchExpensesData();
    fetchPaymentData();
  }, [setCashRegisterSessions , setTransactions , setPayments , setExpenses]);

  return <CashRegisterSessionsPage data={cashRegisterSessions} />;
}

export default SessionCaissePage;
