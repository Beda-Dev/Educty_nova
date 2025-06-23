"use client";

import React from 'react'
import ValidationExpense from "./validationPage"
import { useEffect } from "react";
import { useSchoolStore } from "@/store";
import { fetchCashRegisterSessions , fetchTransactions } from "@/store/schoolservice";
import {
  User,
  CashRegister,
  UserSingle,
  CashRegisterSession,
} from "@/lib/interface";

function ValidationPage() {
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
  return (
    <ValidationExpense/>
  )
}

export default ValidationPage