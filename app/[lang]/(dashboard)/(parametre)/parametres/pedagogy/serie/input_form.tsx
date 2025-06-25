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
import { toast } from "@/components/ui/use-toast";
import {  fetchClasses , fetchSeries } from "@/store/schoolservice";
import { useSchoolStore } from "@/store";
import { Loader2, PlusCircle } from "lucide-react"

const FormSchema = z.object({
  serie: z.string().min(1, {
    message: "La série doit comporter au moins 1 caractère.",
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface InputFormValidationProps {
  onSuccess?: () => void;
}

const InputFormValidation = ({ onSuccess }: InputFormValidationProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {  setClasses , setSeries } = useSchoolStore();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      serie: "",
    },
  });

  async function onSubmit(data: FormSchemaType) {
    setIsLoading(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/serie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ label: data.serie }),
    });

    if (response.ok) {
      const updatedSerie = await fetchSeries();
      setSeries(updatedSerie);
      const updatedClasses = await fetchClasses();
      setClasses(updatedClasses);
      toast({
        title: "série créée avec succès",
        description: "La série a été ajoutée avec succès.",
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi des données",
      });
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="serie"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Série</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Ex: A, B, C, D, E"
                  {...field}
                  className={cn("", {
                    "border-destructive focus:border-destructive":
                      form.formState.errors.serie,
                  })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-around">

          <Button color="destructive" type="button" onClick={() => {
            if (onSuccess) {
              onSuccess();
            }
          }} disabled={isLoading}>
            Annuler
          </Button>

          <Button color="indigodye" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2"><Loader2 className="h-4 w-4" /></span>
                Ajout en cours...
              </>) :
              <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter
              </>
            }
          </Button>
        </div>
      </form>
    </Form >
  );
};

export default InputFormValidation;