"use client";
import { Expense } from "@/lib/interface";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
// If you need formatCurrency, make sure to implement and export it from "@/lib/utils"

interface ExpenseSectionProps {
  expense: Expense;
}

export function ExpenseSection({ expense }: ExpenseSectionProps) {
  function formatCurrency(amount: string): import("react").ReactNode {
    const number = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(number)) return "Invalid amount";
    return number.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " FCFA";
  }
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-green-50 dark:bg-green-950">
        <CardTitle>Expense Details</CardTitle>
        <CardDescription>
          Expense #{expense.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Label</p>
            <p className="text-gray-900 font-medium text-lg">{expense.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Amount</p>
              <p className="text-gray-900 font-semibold text-lg">
                {formatCurrency(expense.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-gray-900">{formatDate(expense.expense_date)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Expense Type</p>
              <p className="text-gray-900">{expense.expense_type?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cash Register</p>
              <p className="text-gray-900">
                {expense.cash_register?.cash_register_number || "Unknown"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">{formatDate(expense.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated</p>
              <p className="text-gray-900">{formatDate(expense.updated_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}