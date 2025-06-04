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
import { Edit, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pricing } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import DialogForm from "./edit_modal_pricing";
import { fetchpricing } from "@/store/schoolservice";

interface PricingTableProps {
  data: Pricing[];
}

const FeeTable: React.FC<PricingTableProps> = ({ data }) => {
  const { userOnline, setPricing } = useSchoolStore();
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

  if (!canView) {
    router.push("/dashboard");
    return null;
  }

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
                Ajouter un tarif
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
                        {Number(item.amount).toLocaleString()} FCFA
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
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
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
