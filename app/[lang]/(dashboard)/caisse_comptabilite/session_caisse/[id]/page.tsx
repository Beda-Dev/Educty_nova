"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSchoolStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { generationNumero } from "@/lib/fonction";
import type { CashRegisterSession } from "@/lib/interface";
import SessionInfo from "./session-info";
import SessionStatistics from "./session-statistics";
import SessionTransactions from "./session-transactions";
import {
  fetchCashRegisterSessions,
  fetchTransactions,
  fetchPayment,
  fetchExpenses,
} from "@/store/schoolservice";

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
  const [sessionCurrent, setSessionCurrent] = useState<
    CashRegisterSession[] | null
  >(null);
  const {
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
  const { id } = params;

  // Synchronisation du store avec l'API à l'ouverture de la page
  useEffect(() => {
    const updateStore = async () => {
      try {
        const [sessions, trans, pays, exps] = await Promise.all([
          fetchCashRegisterSessions(),
          fetchTransactions(),
          fetchPayment(),
          fetchExpenses ? fetchExpenses() : Promise.resolve([]), // fetchExpenses peut ne pas exister selon ton store
        ]);
        setCashRegisterSessions(sessions);
        setTransactions(trans);
        setPayments(pays);
        if (setExpenses && exps) setExpenses(exps);
      } catch (e) {
        // Optionnel : gestion d'erreur
        // console.error("Erreur lors de la mise à jour du store :", e)
      }
    };
    updateStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrer les transactions associées à la session de caisse
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.cash_register_session_id === Number(id)
    );
  }, [transactions, id]);

  const filteredPayment = useMemo(() => {
    const transactionsfiltered = transactions.filter(
      (t) => t.cash_register_session_id === Number(id)
    );
    if (transactionsfiltered.length === 0) return [];
    // Filtrer les paiements associés à la session de caisse
    if (!payments || payments.length === 0) return [];
    return payments.filter((payment) =>
      transactionsfiltered.some((t) => t.id === payment.transaction_id)
    );
  }, [transactions, payments, id]);

  const filteredExpenses = useMemo(() => {
    const transactionsfiltered = transactions.filter(
      (t) => t.cash_register_session_id === Number(id)
    );
    if (transactionsfiltered.length === 0) return [];
    // Filtrer les dépenses associées à la session de caisse
    if (!expenses || expenses.length === 0) return [];
    return expenses.filter((expense) =>
      transactionsfiltered.some((t) => t.id === expense.transaction_id)
    );
  }, [transactions, expenses, id]);
  // Validation de l'ID de session
  const sessionId = useMemo(() => {
    const numId = Number(id);
    return isNaN(numId) ? null : numId;
  }, [id]);

  // Récupération de la session
  useEffect(() => {
    if (!sessionId) return;

    const session = cashRegisterSessions.find((s) => s.id === sessionId);
    if (session) {
      setSessionCurrent([session]);
    } else {
      setSessionCurrent(null);
    }
  }, [cashRegisterSessions, sessionId]);

  // Vérification des données
  const currentSession = useMemo(() => {
    if (!sessionCurrent || sessionCurrent.length === 0) return null;
    return sessionCurrent[0];
  }, [sessionCurrent]);

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
    if (!currentSession || !sessionId) return [];
    const details: TransactionDetail[] = [];

    // Transactions générales
    filteredTransactions
      .filter(
        (t) =>
          t.cash_register_session_id === sessionId &&
          (filteredPayment.some((p) => p.transaction_id === t.id) ||
            filteredExpenses.some((e) => e.transaction_id === t.id))
      )
      .forEach((t) => {
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
    payment_id !== 0 ? payment_id : expense_id, // <-- ici
    t.transaction_date,
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
  date: e.expense_date,
  description: e.label,
  reference: `${generationNumero(
    e.id,
    e.expense_date,
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
  }, [currentSession, transactions, payments, expenses, sessionId]);

  // Statistiques
  const statistics = useMemo(() => {
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
        Number(sessionCurrent?.[0]?.opening_amount ?? 0) +
        totalEncaissements -
        totalDecaissements,
    };
  }, [sessionTransactions, sessionCurrent, sessionId]);

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

  if (!currentSession) {
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
          currentSession={currentSession}
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
