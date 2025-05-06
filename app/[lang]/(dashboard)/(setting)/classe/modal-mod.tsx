"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ControlledSelectData from "./select_level";
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
import { Classe } from "@/lib/interface";
import { useSchoolStore } from "@/store";

interface EditClassModalProps {
  classData: Classe;
  onClose: () => void;
  onUpdate: () => void;
  onOpen: boolean;
}

interface ClassTo{
    level_id: number,
    label : string,
    student_number:string,
    max_student_number: string
}

const EditClassModal = ({ classData, onClose, onUpdate, onOpen }: EditClassModalProps) => {
  const [label, setLabel] = useState<string>(classData.label);
  const [selectedLevelId, setSelectedLevelId] = useState<number>(classData.level_id);
  const [maxStudent, setMaxStudent] = useState<number>(Number(classData.max_student_number));
  const [loading, setLoading] = useState<boolean>(false);
  const {levels} = useSchoolStore()

  useEffect(() => {
    setLabel(classData.label);
    setSelectedLevelId(classData.level_id);
    setMaxStudent(Number(classData.max_student_number));
  }, [classData]);

  const validateForm = (): boolean => {
    if (!label.trim()) {
      toast.error("Le libellé est requis.");
      return false;
    }
    if (selectedLevelId === null) {
      toast.error("Veuillez sélectionner un niveau.");
      return false;
    }
    if (maxStudent <= 0) {
      toast.error("Le nombre maximal d'élèves doit être supérieur à 0.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    toast.loading("Mise à jour en cours...");

    const updatedClass: ClassTo = {
      level_id: selectedLevelId,
      label,
      student_number:classData.student_number,
      max_student_number: maxStudent.toString(),
    };

    try {
      const response = await fetch(`/api/classe?id=${classData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedClass),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la classe.");
      }

      toast.dismiss();
      toast.success("Classe mise à jour avec succès !");
      onUpdate(); // Met à jour la liste des classes
      onClose();  // Ferme le modal
    } catch (error) {
      toast.dismiss();
      toast.error(`Une erreur est survenue. ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={onOpen} onOpenChange={onClose}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            Modifier la classe
          </DialogTitle>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[290px]">
            <div className="sm:grid sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
              <div className="flex flex-col gap-2">
                <Label>Libellé</Label>
                <Input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nombre d'élèves maximal</Label>
                <Input
                  type="number"
                  min={1}
                  value={maxStudent}
                  onChange={(e) => setMaxStudent(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Niveau</Label>
                <ControlledSelectData datas={levels} onSelect={(id) => id !== null && setSelectedLevelId(id)} placeholder="Choisir un niveau" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nombre d'élèves actuels</Label>
                <Input type="number" value={classData.student_number} readOnly />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-center gap-3 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleUpdate} disabled={loading}>
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClassModal;
