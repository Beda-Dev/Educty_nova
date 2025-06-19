"use client";

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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, PlusCircle, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pricing } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import DialogForm from "./edit_modal_pricing";
import { fetchpricing } from "@/store/schoolservice";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";


interface PricingTableProps {
  data: Pricing[];
}

const formatNumber = (number: number | string) => {
  // Convertir en nombre si c'est une chaîne
  const num = typeof number === 'string' ? parseFloat(number) : number;
  // Retourner 0 si NaN
  if (isNaN(num)) return '0';
  // Formater avec espace comme séparateur de milliers
  return num.toLocaleString('fr-FR').replace(/,/g, ' ');
};

const FeeTable: React.FC<PricingTableProps> = ({ data }) => {
  const { userOnline, setPricing, settings } = useSchoolStore();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  

  const router = useRouter();

  const permissionVoir = ["voir frais_Scolaires"];
  const permissionModifier = ["modifier frais_Scolaires"];
  const permissionCreer = ["creer frais_Scolaires"];

  const canView = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionVoir
  );
  const canEdit = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionModifier
  );
  const canCreate = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionCreer
  );

  // if (!canView) {
  //   router.push("/dashboard");
  //   return null;
  // }

  const filteredFees = data.filter(
    (item) =>
      item.active === 1 &&
      (item.level.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fee_type.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const currentData = filteredFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (item: Pricing) => {
    setSelectedPricing(item);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    const updatedPricing = await fetchpricing();
    setPricing(updatedPricing);
    setOpenDialog(false);
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-2xl">Frais scolaires</CardTitle>
          <Badge variant="outline">{filteredFees.length} Frais scolaires</Badge>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            <Input
              placeholder="Rechercher un niveau ou un type de frais..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset page on search
              }}
              className="w-full md:w-64"
            />

            {canCreate && (
              <Button
                color="indigodye"
                className="w-full md:w-auto"
                onClick={() =>
                  router.push(
                    "/parametres/scolarite/pricing/creation"
                  )
                }
              >
                Ajouter une tarification
              </Button>
            )}
          </div>

          {filteredFees.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              Aucun tarif trouvé.
              <div className="mt-4">
                <Button onClick={() => router.refresh()}>Actualiser</Button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Type de frais</TableHead>
                    <TableHead>Statut d'élève</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Année académique</TableHead>
                    {canEdit && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>{item.level.label}</TableCell>
                      <TableCell>{item.fee_type.label}</TableCell>
                      <TableCell>{item.assignment_type.label}</TableCell>
                      <TableCell className="font-medium">
                      {formatNumber(item.amount)}{" "}{settings[0]?.currency || "FCFA"}
                      </TableCell>
                      <TableCell>{item.academic_year.label}</TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleEdit(item)}
                            size="icon"
                            color="tyrian"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {filteredFees.length > itemsPerPage && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {/* Bouton Précédent */}
                      <PaginationItem>
                        {currentPage === 1 ? (
                          <PaginationPrevious className="cursor-not-allowed opacity-50" />
                        ) : (
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          />
                        )}
                      </PaginationItem>

                      {/* Affichage des pages */}
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <Button
                              variant={currentPage === pageNum ? "outline" : "ghost"}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          </PaginationItem>
                        );
                      })}

                      {/* Points de suspension si nécessaire */}
                      {totalPages > 3 && currentPage < totalPages - 1 && (
                        <PaginationItem>
                          <span className="px-2 text-muted-foreground">…</span>
                        </PaginationItem>
                      )}

                      {/* Dernière page si nécessaire */}
                      {totalPages > 3 && currentPage < totalPages && (
                        <PaginationItem>
                          <Button
                            variant={currentPage === totalPages ? "outline" : "ghost"}
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        </PaginationItem>
                      )}

                      {/* Bouton Suivant */}
                      <PaginationItem>
                        {currentPage === totalPages ? (
                          <PaginationNext className="cursor-not-allowed opacity-50" />
                        ) : (
                          <PaginationNext
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          />
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedPricing && (
        <DialogForm
          open={openDialog}
          setOpen={setOpenDialog}
          pricing={selectedPricing}
          onUpdate={handleUpdate}
        />
      )}
    </motion.div>
  );
};

export default FeeTable;
