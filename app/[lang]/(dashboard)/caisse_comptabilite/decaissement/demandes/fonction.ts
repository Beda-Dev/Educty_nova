import { User } from "@/lib/interface"
import { Demand } from "@/lib/interface"
import { RoleWithFullAccessCaisse, RoleStandart, STANDARD_ROLES_LOWERCASE, FULL_ACCESS_ROLES_LOWERCASE } from "../../RoleFullAcess"

/**
 * Filtre les demandes en fonction du rôle de l'utilisateur
 * @param demands - Liste des demandes à filtrer
 * @param userOnline - Utilisateur connecté
 * @returns Liste des demandes filtrées
 */
export function filterDemandsByUserRole(demands: Demand[], userOnline: User | null): Demand[] {
  if (!userOnline || !userOnline.roles) return []

  // Convertir les noms de rôles en minuscules pour la comparaison
  const userRoles = userOnline.roles.map(role => role.name.toLowerCase())

  // Vérifier si l'utilisateur a un rôle avec accès complet (case insensitive)
  const hasFullAccess = userRoles.some(role => 
    FULL_ACCESS_ROLES_LOWERCASE.includes(role.toLowerCase())
  )

  // Si l'utilisateur a un rôle avec accès complet, retourner toutes les demandes
  if (hasFullAccess) {
    return demands
  }

  // Vérifier si l'utilisateur a un rôle standard (Caisse)
  const isStandardUser = userRoles.some(role => 
    STANDARD_ROLES_LOWERCASE.includes(role.toLowerCase())
  )

  // Si l'utilisateur a un rôle standard, ne retourner que les demandes "en attente"
  if (isStandardUser) {
    return demands.filter(demand => 
      demand.status && demand.status.toLowerCase() === 'en attente'
    )
  }

  // Par défaut, ne retourner que les demandes de l'utilisateur connecté
  return demands.filter(demand => 
    demand.applicant_id && Number(demand.applicant_id) === Number(userOnline.id)
  )
}