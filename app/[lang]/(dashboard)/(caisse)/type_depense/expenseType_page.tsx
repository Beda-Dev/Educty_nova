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
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { fetchExpenseType } from "@/store/schoolservice";
import { Badge } from "@/components/ui/badge";
import {ExpenseType} from "@/lib/interface";



interface Props {
  data: ExpenseType[];
}

const ExpenseTypePage = ({ data }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<ExpenseType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { expenseTypes , setExpenseTypes } = useSchoolStore();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    }
  });

  const handleEdit = (supply: ExpenseType) => {
    setSelectedSupply(supply);
    reset({ name: supply.name });
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData: { name: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/expenseType?id=${selectedSupply?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour");
      }

      toast.success("Fourniture mise à jour avec succès");
      const updatedSupplies:ExpenseType[] = await fetchExpenseType();
      setExpenseTypes(updatedSupplies);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const activeSupplies = data.filter(item => item.active === 1);

  const columns = [
    { key: "name", label: "nom" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Carte de la liste des fournitures */}
      <Card className="p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">type de depenses</h2>
          <Badge variant="outline" className="px-3 py-1">
            Total: {activeSupplies.length}
          </Badge>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className="font-medium">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSupplies.length > 0 ? (
                activeSupplies.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium">{item.name}</TableCell>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                    Aucun type de depense active trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Carte du formulaire d'ajout */}
      <div className="bg-transparent p-2 h-[300px] rounded-sm w-[90%] mx-auto text-center items-center justify-center text-sm">
        <InputFormValidation onSuccess={() => fetchExpenseType().then(setExpenseTypes)} />
      </div>

      {/* Modale de modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              <Icon icon="heroicons:pencil" className="inline mr-2 h-5 w-5" />
              Modifier le type
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de "{selectedSupply?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                {...register("name", { 
                  required: "Le nom est requis",
                  minLength: {
                    value: 2,
                    message: "Le nom doit contenir au moins 2 caractères"
                  }
                })}
                placeholder="Ex: Cahier 200 pages"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
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
                    <Icon icon="heroicons:arrow-path" className="h-4 w-4 animate-spin mr-2" />
                    En cours...
                  </>
                ) : "Mettre à jour"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTypePage;