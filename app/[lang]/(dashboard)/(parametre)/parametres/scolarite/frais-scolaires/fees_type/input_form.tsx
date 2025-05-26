"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { toast } from "sonner";
import { useSchoolStore } from "@/store";
import { fetchFeeType } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const formSchema = z.object({
  label: z.string()
    .min(2, "Le type de frais doit comporter au moins 2 caractères")
    .max(50, "Le type de frais ne peut excéder 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Caractères spéciaux non autorisés"),
});

type FormValues = z.infer<typeof formSchema>;

interface InputFormValidationProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const InputFormValidation = ({ onSuccess, onClose }: InputFormValidationProps) => {
  const { setFeeTypes } = useSchoolStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Création en cours...");

    try {
      const response = await fetch("/api/feeType", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const result = await response.json();
      
      toast.success("Type de frais créé avec succès", { id: toastId });
      form.reset();
      
      // Mise à jour du store
      const updatedFeeTypes = await fetchFeeType();
      setFeeTypes(updatedFeeTypes);
      
      // Rafraîchissement côté client
      router.refresh();
      
      // Callback personnalisé
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Une erreur est survenue",
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
          <PlusCircle className="h-5 w-5" />
          Nouveau Type de Frais
        </DialogTitle>
        <DialogDescription>
          Ajoutez un nouveau type de frais à votre établissement
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Libellé du type de frais</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="Ex: Frais de scolarité"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-around gap-3 pt-4">
            <Button
              color="destructive"
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
              color="indigodye"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default InputFormValidation;