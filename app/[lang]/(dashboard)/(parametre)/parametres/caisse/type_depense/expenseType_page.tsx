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
import { Card } from "@/components/ui/card";
import InputFormValidation from "./input_form";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSchoolStore } from "@/store";
import { fetchExpenseType } from "@/store/schoolservice";
import { Badge } from "@/components/ui/badge";
import { ExpenseType } from "@/lib/interface";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data: ExpenseType[];
}

const ExpenseTypePage = ({ data }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { expenseTypes, setExpenseTypes } = useSchoolStore();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });

  const activeExpenses = data.filter(
  (item) =>
    item.active === 1 &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

  const totalPages = Math.ceil(activeExpenses.length / itemsPerPage);
  const paginatedExpenses = activeExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (expense: ExpenseType) => {
    setSelectedExpense(expense);
    reset({ name: expense.name });
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData: { name: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/expenseType?id=${selectedExpense?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Échec de la mise à jour");
      }

      toast.success("Type de dépense mis à jour avec succès");
      const updatedExpenses: ExpenseType[] = await fetchExpenseType();
      setExpenseTypes(updatedExpenses);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: "name", label: "Nom" },
    { key: "actions", label: "Actions" },
  ];

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Carte du formulaire d'ajout */}
        <Card className="lg:col-span-1 p-6 shadow-sm border-0 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-6">

            <h2 className="text-lg font-semibold">
              Ajouter un type de dépense
            </h2>
          </div>
          <InputFormValidation
            onSuccess={() => fetchExpenseType().then(setExpenseTypes)}
          />
        </Card>

        {/* Carte de la liste des types de dépenses */}
        <Card className="lg:col-span-2 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">

              <h2 className="text-lg font-semibold">Types de dépenses</h2>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <Input
                type="text"
                placeholder="Rechercher un type de dépense..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Revenir à la première page à chaque recherche
                }}
                className="max-w-sm"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className="font-medium">
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeExpenses.length > 0 ? (
                  <AnimatePresence>
                    {paginatedExpenses.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-primary/5"
                      >
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Icon icon="heroicons:pencil" className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun type de dépense actif trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {activeExpenses.length > itemsPerPage && (
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
                          variant={currentPage === page ? "soft" : "ghost"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 3 && currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationEllipsis />
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
        </Card>
      </motion.div>

      {/* Modale de modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="heroicons:pencil" className="h-5 w-5" />
              Modifier le type de dépense
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de "{selectedExpense?.name}"
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleUpdate)}
            className="space-y-4 mt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Le nom est requis",
                  minLength: {
                    value: 2,
                    message: "Le nom doit contenir au moins 2 caractères",
                  },
                })}
                placeholder="Ex: Fournitures de bureau"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Icon
                      icon="heroicons:arrow-path"
                      className="h-4 w-4 animate-spin mr-2"
                    />
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
    </div>
  );
};

export default ExpenseTypePage;
