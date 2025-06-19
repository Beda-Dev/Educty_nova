"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import EditEvaluationTypeModal from "./modal-mod";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { verificationPermission } from "@/lib/fonction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import DialogForm from "./modal_form";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { TypeEvaluation } from "@/lib/interface";
import { fetchTypeEvaluations } from "@/store/schoolservice";

function EvaluationTypeTable() {
  const [selectedType, setSelectedType] = useState<TypeEvaluation | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<TypeEvaluation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { userOnline, typeEvaluations, setTypeEvaluations } = useSchoolStore();
  const [evaluationTypes, setEvaluationTypes] =
    useState<TypeEvaluation[]>(typeEvaluations);
  const router = useRouter();

  const permissionRequisVoir = ["voir types évaluation"];
  const permissionRequisModifier = ["modifier types évaluation"];
  const permissionRequisCreer = ["creer types évaluation"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
  );

  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
  );

  const handleEditClick = (type: TypeEvaluation) => {
    setSelectedType(type);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (type: TypeEvaluation) => {
    setTypeToDelete(type);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

const handleDelete = async () => {
  if (!typeToDelete) return;
  setIsDeleting(true);
  setDeleteError(null);

  try {
    const response = await fetch(`/api/typeEvaluation?id=${typeToDelete.id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.data?.message || "Échec de la suppression");



    toast({ description: "Type supprimé avec succès." });

    // Recharge à jour
    const types = await fetchTypeEvaluations();
    setTypeEvaluations(types);
    setEvaluationTypes(types);

    setIsDeleteOpen(false);
  } catch (error) {
    console.error("Erreur DELETE :", error);
    setDeleteError("Impossible de supprimer ce type.");
    toast({
      description: error instanceof Error ? error.message : String(error),
      color: "destructive",
    });
  } finally {
    setIsDeleting(false);
  }
};


const onUpdate = async () => {
  try {
    const types = await fetchTypeEvaluations();
    setTypeEvaluations(types); // met à jour le store global
    setEvaluationTypes(types); // met à jour l'état local du tableau
    router.refresh(); // rafraîchit la page pour refléter les changements
  } catch (error) {
    console.error("Erreur lors du chargement des types :", error);
    toast({
      description: "Échec du chargement des types d'évaluation.",
      color: "destructive",
    });
  }
};

  const onClose = () => {
    setIsEditOpen(false);
  };

  // Configuration de la pagination
  const ITEMS_PER_PAGE = 10;
  const filteredData = evaluationTypes.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
              <CardTitle>Types d'évaluation</CardTitle>
            </div>
            <Badge variant="outline">
              {filteredData.length} {filteredData.length > 1 ? "types d'évaluation " : "type d'évaluation"}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <Input
                placeholder="Rechercher un type..."
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {true ? (
                <div className="flex flex-wrap items-center gap-4 mb-1">
                  <div className="flex-none">
                    <DialogForm onUpdate={onUpdate} />
                  </div>
                </div>
              ) : null}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type d'évaluation</TableHead>
                  {true && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
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
                        <TableCell className="capitalize">
                          {item.label}
                        </TableCell>
                        {true && (
                          <TableCell className="flex justify-end gap-2">
                            <Button
                              color="tyrian"
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              color="destructive"
                              size="icon"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Icon
                                icon="mdi:trash-can-outline"
                                className="h-4 w-4"
                              />
                            </Button>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground h-24"
                    >
                      {searchTerm
                        ? "Aucun type ne correspond à votre recherche."
                        : "Aucun type d'évaluation enregistré."}
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
                        onClick={
                          currentPage === 1 ? undefined : handlePreviousPage
                        }
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : 0}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
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
                        onClick={
                          currentPage === totalPages
                            ? undefined
                            : handleNextPage
                        }
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : 0}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50 text-muted-foreground"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {typeToDelete && (
              <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirmer la suppression
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer le type "
                      {typeToDelete.label}" ?
                      <br />
                      Cette action est irréversible.
                      {deleteError && (
                        <div className="mt-4 text-red-500 text-sm">
                          {deleteError}
                        </div>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      variant="outline"
                      color="destructive"
                      onClick={() => {
                        setIsDeleteOpen(false);
                        setDeleteError(null);
                      }}
                      disabled={isDeleting}
                    >
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      color="destructive"
                    >
                      {isDeleting ? (
                        <>
                          <Icon
                            icon="mdi:loading"
                            className="animate-spin h-4 w-4 mr-2"
                          />
                          Suppression...
                        </>
                      ) : (
                        "Confirmer la suppression"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {selectedType && isEditOpen && (
        <EditEvaluationTypeModal
          typeData={selectedType}
          onClose={onClose}
          onUpdate={onUpdate}
          onOpen={isEditOpen}
        />
      )}
    </>
  );
}

export default EvaluationTypeTable;
