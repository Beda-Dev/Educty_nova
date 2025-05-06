"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ControlledSelectData from "./select_level";
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
import { fetchClasses } from "@/store/schoolservice";
import {Classe} from '@/lib/interface'
interface ClassData {
  level_id: number;
  label: string;
  student_number: number;
  max_student_number: number;
}

const DialogForm = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [label, setLabel] = useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [maxStudent, setMaxStudent] = useState<number | null>(null);
  const [studentNumber] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const {levels , classes , setClasses} = useSchoolStore()


  
  const validateForm = (): boolean => {
    if (!label.trim()) {
      toast.error("Le libellé est requis.");
      return false;
    }
    if (selectedLevelId === null) {
      toast.error("Veuillez sélectionner un niveau.");
      return false;
    }
    if (maxStudent === null || maxStudent <= 0) {
      toast.error("Le nombre maximal d'élèves doit être supérieur à 0.");
      return false;
    }
    return true;
  };

  // Envoi des données
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    toast.loading("Création en cours...");

    const newClass: ClassData = {
      level_id: selectedLevelId!,
      label,
      student_number: studentNumber,
      max_student_number: maxStudent!,
    };

    try {
      const response = await fetch("/api/classe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la classe.");
      }

      toast.dismiss();
      toast.success("Classe créée avec succès !");
      const update:Classe[] = await fetchClasses()
      if(update){
        setClasses(update);
      }
      setLabel("");
      setSelectedLevelId(null);
      setMaxStudent(null);
      setOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error(`Une erreur est survenue. ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog  open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button  onClick={()=> setOpen(true) }>Ajouter une classe</Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            Créer une nouvelle classe
          </DialogTitle>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[290px]">
            <div className="sm:grid sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
              <div className="flex flex-col gap-2">
                <Label>Libellé</Label>
                <Input
                  type="text"
                  placeholder="ex : 6e-5"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nombre d'élèves maximal</Label>
                <Input
                  type="number"
                  min={1}
                  value={maxStudent ?? ""}
                  onChange={(e) => setMaxStudent(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Niveau</Label>
                <ControlledSelectData datas={levels} onSelect={setSelectedLevelId} placeholder="Choisir un niveau" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nombre d'élèves actuels</Label>
                <Input type="number" value={studentNumber} disabled />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-center gap-3 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
