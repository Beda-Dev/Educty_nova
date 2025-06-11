"use client";
import { CashRegisterSession } from "@/lib/interface";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSchoolStore } from "@/store/index";

interface SessionSectionProps {
  cashRegisterSession: CashRegisterSession;
}



export function SessionSection({ cashRegisterSession }: SessionSectionProps) {
  const {settings} = useSchoolStore()
  // Function to get session status badge
  const getStatusBadge = (status: string) => {
    return status === "open" ? (
      <Badge className="bg-green-500 hover:bg-green-600">
        Open
      </Badge>
    ) : (
      <Badge className="bg-gray-500 hover:bg-gray-600">
        Closed
      </Badge>
    );
  };

  

  function formatCurrency(amount: string): import("react").ReactNode {
    const number = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(number)) return "Invalid amount";
    return number.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " " + (settings[0].currency? settings[0].currency : "FCFA");
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-amber-50 dark:bg-amber-950">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Cash Register Session</CardTitle>
            <CardDescription>
              Session #{cashRegisterSession.id}
            </CardDescription>
          </div>
          {getStatusBadge(cashRegisterSession.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Opening Amount</p>
              <p className="text-gray-900 font-medium">
                {formatCurrency(cashRegisterSession.opening_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Closing Amount</p>
              <p className="text-gray-900 font-medium">
                {formatCurrency(cashRegisterSession.closing_amount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Opening Date</p>
              <p className="text-gray-900">
                {formatDate(cashRegisterSession.opening_date)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Closing Date</p>
              <p className="text-gray-900">
                {cashRegisterSession.closing_date 
                  ? formatDate(cashRegisterSession.closing_date) 
                  : "Not closed yet"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User</p>
              <p className="text-gray-900">
                {cashRegisterSession.user?.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cash Register</p>
              <p className="text-gray-900">
                {cashRegisterSession.cash_register?.cash_register_number || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}