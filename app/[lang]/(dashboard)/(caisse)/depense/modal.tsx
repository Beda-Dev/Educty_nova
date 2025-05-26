"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { CashRegister, ExpenseType, Expense  , Transaction } from "@/lib/interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { Icon } from "@iconify/react";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  expense?: Expense | null;
  isLoading: boolean;
}

const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  expense,
  isLoading,
}: ExpenseFormModalProps) => {
  const { expenseTypes, cashRegisters , transactions , cashRegisterCurrent } = useSchoolStore();

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      label: "",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      expense_type_id: 0,
      cash_register_id: 0,
    },
  });

  // Filtrer pour n'avoir que les éléments actifs
  const activeExpenseTypes = expenseTypes.filter((type) => type.active === 1);
  const activeCashRegisters = cashRegisters.filter(
    (register) => register.active === 1
  );

  const onFormSubmit = (data: any) => {
    console.log("Données du formulaire:", data);
    onSubmit({
      ...data,
      expense_type_id: Number(data.expense_type_id),
      cash_register_id: Number(data.cash_register_id),
    });
    reset();
  };

  // Initialiser les valeurs si en mode édition
  useEffect(() => {
    if (expense) {
      // Mode modification - set toutes les valeurs
      setValue("label", expense.label);
      setValue("amount", expense.amount);
      setValue("expense_date", expense.expense_date.split("T")[0]);
      setValue("expense_type_id", expense.expense_type_id);
      setValue("cash_register_id", expense.cash_register_id);
    } else {
      // Mode création - reset form
      reset({
        label: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
        expense_type_id: 0,
        cash_register_id: 0,
      });
    }
  }, [expense, setValue, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Modifier la dépense" : "Créer une nouvelle dépense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="label">Libellé*</Label>
              <Input
                id="label"
                {...register("label", { required: true })}
                placeholder="Description de la dépense"
              />
            </div>

            <div>
              <Label htmlFor="amount">Montant (CFA)*</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", {
                  required: "Le montant est requis",
                  min: {
                    value: 0.01,
                    message: "Le montant doit être supérieur à 0",
                  },
                })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <SelectContent className="z-[9999]">
                  {activeExpenseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cash_register_id">Caisse enregistreuse*</Label>
              <Select
                onValueChange={(value) =>
                  setValue("cash_register_id", Number(value))
                }
                value={watch("cash_register_id")?.toString() || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une caisse" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {activeCashRegisters.map((register) => (
                    <SelectItem
                      key={register.id}
                      value={register.id.toString()}
                    >
                      {register.cash_register_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="expense_date">Date*</Label>
            <Input
              id="expense_date"
              type="date"
              {...register("expense_date", {
                required: "La date est requise",
              })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Icon
                  icon="heroicons:arrow-path"
                  className="h-4 w-4 animate-spin"
                />
              ) : expense ? (
                "Mettre à jour"
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormModal;
