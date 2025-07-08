import { User } from "@/lib/interface";
import { MenuItemProps } from "./menus";
import { useSchoolStore } from "@/store";

/**
 * Vérifie si un utilisateur possède une permission spécifique
 * @param user L'utilisateur à vérifier
 * @param permissionName Le nom de la permission à vérifier (case insensitive)
 * @param exactMatch Si true, vérifie la correspondance exacte du nom de permission
 * @returns boolean - True si l'utilisateur a la permission, false sinon
 */
export const hasPermission = (
  user: User | null | undefined,
  permissionName: string,
  exactMatch: boolean = true
): boolean => {
  const { roles, permissions: globalPermissions } = useSchoolStore();

  // Cas où l'utilisateur n'est pas défini
  if (!user) return false;

  // Vérification des permissions directes de l'utilisateur
  const hasDirectPermission = user.permissions?.some(perm => 
    exactMatch 
      ? perm.name.toLowerCase() === permissionName.toLowerCase()
      : perm.name.toLowerCase().includes(permissionName.toLowerCase())
  );

  if (hasDirectPermission) return true;

  // Vérification des permissions via les rôles
  const hasPermissionViaRoles = user.roles?.some(role => {
    // Trouver le rôle complet dans le store
    const fullRole = roles.find(r => Number(r.id) === Number(role.id));
    
    // Vérifier si le rôle a la permission
    const roleHasPermission = fullRole?.permissions?.some(perm => 
      exactMatch 
        ? perm.name.toLowerCase() === permissionName.toLowerCase()
        : perm.name.toLowerCase().includes(permissionName.toLowerCase())
    );

    return roleHasPermission;
  });

  if (hasPermissionViaRoles) return true;

  // Vérification des permissions globales (si nécessaire)
  const hasGlobalPermission = globalPermissions.some(perm => 
    exactMatch 
      ? perm.name.toLowerCase() === permissionName.toLowerCase()
      : perm.name.toLowerCase().includes(permissionName.toLowerCase())
  );

  return hasGlobalPermission;
};

// Version memoized pour optimiser les performances dans les composants
// export const memoizedHasPermission = memoize(hasPermission);

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
