"use client";

import { useState, useEffect } from "react";
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
import { Loader2, PlusCircle } from "lucide-react"; // ✅ Spinning loader
import { motion } from "framer-motion"; // ✅ Animation
import {sendAccountInfo} from "@/lib/fonction"

interface AddUserModalProps {
  roles: Role[];
  onSuccess: () => void;
}

// Fonction fictive à appeler après création si mot de passe par défaut
const sendAccount = async (name: string, email: string) => {
  try {
    await sendAccountInfo(name, email);
    toast({
      title: "Email envoyé",
      description: "Les informations de compte ont été envoyées à l'utilisateur.",
    });
  } catch (error) {
    console.error("Error sending account info:", error);
    toast({
      color: "destructive",
      title: "Erreur",
      description: "Une erreur est survenue lors de l'envoi des informations de compte.",
    });
  }
};

export const AddUserModal = ({ roles, onSuccess }: AddUserModalProps) => {
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [useDefaultPassword, setUseDefaultPassword] = useState(false);
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
    useDefaultPassword: boolean;
  }) => {
    setIsLoading(true);
    try {
      const passwordToUse = newUser.useDefaultPassword
        ? process.env.NEXT_PUBLIC_DEFAULT_PASSWORD
        : newUser.password;

      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: passwordToUse,
        }),
      });

      if (!response.ok) throw new Error("Échec de la création");

      const createdUser = await response.json();

      await Promise.all(
        newUser.roles.map(async (roleName) => {
          const roleResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${createdUser.id}/assign-role`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: roleName }),
            }
          );
          if (!roleResponse.ok) throw new Error("Échec de l'attribution du rôle");
        })
      );

      // Appel de la fonction d'envoi d'email si mot de passe par défaut
      if (newUser.useDefaultPassword) {
        await sendAccount(newUser.name, newUser.email);
      }

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
              useDefaultPassword,
            });
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input name="name" placeholder="Nom" required />
          <Input name="email" placeholder="Email" type="email" required />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="default-password"
              checked={useDefaultPassword}
              onCheckedChange={(val) => setUseDefaultPassword(Boolean(val))}
            />
            <Label htmlFor="default-password" className="cursor-pointer">
              Définir le mot de passe par défaut
            </Label>
          </div>
          {useDefaultPassword && (
            <div className="text-xs text-muted-foreground mb-2">
              Un email sera envoyé à l'utilisateur avec son mot de passe par défaut.
            </div>
          )}
          {!useDefaultPassword && (
            <Input name="password" placeholder="Mot de passe" type="password" required />
          )}

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

          {/* Message explicatif */}
          {useDefaultPassword && (
            <div className="text-xs text-muted-foreground">
              Un email sera envoyé à l'utilisateur avec ses informations de connexion.
            </div>
          )}

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
                  ajout en cours...
                </>
              ) : (
                <>
                {/* <PlusCircle className="mr-2 h-4 w-4" /> */}
                Ajouter
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};
