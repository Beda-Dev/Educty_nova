"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { useSchoolStore } from "@/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Registration, Pricing } from "@/lib/interface";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface PaymentFormProps {
  registration: Registration;
  levelId?: number;
  assignment_type_id?: number;
  academic_years_id?: number;
  submit?: boolean;
  onSuccess:()=> void;
  Sub:() => void;
}

interface PaymentAllocation {
  installment_id: number;
  due_date: string;
  fee_type: string;
  amount_due: number;
  amount_paid: number;
  remaining: number;
}

export default function PaymentForm({
  registration,
  submit,
  onSuccess,
  Sub
}: PaymentFormProps) {
  const { userOnline, cashRegisterSessionCurrent, pricing } = useSchoolStore();
  const router = useRouter();
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalAmountDue, setTotalAmountDue] = useState(0);

  // Initialiser les allocations
  useEffect(() => {
    const initialAllocations: PaymentAllocation[] = [];
    let totalDue = 0;

    pricing.forEach((pricingItem) => {
      pricingItem?.installments?.forEach((installment) => {
        initialAllocations.push({
          installment_id: installment.id,
          due_date: installment.due_date,
          fee_type: pricingItem.fee_type.label,
          amount_due: Number(installment.amount_due),
          amount_paid: 0,
          remaining: Number(installment.amount_due),
        });
        totalDue += Number(installment.amount_due);
      });
    });

    setAllocations(initialAllocations);
    setTotalAmountDue(totalDue);
    setTotalRemaining(totalDue);
  }, [pricing]);

  // Mettre à jour le total restant lorsque les allocations changent
  useEffect(() => {
    const totalAllocated = allocations.reduce(
      (sum, item) => sum + item.amount_paid,
      0
    );
    const totalRemaining = allocations.reduce(
      (sum, item) => sum + (item.amount_due - item.amount_paid),
      0
    );

    setTotalAllocated(totalAllocated);
    setTotalRemaining(totalRemaining);
  }, [allocations]);

  useEffect(() => {
    const submitPayment = async () => {
      if (submit === true) {
        if (
          isSubmitting ||
          amountPaid <= 0 ||
          Math.abs(totalAllocated - amountPaid) > 1
        ) {
            Sub();
          toast.error("Veuillez vérifier les montants avant de soumettre.");
          return;
        }
        try {
          await handleSubmit();
        } catch (error) {
          console.error("Erreur lors de la soumission:", error);
          toast.error("Erreur lors de la soumission du paiement");
        }
      }
    };

    submitPayment();
  }, [submit, isSubmitting, amountPaid, totalAllocated]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAmountPaid(value);
  };

  const handleAllocationChange = (index: number, value: number) => {
    if (isNaN(value) || value < 0) return;

    const newAllocations = [...allocations];
    const allocation = newAllocations[index];

    // Montant maximum possible pour cette allocation
    const maxForThisAllocation = allocation.amount_due;

    // Montant déjà alloué aux autres lignes
    const otherAllocationsTotal = newAllocations.reduce(
      (sum, alloc, idx) => (idx !== index ? sum + alloc.amount_paid : sum),
      0
    );

    // Montant disponible pour cette allocation
    const availableAmount = Math.max(0, amountPaid - otherAllocationsTotal);

    // Montant final : min entre ce qui est demandé, le max possible et le disponible
    const finalAmount = Math.min(value, maxForThisAllocation, availableAmount);

    allocation.amount_paid = finalAmount;
    allocation.remaining = allocation.amount_due - finalAmount;

    setAllocations(newAllocations);
  };

  const autoDistribute = () => {
    if (amountPaid <= 0) return;

    let remainingAmount = amountPaid;
    const newAllocations = allocations.map((alloc) => ({
      ...alloc,
      amount_paid: 0, // ✅ Réinitialiser
      remaining: alloc.amount_due, // ✅ Réinitialiser
    }));

    // Distribuer par ordre chronologique
    newAllocations
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .forEach((alloc) => {
        if (remainingAmount > 0) {
          const toPay = Math.min(alloc.amount_due, remainingAmount);
          alloc.amount_paid = toPay;
          alloc.remaining = alloc.amount_due - toPay;
          remainingAmount -= toPay;
        }
      });

    setAllocations(newAllocations);
  };

