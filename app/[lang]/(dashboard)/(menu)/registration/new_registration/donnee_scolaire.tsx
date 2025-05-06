import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSchoolStore } from "@/store";
import { AcademicYear, Student, Registration, Pricing } from "@/lib/interface";
import TarificationTable from "./tarificationTab";
import { TrieDeClasse } from "./fonction";
import { updateStudentCountByClass } from "@/lib/fonction";

interface DonneeScolaireProps {
  student: Student;
  onSubmitResult: (result: { success: boolean; data?: Registration }) => void;
  onNext?: () => void;
}

export default function DonneeScolaire({ 
  student, 
  onSubmitResult, 
  onNext 
}: DonneeScolaireProps) {
  const { 
    assignmentTypes, 
    levels, 
    classes, 
    academicYears, 
    pricing, 
    academicYearCurrent,  
    registrations 
  } = useSchoolStore();
  
  const currentAcademicYear = academicYearCurrent as AcademicYear;
  const [academicChoice, setAcademicChoice] = useState<number>(currentAcademicYear?.id ?? 0);
  const [levelChoice, setLevelChoice] = useState<number | null>(null);
  const [classChoice, setClassChoice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [hasValidFees, setHasValidFees] = useState(false);

  useEffect(() => {
    if (!academicYears.some(year => year.id === academicChoice)) {
      setAcademicChoice(currentAcademicYear?.id ?? 0);
    }
  }, [academicYears, academicChoice, currentAcademicYear]);

  const filteredClasses = useMemo(() => 
    levelChoice ? TrieDeClasse(levelChoice, classes) : [], 
    [levelChoice, classes]
  );

  const handlePaymentChange = (amount: number) => {
    setPaymentAmount(amount);
  };

  const handleSubmit = async () => {
    if (!classChoice || !levelChoice) {
      toast.error("Veuillez sélectionner un niveau et une classe.");
      return;
    }

    setLoading(true);
    const currentDate = new Date().toISOString().split("T")[0];

    const existingRegistration = registrations.find(
      (registration) =>
        registration.student_id === student.id &&
        registration.class_id === classChoice &&
        registration.academic_year_id === academicChoice
    );

    if (existingRegistration) {
      toast.error(`${student.name} ${student.first_name} est déjà inscrit dans cette classe.`);
      setLoading(false);
      return;
    }

    try {
      // Enregistrement de l'inscription
      const registrationResponse = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classChoice,
          academic_year_id: academicChoice,
          student_id: student.id,
          registration_date: currentDate,
        }),
      });

      if (!registrationResponse.ok) throw new Error("Échec de l'inscription.");
      const registrationData = await registrationResponse.json();

      // Enregistrement du paiement si montant saisi
      if (paymentAmount > 0) {
        const paymentResponse = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student.id,
            amount: paymentAmount,
            payment_date: currentDate,
            academic_year_id: academicChoice,
            description: "Frais de scolarité - Premier paiement",
          }),
        });

        if (!paymentResponse.ok) throw new Error("Échec de l'enregistrement du paiement.");
      }

      toast.success("Inscription enregistrée avec succès !");
      await updateStudentCountByClass(registrations, academicYearCurrent, classes);
      onSubmitResult({ success: true, data: registrationData });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription.");
      onSubmitResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Niveau</Label>
          <Select 
            onValueChange={(value) => setLevelChoice(Number(value))}
            value={levelChoice?.toString() || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un niveau" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((item) => (
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
            onValueChange={(value) => setClassChoice(Number(value))}
            value={classChoice?.toString() || ""}
            disabled={!levelChoice}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              {filteredClasses.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {levelChoice && academicChoice && (
        <TarificationTable
          tarifications={pricing}
          level_id={levelChoice}
          assignmenttype_id={Number(student.assignment_type.id)}
          academicyear_id={academicChoice}
          onPaymentAmountChange={handlePaymentChange}
        />
      )}

      <div className="flex justify-end gap-2 mt-4">
        {hasValidFees ? (
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !classChoice}
            className="ml-auto"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        ) : (
          <Button 
            onClick={onNext} 
            variant="outline"
            className="ml-auto"
          >
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
}