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
import { fetchTypePeriods } from "@/store/schoolservice";
import { useSchoolStore } from "@/store";
import { Loader2, PlusCircle } from "lucide-react"

const FormSchema = z.object({
  label: z.string().min(1, {
    message: "Le type de période doit comporter au moins 1 caractère.",
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface InputFormValidationProps {
  onSuccess?: () => void;
}

const InputFormValidation = ({ onSuccess }: InputFormValidationProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setTypePeriods } = useSchoolStore();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: "",
    },
  });

  async function onSubmit(data: FormSchemaType) {
    setIsLoading(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/typePeriod`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ label: data.label }),
    });

    if (response.ok) {
      const updatedTypePeriods = await fetchTypePeriods();
      setTypePeriods(updatedTypePeriods);
      toast({
        title: "Type de période créé avec succès",
        description: "Le type de période a été ajouté avec succès.",
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
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Type de période</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Ex: Trimestre"
                  {...field}
                  className={cn("", {
                    "border-destructive focus:border-destructive":
                      form.formState.errors.label,
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