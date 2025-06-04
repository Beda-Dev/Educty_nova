"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSchoolStore } from "@/store";
import { Student, Tutor } from "@/lib/interface";

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
import { Switch } from "@/components/ui/switch";

interface FormProps {
  isValid: boolean;
  onSubmitResult: (result: { success: boolean; data?: Student }) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastStep: boolean;
}

const studentSchema = z.object({
  assignment_type_id: z.number({ required_error: "Statut requis" }),
  registration_number: z.string().min(1, "Matricule requis"),
  name: z.string().min(1, "Nom requis"),
  first_name: z.string().min(1, "Prénom requis"),
  birth_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Date invalide"
  }),
  sexe: z.enum(["Masculin", "Feminin"], { required_error: "Sexe requis" }),
});

const tutorSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  first_name: z.string().min(1, "Prénom requis"),
  phone_number: z
    .string()
    .min(10, "Le numéro doit contenir 10 chiffres")
    .max(10, "Le numéro doit contenir 10 chiffres")
    .regex(/^\d+$/, "Doit contenir uniquement des chiffres"),
  sexe: z.enum(["Homme", "Femme"], { required_error: "Sexe requis" }),
  type_tutor: z.string().min(1, "Lien de parenté requis"),
});

const FormulaireEnregistrement: React.FC<FormProps> = ({
  onSubmitResult,
  onPrevious,
  onNext,
  isLastStep,
  isValid,
}) => {
  const { assignmentTypes, students, Newstudent, setNewStudent, tutors: tutorsStore, setTutors: setTutorsStore } =
    useSchoolStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tutors, setTutors] = useState<
    {
      data: z.infer<typeof tutorSchema>;
      isLegalTutor: boolean;
      id?: number;
    }[]
  >([]);
  const [hasExistingTutor, setHasExistingTutor] = useState<boolean>(false);
  const [selectedExistingTutor, setSelectedExistingTutor] = useState<number | null>(null);
  const [showTutorForm, setShowTutorForm] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: Newstudent
      ? {
        assignment_type_id: Newstudent.assignment_type_id,
        registration_number: Newstudent.registration_number,
        name: Newstudent.name,
        first_name: Newstudent.first_name,
        birth_date: Newstudent.birth_date,
        sexe: Newstudent.sexe as "Masculin" | "Feminin",
      }
      : undefined,
  });

  useEffect(() => {
    let isMounted = true;
    if (Newstudent?.id) {
      const fetchTutors = async () => {
        try {
          const response = await fetch(
            `https://educty.digifaz.com/api/student/${Newstudent.id}`
          );
          if (response.ok) {
            const data = await response.json();
            setTutors(
              data.tutors.map((tutor: Tutor) => ({
                data: {
                  name: tutor.name,
                  first_name: tutor.first_name,
                  phone_number: tutor.phone_number,
                  sexe: tutor.sexe as "Homme" | "Femme",
                  type_tutor: tutor.type_tutor,
                },
                isLegalTutor:
                  tutor.students?.[0]?.pivot?.is_tutor_legal ?? false,
                id: tutor.id,
              }))
            );
          }
        } catch (error) {
          console.error("Erreur lors du chargement des tuteurs:", error);
        }
      };
      fetchTutors();
    }
    return () => {
      isMounted = false;
    };
  }, [Newstudent?.id]);

  const isMatriculeUnique = (matricule: string): boolean => {
    return !students.some(
      (student) =>
        student.registration_number === matricule &&
        (!Newstudent || student.id !== Newstudent.id)
    );
  };

  const handleUpperCaseChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof z.infer<typeof studentSchema>
  ) => {
    const upperValue = e.target.value.toUpperCase();
    e.target.value = upperValue;
    setValue(fieldName, upperValue, { shouldValidate: true });
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

  const addTutor = () => {
    setTutors([
      ...tutors,
      {
        data: {
          name: "",
          first_name: "",
          phone_number: "",
          sexe: "Homme",
          type_tutor: "",
        },
        isLegalTutor: tutors.length === 0,
      },
    ]);
  };

  const removeTutor = (index: number) => {
    const newTutors = [...tutors];
    newTutors.splice(index, 1);
    setTutors(newTutors);

    if (newTutors.length > 0 && !newTutors.some((t) => t.isLegalTutor)) {
      newTutors[0].isLegalTutor = true;
    }
  };

  const updateTutor = (
    index: number,
    field: keyof z.infer<typeof tutorSchema>,
    value: any
  ) => {
    const newTutors = [...tutors];
    newTutors[index].data[field] = value;
    setTutors(newTutors);
  };

  const setLegalTutor = (index: number) => {
    const newTutors = tutors.map((tutor, i) => ({
      ...tutor,
      isLegalTutor: i === index,
    }));
    setTutors(newTutors);
  };

  const validateTutors = (): boolean => {
    if (tutors.length === 0) {
      toast.error("Au moins un tuteur doit être renseigné");
      return false;
    }

    for (const tutor of tutors) {
      const result = tutorSchema.safeParse(tutor.data);
      if (!result.success) {
        result.error.errors.forEach(err => {
          toast.error(`${err.path.join('.')}: ${err.message}`);
        });
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (studentData: z.infer<typeof studentSchema>) => {
    if (!isMatriculeUnique(studentData.registration_number)) {
      toast.error("Ce matricule est déjà utilisé par un autre élève");
      return;
    }

    if (!validateTutors()) {
      return;
    }

    setIsSubmitting(true);
    const isEditing = !!Newstudent;

    try {
      // 1. Créer/mettre à jour l'élève
      const studentUrl = isEditing
        ? `https://educty.digifaz.com/api/student/${Newstudent.id}`
        : "https://educty.digifaz.com/api/student";
      const studentMethod = isEditing ? "PUT" : "POST";

      let studentBody: BodyInit;
      if (isEditing) {
        studentBody = JSON.stringify({
          ...studentData,
          status: "actif",
        });
      } else {
        const formData = new FormData();
        Object.entries(studentData).forEach(([key, value]) => {
          if (key !== "sexe") {
            formData.append(key, value as string);
          }
        });
        formData.append("status", "actif");
        if (imageFile) {
          formData.append("photo", imageFile);
        }
        formData.append("sexe", studentData.sexe);
        studentBody = formData;
      }

      const studentResponse = await fetch(studentUrl, {
        method: studentMethod,
        body: studentBody,
        headers: isEditing
          ? {
            "Content-Type": "application/json",
          }
          : undefined,
      });

      if (!studentResponse.ok) {
        throw new Error(await studentResponse.text());
      }

      const studentResult = await studentResponse.json();
      setNewStudent(studentResult);

      // 2. Créer/mettre à jour les tuteurs
      const tutorPromises = tutors.map(async (tutor) => {
        const tutorUrl = tutor.id
          ? `https://educty.digifaz.com/api/tutor/${tutor.id}`
          : "https://educty.digifaz.com/api/tutor";
        const tutorMethod = tutor.id ? "PUT" : "POST";

        const tutorResponse = await fetch(tutorUrl, {
          method: tutorMethod,
          body: JSON.stringify(tutor.data),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!tutorResponse.ok) {
          throw new Error(await tutorResponse.text());
        }

        return tutorResponse.json();
      });

      const tutorsResults = await Promise.all(tutorPromises);

      // 3. Associer les tuteurs à l'élève
      const assignTutorResponse = await fetch(
        "https://educty.digifaz.com/api/student/assign-tutor",
        {
          method: "POST",
          body: JSON.stringify({
            student_id: studentResult.id,
            tutors: tutorsResults.map((tutorResult, index) => ({
              id: tutorResult.id,
              is_tutor_legal: tutors[index].isLegalTutor,
            })),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!assignTutorResponse.ok) {
        throw new Error(await assignTutorResponse.text());
      }

      toast.success(
        isEditing
          ? "Élève et tuteurs mis à jour"
          : "Élève et tuteurs enregistrés"
      );
      onSubmitResult({ success: true, data: studentResult });
    } catch (error) {
      console.error("Erreur:", error);
      let errorMessage = "Une erreur est survenue";
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || error.message;
        } catch {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      onSubmitResult({ success: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExistingTutor = () => {
    if (!selectedExistingTutor) {
      toast.error("Veuillez sélectionner un tuteur");
      return;
    }

    const existingTutor = tutorsStore.find(t => t.id === selectedExistingTutor);
    if (!existingTutor) return;

    setTutors([
      ...tutors,
      {
        data: {
          name: existingTutor.name,
          first_name: existingTutor.first_name,
          phone_number: existingTutor.phone_number,
          sexe: existingTutor.sexe as "Homme" | "Femme",
          type_tutor: existingTutor.type_tutor,
        },
        isLegalTutor: tutors.length === 0,
        id: existingTutor.id
      }
    ]);

    setHasExistingTutor(false);
    setSelectedExistingTutor(null);
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
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
                onChange={(e) =>
                  handleUpperCaseChange(e, "registration_number")
                }
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
                max={new Date().toISOString().split("T")[0]}
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
                    setValue("sexe", value as "Masculin" | "Feminin", {
                      shouldValidate: true,
                    })
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
                    setValue("assignment_type_id", Number(value), {
                      shouldValidate: true,
                    })
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

        {/* Carte Informations sur les tuteurs */}
        <Card className="border rounded-lg shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              Informations sur les tuteurs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4 mb-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-existing-tutor"
                  checked={hasExistingTutor}
                  onCheckedChange={(checked) => {
                    setHasExistingTutor(checked);
                    setShowTutorForm(!checked);
                  }}
                />
                <Label htmlFor="has-existing-tutor">
                  Ce tuteur a déjà un enfant dans l'établissement
                </Label>
              </div>

              {hasExistingTutor && (
                <div className="grid gap-4">
                  <Select
                    value={selectedExistingTutor?.toString() || ""}
                    onValueChange={(value) => setSelectedExistingTutor(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un tuteur existant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutorsStore
                        .filter(tutor =>
                          !tutors.some(t => t.id === tutor.id) // Exclure les tuteurs déjà ajoutés
                        )
                        .map((tutor) => (
                          <SelectItem
                            key={tutor.id}
                            value={tutor.id.toString()}
                          >
                            {tutor.name} {tutor.first_name} - {tutor.phone_number}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    onClick={handleAddExistingTutor}
                    className="w-full"
                  >
                    Ajouter ce tuteur
                  </Button>
                </div>
              )}
            </div>
            {!hasExistingTutor && (
              <Button
                type="button"
                variant="outline"
                onClick={addTutor}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Ajouter un tuteur
              </Button>
            )}

            {tutors.length > 0 && (
              <div className="space-y-6">
                {tutors.map((tutor, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-4 relative"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Tuteur {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTutor(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`tutor-name-${index}`}>Nom </Label>
                        <Input
                          id={`tutor-name-${index}`}
                          value={tutor.data.name}
                          onChange={(e) => {
                            const upperValue = e.target.value.toUpperCase();
                            e.target.value = upperValue;
                            updateTutor(index, "name", upperValue);
                          }}
                          className="focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`tutor-first-name-${index}`}>
                          Prénom
                        </Label>
                        <Input
                          id={`tutor-first-name-${index}`}
                          value={tutor.data.first_name}
                          onChange={(e) => {
                            const upperValue = e.target.value.toUpperCase();
                            e.target.value = upperValue;
                            updateTutor(index, "first_name", upperValue);
                          }}
                          className="focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`tutor-phone-${index}`}>
                          Numéro de téléphone (unique)
                        </Label>
                        <Input
                          id={`tutor-phone-${index}`}
                          value={tutor.data.phone_number}
                          onChange={(e) =>
                            updateTutor(index, "phone_number", e.target.value)
                          }
                          placeholder="Ex: 701234567"
                          className="focus-visible:ring-2 focus-visible:ring-blue-500"
                          maxLength={10}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`tutor-type-${index}`}>
                          Lien de parenté
                        </Label>
                        <Input
                          id={`tutor-type-${index}`}
                          value={tutor.data.type_tutor}
                          onChange={(e) =>
                            updateTutor(index, "type_tutor", e.target.value)
                          }
                          placeholder="Ex: Père, Mère, Oncle..."
                          className="focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`tutor-sexe-${index}`}>Sexe </Label>
                        <Select
                          value={tutor.data.sexe}
                          onValueChange={(value) =>
                            updateTutor(
                              index,
                              "sexe",
                              value as "Homme" | "Femme"
                            )
                          }
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Homme">Masculin</SelectItem>
                            <SelectItem value="Femme">Feminin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2">
                        <Switch
                          id={`tutor-legal-${index}`}
                          checked={tutor.isLegalTutor}
                          onCheckedChange={() => setLegalTutor(index)}
                        />
                        <Label htmlFor={`tutor-legal-${index}`}>
                          Tuteur légal
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          Retour
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : isLastStep ? (
            "Terminer"
          ) : (
            "Suivant"
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default FormulaireEnregistrement;