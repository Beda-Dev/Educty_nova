"use client";

import { useState, useEffect } from "react";
import { PlusCircle, CreditCard, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

export default function PaymentMethodsPage() {
  const [newMethodLabel, setNewMethodLabel] = useState("");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [editMethodLabel, setEditMethodLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { methodPayment, setmethodPayment } = useSchoolStore();
  const router = useRouter();

  const itemsPerPage = 5;
  const filteredData = methodPayment.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch payment methods
  useEffect(() => {
    const data: PaymentMethod[] = [
      {
        id: 1,
        label: "Carte Bancaire",
        created_at: "2023-10-01",
        updated_at: "2023-10-01",
      },
    ];
    setmethodPayment(data);
  }, []);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Add new payment method
  const addPaymentMethod = async () => {
    if (!newMethodLabel.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour la méthode de paiement",
        color: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label: newMethodLabel.trim() }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout");

      const newMethod = await response.json();
      // Refresh the list after adding
      const updatedMethods = await fetchPaymentMethods();
      setmethodPayment(updatedMethods);
      setNewMethodLabel("");

      toast({
        title: "Succès",
        description: `La méthode "${newMethodLabel}" a été ajoutée.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update payment method
  const updatePaymentMethod = async () => {
    if (!editingMethod || !editMethodLabel.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/payment-methods/${editingMethod.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label: editMethodLabel.trim() }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      // Refresh the list after update
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
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      // Refresh the list after delete
      const updatedMethods = await fetchPaymentMethods();
      setmethodPayment(updatedMethods);

      toast({
        title: "Succès",
        description: "Méthode supprimée avec succès",
      });
      router.refresh();
    } catch (error) {
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
    setEditMethodLabel(method.label);
    setIsModalOpen(true);
  };

  const columns = [
    { key: "label", label: "Méthode de paiement" },
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
        <Card className="lg:col-span-1 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Ajouter une méthode</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la méthode *</Label>
              <Input
                id="name"
                placeholder="Ex: Carte Bancaire, Virement, etc."
                value={newMethodLabel}
                onChange={(e) => setNewMethodLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPaymentMethod()}
              />
            </div>
            <Button
              onClick={addPaymentMethod}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Ajouter
            </Button>
          </div>
        </Card>

        {/* Carte de la liste des méthodes */}
        <Card className="lg:col-span-2 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Méthodes de paiement</h2>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <Input
                type="text"
                placeholder="Rechercher une méthode..."
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
                          {method.label}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(method)}
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isSubmitting}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Êtes-vous sûr ?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action supprimera définitivement la
                                    méthode "{method.label}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deletePaymentMethod(method.id.toString())
                                    }
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
                      {searchTerm ? (
                        "Aucune méthode ne correspond à votre recherche."
                      ) : (
                        "Aucune méthode de paiement enregistrée pour le moment."
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
                          variant={currentPage === page ? "outline" : "ghost"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 3 && currentPage < totalPages && (
                    <PaginationItem>
                      <Button variant="ghost" disabled>
                        ...
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
              <Edit className="h-5 w-5" />
              Modifier la méthode
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de la méthode de paiement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-method">Nom de la méthode *</Label>
              <Input
                id="edit-method"
                value={editMethodLabel}
                onChange={(e) => setEditMethodLabel(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
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