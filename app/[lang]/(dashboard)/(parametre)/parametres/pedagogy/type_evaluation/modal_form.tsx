// modal_form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AddTypeModalProps {
  onUpdate: () => void;
}

const DialogForm = ({ onUpdate }: AddTypeModalProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [label, setLabel] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/typeEvaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });

      if (!response.ok) throw new Error("Erreur lors de la création");

      toast({ description: "Type d'évaluation ajouté avec succès." });
      setLabel("");
      setOpen(false);
      onUpdate(); // recharge la liste
    } catch (error) {
      console.error("Erreur POST :", error);
      toast({ description: "Échec de la création", color: "destructive" });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button color="indigodye" onClick={() => setOpen(true)}>
          Ajouter un type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Nouveau type d'évaluation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Libellé</Label>
              <Input
                id="label"
                placeholder="ex: Devoir, Interrogation..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-around gap-3">
            <DialogClose asChild>
              <Button color="destructive" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center"
              color="indigodye"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;