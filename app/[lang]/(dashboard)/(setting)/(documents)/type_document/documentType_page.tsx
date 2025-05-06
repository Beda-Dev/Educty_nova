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
import { DocumentType } from "@/lib/interface";
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
import { fetchDocumentType } from "@/store/schoolservice";
import { Badge } from "@/components/ui/badge";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

interface Props {
  data: DocumentType[];
}

const DocumentTypeComponant = ({ data }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectDoctype, setselectDoctype] = useState<DocumentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setDocumentTypes, userOnline } = useSchoolStore();

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });

  const handleEdit = (DocType: DocumentType) => {
    setselectDoctype(DocType);
    reset({ name: DocType.name });
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData: { name: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documentType?id=${selectDoctype?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour");
      }

      toast.success("Type de document mis à jour avec succès");
      const updatedDocType = await fetchDocumentType();
      setDocumentTypes(updatedDocType);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const activeDocType = data.filter((item) => item.active === 1);

  const columns = [
    { key: "label", label: "Type document" },
    { key: "actions", label: "Actions" },
  ];

  // if (hasAdminAccessVoir === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  if (hasAdminAccessModifier === false) {
    columns.pop(); // Remove the actions column if the user doesn't have permission
  }

  return (
    <div
      className={`grid grid-cols-1  ${
        hasAdminAccessCreer ? ` md:grid-cols-[2fr_1fr]` : ` md:grid-cols-1`
      }  gap-6`}
    >
      {hasAdminAccessCreer ? (
        <div className="bg-transparent p-2 h-[300px] rounded-sm w-[90%] mx-auto text-center items-center justify-center text-sm order-1 md:order-2">
          <InputFormValidation
            onSuccess={() => fetchDocumentType().then(setDocumentTypes)}
          />
        </div>
      ) : null}
      {/* Carte de la liste des types de frais */}
      <Card className="p-6 shadow-sm order-2 md:order-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Types de document</h2>
          <Badge variant="outline" className="px-3 py-1">
            Total: {activeDocType.length}
          </Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800 text-center">
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="text-center font-medium"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeDocType.length > 0 ? (
                activeDocType.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="text-center">{item.name}</TableCell>
                    {hasAdminAccessModifier ? (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="text-primary hover:bg-primary/10 mx-auto"
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
                    Aucun type de document actif trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modale de modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              <Icon icon="heroicons:pencil" className="inline mr-2 h-5 w-5" />
              Modifier le type de document
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de "{selectDoctype?.name}"
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleUpdate)}
            className="space-y-4 mt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nom du type de document *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Le nom est requis",
                  minLength: {
                    value: 2,
                    message: "Le nom doit contenir au moins 2 caractères",
                  },
                })}
                placeholder="Ex: Frais de scolarité"
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

export default DocumentTypeComponant;
