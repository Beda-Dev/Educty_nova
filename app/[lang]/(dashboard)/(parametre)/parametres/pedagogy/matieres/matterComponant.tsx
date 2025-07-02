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
import { Matter } from "@/lib/interface";
import { Icon } from "@iconify/react";
import EditMatterModal from "./modal-mod";
import { fetchMatters, fetchCoefficient } from "@/store/schoolservice";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
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

function MatterTable() {
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [matterToDelete, setMatterToDelete] = useState<Matter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { setMatters, userOnline, matters, setCoefficients } = useSchoolStore();
  const [updata, setUpdata] = useState<Matter[]>(matters);
  const router = useRouter();

  const permissionRequisVoir = ["voir matière"];
  const permissionRequisModifier = ["modifier matière"];
  const permissionRequisCreer = ["creer matière"];

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

  const handleEditClick = (matter: Matter) => {
    setSelectedMatter(matter);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (matter: Matter) => {
    setMatterToDelete(matter);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!matterToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/matter?id=${matterToDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.data?.message || "Erreur lors de la suppression");
      }

      toast({
        description: "Matière supprimée avec succès !",
        color: "success",
      });
      await onUpdate();
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast({
        description: error instanceof Error ? error.message : String(error),
        color: "destructive",
      });

      // Gestion des erreurs spécifiques

      setDeleteError(
        "Cette matière est probablement déjà assignée à un emploi du temps ou à des notes et ne peut pas être supprimée."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const onUpdate = async () => {
    const [updatedMatters, updatedCoefficients] = await Promise.all([
      fetchMatters(),
      fetchCoefficient(),
    ]);
    if (updatedMatters) {
      setMatters(updatedMatters);
      setUpdata(updatedMatters);
      router.refresh();
    }
    if (updatedCoefficients) {
      setCoefficients(updatedCoefficients);
    }
  };

  const onClose = () => {
    setIsEditOpen(false);
  };

  // if (hasAdminAccessVoir === false) {
  //   router.push("/dashboard");
  // }

  // etat pour la pagination
  const ITEMS_PER_PAGE = 10;

  const filteredData = updata.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <CardTitle>Matières</CardTitle>
            </div>
            <Badge variant="outline">
              {filteredData.length}{" "}
              {filteredData.length > 1 ? "matières" : "matière"}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <Input
                placeholder="Rechercher une matière..."
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
                  <TableHead>Matière</TableHead>  
                  <TableHead>Statut</TableHead>
                  {true && <TableHead>Action</TableHead>}
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
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.active === 1 ? (
                            <Badge color="success">Active</Badge>
                          ) : (
                            <Badge color="destructive">Inactive</Badge>
                          )}
                        </TableCell>
                        {true && (
                          <TableCell className="flex justify-end gap-2">
                            <Button
                              color="tyrian"
                              size="icon"
                              onClick={() => handleEditClick(item)}
                            >
                              <Pencil className="h-4 w-4" />
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
                      colSpan={4}
                      className="text-center text-muted-foreground h-24"
                    >
                      {searchTerm
                        ? "Aucune matière ne correspond à votre recherche."
                        : "Aucune matière enregistrée."}
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

            {matterToDelete && (
              <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirmer la suppression
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer la matière "
                      {matterToDelete.name}" ?
                      <br />
                      Cette action est irréversible.
                      {deleteError && (
                        <div className="mt-4 text-red-500 text-sm">
                          {deleteError}
                          <br />
                          Vous pouvez désactiver la matière plutôt que de la
                          supprimer.
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
                      color="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
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

      {selectedMatter && isEditOpen && (
        <EditMatterModal
          matterData={selectedMatter}
          onClose={onClose}
          onUpdate={onUpdate}
          onOpen={isEditOpen}
        />
      )}
    </>
  );
}

export default MatterTable;
