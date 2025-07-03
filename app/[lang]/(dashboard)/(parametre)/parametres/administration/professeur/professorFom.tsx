"use client";

import { act, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {sendAccountInfo} from "@/lib/fonction"

// --- Ajout des champs au schéma ---
const professorSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  first_name: z.string().min(1, "Le prénom est requis"),
  number: z.string().min(1, "Le numéro est requis"),
  type: z.enum(["permanent", "vacataire"]),
  email: z.string().email("Email invalide"),
  sexe: z.enum(["masculin", "feminin"], { required_error: "Le sexe est requis" }),
  cni: z.string().optional().nullable(),
  matricule: z.string().optional().nullable(),
  access: z.boolean().optional(), // Pour le checkbox accès utilisateur
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
      sexe: "masculin",
      cni: "",
      matricule: "",
      access: true,
    },
  });

  // Vérification email déjà utilisé
  const checkEmailExists = (email: string): boolean => {
    return users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
  };

  // --- Ajout de la gestion de l'activation utilisateur ---
  const createUser = async (data: ProfessorFormType) => {
    const userData = {
      name: `${data.first_name} ${data.name}`,
      email: data.email,
      password: process.env.NEXT_PUBLIC_DEFAULT_PASSWORD,
      active: data.access ? 1 : 0, // Utilisateur actif ou non selon le checkbox
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

  // --- Ajout des champs dans professorData ---
  const createProfessor = async (data: ProfessorFormType, userId: number) => {
    const professorData = {
      name: data.name,
      first_name: data.first_name,
      number: data.number,
      type: data.type,
      user_id: userId,
      cni: data.cni || null,
      sexe: data.sexe,
      matricule: data.matricule || null,
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

      toast.success("Enseignant créé avec succès");
      onSuccess();
      // --- Envoi de l'email uniquement si accès utilisateur activé ---
      if (data.access) {
        sendAccountInfo(data.name, data.email);
      }
      // Réinitialiser le formulaire et fermer le modal
      form.reset();
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
      <DialogContent
        className="max-w-2xl w-full z-[9999] rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 animate-fade-in"
        style={{ minWidth: 320, maxWidth: 480, width: "95%" }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold mr-2">Nouveau professeur</span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700 mt-2">
            Merci de renseigner les informations du professeur. <br />
            {form.watch("access") && (
              <span className="text-blue-700 font-medium">
                Un compte utilisateur sera automatiquement créé et les accès envoyés par email.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-2 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Nom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom du professeur"
                        {...field}
                        disabled={loading}
                        className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    <FormLabel className="font-semibold text-blue-900">Prénom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Prénom du professeur"
                        {...field}
                        disabled={loading}
                        className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Numéro *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Numéro du professeur"
                        {...field}
                        disabled={loading}
                        className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    <FormLabel className="font-semibold text-blue-900">Type *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
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
            </div>
            {/* Ligne responsive pour sexe, cni, matricule */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sexe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Sexe *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                          <SelectValue placeholder="Sexe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="masculin">Masculin</SelectItem>
                        <SelectItem value="feminin">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Numéro CNI</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Numéro CNI (facultatif)"
                        {...field}
                        value={field.value ?? ""}
                        disabled={loading}
                        className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Matricule</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Matricule"
                        {...field}
                        value={field.value ?? ""}
                        disabled={loading}
                        className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-blue-900">Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      disabled={loading}
                      className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            {/* Checkbox accès utilisateur */}
            <FormField
              control={form.control}
              name="access"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                      id="access-checkbox"
                    />
                  </FormControl>
                  <FormLabel htmlFor="access-checkbox" className="font-semibold text-blue-900 cursor-pointer">
                    Accès utilisateur (permet la connexion à la plateforme)
                  </FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 pt-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  color="destructive"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-lg border-0 font-semibold transition-all"
                >
                  Annuler
                </Button>
              </DialogClose>
              <Button
                color='indigodye'
                type="submit"
                disabled={loading || !!emailError}
                className="flex-1 rounded-lg font-bold shadow-lg hover:scale-105 transition-all"
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