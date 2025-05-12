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
import { Card } from "@/components/ui/card";
import { useSchoolStore } from "@/store";
import { fetchFeeType } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const formSchema = z.object({
  name: z.string()
    .min(2, "Le type de document doit comporter au moins 2 caractères")
    .max(50, "Le type de document ne peut excéder 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Caractères spéciaux non autorisés"),
});

type FormValues = z.infer<typeof formSchema>;

interface InputFormValidationProps {
  onSuccess?: () => void;
}

const InputFormValidation = ({ onSuccess }: InputFormValidationProps) => {
  const { setDocumentTypes } = useSchoolStore();
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
      const response = await fetch("/api/documentType", {
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
      
      toast.success("Type de document créé avec succès", { id: toastId });
      form.reset();
      
      // Mise à jour du store
      const updatedDocType = await fetchFeeType();
      setDocumentTypes(updatedDocType);
      
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
    <Card className="p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon icon="heroicons:plus-circle" className="h-5 w-5" />
          Nouveau Type de document
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez un nouveau type de document à votre etablissement
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du type de document</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="Ex: Extrait d'act de naissance"
                    className={cn({
                      "border-destructive": form.formState.errors.name,
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="h-4 w-4 mr-2" />
                  Créer
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default InputFormValidation;