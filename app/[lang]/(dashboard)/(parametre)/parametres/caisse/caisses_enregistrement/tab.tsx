"use client";
import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CashRegister } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { fetchCashRegister } from "@/store/schoolservice";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const cashRegisterSchema = z.object({
  cash_register_number: z.string().trim().min(1, "Le numéro est requis"),
});

type CashRegisterFormValues = z.infer<typeof cashRegisterSchema>;

interface Props {
  data: CashRegister[];
}

export function CashRegisterTable({ data }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const router = useRouter();
  const { cashRegisters, setCashRegisters } = useSchoolStore();

  const itemsPerPage = 5;
  const filteredData = data.filter(item =>
    item.cash_register_number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formMethods = useForm<CashRegisterFormValues>({
    resolver: zodResolver(cashRegisterSchema),
    defaultValues: {
      cash_register_number: "",
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = formMethods;

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleCashRegisterOperation = async (
    method: "POST" | "PUT",
    formData: CashRegisterFormValues,
    id?: number
  ) => {
    try {
      const url = id 
        ? `/api/cashRegister?id=${id}`
        : "/api/cashRegister";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 400 
            ? "Données invalides" 
            : method === "POST"
              ? "Erreur lors de la création"
              : "Erreur lors de la mise à jour"
        );
      }

      const updatedCashRegisters = await fetchCashRegister();
      setCashRegisters(updatedCashRegisters);
      
      toast.success(
        method === "POST" 
          ? "Caisse créée avec succès" 
          : "Caisse mise à jour avec succès",
        {
          position: "top-right",
          duration: 3000,
        }
      );
      
      router.refresh();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite",
        {
          position: "top-right",
          duration: 5000,
        }
      );
      throw error;
    }
  };

  const onSubmit = async (formData: CashRegisterFormValues) => {
    setIsLoading(true);
    try {
      const success = editingId
        ? await handleCashRegisterOperation("PUT", formData, editingId)
        : await handleCashRegisterOperation("POST", formData);
      
      if (success) {
        setEditingId(null);
        reset();
        setIsModalOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cashRegister: CashRegister) => {
    setEditingId(cashRegister.id);
    setValue("cash_register_number", cashRegister.cash_register_number);
    setIsModalOpen(true);
  };

  const columns = [
    { key: "cash_register_number", label: "Numéro de caisse" },
    { key: "actions", label: "Actions" },
  ];

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
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold">Ajouter une caisse</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cash_register_number">Numéro de caisse *</Label>
              <Input
                id="cash_register_number"
                {...register("cash_register_number")}
                placeholder="Ex: CAISSE-001"
              />
              {errors.cash_register_number && (
                <p className="text-sm text-destructive">
                  {errors.cash_register_number.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="h-4 w-4 animate-spin mr-2"
                  />
                  Enregistrement...
                </>
              ) : (
                "Ajouter la caisse"
              )}
            </Button>
          </form>
          </Card>
        </Card>

        {/* Carte de la liste des caisses */}
        <Card className="lg:col-span-2 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Liste des caisses</h2>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <Input
                type="text"
                placeholder="Rechercher une caisse..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
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
                {filteredData.length > 0 ? (
                  <AnimatePresence>
                    {paginatedData.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-primary/5"
                      >
                        <TableCell className="font-medium">
                          {item.cash_register_number}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-4 w-4" />
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
                      {searchTerm ? (
                        "Aucune caisse ne correspond à votre recherche."
                      ) : (
                        "Aucune caisse enregistrée pour le moment."
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredData.length > itemsPerPage && (
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
              <Pencil className="h-5 w-5" />
              Modifier la caisse
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de la caisse
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="cash_register_number">Numéro de caisse *</Label>
              <Input
                id="cash_register_number"
                {...register("cash_register_number", {
                  required: "Le numéro est requis",
                })}
                placeholder="Ex: CAISSE-001"
                className={errors.cash_register_number ? "border-destructive" : ""}
              />
              {errors.cash_register_number && (
                <p className="text-sm text-destructive">
                  {errors.cash_register_number.message}
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

export default CashRegisterTable;