const handleSubmit = async () => {
  if (!userOnline || !cashRegisterSessionCurrent) {
    toast.error("Session invalide. Veuillez vous reconnecter.");
    return;
  }

  if (amountPaid <= 0) {
    toast.error("Veuillez entrer un montant valide");
    return;
  }

  const TOLERANCE = 1;
  if (Math.abs(totalAllocated - amountPaid) > TOLERANCE) {
    toast.error("Le montant alloué doit correspondre au montant payé");
    return;
  }

  setIsSubmitting(true);
  const toastId = toast.loading("Enregistrement des paiements...");

  try {
    const paymentsToProcess = allocations.filter((a) => a.amount_paid > 0);

    if (paymentsToProcess.length === 0) {
      throw new Error("Aucun paiement à traiter");
    }

    const results = [];
    for (const payment of paymentsToProcess) {
      const payload = {
        student_id: registration.student.id,
        installment_id: payment.installment_id,
        cash_register_id: cashRegisterSessionCurrent.cash_register_id,
        cashier_id: userOnline.id,
        amount: payment.amount_paid.toString(),
      };

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(
          `Échec du paiement pour l'échéance ${payment.installment_id}: ${errorDetail}`
        );
      }

      const result = await response.json();
      results.push(result);
    }

    toast.success("Paiements enregistrés avec succès", { id: toastId });
    onSuccess()
  } catch (error) {
    console.error("Erreur complète:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Une erreur inconnue est survenue";
    toast.error(errorMessage, { id: toastId });
  } finally {
    setIsSubmitting(false);
  }
};

  const paymentProgress =
    totalAmountDue > 0
      ? ((totalAmountDue - totalRemaining) / totalAmountDue) * 100
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Paiement pour {registration.student.name}{" "}
          {registration.student.first_name}
        </h1>
        <Badge
          color={totalRemaining === 0 ? "success" : "warning"}
          className="text-sm"
        >
          {totalRemaining === 0 ? "Complet" : "En cours"}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progression du paiement</span>
          <span>{Math.round(paymentProgress)}%</span>
        </div>
        <Progress value={paymentProgress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Montant total dû</CardDescription>
            <CardTitle className="text-2xl">
              {totalAmountDue.toLocaleString("fr-FR")} FCFA
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Montant payé</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {(totalAmountDue - totalRemaining).toLocaleString("fr-FR")} FCFA
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reste à payer</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {totalRemaining.toLocaleString("fr-FR")} FCFA
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Nouveau paiement</CardTitle>
              <CardDescription>
                Entrez le montant payé et répartissez-le
              </CardDescription>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={autoDistribute}
                    variant="outline"
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Distribuer automatiquement
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Distribue le montant payé sur les échéances dans l'ordre
                  chronologique
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant payé (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                value={amountPaid}
                onChange={handleAmountChange}
                placeholder="Entrez le montant payé"
                className="text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label>Montant alloué</Label>
              <div
                className={`text-2xl font-bold ${
                  totalAllocated === amountPaid
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {totalAllocated.toLocaleString("fr-FR")} FCFA
                {totalAllocated !== amountPaid && (
                  <AlertCircle className="h-4 w-4 ml-2 inline-block" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition du paiement</CardTitle>
          <CardDescription>
            Allouez le montant payé aux différentes échéances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Type de frais</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Montant dû</TableHead>
                  <TableHead className="text-right">Montant payé</TableHead>
                  <TableHead className="text-right">Reste à payer</TableHead>
                  <TableHead className="w-[180px]">Allocation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((allocation, index) => (
                  <TableRow key={allocation.installment_id}>
                    <TableCell className="font-medium">
                      {allocation.fee_type}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {new Date(allocation.due_date).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(allocation.due_date) < new Date() ? (
                            <span className="text-red-600">
                              Échéance dépassée
                            </span>
                          ) : (
                            "À venir"
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {allocation.amount_due.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                    <TableCell className="text-right">
                      {allocation.amount_paid > 0 ? (
                        <span className="text-green-600 font-medium">
                          {allocation.amount_paid.toLocaleString("fr-FR")} FCFA
                        </span>
                      ) : (
                        "0 FCFA"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {allocation.remaining > 0 ? (
                        <span className="text-red-600">
                          {allocation.remaining.toLocaleString("fr-FR")} FCFA
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Payé
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={allocation.amount_paid}
                        onChange={(e) =>
                          handleAllocationChange(
                            index,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min={0}
                        max={allocation.amount_due}
                        disabled={allocation.remaining <= 0}
                        className="text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
