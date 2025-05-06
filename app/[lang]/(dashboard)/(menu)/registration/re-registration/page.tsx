"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Stepper, Step, StepLabel } from "@/components/ui/steps";
import { toast } from "react-hot-toast";
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
import ImageUploader from "./select_photo";
import { TrieDeClasse } from "./fonction";
import FileManager from "./input";
import TarificationTable from "./tarificationTab";
import RegistrationFinal from "./final_register";
import {
  updateStudentCountByClass,
  verificationPermission,
} from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

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
  {
    /*const [imageFile, setImageFile] = useState<File | null>(null);*/
  }
  const [AcademicYearCurrent, setAcademicYearCurrent] =
    useState<AcademicYear>();
  const [Tarificationfound, setTarificationfound] = useState(false);
  const [datapost, setDataPost] = useState<Registration>();
  const [tarificationsData, setTarificationsData] = useState<{
    fees: { label: string; amount: number }[];
    total: number;
  }>();

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
      router.push("/registration");
    }
    //console.log("Student Data:", reRegistration?.student);
    setAcademicYearCurrent(academicYearCurrent);
  }, [router, academicYearCurrent, reRegistration]);

  const steps = useMemo(
    () => [
      { label: "Étape 1", desc: "Informations de l'élève" },
      { label: "Étape 2", desc: "Données scolaires" },
      { label: "Étape 3", desc: "Validation" },
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

  //const handleImageChange = (file: File) => {
  //  setImageFile(file);
  //};

  const handleNext = useCallback(async () => {
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
        console.log(error);
        toast.error("Erreur de mise à jour");
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

      // Vérification de l'existence d'une inscription pour l'élève dans la classe et l'année académique sélectionnées
      const existingRegistration = registrations.find(
        (registration) =>
          registration.student_id === reRegistration?.student?.id &&
          registration.class_id === New.class_id &&
          registration.academic_year_id === AcademicYearCurrent?.id
      );

      if (existingRegistration) {
        toast.error(
          `l'eleve ${reRegistration?.student?.name} ${reRegistration?.student?.first_name} est déjà inscrit dans cette classe pour cette année académique.`
        );
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
        return;
      }
    }

    if (currentStep === 2) {
      setReRegistrations(null);
      router.push("/registration");
      return;
    }

    setActiveStep((prev) => prev + 1);
  }, [activeStep]); // Réduit les dépendances

  if (hasAdminAccessInscrire === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-center mb-8">
        {steps[activeStep]?.desc}
      </h2>
      <Stepper
        current={activeStep}
        direction={isTablet ? "vertical" : "horizontal"}
      >
        {steps.map(({ label }) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form className="grid grid-cols-2 gap-4 mt-4">
        {activeStep === 0 && (
          <>
            {/* Composant ImageUploader avec gestion de l'image */}
            {/*<ImageUploader
              initialImage={reRegistration?.student.photo || ""}
              onImageChange={handleImageChange}
            /> */}

            <div className="flex flex-col gap-3">
              <Label>Matricule</Label>
              <Input
                name="registration_number"
                value={Data.registration_number}
                onChange={handleChange}
                placeholder="Numéro d'inscription"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Nom</Label>
              <Input
                name="name"
                value={Data.name}
                onChange={handleChange}
                placeholder="Nom"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Prenom</Label>
              <Input
                name="first_name"
                value={Data.first_name}
                onChange={handleChange}
                placeholder="Prénom"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Date de Naissance</Label>
              <Input
                name="birth_date"
                type="date"
                value={Data.birth_date}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Nom du tuteur</Label>
              <Input
                name="tutor_name"
                value={Data.tutor_name}
                onChange={handleChange}
                placeholder="Nom du tuteur"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Prenom du tuteur</Label>
              <Input
                name="tutor_first_name"
                value={Data.tutor_first_name}
                onChange={handleChange}
                placeholder="Prénom du tuteur"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Numero du tuteur</Label>
              <Input
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

            <div className="flex flex-col gap-3">
              <Label>Statut de l'eleve</Label>
              <Select
                name="status"
                onValueChange={(value) =>
                  setData({ ...Data, assignment_type_id: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent
                  defaultChecked={true}
                  defaultValue={reRegistration?.student.assignment_type_id?.toString()}
                >
                  {assignmentTypes.map((item: AssignmentType) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Niveau</Label>
              <Select
                name="Niveau"
                onValueChange={(value) => setLevelChoice(Number(value))}
                required
                defaultValue={reRegistration?.classe.level_id?.toString()} // Déplacement ici
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
            <div className="flex flex-col gap-3">
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
          </>
        )}

        {activeStep === 1 && (
          <>
            <div className="col-span-2 bg-transparent text-center items-center justify-center ">
              {reRegistration?.student && (
                <Card
                  title={`documents de ${reRegistration.student.name} ${reRegistration.student.first_name}`}
                >
                  <FileManager student={reRegistration.student} />
                </Card>
              )}
            </div>
            <div className="col-span-2 bg-transparent text-center items-center justify-center ">
              <TarificationTable
                tarifications={pricing}
                level_id={levelChoice}
                assignmenttype_id={Data.assignment_type_id ?? 1}
                academicyear_id={AcademicYearCurrent?.id ?? 1}
                TarificationsFound={handleNoTarifications}
                onTarificationsData={setTarificationsData}
              />
            </div>
          </>
        )}

        {activeStep === 2 &&
          datapost &&
          tarificationsData &&
          Tarificationfound === true && (
            <div className="col-span-2 bg-transparent text-center items-center justify-center ">
              <RegistrationFinal
                registration={datapost}
                finance={tarificationsData}
              />
            </div>
          )}
      </form>
      <div className="flex justify-between mt-4">
        {activeStep > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveStep((prev) => prev - 1)}
          >
            Retour
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleNext}
          disabled={
            activeStep === 1 && Tarificationfound === false ? true : false
          }
        >
          {activeStep === steps.length - 1 ? "Terminer" : "Suivant"}
        </Button>
      </div>
    </Card>
  );
}
