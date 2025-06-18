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
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import { Matter } from "@/lib/interface";
import { useSchoolStore } from "@/store";

interface EditMatterModalProps {
  matterData: Matter;
  onClose: () => void;
  onUpdate: () => void;
  onOpen: boolean;
}

interface MatterToUpdate {
  name: string;
  active: number;
}

const EditMatterModal = ({ matterData, onClose, onUpdate, onOpen }: EditMatterModalProps) => {
  const [name, setName] = useState<string>(matterData.name);
  const [active, setActive] = useState<number>(matterData.active);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setName(matterData.name);
    setActive(matterData.active);
  }, [matterData]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error("Le nom de la matière est requis.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    toast.loading("Mise à jour en cours...");

    const updatedMatter: MatterToUpdate = {
      name,
      active,
    };

    try {
      const response = await fetch(`/api/matter?id=${matterData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMatter),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la matière.");
      }

      toast.dismiss();
      toast.success("Matière mise à jour avec succès !");
      onUpdate(); // Met à jour la liste des matières
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
            Modifier la matière
          </DialogTitle>
        </DialogHeader>
        <div>
          <ScrollArea className="h-[290px]">
            <div className="sm:grid sm:grid-cols-2 sm:gap-5 space-y-4 sm:space-y-0">
              <div className="flex flex-col gap-2">
                <Label>Nom de la matière</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Statut</Label>
                <select
                  value={active}
                  onChange={(e) => setActive(Number(e.target.value))}
                  className="border rounded-md p-2"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-evenly gap-3 mt-4">
            <DialogClose asChild>
              <Button color="destructive" type="button" disabled={loading} onClick={onClose}>
                Annuler
              </Button>
            </DialogClose>
            <Button color="tyrian" type="button" onClick={handleUpdate} disabled={loading}>
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatterModal;