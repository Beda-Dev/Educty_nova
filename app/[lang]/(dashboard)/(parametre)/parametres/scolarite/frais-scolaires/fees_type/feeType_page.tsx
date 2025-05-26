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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Trash, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSchoolStore } from "@/store";
import { fetchFeeType } from "@/store/schoolservice";
import { Badge } from "@/components/ui/badge";
import { FeeType } from "@/lib/interface";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import InputFormValidation from "./input_form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

interface Props {
  data: FeeType[];
}

const FeesTypePage = ({ data }: Props) => {
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { setFeeTypes, userOnline } = useSchoolStore();

  const ITEMS_PER_PAGE = 5;
  const activeFeeTypes = data.filter(
    (item) =>
      item.active === 1 &&
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(activeFeeTypes.length / ITEMS_PER_PAGE);
  const paginatedFeeTypes = activeFeeTypes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ label: string }>({
    defaultValues: {
      label: "",
    },
  });

  const permissionRequisVoir = ["voir frais_Scolaires"];
  const permissionRequisModifier = ["modifier frais_Scolaires"];
  const permissionRequisCreer = ["creer frais_Scolaires"];
  const permissionRequisSupprimer = ["supprimer frais_Scolaires"];

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

  const hasAdminAccessSupprimer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisSupprimer
  );

  const handleEdit = (feeType: FeeType) => {
    setSelectedFeeType(feeType);
    reset({ label: feeType.label });
    setIsModalOpenEdit(true);
  };

  const handleUpdate = async (formData: { label: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feeType?id=${selectedFeeType?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour");
      }

      toast.success("Type de frais mis à jour avec succès");
      const updatedFeeTypes = await fetchFeeType();
      setFeeTypes(updatedFeeTypes);
      setIsModalOpenEdit(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/feeType?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Échec de la suppression");

      const updatedFeeTypes = await fetchFeeType();
      setFeeTypes(updatedFeeTypes);

      toast.success("Type de frais supprimé avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const columns = [
    { key: "label", label: "Type de frais" },
    ...(hasAdminAccessModifier ? [{ key: "actions", label: "Actions" }] : []),
  ];

  if (hasAdminAccessVoir === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Modal for adding new fee type */}
      <Dialog open={isModalOpenAdd} onOpenChange={setIsModalOpenAdd}>
        <DialogContent>
          <InputFormValidation
            onSuccess={() => {
              setIsModalOpenAdd(false);
              fetchFeeType().then(setFeeTypes);
            }}
            onClose={() => setIsModalOpenAdd(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal for editing fee type */}
      <Dialog open={isModalOpenEdit} onOpenChange={setIsModalOpenEdit}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Modifier le type de frais
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="label" className="text-sm font-medium leading-none">
                Nom 
              </label>
              <Input
                id="label"
                {...register("label", {
                  required: "Le nom est requis",
                  minLength: {
                    value: 2,
                    message: "Le nom doit contenir au moins 2 caractères",
                  },
                })}
                placeholder="Ex: Frais de scolarité"
                className={errors.label ? "border-destructive" : ""}
              />
              {errors.label && (
                <p className="text-sm text-destructive">
                  {errors.label.message}
                </p>
              )}
            </div>

            <div className="flex justify-around gap-3 pt-4">
              <Button
                color="destructive"
                type="button"
                onClick={() => setIsModalOpenEdit(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                color="tyrian"
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              <CardTitle>Types de Frais</CardTitle>
            </div>
            <Badge variant="outline">
              {activeFeeTypes.length} {activeFeeTypes.length > 1 ? "types de frais" : "type de frais"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                <Input
                  placeholder="Rechercher un type de frais..."
                  className="w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {hasAdminAccessCreer && (
                <Button
                  color="indigodye"
                  onClick={() => setIsModalOpenAdd(true)}
                  className="w-full md:w-auto"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter un type
                </Button>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeFeeTypes.length > 0 ? (
                  <AnimatePresence>
                    {paginatedFeeTypes.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-primary/5 border-t border-muted-foreground/20"
                      >
                        <TableCell className="font-medium">
                          {item.label}
                        </TableCell>
                        {hasAdminAccessModifier && (
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
                                color="tyrian"
                                size="icon"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {hasAdminAccessSupprimer && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      color="destructive"
                                      size="icon"
                                      disabled={isSubmitting}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Êtes-vous sûr ?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action supprimera définitivement le type "{item.label}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel variant="outline">
                                        Annuler
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(item.id.toString())}
                                        className="bg-destructive hover:bg-destructive/90"
                                        disabled={isSubmitting}
                                      >
                                        {isSubmitting ? (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                          "Supprimer"
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? "Aucun type de frais ne correspond à votre recherche."
                        : "Aucun type de frais enregistré."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {activeFeeTypes.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      {currentPage === 1 ? (
                        <PaginationPrevious className="cursor-not-allowed opacity-50" />
                      ) : (
                        <PaginationPrevious onClick={handlePreviousPage} />
                      )}
                    </PaginationItem>

                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <Button
                            variant={currentPage === page ? "outline" : "ghost"}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 3 && currentPage < totalPages - 1 && (
                      <PaginationItem>
                        <span className="px-2 text-muted-foreground">…</span>
                      </PaginationItem>
                    )}

                    {totalPages > 3 && currentPage < totalPages && (
                      <PaginationItem>
                        <Button
                          variant={
                            currentPage === totalPages ? "outline" : "ghost"
                          }
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      {currentPage === totalPages ? (
                        <PaginationNext className="cursor-not-allowed opacity-50" />
                      ) : (
                        <PaginationNext onClick={handleNextPage} />
                      )}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FeesTypePage;