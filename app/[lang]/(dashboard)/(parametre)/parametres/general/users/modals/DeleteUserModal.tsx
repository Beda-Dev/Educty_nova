"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react";
import { User } from "@/lib/interface";

interface DeleteUserModalProps {
  userId: number;
  onSuccess: () => void;
}

export const DeleteUserModal = ({ userId, onSuccess }: DeleteUserModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/user?id=${userId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.data?.message || "Échec de la suppression");

      onSuccess();
      toast.success("Utilisateur supprimé !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" color="bittersweet" className="h-7 w-7">
          <Icon icon="heroicons:trash" className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <p>Cette action est irréversible.</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant={"outline"}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteUser}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};