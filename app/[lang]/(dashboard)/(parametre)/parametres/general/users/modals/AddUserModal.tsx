"use client";

import { useState } from "react";
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
import Select, { components } from "react-select";
import makeAnimated from "react-select/animated";
import { Icon } from "@iconify/react";
import { Role } from "@/lib/interface";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast"; // ✅ Shadcn toast
import { Loader2 } from "lucide-react"; // ✅ Spinning loader
import { motion } from "framer-motion"; // ✅ Animation

interface AddUserModalProps {
  roles: Role[];
  onSuccess: () => void;
}

export const AddUserModal = ({ roles, onSuccess }: AddUserModalProps) => {
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const animatedComponents = makeAnimated();

  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: role.name,
  }));

  const CustomOption = (props: any) => (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <Icon icon="heroicons:user-circle" className="h-4 w-4" />
        {props.data.label}
      </div>
    </components.Option>
  );

  const addUser = async (newUser: {
    name: string;
    email: string;
    password: string;
    roles: string[];
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
        }),
      });

      if (!response.ok) throw new Error("Échec de la création");

      const createdUser = await response.json();

      await Promise.all(
        newUser.roles.map(async (roleName) => {
          const roleResponse = await fetch(
            `https://educty.digifaz.com/api/users/${createdUser.id}/assign-role`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: roleName }),
            }
          );
          if (!roleResponse.ok) throw new Error("Échec de l'attribution du rôle");
        })
      );

      toast({
        title: "Succès",
        description: "Utilisateur ajouté avec succès !",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        color: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="indigodye">Ajouter un utilisateur</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
        </DialogHeader>

        <motion.form
          className="space-y-5 pt-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            await addUser({
              name: formData.get("name") as string,
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              roles: selectedRoles.map((role) => role.value),
            });
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input name="name" placeholder="Nom" required />
          <Input name="email" placeholder="Email" type="email" required />
          <Input name="password" placeholder="Mot de passe" type="password" required />

          <div>
            <Label>Rôles</Label>
            <Select
              isMulti
              options={roleOptions}
              value={selectedRoles}
              onChange={(selected: any) => setSelectedRoles(selected)}
              components={{ ...animatedComponents, Option: CustomOption }}
              className="react-select"
              classNamePrefix="select"
              placeholder="Sélectionner des rôles..."
              noOptionsMessage={() => "Aucun rôle disponible"}
              closeMenuOnSelect={false}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="send-email" checked={sendEmail} onCheckedChange={(val) => setSendEmail(Boolean(val))} />
            <Label htmlFor="send-email" className="cursor-pointer">
              Envoyer un email à l’utilisateur avec son mot de passe
            </Label>
          </div>

          <div className="flex justify-around gap-3 pt-4">
            <DialogClose asChild>
              <Button type="reset" color="bittersweet" disabled={isLoading}>
                Annuler
              </Button>
            </DialogClose>

            <Button type="submit" color="indigodye" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};
