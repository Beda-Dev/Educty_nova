import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store";
import { comparaisonChaine } from "./fonction";
import {
  checkAndAssignPermission,
  fetchWithRetry,
} from "./verificationPermissionTofetch";
import { getFlatPermissions } from "./obtentionPermission";
import {
  fetchRoles,
  fetchPermissions,
  fetchUsers,
} from "@/store/schoolservice";
import { mergeUserPermissions } from "@/lib/fonction";
import type {
  Permission,
  PermissionsTableProps,
  FlatPermission,
} from "./types";
import { User } from "@/lib/interface";

export const usePermissionsLogic = ({
  permissionsTab,
  roleId,
  role,
}: PermissionsTableProps) => {
  const router = useRouter();
  const {
    permissions,
    setRoles,
    setPermission,
    setUserOnline,
    setUsers,
    userOnline,
  } = useSchoolStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >({});
  const [allSelected, setAllSelected] = useState(false);

  const flatPermissions = useMemo(
    () => getFlatPermissions(permissionsTab),
    [permissionsTab]
  );

  useEffect(() => {
    if (role?.permissions) {
      const initialPermissions = flatPermissions.reduce((acc, perm) => {
        const isChecked = role.permissions?.some((p) =>
          comparaisonChaine(p.name, perm.name)
        );
        return { ...acc, [perm.id]: isChecked ?? false };
      }, {});
      setSelectedPermissions(initialPermissions);
    }
  }, [role?.permissions, flatPermissions]);

  const handleSwitchChange = useCallback((permissionId: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  }, []);

  const toggleSelectAll = useCallback(() => {
    const newSelectedPermissions = flatPermissions.reduce((acc, perm) => {
      acc[perm.id] = !allSelected;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedPermissions(newSelectedPermissions);
    setAllSelected(!allSelected);
  }, [flatPermissions, allSelected]);

  const handleBack = useCallback(() => {
    router.push("/roles");
  }, [router]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const changedPermissions = flatPermissions.filter((perm) => {
        const wasActive = role.permissions?.some((p) =>
          comparaisonChaine(p.name, perm.name)
        );
        const nowActive = selectedPermissions[perm.id];
        return wasActive !== nowActive;
      });

      if (changedPermissions.length === 0) {
        toast({ title: "Info", description: "Aucune modification détectée" });
        return;
      }

      // Préparer les permissions à ajouter et supprimer
      const permissionsToAdd = changedPermissions
        .filter((perm) => selectedPermissions[perm.id])
        .map((perm) => perm.name);

      const permissionsToRemove = changedPermissions
        .filter((perm) => !selectedPermissions[perm.id])
        .map((perm) => perm.name);

      // Vérifier et créer les permissions manquantes en une seule fois
      const checkAndCreatePermissions = async () => {
        const permissionsToCheck = permissionsToAdd.filter(
          (permName) => !permissions.some((p) => comparaisonChaine(p.name, permName))
        );

        if (permissionsToCheck.length > 0) {
          await Promise.all(
            permissionsToCheck.map((permName) =>
              checkAndAssignPermission(permName, permissions, setPermission)
            )
          );
        }
      };

      await checkAndCreatePermissions();

      // Envoyer les requêtes en une seule fois
      const requests = [];

      if (permissionsToRemove.length > 0) {
        requests.push(
          fetchWithRetry(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role/${roleId}/revokePermissionTo`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ permission: permissionsToRemove }),
            }
          )
        );
      }

      if (permissionsToAdd.length > 0) {
        requests.push(
          fetchWithRetry(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/role/${roleId}/givePermissionTo`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ permission: permissionsToAdd }),
            }
          )
        );
      }

      await Promise.all(requests);

      toast({
        title: "Succès",
        description: "Les permissions ont été mises à jour.",
      });

      // Rafraîchir les données
      const [updatedRoles, updatedPermissions, updatedUsers] =
        await Promise.all([fetchRoles(), fetchPermissions(), fetchUsers()]);

      setRoles(updatedRoles);
      setPermission(updatedPermissions);
      setUsers(updatedUsers);

      const findUser: User | undefined = userOnline
        ? updatedUsers.find((user: User) => user.id === userOnline.id)
        : undefined;

      if (findUser) {
        const userConnected = mergeUserPermissions(
          findUser,
          updatedRoles,
          updatedPermissions
        );
        setUserOnline(userConnected);
      }

      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    flatPermissions,
    selectedPermissions,
    role,
    roleId,
    permissions,
    setPermission,
    setRoles,
    setUserOnline,
    setUsers,
    userOnline,
    router,
  ]);

  return {
    isSubmitting,
    selectedPermissions,
    flatPermissions,
    handleSwitchChange,
    toggleSelectAll,
    handleBack,
    handleSubmit,
    allSelected,
  };
};