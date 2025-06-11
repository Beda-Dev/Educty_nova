"use client";

import { useState, useEffect } from "react";
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
import { fr } from "date-fns/locale";
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Props {
  onSuccess: () => void;
}

export default function CreateExpensePage({ onSuccess }: Props) {
  const router = useRouter();
  const {
    userOnline,
    expenseTypes,
    cashRegisters,
    cashRegisterCurrent,
    cashRegisterSessionCurrent,
    setCashRegisterSessionCurrent,
    settings,
  } = useSchoolStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "validation">("form");
  const [createdTransactionId, setCreatedTransactionId] = useState<
    number | null
  >(null);
  const [createdExpenseId, setCreatedExpenseId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      expense_type_id: 0,
      cash_register_id: cashRegisterSessionCurrent?.cash_register.id,
      comment: "",
    },
  });

  useEffect(() => {
    if (cashRegisterSessionCurrent?.cash_register?.id) {
      setValue("cash_register_id", cashRegisterSessionCurrent.cash_register.id);
    }
  }, [cashRegisterSessionCurrent, setValue]);

  const activeExpenseTypes = expenseTypes.filter((type) => type.active === 1);
  const activeCashRegisters = cashRegisters.filter(
    (register) => register.active === 1
  );

  const amount = watch("amount");

  const handleFormSubmit = async (data: any) => {
    if (!userOnline || !cashRegisterSessionCurrent) {
      console.log("User ou caisse manquant", {
        userOnline,
        cashRegisterSessionCurrent,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Étape 1: Créer la transaction
      const transactionData = {
        user_id: userOnline.id,
        cash_register_session_id: cashRegisterSessionCurrent?.id,
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
      console.log("Transaction créée :", transactionResult);
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
      console.log("Dépense créée :", expenseResult.message);
      setCreatedExpenseId(expenseResult.id);

      setStep("validation");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
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
        description:
          "La dépense a été créée et soumise pour validation avec succès",
      });

      router.push("/depense");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <Button
          variant="outline"
          onClick={() => router.push("/depense")}
          className="mb-6 gap-2 pl-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <Card className="overflow-hidden">
          <motion.div
            className="bg-primary"
            initial={{ width: 0 }}
            animate={{ width: step === "form" ? "50%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="h-1 w-full bg-primary"></div>
          </motion.div>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {step === "form" ? "1/2" : "2/2"}
              </Badge>
              <span>Nouvelle Dépense</span>
            </CardTitle>
            <CardDescription>
              {step === "form"
                ? "Remplissez les détails de la dépense"
                : "Vérifiez les informations et soumettez pour validation"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.form
                  key="form-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit(handleFormSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="label">Libellé</Label>
                      <Input
                        id="label"
                        {...register("label", {
                          required: "Ce champ est requis",
                          minLength: {
                            value: 3,
                            message:
                              "Le libellé doit contenir au moins 3 caractères",
                          },
                        })}
                        placeholder="Description de la dépense"
                        className="mt-1"
                      />
                      {errors.label && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive mt-1 flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          {errors.label.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="amount">Montant {settings[0].currency? settings[0].currency : "FCFA"}</Label>
                      <div className="relative mt-1">
                        <Input
                          id="amount"
                          type="number"
                          step="1"
                          {...register("amount", {
                            required: "Ce champ est requis",
                            min: {
                              value: 1,
                              message:
                                "Le montant doit être supérieur à 0 " + (settings[0].currency? settings[0].currency : "FCFA"),
                            },
                            valueAsNumber: true,
                          })}
                          placeholder="0"
                          className="pl-8"
                        />
                      </div>
                      {errors.amount && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive mt-1 flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          {errors.amount.message}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="expense_type_id">Type de dépense</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("expense_type_id", Number(value), {
                            shouldValidate: true,
                          })
                        }
                        value={watch("expense_type_id")?.toString() || ""}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeExpenseTypes.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                              className="hover:bg-accent"
                            >
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.expense_type_id && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive mt-1 flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          {errors.expense_type_id.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cash_register_id">Caisse</Label>
                      <Input
                        id="cash_register_id"
                        value={`Caisse ${
                          cashRegisterSessionCurrent?.cash_register
                            .cash_register_number || "Non disponible"
                        }`}
                        readOnly
                        className="mt-1 cursor-not-allowed bg-muted"
                      />
                      <input type="hidden" {...register("cash_register_id")} />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center align-center text-center">
                    <Label htmlFor="expense_date">Date</Label>
                    <Input
                      id="expense_date"
                      type="date"
                      {...register("expense_date")}
                      readOnly
                      className="mt-1 cursor-not-allowed bg-muted text-center"
                      tabIndex={-1}
                    />

                    {errors.expense_date && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive mt-1 flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        {errors.expense_date.message}
                      </motion.p>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-around gap-4 pt-4">
                    <Button
                      type="button"
                      color="destructive"
                      variant="outline"
                      onClick={() => router.back()}
                      className="min-w-[120px]"
                    >
                      Annuler
                    </Button>
                    <Button
                      color="indigodye"
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
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
                step === "validation" && (
                  <motion.form
                    key="validation-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit(handleValidationSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">
                        Récapitulatif de la dépense
                      </h3>

                      <div className="bg-muted/50 rounded-lg p-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-sm font-medium text-muted-foreground">
                              Libellé
                            </span>
                            <span className="text-sm font-medium">
                              {watch("label")}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-sm font-medium text-muted-foreground">
                              Montant
                            </span>
                            <span className="text-sm font-medium">
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "XOF",
                                currencyDisplay: "narrowSymbol",
                              }).format(parseFloat(watch("amount")))}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-sm font-medium text-muted-foreground">
                              Type de dépense
                            </span>
                            <span className="text-sm">
                              {expenseTypes.find(
                                (t) => t.id === Number(watch("expense_type_id"))
                              )?.name || "Non spécifié"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-sm font-medium text-muted-foreground">
                              Caisse
                            </span>
                            <span className="text-sm">
                              Caisse{" "}
                              {cashRegisterSessionCurrent?.cash_register
                                .cash_register_number || "Non spécifiée"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              Date
                            </span>
                            <span className="text-sm">
                              {format(new Date(watch("expense_date")), "PPP", {
                                locale: fr,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <Label htmlFor="comment">Commentaire</Label>
                      <Textarea
                        id="comment"
                        {...register("comment")}
                        placeholder="Ajoutez un commentaire pour la validation..."
                        className="min-h-[120px] mt-2"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Ce commentaire sera visible par les validateurs.
                      </p>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex justify-around gap-4 pt-4">
                      <Button
                        type="button"
                        color="destructive"
                        variant="outline"
                        onClick={() => setStep("form")}
                        className="min-w-[120px]"
                      >
                        Retour
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[180px]"
                        color="indigodye"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Validation...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Soumettre pour validation
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                )
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
