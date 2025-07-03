"use client"

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { verificationPermission } from "@/lib/fonction";
import { Period } from "@/lib/interface";
import { fetchPeriods } from "@/store/schoolservice";
import { Edit } from "lucide-react"; // Ajout de l'icône Edit

const PeriodsPage = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [typePeriodId, setTypePeriodId] = useState<number | undefined>(undefined);
  const [editPeriod, setEditPeriod] = useState<Period | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userOnline, typePeriods } = useSchoolStore();
  const router = useRouter();

  // Constantes pour la pagination
  const ITEMS_PER_PAGE = 5;

  // Filtrage et pagination des données
  const filteredData = periods.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Gestion de la pagination
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Récupération des périodes
  const fetchPeriodBegin = async () => {
    setIsLoading(true);
    const updatePeriods = await fetchPeriods();
    setPeriods(updatePeriods);
    setIsLoading(false);
  };

  // Création d'une période
  const createPeriod = async () => {
    if (!label.trim() || !typePeriodId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        color: "destructive",
      });
      return;
    }
    // Vérification unicité du label (case insensitive)
    if (periods.some(p => p.label.trim().toLowerCase() === label.trim().toLowerCase())) {
      toast({
        title: "Erreur",
        description: "Ce libellé de période existe déjà.",
        color: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/period`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), type_period_id: typePeriodId })
      });
      if (!response.ok) throw new Error("Erreur lors de la création de la période");
      await fetchPeriodBegin();
      toast({
        title: "Succès",
        description: "Période créée avec succès.",
        color: "success",
      });
      setIsDialogOpen(false);
      setLabel("");
      setTypePeriodId(undefined);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        color: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modification d'une période
  const updatePeriod = async () => {
    if (!label.trim() || !typePeriodId || !editPeriod) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        color: "destructive",
      });
      return;
    }
    // Vérification unicité du label (hors période éditée)
    if (periods.some(p => p.label.trim().toLowerCase() === label.trim().toLowerCase() && p.id !== editPeriod.id)) {
      toast({
        title: "Erreur",
        description: "Ce libellé de période existe déjà.",
        color: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/period/${editPeriod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), type_period_id: typePeriodId })
      });
      if (!response.ok) throw new Error("Erreur lors de la modification de la période");
      await fetchPeriodBegin();
      toast({
        title: "Succès",
        description: "Période modifiée avec succès.",
        color: "success",
      });
      setIsEditDialogOpen(false);
      setEditPeriod(null);
      setLabel("");
      setTypePeriodId(undefined);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        color: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effet initial pour charger les périodes
  useEffect(() => {
    fetchPeriodBegin();
  }, []);

  // Récupérer le label du type de période
  const getTypePeriodLabel = (type_period_id: number) => {
    const type = typePeriods.find(tp => tp.id === type_period_id);
    return type ? type.label : "-";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Périodes académiques</CardTitle>
            </div>
            <Badge variant="outline">
              {periods.length} {periods.length > 1 ? "périodes" : "période"}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <Input
                placeholder="Rechercher une période..."
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button 
              color='indigodye'
                onClick={() => {
                  setIsDialogOpen(true);
                  setLabel("");
                  setTypePeriodId(undefined);
                }}
                disabled={isLoading}
              >
                Ajouter une période
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length > 0 ? (
                  <AnimatePresence>
                    {paginatedData.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-primary/5 border-t border-muted-foreground/20"
                      >
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{getTypePeriodLabel(item.type_period_id)}</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            color="tyrian"
                            
                            onClick={() => {
                              setEditPeriod(item);
                              setLabel(item.label);
                              setTypePeriodId(item.type_period_id);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit size={18} />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground h-24"
                    >
                      {searchTerm
                        ? "Aucune période ne correspond à votre recherche."
                        : "Aucune période enregistrée."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {filteredData.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePreviousPage}
                        aria-disabled={currentPage === 1}
                        className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <Button
                          variant={currentPage === i + 1 ? "outline" : "ghost"}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextPage}
                        aria-disabled={currentPage === totalPages}
                        className={
                          currentPage === totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Création */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une période</DialogTitle>
            <DialogDescription>
              Remplissez les informations de la période.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Libellé de la période"
              value={label}
              onChange={e => setLabel(e.target.value)}
              disabled={isLoading}
            />
            <Select
              value={typePeriodId ? String(typePeriodId) : ""}
              onValueChange={(value: string) => setTypePeriodId(Number(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de période" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {typePeriods.map(tp => (
                  <SelectItem key={tp.id} value={String(tp.id)}>
                    {tp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <div className="flex justify-around gap-2 w-full">
              <Button
                color="destructive"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                color="indigodye"
                onClick={createPeriod}
                disabled={isLoading}
              >
                {isLoading ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la période</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la période.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Libellé de la période"
              value={label}
              onChange={e => setLabel(e.target.value)}
              disabled={isLoading}
            />
            <Select
              value={typePeriodId ? String(typePeriodId) : ""}
              onValueChange={(value: string) => setTypePeriodId(Number(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de période" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {typePeriods.map(tp => (
                  <SelectItem key={tp.id} value={String(tp.id)}>
                    {tp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <div className="flex justify-around gap-2 w-full">
              <Button
                color="destructive"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                color="tyrian"
                onClick={updatePeriod}
                disabled={isLoading}
              >
                {isLoading ? "Modification..." : "Modifier"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PeriodsPage;