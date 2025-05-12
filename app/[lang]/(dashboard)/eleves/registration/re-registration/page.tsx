"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Stepper, Step, StepLabel } from "@/components/ui/steps";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import Card from "@/components/ui/card-snippet";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/store";
import {
  AssignmentType,
  Level,
  Classe,
  AcademicYear,
  Registration,
} from "@/lib/interface";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  FileText,
  User,
  Calendar,
  Phone,
  BookOpen,
} from "lucide-react";
import { TrieDeClasse } from "./fonction";
import FileManager from "./input";
import TarificationTable from "./tarificationTab";
import RegistrationFinal from "./final_register";
import {
  updateStudentCountByClass,
  verificationPermission,
} from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const inputVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function OldReregistration() {
  const router = useRouter();
  const {
    registrations,
    reRegistration,
    assignmentTypes,
    levels,
    classes,
    pricing,
    academicYearCurrent,
    setReRegistrations,
    userOnline,
  } = useSchoolStore();
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const [activeStep, setActiveStep] = useState(0);
  const [AcademicYearCurrent, setAcademicYearCurrent] = useState<AcademicYear>();
  const [Tarificationfound, setTarificationfound] = useState(false);
  const [datapost, setDataPost] = useState<Registration>();
  const [tarificationsData, setTarificationsData] = useState<{
    fees: { label: string; amount: number }[];
    total: number;
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissionRequisInscrire = ["inscrire eleve"];
  const hasAdminAccessInscrire = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisInscrire
  );

  const handleNoTarifications = useCallback((hasNoTarifications: boolean) => {
    setTarificationfound(hasNoTarifications);
  }, []);

  useEffect(() => {
    if (reRegistration === undefined) return;
    if (!reRegistration) {
      router.push("/eleves/registration");
    }
    setAcademicYearCurrent(academicYearCurrent);
  }, [router, academicYearCurrent, reRegistration]);

  const steps = useMemo(
    () => [
      { label: "Informations", icon: <User className="w-4 h-4" /> },
      { label: "Documents", icon: <FileText className="w-4 h-4" /> },
      { label: "Validation", icon: <CheckCircle className="w-4 h-4" /> },
    ],
    []
  );

  const [Data, setData] = useState(() => ({
    assignment_type_id: reRegistration?.student.assignment_type_id,
    registration_number: reRegistration?.student.registration_number,
    name: reRegistration?.student.name,
    first_name: reRegistration?.student.first_name,
    birth_date: reRegistration?.student.birth_date,
    tutor_name: reRegistration?.student.tutor_name,
    tutor_first_name: reRegistration?.student.tutor_first_name,
    tutor_number: reRegistration?.student.tutor_number,
    status: reRegistration?.student.status,
  }));

  const [levelChoice, setLevelChoice] = useState(
    Number(reRegistration?.classe.level_id)
  );
  const [New, setNew] = useState({
    class_id: reRegistration?.class_id,
    academic_year_id: reRegistration?.academic_year_id,
    student_id: reRegistration?.student_id,
    registration_date: new Date(),
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNext = useCallback(async () => {
    setIsSubmitting(true);
    const currentStep = activeStep;

    if (currentStep === 0) {
      try {
        const requestBody = { ...Data, sexe: reRegistration?.student.sexe };
        const res = await fetch(
          `https://educty.digifaz.com/api/student/${reRegistration?.student_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (!res.ok)
          throw new Error(`Erreur ${res.status}: ${await res.text()}`);
        toast.success("Données mises à jour avec succès !");
      } catch (error) {
        console.error(error);
        toast.error("Erreur de mise à jour");
        setIsSubmitting(false);
        return;
      }
    }

    if (currentStep === 1) {
      const payload = {
        class_id: New.class_id,
        academic_year_id: AcademicYearCurrent?.id ?? 1,
        student_id: reRegistration?.student?.id,
        registration_date: new Date().toISOString().split("T")[0],
      };

      const existingRegistration = registrations.find(
        (registration) =>
          registration.student_id === reRegistration?.student?.id &&
          registration.class_id === New.class_id &&
          registration.academic_year_id === AcademicYearCurrent?.id
      );

      if (existingRegistration) {
        toast.error(
          `L'élève ${reRegistration?.student?.name} ${reRegistration?.student?.first_name} est déjà inscrit dans cette classe.`
        );
        setIsSubmitting(false);
        return;
      }

      try {
        const res = await fetch(`https://educty.digifaz.com/api/registration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok)
          throw new Error(`Erreur ${res.status}: ${await res.text()}`);

        const data = await res.json();
        setDataPost(data);
        toast.success("Élève inscrit avec succès !");
        await updateStudentCountByClass(
          registrations,
          academicYearCurrent,
          classes
        );
      } catch (error) {
        console.error(error);
        toast.error("Erreur d'inscription");
        setIsSubmitting(false);
        return;
      }
    }

    if (currentStep === 2) {
      setReRegistrations(null);
      router.push("/eleves/registration");
      setIsSubmitting(false);
      return;
    }

    setActiveStep((prev) => prev + 1);
    setIsSubmitting(false);
  }, [activeStep, Data, New, AcademicYearCurrent, reRegistration, registrations, academicYearCurrent, classes, router, setReRegistrations]);

  if (hasAdminAccessInscrire === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          Réinscription d'élève
        </h2>
        <p className="text-muted-foreground text-center">
          {steps[activeStep]?.label}
        </p>
      </div>

      <Stepper
        current={activeStep}
        direction={isTablet ? "vertical" : "horizontal"}
        className={`mb-8 ${isTablet ? "stepper-vertical" : "stepper-horizontal"}`}
      >
        {steps.map(({ label, icon }) => (
          <Step key={label}>
            <StepLabel>
              <div className="flex items-center">
                {icon}
                <span className="ml-2">{label}</span>
              </div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
        >
          {activeStep === 0 && (
            <>
              <motion.div variants={inputVariants} className="space-y-4">
                <div className="space-y-2">
                  <Label>Matricule</Label>
                  <Input
                    name="registration_number"
                    value={Data.registration_number}
                    onChange={handleChange}
                    placeholder="Numéro d'inscription"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    name="name"
                    value={Data.name}
                    onChange={handleChange}
                    placeholder="Nom"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    name="first_name"
                    value={Data.first_name}
                    onChange={handleChange}
                    placeholder="Prénom"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date de Naissance</Label>
                  <Input
                    name="birth_date"
                    type="date"
                    value={Data.birth_date}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div variants={inputVariants} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du tuteur</Label>
                  <Input
                    name="tutor_name"
                    value={Data.tutor_name}
                    onChange={handleChange}
                    placeholder="Nom du tuteur"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prénom du tuteur</Label>
                  <Input
                    name="tutor_first_name"
                    value={Data.tutor_first_name}
                    onChange={handleChange}
                    placeholder="Prénom du tuteur"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Numéro du tuteur</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      className="pl-10"
                      name="tutor_number"
                      value={Data.tutor_number}
                      onChange={(e) => {
                        const input = e.target.value;
                        const numericInput = input.replace(/\D/g, "").slice(0, 10);
                        handleChange({
                          ...e,
                          target: { ...e.target, value: numericInput },
                        });
                      }}
                      placeholder="Numéro du tuteur"
                      maxLength={10}
                      pattern="\d{10}"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Statut de l'élève</Label>
                  <Select
                    name="status"
                    onValueChange={(value) =>
                      setData({ ...Data, assignment_type_id: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignmentTypes.map((item: AssignmentType) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <Select
                    name="Niveau"
                    onValueChange={(value) => setLevelChoice(Number(value))}
                    required
                    defaultValue={reRegistration?.classe.level_id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((item: Level) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
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
                      setNew({ ...New, class_id: Number(value) })
                    }
                    required
                    defaultValue={reRegistration?.student.assignment_type_id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      {TrieDeClasse(levelChoice, classes).map((item: Classe) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </>
          )}

          {activeStep === 1 && (
            <>
              <motion.div
                variants={inputVariants}
                className="col-span-2 space-y-6"
              >
                {reRegistration?.student && (
                  <Card
                    title={`Documents de ${reRegistration.student.name} ${reRegistration.student.first_name}`}
                  >
                    <FileManager student={reRegistration.student} />
                  </Card>
                )}

                <Card title="Tarification" >
                  <TarificationTable
                    tarifications={pricing}
                    level_id={levelChoice}
                    assignmenttype_id={Data.assignment_type_id ?? 1}
                    academicyear_id={AcademicYearCurrent?.id ?? 1}
                    TarificationsFound={handleNoTarifications}
                    onTarificationsData={setTarificationsData}
                  />
                </Card>
              </motion.div>
            </>
          )}

          {activeStep === 2 &&
            datapost &&
            tarificationsData &&
            Tarificationfound === true && (
              <motion.div
                variants={inputVariants}
                className="col-span-2"
              >
                <RegistrationFinal
                  registration={datapost}
                  finance={tarificationsData}
                />
              </motion.div>
            )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        {activeStep > 0 && (
          <Button
            variant="outline"
            onClick={() => setActiveStep((prev) => prev - 1)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        )}

        <Button
          onClick={handleNext}
          disabled={
            (activeStep === 1 && Tarificationfound === false) || isSubmitting
          }
          className="ml-auto"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          {activeStep === steps.length - 1 ? "Terminer" : "Suivant"}
        </Button>
      </div>
    </Card>
  );
}