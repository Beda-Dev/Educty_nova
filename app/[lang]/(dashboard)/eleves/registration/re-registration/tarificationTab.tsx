import React, { useMemo, useEffect } from "react";
import { Pricing } from "@/lib/interface";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CircleAlert, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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

  const feesData = useMemo(
    () =>
      filteredTarifications.map((tarif) => ({
        label: tarif.fee_type.label,
        amount: Number(tarif.amount),
      })),
    [filteredTarifications]
  );

  const totalAmount = useMemo(
    () => feesData.reduce((acc, fee) => acc + fee.amount, 0),
    [feesData]
  );

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
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Separator />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Frais scolaires à payer</h3>
        {filteredTarifications.length > 0 && (
          <Badge color="secondary" className="px-3 py-1">
            {filteredTarifications.length} type{filteredTarifications.length > 1 ? "s" : ""} de frais
          </Badge>
        )}
      </div>

      <Separator />

      {filteredTarifications.length === 0 ? (
        <Alert color="destructive" className="border-none">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Aucun frais scolaire configuré</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Aucune tarification trouvée pour cette combinaison (niveau, type d'affectation, année académique).
            </p>
            <div className="flex items-start gap-2 mt-2 text-sm">
              <Settings className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Veuillez vérifier les paramètres dans <strong>Scolarité → Frais scolaires → Tarification</strong>
              </span>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60%]">Type de frais</TableHead>
                  <TableHead className="text-right w-[40%]">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feesData.map((fee, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{fee.label}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      <span className="text-primary">
                        {fee.amount.toLocaleString("fr-FR")} FCFA
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium">Total à payer :</span>
            <span className="text-xl font-bold text-primary">
              {totalAmount.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default TarificationTable;