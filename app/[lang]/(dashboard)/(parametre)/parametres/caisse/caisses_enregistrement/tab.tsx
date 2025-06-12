"use client";
import * as React from "react";
import { Pencil, PlusCircle, Trash, Loader2, Edit } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CashRegister } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { fetchCashRegister } from "@/store/schoolservice";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import CashRegisterForm from "./cash-register-form";
import EditCashRegisterForm from "./edit-cash-register-form";
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
  data: CashRegister[];
}

export default function CashRegisterTable({ data }: Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isModalOpenAdd, setIsModalOpenAdd] = React.useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCashRegister, setSelectedCashRegister] = React.useState<CashRegister | null>(null);
  const router = useRouter();
  const { cashRegisters, setCashRegisters } = useSchoolStore();

  const ITEMS_PER_PAGE = 5;
  const filteredData = data.filter(item =>
    item.cash_register_number.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/cashRegister?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.data?.message || "Erreur lors de la suppression");

      const updatedCashRegisters = await fetchCashRegister();
      setCashRegisters(updatedCashRegisters);

      toast.success("Caisse supprimée avec succès");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
    setIsModalOpenEdit(true);
  };

  const columns = [
    { key: "cash_register_number", label: "Numéro de caisse" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="w-full">
      {/* Modal for adding new cash register */}
      <Dialog open={isModalOpenAdd} onOpenChange={setIsModalOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une caisse</DialogTitle>
          </DialogHeader>
          <CashRegisterForm onSuccess={() => setIsModalOpenAdd(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal for editing cash register */}
      <Dialog open={isModalOpenEdit} onOpenChange={setIsModalOpenEdit}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Modifier la caisse
            </DialogTitle>
          </DialogHeader>
          {selectedCashRegister && (
            <EditCashRegisterForm 
              cashRegister={selectedCashRegister} 
              onSuccess={() => setIsModalOpenEdit(false)}
            />
          )}
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

              <CardTitle>Caisses enregistrées</CardTitle>
            </div>
            <Badge variant="outline">
              {cashRegisters.length} {cashRegisters.length > 1 ? "caisses" : "caisse"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              {/* Filters on left */}
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                <Input
                  placeholder="Rechercher..."
                  className="w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Button on right */}
              <Button
                color="indigodye"
                onClick={() => setIsModalOpenAdd(true)}
                className="w-full md:w-auto"
              >
                
                Ajouter une caisse
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
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              color="tyrian"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
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
                                  <AlertDialogDescription>
                                    Cette action supprimera définitivement la caisse "{item.cash_register_number}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
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
                        ? "Aucune caisse ne correspond à votre recherche."
                        : "Aucune caisse enregistrée."}
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
                      {currentPage === 1 ? (
                        <PaginationPrevious className="cursor-not-allowed opacity-50" />
                      ) : (
                        <PaginationPrevious onClick={handlePreviousPage} />
                      )}
                    </PaginationItem>

                    {/* Affichage de max 3 pages */}
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

                    {/* Ellipsis et dernier bouton si > 3 pages */}
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
}