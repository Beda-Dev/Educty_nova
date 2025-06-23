"use client";
import { useState, useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import { Expense, ValidationExpense, Demand, User } from "@/lib/interface";
import ExpenseReceipt from "./receipt";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchExpenses, fetchValidationExpenses, fetchDemands, fetchUsers, fetchTransactions, fetchCashRegisterSessions } from "@/store/schoolservice";

interface Props {
  params: {
    id: string;
  };
}

const DetailExpensePage = ({ params }: Props) => {
  const { id } = params;
  const { 
    expenses,
    validationExpenses,
    demands,
    users,
    transactions,
    cashRegisterSessions,
    setExpenses,
    setValidationExpenses,
    setDemands,
    setUsers,
    setTransactions,
    setCashRegisterSessions
  } = useSchoolStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenseData, setExpenseData] = useState<{
    expense: Expense | null;
    validation: ValidationExpense | null;
    demand: Demand | null;
    cashier: User | null;
  } | null>(null);

  // Fonction pour rafraîchir toutes les données
  const refreshAllData = useCallback(async () => {
    try {
      const [
        expensesData, 
        validationsData, 
        demandsData, 
        usersData,
        transactionsData,
        sessionsData
      ] = await Promise.all([
        fetchExpenses(),
        fetchValidationExpenses(),
        fetchDemands(),
        fetchUsers(),
        fetchTransactions(),
        fetchCashRegisterSessions()
      ]);

      setExpenses(expensesData);
      setValidationExpenses(validationsData);
      setDemands(demandsData);
      setUsers(usersData);
      setTransactions(transactionsData);
      setCashRegisterSessions(sessionsData);

      return { expensesData, validationsData, demandsData, usersData, transactionsData, sessionsData };
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des données:", err);
      throw err;
    }
  }, [setExpenses, setValidationExpenses, setDemands, setUsers, setTransactions, setCashRegisterSessions]);

  // Fonction pour charger les données spécifiques au décaissement
  const loadExpenseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier d'abord si les données existent dans le store
      const existingExpense = expenses.find((e: Expense) => e.id === Number(id));
      if (existingExpense) {
        const validation = validationExpenses.find((v: ValidationExpense) => v.id === existingExpense.validation_expense_id);
        const demand = demands.find((d: Demand) => d.id === validation?.demand_id);
        const transaction = transactions.find((t: any) => t.id === existingExpense.transaction_id);
        const session = cashRegisterSessions.find((s: any) => s.id === transaction?.cash_register_session_id);
        const cashier = users.find((u: User) => u.id === session?.user_id);

        if (existingExpense && validation && demand && cashier) {
          setExpenseData({ expense: existingExpense, validation, demand, cashier });
          return;
        }
      }

      // Si données incomplètes, rafraîchir toutes les données
      const refreshedData = await refreshAllData();
      
      const refreshedExpense = refreshedData.expensesData.find((e: Expense) => e.id === Number(id));
      if (!refreshedExpense) {
        throw new Error("Décaissement non trouvé");
      }

      const validation = refreshedData.validationsData.find((v: ValidationExpense) => v.id === refreshedExpense.validation_expense_id);
      const demand = refreshedData.demandsData.find((d: Demand) => d.id === validation?.demand_id);
      const transaction = refreshedData.transactionsData.find((t: any) => t.id === refreshedExpense.transaction_id);
      const session = refreshedData.sessionsData.find((s: any) => s.id === transaction?.cash_register_session_id);
      const cashier = refreshedData.usersData.find((u: User) => u.id === session?.user_id);

      if (!refreshedExpense || !validation || !demand || !cashier) {
        throw new Error("Données incomplètes pour afficher le décaissement");
      }

      setExpenseData({ expense: refreshedExpense, validation, demand, cashier });

    } catch (err) {
      console.error("Erreur de chargement:", err);
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  }, [
    id,
    expenses,
    validationExpenses,
    demands,
    transactions,
    cashRegisterSessions,
    users,
    refreshAllData
  ]);

  // Charger les données au montage
  useEffect(() => {
    loadExpenseData();
  }, [loadExpenseData]);

  // Affichage des états de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement des détails du décaissement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert color="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button onClick={loadExpenseData}>
              Réessayer
            </Button>
            <Button 
              onClick={refreshAllData}
              variant="outline"
            >
              Rafraîchir toutes les données
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!expenseData) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert>
          <AlertTitle>Aucune donnée disponible</AlertTitle>
          <AlertDescription>
            Impossible de charger les données du décaissement.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button onClick={loadExpenseData}>
              Réessayer
            </Button>
            <Button 
              onClick={refreshAllData}
              variant="outline"
            >
              Rafraîchir toutes les données
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Ensure all required data is present before rendering
  if (!expenseData.expense || !expenseData.validation || !expenseData.demand || !expenseData.cashier) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert>
          <AlertTitle>Données incomplètes</AlertTitle>
          <AlertDescription>
            Impossible d'afficher le reçu car certaines données sont manquantes.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button onClick={loadExpenseData}>
              Réessayer
            </Button>
            <Button 
              onClick={refreshAllData}
              variant="outline"
            >
              Rafraîchir toutes les données
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <ExpenseReceipt 
      expense={expenseData.expense}
      validation={expenseData.validation}
      demand={expenseData.demand}
      cashier={expenseData.cashier}
    />
  );
};

export default DetailExpensePage;