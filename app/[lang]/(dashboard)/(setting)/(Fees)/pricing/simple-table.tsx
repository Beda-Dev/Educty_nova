import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Pricing } from "@/lib/interface";
import { Edit, Loader2 } from "lucide-react";
import DialogForm from "./edit_modal_pricing";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import errorPage from "@/app/[lang]/non-Autoriser";
import { Card } from "@/components/ui/card";
import { fetchpricing } from "@/store/schoolservice";

interface PricingTableProps {
  data: Pricing[];
}

const FeeTable: React.FC<PricingTableProps> = ({ data }) => {
  const { userOnline , setPricing } = useSchoolStore();
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);
  const router = useRouter();
  const activeFees = data.filter((item) => item.active === 1);
  const permissionRequisVoir = ["voir frais_Scolaires"];
  const permissionRequisModifier = ["modifier frais_Scolaires"];
  

  const COLUMNS = [
    { key: "level", label: "Niveau" },
    { key: "fee_type", label: "Type de frais" },
    { key: "assignment_type", label: "Statut d'élève" },
    { key: "amount", label: "Montant" },
    { key: "academic_year", label: "Année académique" },
    { key: "action", label: "Actions" },
  ];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );
  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
  );

  if (hasAdminAccessVoir === false) {
    router.push("/dashboard");
    return null;
  }

  const handleEdit = (item: Pricing) => {
    setSelectedPricing(item);
    setOpenDialog(true);
  };

    const refreshPricingData = async () => {
      try {
        const updatedPricing = await fetchpricing();
        if (updatedPricing) {
          setPricing(updatedPricing);
        }
        router.refresh();
      } catch (error) {
        console.error("Erreur lors de la récupération des tarifs :", error);
      }
    };

  const handleUpdate = async () => {
    setIsLoading(true);
    refreshPricingData();
    router.refresh();
    setOpenDialog(false);
    setIsLoading(false);
  };

  if (hasAdminAccessModifier === false) {
    COLUMNS.pop();
  }

  

  if (!activeFees.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <p className="text-muted-foreground">Aucun tarif actif disponible</p>
        <Button onClick={() => router.refresh()}>Actualiser</Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                className={column.key === "action" ? "text-right" : "text-left"}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeFees.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell>{item.level.label}</TableCell>
              <TableCell>{item.fee_type.label}</TableCell>
              <TableCell>{item.assignment_type.label}</TableCell>
              <TableCell className="font-medium">
                {Number(item.amount).toLocaleString()} FCFA
              </TableCell>
              <TableCell>{item.academic_year.label}</TableCell>
              {hasAdminAccessModifier ? (
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="ghost"
                    size="icon"
                    title="Modifier"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedPricing && (
        <DialogForm
          open={openDialog}
          setOpen={setOpenDialog}
          pricing={selectedPricing}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default FeeTable;
