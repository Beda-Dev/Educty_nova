import { User } from "@/lib/interface"
import { ValidationExpense } from "@/lib/interface"
import { RoleWithFullAccessCaisse } from "../../RoleFullAcess"

/**
 * Vérifie si un utilisateur a un rôle avec accès complet
 * @param user - Utilisateur à vérifier
 * @returns true si l'utilisateur a un rôle avec accès complet
 */
function hasFullAccessRole(user: User): boolean {
  if (!user.roles?.length) return false
  
  return user.roles.some(role => 
    RoleWithFullAccessCaisse.some(
      fullAccessRole => 
        role.name.toLowerCase() === fullAccessRole.toLowerCase()
    )
  )
}

/**
 * Filtre les validations en fonction du rôle de l'utilisateur
 * @param validations - Liste des validations à filtrer
 * @param userOnline - Utilisateur connecté
 * @returns Liste des validations filtrées
 */
export function filterValidationsByUserRole(
  validations: ValidationExpense[], 
  userOnline: User | null
): ValidationExpense[] {
  if (!userOnline) return []

  // Si l'utilisateur a un rôle avec accès complet, retourner toutes les validations
  if (hasFullAccessRole(userOnline)) {
    return [...validations]
  }

  // Sinon, ne retourner que les validations liées à l'utilisateur
  return validations.filter(validation => {
    // Vérifier si l'utilisateur est le validateur
    const isValidator = Number(validation.user_id) === Number(userOnline.id)
    
    // Vérifier si l'utilisateur est le demandeur
    const isApplicant = validation.demand?.applicant_id === userOnline.id
    
    return isValidator || isApplicant
  })
}