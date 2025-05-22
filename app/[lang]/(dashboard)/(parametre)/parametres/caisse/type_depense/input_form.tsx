"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { fetchExpenseType } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Pencil } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .max(50, "Le nom ne peut excéder 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-']+$/, "Caractères spéciaux non autorisés"),
});

type FormValues = z.infer<typeof formSchema>;

interface InputFormValidationProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const ExpenseTypeForm = ({ onSuccess, onClose }: InputFormValidationProps) => {
  const { setExpenseTypes } = useSchoolStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Création en cours...");

    try {
      const response = await fetch("/api/expenseType", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la création");
      }

      toast.success("Type de dépense créé avec succès", { id: toastId });
      form.reset();

      // Mise à jour du store
      const updatedTypes = await fetchExpenseType();
      setExpenseTypes(updatedTypes);

      // Rafraîchissement côté client
      router.refresh();

      // Callback personnalisé
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Ajouter un type de dépense
        </DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du type de dépense </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="Ex: Fournitures de bureau"
                    className={cn({
                      "border-destructive": form.formState.errors.name,
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-around gap-3 pt-4">
            <Button
              type="button"
              color="destructive"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
            color="indigodye"
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="h-4 w-4 animate-spin mr-2"
                  />
                  Enregistrement...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ExpenseTypeForm;