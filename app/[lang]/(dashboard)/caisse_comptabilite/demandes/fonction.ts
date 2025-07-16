import { User } from "@/lib/interface"
import { Demand } from "@/lib/interface"
import {RoleWithFullAccessCaisse} from "../RoleFullAcess"

/**
 * Filtre les demandes en fonction du rôle de l'utilisateur
 * @param demands - Liste des demandes à filtrer
 * @param userOnline - Utilisateur connecté
 * @returns Liste des demandes filtrées
 */
export function filterDemandsByUserRole(demands: Demand[], userOnline: User | null): Demand[] {
  if (!userOnline) return []

  // Vérifier si l'utilisateur a un des rôles spéciaux
  const hasAdminRole = userOnline.roles?.some(role => 
    RoleWithFullAccessCaisse.includes(role.name)
  )

  // Si l'utilisateur a un rôle spécial, retourner toutes les demandes
  if (hasAdminRole) {
    return demands
  }

  // Sinon, ne retourner que les demandes de l'utilisateur connecté
  return demands.filter(demand => Number(demand.applicant_id) === Number(userOnline.id))
}