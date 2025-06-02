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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckIcon, Loader2Icon, WalletIcon, ChevronLeft, ChevronRight } from "lucide-react";


interface DonneeScolaireProps {
  student: Student;
  onSubmitResult: (result: { success: boolean; data?: Registration }) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLastStep?: boolean;
}

export default function DonneeScolaire({
  student,
  onSubmitResult,
  onPrevious,
  onNext,
  isLastStep
}: DonneeScolaireProps) {
  const {
    assignmentTypes,
    levels,
    classes,
    academicYears,
    pricing,
    academicYearCurrent,
    registrations,
    userOnline,
    cashRegisters
  } = useSchoolStore();

  const currentAcademicYear = academicYearCurrent as AcademicYear;
  const [academicChoice, setAcademicChoice] = useState<number>(currentAcademicYear?.id ?? 0);
  const [levelChoice, setLevelChoice] = useState<number | null>(null);
  const [classChoice, setClassChoice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [hasValidFees, setHasValidFees] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [foundTarifications, setFoundTarifications] = useState<Pricing[]>([]);

  useEffect(() => {
    if (!academicYears.some(year => year.id === academicChoice)) {
      setAcademicChoice(currentAcademicYear?.id ?? 0);
    }
  }, [academicYears, academicChoice, currentAcademicYear]);

  const filteredClasses = useMemo(() =>
    levelChoice ? TrieDeClasse(levelChoice, classes) : [],
    [levelChoice, classes]
  );

  const handlePaymentChange = (amount: number, installmentId?: number) => {
    setPaymentAmount(amount);
    if (installmentId) {
      setSelectedInstallment(installmentId);
    }
  };

  const handleTarificationsFound = (tarifs: Pricing[]) => {
    setFoundTarifications(tarifs);
    setHasValidFees(tarifs.length > 0);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!classChoice || !levelChoice) {
      errors.class = "Veuillez sélectionner un niveau et une classe";
    }

    if (paymentAmount > 0) {
      if (!selectedCashRegister) {
        errors.cashRegister = "Veuillez sélectionner une caisse";
      }
      if (!selectedInstallment) {
        errors.installment = "Veuillez sélectionner une échéance";
      }

      // Vérifier que le montant ne dépasse pas le total des tarifs
      const totalAmount = foundTarifications.reduce((acc, tarif) => acc + Number(tarif.amount), 0);
      if (paymentAmount > totalAmount) {
        errors.amount = `Le montant ne peut pas dépasser ${totalAmount.toLocaleString()} FCFA`;
      }

      // Vérifier que le montant ne dépasse pas l'échéance sélectionnée
      if (selectedInstallment) {
        const installment = foundTarifications
          .flatMap(t => t.installments)
          .find(i => i?.id === selectedInstallment);

        if (installment && paymentAmount > Number(installment.amount_due)) {
          errors.amount = `Le montant ne peut pas dépasser ${Number(installment.amount_due).toLocaleString()} FCFA pour cette échéance`;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
      if (paymentAmount > 0 && selectedInstallment) {
        const paymentResponse = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student.id,
            installment_id: selectedInstallment,
            cash_register_id: Number(selectedCashRegister),
            cashier_id: userOnline?.id,
            amount: paymentAmount,
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
          onTarificationsFound={handleTarificationsFound}
        />
      )}

      {paymentAmount > 0 && (
        <>
          <div className="space-y-2">
            <Label>Caisse</Label>
            <Select
              value={selectedCashRegister}
              onValueChange={setSelectedCashRegister}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une caisse" />
              </SelectTrigger>
              <SelectContent>
                {cashRegisters.map((caisse) => (
                  <SelectItem key={caisse.id} value={caisse.id.toString()}>
                    Caisse {caisse.cash_register_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.cashRegister && (
              <p className="text-sm text-destructive">{formErrors.cashRegister}</p>
            )}
          </div>

          {formErrors.amount && (
            <p className="text-sm text-destructive">{formErrors.amount}</p>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <WalletIcon className="h-4 w-4" />
              {hasValidFees ? "Enregistrer" : "Suivant"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5" />
                Confirmation d'inscription
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Détails</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Inscription en classe</TableCell>
                      <TableCell className="text-right font-mono">
                        {classChoice ?
                          classes.find(c => c.id === classChoice)?.label :
                          "Non sélectionné"}
                      </TableCell>
                    </TableRow>
                    {paymentAmount > 0 && (
                      <>
                        <TableRow>
                          <TableCell>Échéance sélectionnée</TableCell>
                          <TableCell className="text-right font-mono">
                            {selectedInstallment || "Non sélectionné"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Montant payé</TableCell>
                          <TableCell className="text-right font-mono">
                            {paymentAmount.toLocaleString()} FCFA
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between mt-6">
                (
                  <Button
                    variant="outline"
                    onClick={onPrevious}
                    className="w-32"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                )
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !hasValidFees || !validateForm()}
                  className="w-32"
                >
                  {loading ? (
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2" />
                  )}
                  {isLastStep ? "Terminer" : "Suivant"}
                </Button>
              </div>


            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}