import { DashBoard, UserGroup, Note2, fees, Payment, Settings, Docs } from "@/components/svg"
import type { User, Professor } from "@/lib/interface"

type AllowedMenu = "Dashboard" | "Students" | "Cash Register" | "Pedagogy" | "School Life"

export interface MenuItemProps {
  title: AllowedMenu // Utilisation du type AllowedMenu pour le titre
  icon?: any
  href?: string
  child?: MenuItemProps[]
  megaMenu?: MenuItemProps[]
  multi_menu?: MenuItemProps[]
  nested?: MenuItemProps[]
  items?: MenuItemProps[]
  onClick?: () => void
  isHeader?: boolean
  requiredPermission?: string // Ex: "voir dashboard"
  requiredRole?: string // Ex: "admin"
  hideIf?: boolean
  // Nouvelles propriétés pour le filtrage avancé
  allowedRoles?: string[] // Rôles autorisés à voir cet élément
  allowedPermissions?: string[] // Permissions autorisées
  professorOnly?: boolean // Visible uniquement pour les professeurs
  excludeForProfessor?: boolean // Masqué pour les professeurs
}

/**
 * Configuration des rôles et permissions par défaut
 * Permet une gestion centralisée et modulaire des accès
 */
export const MENU_ACCESS_CONFIG = {
  // Rôles système
  ROLES: {
    ADMIN: "Administrateur",
    PROFESSOR: "professeur",
    STUDENT: "eleve",
    CASHIER: "caissier",
    DIRECTOR: "directeur",
    SECRETARY: "secretaire",
    CENSEUR: "censeur",
    EDUCATEUR: "educateur",
  },

  // Permissions système
  PERMISSIONS: {
    VIEW_DASHBOARD: "voir dashboard",
    MANAGE_STUDENTS: "gerer eleves",
    MANAGE_FINANCES: "gerer finances",
    MANAGE_PEDAGOGY: "gerer pedagogie",
    MANAGE_SCHOOL_LIFE: "gerer vie scolaire",
    MANAGE_SETTINGS: "gerer parametres",
    MANAGE_INVENTORY: "gerer inventaire",
  },

  // Menus spécifiques aux professeurs
  PROFESSOR_ALLOWED_MENUS: ["Dashboard", "Pedagogy", "School Life", "Cash Register"] as AllowedMenu[],
  
  // Menus spécifiques aux caissiers
  CAISSE_ALLOWED_MENUS: ["Dashboard", "Students", "Cash Register"] as AllowedMenu[],

  // Menus spécifiques aux censeurs
  CENSEUR_ALLOWED_MENUS: ["Dashboard", "Students", "School Life", "Pedagogy" , "Cash Register"] as AllowedMenu[],

  // Menus spécifiques aux éducateurs
  EDUCATEUR_ALLOWED_MENUS: ["Dashboard", "Students", "School Life", "Cash Register"] as AllowedMenu[],


  // Rôles avec accès complet (administrateurs)
   FULL_ACCESS_ROLES: ["Administrateur", "directeur", "super-admin" , "Directeur"],
} as const

/**
 * Fonction utilitaire pour vérifier si un utilisateur est professeur
 * @param userOnline - Utilisateur connecté
 * @param professors - Liste des professeurs
 * @returns boolean
 */
export const isProfessor = (userOnline: User | null, professors: Professor[] = []): boolean => {
  if (!userOnline) return false

  // Vérification par correspondance user_id dans la table professor
  const professorRecord = professors.find((prof) => prof.user_id === userOnline.id)

  // Vérification par rôle (fallback)
  const hasTeacherRole = userOnline.roles?.some(
    (role) =>
      role.name.toLowerCase().includes("professeur") ||
      role.name.toLowerCase().includes("enseignant") ||
      role.name.toLowerCase().includes("teacher"),
  )

  return !!professorRecord || hasTeacherRole
}

/**
 * Fonction utilitaire pour vérifier si un utilisateur a le rôle "Caisse"
 * @param userOnline - Utilisateur connecté
 * @returns boolean
 */
export const isCaissier = (userOnline: User | null): boolean => {
  if (!userOnline) return false
  
  return userOnline.roles?.some(
    (role) => role.name.toLowerCase() === "caisse" || role.name.toLowerCase() === "comptable"
  ) || false
}

/**
 * Fonction utilitaire pour vérifier si un utilisateur est censeur
 * @param userOnline - Utilisateur connecté
 * @returns boolean
 */
