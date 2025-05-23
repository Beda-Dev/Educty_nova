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
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { DocumentType } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { fetchDocumentType } from "@/store/schoolservice";
import { verificationPermission } from "@/lib/fonction";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const formSchema = z.object({
  name: z.string()
    .min(2, "Le type de document doit comporter au moins 2 caractères")
    .max(50, "Le type de document ne peut excéder 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Caractères spéciaux non autorisés"),
});

interface Props {
  data: DocumentType[];
}

const DocumentTypeComponant = ({ data }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectDoctype, setSelectDoctype] = useState<DocumentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { setDocumentTypes, userOnline } = useSchoolStore();
  const router = useRouter();

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

  const activeDocType = data.filter((item) => item.active === 1);
  const filteredDocTypes = activeDocType.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredDocTypes.length / ITEMS_PER_PAGE);
  const paginatedDocTypes = filteredDocTypes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Form for creation
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Form for editing
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleCreate = () => {
    createForm.reset();
    setIsModalOpen(true);
  };

  const handleEdit = (docType: DocumentType) => {
    setSelectDoctype(docType);
    editForm.reset({ name: docType.name });
    setIsEditModalOpen(true);
  };

  const onSubmitCreate = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/documentType", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Échec de la création");
      }

      toast.success("Type de document créé avec succès");
      const updatedDocType = await fetchDocumentType();
      setDocumentTypes(updatedDocType);
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEdit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/documentType?id=${selectDoctype?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Échec de la mise à jour");
      }

      toast.success("Type de document mis à jour avec succès");
      const updatedDocType = await fetchDocumentType();
      setDocumentTypes(updatedDocType);
      setIsEditModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: "label", label: "Type document" },
    ...(hasAdminAccessModifier ? [{ key: "actions", label: "Actions" }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:document-text" className="h-5 w-5 text-primary" />
            <CardTitle>Types de documents</CardTitle>
          </div>
          <Badge variant="outline">
            {filteredDocTypes.length} {filteredDocTypes.length > 1 ? "types de documents" : "type de document"}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className=" flex justify-between">
                      <div className="">
            <Input
              placeholder="Rechercher un type de document..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-[300px]"
            />
          </div>
          {hasAdminAccessCreer && (
            <div className="flex">
              <Button color="indigodye" onClick={handleCreate}>
                <Icon icon="heroicons:plus" className="mr-2 h-4 w-4" />
                Ajouter un type
              </Button>
            </div>
          )}


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
              {filteredDocTypes.length > 0 ? (
                <AnimatePresence>
                  {paginatedDocTypes.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-muted-foreground/20"
                    >
                      <TableCell>{item.name}</TableCell>
                      {hasAdminAccessModifier && (
                        <TableCell className="text-right">
                          <Button
                            color="tyrian"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className=""
                          >
                            <Icon icon="heroicons:pencil" className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
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
                      ? "Aucun type de document ne correspond à votre recherche."
                      : "Aucun type de document actif trouvé."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredDocTypes.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={currentPage === 1 ? undefined : handlePreviousPage}
                      aria-disabled={currentPage === 1}
                      tabIndex={currentPage === 1 ? -1 : 0}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <Button
                        variant={currentPage === i + 1 ? "outline" : "ghost"}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={
                        currentPage === totalPages ? undefined : handleNextPage
                      }
                      aria-disabled={currentPage === totalPages}
                      tabIndex={currentPage === totalPages ? -1 : 0}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for creating new document type */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              <Icon icon="heroicons:plus-circle" className="inline mr-2 h-5 w-5" />
              Nouveau type de document
            </DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau type de document à votre établissement
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du type de document *</Label>
              <Input
                id="name"
                {...createForm.register("name")}
                placeholder="Ex: Extrait d'acte de naissance"
                className={cn({
                  "border-destructive": createForm.formState.errors.name,
                })}
              />
              {createForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="flex justify-around gap-3 pt-4">
              <Button
                color="destructive"
                type="button"
                
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                color="tyrian"
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
                  "Créer"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal for editing document type */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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

          <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du type de document *</Label>
              <Input
                id="name"
                {...editForm.register("name")}
                placeholder="Ex: Extrait d'acte de naissance"
                className={cn({
                  "border-destructive": editForm.formState.errors.name,
                })}
              />
              {editForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="flex justify-around gap-3 pt-4">
              <Button
                color="destructive"
                type="button"
                
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
              color="tyrian"
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
    </motion.div>
  );
};

export default DocumentTypeComponant;