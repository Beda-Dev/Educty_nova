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
import { Classe, Serie } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import {Loader2} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const {levels, registrations, series} = useSchoolStore();

  // Gestion de la série
  const [hasSerie, setHasSerie] = useState<boolean>(!!classData.serie_id);
  const [selectedSerieId, setSelectedSerieId] = useState<number | null>(classData.serie_id ?? null);

  useEffect(() => {
    setLabel(classData.label);
    setSelectedLevelId(classData.level_id);
    setMaxStudent(Number(classData.max_student_number));
    setHasSerie(!!classData.serie_id);
    setSelectedSerieId(classData.serie_id ?? null);
  }, [classData]);

  const [levelChangeBlocked, setLevelChangeBlocked] = useState<boolean>(false);
  const [levelChangeError, setLevelChangeError] = useState<string>("");

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

  const handleLevelChange = (id: number | null) => {
    if (id === null) return;
    // Vérifie si des élèves sont inscrits dans cette classe pour ce niveau
    const hasRegistrations = registrations.some(
      (reg) =>
        reg.classe.id === classData.id &&
        reg.classe.level_id === classData.level_id
    );
    if (hasRegistrations && id !== classData.level_id) {
      setLevelChangeBlocked(true);
      setLevelChangeError(
        "Des élèves sont déjà inscrits dans cette classe. Modifier le niveau affectera leur facturation. Modification du niveau bloquée."
      );
    } else {
      setLevelChangeBlocked(false);
      setLevelChangeError("");
      setSelectedLevelId(id);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    toast.loading("Mise à jour en cours...");

    const updatedClass: any = {
      level_id: selectedLevelId,
      label,
      student_number: classData.student_number,
      max_student_number: maxStudent.toString(),
    };

    // Ajout du champ serie_id si nécessaire
    if ((classData.serie_id === null && hasSerie && selectedSerieId) ||
        (classData.serie_id !== null && selectedSerieId)) {
      updatedClass.serie_id = selectedSerieId;
    }

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
                <ControlledSelectData
                  datas={levels}
                  onSelect={handleLevelChange}
                  placeholder="Choisir un niveau"
                />
                {levelChangeBlocked && (
                  <span className="text-destructive text-xs">{levelChangeError}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nombre d'élèves actuels</Label>
                <Input type="number" value={classData.student_number} readOnly />
              </div>
              {/* Gestion de la série */}
              {classData.serie_id === null ? (
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-2">
                    <Checkbox
                      checked={hasSerie}
                      onCheckedChange={(checked) => {
                        setHasSerie(!!checked);
                        if (!checked) setSelectedSerieId(null);
                      }}
                    />
                    Lier cette classe à une série
                  </Label>
                  {hasSerie && (
                    <Select
                      value={selectedSerieId ? String(selectedSerieId) : ""}
                      onValueChange={(value) =>
                        setSelectedSerieId(value ? Number(value) : null)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Sélectionner une série" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        {series.map((serie: Serie) => (
                          <SelectItem key={serie.id} value={String(serie.id)}>
                            {serie.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label>Série</Label>
                  <Select
                    value={selectedSerieId ? String(selectedSerieId) : ""}
                    onValueChange={(value) =>
                      setSelectedSerieId(value ? Number(value) : null)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Sélectionner une série" />
                    </SelectTrigger>
                    <SelectContent  className="z-[9999]">
                      {series.map((serie: Serie) => (
                        <SelectItem key={serie.id} value={String(serie.id)}>
                          {serie.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-around gap-3 mt-4">
            <DialogClose asChild>
              <Button color="destructive" type="button"  disabled={loading} onClick={onClose}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              color="tyrian"
              type="button"
              onClick={handleUpdate}
              disabled={loading || levelChangeBlocked}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2"><Loader2 className="h-4 w-4" /></span>
                  Mise à jour...
                </>) : 
                "Mettre à jour"
                }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClassModal;