export const isCenseur = (userOnline: User | null): boolean => {
  if (!userOnline) return false
  
  return userOnline.roles?.some(
    (role) => role.name.toLowerCase() === "censeur" || role.name.toLowerCase() === "censure"
  ) || false
}

/**
 * Fonction utilitaire pour vérifier si un utilisateur est éducateur
 * @param userOnline - Utilisateur connecté
 * @returns boolean
 */
export const isEducateur = (userOnline: User | null): boolean => {
  if (!userOnline) return false
  
  return userOnline.roles?.some(
    (role) => role.name.toLowerCase() === "educateur" || role.name.toLowerCase() === "éducateur"
  ) || false
}

/**
 * Fonction utilitaire pour vérifier les permissions d'accès à un menu
 * @param item - Élément de menu
 * @param userOnline - Utilisateur connecté
 * @param professors - Liste des professeurs
 * @returns boolean
 */
export const hasMenuAccess = (item: MenuItemProps, userOnline: User | null, professors: Professor[] = []): boolean => {
  if (!userOnline || !item) return false

  // Les headers sont toujours autorisés (ils seront filtrés plus tard selon le contexte)
  if (item.isHeader) return true

  const isUserProfessor = isProfessor(userOnline, professors)
  const isUserCaissier = isCaissier(userOnline)
  const userRoles = userOnline.roles?.map((role) => role.name.toLowerCase()) || []
  const userPermissions = userOnline.permissionNames || []

  // Si l'utilisateur est caissier, n'afficher que les menus autorisés
  if (isUserCaissier) {
    return MENU_ACCESS_CONFIG.CAISSE_ALLOWED_MENUS.includes(item.title as AllowedMenu)
  }

  // Si l'utilisateur a un rôle avec accès complet, autoriser tout sauf les exclusions spécifiques
  const hasFullAccess = MENU_ACCESS_CONFIG.FULL_ACCESS_ROLES.some((role) => userRoles.includes(role.toLowerCase()))

  // Vérification spécifique pour les professeurs
  if (isUserProfessor) {
    // Si le menu est exclu pour les professeurs
    if (item.excludeForProfessor) return false

    // Si le menu est dans la liste autorisée pour les professeurs, l'autoriser directement
    if (MENU_ACCESS_CONFIG.PROFESSOR_ALLOWED_MENUS.includes(item.title)) {
      return true // ✅ Accès direct pour les menus autorisés aux professeurs
    }

    // Si le menu n'est pas dans la liste autorisée pour les professeurs
    return false
  }

  // Pour les non-professeurs, vérifications standards
  // Vérification des rôles autorisés
  if (item.allowedRoles && item.allowedRoles.length > 0) {
    const hasAllowedRole = item.allowedRoles.some((role) => userRoles.includes(role.toLowerCase()))
    if (!hasAllowedRole && !hasFullAccess) return false
  }

  // Vérification des permissions autorisées
  if (item.allowedPermissions && item.allowedPermissions.length > 0) {
    const hasAllowedPermission = item.allowedPermissions.some((permission) => userPermissions.includes(permission))
    if (!hasAllowedPermission && !hasFullAccess) return false
  }

  // Vérification de la permission requise (legacy)
  if (item.requiredPermission && !userPermissions.includes(item.requiredPermission) && !hasFullAccess) {
    return false
  }

  // Vérification du rôle requis (legacy)
  if (item.requiredRole && !userRoles.includes(item.requiredRole.toLowerCase()) && !hasFullAccess) {
    return false
  }

  // Vérification si le menu est réservé aux professeurs uniquement
  if (item.professorOnly && !isUserProfessor) {
    return false
  }

  // Vérification de la condition hideIf
  if (item.hideIf) return false

  return true
}

/**
 * Fonction pour filtrer récursivement les éléments de menu
 * Inclut une logique intelligente pour les headers
 * @param items - Éléments de menu à filtrer
 * @param userOnline - Utilisateur connecté
 * @param professors - Liste des professeurs
 * @returns MenuItemProps[] - Éléments filtrés
 */
