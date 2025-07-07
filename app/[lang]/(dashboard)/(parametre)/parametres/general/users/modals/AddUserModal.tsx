"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image as ImageIcon, Loader2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
import Select, { components, MultiValue, SingleValue } from "react-select";
import makeAnimated from "react-select/animated";
import { Icon } from "@iconify/react";
import { Role } from "@/lib/interface";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { sendAccountInfo } from "@/lib/fonction";
import { useSchoolStore } from "@/store";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddUserModalProps {
  roles: Role[];
  onSuccess: () => void;
}

type SelectOption = { value: string; label: string };
type HierarchicalOption = { value: string | number; label: string };

// Schema de validation avec Zod
const userSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
  roles: z.array(z.string()).min(1, "Au moins un rôle doit être sélectionné"),
  hierarchical_id: z.union([z.string(), z.number()]).optional(),
  avatar: z.instanceof(File).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const IMAGE_MIME_TYPES = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [useDefaultPassword, setUseDefaultPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { users } = useSchoolStore();
  const animatedComponents = makeAnimated();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      roles: [],
    },
  });

  const selectedRoles = watch("roles");
  const selectedHierarchical = watch("hierarchical_id");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setValue("avatar", file, { shouldValidate: true });
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: IMAGE_MIME_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
  });

  const removeAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setValue("avatar", undefined, { shouldValidate: true });
    setAvatarPreview(null);
  };

  const hierarchicalOptions = users?.map(user => ({
    value: user.id,
    label: user.name
  })) || [];

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

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setIsUploading(true);

    try {
      const passwordToUse = useDefaultPassword
        ? process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || ''
        : data.password || '';

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', passwordToUse);
      
      if (data.hierarchical_id) {
        formData.append('hierarchical_id', data.hierarchical_id.toString());
      }
      
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await fetch("/api/user", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Échec de la création");

      const createdUser = await response.json();

      await Promise.all(
        data.roles.map(async (roleName) => {
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

      if (useDefaultPassword) {
        await sendAccount(data.name, data.email);
      }

      toast({
        title: "Succès",
        description: "Utilisateur ajouté avec succès !",
      });
      onSuccess();
      reset();
      setAvatarPreview(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        color: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création.",
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <Dialog  open={isOpen} onOpenChange={setIsOpen} >
      <DialogTrigger asChild>
        <Button color="indigodye" className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Ajouter un utilisateur
        </Button>
      </DialogTrigger>

      <DialogContent size="4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ajouter un utilisateur</DialogTitle>
        </DialogHeader>

        <motion.form
          className="space-y-4 pt-2"
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          encType="multipart/form-data"
        >
          <div>
            <Label htmlFor="name">Nom complet*</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nom complet"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Email"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo de profil (optionnel)</Label>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
                errors.avatar ? "border-destructive" : ""
              )}
            >
              <input {...getInputProps()} />
              {avatarPreview ? (
                <div className="relative group">
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden">
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAvatar();
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? (
                      "Déposez l'image ici..."
                    ) : (
                      <>
                        Glissez-déposez une image ici, ou cliquez pour sélectionner
                        <br />
                        <span className="text-xs">Formats acceptés : JPG, PNG, GIF, SVG (max 10 Mo)</span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
            {fileRejections.length > 0 && (
              <p className="text-sm text-destructive">
                {fileRejections[0].errors[0].code === "file-too-large"
                  ? "Le fichier est trop volumineux (max 10 Mo)"
                  : "Format de fichier non supporté"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="hierarchical">Supérieur hiérarchique (optionnel)</Label>
            <Select<HierarchicalOption>
              id="hierarchical"
              options={hierarchicalOptions}
              value={hierarchicalOptions.find(opt => opt.value === selectedHierarchical) || null}
              onChange={(selected: SingleValue<HierarchicalOption>) => 
                setValue("hierarchical_id", selected?.value || "", { shouldValidate: true })
              }
              className="react-select"
              classNamePrefix="select"
              placeholder="Sélectionner un supérieur hiérarchique..."
              noOptionsMessage={() => "Aucun utilisateur disponible"}
              isClearable
            />
          </div>

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
            <div>
              <Label htmlFor="password">Mot de passe*</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Mot de passe"
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="roles">Rôles*</Label>
            <Select<SelectOption, true>
              id="roles"
              isMulti
              options={roleOptions}
              value={roleOptions.filter(opt => selectedRoles.includes(opt.value))}
              onChange={(selected: MultiValue<SelectOption>) => 
                setValue("roles", selected.map(opt => opt.value), { shouldValidate: true })
              }
              components={{ ...animatedComponents, Option: CustomOption }}
              className="react-select"
              classNamePrefix="select"
              placeholder="Sélectionner des rôles..."
              noOptionsMessage={() => "Aucun rôle disponible"}
              closeMenuOnSelect={false}
            />
            {errors.roles && (
              <p className="text-sm text-destructive mt-1">{errors.roles.message}</p>
            )}
          </div>

          <div className="flex justify-around gap-3 pt-4">
            <DialogClose asChild>
              <Button
              color="destructive"
                type="button"
                disabled={isLoading}
                onClick={() => {
                  reset();
                  setAvatarPreview(null);
                }}
              >
                Annuler
              </Button>
            </DialogClose>

            <Button type="submit" color="indigodye" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                "Ajouter l'utilisateur"
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};