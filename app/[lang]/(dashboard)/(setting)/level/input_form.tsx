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
import {
  fetchLevels,
} from "@/store/schoolservice";
import { useSchoolStore } from "@/store";
import { Level } from "@/lib/interface";

const FormSchema = z.object({
  level: z.string().min(1, {
    message: "Le niveau doit comporter au moins 1 caractère.",
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const InputFormValidation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {setLevels} = useSchoolStore();
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
      const updatelevel:Level[] = await fetchLevels();
      setLevels(updatelevel);
      toast({
        title: "Niveau créé avec succès",
        description: "Le niveau a été ajouté avec succès.",
      });
      form.reset();
    } else {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'envoi des données  ${response}`,
      });
      console.error("");
    }

    setIsLoading(false);
  }

  return (
    <Card title="Ajouter un niveau">
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default InputFormValidation;
