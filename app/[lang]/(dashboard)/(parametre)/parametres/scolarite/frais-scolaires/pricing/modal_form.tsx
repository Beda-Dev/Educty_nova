"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ControlledSelectData from "./select_data";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { fetchpricing } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { Pricing } from "@/lib/interface";
import { Calendar } from "@/components/ui/calendar"; // Import du composant Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingData {
  assignment_type_id: number;
  academic_years_id: number;
  level_id: number;
  fee_type_id: number;
  label: string;
  amount: string;
}

interface DialogFormProps {
  onSuccess: (success: boolean) => void; 
}


const DialogForm = ({ onSuccess }: DialogFormProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [label, setLabel] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [assignmentTypeId, setAssignmentTypeId] = useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [feeTypeId, setFeeTypeId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<Date>(); // Nouvel état pour la date d'échéance
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    levels,
    academicYears,
    assignmentTypes,
    feeTypes,
    academicYearCurrent,
    setPricing
  } = useSchoolStore();

  const validateForm = (): boolean => {
    if (!label.trim()) {
      toast.error("Le libellé est requis.");
      return false;
    }
    if (!amount.trim() || Number(amount) <= 0) {
      toast.error("Le montant doit être supérieur à 0.");
      return false;
    }
    if (selectedLevelId === null) {
      toast.error("Veuillez sélectionner un niveau.");
      return false;
    }
    if (assignmentTypeId === null) {
      toast.error("Veuillez sélectionner un type d'affectation.");
      return false;
    }
    if (academicYearId === null) {
      toast.error("Veuillez sélectionner une année académique.");
      return false;
    }
    if (feeTypeId === null) {
      toast.error("Veuillez sélectionner un type de frais.");
      return false;
    }
    if (!dueDate) {
      toast.error("Veuillez sélectionner une date d'échéance.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
    toast.loading("Création en cours...");
  
    const newPricing: PricingData = { 
      assignment_type_id: assignmentTypeId!,
      academic_years_id: academicYearId!,
      level_id: selectedLevelId!,
      fee_type_id: feeTypeId!,
      label,
      amount,
    };
  
    try {
      // 1. Création de la tarification
      const pricingResponse = await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPricing),
      });
  
      if (!pricingResponse.ok) {
        throw new Error("Erreur lors de la création de la tarification.");
      }
  
      const createdPricing = await pricingResponse.json();
  
      // 2. Création de l'échéance associée
      const newInstallment = {
        pricing_id: createdPricing.id,
        amount_due: createdPricing.amount,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : '',// Utilisation de la date sélectionnée
        status: "Pending", // Ajout d'un statut par défaut
      };
  
      const installmentResponse = await fetch("/api/installment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInstallment),
      });
  
      if (!installmentResponse.ok) {
        throw new Error("Tarification créée mais erreur lors de la création de l'échéance.");
      }
  
      toast.dismiss();
      toast.success("Tarification et échéance créées avec succès !");
      
      // Réinitialisation du formulaire
      setLabel("");
      setAmount("");
      setSelectedLevelId(null);
      setAssignmentTypeId(null);
      setAcademicYearId(null);
      setFeeTypeId(null);
      setDueDate(undefined);
      setOpen(false);

      onSuccess(true);


  
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Ajouter une tarification</Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            Créer une nouvelle tarification
          </DialogTitle>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[400px]"> {/* Augmentation de la hauteur pour accommoder le DatePicker */}
            <div className="sm:grid sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
              {/* Libellé */}
              <div className="flex flex-col gap-2">
                <Label>Libellé</Label>
                <Input
                  type="text"
                  placeholder="ex : Tarification inscription"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              {/* Montant */}
              <div className="flex flex-col gap-2">
                <Label>Montant</Label>
                <Input
                  type="number"
                  placeholder="ex : 100000"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Niveau */}
              <div className="flex flex-col gap-2">
                <Label>Niveau</Label>
                <ControlledSelectData datas={levels} onSelect={setSelectedLevelId} placeholder="Choisir un niveau" />
              </div>

              {/* Type d'affectation */}
              <div className="flex flex-col gap-2">
                <Label>Type d'affectation</Label>
                <ControlledSelectData datas={assignmentTypes} onSelect={setAssignmentTypeId} placeholder="Choisir un type d'affectation" />
              </div>

              {/* Année académique */}
              <div className="flex flex-col gap-2">
                <Label>Année académique</Label>
                <ControlledSelectData datas={academicYears} onSelect={setAcademicYearId} placeholder="Choisir une année académique" />
              </div>

              {/* Type de frais */}
              <div className="flex flex-col gap-2">
                <Label>Type de frais</Label>
                <ControlledSelectData datas={feeTypes} onSelect={setFeeTypeId} placeholder="Choisir un type de frais" />
              </div>

              {/* Date d'échéance */}
              <div className="flex flex-col gap-2">
                <Label>Date d'échéance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]">	
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-center gap-3 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading} color="destructive">
                Annuler
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit} disabled={loading} color="success" >
              {loading ? "Création..." : "Créer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;