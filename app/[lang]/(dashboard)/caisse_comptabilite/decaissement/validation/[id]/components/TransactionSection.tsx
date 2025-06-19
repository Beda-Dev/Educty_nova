"use client";
import { Transaction } from "@/lib/interface";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TransactionSectionProps {
  transaction: Transaction;
}

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

export function TransactionSection({ transaction }: TransactionSectionProps) {
  // Function to get transaction type badge
  const getTransactionTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "income":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Income
          </Badge>
        );
      case "expense":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            Expense
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            {type}
          </Badge>
        );
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-purple-50 dark:bg-purple-950">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Transaction #{transaction.id}
            </CardDescription>
          </div>
          {getTransactionTypeBadge(transaction.transaction_type)}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-gray-900 font-semibold text-lg">
                {formatCurrency(transaction.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Transaction Date</p>
              <p className="text-gray-900">
                {formatDate(transaction.transaction_date)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User</p>
              <p className="text-gray-900">
                {transaction.user?.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Session ID</p>
              <p className="text-gray-900">
                {transaction.cash_register_session_id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">{formatDate(transaction.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated</p>
              <p className="text-gray-900">{formatDate(transaction.updated_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}