export const filterMenuItems = (
  items: MenuItemProps[],
  userOnline: User | null,
  professors: Professor[] = [],
): MenuItemProps[] => {
  if (!items || !userOnline) return []

  // Première passe : filtrer les éléments selon les permissions
  const filteredItems = items
    .filter((item) => hasMenuAccess(item, userOnline, professors))
    .map((item) => ({
      ...item,
      // Filtrage récursif des sous-menus
      child: item.child ? filterMenuItems(item.child, userOnline, professors) : undefined,
      multi_menu: item.multi_menu ? filterMenuItems(item.multi_menu, userOnline, professors) : undefined,
      nested: item.nested ? filterMenuItems(item.nested, userOnline, professors) : undefined,
      items: item.items ? filterMenuItems(item.items, userOnline, professors) : undefined,
    }))
    .filter((item) => {
      // Supprimer les éléments qui n'ont plus d'enfants après filtrage
      if (item.child && item.child.length === 0) return false
      if (item.multi_menu && item.multi_menu.length === 0) return false
      if (item.nested && item.nested.length === 0) return false
      if (item.items && item.items.length === 0) return false
      return true
    })

  // Deuxième passe : filtrer les headers orphelins
  const finalItems: MenuItemProps[] = []

  for (let i = 0; i < filteredItems.length; i++) {
    const currentItem = filteredItems[i]

    if (currentItem.isHeader) {
      // Vérifier s'il y a des éléments non-header après ce header
      const hasNonHeaderAfter = filteredItems.slice(i + 1).some((item) => !item.isHeader)

      // Ajouter le header seulement s'il y a des éléments après lui
      if (hasNonHeaderAfter) {
        finalItems.push(currentItem)
      }
    } else {
      // Ajouter les éléments non-header
      finalItems.push(currentItem)
    }
  }

  return finalItems
}

/**
 * Configuration des menus avec permissions et rôles
 */
