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
import { Level } from "@/lib/interface";
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
import { fetchLevels } from "@/store/schoolservice";
import { Badge } from "@/components/ui/badge";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

interface Props {
  data: Level[];
}

const LevelPage = ({ data }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setLevels, userOnline } = useSchoolStore();

  const permissionRequisVoir = ["voir niveau"];
  const permissionRequisModifier = ["modifier niveau"];
  const permissionRequisCreer = ["creer niveau"];
  const permissionRequisSupprimer = ["supprimer niveau"];

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{ label: string }>({
    defaultValues: {
      label: "",
    },
  });

  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
    reset({ label: level.label });
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData: { label: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/level?id=${selectedLevel?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la mise à jour");
      }

      toast.success("Niveau mis à jour avec succès");
      const updatedLevels: Level[] = await fetchLevels();
      setLevels(updatedLevels);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const activeLevels = data.filter((item) => item.active === 1);

  const columns = [
    { key: "label", label: "Niveau" },
    { key: "class_count", label: "Nombre de classes" },
  ];

  if (hasAdminAccessModifier === true) {
    columns.push({ key: "actions", label: "Actions" });
  }

  if (hasAdminAccessVoir === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 ${
        hasAdminAccessCreer ? `md:grid-cols-2` : `md:grid-cols-1`
      }  gap-6`}
    >
            {/* Carte du formulaire d'ajout */}
            {hasAdminAccessCreer ? (
        <div className="bg-transparent p-2 h-[300px] rounded-sm w-[90%] mx-auto text-center items-center justify-center text-sm order-1 md:order-2">
          <InputFormValidation />
        </div>
      ) : null} 

      {/* Carte de la liste des niveaux */}
      <Card className="p-6 shadow-sm order-2 md:order-1">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Liste des Niveaux
          </h2>
          <Badge variant="outline" className="px-3 py-1">
            Total: {activeLevels.length}
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
              {activeLevels.length > 0 ? (
                activeLevels.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="text-center">
                      {item.class_count}
                    </TableCell>

                    {hasAdminAccessModifier ? (
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
                    ) : null}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    Aucun niveau actif trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>



      {/* Modale de modification */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsModalOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              <Icon icon="heroicons:pencil" className="inline mr-2 h-5 w-5" />
              Modifier le niveau
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Mettez à jour les informations de {selectedLevel?.label}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleUpdate)}
            className="space-y-4 mt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="label">Nom du niveau *</Label>
              <Input
                id="label"
                {...register("label", {
                  required: "Le nom du niveau est requis",
                  minLength: {
                    value: 2,
                    message: "Le nom doit contenir au moins 2 caractères",
                  },
                })}
                placeholder="Ex: Terminale"
                className={errors.label ? "border-red-500" : ""}
              />
              {errors.label && (
                <p className="text-sm text-red-500">{errors.label.message}</p>
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
                    En cours...
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

export default LevelPage;
