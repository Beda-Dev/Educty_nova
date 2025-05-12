"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { Student } from "@/lib/interface";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FormProps {
  isValid: boolean;
  onSubmitResult: (result: { success: boolean; data?: any }) => void;
}

const FormulaireEnregistrement: React.FC<FormProps> = ({
  isValid,
  onSubmitResult,
}) => {
  const { assignmentTypes, students } = useSchoolStore();

  const isMatriculeUnique = (matricule: string): boolean => {
    return !students.some(
      (student) => student.registration_number === matricule
    );
  };

  const handleUpperCaseChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof z.infer<typeof schema>) => {
    const upperValue = e.target.value.toUpperCase();
    e.target.value = upperValue;
    setValue(fieldName, upperValue, { shouldValidate: true });
  };

  const schema = z.object({
    assignment_type_id: z.number(),
    registration_number: z
      .string()
      .min(1, "Matricule requis")
      .refine((value) => isMatriculeUnique(value), {
        message: "Ce matricule est déjà utilisé",
      }),
    name: z.string().min(1, "Nom requis"),
    first_name: z.string().min(1, "Prénom requis"),
    birth_date: z.string().optional(),
    tutor_name: z.string().min(1, "Nom du tuteur requis"),
    tutor_first_name: z.string().optional(),
    tutor_number: z
      .string()
      .regex(
        /^\d{10}$/,
        "Le numéro du tuteur doit contenir exactement 10 chiffres"
      )
      .optional(),
    sexe: z.enum(["Masculin", "Feminin"], { message: "Sexe requis" }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (file: File) => {
    setImageFile(file);
  };

  const onSubmit = async (
    data: z.infer<typeof schema>,
    event?: React.BaseSyntheticEvent
  ) => {
    event?.preventDefault();

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

    try {
      const response = await fetch("https://educty.digifaz.com/api/student", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Échec de l'enregistrement : ${response.statusText}`);
      }

      const responseData = await response.json();
      toast.success("Enregistrement réussi");
      onSubmitResult({ success: true, data: responseData });
    } catch (error) {
      toast.error((error as Error).message);
      onSubmitResult({ success: false });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte Informations sur l'élève */}
        <Card className="border rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">
              Informations sur l'élève
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <ImageUploader initialImage="" onImageChange={handleImageChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Matricule</Label>
              <Input
                id="registration_number"
                {...register("registration_number")}
                onBlur={() => trigger("registration_number")}
                onChange={(e) => handleUpperCaseChange(e, "registration_number")}
                className="focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.registration_number && (
                <p className="text-sm font-medium text-destructive">
                  {errors.registration_number.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  {...register("name")}
                  onChange={(e) => handleUpperCaseChange(e, "name")}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.name && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  onChange={(e) => handleUpperCaseChange(e, "first_name")}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.first_name && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Date de naissance</Label>
              <Input
                id="birth_date"
                type="date"
                {...register("birth_date")}
                className="focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("sexe", value as "Masculin" | "Feminin")
                  }
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Feminin">Feminin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexe && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.sexe.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment_type_id">Statut de l'élève</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("assignment_type_id", Number(value))
                  }
                  required
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-primary">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Informations sur le tuteur */}
        <Card className="border rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">
              Informations sur le tuteur
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tutor_name">Nom du tuteur</Label>
                <Input
                  id="tutor_name"
                  {...register("tutor_name")}
                  onChange={(e) => handleUpperCaseChange(e, "tutor_name")}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.tutor_name && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.tutor_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutor_first_name">Prénom du tuteur</Label>
                <Input
                  id="tutor_first_name"
                  {...register("tutor_first_name")}
                  onChange={(e) => handleUpperCaseChange(e, "tutor_first_name")}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tutor_number">Numéro du tuteur</Label>
              <Input
                id="tutor_number"
                {...register("tutor_number")}
                placeholder="10 chiffres"
                className="focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.tutor_number && (
                <p className="text-sm font-medium text-destructive">
                  {errors.tutor_number.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          Suivant
        </Button>
      </div>
    </form>
  );
};

export default FormulaireEnregistrement;