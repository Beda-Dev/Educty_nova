"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store";
import { ExpenseType, CashRegister } from "@/lib/interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function CreateExpensePage() {
  const router = useRouter();
  const {
    userOnline,
    expenseTypes,
    cashRegisters,
    cashRegisterCurrent,
    setCashRegisterSessionCurrent,
    settings,
  } = useSchoolStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "validation">("form");
  const [createdTransactionId, setCreatedTransactionId] = useState<number | null>(null);
  const [createdExpenseId, setCreatedExpenseId] = useState<number | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      label: "",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      expense_type_id: 0,
      cash_register_id: cashRegisterCurrent?.id || 0,
      comment: "",
    },
  });

  // Filtrer pour n'avoir que les éléments actifs
  const activeExpenseTypes = expenseTypes.filter((type) => type.active === 1);
  const activeCashRegisters = cashRegisters.filter(
    (register) => register.active === 1
  );

  const handleFormSubmit = async (data: any) => {
    if (!userOnline || !cashRegisterCurrent) return;

    setIsSubmitting(true);

    try {
      // Étape 1: Créer la transaction
      const transactionData = {
        user_id: userOnline.id,
        cash_register_session_id: cashRegisterCurrent.id,
        transaction_date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        total_amount: data.amount,
        transaction_type: "décaissement",
      };

      const transactionResponse = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!transactionResponse.ok) {
        throw new Error("Erreur lors de la création de la transaction");
      }

      const transactionResult = await transactionResponse.json();
      setCreatedTransactionId(transactionResult.id);

      // Étape 2: Créer la dépense
      const expenseData = {
        label: data.label,
        amount: data.amount,
        expense_date: data.expense_date,
        expense_type_id: Number(data.expense_type_id),
        cash_register_id: Number(data.cash_register_id),
        transaction_id: transactionResult.id,
      };

      const expenseResponse = await fetch("/api/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      if (!expenseResponse.ok) {
        throw new Error("Erreur lors de la création de la dépense");
      }

      const expenseResult = await expenseResponse.json();
      setCreatedExpenseId(expenseResult.id);

      // Passer à l'étape de validation
      setStep("validation");

    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationSubmit = async (data: any) => {
    if (!userOnline || !createdExpenseId) return;

    setIsSubmitting(true);

    try {
      // Étape 3: Valider la dépense
      const validationData = {
        user_id: userOnline.hierarchical_id || userOnline.id,
        expense_id: createdExpenseId,
        validation_date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        comment: data.comment,
        validation_order: 1,
        validation_status: "en attente",
      };

      const validationResponse = await fetch("/api/validationExpense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationData),
      });

      if (!validationResponse.ok) {
        throw new Error("Erreur lors de la validation de la dépense");
      }

      toast({
        title: "Succès",
        description: "La dépense a été créée et soumise pour validation avec succès",
      });

      router.push("/depenses");

    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userOnline) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Accès non autorisé</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Vous devez être connecté pour accéder à cette page</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2 pl-0 hover:bg-transparent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Nouvelle Dépense</CardTitle>
            <CardDescription>
              {step === "form" 
                ? "Remplissez les détails de la dépense"
                : "Ajoutez un commentaire pour la validation"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "form" ? (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="label">Libellé*</Label>
                    <Input
                      id="label"
                      {...register("label", { required: "Ce champ est requis" })}
                      placeholder="Description de la dépense"
                    />
                    {errors.label && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.label.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amount">Montant {settings[0].currency? settings[0].currency : "FCFA"}</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...register("amount", {
                        required: "Ce champ est requis",
                        min: {
                          value: 0.01,
                          message: "Le montant doit être supérieur à 0",
                        },
                      })}
                      placeholder="0.00"
                    />
                    {errors.amount && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="expense_type_id">Type de dépense*</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("expense_type_id", Number(value))
                      }
                      value={watch("expense_type_id")?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeExpenseTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.expense_type_id && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.expense_type_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cash_register_id">Caisse*</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("cash_register_id", Number(value))
                      }
                      value={watch("cash_register_id")?.toString() || cashRegisterCurrent?.id.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une caisse" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCashRegisters.map((register) => (
                          <SelectItem key={register.id} value={register.id.toString()}>
                            Caisse {register.cash_register_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cash_register_id && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.cash_register_id.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="expense_date">Date*</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    {...register("expense_date", {
                      required: "Ce champ est requis",
                    })}
                  />
                  {errors.expense_date && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.expense_date.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Suivant"
                    )}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit(handleValidationSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-medium">Récapitulatif</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-muted-foreground">Libellé:</div>
                    <div>{watch("label")}</div>
                    <div className="text-muted-foreground">Montant:</div>
                    <div>{watch("amount")} FCFA</div>
                    <div className="text-muted-foreground">Type:</div>
                    <div>
                      {expenseTypes.find(t => t.id === Number(watch("expense_type_id")))?.name}
                    </div>
                    <div className="text-muted-foreground">Caisse:</div>
                    <div>
                      Caisse {cashRegisters.find(c => c.id === Number(watch("cash_register_id")))?.cash_register_number}
                    </div>
                    <div className="text-muted-foreground">Date:</div>
                    <div>
                      {format(new Date(watch("expense_date")), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment">Commentaire (optionnel)</Label>
                  <Textarea
                    id="comment"
                    {...register("comment")}
                    placeholder="Ajoutez un commentaire pour la validation"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("form")}
                  >
                    Retour
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      "Soumettre pour validation"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}