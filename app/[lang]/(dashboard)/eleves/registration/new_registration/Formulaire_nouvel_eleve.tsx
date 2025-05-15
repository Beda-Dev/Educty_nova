"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSchoolStore } from "@/store";
import { Student } from "@/lib/interface";

// Components
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ImageUploader from "./select_photo";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FormProps {
  isValid: boolean;
  onSubmitResult: (result: { success: boolean; data?: Student }) => void;
}

const schema = z.object({
  assignment_type_id: z.number({ required_error: "Statut requis" }),
  registration_number: z.string().min(1, "Matricule requis"),
  name: z.string().min(1, "Nom requis"),
  first_name: z.string().min(1, "Prénom requis"),
  birth_date: z.string().min(1, "Date de naissance requise"),
  tutor_name: z.string().min(1, "Nom du tuteur requis"),
  tutor_first_name: z.string().min(1, "Prénom du tuteur requis"),
  tutor_number: z.string()
    .min(10, "Le numéro doit contenir 10 chiffres")
    .max(10, "Le numéro doit contenir 10 chiffres")
    .regex(/^\d+$/, "Doit contenir uniquement des chiffres"),
  sexe: z.enum(["Masculin", "Feminin"], { required_error: "Sexe requis" }),

});

const FormulaireEnregistrement: React.FC<FormProps> = ({ onSubmitResult }) => {
  const { assignmentTypes, students, Newstudent, setNewStudent } = useSchoolStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: Newstudent ? {
      assignment_type_id: Newstudent.assignment_type_id,
      registration_number: Newstudent.registration_number,
      name: Newstudent.name,
      first_name: Newstudent.first_name,
      birth_date: Newstudent.birth_date,
      tutor_name: Newstudent.tutor_name,
      tutor_first_name: Newstudent.tutor_first_name || "",
      tutor_number: Newstudent.tutor_number || "",
      sexe: Newstudent.sexe as "Masculin" | "Feminin",
    } : undefined,
  });

  // Vérifie l'unicité du matricule (sauf pour l'étudiant en cours d'édition)
  const isMatriculeUnique = (matricule: string): boolean => {
    return !students.some(
      (student) => student.registration_number === matricule && 
                 (!Newstudent || student.id !== Newstudent.id)
    );
  };

  // Convertit en majuscules et met à jour le champ
  const handleUpperCaseChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    fieldName: keyof z.infer<typeof schema>
  ) => {
    const upperValue = e.target.value.toUpperCase();
    e.target.value = upperValue;
    setValue(fieldName, upperValue, { shouldValidate: true });
  };

  // Gestion du téléchargement d'image
  const handleImageChange = (file: File) => {
    setImageFile(file);
  };

  // Soumission du formulaire
const onSubmit = async (data: z.infer<typeof schema>) => {
  if (!isMatriculeUnique(data.registration_number)) {
    toast.error("Ce matricule est déjà utilisé par un autre élève");
    return;
  }

  setIsSubmitting(true);
  const isEditing = !!Newstudent;
  const url = isEditing
    ? `https://educty.digifaz.com/api/student/${Newstudent.id}`
    : "https://educty.digifaz.com/api/student";
  const method = isEditing ? "PUT" : "POST";

  try {
    let body: BodyInit;
    let headers: HeadersInit | undefined;

    if (isEditing) {
      // PUT = JSON sans la photo
      const jsonData = {
        ...data,
        status: "actif",
      };
      body = JSON.stringify(jsonData);
      headers = {
        "Content-Type": "application/json",
      };
    } else {
      // POST = FormData avec photo
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
              if (key !== "sexe") {
        formData.append(key, value as string);
      }
      });
      formData.append("status", "actif");

      if (imageFile) {
        formData.append("photo", imageFile);
      }
       if (data.sexe) formData.append("sexe", data.sexe);

      body = formData;
      // Pas de Content-Type ici, il est géré automatiquement par le navigateur
    }

    const response = await fetch(url, {
      method,
      body,
      headers,
    });

    if (!response.ok) {
      setNewStudent(null);
      throw new Error(await response.text());
    }

    const result = await response.json();
    setNewStudent(result);
    toast.success(isEditing ? "Élève mis à jour" : "Élève enregistré");
    onSubmitResult({ success: true, data: result });
  } catch (error) {
    console.error("Erreur:", error);
    toast.error("Une erreur est survenue lors de l'enregistrement");
    onSubmitResult({ success: false });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <motion.form 
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte Informations sur l'élève */}
        <Card className="border rounded-lg shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              Informations sur l'élève
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <ImageUploader 
                initialImage={Newstudent?.photo || ""} 
                onImageChange={handleImageChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Matricule </Label>
              <Input
                id="registration_number"
                {...register("registration_number")}
                onChange={(e) => handleUpperCaseChange(e, "registration_number")}
                className="focus-visible:ring-2 focus-visible:ring-blue-500"
                disabled={false}
              />
              {errors.registration_number && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.registration_number.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom </Label>
                <Input
                  id="name"
                  {...register("name")}
                  onChange={(e) => handleUpperCaseChange(e, "name")}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom </Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  onChange={(e) => handleUpperCaseChange(e, "first_name")}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {errors.first_name && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Date de naissance </Label>
              <Input
                id="birth_date"
                type="date"
                {...register("birth_date")}
                className="focus-visible:ring-2 focus-visible:ring-blue-500"
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.birth_date && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.birth_date.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("sexe", value as "Masculin" | "Feminin", { shouldValidate: true })
                  }
                  defaultValue={Newstudent?.sexe}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Feminin">Feminin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexe && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.sexe.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment_type_id">Statut de l'élève </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("assignment_type_id", Number(value), { shouldValidate: true })
                  }
                  defaultValue={Newstudent?.assignment_type_id?.toString()}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignmentTypes.map((stat) => (
                      <SelectItem key={stat.id} value={stat.id.toString()}>
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignment_type_id && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.assignment_type_id.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Informations sur le tuteur */}
        <Card className="border rounded-lg shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              Informations sur le tuteur
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tutor_name">Nom du tuteur *</Label>
                <Input
                  id="tutor_name"
                  {...register("tutor_name")}
                  onChange={(e) => handleUpperCaseChange(e, "tutor_name")}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {errors.tutor_name && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.tutor_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutor_first_name">Prénom du tuteur </Label>
                <Input
                  id="tutor_first_name"
                  {...register("tutor_first_name")}
                  onChange={(e) => handleUpperCaseChange(e, "tutor_first_name")}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {errors.tutor_first_name && (
                  <p className="text-sm font-medium text-red-500 mt-1">
                    {errors.tutor_first_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tutor_number">Numéro du tuteur </Label>
              <Input
                id="tutor_number"
                {...register("tutor_number")}
                placeholder="Ex: 701234567"
                className="focus-visible:ring-2 focus-visible:ring-blue-500"
                maxLength={10}
              />
              {errors.tutor_number && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.tutor_number.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-end gap-4">
        {/* <Button 
          type="button" 
          variant="outline" 
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
        >
          Annuler
        </Button> */}
        <Button 
          type="submit" 
          className="min-w-[120px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {Newstudent ? "Mise à jour..." : "Enregistrement..."}
            </>
          ) : (
            Newstudent ? "suivant" : "suivant"
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default FormulaireEnregistrement;