"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
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

interface CoefficientState {
  value: string;
  id?: number;
  changed?: boolean;
}

const EditMatterModal = ({ matterData, onClose, onUpdate, onOpen }: EditMatterModalProps) => {
  const [name, setName] = useState<string>(matterData.name);
  const [active, setActive] = useState<number>(matterData.active);
  const [loading, setLoading] = useState<boolean>(false);

  // États pour les coefficients
  const [coefficients, setCoefficients] = useState<Record<number, CoefficientState>>({});
  const [coefficientsBySerie, setCoefficientsBySerie] = useState<Record<number, Record<number, CoefficientState>>>({});
  const [seriesByLevel, setSeriesByLevel] = useState<Record<number, any[]>>({});
  const [loadingCoeffs, setLoadingCoeffs] = useState(false);

  // Récupération des données depuis le store
  const { levels: storeLevels, series: storeSeries, coefficients: storeCoefficients } = useSchoolStore();

  useEffect(() => {
    setName(matterData.name);
    setActive(matterData.active);
  }, [matterData]);

  // Chargement des données initiales
  useEffect(() => {
    if (!onOpen) return;

    async function loadCoefficients() {
      setLoadingCoeffs(true);
      try {
        // Préparer les séries par niveau
        const seriesByLevelData: Record<number, any[]> = {};
        const levelsWithSeries = new Set<number>();

        // Filtrer les coefficients pour cette matière
        const matterCoefficients = storeCoefficients.filter(c => c.matter_id === matterData.id);

        // Initialiser les coefficients par défaut
        const defaultCoeffs: Record<number, CoefficientState> = {};
        const defaultCoeffsBySerie: Record<number, Record<number, CoefficientState>> = {};

        // Traiter d'abord les coefficients sans série
        matterCoefficients
          .filter(c => !c.serie_id)
          .forEach(coeff => {
            defaultCoeffs[coeff.level_id] = {
              value: coeff.label.toString(),
              id: coeff.id,
              changed: false
            };
          });

        // Traiter ensuite les coefficients avec série
        matterCoefficients
          .filter((c): c is typeof c & { serie_id: number } => Boolean(c.serie_id))
          .forEach(coeff => {
            levelsWithSeries.add(coeff.level_id);
            if (!defaultCoeffsBySerie[coeff.level_id]) {
              defaultCoeffsBySerie[coeff.level_id] = {};
            }
            defaultCoeffsBySerie[coeff.level_id][coeff.serie_id] = {
              value: coeff.label.toString(),
              id: coeff.id,
              changed: false
            };
          });

        // Préparer les séries disponibles par niveau
        storeLevels.forEach(level => {
          const levelSeries = storeSeries.filter(serie => 
            matterCoefficients.some(c => 
              c.level_id === level.id && c.serie_id === serie.id
            )
          );
          seriesByLevelData[level.id] = levelSeries;
        });

        setCoefficients(defaultCoeffs);
        setCoefficientsBySerie(defaultCoeffsBySerie);
        setSeriesByLevel(seriesByLevelData);
      } catch (error) {
        console.error("Erreur lors du chargement des coefficients:", error);
        toast.error("Erreur lors du chargement des coefficients");
      } finally {
        setLoadingCoeffs(false);
      }
    }

    loadCoefficients();
  }, [onOpen, matterData.id, storeLevels, storeSeries, storeCoefficients]);

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

    try {
      // 1. Mettre à jour la matière
      const matterResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/matter/${matterData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, active , coefficient:0}),
      });
      if (!matterResponse.ok) throw new Error("Erreur lors de la mise à jour de la matière.");

      // 2. Préparer les requêtes pour les coefficients
      const updateRequests: Promise<any>[] = [];

      // Coefficients sans série (niveau seul)
      Object.entries(coefficients).forEach(([levelId, { value, id, changed }]) => {
        if (changed && value.trim() !== "") {
          const url = id 
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coefficient/${id}`
            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coefficient`;
            
          updateRequests.push(
            fetch(url, {
              method: id ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                matter_id: matterData.id,
                level_id: Number(levelId),
                label: value,
              }),
            })
          );
        }
      });

      // Coefficients avec série
      Object.entries(coefficientsBySerie).forEach(([levelId, seriesObj]) => {
        Object.entries(seriesObj).forEach(([serieId, { value, id, changed }]) => {
          if (changed && value.trim() !== "") {
            const url = id 
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coefficient/${id}`
              : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coefficient`;
              
            updateRequests.push(
              fetch(url, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  matter_id: matterData.id,
                  level_id: Number(levelId),
                  serie_id: Number(serieId),
                  label: value,
                }),
              })
            );
          }
        });
      });

      // Exécuter toutes les requêtes
      await Promise.all(updateRequests);

      toast.dismiss();
      toast.success("Matière et coefficients mis à jour avec succès !");
      onUpdate();
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error(`Une erreur est survenue. ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCoefficientChange = (levelId: number, value: string) => {
    setCoefficients(prev => ({
      ...prev,
      [levelId]: {
        ...(prev[levelId] || { value: "", id: undefined }),
        value,
        changed: true
      }
    }));
  };

  const handleSerieCoefficientChange = (levelId: number, serieId: number, value: string) => {
    setCoefficientsBySerie(prev => ({
      ...prev,
      [levelId]: {
        ...(prev[levelId] || {}),
        [serieId]: {
          ...((prev[levelId] || {})[serieId] || { value: "", id: undefined }),
          value,
          changed: true
        }
      }
    }));
  };

  const hasSeriesForLevel = (levelId: number): boolean => {
    return !!coefficientsBySerie[levelId] && Object.keys(coefficientsBySerie[levelId]).length > 0;
  };

  return (
    <Dialog open={onOpen} onOpenChange={onClose}>
      <DialogContent size="full" className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            Modifier la matière
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="w-full">
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

            {/* Tableau des coefficients */}
            {loadingCoeffs ? (
              <div className="text-center py-8 text-gray-500">Chargement des coefficients...</div>
            ) : storeLevels.length === 0 ? (
              <div className="text-center py-8 text-red-500">Aucun niveau disponible.</div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="font-semibold">Coefficients par niveau</Label>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    (Seules les modifications seront enregistrées)
                  </span>
                </div>
                <div className="overflow-x-auto rounded-lg border bg-background shadow-sm">
                  <Table className="min-w-[400px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Coefficient(s)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storeLevels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell className="font-medium">{level.label}</TableCell>
                          <TableCell>
                            {hasSeriesForLevel(level.id) ? "Par série" : "Unique"}
                          </TableCell>
                          <TableCell>
                            {hasSeriesForLevel(level.id) ? (
                              seriesByLevel[level.id]?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {seriesByLevel[level.id].map((serie) => (
                                    <div key={serie.id} className="flex items-center gap-1">
                                      <span className="text-xs">{serie.label}:</span>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={coefficientsBySerie[level.id]?.[serie.id]?.value || ""}
                                        onChange={(e) => handleSerieCoefficientChange(level.id, serie.id, e.target.value)}
                                        className="w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder={coefficientsBySerie[level.id]?.[serie.id]?.value || "0"}
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Aucune série définie</span>
                              )
                            ) : (
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={coefficients[level.id]?.value || ""}
                                onChange={(e) => handleCoefficientChange(level.id, e.target.value)}
                                className="w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder={coefficients[level.id]?.value || "0"}
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