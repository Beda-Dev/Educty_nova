"use client";

import { act, useState } from "react";
import { useSchoolStore } from "@/store";
import { Professor } from "@/lib/interface";
import { fetchProfessor, fetchUsers } from "@/store/schoolservice";
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
import { sendAccountInfo } from "@/lib/fonction";
import { FileUploader } from "./components/file-uploader";

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
  access: z.boolean().optional(),
  photo: z.any().optional().nullable(),
  number_of_years_of_teaching: z.number().optional().nullable(),
  date_of_teaching_authorization: z.string().optional().nullable(),
  subject_taught: z.string().optional().nullable(),
  graduate: z.string().optional().nullable(),
  cnps_social_security_number: z.string().optional().nullable(),
  official: z.boolean().optional(),
});

type ProfessorFormType = z.infer<typeof professorSchema>;

interface ProfessorFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfessorForm({ open, onClose, onSuccess }: ProfessorFormProps) {
  const { setProfessor, setUsers, users, professor, matters } = useSchoolStore();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
      photo: null,
      number_of_years_of_teaching: null,
      date_of_teaching_authorization: "",
      subject_taught: "",
      graduate: "",
      cnps_social_security_number: "",
      official: false,
    },
  });

  const checkEmailExists = (email: string): boolean => {
    return users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFile(file);
      setFilePreview(URL.createObjectURL(file));
      form.setValue("photo", file);
    } else {
      setFile(null);
      setFilePreview(null);
      form.setValue("photo", null);
    }
  };

  const createUser = async (data: ProfessorFormType) => {
    const formData = new FormData();
    formData.append("name", `${data.first_name} ${data.name}`);
    formData.append("email", data.email);
    formData.append("password", process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "");
    formData.append("active", data.access ? "1" : "0");
    
    if (file) {
      formData.append("avatar", file);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de l'utilisateur");
    }

    const newUser = await response.json();
    return newUser.id;
  };

  const createProfessor = async (data: ProfessorFormType, userId: number) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("first_name", data.first_name);
    formData.append("number", data.number);
    formData.append("type", data.type);
    formData.append("user_id", userId.toString());
    formData.append("cni", data.cni || "");
    formData.append("sexe", data.sexe);
    formData.append("matricule", data.matricule || "");
    formData.append("number_of_years_of_teaching", data.number_of_years_of_teaching?.toString() || "");
    formData.append("date_of_teaching_authorization", data.date_of_teaching_authorization || "");
    formData.append("subject_taught", data.subject_taught || "");
    formData.append("graduate", data.graduate || "");
    formData.append("cnps_social_security_number", data.cnps_social_security_number || "");
    formData.append("official", data.official ? "1" : "0");
    
    if (file) {
      formData.append("photo", file);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/professor`, {
      method: "POST",
      body: formData,
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
      const userId = await createUser(data);
      await createProfessor(data, userId);
      const updatedProfessor = await fetchProfessor();
      setProfessor(updatedProfessor as Professor[]);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);

      toast.success("Enseignant créé avec succès");
      onSuccess();
      if (data.access) {
        sendAccountInfo(data.name, data.email);
      }
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
    <Dialog open={open}  onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        size="5xl"
        className="rounded-xl border-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 animate-fade-in overflow-y-auto"
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
            {/* Photo upload */}
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-blue-900">Photo (facultative)</FormLabel>
                  <FormControl>
                    <FileUploader
                      onValueChange={handleFileChange}
                      value={file}
                      maxSize={10 * 1024 * 1024}
                      accept={{
                        'image/*': ['.jpg', '.jpeg', '.png', '.svg']
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            {/* Nouveaux champs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number_of_years_of_teaching"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Années d'enseignement</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nombre d'années d'enseignement"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
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
                name="date_of_teaching_authorization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Date d'autorisation</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder="Date d'autorisation d'enseigner"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject_taught"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Matière principale</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                          <SelectValue placeholder="Sélectionnez une matière" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[9999]">
                        {matters.map((matter) => (
                          <SelectItem key={matter.id} value={matter.name}>
                            {matter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="graduate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Diplôme</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Diplôme du professeur"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnps_social_security_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-blue-900">Numéro CNPS</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Numéro de sécurité sociale"
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
                name="official"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel className="font-semibold text-blue-900">Statut</FormLabel>
                    <Select
                      value={field.value ? "1" : "0"}
                      onValueChange={(value) => field.onChange(value === "1")}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="1">Fonctionnaire</SelectItem>
                        <SelectItem value="0">Non fonctionnaire</SelectItem>
                      </SelectContent>
                    </Select>
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