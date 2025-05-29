"use client";

import React from "react";
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
import { Phone, User, Shield, BookOpen, Contact } from "lucide-react";
import { AssignmentType, Level, Classe, Registration } from "@/lib/interface";
import { TrieDeClasse } from "./fonction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    tutor_name: string | undefined;
    tutor_first_name: string | undefined;
    tutor_number: string | undefined;
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
  onUpdateSuccess: () => void; // Callback pour notifier le parent du succès
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void; //
}

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
}: RegistrationFormProps) {
  const { pricing } = useSchoolStore();

  paiementRegistration(levels[0], pricing);

  const validateForm = () => {
    if (!Data.name || !Data.first_name) {
      toast.error("Le nom et prénom sont obligatoires");
      return false;
    }
    if (!Data.tutor_name || !Data.tutor_number) {
      toast.error("Les informations du tuteur sont obligatoires");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const requestBody = {
        ...Data,
        sexe: reRegistration?.student.sexe,
      };

      const res = await fetch(`/api/students?id=${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec de la mise à jour");
      }

      toast.success("Informations de l'élève mises à jour avec succès");
      onUpdateSuccess();
    } catch (error) {
      console.error("Erreur mise à jour élève:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la mise à jour"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Matricule
                  </Label>
                  <Input
                    name="registration_number"
                    value={Data.registration_number}
                    onChange={handleChange}
                    placeholder="Numéro d'inscription"
                    readOnly
                    className="bg-muted/50 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      name="name"
                      value={Data.name}
                      onChange={handleChange}
                      placeholder="Nom de l'élève"
                      className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      name="first_name"
                      value={Data.first_name}
                      onChange={handleChange}
                      placeholder="Prénom de l'élève"
                      className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date de Naissance</Label>
                  <Input
                    name="birth_date"
                    type="date"
                    value={Data.birth_date}
                    onChange={handleChange}
                    className="w-full focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    name="status"
                    onValueChange={(value) =>
                      setData((prev: any) => ({
                        ...prev,
                        assignment_type_id: Number(value),
                      }))
                    }
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
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Carte Informations Tuteur */}
          <motion.div variants={itemVariants}>
            <Card className="border rounded-lg shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                    <Contact className="w-4 h-4" />
                  </span>
                  Informations du tuteur
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      name="tutor_name"
                      value={Data.tutor_name}
                      onChange={handleChange}
                      placeholder="Nom du tuteur"
                      className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      name="tutor_first_name"
                      value={Data.tutor_first_name}
                      onChange={handleChange}
                      placeholder="Prénom du tuteur"
                      className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Numéro de téléphone</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      className="pl-10 focus-visible:ring-2 focus-visible:ring-blue-500"
                      name="tutor_number"
                      value={Data.tutor_number}
                      onChange={(e) => {
                        const input = e.target.value;
                        const numericInput = input
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        handleChange({
                          ...e,
                          target: { ...e.target, value: numericInput },
                        });
                      }}
                      placeholder="Ex: 771234567"
                      maxLength={10}
                      pattern="\d{10}"
                      inputMode="numeric"
                    />
                  </div>
                </div>
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
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select
                  name="Niveau"
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
                <Label>Classe</Label>
                <Select
                  name="classe"
                  onValueChange={(value) =>
                    setNew((prev: any) => ({
                      ...prev,
                      class_id: Number(value),
                    }))
                  }
                  required
                  defaultValue={reRegistration?.student.assignment_type_id?.toString()}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </form>
  );
}
