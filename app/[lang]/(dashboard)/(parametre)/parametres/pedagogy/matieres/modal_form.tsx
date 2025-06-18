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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store";
import { Matter } from "@/lib/interface";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MatterData {
  name: string;
  active: number;
}

interface AddMatterModalProps {
  onUpdate: () => void;
}

const DialogForm = ({ onUpdate }: AddMatterModalProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [active, setActive] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const { setMatters } = useSchoolStore();

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la matière est requis.",
        color: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const newMatter: MatterData = {
      name,
      active,
    };

    try {
      const response = await fetch("/api/matter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMatter),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la matière");
      }

      toast({
        title: "Succès",
        description: "Matière créée avec succès !",
        color: "success",
      });

      onUpdate();
      setName("");
      setActive(1);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${(error as Error).message}`,
        color: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button color="indigodye" onClick={() => setOpen(true)}>
          Ajouter une matière
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Ajouter une nouvelle matière
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la matière</Label>
                <Input
                  id="name"
                  placeholder="ex: Mathématiques"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={active.toString()}
                  onValueChange={(value) => setActive(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="1" className="flex items-center gap-2">

                      Active
                    </SelectItem>
                    <SelectItem value="0" className="flex items-center gap-2">

                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-around gap-3">
            <DialogClose asChild>
              <Button color="destructive" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              color="indigodye"
              className="flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  "Ajouter"
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
