import { User } from "@/lib/interface";
import { CashRegisterSession } from "@/lib/interface";
import { RoleWithFullAccessCaisse , RoleStandart } from "../RoleFullAcess";

/**
 * Vérifie si un utilisateur a un rôle avec accès complet
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur a un rôle avec accès complet
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
 * Vérifie si un utilisateur a le rôle Caisse
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur a le rôle Caisse
 */
export function hasCaisseRole(user: User | null): boolean {
  if (!user?.roles?.length) return false;
  
  return user.roles.some(role => 
    role.name.toLowerCase() === RoleStandart[0].toLowerCase()
  );
}

/**
 * Filtre les sessions de caisse en fonction du rôle de l'utilisateur
 * @param sessions - Liste des sessions de caisse
 * @param userOnline - Utilisateur connecté
 * @returns Liste des sessions filtrées
 * @throws Error si l'utilisateur n'a pas les droits nécessaires
 */
export function filterSessionsByUserRole(
  sessions: CashRegisterSession[], 
  userOnline: User | null
): CashRegisterSession[] {
  // Vérifier si l'utilisateur a le droit d'accès
  if (!userOnline || (!hasFullAccessRole(userOnline) && !hasCaisseRole(userOnline))) {
    throw new Error("Accès non autorisé");
  }

  // Si l'utilisateur a un rôle avec accès complet, retourner toutes les sessions
  if (hasFullAccessRole(userOnline)) {
    return [...sessions];
  }

  // Sinon, ne retourner que les sessions de l'utilisateur
  return sessions.filter(session => 
    session.user_id === userOnline.id
  );
}

/**
 * Vérifie si l'utilisateur peut accéder à la page de gestion des sessions
 * @param userOnline - Utilisateur connecté
 * @returns true si l'utilisateur a les droits d'accès
 */
export function canAccessSessionsPage(userOnline: User | null): boolean {
  return Boolean(userOnline && (hasFullAccessRole(userOnline) || hasCaisseRole(userOnline)));
}