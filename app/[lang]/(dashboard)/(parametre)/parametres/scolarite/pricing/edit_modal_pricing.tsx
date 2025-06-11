import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ControlledSelectData from "./select_data";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { Pricing } from "@/lib/interface";
import { Plus , Loader2 } from "lucide-react";

interface PricingData {
  assignment_type_id: number;
  academic_years_id: number;
  level_id: number;
  fee_type_id: number;
  label: string;
  amount: string;
}

interface DialogFormProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pricing: Pricing | null;
  onUpdate: () => void;
}

const DialogForm: React.FC<DialogFormProps> = ({
  open,
  setOpen,
  pricing,
  onUpdate,
}) => {
  const [label, setLabel] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [assignmentTypeId, setAssignmentTypeId] = useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [feeTypeId, setFeeTypeId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { levels, academicYears, assignmentTypes, feeTypes } = useSchoolStore();

  useEffect(() => {
    if (pricing) {
      setLabel(pricing.label);
      setAmount(pricing.amount);
      setSelectedLevelId(pricing.level.id);
      setAssignmentTypeId(pricing.assignment_type.id);
      setAcademicYearId(pricing.academic_year.id);
      setFeeTypeId(pricing.fee_type.id);
    }
  }, [pricing]);

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
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    toast.loading("Mise à jour en cours...");

    const updatedPricing: PricingData = {
      assignment_type_id: assignmentTypeId!,
      academic_years_id: academicYearId!,
      level_id: selectedLevelId!,
      fee_type_id: feeTypeId!,
      label,
      amount,
    };

    try {
      const response = await fetch(`/api/pricing?id=${pricing?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPricing),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error("Erreur lors de la mise à jour de la tarification.");
      }

      toast.dismiss();
      toast.success("Tarification mise à jour avec succès !");
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error(`Une erreur est survenue.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            Modifier la tarification
          </DialogTitle>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[350px]">
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
                <ControlledSelectData
                  datas={levels}
                  onSelect={setSelectedLevelId}
                  placeholder="Choisir un niveau"
                  defaultValue={pricing?.level_id}
                />
              </div>

              {/* Type d'affectation */}
              <div className="flex flex-col gap-2">
                <Label>Type d'affectation</Label>
                <ControlledSelectData
                  datas={assignmentTypes}
                  onSelect={setAssignmentTypeId}
                  placeholder="Choisir un type d'affectation"
                  defaultValue={pricing?.assignment_type_id}
                />
              </div>

              {/* Année académique */}
              <div className="flex flex-col gap-2">
                <Label>Année académique</Label>
                <ControlledSelectData
                  datas={academicYears}
                  onSelect={setAcademicYearId}
                  placeholder="Choisir une année académique"
                  defaultValue={pricing?.academic_years_id}
                />
              </div>

              {/* Type de frais */}
              <div className="flex flex-col gap-2">
                <Label>Type de frais</Label>
                <ControlledSelectData
                  datas={feeTypes}
                  onSelect={setFeeTypeId}
                  placeholder="Choisir un type de frais"
                  defaultValue={pricing?.fee_type_id}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-around gap-3 mt-4">
            <DialogClose asChild>
              <Button color="destructive" type="button" variant="outline" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button color="tyrian" type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4 " />
                  Mettre à jour
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
