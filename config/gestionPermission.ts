import { User } from "@/lib/interface";
import { MenuItemProps } from "./menus";

export const hasPermission = (
  user: User | null,
  permissionName: string
): boolean => {
  if (!user) return false;

  return user.roles.some((role) =>
    role.permissions?.some(
      (perm) => perm.name.toLowerCase() === permissionName.toLowerCase()
    )
  );
};

export const hasRole = (user: User | null, roleName: string): boolean => {
  if (!user) return false;
  return user.roles.some(
    (role) => role.name.toLowerCase() === roleName.toLowerCase()
  );
};

export const shouldShowMenuItem = (
  user: User | null,
  item: MenuItemProps
): boolean => {
  // Si hideIf est true, cacher l'item
  if (item.hideIf) return false;

  // Vérifier le rôle requis
  if (item.requiredRole && !hasRole(user, item.requiredRole)) return false;

  // Vérifier la permission requise
  if (item.requiredPermission && !hasPermission(user, item.requiredPermission))
    return false;

  return true;
};
