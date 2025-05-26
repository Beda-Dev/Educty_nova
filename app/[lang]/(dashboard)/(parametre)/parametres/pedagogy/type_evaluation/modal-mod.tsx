// modal-mod.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { TypeEvaluation } from "@/lib/interface";
import { fetchTypeEvaluations } from "@/store/schoolservice";

interface EditEvaluationTypeModalProps {
  typeData: TypeEvaluation;
  onClose: () => void;
  onUpdate: () => void;
  onOpen: boolean;
}

const EditEvaluationTypeModal = ({
  typeData,
  onClose,
  onUpdate,
  onOpen,
}: EditEvaluationTypeModalProps) => {
  const [label, setLabel] = useState<string>(typeData.label);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLabel(typeData.label);
  }, [typeData]);

  const validateForm = (): boolean => {
    if (!label.trim()) {
      toast({
        title: "Erreur",
        description: "Le libellé du type est requis.",
        color: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/typeEvaluation?id=${typeData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du type d'évaluation");
      }

      toast({
        title: "Succès",
        description: "Type d'évaluation mis à jour avec succès !",
        color: "default",
      });

      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${(error as Error).message}`,
        color: "destructive",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={onOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Modifier le type d'évaluation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Libellé</Label>
            <Input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="flex justify-evenly gap-3 mt-4">
            <DialogClose asChild>
              <Button variant="outline" color="destructive" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button color="tyrian" onClick={handleUpdate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEvaluationTypeModal;
