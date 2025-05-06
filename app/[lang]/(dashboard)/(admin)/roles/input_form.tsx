"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card-snippet";
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
import { fetchRoles } from "@/store/schoolservice";
import { useSchoolStore } from "@/store";
import { Role } from "@/lib/interface";

// Schéma de validation plus strict
const FormSchema = z.object({
  name: z.string()
    .min(2, {
      message: "Le rôle doit comporter au moins 2 caractères.",
    })
    .max(50, {
      message: "Le rôle ne doit pas dépasser 50 caractères.",
    })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
      message: "Seules les lettres, espaces, apostrophes et traits d'union sont autorisés.",
    })
    .transform(val => val.trim()) // Supprime les espaces avant/après
    .refine(val => val.length > 0, {
      message: "Le nom ne peut pas être vide.",
    }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const InputFormValidation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setRoles } = useSchoolStore();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: FormSchemaType) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Succès",
        description: "Le rôle a été créé avec succès."
      });

      const updatedRoles: Role[] = await fetchRoles();
      if (updatedRoles) {
        setRoles(updatedRoles);
      }
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error 
          ? error.message 
          : "Une erreur inconnue est survenue"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card title="Ajouter un rôle">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Nom du rôle</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Ex: Administrateur"
                    {...field}
                    className={cn({
                      "border-destructive focus:border-destructive":
                        form.formState.errors.name,
                    })}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground mt-1">
                  Lettres, espaces, apostrophes et traits d'union uniquement
                </p>
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Création en cours..." : "Créer le rôle"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default InputFormValidation;