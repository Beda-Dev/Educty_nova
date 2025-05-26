"use client";
import { useState } from "react";
import { PlusCircle, CreditCard, Edit, Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useSchoolStore } from "@/store";
import { PaymentMethod } from "@/lib/interface";
import { fetchPaymentMethods } from "@/store/schoolservice";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaymentMethodForm from "./payment-method-form";

interface PaymentPaymentProps {
  data: PaymentMethod[];
}

export default function PaymentMethodsPage({data}: PaymentPaymentProps) {
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [editMethodLabel, setEditMethodLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const {  setmethodPayment } = useSchoolStore();
  const router = useRouter();

  const ITEMS_PER_PAGE = 5;
  const filteredData = data.filter((item) =>
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

  // Update payment method
  const updatePaymentMethod = async () => {
    if (!editingMethod || !editMethodLabel.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/payment-methods?id=${editingMethod.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: editMethodLabel.trim() }),
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedMethods = await fetchPaymentMethods();
      setmethodPayment(updatedMethods);
      setEditingMethod(null);
      setEditMethodLabel("");
      setIsModalOpen(false);
      router.refresh();

      toast({
        title: "Succès",
        description: "Méthode mise à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete payment method
  const deletePaymentMethod = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/payment-methods?id=${id}`, {
        method: "DELETE",
      });

      

      const updatedMethods = await fetchPaymentMethods();
      setmethodPayment(updatedMethods);

      toast({
        title: "Succès",
        description: "Méthode supprimée avec succès",
        color: "success",
      });
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setEditMethodLabel(method.name);
    setIsModalOpen(true);
  };

  const columns = [
    { key: "label", label: "Méthode de paiement" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="w-full">
      {/* Modal for adding new payment method */}
      <Dialog open={isModalOpenAdd} onOpenChange={setIsModalOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une méthode de paiement</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm onSuccess={() => setIsModalOpenAdd(false)} />
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
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Méthodes de paiement</CardTitle>
            </div>
            <Badge variant="outline">
              {filteredData.length}{" "}
              {filteredData.length > 1 ? "méthodes" : "méthode"}
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
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une méthode
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
                    {paginatedData.map((method) => (
                      <motion.tr
                        key={method.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-primary/5"
                      >
                        <TableCell className="font-medium">
                          {method.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button
                              color="tyrian"
                              size="icon"
                              onClick={() => openEditDialog(method)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  color="destructive"
                                  size="icon"
                                  disabled={isSubmitting}
                                  className=""
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
                                    Cette action supprimera définitivement la
                                    méthode "{method.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel variant="outline">Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deletePaymentMethod(method.id.toString())
                                    }
                                    
                                    color="destructive"
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
                        ? "Aucune méthode ne correspond à votre recherche."
                        : "Aucune méthode de paiement enregistrée."}
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

      {/* Edit modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier la méthode
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la méthode </Label>
              <Input
                value={editMethodLabel}
                onChange={(e) => setEditMethodLabel(e.target.value)}
              />
            </div>
            <div className="flex justify-between gap-3 pt-4">
              <Button
                color="destructive"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={updatePaymentMethod}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
