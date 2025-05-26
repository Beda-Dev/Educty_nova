"use client";

import React, { useEffect } from "react";
import CashRegisterSessionsPage from "./sessioncomponant";
import { useSchoolStore } from "@/store";
import { fetchCashRegisterSessions , fetchTransactions } from "@/store/schoolservice";
import {
  User,
  CashRegister,
  UserSingle,
  CashRegisterSession,
} from "@/lib/interface";

function SessionCaissePage() {
  const { cashRegisterSessions, setCashRegisterSessions , setTransactions } = useSchoolStore();

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


    fetchsession();
    fetchTransactionsData();
  }, [setCashRegisterSessions , setTransactions]);

  return <CashRegisterSessionsPage data={cashRegisterSessions} />;
}

export default SessionCaissePage;
