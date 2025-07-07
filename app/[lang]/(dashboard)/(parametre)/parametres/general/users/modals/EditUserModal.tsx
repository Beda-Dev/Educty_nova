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
import { Edit, Loader2 } from 'lucide-react';
import { useSchoolStore } from "@/store";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

interface EditUserModalProps {
  user: User;
  roles: Role[];
  onSuccess: () => void;
}

export const EditUserModal = ({ user, roles, onSuccess }: EditUserModalProps) => {
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(user.active === 1);
  const [selectedHierarchical, setSelectedHierarchical] = useState<{ value: number | null; label: string } | null>(null);
  const animatedComponents = makeAnimated();
  const { users } = useSchoolStore();

  const hierarchicalOptions = users
    .filter(u => u.id !== user.id) // Exclure l'utilisateur actuel
    .map(user => ({
      value: user.id,
      label: user.name
    }));

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

    if (user.hierarchical_id) {
      const superior = users.find(u => u.id === user.hierarchical_id);
      if (superior) {
        setSelectedHierarchical({
          value: superior.id,
          label: superior.name
        });
      }
    }
  }, [user, users]);

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

  const updateUser = async (data: {
    name: string;
    active: boolean;
    hierarchical_id: number | null;
  }) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name || user.name,
        email: user.email,
        active: data.active ? 1 : 0,
        hierarchical_id: data.hierarchical_id,
      };

      const response = await fetch(`/api/user?id=${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Échec de la mise à jour");

      const rolesToAssign = selectedRoles.map((role) => role.value);
      
      // Supprimer les anciens rôles
      await Promise.all(
        user.roles.map(async (role) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user.id}/remove-role`, 
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

      // Ajouter les nouveaux rôles
      await Promise.all(
        rolesToAssign.map(async (roleName) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user.id}/assign-role`, 
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
      toast.success("Utilisateur mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" color="tyrian">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4 pt-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await updateUser({
              name: formData.get('name') as string,
              active: isActive,
              hierarchical_id: selectedHierarchical?.value || null,
            });
          }}
        >
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
            <Label>Nom</Label>
            <Input 
              name="name" 
              defaultValue={user.name} 
              required 
            />
          </div>

          {/* Affichage de l'avatar existant */}
          {user.avatar && (
            <div className="space-y-2">
              <Label>Photo de profil actuelle</Label>
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border">
                <Image
                  src={user.avatar}
                  alt="Avatar actuel"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Label>Statut</Label>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              id="active-status"
            />
            <Label htmlFor="active-status" className="cursor-pointer">
              {isActive ? "Actif" : "Inactif"}
            </Label>
          </div>

          <div>
            <Label>Supérieur hiérarchique</Label>
            <Select
              options={hierarchicalOptions}
              value={selectedHierarchical}
              onChange={(selected) => setSelectedHierarchical(selected)}
              className="react-select"
              classNamePrefix="select"
              placeholder="Sélectionner un supérieur hiérarchique..."
              noOptionsMessage={() => "Aucun utilisateur disponible"}
              isClearable
            />
          </div>

          <div>
            <Label>Rôles</Label>
            <Select
              isMulti
              options={roleOptions}
              value={selectedRoles}
              onChange={(selected) => setSelectedRoles(selected as any)}
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

          <div className="flex justify-around gap-3 pt-4">
            <DialogClose asChild>
              <Button
                color="destructive"
                type="button"
                disabled={isLoading}
              >
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" color="indigodye" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};