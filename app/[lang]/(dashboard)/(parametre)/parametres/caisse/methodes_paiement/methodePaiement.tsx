"use client";

import { useState, useEffect } from "react";
import { PlusCircle, CreditCard, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
//import { fetchPaymentMethods } from "@/store/schoolservice"

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [newMethodLabel, setNewMethodLabel] = useState("");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [editMethodLabel, setEditMethodLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { methodPayment, setmethodPayment } = useSchoolStore();

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
      setPaymentMethods([...paymentMethods, newMethod]);
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

      const updatedMethod = await response.json();
      setPaymentMethods(
        paymentMethods.map((method) =>
          method.id === updatedMethod.id ? updatedMethod : method
        )
      );
      setEditingMethod(null);
      setEditMethodLabel("");

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

      setPaymentMethods(
        paymentMethods.filter((method) => method.id !== Number(id))
      );

      toast({
        title: "Succès",
        description: "Méthode supprimée avec succès",
      });
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
  };

  return (
    <Card className="p-3" >
      <div className="container mx-auto py-10">
        <motion.h1
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Méthodes de Paiement
        </motion.h1>

        {/* Add new method form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ajouter une méthode de paiement</CardTitle>
              <CardDescription>
                Créez une nouvelle méthode de paiement en saisissant un nom.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nom de la méthode</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Carte Bancaire, Virement, etc."
                    value={newMethodLabel}
                    onChange={(e) => setNewMethodLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPaymentMethod()}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
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
            </CardFooter>
          </Card>
        </motion.div>

        {/* Payment methods list */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence>
            {methodPayment.length === 0 ? (
              <motion.div
                className="text-center py-10 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Aucune méthode de paiement n'a été ajoutée.
              </motion.div>
            ) : (
              <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AnimatePresence>
                  {methodPayment.map((method) => (
                    <motion.div
                      key={method.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <CreditCard className="h-8 w-8 text-primary" />
                            <div>
                              <CardTitle>{method.label}</CardTitle>
                              <CardDescription>
                                Méthode de paiement
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {/* Edit Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog({ ...method })}
                                  disabled={isSubmitting}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Modifier la méthode</DialogTitle>
                                  <DialogDescription>
                                    Modifiez le nom de cette méthode de
                                    paiement.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="edit-method"
                                      className="text-right"
                                    >
                                      Nom
                                    </Label>
                                    <Input
                                      id="edit-method"
                                      value={editMethodLabel}
                                      onChange={(e) =>
                                        setEditMethodLabel(e.target.value)
                                      }
                                      className="col-span-3"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={updatePaymentMethod}
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      "Enregistrer"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Delete Alert */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isSubmitting}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
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
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
