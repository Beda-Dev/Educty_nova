"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  User,
  Shield,
  BookOpen,
  Contact,
  Plus,
  Trash2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  AssignmentType,
  Level,
  Classe,
  Registration,
  Student,
  Tutor,
} from "@/lib/interface";
import { TrieDeClasse } from "./fonction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { paiementRegistration } from "../fonction";
import { useSchoolStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface RegistrationFormProps {
  Data: {
    assignment_type_id: number | undefined;
    registration_number: string | undefined;
    name: string | undefined;
    first_name: string | undefined;
    birth_date: string | undefined;
    status: string | undefined;
  };
  levelChoice: number;
  reRegistration: Registration | null;
  assignmentTypes: AssignmentType[];
  levels: Level[];
  classes: Classe[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setLevelChoice: (value: number) => void;
  setData: (data: any) => void;
  setNew: (data: any) => void;
  studentId: number | undefined;
  onUpdateSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastStep: boolean;
  Tarificationfound:
    | { fees: { label: string; amount: number }[]; total: number }
    | undefined;
}

// Schémas de validation
const studentSchema = z.object({
  assignment_type_id: z.number({ required_error: "Statut requis" }),
  registration_number: z.string().min(1, "Matricule requis"),
  name: z.string().min(1, "Nom requis"),
  first_name: z.string().min(1, "Prénom requis"),
  birth_date: z.string().min(1, "Date de naissance requise"),
  status: z.string().min(1, "Statut requis"),
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function RegistrationForm({
  Data,
  levelChoice,
  reRegistration,
  assignmentTypes,
  levels,
  classes,
  handleChange,
  setLevelChoice,
  setData,
  setNew,
  studentId,
  onUpdateSuccess,
  isSubmitting,
  setIsSubmitting,
  onPrevious,
  onNext,
  isLastStep,
  Tarificationfound,
}: RegistrationFormProps) {
  const { pricing, students } = useSchoolStore();
  const [tutors, setTutors] = useState<
    {
      data: z.infer<typeof tutorSchema>;
      isLegalTutor: boolean;
      id?: number;
    }[]
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      assignment_type_id: Data.assignment_type_id,
      registration_number: Data.registration_number || "",
      name: Data.name || "",
      first_name: Data.first_name || "",
      birth_date: Data.birth_date || "",
      status: Data.status || "",
    },
  });

  paiementRegistration(levels[0], pricing);

  // Charger les tuteurs existants
  useEffect(() => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
    }

    if (studentId) {
      const fetchTutors = async () => {
        try {
          const response = await fetch(`/api/students?id=${studentId}`);
          if (response.ok) {
            const data: Student = await response.json();
            setTutors(
              (data.tutors ?? []).map((tutor: any) => ({
                data: {
                  name: tutor.name,
                  first_name: tutor.first_name,
                  phone_number: tutor.phone_number,
                  sexe: tutor.sexe as "Homme" | "Femme",
                  type_tutor: tutor.type_tutor,
                },
                isLegalTutor: tutor.pivot?.is_tutor_legal === 1,
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
  }, [studentId]);

  // Convertit en majuscules
  const handleUpperCaseChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof z.infer<typeof studentSchema>
  ) => {
    const upperValue = e.target.value.toUpperCase();
    e.target.value = upperValue;
    setValue(fieldName, upperValue, { shouldValidate: true });

    // Mettre à jour aussi les données du parent
    handleChange({
      ...e,
      target: { ...e.target, name: fieldName, value: upperValue },
    });
  };

  // Ajouter un nouveau tuteur
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

  // Supprimer un tuteur
  const removeTutor = (index: number) => {
    const newTutors = [...tutors];
    newTutors.splice(index, 1);
    setTutors(newTutors);

    if (newTutors.length > 0 && !newTutors.some((t) => t.isLegalTutor)) {
      newTutors[0].isLegalTutor = true;
    }
  };

  // Mettre à jour un tuteur
  const updateTutor = (
    index: number,
    field: keyof z.infer<typeof tutorSchema>,
    value: any
  ) => {
    const newTutors = [...tutors];
    newTutors[index].data[field] = value;
    setTutors(newTutors);
  };

  // Changer le tuteur légal
  const setLegalTutor = (index: number) => {
    const newTutors = tutors.map((tutor, i) => ({
      ...tutor,
      isLegalTutor: i === index,
    }));
    setTutors(newTutors);
  };

  // Valider les tuteurs
  const validateTutors = (): boolean => {
    if (tutors.length === 0) {
      toast.error("Au moins un tuteur doit être renseigné");
      return false;
    }

    try {
      tutors.forEach((tutor) => {
        tutorSchema.parse(tutor.data);
      });
      return true;
    } catch (error) {
      toast.error("Veuillez vérifier les informations des tuteurs");
      return false;
    }
  };

  const onSubmit = async (studentData: z.infer<typeof studentSchema>) => {
    if (!validateTutors()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Mettre à jour l'élève
      const studentResponse = await fetch(`/api/students?id=${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...studentData,
          sexe: reRegistration?.student.sexe,
        }),
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json();
        throw new Error(
          errorData.message || "Échec de la mise à jour de l'élève"
        );
      }

      // 2. Gérer les tuteurs (création/mise à jour)
      const tutorPromises = tutors.map(async (tutor) => {
        if (tutor.id) {
          // Mettre à jour tuteur existant
          const tutorResponse = await fetch(`/api/tutor?id=${tutor.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tutor.data),
          });

          if (!tutorResponse.ok) {
            throw new Error("Échec de la mise à jour du tuteur");
          }

          return tutorResponse.json();
        } else {
          // Créer nouveau tuteur
          const tutorResponse = await fetch("/api/tutor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tutor.data),
          });

          if (!tutorResponse.ok) {
            throw new Error("Échec de la création du tuteur");
          }

          return tutorResponse.json();
        }
      });

      const tutorsResults = await Promise.all(tutorPromises);
      console.log("Tuteurs traités:", tutorsResults);

      // 3. Associer les tuteurs à l'élève
      const assignTutorResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/assign-tutor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            tutors: tutorsResults.map((tutorResult, index) => ({
              id: tutorResult.id,
              is_tutor_legal: tutors[index].isLegalTutor,
            })),
          }),
        }
      );

      if (!assignTutorResponse.ok) {
        throw new Error("Échec de l'association des tuteurs");
      }

      // Toutes les requêtes ont réussi, on peut passer à l'étape suivante
      toast.success(
        "Informations de l'élève et des tuteurs mises à jour avec succès"
      );
      onNext();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la mise à jour"
      );
      setIsSubmitting(false);
    } finally {
      // Si une erreur s'est produite, setIsSubmitting est déjà appelé dans le catch
      if (!isSubmitting) {
        setIsSubmitting(false);
      }
    }
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Valider d'abord les champs requis
    if (
      !Data.name ||
      !Data.status ||
      !Data.assignment_type_id ||
      !Data.registration_number ||
      !Data.first_name ||
      !Data.birth_date
    ) {
      toast.error("Tous les champs requis doivent être remplis");
      return;
    }

    // Soumettre le formulaire (la navigation se fait dans onSubmit)
    await handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boutons de navigation */}

          {/* Carte Informations Élève */}
          <motion.div variants={itemVariants}>
            <Card className="border rounded-lg shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                    <User className="w-4 h-4" />
                  </span>
                  Informations de l'élève
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    Matricule *
                  </Label>
                  <Input
                    {...register("registration_number")}
                    onChange={(e) =>
                      handleUpperCaseChange(e, "registration_number")
                    }
                    placeholder="Numéro d'inscription"
                    readOnly
                    className="bg-muted/50 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  {errors.registration_number && (
                    <p className="text-sm font-medium text-red-500 mt-1">
                      {errors.registration_number.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      {...register("name")}
                      onChange={(e) => handleUpperCaseChange(e, "name")}
                      placeholder="Nom de l'élève"
                      className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                    {errors.name && (
                      <p className="text-sm font-medium text-red-500 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input
                      {...register("first_name")}
                      onChange={(e) => handleUpperCaseChange(e, "first_name")}
                      placeholder="Prénom de l'élève"
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
                  <Label>Date de Naissance *</Label>
                  <Input
                    {...register("birth_date")}
                    type="date"
                    className="w-full focus-visible:ring-2 focus-visible:ring-blue-500"
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {errors.birth_date && (
                    <p className="text-sm font-medium text-red-500 mt-1">
                      {errors.birth_date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Statut *</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue("assignment_type_id", Number(value), {
                        shouldValidate: true,
                      });
                      setData((prev: any) => ({
                        ...prev,
                        assignment_type_id: Number(value),
                      }));
                    }}
                    defaultValue={Data.assignment_type_id?.toString()}
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignmentTypes.map((item: AssignmentType) => (
                        <SelectItem
                          key={item.id}
                          value={item.id.toString()}
                          className="capitalize"
                        >
                          {item.label}
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Carte Informations Tuteurs */}
          <motion.div variants={itemVariants}>
            <Card className="border rounded-lg shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                    <Contact className="w-4 h-4" />
                  </span>
                  Informations des parents/tuteurs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  color="indigodye"
                  type="button"
                  onClick={addTutor}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Ajouter un parent
                </Button>

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
                            variant="outline"
                            color="destructive"
                            size="sm"
                            onClick={() => removeTutor(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nom *</Label>
                            <Input
                              value={tutor.data.name}
                              onChange={(e) => {
                                const upperValue = e.target.value.toUpperCase();
                                updateTutor(index, "name", upperValue);
                              }}
                              className="focus-visible:ring-2 focus-visible:ring-blue-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Prénom *</Label>
                            <Input
                              value={tutor.data.first_name}
                              onChange={(e) => {
                                const upperValue = e.target.value.toUpperCase();
                                updateTutor(index, "first_name", upperValue);
                              }}
                              className="focus-visible:ring-2 focus-visible:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Numéro de téléphone *</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <Input
                                className="pl-10 focus-visible:ring-2 focus-visible:ring-blue-500"
                                value={tutor.data.phone_number}
                                onChange={(e) => {
                                  const numericInput = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 10);
                                  updateTutor(
                                    index,
                                    "phone_number",
                                    numericInput
                                  );
                                }}
                                placeholder="Ex: 771234567"
                                maxLength={10}
                                inputMode="numeric"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Lien de parenté *</Label>
                            <Input
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
                            <Label>Sexe *</Label>
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
                              checked={tutor.isLegalTutor}
                              onCheckedChange={() => setLegalTutor(index)}
                            />
                            <Label>Tuteur légal</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Carte Scolarité */}
        <motion.div variants={itemVariants}>
          <Card className="border rounded-lg shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                  <Shield className="w-4 h-4" />
                </span>
                Scolarité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Niveau *</Label>
                <Select
                  onValueChange={(value) => setLevelChoice(Number(value))}
                  required
                  defaultValue={reRegistration?.classe.level_id?.toString()}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((item: Level) => (
                      <SelectItem
                        key={item.id}
                        value={item.id.toString()}
                        className="capitalize"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Classe *</Label>
                <Select
                  onValueChange={(value) =>
                    setNew((prev: any) => ({
                      ...prev,
                      class_id: Number(value),
                    }))
                  }
                  required
                  defaultValue={reRegistration?.classe.id?.toString()}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {TrieDeClasse(levelChoice, classes).map((item: Classe) => (
                      <SelectItem
                        key={item.id}
                        value={item.id.toString()}
                        className="capitalize"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <div className="col-span-2">
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              onClick={handleNext}
              disabled={isSubmitting}
              className="ml-auto"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              {isLastStep ? "Terminer" : "Suivant"}
            </Button>
          </div>
        </div>
      </motion.div>
    </form>
  );
}
