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
import { fetchLevels } from "@/store/schoolservice";
import { useSchoolStore } from "@/store";
import { Loader2, PlusCircle } from "lucide-react"

const FormSchema = z.object({
  level: z.string().min(1, {
    message: "Le niveau doit comporter au moins 1 caractère.",
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface InputFormValidationProps {
  onSuccess?: () => void;
}

const InputFormValidation = ({ onSuccess }: InputFormValidationProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setLevels } = useSchoolStore();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      level: "",
    },
  });

  async function onSubmit(data: FormSchemaType) {
    setIsLoading(true);

    const response = await fetch("/api/level", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ label: data.level }),
    });

    if (response.ok) {
      const updatedLevels = await fetchLevels();
      setLevels(updatedLevels);
      toast({
        title: "Niveau créé avec succès",
        description: "Le niveau a été ajouté avec succès.",
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
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Niveau</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Ex: 6ème"
                  {...field}
                  className={cn("", {
                    "border-destructive focus:border-destructive":
                      form.formState.errors.level,
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