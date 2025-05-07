import React, { useMemo, useState, useEffect } from "react";
import { Pricing } from "@/lib/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

interface Props {
  tarifications: Pricing[];
  level_id: number;
  assignmenttype_id: number;
  academicyear_id: number;
  onPaymentAmountChange?: (amount: number, installmentId?: number) => void;
  onTarificationsFound?: (tarifs: Pricing[]) => void;
}

const TarificationTable: React.FC<Props> = ({ 
  tarifications, 
  level_id, 
  assignmenttype_id, 
  academicyear_id,
  onPaymentAmountChange,
  onTarificationsFound
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);

  // Filtrage des tarifications
  const filteredTarifications = useMemo(() => 
    tarifications.filter(
      (tarif) =>
        tarif.level_id === level_id &&
        tarif.assignment_type_id === assignmenttype_id &&
        tarif.academic_years_id === academicyear_id
    ),
    [tarifications, level_id, assignmenttype_id, academicyear_id]
  );

  // Notifier le parent des tarifications trouvées
  useEffect(() => {
    if (onTarificationsFound) {
      onTarificationsFound(filteredTarifications);
    }
  }, [filteredTarifications, onTarificationsFound]);

  // Calcul de la somme totale des montants
  const totalAmount = useMemo(() => 
    filteredTarifications.reduce((acc, tarif) => acc + Number(tarif.amount), 0), 
    [filteredTarifications]
  );

  // Vérification des raisons pour lesquelles aucune tarification n'est trouvée
  const getErrorMessage = useMemo(() => {
    if (!tarifications.some(tarif => tarif.level_id === level_id)) {
      return "Aucun frais de scolarité disponible pour ce niveau.";
    } 
    if (!tarifications.some(tarif => tarif.assignment_type_id === assignmenttype_id)) {
      return "Aucun frais de scolarité disponible pour ce type d'affectation.";
    } 
    if (!tarifications.some(tarif => tarif.academic_years_id === academicyear_id)) {
      return "Aucun frais de scolarité disponible pour cette année académique.";
    }
    return "Aucun frais de scolarité trouvé, veuillez vérifier vos paramètres.";
  }, [tarifications, level_id, assignmenttype_id, academicyear_id]);

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPaymentAmount(value);
    const amount = Number(value);
    
    // Vérifier que le montant ne dépasse pas le total
    if (amount > totalAmount) {
      toast.error(`Le montant ne peut pas dépasser ${totalAmount.toLocaleString()} FCFA`);
      return;
    }

    onPaymentAmountChange?.(amount, selectedInstallment || undefined);
  };

  const handleInstallmentChange = (value: string) => {
    const installmentId = Number(value);
    setSelectedInstallment(installmentId);
    onPaymentAmountChange?.(Number(paymentAmount), installmentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frais de scolarité</CardTitle>
        <Separator className="my-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredTarifications.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-red-500 font-medium">{getErrorMessage}</p>
            <p className="text-sm text-muted-foreground mt-2">
              L'enregistrement ne pourra pas être effectué sans frais de scolarité définis.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Type de frais</TableHead>
                  <TableHead className="text-right">Montant (FCFA)</TableHead>
                  <TableHead className="text-right">Échéances</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTarifications.map((tarif) => (
                  <TableRow key={tarif.id} className="hover:bg-gray-100">
                    <TableCell className="flex items-center gap-2">
                      <Badge variant="outline">{tarif.fee_type.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {Number(tarif.amount).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="text-right">
                      <Select onValueChange={handleInstallmentChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sélectionner échéance" />
                        </SelectTrigger>
                        <SelectContent>
                          {tarif.installments?.length ? tarif.installments.map((installment) => (
                            <SelectItem 
                              key={installment.id} 
                              value={installment.id.toString()}
                            >
                              {installment.due_date}
                            </SelectItem>
                          )) : (
                            <SelectItem disabled value={""}>Aucune échéance disponible</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
              <span className="font-semibold">Total à payer :</span>
              <span className="text-lg font-bold text-green-700">
                {totalAmount.toLocaleString()} FCFA
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Montant payé (FCFA)</Label>
              <Input
                id="payment"
                type="text"
                value={Number(paymentAmount).toLocaleString()}
                onChange={handlePaymentChange}
                placeholder="Entrez le montant payé"
              />
              {paymentAmount && (
                <p className="text-sm text-muted-foreground">
                  Reste à payer : {(totalAmount - Number(paymentAmount)).toLocaleString()} FCFA
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TarificationTable;