"use client";

import React, { useEffect, useState } from "react";
import CashRegisterSessionsPage from "./sessioncomponant";
import { useSchoolStore } from "@/store";
import { fetchCashRegisterSessions, fetchTransactions, fetchExpenses, fetchPayment } from "@/store/schoolservice";
import { filterSessionsByUserRole, canAccessSessionsPage } from "./fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import Loading from "@/app/[lang]/loading";

function SessionCaissePage() {
  const { cashRegisterSessions, setCashRegisterSessions, setTransactions, setPayments, setExpenses, userOnline } = useSchoolStore();
  const [filteredSessions, setFilteredSessions] = useState(cashRegisterSessions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier d'abord les droits d'accès
        if (!canAccessSessionsPage(userOnline)) {
          setError("Accès non autorisé");
          setIsLoading(false);
          return;
        }

        // Récupérer les données
        const [sessions, transactions, expenses, payments] = await Promise.all([
          fetchCashRegisterSessions(),
          fetchTransactions(),
          fetchExpenses(),
          fetchPayment()
        ]);

        // Mettre à jour le store
        setCashRegisterSessions(sessions);
        setTransactions(transactions);
        setExpenses(expenses);
        setPayments(payments);

        // Filtrer les sessions selon les droits de l'utilisateur
        const filtered = filterSessionsByUserRole(sessions, userOnline);
        setFilteredSessions(filtered);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Une erreur est survenue lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setCashRegisterSessions, setTransactions, setPayments, setExpenses, userOnline]);

  // Afficher la page d'erreur si l'utilisateur n'a pas les droits
  if (error) {
    return <ErrorPage />;
  }

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <Loading />
    );
  }

  return <CashRegisterSessionsPage data={filteredSessions} />;
}

export default SessionCaissePage;
