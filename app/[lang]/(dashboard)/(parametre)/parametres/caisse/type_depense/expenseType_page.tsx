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
} from "@/components/ui/pagination";
import ExpenseTypeForm from "./input_form";
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

interface Props {
  data: ExpenseType[];
}

const ExpenseTypePage = ({ data }: Props) => {
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { expenseTypes, setExpenseTypes } = useSchoolStore();

  const ITEMS_PER_PAGE = 5;
  const activeExpenses = data.filter(
    (item) =>
      item.active === 1 &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(activeExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = activeExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const handleEdit = (expense: ExpenseType) => {
    setSelectedExpense(expense);
    reset({ name: expense.name });
    setIsModalOpenEdit(true);
  };

  const handleUpdate = async (formData: { name: string }) => {
    setIsSubmitting(true);
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
      setIsModalOpenEdit(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/expenseType?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.data?.message || "Échec de la suppression");

      const updatedExpenses = await fetchExpenseType();
      setExpenseTypes(updatedExpenses);

      toast.success("Type de dépense supprimé avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : String(error),
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
    { key: "name", label: "Nom" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="w-full">
      {/* Modal for adding new expense type */}
<Dialog open={isModalOpenAdd} onOpenChange={setIsModalOpenAdd}>
  <DialogContent>
    <ExpenseTypeForm 
      onSuccess={() => {
        setIsModalOpenAdd(false);
        fetchExpenseType().then(setExpenseTypes);
      }}  
      onClose={() => setIsModalOpenAdd(false)} 
    />
  </DialogContent>
</Dialog>

      {/* Modal for editing expense type */}
      <Dialog open={isModalOpenEdit} onOpenChange={setIsModalOpenEdit}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Modifier le type de dépense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Nom *
              </label>
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
                type="submit"
                color="tyrian"
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
              <CardTitle>Types de dépenses</CardTitle>
            </div>
            <Badge variant="outline">
              {activeExpenses.length} {activeExpenses.length > 1 ? "types de dépenses" : "type de dépense"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                <Input
                  placeholder="Rechercher un type de dépense..."
                  className="w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <Button
              color="indigodye"
                onClick={() => setIsModalOpenAdd(true)}
                className="w-full md:w-auto"
              >
                
                Ajouter un type
              </Button>
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
                {activeExpenses.length > 0 ? (
                  <AnimatePresence>
                    {paginatedExpenses.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-primary/5 border-t border-muted-foreground/20 "
                      >
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              color="tyrian"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

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
                                  <AlertDialogDescription >
                                    Cette action supprimera définitivement le type "{item.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel  color="destructive" variant="outline" >Annuler</AlertDialogCancel>
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
                          </div>
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
                      {searchTerm
                        ? "Aucun type de dépense ne correspond à votre recherche."
                        : "Aucun type de dépense enregistré."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {activeExpenses.length > ITEMS_PER_PAGE && (
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

export default ExpenseTypePage;