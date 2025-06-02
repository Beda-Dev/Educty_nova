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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, usePathname } from "next/navigation";
import { useSchoolStore } from "@/store";
import {
  AssignmentType,
  Level,
  Classe,
  Student,
  Registration,
  Pricing
} from "@/lib/interface";
import { ImageUploader } from "./select_photo";
import FileManager from "./input";
import TarificationTable from "./tarificationTab";
import FormulaireEnregistrement from "./Formulaire_nouvel_eleve";
import DonneeScolaire from "./donnee_scolaire";
import RegistrationFinal from "./final_register";
import { getTarificationData } from "./fonction";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import StepperWrapper from "../StepperWrapper";
import { steps } from "./step";

export default function NewReregistration() {
  const router = useRouter();
  const {
    reRegistration,
    assignmentTypes,
    levels,
    classes,
    documents,
    pricing,
    academicYears,
    documentTypes,
    userOnline,
    Newstudent,
    setNewStudent,
    setReRegistrations
  } = useSchoolStore();
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const [activeStep, setActiveStep] = useState<number>(0);
  const [lastAcademicYearId, setLastAcademicYearId] = useState<number>(1);
  const [isValidAdd, setIsValidAdd] = useState(false);
  const [isValidRegistration, setIsValidRegistration] = useState(false);
  const [student, setStudent] = useState<Student>();
  const [registration, setRegistration] = useState<{
    success: boolean;
    data?: Registration;
  }>();
  const [hasDocuments, setHasDocuments] = useState(true);
  const permissionRequisInscrire = ["inscrire eleve"];
  const hasAdminAccessInscrire = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisInscrire
  );

  const pathname = usePathname();

useEffect(() => {
    if (!pathname.endsWith('/new_registration')) {
    setNewStudent(null);
  }
  return () => {
    setNewStudent(null);
  };
}, [pathname]);






  const handleDocumentStatusChange = (isNotEmpty: boolean) => {
    // console.log(isNotEmpty);
  };
  const handleResultAddStudent = (result: {
    success: boolean;
    data?: Student;
  }) => {
    if (result.success) {
      setActiveStep((prev) => prev + 1);
      console.log("Enregistrement réussi !");
      if (result.data) {
        setStudent(result.data);
      }
    } else {
      console.log("Erreur lors de l'enregistrement.", result.data);
    }
  };

  const handleSubmissionResult = (result: {
    success: boolean;
    data?: Registration;
  }) => {
    if (result.success) {
      //console.log("Inscription réussie :", result.data);
      setRegistration(result);
      setActiveStep((prev) => prev + 1)
    } else {
      console.error("Échec de l'inscription.");
    }
  };


  const [levelChoice, setLevelChoice] = useState(
    Number(reRegistration?.classe?.level_id ?? 0)
  );
  const [New, setNew] = useState({
    class_id: reRegistration?.class_id,
    academic_year_id: reRegistration?.academic_year_id,
    student_id: reRegistration?.student_id,
    registration_date: new Date(),
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);

    if (activeStep === steps.length - 1 ) {
      setReRegistrations(null);
      router.push('/eleves/registration')
      

      //setIsValidAdd(true);
      
    }
  };

  if (hasAdminAccessInscrire === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <StepperWrapper steps={steps} currentStep={activeStep} />
      </CardHeader>
      <CardContent>
      {activeStep === 0 && (
        <FormulaireEnregistrement
          isValid={isValidAdd}
          onSubmitResult={handleResultAddStudent}
          onPrevious={() => setActiveStep((prev) => prev - 1)}
          onNext={handleNext}
          isLastStep={activeStep === steps.length - 1}
        />
      )}
      {activeStep === 1 && student && (
        <FileManager
          student={student}
          onDocumentStatus={handleDocumentStatusChange}
          onPrevious={() => setActiveStep((prev) => prev - 1)}
          onNext={handleNext}
          isLastStep={activeStep === steps.length - 1}
        />
      )}

      {activeStep === 2 && student && (
        <DonneeScolaire
          student={student}
          onSubmitResult={handleSubmissionResult}
          onPrevious={() => setActiveStep((prev) => prev - 1)}
          onNext={handleNext}
          isLastStep={activeStep === steps.length - 1}
        />
      )}

      {activeStep === 3 && registration && registration.success === true && registration.data && (
        <RegistrationFinal
          registration={registration.data}
          finance={getTarificationData(
            pricing,
            registration.data?.classe?.level_id ?? 0,
            registration.data.student?.assignment_type_id ?? 0,
            registration.data.academic_year_id
          )}
          onPrevious={() => setActiveStep((prev) => prev - 1)}
          onNext={handleNext}
          isLastStep={activeStep === steps.length - 1}
        />
      )}
      </CardContent>
    </Card>
  );
}
