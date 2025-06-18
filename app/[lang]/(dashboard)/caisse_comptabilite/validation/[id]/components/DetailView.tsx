"use client";

import Link from "next/link";
import { 
  CashRegisterSession, 
  ValidationExpense, 
  Expense, 
  Transaction 
} from "@/lib/interface";
import { ValidationSection } from "./ValidationSection";
import { ExpenseSection } from "./ExpenseSection";
import { TransactionSection } from "./TransactionSection";
import { SessionSection } from "./SessionSection";
import { BreadcrumbItem, Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Home } from "lucide-react";

interface DetailViewProps {
  validationExpense: ValidationExpense;
  expense: Expense | null;
  transaction: Transaction | null;
  cashRegisterSession: CashRegisterSession | null;
}

export function DetailView({
  validationExpense,
  expense,
  transaction,
  cashRegisterSession,
}: DetailViewProps) {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:underline">
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/validation-expense" className="text-sm text-muted-foreground hover:underline">
            Validation Expenses
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <span className="text-sm font-medium text-foreground">
            Validation #{validationExpense.id}
          </span>
        </BreadcrumbItem>
      </Breadcrumbs>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        Expense Validation Details
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidationSection validationExpense={validationExpense} />
        {expense && <ExpenseSection expense={expense} />}
        {transaction && <TransactionSection transaction={transaction} />}
        {cashRegisterSession && <SessionSection cashRegisterSession={cashRegisterSession} />}
      </div>
    </div>
  );
}
