import { User } from "@/lib/interface";
import { CashRegisterSession } from "@/lib/interface";
import { RoleWithFullAccessCaisse, RoleStandart } from "../../RoleFullAcess";

/**
 * Vérifie si un utilisateur a un rôle avec accès complet
 */
function hasFullAccessRole(user: User | null): boolean {
  if (!user?.roles?.length) return false;
  
  return user.roles.some(role => 
    RoleWithFullAccessCaisse.some(
      fullAccessRole => 
        role.name.toLowerCase() === fullAccessRole.toLowerCase()
    )
  );
}

/**
 * Vérifie si un utilisateur a un rôle standard (Caisse)
 */
function hasCaisseRole(user: User | null): boolean {
  if (!user?.roles?.length) return false;
  
  return user.roles.some(role => 
    RoleStandart.some(
      standardRole => 
        role.name.toLowerCase() === standardRole.toLowerCase()
    )
  );
}

/**
 * Vérifie si un utilisateur peut accéder à une session de caisse spécifique
 * @param session - La session de caisse à vérifier
 * @param user - L'utilisateur connecté
 * @returns Un objet avec:
 * - canAccess: boolean - si l'utilisateur peut accéder
 * - isAuthorized: boolean - si l'utilisateur a les rôles nécessaires
 */
export function checkSessionAccess(
  session: CashRegisterSession | null,
  user: User | null
): { canAccess: boolean; isAuthorized: boolean } {
  // Vérifier si l'utilisateur est autorisé (a les rôles nécessaires)
  const isAuthorized = Boolean(user && (hasFullAccessRole(user) || hasCaisseRole(user)));
  
  // Si l'utilisateur n'est pas autorisé, refuser l'accès
  if (!isAuthorized) {
    return { canAccess: false, isAuthorized: false };
  }
  
  // Si l'utilisateur a un accès complet, autoriser l'accès
  if (hasFullAccessRole(user)) {
    return { canAccess: true, isAuthorized: true };
  }
  
  // Pour les utilisateurs avec rôle Caisse, vérifier qu'ils sont propriétaires de la session
  const isOwner = session?.user_id === user?.id;
  
  return {
    canAccess: isOwner,
    isAuthorized: true
  };
}

/**
 * Vérifie si un utilisateur peut accéder à la page de session
 * @param user - L'utilisateur connecté
 * @returns boolean - si l'utilisateur a les droits d'accès
 */
export function canAccessSessionPage(user: User | null): boolean {
  return Boolean(user && (hasFullAccessRole(user) || hasCaisseRole(user)));
}