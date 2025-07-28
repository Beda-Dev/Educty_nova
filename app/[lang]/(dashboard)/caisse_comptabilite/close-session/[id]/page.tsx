"use client"
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSchoolStore } from "@/store";
import { fetchCashRegisterSessions, fetchTransactions, fetchPayment } from "@/store/schoolservice";
import { CashRegisterSession } from "@/lib/interface";
import CloseSessionPage from "./composant";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Fonction de logging pour le débogage
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    // console.log(`[CloseSessionPageWrapper] ${message}`, data);
  }
};

// Vérifie si l'ID est valide
const isValidId = (id: string | undefined): boolean => {
  if (!id || id === "undefined" || id === "null") return false;
  const sessionId = Number(id);
  return !isNaN(sessionId) && sessionId > 0;
};

// Met à jour le store avec les dernières données
async function updateStore(
  setCashRegisterSessions: (data: CashRegisterSession[]) => void,
  setTransactions: (data: any[]) => void,
  setPayments: (data: any[]) => void
) {
  try {
    debugLog("Mise à jour du store en cours...");
    const [updatedSessions, updatedTransactions, updatedPayments] = await Promise.all([
      fetchCashRegisterSessions(),
      fetchTransactions(),
      fetchPayment(),
    ]);

    debugLog("Données reçues:", {
      sessions: updatedSessions.length,
      transactions: updatedTransactions.length,
      payments: updatedPayments.length
    });

    setCashRegisterSessions(updatedSessions);
    setTransactions(updatedTransactions);
    setPayments(updatedPayments);

    return { updatedSessions, updatedTransactions, updatedPayments };
  } catch (error) {
    debugLog("Erreur lors de la mise à jour du store", error);
    throw error;
  }
}

// Trouve une session spécifique dans le store
function findSession(
  sessions: CashRegisterSession[], 
  id: string
): CashRegisterSession | null {
  if (!isValidId(id)) {
    debugLog("ID de session invalide", id);
    return null;
  }

  const sessionId = Number(id);
  const foundSession = sessions.find((s: CashRegisterSession) => s.id === sessionId);

  if (!foundSession) {
    debugLog("Session non trouvée", { sessionId, sessionsCount: sessions.length });
    return null;
  }

  if (foundSession.status === "closed") {
    debugLog("Session déjà fermée", foundSession);
    return null;
  }

  return foundSession;
}

export default function CloseSessionPageWrapper() {
  const params = useParams();
  const id = params?.id as string;

  debugLog("Paramètres reçus", { id });

  const {
    cashRegisterSessions,
    setCashRegisterSessions,
    setTransactions,
    setPayments,
  } = useSchoolStore();

  const [session, setSession] = useState<CashRegisterSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionData = useCallback(async () => {
    debugLog("Début de la récupération des données de session");

    if (!isValidId(id)) {
      const errorMsg = "Identifiant de session invalide ou manquant.";
      debugLog(errorMsg, { id });
      setError(errorMsg);
      setSession(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      debugLog("Mise à jour des données du store...");
      const { updatedSessions } = await updateStore(
        setCashRegisterSessions,
        setTransactions,
        setPayments
      );

      debugLog("Recherche de la session...");
      const foundSession = findSession(updatedSessions, id);

      if (!foundSession) {
        throw new Error("Session introuvable ou déjà fermée");
      }

      debugLog("Session trouvée", foundSession);
      setSession(foundSession);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
      debugLog("Erreur lors de la récupération", { error: errorMsg });
      setError(errorMsg);
      setSession(null);
    } finally {
      setIsLoading(false);
      debugLog("Chargement terminé", { isLoading: false });
    }
  }, [id, setCashRegisterSessions, setTransactions, setPayments]);

  useEffect(() => {
    debugLog("Effet monté, chargement initial des données");
    fetchSessionData();

    return () => {
      debugLog("Nettoyage de l'effet");
    };
  }, [fetchSessionData]);

  // Vérification initiale de l'ID
  if (!isValidId(id)) {
    debugLog("ID invalide - affichage du message d'erreur");
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert color="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Identifiant de session manquant ou invalide. Veuillez sélectionner une session valide.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Affichage pendant le chargement
  if (isLoading) {
    debugLog("Affichage de l'état de chargement");
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert>
          <AlertTitle>Chargement en cours...</AlertTitle>
          <AlertDescription>
            Veuillez patienter pendant que nous récupérons les données de la session.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    debugLog("Affichage de l'erreur", { error });
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert color="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Vérification finale avant de rendre le composant enfant
  if (!session) {
    debugLog("Session non trouvée après chargement", { id, cashRegisterSessions });
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert color="destructive">
          <AlertTitle>Session introuvable</AlertTitle>
          <AlertDescription>
            La session demandée n'a pas pu être chargée. Elle a peut-être déjà été fermée.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  debugLog("Rendu du composant CloseSessionPage avec session", session);
  return (
    <CloseSessionPage
      session={session}
      isLoading={isLoading}
      error={error}
      params={{ id }}
    />
  );
}