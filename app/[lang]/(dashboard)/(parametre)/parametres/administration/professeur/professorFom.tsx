"use client";

import { useState } from "react";
import { useSchoolStore } from "@/store";
import { Professor } from "@/lib/interface";
import { fetchProfessor , fetchUsers } from "@/store/schoolservice";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const professorSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  first_name: z.string().min(1, "Le prénom est requis"),
  number: z.string().min(1, "Le numéro est requis"),
  type: z.enum(["permanent", "vacataire"]),
  email: z.string().email("Email invalide"),
});

type ProfessorFormType = z.infer<typeof professorSchema>;

interface ProfessorFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfessorForm({ open, onClose, onSuccess }: ProfessorFormProps) {
  const { setProfessor , setUsers, users } = useSchoolStore();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const form = useForm<ProfessorFormType>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      name: "",
      first_name: "",
      number: "",
      type: "permanent",
      email: "",
    },
  });

  // Vérification email déjà utilisé
  const checkEmailExists = (email: string) => {
    return users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
  };

  const createUser = async (data: ProfessorFormType) => {
    const userData = {
      name: `${data.first_name} ${data.name}`,
      email: data.email,
      password: process.env.NEXT_PUBLIC_DEFAULT_PASSWORD,
    };

    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de l'utilisateur");
    }

    const newUser = await response.json();
    return newUser.id;
  };

  const createProfessor = async (data: ProfessorFormType, userId: number) => {
    const professorData = {
      name: data.name,
      first_name: data.first_name,
      number: data.number,
      type: data.type,
      user_id: userId,
    };

    const response = await fetch("/api/professors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(professorData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création du professeur");
    }

    return await response.json();
  };

  const onSubmit = async (data: ProfessorFormType) => {
    setEmailError(null);
    if (checkEmailExists(data.email)) {
      setEmailError("Cet email est déjà utilisé par un autre utilisateur.");
      return;
    }
    setLoading(true);
    try {
      // Toujours créer un utilisateur
      const userId = await createUser(data);
      await createProfessor(data, userId);
      const updatedProfessor = await fetchProfessor();
      setProfessor(updatedProfessor as Professor[]);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);

      toast.success("Professeur créé avec succès");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.message || "Une erreur est survenue lors de la création"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md w-full z-[9999]">
        <DialogHeader>
          <DialogTitle>Ajouter un professeur</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire pour ajouter un nouveau professeur.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom du professeur"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Prénom du professeur"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Numéro du professeur"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[9999]"> 
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="vacataire">Vacataire</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      disabled={loading}
                      onBlur={(e) => {
                        field.onBlur?.();
                        if (e.target.value && checkEmailExists(e.target.value)) {
                          setEmailError("Cet email est déjà utilisé par un autre utilisateur.");
                        } else {
                          setEmailError(null);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {emailError && (
                    <span className="text-destructive text-xs">{emailError}</span>
                  )}
                </FormItem>
              )}
            />
            <DialogFooter className="flex space-x-3 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  color="destructive"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </DialogClose>
              <Button
                color='indigodye'
                type="submit"
                disabled={loading || !!emailError}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}