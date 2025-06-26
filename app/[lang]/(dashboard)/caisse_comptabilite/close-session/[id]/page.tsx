"use client"
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSchoolStore } from "@/store";
import { fetchCashRegisterSessions, fetchTransactions, fetchPayment } from "@/store/schoolservice";
import { CashRegisterSession } from "@/lib/interface";
import CloseSessionPage from "./composant";

// Nouvelle fonction pour mettre à jour le store
async function updateStore(setCashRegisterSessions: any, setTransactions: any, setPayments: any) {
  const [updatedSessions, updatedTransactions, updatedPayments] = await Promise.all([
    fetchCashRegisterSessions(),
    fetchTransactions(),
    fetchPayment(),
  ]);
  setCashRegisterSessions(updatedSessions);
  setTransactions(updatedTransactions);
  setPayments(updatedPayments);
  return { updatedSessions, updatedTransactions, updatedPayments };
}

// Fonction pour trouver la session dans le store
function findSession(sessions: CashRegisterSession[], id: string): CashRegisterSession | null {
  const sessionId = Number(id);
  if (isNaN(sessionId)) return null;
  const foundSession = sessions.find((s: CashRegisterSession) => s.id === sessionId);
  if (!foundSession || foundSession.status === "closed") return null;
  return foundSession;
}

export default function CloseSessionPageWrapper() {
  const params = useParams();
  const id = params?.id as string;

  const {
    setCashRegisterSessions,
    setTransactions,
    setPayments,
  } = useSchoolStore();

  const [session, setSession] = useState<CashRegisterSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mise à jour du store
      const { updatedSessions } = await updateStore(setCashRegisterSessions, setTransactions, setPayments);

      // Recherche de la session dans le store
      const foundSession = findSession(updatedSessions, id);
      if (!foundSession) throw new Error("Session introuvable ou déjà fermée");

      setSession(foundSession);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, setCashRegisterSessions, setTransactions, setPayments]);

  useEffect(() => {
    fetchSessionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CloseSessionPage
      session={session}
      isLoading={isLoading}
      error={error}
      params={{ id }}
    />
  );
}
