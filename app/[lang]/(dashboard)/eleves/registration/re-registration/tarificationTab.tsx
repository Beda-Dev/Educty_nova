import React, { useMemo, useEffect } from "react";
import { Pricing } from "@/lib/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  tarifications: Pricing[];
  level_id: number;
  assignmenttype_id: number;
  academicyear_id: number;
  TarificationsFound: (hasTarifications: boolean) => void;
  onTarificationsData: (data: { fees: { label: string; amount: number }[]; total: number }) => void;
  isLoading?: boolean;
}

const TarificationTable: React.FC<Props> = ({
  tarifications,
  level_id,
  assignmenttype_id,
  academicyear_id,
  TarificationsFound,
  onTarificationsData,
  isLoading = false,
}) => {
  // Filtrage des tarifications
  const filteredTarifications = useMemo(
    () =>
      tarifications.filter(
        (tarif) =>
          tarif.level_id === level_id &&
          tarif.assignment_type_id === assignmenttype_id &&
          tarif.academic_years_id === academicyear_id
      ),
    [tarifications, level_id, assignmenttype_id, academicyear_id]
  );

  // Préparer les données des frais trouvés
  const feesData = useMemo(
    () =>
      filteredTarifications.map((tarif) => ({
        label: tarif.fee_type.label,
        amount: Number(tarif.amount),
      })),
    [filteredTarifications]
  );

  // Calcul de la somme totale des montants
  const totalAmount = useMemo(
    () => feesData.reduce((acc, fee) => acc + fee.amount, 0),
    [feesData]
  );

  // Notifier le parent si aucune tarification n'est trouvée
  useEffect(() => {
    const hasTarifications = filteredTarifications.length > 0;
    TarificationsFound(hasTarifications);

    onTarificationsData({
      fees: feesData,
      total: totalAmount,
    });
  }, [filteredTarifications, feesData, totalAmount, TarificationsFound, onTarificationsData]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Separator className="my-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Détails des tarifications</span>
          {filteredTarifications.length > 0 && (
            <Badge variant="outline" className="px-2 py-1 text-sm">
              {filteredTarifications.length} type{filteredTarifications.length > 1 ? "s" : ""} de frais
            </Badge>
          )}
        </CardTitle>
        <Separator className="my-2" />
      </CardHeader>
      <CardContent>
        {filteredTarifications.length === 0 ? (
          <Alert variant="outline" color="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Aucune tarification trouvée pour cette combinaison (niveau, type d'affectation, année académique).
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="w-[60%]">Type de frais</TableHead>
                    <TableHead className="text-right w-[40%]">Montant (FCFA)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feesData.map((fee, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/50" : ""}>
                      <TableCell>
                        <Badge variant="outline" color="secondary" className="font-normal">
                          {fee.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        <span className="text-green-600 dark:text-green-400">
                          {fee.amount.toLocaleString("fr-FR")} FCFA
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border">
              <span className="font-medium text-gray-600 dark:text-gray-300">Total à payer :</span>
              <span className="text-xl font-bold text-green-700 dark:text-green-400">
                {totalAmount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TarificationTable;