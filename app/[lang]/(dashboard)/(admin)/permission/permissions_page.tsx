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
import { Permission } from "@/lib/interface";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useState } from "react";
import { verificationPermission } from "@/lib/fonction";
import { useSchoolStore } from "@/store";
import ErrorPage from "@/app/[lang]/non-Autoriser";

interface Props {
  data: Permission[];
  isLoading?: boolean;
}

const PermissionsPage = ({ data, isLoading = false }: Props) => {
  const { userOnline } = useSchoolStore();
  const permissionRequis = ["voir permission"];
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<number | null>(null);

  const hasAdminAccess = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequis
  );

  const handleDelete = async () => {
    if (!permissionToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/permission/${permissionToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }

      toast.success("Permission supprimée avec succès");
      router.refresh();
    } catch (error) {
      toast.error("Échec , cetta permission est attribuée a un utilisateur");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setPermissionToDelete(null);
    }
  };

  if(hasAdminAccess === false){
    return ( <Card>
      <ErrorPage />
    </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1">
      <Card title="Liste des permissions attribuées">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Nom de la permission</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.length > 0 ? (
              data.map((item: Permission) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      title="Voir les rôles concernés"
                      onClick={() => router.push(`/permission/${item.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {/* <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title="Supprimer"
                          className="hover:text-destructive"
                          onClick={() => setPermissionToDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la permission "{item.name}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center h-[100px]">
                  Aucune permission trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PermissionsPage;