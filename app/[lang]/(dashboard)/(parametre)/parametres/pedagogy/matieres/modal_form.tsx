"use client";

import { useState, useRef } from "react";
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
import { Matter, Serie, Level } from "@/lib/interface";
import { Loader2, PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

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
  const { setMatters, levels, series } = useSchoolStore();
  const abortControllers = useRef<AbortController[]>([]);

  // État pour la gestion des coefficients
  const [coefficients, setCoefficients] = useState<Record<number, string>>({});
  const [levelHasSeries, setLevelHasSeries] = useState<Record<number, boolean>>(
    {}
  );
  const [coefficientsBySerie, setCoefficientsBySerie] = useState<
    Record<number, Record<number, string>>
  >({}); // {levelId: {serieId: value}}

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

  const handleCoefficientChange = (levelId: number, value: string) => {
    setCoefficients((prev) => ({ ...prev, [levelId]: value }));
  };

  const handleLevelHasSeriesChange = (levelId: number, checked: boolean) => {
    setLevelHasSeries((prev) => ({ ...prev, [levelId]: checked }));
    if (!checked) {
      setCoefficientsBySerie((prev) => {
        const copy = { ...prev };
        delete copy[levelId];
        return copy;
      });
    }
  };

  const handleSerieCoefficientChange = (
    levelId: number,
    serieId: number,
    value: string
  ) => {
    setCoefficientsBySerie((prev) => ({
      ...prev,
      [levelId]: {
        ...(prev[levelId] || {}),
        [serieId]: value,
      },
    }));
  };

  // Vérification des niveaux et séries chargés
  const isLevelsLoaded = Array.isArray(levels) && levels.length > 0;
  const isSeriesLoaded = Array.isArray(series) && series.length > 0;

  // Validation avancée pour les coefficients
  const validateCoefficients = (): boolean => {
    for (const level of levels) {
      if (levelHasSeries[level.id]) {
        if (!isSeriesLoaded) {
          toast({
            title: "Erreur",
            description: "Aucune série disponible pour ce niveau.",
            color: "destructive",
          });
          return false;
        }
        let hasAtLeastOne = false;
        for (const serie of series) {
          const val = coefficientsBySerie[level.id]?.[serie.id];
          if (val && val.trim() !== "") {
            hasAtLeastOne = true;
            if (isNaN(Number(val)) || Number(val) < 0) {
              toast({
                title: "Erreur",
                description: `Le coefficient pour la série "${serie.label}" du niveau "${level.label}" doit être un nombre positif.`,
                color: "destructive",
              });
              return false;
            }
          }
        }
        if (!hasAtLeastOne) {
          toast({
            title: "Erreur",
            description: `Veuillez saisir au moins un coefficient pour le niveau "${level.label}" et ses séries.`,
            color: "destructive",
          });
          return false;
        }
      } else {
        const val = coefficients[level.id];
        if (val && val.trim() !== "") {
          if (isNaN(Number(val)) || Number(val) < 0) {
            toast({
              title: "Erreur",
              description: `Le coefficient pour le niveau "${level.label}" doit être un nombre positif.`,
              color: "destructive",
            });
            return false;
          }
        }
      }
    }
    return true;
  };

  // Annulation des requêtes si fermeture de la modale
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && loading) {
      abortControllers.current.forEach((ctrl) => ctrl.abort());
      abortControllers.current = [];
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!validateCoefficients()) return;
    if (!isLevelsLoaded) {
      toast({
        title: "Erreur",
        description: "Aucun niveau disponible. Veuillez d'abord créer des niveaux.",
        color: "destructive",
      });
      return;
    }

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

      const createdMatter = await response.json();
      const matterId = createdMatter.id || createdMatter.data?.id;

      // Création des coefficients avec annulation possible
      for (const level of levels) {
        if (levelHasSeries[level.id]) {
          for (const serie of series) {
            const val = coefficientsBySerie[level.id]?.[serie.id];
            if (val && val.trim() !== "") {
              const ctrl = new AbortController();
              abortControllers.current.push(ctrl);
              await fetch("/api/coefficient", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  level_id: level.id,
                  label: val,
                  matter_id: matterId,
                  serie_id: serie.id,
                }),
                signal: ctrl.signal,
              });
            }
          }
        } else {
          const val = coefficients[level.id];
          if (val && val.trim() !== "") {
            const ctrl = new AbortController();
            abortControllers.current.push(ctrl);
            await fetch("/api/coefficient", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                level_id: level.id,
                label: val,
                matter_id: matterId,
              }),
              signal: ctrl.signal,
            });
          }
        }
      }

      toast({
        title: "Succès",
        description: "Matière et coefficients créés avec succès !",
        color: "success",
      });

      onUpdate();
      setName("");
      setActive(1);
      setOpen(false);
      setCoefficients({});
      setLevelHasSeries({});
      setCoefficientsBySerie({});
    } catch (error) {
      if ((error as any)?.name === "AbortError") {
        toast({
          title: "Annulé",
          description: "Création annulée.",
          color: "warning",
        });
      } else {
        toast({
          title: "Erreur",
          description: `Une erreur est survenue: ${(error as Error).message}`,
          color: "destructive",
        });
      }
    } finally {
      setLoading(false);
      abortControllers.current = [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button color="indigodye" onClick={() => setOpen(true)}>
          Ajouter une matière
        </Button>
      </DialogTrigger>
      <DialogContent size="5xl" className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Ajouter une nouvelle matière
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="max-h-[350px] w-full">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la matière</Label>
                <Input
                  id="name"
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
            {/* Message si pas de niveaux ou séries */}
            {!isLevelsLoaded && (
              <div className="text-red-600 text-center py-4">
                Aucun niveau disponible. Veuillez d'abord créer des niveaux.
              </div>
            )}
            {isLevelsLoaded && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="font-semibold">
                    Définition des coefficients
                  </Label>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    (Facultatif)
                  </span>
                </div>
                <div className="mb-2 text-xs text-muted-foreground">
                  Vous pouvez définir les coefficients pour chaque niveau ou série. Laissez vide si non concerné.
                </div>
                <div className="overflow-x-auto rounded-lg border bg-background shadow-sm">
                  <Table className="min-w-[400px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Plusieurs séries ?</TableHead>
                        <TableHead>Coefficient(s)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {levels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell className="font-medium">{level.label}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={!!levelHasSeries[level.id]}
                              onCheckedChange={(checked) =>
                                handleLevelHasSeriesChange(level.id, !!checked)
                              }
                              disabled={!isSeriesLoaded}
                            />
                          </TableCell>
                          <TableCell>
                            {levelHasSeries[level.id] ? (
                              isSeriesLoaded ? (
                                <div className="flex flex-wrap gap-2">
                                  {series.map((serie) => (
                                    <div key={serie.id} className="flex items-center gap-1">
                                      <span className="text-xs">{serie.label}:</span>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={coefficientsBySerie[level.id]?.[serie.id] || ""}
                                        onChange={(e) =>
                                          handleSerieCoefficientChange(level.id, serie.id, e.target.value)
                                        }
                                        className="w-16"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Aucune série disponible</span>
                              )
                            ) : (
                              <Input
                                type="number"
                                min={0}
                                value={coefficients[level.id] || ""}
                                onChange={(e) =>
                                  handleCoefficientChange(level.id, e.target.value)
                                }
                                className="w-24"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-around gap-3">
            <DialogClose asChild>
              <Button color="destructive" variant="outline" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              color="indigodye"
              className="flex items-center justify-center shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter
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

// Points à surveiller :
/*
1. Si la table des coefficients est utilisée, il faut s'assurer que `levels` et `series` sont bien chargés dans le store avant d'afficher le formulaire.
2. Si `series` est vide, le mode "plusieurs séries" ne sert à rien pour ce niveau (aucun input ne sera affiché).
3. Si l'utilisateur coche "plusieurs séries" puis décoche, les valeurs précédemment saisies pour les séries sont supprimées (ce qui est logique).
4. Si la matière n'est pas créée correctement (pas d'id retourné), les requêtes de coefficients échoueront silencieusement.
5. Il n'y a pas de validation sur la saisie des coefficients (ex : nombre négatif ou vide accepté).
6. Les requêtes POST pour les coefficients ne sont pas parallélisées, mais ce n'est pas bloquant.
7. Si deux niveaux ont le même label de coefficient, cela ne pose pas de problème côté code, mais attention à la logique métier.
8. Si l'utilisateur ferme la modale pendant le chargement, il n'y a pas d'annulation des requêtes.
9. Si le backend retourne l'id de la matière dans un champ différent de `id` ou `data.id`, la création des coefficients échouera.
10. Si le backend refuse la création d'un coefficient (ex : doublon), il n'y a pas de gestion d'erreur spécifique pour chaque fetch de coefficient.
*/
