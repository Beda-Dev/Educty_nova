"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSchoolStore } from "@/store";
import { fetchCashRegister } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { CashRegister } from "@/lib/interface";

const cashRegisterSchema = z.object({
  cash_register_number: z.string().trim().min(1, "Le numéro est requis"),
});

type CashRegisterFormValues = z.infer<typeof cashRegisterSchema>;

interface EditCashRegisterFormProps {
  cashRegister: CashRegister;
  onSuccess: () => void;
}

export default function EditCashRegisterForm({ 
  cashRegister, 
  onSuccess 
}: EditCashRegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setCashRegisters } = useSchoolStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<CashRegisterFormValues>({
    resolver: zodResolver(cashRegisterSchema),
    defaultValues: {
      cash_register_number: cashRegister.cash_register_number,
    },
  });

  const onSubmit = async (data: CashRegisterFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/cashRegister?id=${cashRegister.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedCashRegisters = await fetchCashRegister();
      setCashRegisters(updatedCashRegisters);
      onSuccess();
      router.refresh();

      toast.success("Caisse mise à jour avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cash_register_number">Numéro de caisse </Label>
        <Input
          id="cash_register_number"
          {...register("cash_register_number")}
          placeholder="Ex: CAISSE-001"
        />
        {errors.cash_register_number && (
          <p className="text-sm text-destructive">
            {errors.cash_register_number.message}
          </p>
        )}
      </div>
      <div className="flex justify-between gap-3 pt-4">
        <Button
          color="destructive"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
        color="tyrian"
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Mettre à jour"
          )}
        </Button>
      </div>
    </form>
  );
}