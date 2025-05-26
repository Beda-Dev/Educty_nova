"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select, { GroupBase, components } from "react-select";
import makeAnimated from "react-select/animated";
import { Icon } from "@iconify/react";
import { User, Role } from "@/lib/interface";

interface EditUserModalProps {
  user: User;
  roles: Role[];
  onSuccess: () => void;
}

export const EditUserModal = ({ user, roles, onSuccess }: EditUserModalProps) => {
  const [selectedRoles, setSelectedRoles] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const animatedComponents = makeAnimated();

  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: role.name,
  }));

  useEffect(() => {
    if (user.roles) {
      setSelectedRoles(
        user.roles.map((role) => ({
          value: role.name,
          label: role.name,
        }))
      );
    }
  }, [user]);

  const updateUserRoles = async (roles: string[]) => {
    setIsLoading(true);
    try {
      await Promise.all(
        user.roles.map(async (role) => {
          const response = await fetch(
            `https://test.com/api/users/${user.id}/remove-role`, 
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: role.name }),
            }
          );
          if (!response.ok) throw new Error("Failed to remove role");
        })
      );

      await Promise.all(
        roles.map(async (roleName) => {
          const response = await fetch(
            `https://educty.digifaz.com/api/users/${user.id}/assign-role`, 
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: roleName }),
            }
          );
          if (!response.ok) throw new Error("Failed to assign role");
        })
      );

      onSuccess();
      toast.success("Rôles mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Erreur lors de la mise à jour des rôles");
    } finally {
      setIsLoading(false);
    }
  };

  const CustomOption = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center gap-2">
          <Icon icon="heroicons:user-circle" className="h-4 w-4" />
          {props.data.label}
        </div>
      </components.Option>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" color="tyrian" className="h-7 w-7">
          <Icon icon="heroicons:pencil" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <form
            className="space-y-5 pt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const rolesToAssign = selectedRoles.map((role) => role.value);
              await updateUserRoles(rolesToAssign);
            }}
          >
            <div>
              <Label>Nom</Label>
              <Input name="name" defaultValue={user.name} required disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                disabled
              />
            </div>
            <div>
              <Label>Rôles</Label>
              <Select
                isMulti
                options={roleOptions}
                value={selectedRoles}
                onChange={(selected: any) => setSelectedRoles(selected)}
                components={{
                  ...animatedComponents,
                  Option: CustomOption,
                }}
                className="react-select"
                classNamePrefix="select"
                placeholder="Sélectionner des rôles..."
                noOptionsMessage={() => "Aucun rôle disponible"}
                closeMenuOnSelect={false}
              />
            </div>
            <div className="flex justify-around space-x-3">
              <DialogClose asChild>
                <Button type="button" color="destructive" disabled={isLoading}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" color="tyrian" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};