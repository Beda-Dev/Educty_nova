"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Card from "@/components/ui/card-snippet";
import { Button } from "@/components/ui/button";
import { columns, ColumnProps } from "./data";
import InputFormValidation from "./input_form";
import { Role } from "@/lib/interface";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSchoolStore } from "@/store";
import { fetchRoles } from "@/store/schoolservice";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

interface Props {
  data: Role[];
  isLoading?: boolean;
}

const RolePage = ({ data, isLoading = false }: Props) => {
  const router = useRouter();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { roles, setRoles, userOnline } = useSchoolStore();
  const permissionRequisCreer = ["creer role"];
  const permissionRequisSupprimer = ["supprimer role"];
  const permissionRequisModifier = ["modifier role"];
  const permissionRequisAssigner = ["assigner role"];
  const permissionRequisVoir = ["voir role"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
  );
  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
  );
  const hasAdminAccessSupprimer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisSupprimer
  );

  const hasAdminAccessAssigner = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisAssigner
  );

  const confirmDelete = (roleId: number) => {
    setSelectedRoleId(roleId);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    if (selectedRoleId === null) return;
    // console.log("selectedRoleId", selectedRoleId);

    try {
      const response = await fetch(`/api/role?id=${selectedRoleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Échec de la suppression");

      toast.success("Rôle supprimé avec succès");
      const update: Role[] = roles.filter((role) => role.id !== selectedRoleId);
      setRoles(update);
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } finally {
      setOpenDialog(false);
      setSelectedRoleId(null);
    }
  };

  // if (hasAdminAccessVoir === false) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   );
  // }

  return (
    <div
      className={`grid grid-cols-1 ${
        hasAdminAccessCreer ? `md:grid-cols-2` : `md:grid-cols-1`
      } `}
    >
      <Card title="Liste des Rôles">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Nom du Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
            ) : data?.length > 0 ? (
              data.map((item: Role) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    {true ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="attribuer des permissions"
                        onClick={() => router.push(`/roles/${item.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {true ? (
                      <Button

                        size="icon"
                        variant="ghost"
                        title="Supprimer"
                        onClick={() => confirmDelete(item.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center h-[100px] items-end justify-center"
                >
                  Aucun rôle trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {true ? (
        <div className="bg-transparent p-2 h-[300px] rounded-sm w-[90%] mx-auto text-center items-center justify-center text-sm">
          <InputFormValidation />
        </div>
      ) : null}

      {/* Modale de confirmation */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est
            irréversible.
          </p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Annuler
            </Button>
            <Button variant="soft" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolePage;
