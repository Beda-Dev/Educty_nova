"use client"

import { useRouter, useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { RoleWithFullAccessCaisse , RoleStandart } from "@/app/[lang]/(dashboard)/caisse_comptabilite/RoleFullAcess"
import { useSchoolStore } from "@/store/index"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings,
  BookOpen,
  School,
  Users,
  Calendar,
  Layers,
  DollarSign,
  FileText,
  Briefcase,
  UserCog,
  Warehouse,
  Package,
  RefreshCw,
  User,
  Book,
  Clock,
  ClipboardList,
  ChevronDown,
  Calculator,
  Mail,
  Home,
  CreditCard,
  List,
  Tags,
  CalendarCheck,
  CheckCircle,
  Clipboard,
  UserPlus,
  UserCheck,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react"
import React, { useEffect, useState, useRef } from "react"
import { forwardRef } from "react"

const MenuTrigger = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    onMouseEnter: () => void
    onMouseLeave: () => void
  }>
>(({ children, onMouseEnter, onMouseLeave }, ref) => (
  <motion.div
    ref={ref}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    initial={{ scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className="relative"
  >
    {children}
  </motion.div>
))
MenuTrigger.displayName = "MenuTrigger"

type MenuItem = {
  id: string
  title: string
  icon: React.ReactNode
  path: string
  description?: string
  children?: MenuItem[]
  hidden?: boolean
}

type MenuCategory = {
  parametres: MenuItem[]
  inventaire: MenuItem[]
  eleves: MenuItem[]
  caisse_comptabilite: MenuItem[]
  pedagogie: MenuItem[]
  vie_scolaire: MenuItem[]
}

type MenuKey = "caisse_comptabilite" | "eleves" | "parametres" | "pedagogie" | "inventaire" | "vie_scolaire"

const menuItems: MenuCategory = {
  parametres: [
    {
      id: "general",
      title: "Généraux",
      icon: <Settings className="w-4 h-4" />,
      path: "/parametres/general",
      children: [
        {
          id: "users",
          title: "Utilisateurs",
          description: "Gérer les utilisateurs",
          icon: <Users className="w-4 h-4" />,
          path: "/parametres/general/users",
        },
      ],
    },
    {
      id: "pedagogy",
      title: "Pédagogie",
      icon: <BookOpen className="w-4 h-4" />,
      path: "/parametres/pedagogy",
      children: [
        {
          id: "academic-year",
          title: "Année academique",
          description: "Année scolaire",
          icon: <Calendar className="w-4 h-4" />,
          path: "/parametres/pedagogy/academic_year",
        },
        {
          id: "levels",
          title: "Niveaux",
          description: "Niveaux d'études",
          icon: <Layers className="w-4 h-4" />,
          path: "/parametres/pedagogy/level",
        },
        {
          id: "classes",
          title: "Classes",
          description: "Gestion des classes",
          icon: <School className="w-4 h-4" />,
          path: "/parametres/pedagogy/classe",
        },
        {
          id: "matiere",
          title: "Matières",
          description: "Gestion des différentes matières enseignées",
          icon: <Book className="w-6 h-6" />,
          path: "/parametres/pedagogy/matieres",
        },
        {
          id: "type_evaluation",
          title: "Types d'évaluation",
          description: "Gestion des types d'évaluation",
          icon: <Clipboard className="w-6 h-6" />,
          path: "/parametres/pedagogy/type_evaluation",
        },
        {
          id: "type_period",
          title: "Types de Périodes",
          description: "Gestion des types de périodes académiques",
          icon: <Calendar className="w-6 h-6" />,
          path: "/parametres/pedagogy/type_period",
        },
        {
          id: "periodes",
          title: "Periodes",
          description: "Gestion des periodes academique",
          icon: <Calendar className="w-6 h-6" />,
          path: "/parametres/pedagogy/periodes",
        },
        {
          id: "serie",
          title: "Séries",
          description: "Gestion des séries",
          icon: <LayoutGrid className="w-6 h-6" />,
          path: "/parametres/pedagogy/serie",
        },
      ],
    },
    {
      id: "scolarite",
      title: "Scolarité",
      icon: <School className="w-4 h-4" />,
      path: "/parametres/scolarite",
      children: [
        {
          id: "documents",
          title: "Documents",
          description: "Gestion des types de documents et pièces justificatives",
          icon: <FileText className="w-4 h-4" />,
          path: "/parametres/scolarite/type_document",
        },
        {
          id: "fees_type",
          title: "Types de frais",
          description: "Gestion des différents types de frais scolaires",
          icon: <List className="w-6 h-6" />,
          path: "/parametres/scolarite/fees_type",
        },
        {
          id: "pricing",
          title: "Tarification",
          description: "Gestion des tarifs et montants des frais",
          icon: <Tags className="w-6 h-6" />,
          path: "parametres/scolarite/pricing",
        },
      ],
    },
    {
      id: "administration",
      title: "Admin",
      icon: <Users className="w-4 h-4" />,
      path: "/parametres/administration",
      children: [
        {
          id: "roles",
          title: "Fonctions",
          description: "Rôles du personnel",
          icon: <Briefcase className="w-4 h-4" />,
          path: "/parametres/administration/fonctions",
        },
        {
          id: "employees",
          title: "Employés",
          description: "Gérer le personnel",
          icon: <UserCog className="w-4 h-4" />,
          path: "/parametres/administration/employes",
        },
        {
          id: "professors",
          title: "Enseignants",
          description: "Gérer les professeurs",
          icon: <UserCog className="w-4 h-4" />,
          path: "/parametres/administration/professeur",
        },
      ],
    },
    {
      id: "caisse",
      title: "Caisse",
      icon: <DollarSign className="w-4 h-4" />,
      path: "/parametres/caisse",
      children: [
        {
          id: "caisses",
          title: "Caisses d'enregitrement",
          path: "/parametres/caisse/caisses_enregistrement",
          icon: <Warehouse className="w-4 h-4" />,
        },
        {
          id: "type_depense",
          title: "Type de dépense",
          path: "/parametres/caisse/type_depense",
          icon: <ClipboardList className="w-4 h-4" />,
        },
        {
          id: "payment-methods",
          title: "Méthodes de Paiement",
          path: "/parametres/caisse/methodes_paiement",
          icon: <CreditCard className="w-6 h-6" />,
        }
      ],
    },
  ],
  inventaire: [
    {
      id: "entrepots",
      title: "Entrepôts",
      path: "/inventaire/entrepots",
      icon: <Warehouse className="w-4 h-4" />,
      children: [],
    },
    {
      id: "produits",
      title: "Produits",
      path: "/inventaire/produits",
      icon: <Package className="w-4 h-4" />,
      children: [],
    },
    {
      id: "operations",
      title: "Opérations",
      path: "/inventaire/operations",
      icon: <RefreshCw className="w-4 h-4" />,
      children: [],
    },
  ],
  eleves: [
    {
      id: "inscription",
      title: "Inscription",
      path: "/eleves/registration",
      icon: <User className="w-4 h-4" />,
      children: [
        {
          id: "new-registration",
          title: "Nouvelle inscription",
          path: "/eleves/registration/new_registration",
          icon: <UserPlus className="w-4 h-4" />,
        },
        {
          id: "re-registration",
          title: "Re-inscription",
          path: "/eleves/registration/re-registration",
          icon: <UserCheck className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "eleves-inscrits",
      title: "Élèves inscrits",
      path: "/eleves/students",
      icon: <Users className="w-4 h-4" />,
      children: [],
    },
    {
      id: "Historique-inscription",
      title: "Historique inscription",
      path: "/eleves/historique",
      icon: <Book className="w-4 h-4" />,
      children: [],
    },
    {
      id: "Historique-documents",
      title: "Historique documents",
      path: "/eleves/documents",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
  ],
  caisse_comptabilite: [
    {
      id: "encaissement",
      title: "Encaissement",
      path: "/caisse_comptabilite/encaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "paiement",
          title: "Paiement",
          path: "/caisse_comptabilite/encaissement/paiement",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "historique_paiement",
          title: "Historique Paiement",
          path: "/caisse_comptabilite/encaissement/historique_paiement",
          icon: <Clock className="w-4 h-4" />,
        }

      ],
    },
    {
      id: "decaissement",
      title: "Décaissement",
      path: "/caisse_comptabilite/decaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "depense",
          title: "Dépense",
          path: "/caisse_comptabilite/decaissement/depense",
          icon: <DollarSign className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "sessions",
      title: "Sessions de caisse",
      icon: <Clock className="w-6 h-6" />,
      path: "/caisse_comptabilite/session_caisse",
      children: [
        {
          id: "close_session",
          title: "fermeture caisse",
          icon: <Calendar className="w-6 h-6" />,
          path: "/caisse_comptabilite/close-session",
          hidden: true,
        },
        {
          id: "open_session",
          title: "ouverture caisse",
          icon: <Calendar className="w-6 h-6" />,
          path: "/caisse_comptabilite/open-session",
          hidden: false,
        },
      ],
    },
    {
      id: "demandes",
      title: "Demandes de décaissement",
      icon: <FileText className="w-6 h-6" />,
      path: "/caisse_comptabilite/demandes",
    },
    {
      id: "validation-decaissement",
      title: "Validation des demandes",
      icon: <CheckCircle className="w-6 h-6" />,
      path: "/caisse_comptabilite/validation",
    },
    {
      id: "finance",
      title: "Résumé financier",
      icon: <DollarSign className="w-4 h-4" />,
      path: "/caisse_comptabilite/resume_financie",
    },
    {
      id: "payment-schedules",
      title: "Échéanciers de Paiement",
      icon: <CalendarCheck className="w-6 h-6" />,
      path: "/caisse_comptabilite/echeanciers_paiement",
    }
  ],
  pedagogie: [
    {
      id: "grades",
      title: "Notes",
      path: "/pedagogie/notes",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
    {
      id: "schedule",
      title: "Emploi du temps",
      path: "/pedagogie/emploi_du_temps",
      icon: <Calendar className="w-4 h-4" />,
      children: [
        {
          id: "eleves",
          title: "Emploi du temps classes",
          path: "/pedagogie/emploi_du_temps_classe",
          icon: <User className="w-6 h-6" />,
        },
        {
          id: "professeurs",
          title: "Emploi du temps professeurs",
          path: "/pedagogie/emploi_du_temps_professeur",
          icon: <Calendar className="w-6 h-6" />,
        },
      ],
    },
    {
      id: "cahier-text",
      title: "Cahier de texte",
      path: "/pedagogie/cahier-texte",
      icon: <Book className="w-4 h-4" />,
      children: [],
    },
    {
      id: "presence",
      title: "Liste de présence",
      path: "/pedagogie/liste-presence",
      icon: <ClipboardList className="w-4 h-4" />,
      children: [],
    },
    {
      id: "library",
      title: "Bibliothèque",
      path: "/pedagogie/bibliotheque",
      icon: <BookOpen className="w-4 h-4" />,
      children: [
        {
          id: "overview",
          title: "Vue d'ensemble",
          icon: <Home className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/overview",
        },
        {
          id: "books",
          title: "Livres",
          description: "Gestion du catalogue et des exemplaires",
          icon: <Book className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/livres",
        },
        {
          id: "loans",
          title: "Emprunts",
          description: "Suivi des prêts et retours",
          icon: <Clock className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/emprunts",
        },
        {
          id: "borrowers",
          title: "Emprunteurs",
          description: "Gestion des membres et cartes de lecteur",
          icon: <Users className="w-6 h-6" />,
          path: "/pedagogie/bibliotheque/emprunteurs",
        },
      ],
    },
  ],
  vie_scolaire: [
    {
      id: "grades",
      title: "Notes",
      path: "/vie_scolaire/notes",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
    {
      id: "schedule",
      title: "Emploi du temps",
      path: "/vie_scolaire/emploi_du_temps",
      icon: <Calendar className="w-4 h-4" />,
      children: [
        {
          id: "eleves",
          title: "Emploi du temps classes",
          path: "/vie_scolaire/emploi_du_temps_classe",
          icon: <User className="w-6 h-6" />,
        },
      ],
    },
    {
      id: "averages",
      title: "Moyennes",
      path: "/vie_scolaire/moyennes",
      icon: <Calculator className="w-6 h-6" />,
      children: [],
    },
    {
      id: "correspondence",
      title: "Carnet de correspondance",
      path: "/vie_scolaire/carnet-correspondance",
      icon: <Mail className="w-6 h-6" />,
      children: [],
    },
  ],
}

export default function DynamicMenu() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const lang = params.lang as string
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openCollapsibles, setOpenCollapsibles] = useState<Set<string>>(new Set())

  // Utilisation de useRef pour gérer les timers de fermeture
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const navigate = React.useCallback(
    (path: string) => {
      router.push(`/${lang}/${path}`)
      setIsMobileMenuOpen(false) // Fermer le menu mobile après navigation
    },
    [router, lang],
  )

  const isPathActive = React.useCallback(
    (path: string, children?: MenuItem[]): boolean => {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`
      const fullPath = `/${lang}${normalizedPath}`
      const normalizedCurrent = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
      const currentSegments = normalizedCurrent.split("/").filter(Boolean)
      const menuSegments = fullPath.split("/").filter(Boolean)
      const isPrefix = menuSegments.every((segment, index) => currentSegments[index] === segment)

      if (isPrefix) {
        return true
      }

      if (children) {
        return children.some((child) => isPathActive(child.path, child.children))
      }

      return false
    },
    [pathname, lang],
  )

  const shouldShowMenu = React.useCallback(() => {
    if (pathname === `/${lang}` || pathname === `/${lang}/`) {
      return true
    }

    const checkPathInMenu = (items: MenuItem[]): boolean => {
      return items.some((item) => {
        const normalizedPath = item.path.startsWith("/") ? item.path : `/${item.path}`
        const fullPath = `/${lang}${normalizedPath}`
        const normalizedCurrent = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
        const currentSegments = normalizedCurrent.split("/").filter(Boolean)
        const menuSegments = fullPath.split("/").filter(Boolean)
        const isPrefix = menuSegments.every((segment, index) => currentSegments[index] === segment)

        if (isPrefix) return true

        return item.children ? checkPathInMenu(item.children) : false
      })
    }

    return Object.values(menuItems).some((category) => checkPathInMenu(category))
  }, [pathname, lang])

  const getActiveMenu = React.useCallback((): MenuKey => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const specialRoutes: Record<string, MenuKey> = {
      paiement: "caisse_comptabilite",
      encaissement: "caisse_comptabilite",
      decaissement: "caisse_comptabilite",
      depense: "caisse_comptabilite",
      session_caisse: "caisse_comptabilite",
      validation: "caisse_comptabilite",
      new_registration: "eleves",
      "re-registration": "eleves",
      fees_type: "parametres",
      "frais-scolaires": "parametres",
      type_depense: "parametres",
      type_document: "parametres",
      general: "parametres",
      pedagogy: "parametres",
      scolarite: "parametres",
      administration: "parametres",
      caisse: "parametres",
    }

    const menuKeys = Object.keys(menuItems) as MenuKey[]
    for (const segment of pathSegments) {
      if (specialRoutes[segment]) {
        return specialRoutes[segment]
      }
      if (menuKeys.includes(segment as MenuKey)) {
        return segment as MenuKey
      }
    }

    if (pathSegments.some((seg) => seg === "parametres")) {
      return "parametres"
    }
    if (pathSegments.some((seg) => seg === "eleves")) {
      return "eleves"
    }
    if (
      pathSegments.some((seg) => seg === "caisse_comptabilite") ||
      pathSegments.some((seg) => seg === "encaissement") ||
      pathSegments.some((seg) => seg === "decaissement")
    ) {
      return "caisse_comptabilite"
    }
    if (pathSegments.some((seg) => seg === "pedagogie")) {
      return "pedagogie"
    }
    if (pathSegments.some((seg) => seg === "inventaire")) {
      return "inventaire"
    }
    if (pathSegments.some((seg) => seg === "vie_scolaire")) {
      return "vie_scolaire"
    }

    return "parametres"
  }, [pathname])

  const activeMenu = getActiveMenu()
  // Récupération des données utilisateur
  const { userOnline } = useSchoolStore()

  const hasFullAccess = userOnline?.roles?.some((role: any) => RoleWithFullAccessCaisse.includes(role.name) || RoleStandart.includes(role.name))

  // Filtrer les éléments du menu en fonction des rôles
  const filteredMenuItems = useMemo(() => {
    if (!userOnline) return menuItems

    // Si l'utilisateur a un rôle avec accès complet, on retourne tous les éléments du menu
    if (hasFullAccess) {
      return menuItems
    }

    // Sinon, on filtre pour ne garder que les éléments spécifiés dans la caisse_comptabilite
    return {
      ...menuItems,
      caisse_comptabilite: menuItems.caisse_comptabilite.filter(item => 
        ["demandes", "validation-decaissement"].includes(item.id)
      )
    }
  }, [userOnline, hasFullAccess])

  const currentMenuItems = filteredMenuItems[activeMenu] || []

  // Fonction pour gérer l'ouverture du popover avec délai
  const handleOpenPopover = React.useCallback((itemId: string) => {
    // Annuler tout timer de fermeture en cours
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setOpenPopoverId(itemId)
  }, [])

  // Fonction pour gérer la fermeture du popover avec délai
  const handleClosePopover = React.useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setOpenPopoverId(null)
    }, 300) // Délai de 300ms avant fermeture
  }, [])

  // Fonction pour gérer les collapsibles sur mobile
  const toggleCollapsible = (itemId: string) => {
    setOpenCollapsibles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Nettoyage des timers au démontage du composant
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  // Composant pour les éléments de menu desktop (avec popovers)
  const DesktopMenuItemComponent = React.useCallback(
    ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
      const visibleChildren = item.children?.filter((child) => !child.hidden) || []
      const hasVisibleChildren = visibleChildren.length > 0
      const hasAnyChildren = item.children && item.children.length > 0
      const isActive = isPathActive(item.path, item.children)

      const handleMouseEnter = () => {
        setHoveredItem(item.id)
        if (hasVisibleChildren) {
          handleOpenPopover(item.id)
        }
      }

      const handleMouseLeave = () => {
        handleClosePopover()
      }

      const handleClick = () => {
        if (!hasAnyChildren) {
          navigate(item.path)
          setOpenPopoverId(null)
        }
      }

      const handlePopoverMouseEnter = () => {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current)
          closeTimerRef.current = null
        }
      }

      const handlePopoverMouseLeave = () => {
        handleClosePopover()
      }

      return (
        <Popover
          open={openPopoverId === item.id && hasVisibleChildren}
          onOpenChange={(open) => {
            if (!open) {
              handleClosePopover()
            } else if (hasVisibleChildren) {
              handleOpenPopover(item.id)
            }
          }}
        >
          <PopoverTrigger asChild>
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <motion.div
                whileHover={{ scale: level === 0 ? 1.03 : 1.02 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-muted transition-all",
                  isActive ? "bg-skyblue/15 text-skyblue font-medium" : "text-foreground/90",
                  level > 0 && "px-3 py-1.5",
                  item.hidden && "hidden",
                )}
                onClick={handleClick}
              >
                <div className="flex items-center justify-center w-4 h-4">{item.icon}</div>
                <span className="text-xs">{item.title}</span>
                {hasVisibleChildren && (
                  <motion.div
                    animate={{ rotate: hoveredItem === item.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-1"
                  >
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </PopoverTrigger>
          {hasVisibleChildren && (
            <AnimatePresence>
              {openPopoverId === item.id && (
                <PopoverContent
                  className={cn(
                    "p-2 z-50 shadow-lg bg-background/95 backdrop-blur border border-border/50",
                    level === 0 ? "w-56" : "w-48",
                    level > 0 && "ml-1",
                  )}
                  align={level === 0 ? "start" : "end"}
                  sideOffset={5}
                  side={level === 0 ? "bottom" : "right"}
                  onMouseEnter={handlePopoverMouseEnter}
                  onMouseLeave={handlePopoverMouseLeave}
                  forceMount
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex flex-col gap-1">
                      {visibleChildren.map((child) => (
                        <DesktopMenuItemComponent key={child.id} item={child} level={level + 1} />
                      ))}
                    </div>
                  </motion.div>
                </PopoverContent>
              )}
            </AnimatePresence>
          )}
        </Popover>
      )
    },
    [hoveredItem, openPopoverId, isPathActive, navigate, handleOpenPopover, handleClosePopover],
  )

  // Composant pour les éléments de menu mobile (avec collapsibles)
  const MobileMenuItemComponent = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
    const visibleChildren = item.children?.filter((child) => !child.hidden) || []
    const hasVisibleChildren = visibleChildren.length > 0
    const hasAnyChildren = item.children && item.children.length > 0
    const isActive = isPathActive(item.path, item.children)
    const isOpen = openCollapsibles.has(item.id)

    const handleClick = () => {
      if (hasVisibleChildren) {
        toggleCollapsible(item.id)
      } else if (!hasAnyChildren) {
        navigate(item.path)
      }
    }

    return (
      <div className={cn("w-full", item.hidden && "hidden")}>
        {hasVisibleChildren ? (
          <Collapsible open={isOpen} onOpenChange={() => toggleCollapsible(item.id)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-4 text-left font-normal",
                  isActive && "bg-skyblue/15 text-skyblue font-medium",
                  level > 0 && "pl-8",
                )}
                onClick={handleClick}
              >
                <div className="flex items-center justify-center w-5 h-5">{item.icon}</div>
                <span className="flex-1 text-sm">{item.title}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {visibleChildren.map((child) => (
                <MobileMenuItemComponent key={child.id} item={child} level={level + 1} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-auto py-3 px-4 text-left font-normal",
              isActive && "bg-skyblue/15 text-skyblue font-medium",
              level > 0 && "pl-8",
            )}
            onClick={handleClick}
          >
            <div className="flex items-center justify-center w-5 h-5">{item.icon}</div>
            <span className="text-sm">{item.title}</span>
          </Button>
        )}
      </div>
    )
  }

  if (!shouldShowMenu()) {
    return null
  }

  return (
    <>
      {/* Menu Desktop */}
      <Card className="hidden md:block w-full px-4 py-3 rounded-lg shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-center gap-4 overflow-x-auto">
          {currentMenuItems.map((item) => (
            <DesktopMenuItemComponent key={item.id} item={item} />
          ))}
        </div>
      </Card>

      {/* Menu Mobile */}
      <div className="md:hidden">
        <Card className="w-full px-4 py-3 rounded-lg shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Menu className="w-4 h-4" />
                  <span className="text-sm font-medium">Menu</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {currentMenuItems.map((item) => (
                    <MobileMenuItemComponent key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </Card>
      </div>
    </>
  )
}
