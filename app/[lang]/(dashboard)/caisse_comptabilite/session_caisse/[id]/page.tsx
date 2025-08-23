"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSchoolStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { generationNumero } from "@/lib/fonction";
import type { CashRegisterSession , Transaction } from "@/lib/interface";
import SessionInfo from "./session-info";
import SessionStatistics from "./session-statistics";
import SessionTransactions from "./session-transactions";
import {
  fetchCashRegisterSessions,
  fetchTransactions,
  fetchPayment,
  fetchExpenses,
} from "@/store/schoolservice";
import { checkSessionAccess, canAccessSessionPage } from "./fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import Loading from "@/app/[lang]/loading";

interface Props {
  params: {
    id: string;
  };
}

interface TransactionDetail {
  id: number;
  type: "encaissement" | "decaissement";
  amount: number;
  date: string;
  description: string;
  reference: string;
  details: any;
  payment_id: number;
  expense_id: number;
}

const DetailSessionPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [session, setSession] = useState<CashRegisterSession | null>(null);
  const [allSessions, setAllSessions] = useState<CashRegisterSession[] | null>(null);
  const sessionId = Number(params.id);
  const { userOnline,
    cashRegisterSessions,
    setCashRegisterSessions,
    transactions,
    setTransactions,
    payments,
    setPayments,
    expenses,
    setExpenses,
    settings,
  } = useSchoolStore();


  // Vérification de l'accès et chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Vérifier d'abord les droits d'accès
        if (!canAccessSessionPage(userOnline)) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        
        // Charger les sessions
        const sessions = await fetchCashRegisterSessions();
        
        // Trouver la session demandée
        const currentSession = sessions.find((s: CashRegisterSession) => s.id === sessionId) || null;
        
        // Vérifier les droits d'accès à cette session spécifique
        const { canAccess } = checkSessionAccess(currentSession, userOnline);
        if (!canAccess) {
router.push('/caisse_comptabilite/session_caisse');
          return;
          return;
        }
        
        // Charger les autres données
        const [trans, pays, exps] = await Promise.all([
          fetchTransactions(),
          fetchPayment(),
          fetchExpenses ? fetchExpenses() : Promise.resolve([]),
        ]);
        
        setSession(currentSession);
        setAllSessions(sessions);
        setCashRegisterSessions(sessions);
        setTransactions(trans);
        setPayments(pays);
        if (setExpenses && exps) setExpenses(exps);
      } catch (e) {
        console.error("Erreur lors du chargement des données :", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Filtrer les transactions associées à la session de caisse
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.cash_register_session_id === sessionId
    );
  }, [transactions, sessionId]);

  const filteredPayment = useMemo(() => {
    const transactionsfiltered = transactions.filter(
      (t) => t.cash_register_session_id === sessionId
    );
    if (transactionsfiltered.length === 0) return [];
    // Filtrer les paiements associés à la session de caisse
    if (!payments || payments.length === 0) return [];
    return payments.filter((payment) =>
      transactionsfiltered.some((t) => t.id === payment.transaction_id)
    );
  }, [transactions, payments, sessionId]);

  const filteredExpenses = useMemo(() => {
    const transactionsfiltered = transactions.filter(
      (t) => t.cash_register_session_id === sessionId
    );
    if (transactionsfiltered.length === 0) return [];
    // Filtrer les dépenses associées à la session de caisse
    if (!expenses || expenses.length === 0) return [];
    return expenses.filter((expense) =>
      transactionsfiltered.some((t) => t.id === expense.transaction_id)
    );
  }, [transactions, expenses, sessionId]);
  
  // Récupération de la devise
  const currency = useMemo(() => settings[0]?.currency || "FCFA", [settings]);

  // Formatage des données
  const formatDateTime = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    } catch {
      return "Date invalide";
    }
  }, []);

  const formatAmount = useCallback(
    (amount: number | string) => {
      try {
        const num =
          typeof amount === "string"
            ? Number.parseFloat(amount.replace(/\s/g, ""))
            : amount;
        if (Number.isNaN(num)) return `0 ${currency}`;
        return `${num.toLocaleString("fr-FR").replace(/,/g, " ")} ${currency}`;
      } catch {
        return `0 ${currency}`;
      }
    },
    [currency]
  );

  // Consolidation des transactions
  const sessionTransactions = useMemo<TransactionDetail[]>(() => {
    if (!session || !sessionId) return [];
    const details: TransactionDetail[] = [];

    // Transactions générales
    filteredTransactions
      .filter(
        (t) =>
          t.cash_register_session_id === sessionId &&
          (filteredPayment.some((p) => p.transaction_id === t.id) ||
            filteredExpenses.some((e) => e.transaction_id === t.id))
      )
      .forEach((t: Transaction) => {
        // Correction : éviter les doublons de décaissement (transaction et dépense)
        if (
          t.transaction_type?.toLowerCase().includes("decaissement") &&
          filteredExpenses.some((e) => e.transaction_id === t.id)
        ) {
          // On n'ajoute pas la transaction décaissement si une dépense existe déjà pour cette transaction
          return;
        }
        const payment_id = t.transaction_type?.toLowerCase().includes("encaissement")
          ? (filteredPayment.find((p) => p.transaction_id === t.id)?.id ?? 0)
          : 0;
        const expense_id = t.transaction_type?.toLowerCase().includes("decaissement")
          ? (filteredExpenses.find((e) => e.transaction_id === t.id)?.id ?? 0)
          : 0;
        
        details.push({
          id: t.id,
          type: t.transaction_type?.toLowerCase().includes("encaissement")
            ? "encaissement"
            : "decaissement",
          amount: Number(t.total_amount),
          date: t.transaction_date,
          description: `Transaction ${t.transaction_type}`,
          reference: `${generationNumero(
            payment_id !== 0 ? payment_id : expense_id,
            t.created_at,
            t.transaction_type?.toLowerCase().includes("encaissement")
              ? "encaissement"
              : "decaissement"
          )}`,
          details: t,
          payment_id: t.transaction_type?.toLowerCase().includes("encaissement")
            ? (filteredPayment.find((p) => p.transaction_id === t.id)?.id ?? 0)
            : 0,
          expense_id: t.transaction_type?.toLowerCase().includes("decaissement")
            ? (filteredExpenses.find((e) => e.transaction_id === t.id)?.id ?? 0)
            : 0,
        });
      });

    // Paiements
    filteredPayment
      .filter(
        (p) =>
          p.transaction_id &&
          transactions.some(
            (t) =>
              t.id === p.transaction_id &&
              t.cash_register_session_id === sessionId
          )
      )
      .forEach((p) => {
        // Évite d'ajouter un paiement déjà représenté par une transaction encaissement
        if (
          details.some(
            (d) => d.type === "encaissement" && d.id === p.transaction_id
          )
        ) {
          return;
        }
        details.push({
          id: p.id,
          type: "encaissement",
          amount: Number(p.amount),
          date: p.created_at,
          description: p.student
            ? `Paiement - ${p.student.first_name} ${p.student.name}`
            : "Paiement",
          reference: `${generationNumero(p.id, p.created_at, "encaissement")}`,
          details: p,
          payment_id: p.id,
          expense_id: 0,
        });
      });

    // Dépenses
    filteredExpenses
      ?.filter(
        (e) =>
          e.transaction_id &&
          filteredTransactions.some(
            (t) =>
              t.id === e.transaction_id &&
              t.cash_register_session_id === sessionId &&
              // N'ajoute la dépense que si elle n'est pas déjà présente comme transaction décaissement
              !details.some(
                (d) =>
                  d.type === "decaissement" &&
                  (d.id === e.transaction_id || d.id === e.id)
              )
          )
      )
      .forEach((e) => {
        details.push({
          id: e.id,
          type: "decaissement",
          amount: Number(e.amount),
          date: e.created_at,
          description: e.label,
          reference: `${generationNumero(
            e.id,
            e.created_at,
            "decaissement"
          )}`,
          details: e,
          payment_id: 0,
          expense_id: e.id,
        });
      });

    // Correction : éviter les doublons d'ID dans details
    const uniqueDetails = details.filter(
      (item, index, self) =>
        index ===
        self.findIndex((d) => d.type === item.type && d.id === item.id)
    );

    return uniqueDetails.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [session, transactions, payments, expenses, sessionId, filteredTransactions, filteredPayment, filteredExpenses]);

  // console.log(sessionTransactions)

  // Statistiques
  const statistics = useMemo(() => {
    if (!session || !sessionId) {
      return {
        totalTransactions: 0,
        totalEncaissements: 0,
        totalDecaissements: 0,
        nombreEncaissements: 0,
        nombreDecaissements: 0,
        soldeNet: 0
      };
    }
    
    // Ne prendre en compte que les transactions qui concernent la session courante
    const encaissements = sessionTransactions.filter(
      (t) =>
        t.type === "encaissement" &&
        t.details &&
        ((t.details.cash_register_session_id &&
          t.details.cash_register_session_id === sessionId) ||
          (t.details.transaction &&
            t.details.transaction.cash_register_session_id === sessionId))
    );
    const decaissements = sessionTransactions.filter(
      (t) =>
        t.type === "decaissement" &&
        t.details &&
        ((t.details.cash_register_session_id &&
          t.details.cash_register_session_id === sessionId) ||
          (t.details.transaction &&
            t.details.transaction.cash_register_session_id === sessionId))
    );

    const totalTransactions = encaissements.length + decaissements.length;
    const totalEncaissements = encaissements.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalDecaissements = decaissements.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    return {
      totalTransactions,
      totalEncaissements,
      totalDecaissements,
      nombreEncaissements: encaissements.length,
      nombreDecaissements: decaissements.length,
      soldeNet:
        Number(session?.opening_amount ?? 0) +
        totalEncaissements -
        totalDecaissements,
    };
  }, [sessionTransactions, session, sessionId]);
  
  // Gestion des états de chargement et d'erreur
  if (loading) {
    return <Loading />;
  }
  
  if (accessDenied) {
    return <ErrorPage />;
  }

  if (!sessionId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">ID de session invalide</h3>
          <p className="text-muted-foreground mb-4">
            L'identifiant de session fourni n'est pas valide.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/caisse_comptabilite/session_caisse")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sessions
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Session non trouvée</h3>
          <p className="text-muted-foreground mb-4">
            La session de caisse demandée n'existe pas ou a été supprimée.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/caisse_comptabilite/session_caisse")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sessions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <SessionInfo
          currentSession={session}
          formatDateTime={formatDateTime}
          formatAmount={formatAmount}
        />

        <SessionStatistics
          statistics={statistics}
          formatAmount={formatAmount}
          sessionTransactions={sessionTransactions}
          payments={filteredPayment}
        />

        <SessionTransactions
          sessionTransactions={sessionTransactions}
          statistics={statistics}
          formatDateTime={formatDateTime}
          formatAmount={formatAmount}
          sessionId={sessionId}
        />
      </CardContent>
    </Card>
  );
};

export default DetailSessionPage;
