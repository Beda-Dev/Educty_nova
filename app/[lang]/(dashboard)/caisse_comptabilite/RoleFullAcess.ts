export const RoleWithFullAccessCaisse = ["Administrateur", "Comptable", "Directeur"]
export const RoleStandart = ['Caisse']

// Constantes pour la gestion des sessions
export const STANDARD_ROLES_LOWERCASE = RoleStandart.map(role => role.toLowerCase());
export const FULL_ACCESS_ROLES_LOWERCASE = RoleWithFullAccessCaisse.map(role => role.toLowerCase());