export const menusConfig = {
  mainNav: [
    {
      isHeader: true,
      title: "Menu",
    },
    {
      title: "Dashboard",
      icon: DashBoard,
      href: "/dashboard",
      allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.VIEW_DASHBOARD],
      // Accessible à tous les rôles connectés
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/parametres",
      allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_SETTINGS],
      allowedRoles: [MENU_ACCESS_CONFIG.ROLES.ADMIN, MENU_ACCESS_CONFIG.ROLES.DIRECTOR],
      excludeForProfessor: true, // Les professeurs ne peuvent pas accéder aux paramètres
    },
    {
      title: "Students",
      icon: UserGroup,
      href: "/eleves",
      allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_STUDENTS],
      allowedRoles: [
        MENU_ACCESS_CONFIG.ROLES.ADMIN,
        MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
        MENU_ACCESS_CONFIG.ROLES.SECRETARY,
        MENU_ACCESS_CONFIG.ROLES.CENSEUR,
        MENU_ACCESS_CONFIG.ROLES.EDUCATEUR,

      ],
      excludeForProfessor: true,
    },
    {
      title: "Cash Register",
      icon: Payment,
      href: "/caisse_comptabilite",
      allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_FINANCES],
      // Supprimer excludeForProfessor et allowedRoles pour rendre accessible à tous
    },
    {
      title: "School Life",
      icon: fees,
      href: "/vie_scolaire",
      allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_SCHOOL_LIFE],
      allowedRoles: [
        MENU_ACCESS_CONFIG.ROLES.ADMIN,
        MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
        MENU_ACCESS_CONFIG.ROLES.PROFESSOR,
        MENU_ACCESS_CONFIG.ROLES.SECRETARY,
        MENU_ACCESS_CONFIG.ROLES.CENSEUR,
        MENU_ACCESS_CONFIG.ROLES.EDUCATEUR,
      ],
      // Accessible aux professeurs
    },
    {
      title: "Pedagogy",
      icon: Docs,
      href: "/pedagogie",
      allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_PEDAGOGY],
      allowedRoles: [
        MENU_ACCESS_CONFIG.ROLES.ADMIN,
        MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
        MENU_ACCESS_CONFIG.ROLES.PROFESSOR,
        MENU_ACCESS_CONFIG.ROLES.CENSEUR
      ],
      // Accessible aux professeurs
    },
    // {
    //   title: "Inventory",
    //   icon: Note2,
    //   href: "/inventaire",
    //   allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_INVENTORY],
    //   allowedRoles: [MENU_ACCESS_CONFIG.ROLES.ADMIN, MENU_ACCESS_CONFIG.ROLES.DIRECTOR],
    //   excludeForProfessor: true,
    // },
  ],

  sidebarNav: {
    modern: [
      {
        isHeader: true,
        title: "Menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.VIEW_DASHBOARD],
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/parametres",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_SETTINGS],
        allowedRoles: [MENU_ACCESS_CONFIG.ROLES.ADMIN, MENU_ACCESS_CONFIG.ROLES.DIRECTOR],
        excludeForProfessor: true,
      },
      {
        title: "Students",
        icon: UserGroup,
        href: "/eleves",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_STUDENTS],
        allowedRoles: [
          MENU_ACCESS_CONFIG.ROLES.ADMIN,
          MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
          MENU_ACCESS_CONFIG.ROLES.SECRETARY,
          MENU_ACCESS_CONFIG.ROLES.CENSEUR,
          MENU_ACCESS_CONFIG.ROLES.EDUCATEUR,
        ],
        excludeForProfessor: true,
      },
      {
        title: "Cash Register",
        icon: Payment,
        href: "/caisse_comptabilite",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_FINANCES],
        // Accessible à tous les rôles
      },
      {
        title: "School Life",
        icon: fees,
        href: "/vie_scolaire",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_SCHOOL_LIFE],
        allowedRoles: [
          MENU_ACCESS_CONFIG.ROLES.ADMIN,
          MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
          MENU_ACCESS_CONFIG.ROLES.PROFESSOR,
          MENU_ACCESS_CONFIG.ROLES.SECRETARY,
          MENU_ACCESS_CONFIG.ROLES.CENSEUR,
          MENU_ACCESS_CONFIG.ROLES.EDUCATEUR,
        ],
      },
      {
        title: "Pedagogy",
        icon: Docs,
        href: "/pedagogie",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_PEDAGOGY],
        allowedRoles: [
          MENU_ACCESS_CONFIG.ROLES.ADMIN,
          MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
          MENU_ACCESS_CONFIG.ROLES.PROFESSOR,
          MENU_ACCESS_CONFIG.ROLES.CENSEUR,
          
        ],
      },
      // {
      //   title: "Inventory",
      //   icon: Note2,
      //   href: "/inventaire",
      //   allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_INVENTORY],
      //   allowedRoles: [MENU_ACCESS_CONFIG.ROLES.ADMIN, MENU_ACCESS_CONFIG.ROLES.DIRECTOR],
      //   excludeForProfessor: true,
      // },
    ],

    classic: [
      {
        isHeader: true,
        title: "Menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.VIEW_DASHBOARD],
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/parametres",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_SETTINGS],
        allowedRoles: [MENU_ACCESS_CONFIG.ROLES.ADMIN, MENU_ACCESS_CONFIG.ROLES.DIRECTOR],
        excludeForProfessor: true,
      },
      {
        title: "Students",
        icon: UserGroup,
        href: "/eleves",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_STUDENTS],
        allowedRoles: [
          MENU_ACCESS_CONFIG.ROLES.ADMIN,
          MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
          MENU_ACCESS_CONFIG.ROLES.SECRETARY,
          MENU_ACCESS_CONFIG.ROLES.CENSEUR,
          MENU_ACCESS_CONFIG.ROLES.EDUCATEUR,
        ],
        excludeForProfessor: true,
      },
      {
        title: "Cash Register",
        icon: Payment,
        href: "/caisse_comptabilite",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_FINANCES],
        // Accessible à tous les rôles
      },
      {
        title: "School Life",
        icon: fees,
        href: "/vie_scolaire",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_SCHOOL_LIFE],
        allowedRoles: [
          MENU_ACCESS_CONFIG.ROLES.ADMIN,
          MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
          MENU_ACCESS_CONFIG.ROLES.PROFESSOR,
          MENU_ACCESS_CONFIG.ROLES.SECRETARY,
          MENU_ACCESS_CONFIG.ROLES.CENSEUR,
          MENU_ACCESS_CONFIG.ROLES.EDUCATEUR,
        ],
      },
      {
        title: "Pedagogy",
        icon: Docs,
        href: "/pedagogie",
        allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_PEDAGOGY],
        allowedRoles: [
          MENU_ACCESS_CONFIG.ROLES.ADMIN,
          MENU_ACCESS_CONFIG.ROLES.DIRECTOR,
          MENU_ACCESS_CONFIG.ROLES.PROFESSOR,
          MENU_ACCESS_CONFIG.ROLES.CENSEUR,
          MENU_ACCESS_CONFIG.ROLES.EDUCATEUR,
        ],
      },
      // {
      //   title: "Inventory",
      //   icon: Note2,
      //   href: "/inventaire",
      //   allowedPermissions: [MENU_ACCESS_CONFIG.PERMISSIONS.MANAGE_INVENTORY],
      //   allowedRoles: [MENU_ACCESS_CONFIG.ROLES.ADMIN, MENU_ACCESS_CONFIG.ROLES.DIRECTOR],
      //   excludeForProfessor: true,
      // },
    ],
  },
}

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]
export const FULL_ACCESS_ROLES = MENU_ACCESS_CONFIG.FULL_ACCESS_ROLES

