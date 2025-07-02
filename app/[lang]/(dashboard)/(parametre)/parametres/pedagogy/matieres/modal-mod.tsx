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

const EditMatterModal = ({ matterData, onClose, onUpdate, onOpen }: EditMatterModalProps) => {
  const [name, setName] = useState<string>(matterData.name);
  const [active, setActive] = useState<number>(matterData.active);
  const [loading, setLoading] = useState<boolean>(false);

  // Ajout état pour les coefficients (avec id)
  const [coefficients, setCoefficients] = useState<Record<number, { value: string, id?: number }>>({});
  const [levelHasSeries, setLevelHasSeries] = useState<Record<number, boolean>>({});
  const [coefficientsBySerie, setCoefficientsBySerie] = useState<Record<number, Record<number, { value: string, id?: number }>>>({});
  const [series, setSeries] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loadingCoeffs, setLoadingCoeffs] = useState(false);

  useEffect(() => {
    setName(matterData.name);
    setActive(matterData.active);
  }, [matterData]);

  // Charger niveaux, séries et coefficients existants
  useEffect(() => {
    async function fetchData() {
      setLoadingCoeffs(true);
      try {
        const [levelsRes, seriesRes, coeffsRes] = await Promise.all([
          fetch("/api/level"),
          fetch("/api/serie"),
          fetch(`/api/coefficient?matter_id=${matterData.id}`),
        ]);
        const levelsData = await levelsRes.json();
        const seriesData = await seriesRes.json();
        const coeffsData = await coeffsRes.json();
        setLevels(levelsData);
        setSeries(seriesData);
        // Pré-remplir les états avec id
        const coeffs: Record<number, { value: string, id?: number }> = {};
        const bySerie: Record<number, Record<number, { value: string, id?: number }>> = {};
        const hasSeries: Record<number, boolean> = {};
        for (const coeff of coeffsData) {
          if (coeff.serie_id) {
            hasSeries[coeff.level_id] = true;
            if (!bySerie[coeff.level_id]) bySerie[coeff.level_id] = {};
            bySerie[coeff.level_id][coeff.serie_id] = { value: coeff.label, id: coeff.id };
          } else {
            coeffs[coeff.level_id] = { value: coeff.label, id: coeff.id };
          }
        }
        setCoefficients(coeffs);
        setCoefficientsBySerie(bySerie);
        setLevelHasSeries(hasSeries);
      } catch (e) {
        // ignore
      } finally {
        setLoadingCoeffs(false);
      }
    }
    if (onOpen) fetchData();
  }, [onOpen, matterData.id]);

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
    const updatedMatter: MatterToUpdate = { name, active };
    try {
      // 1. Mettre à jour la matière
      const response = await fetch(`/api/matter?id=${matterData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMatter),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour de la matière.");
      // 2. Mettre à jour les coefficients (niveaux sans série)
      const coeffPromises = Object.entries(coefficients).map(async ([levelId, { value, id }]) => {
        if (value && value.trim() !== "") {
          const url = id ? `/api/coefficient?id=${id}` : "/api/coefficient";
          const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              matter_id: matterData.id,
              level_id: Number(levelId),
              label: value,
            }),
          });
          if (!res.ok) throw new Error("Erreur lors de la mise à jour d'un coefficient.");
        }
      });
      // 3. Mettre à jour les coefficients par série
      const coeffSeriePromises = Object.entries(coefficientsBySerie).flatMap(([levelId, seriesObj]) =>
        Object.entries(seriesObj).map(async ([serieId, { value, id }]) => {
          if (value && value.trim() !== "") {
            const url = id ? `/api/coefficient?id=${id}` : "/api/coefficient";
            const res = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                matter_id: matterData.id,
                level_id: Number(levelId),
                serie_id: Number(serieId),
                label: value,
              }),
            });
            if (!res.ok) throw new Error("Erreur lors de la mise à jour d'un coefficient de série.");
          }
        })
      );
      await Promise.all([...coeffPromises, ...coeffSeriePromises]);
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
    setCoefficients((prev) => ({ ...prev, [levelId]: { ...prev[levelId], value } }));
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
  const handleSerieCoefficientChange = (levelId: number, serieId: number, value: string) => {
    setCoefficientsBySerie((prev) => ({
      ...prev,
      [levelId]: {
        ...(prev[levelId] || {}),
        [serieId]: { ...((prev[levelId] || {})[serieId]), value },
      },
    }));
  };

  return (
    <Dialog open={onOpen} onOpenChange={onClose}>
      <DialogContent size="5xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-default-700">
            Modifier la matière
          </DialogTitle>
        </DialogHeader>
        <div>
          <ScrollArea className="max-h-[70vh]">
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
            {/* Tableau des coefficients (modification) */}
            {loadingCoeffs ? (
              <div className="text-center py-8 text-gray-500">Chargement des niveaux et coefficients...</div>
            ) : levels.length === 0 ? (
              <div className="text-center py-8 text-red-500">Aucun niveau disponible.</div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="font-semibold">Modifier les coefficients</Label>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">(Enreg. lors de la mise à jour)</span>
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
                              onCheckedChange={(checked) => handleLevelHasSeriesChange(level.id, !!checked)}
                              disabled={series.length === 0}
                            />
                          </TableCell>
                          <TableCell>
                            {levelHasSeries[level.id] ? (
                              series.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {series.map((serie) => (
                                    <div key={serie.id} className="flex items-center gap-1">
                                      <span className="text-xs">{serie.label}:</span>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={coefficientsBySerie[level.id]?.[serie.id]?.value || ""}
                                        onChange={(e) => handleSerieCoefficientChange(level.id, serie.id, e.target.value)}
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
                                value={coefficients[level.id]?.value || ""}
                                onChange={(e) => handleCoefficientChange(level.id, e.target.value)}
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