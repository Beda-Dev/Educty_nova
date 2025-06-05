"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { RegistrationForm } from "./RegistrationForm";
import PaymentForm from "./payment_step";
import StepperWrapper from "../StepperWrapper";
import { steps } from "./step";

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
  const [activeStep, setActiveStep] = useState<number>(0);
  const [AcademicYearCurrent, setAcademicYearCurrent] =
    useState<AcademicYear>();
  const [Tarificationfound, setTarificationfound] = useState(false);
  const [datapost, setDataPost] = useState<Registration>();
  const [subPay, setSubPay] = useState<boolean>(false);
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

  const [Data, setData] = useState(() => ({
    assignment_type_id: reRegistration?.student.assignment_type_id,
    registration_number: reRegistration?.student.registration_number,
    name: reRegistration?.student.name,
    first_name: reRegistration?.student.first_name,
    birth_date: reRegistration?.student.birth_date,
    status: reRegistration?.student.status,
  }));

  useEffect(() => {
    if (reRegistration?.student) {
      setData({
        assignment_type_id: reRegistration.student.assignment_type_id,
        registration_number: reRegistration.student.registration_number,
        name: reRegistration.student.name,
        first_name: reRegistration.student.first_name,
        birth_date: reRegistration.student.birth_date,
        status: reRegistration.student.status,
      });
    }
  }, [reRegistration]);

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

  const handleUpdateSuccess = useCallback(() => {
    setActiveStep((prev) => prev + 1);
  }, []);

  const toggleOpen = () => {
    setSubPay(false);
  };

  // Dans OldReregistration
  const handlePaymentSubmit = useCallback(() => {
    setIsSubmitting(true);
    setSubPay(true);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setIsSubmitting(false);
    setSubPay(false);
    handleUpdateSuccess();
  }, [handleUpdateSuccess]);

  const handleNext = useCallback(async () => {
    setIsSubmitting(true);
    const currentStep = activeStep;

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
        const res = await fetch(`/api/registration`, {
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
        
        // Attendre 1.5 secondes pour voir le message de succès
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setActiveStep((prev) => prev + 1);
      } catch (error) {
        console.error(error);
        toast.error("Erreur d'inscription");
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep === 2) {
      return;
    }

    if (currentStep === 3) {
      setSubPay(true);
      if (!datapost || !tarificationsData) {
        toast.error("Veuillez compléter les étapes précédentes.");
        setIsSubmitting(false);
        return;
      }
      setReRegistrations(null);
      router.push("/eleves/registration");
      setIsSubmitting(false);
      return;
    }

    setActiveStep((prev) => prev + 1);
    setIsSubmitting(false);
  }, [
    activeStep,
    New,
    AcademicYearCurrent,
    reRegistration,
    registrations,
    academicYearCurrent,
    classes,
    router,
    setReRegistrations
  ]);

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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full gap-6 mt-4"
          >
            {activeStep === 0 && (
              <RegistrationForm
                Data={Data}
                levelChoice={levelChoice}
                reRegistration={reRegistration}
                assignmentTypes={assignmentTypes}
                levels={levels}
                classes={classes}
                handleChange={handleChange}
                setLevelChoice={setLevelChoice}
                setData={setData}
                setNew={setNew}
                studentId={reRegistration?.student_id}
                onUpdateSuccess={handleUpdateSuccess}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                onPrevious={() =>
                  setActiveStep((prev) => Math.max(0, prev - 1))
                }
                onNext={() =>
                  setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))
                }
                isLastStep={activeStep === steps.length - 1}
                Tarificationfound={tarificationsData}
              />
            )}

            {activeStep === 1 && (
              <>
                <motion.div
                  variants={inputVariants}
                  className="col-span-2 space-y-6"
                >
                  {reRegistration?.student && (
                    <FileManager
                      student={reRegistration.student}
                      onPrevious={() => setActiveStep(activeStep - 1)}
                      onNext={() => setActiveStep(activeStep + 1)}
                      isLastStep={activeStep === 1}
                      isSubmitting={isSubmitting}
                      Tarificationfound={
                        !!tarificationsData && tarificationsData.fees.length > 0
                      }
                    />
                  )}

                  {reRegistration?.student && (
                    <TarificationTable
                      tarifications={pricing}
                      level_id={levelChoice}
                      assignmenttype_id={Data.assignment_type_id ?? 1}
                      academicyear_id={AcademicYearCurrent?.id ?? 1}
                      TarificationsFound={handleNoTarifications}
                      onTarificationsData={setTarificationsData}
                      student={reRegistration.student}
                      onSubmitResult={(result) => {
                        if (result.success) {
                          toast.success("Tarification saved successfully");
                        } else {
                          toast.error("Failed to save tarification");
                        }
                      }}
                      onPrevious={() => setActiveStep((prev) => prev - 1)}
                      onNext={() => setActiveStep((prev) => prev + 1)}
                      isLastStep={false}
                      isSubmitting={false}
                      Tarificationfound={false}
                    />
                  )}
                </motion.div>
              </>
            )}
            {activeStep === 2 && datapost && (
              <motion.div
                variants={inputVariants}
                className="col-span-2 space-y-6"
              >
                <PaymentForm
                  registration={datapost}
                  submit={subPay}
                  Sub={() => {
                    setSubPay(false);
                    setIsSubmitting(false);
                  }}
                  onSuccess={handlePaymentSuccess}
                  onPrevious={() => setActiveStep((prev) => prev - 1)}
                  onNext={() => setActiveStep((prev) => prev + 1)}
                  isLastStep={false}
                  isSubmitting={isSubmitting}
                  Tarificationfound={Tarificationfound}
                />
              </motion.div>
            )}

            {activeStep === 3 &&
              datapost &&
              tarificationsData &&
              Tarificationfound === true && (
                <motion.div variants={inputVariants} className="col-span-2">
                  <RegistrationFinal
                    registration={datapost}
                    finance={tarificationsData}
                    onPrevious={() => setActiveStep(activeStep - 1)}
                    onNext={() => setActiveStep(activeStep + 1)}
                    isLastStep={true}
                    isSubmitting={false}
                    Tarificationfound={Tarificationfound}
                  />
                </motion.div>
              )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
