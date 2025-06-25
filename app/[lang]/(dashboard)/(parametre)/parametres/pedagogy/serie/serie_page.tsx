"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Serie } from "@/lib/interface";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import InputFormValidation from "./input_form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { fetchSeries , fetchClasses } from "@/store/schoolservice";
import { Loader2 } from "lucide-react";



const SeriePage = () => {
  const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setSeries, userOnline , setClasses , series } = useSchoolStore();
  const [filtered, setFiltered] = useState(() =>
    series.filter((serie) => serie.label !== "")
  );

  const filteredData = filtered;
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ label: string }>({
    defaultValues: {
      label: "",
    },
  });

  const permissionRequisVoir = ["voir serie"];
  const permissionRequisModifier = ["modifier serie"];
  const permissionRequisCreer = ["creer serie"];

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

  const handleEdit = (serie: Serie) => {
    setSelectedSerie(serie);
    reset({ label: serie.label });
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData: { label: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/serie/${selectedSerie?.id}`, {
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

      toast.success("Série mise à jour avec succès");
      const updatedSeries: Serie[] = await fetchSeries();
      setSeries(updatedSeries);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: "label", label: "Série" },
    { key: "actions", label: "Actions" },
  ];

  useEffect(() => {
    setFiltered(series.filter((serie) => serie.label !== ""));
  }, [series]);

  // if (hasAdminAccessVoir === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  return (
    <div className="w-full">
      {/* Modale d'ajout */}
      <Dialog open={isModalOpenAdd} onOpenChange={setIsModalOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle série</DialogTitle>
          </DialogHeader>
          <InputFormValidation onSuccess={() => setIsModalOpenAdd(false)} />
        </DialogContent>
      </Dialog>

      {/* Modale de modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Modifier la série
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleUpdate)}
            className="space-y-4 mt-2"
          >
            <div className="space-y-2">
              <label htmlFor="label" className="block text-sm font-medium">
                Nom de la série
              </label>
              <Input
                id="label"
                {...register("label", {
                  required: "Le nom de la série est requis",
                  minLength: {
                    value: 1,
                    message: "Le nom doit contenir au moins 1 caractères",
                  },
                })}
                placeholder="Ex: Série A"
                className={errors.label ? "border-red-500" : ""}
              />
              {errors.label && (
                <p className="text-sm text-red-500">{errors.label.message}</p>
              )}
            </div>

            <div className="flex justify-around gap-3 pt-4">
              <Button
                type="button"
                color="destructive"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                color="tyrian"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {isLoading ? "En cours..." : "Mettre à jour"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liste des séries</CardTitle>
          <Badge variant="outline">
            {filteredData.length}{" "}
            {filteredData.length > 1 ? "séries" : "série"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            {/* Filtre de recherche */}
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
              <Input
                placeholder="Rechercher..."
                className="w-full sm:w-64"
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  setCurrentPage(1);
                  setFiltered(
                    series.filter((item) =>
                      item.label.toLowerCase().includes(value)
                    )
                  );
                }}
              />
            </div>

            {/* Bouton d'ajout */}
            {true && (
              <Button color="indigodye" onClick={() => setIsModalOpenAdd(true)}>
                Ajouter une série
              </Button>
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
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>
                      {true && (
                        <Button
                          color="tyrian"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Aucune série trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={
                        currentPage === 1 ? undefined : () => setCurrentPage((p) => Math.max(1, p - 1))
                      }
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
                        currentPage === totalPages
                          ? undefined
                          : () => setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      aria-disabled={currentPage === totalPages}
                      tabIndex={currentPage === totalPages ? -1 : 0}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50 text-muted-foreground"
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
    </div>
  );
};

export default SeriePage;
