"use client";
import { ValidationExpense } from "@/lib/interface";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ValidationSectionProps {
  validationExpense: ValidationExpense;
}

export function ValidationSection({ validationExpense }: ValidationSectionProps) {
  // Function to determine badge color based on validation status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "validée":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Validée
          </Badge>
        );
      case "réjetée":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            Réjetée
          </Badge>
        );
      case "en attente":
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            En attente
          </Badge>
        );
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-blue-50 dark:bg-blue-950">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Validation Details</CardTitle>
            <CardDescription>
              Validation #{validationExpense.id}
            </CardDescription>
          </div>
          {getStatusBadge(validationExpense.validation_status)}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Validator</p>
              <p className="text-gray-900">
                {validationExpense.user?.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Validation Date</p>
              <p className="text-gray-900">
                {formatDate(validationExpense.validation_date)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Comment</p>
            <p className="text-gray-900 mt-1">
              {validationExpense.comment || "No comment provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Validation Order</p>
              <p className="text-gray-900">{validationExpense.validation_order}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">{formatDate(validationExpense.created_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}