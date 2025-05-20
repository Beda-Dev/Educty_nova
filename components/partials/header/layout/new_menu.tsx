"use client";

import { useRouter, useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { forwardRef } from "react";

const MenuTrigger = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    onMouseEnter: () => void;
    onMouseLeave: () => void;
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
));
MenuTrigger.displayName = "MenuTrigger";

// Types
type MenuItemChild = {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItemChild[];
};

type MenuItemParent = {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  children: MenuItemChild[];
  description?: never; // Les parents n'ont pas de description
};

type MenuItem =
  | MenuItemParent
  | (Omit<MenuItemParent, "children"> & { children?: MenuItemChild[] }); // Permet d'avoir des enfants ou pas

type MenuCategory = {
  parametres: MenuItem[];
  inventaire: MenuItem[];
  eleves: MenuItem[];
  caisse_comptabilite: MenuItem[];
  pedagogie: MenuItem[];
  vie_scolaire: MenuItem[];
};

type MenuKey = keyof MenuCategory;

const menuItems: MenuCategory = {
  parametres: [
    {
      id: "general",
      title: "Généraux",
      icon: <Settings className="w-4 h-4" />,
      path: "parametres/general",
      children: [
        {
          id: "users",
          title: "Utilisateurs",
          description: "Gérer les utilisateurs",
          icon: <Users className="w-4 h-4" />,
          path: "parametres/general/users",
        },
      ],
    },
    {
      id: "pedagogy",
      title: "Pédagogie",
      icon: <BookOpen className="w-4 h-4" />,
      path: "parametres/pedagogy",
      children: [
        {
          id: "academic-year",
          title: "Année",
          description: "Année scolaire",
          icon: <Calendar className="w-4 h-4" />,
          path: "academic_year",
        },
        {
          id: "levels",
          title: "Niveaux",
          description: "Niveaux d'études",
          icon: <Layers className="w-4 h-4" />,
          path: "level",
        },
        {
          id: "classes",
          title: "Classes",
          description: "Gérer les classes",
          icon: <School className="w-4 h-4" />,
          path: "classe",
        },
      ],
    },
    {
      id: "scolarite",
      title: "Scolarité",
      icon: <School className="w-4 h-4" />,
      path: "parametres/scolarite",
      children: [
        {
          id: "fees",
          title: "Frais scolaires",
          icon: <DollarSign className="w-4 h-4" />,
          path: "parametres/scolarite/frais-scolaires",
          children: [
            // {
            //   id: "fees_type",
            //   title: "Types de frais",
            //   description: "Gérer les différents types de frais scolaires",
            //   icon: <List className="w-6 h-6" />,
            //   path: "parametres/scolarite/frais-scolaires/fees_type",
            // },
            // {
            //   id: "pricing",
            //   title: "Tarification",
            //   description: "Configurer les tarifs et montants des frais",
            //   icon: <Tags className="w-6 h-6" />,
            //   path: "parametres/scolarite/frais-scolaires/pricing",
            // },
          ],
        },
        {
          id: "documents",
          title: "Documents",
          description: "Modèles de documents",
          icon: <FileText className="w-4 h-4" />,
          path: "parametres/scolarite/type_document",
        },
      ],
    },
    {
      id: "administration",
      title: "Admin",
      icon: <Users className="w-4 h-4" />,
      path: "parametres/administration",
      children: [
        {
          id: "roles",
          title: "Fonctions",
          description: "Rôles du personnel",
          icon: <Briefcase className="w-4 h-4" />,
          path: "parametres/administration/fonctions",
        },
        {
          id: "employees",
          title: "Employés",
          description: "Gérer le personnel",
          icon: <UserCog className="w-4 h-4" />,
          path: "parametres/administration/employes",
        },
      ],
    },
    {
      id: "caisse",
      title: "Caisse",
      icon: <DollarSign className="w-4 h-4" />,
      path: "parametres/caisse",
      children: [
        {
          id: "caisses",
          title: "Caisses d'enregitrement",
          path: "parametres/caisse/caisses_enregistrement",
          icon: <Warehouse className="w-4 h-4" />,
        },
        {
          id: "type_depense",
          title: "Type de dépense",
          path: "parametres/caisse/type_depense",
          icon: <ClipboardList className="w-4 h-4" />,
        },

        {
          id: "payment-methods",
          title: "Méthodes de Paiement",
          path: "parametres/caisse/methodes_paiement",
          icon: <CreditCard className="w-6 h-6" />,
        },
        {
          id: "payment-schedules",
          title: "Échéanciers de Paiement",
          icon: <CalendarCheck className="w-6 h-6" />,
          path: "parametres/caisse/echeanciers_paiement",
        },
      ],
    },
  ],
  inventaire: [
    {
      id: "entrepots",
      title: "Entrepôts",
      path: "inventaire/entrepots",
      icon: <Warehouse className="w-4 h-4" />,
      children: [],
    },
    {
      id: "produits",
      title: "Produits",
      path: "inventaire/produits",
      icon: <Package className="w-4 h-4" />,
      children: [],
    },
    {
      id: "operations",
      title: "Opérations",
      path: "inventaire/operations",
      icon: <RefreshCw className="w-4 h-4" />,
      children: [],
    },
  ],
  eleves: [
    {
      id: "inscription",
      title: "Inscription",
      path: "eleves/registration",
      icon: <User className="w-4 h-4" />,
      children: [],
    },
    {
      id: "eleves-inscrits",
      title: "Élèves inscrits",
      path: "eleves/students",
      icon: <Users className="w-4 h-4" />,
      children: [],
    },
    {
      id: "Historique-inscription",
      title: "Historique inscription",
      path: "eleves/historique",
      icon: <Book className="w-4 h-4" />,
      children: [],
    },
    {
      id: "Historique-documents",
      title: "Historique documents",
      path: "eleves/documents",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
  ],
  caisse_comptabilite: [
    {
      id: "encaissement",
      title: "Encaissement",
      path: "encaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "paiement",
          title: "Paiement",
          path: "paiement",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "historique_paiement",
          title: "Historique Paiement",
          path: "historique_paiement",
          icon: <Clock className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "decaissement",
      title: "Décaissement",
      path: "decaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "depense",
          title: "Dépense",
          path: "depense",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "validation-depense",
          title: "Validation dépenses",
          icon: <CheckCircle className="w-6 h-6" />,
          path: "/decaissement/validation",
        },
      ],
    },
    {
      id: "sessions",
      title: "Sessions de caisse",
      icon: <Clock className="w-6 h-6" />,
      path: "/caisse_comptabilite/session_caisse",
    },
  ],
  pedagogie: [
    {
      id: "grades",
      title: "Notes",
      path: "pedagogie/notes",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
    {
      id: "schedule",
      title: "Emploi du temps",
      path: "pedagogie/emploi_du_temps",
      icon: <Calendar className="w-4 h-4" />,
      children: [
        {
          id: "eleves",
          title: "Emploi du temps classes",
          path: "pedagogie/emploi_du_temps_classe",
          icon: <User className="w-6 h-6" />,
        },
        {
          id: "professeurs",
          title: "Emploi du temps professeurs",
          path: "pedagogie/emploi_du_temps_professeur",
          icon: <Calendar className="w-6 h-6" />,
        },
      ],
    },
    {
      id: "cahier-text",
      title: "Cahier de texte",
      path: "pedagogie/cahier-texte",
      icon: <Book className="w-4 h-4" />,
      children: [],
    },
    {
      id: "presence",
      title: "Liste de présence",
      path: "pedagogie/liste-presence",
      icon: <ClipboardList className="w-4 h-4" />,
      children: [],
    },
    {
      id: "library",
      title: "Bibliothèque",
      path: "pedagogie/bibliotheque",
      icon: <BookOpen className="w-4 h-4" />,
      children: [
        {
          id: "overview",
          title: "Vue d'ensemble",
          icon: <Home className="w-6 h-6" />,
          path: "pedagogie/bibliotheque/overview",
        },
        {
          id: "books",
          title: "Livres",
          description: "Gestion du catalogue et des exemplaires",
          icon: <Book className="w-6 h-6" />,
          path: "pedagogie/bibliotheque/livres",
        },
        {
          id: "loans",
          title: "Emprunts",
          description: "Suivi des prêts et retours",
          icon: <Clock className="w-6 h-6" />,
          path: "pedagogie/bibliotheque/emprunts",
        },
        {
          id: "borrowers",
          title: "Emprunteurs",
          description: "Gestion des membres et cartes de lecteur",
          icon: <Users className="w-6 h-6" />,
          path: "pedagogie/bibliotheque/emprunteurs",
        },
      ],
    },
  ],
  vie_scolaire: [
    {
      id: "grades",
      title: "Notes",
      path: "vie_scolaire/notes",
      icon: <FileText className="w-4 h-4" />,
      children: [],
    },
    {
      id: "schedule",
      title: "Emploi du temps",
      path: "vie_scolaire/emploi_du_temps",
      icon: <Calendar className="w-4 h-4" />,
      children: [
        {
          id: "eleves",
          title: "Emploi du temps classes",
          path: "vie_scolaire/emploi_du_temps_classe",
          icon: <User className="w-6 h-6" />,
        },
        // {
        //   id: "professeurs",
        //   title: "Emploi du temps professeurs",
        //   path: "vie_scolaire/emploi_du_temps_professeur",
        //   icon: <Calendar className="w-6 h-6" />,
        // },
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
};

export default function DynamicMenu() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const navigate = (path: string) => {
    router.push(`/${lang}/${path}`);
  };

  // Fonction récursive pour vérifier les URLs dans tous les niveaux d'enfants
  const checkPathRecursive = (items: (MenuItem | MenuItemChild)[]): boolean => {
    for (const item of items) {
      if (pathname.endsWith(item.path)) {
        return true;
      }

      if (item.children) {
        if (checkPathRecursive(item.children)) {
          return true;
        }
      }
    }
    return false;
  };

  const shouldShowMenu = () => {
    return checkPathRecursive(Object.values(menuItems).flat());
  };

  // Détecter le menu actif basé sur l'URL
  const currentPath = pathname.split("/").filter(Boolean);
  let activeMenu: MenuKey = "parametres";

  const caisseRoutes = [
    "/paiement",
    "/historique_paiement",
    "/encaissement",
    "/decaissement",
    "/depense",
    "/session_caisse",
    "/open-session",
    "/close-session/1",
    "/close-session/2",
    "/close-session/3",
    "/close-session/4",
    "/close-session/5",
    "/close-session/6",
    "/close-session/7",
    "/validation",
  ];

  const parametreRoute = ["/fees_type"];

  const elevesSpecialRoutes = ["/new_registration", "/re-registration"];

  const isCaisseRoute = caisseRoutes.some((route) => pathname.endsWith(route));

  const isElevesSpecialRoute = elevesSpecialRoutes.some((route) =>
    pathname.endsWith(route)
  );

  const isParametreRoute = parametreRoute.some((route) =>
    pathname.endsWith(route)
  );

  if (isCaisseRoute) {
    activeMenu = "caisse_comptabilite";
  } else if (isElevesSpecialRoute) {
    activeMenu = "eleves";
  } else if (isParametreRoute) {
    activeMenu = "parametres";
  } else if (currentPath.length >= 2) {
    const pathSegment = currentPath[1];
    if (Object.keys(menuItems).includes(pathSegment)) {
      activeMenu = pathSegment as MenuKey;
    }
  }

  const currentMenuItems = menuItems[activeMenu] || menuItems.parametres;

  // Vérifier si un élément est actif (version récursive)
  const isItemActive = (path: string, children?: MenuItemChild[]): boolean => {
    if (pathname.endsWith(path)) return true;

    if (children) {
      return children.some((child) => isItemActive(child.path, child.children));
    }

    return false;
  };

  useEffect(() => {
    if (!isHovering) {
      const timer = setTimeout(() => {
        // Vérifier à nouveau pour éviter les fermetures intempestives
        if (!isHovering) {
          setOpenPopoverId(null);
        }
      }, 300); // Réduit à 300ms pour une réponse plus rapide
      return () => clearTimeout(timer);
    }
  }, [isHovering, openPopoverId]);

  // Composant récursif pour les items de menu
  const MenuItemComponent = ({
    item,
    level = 0,
  }: {
    item: MenuItem | MenuItemChild;
    level?: number;
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isParentItem = level === 0;

    return (
      <Popover
        open={openPopoverId === item.id}
        onOpenChange={(open) => {
          if (open) {
            setOpenPopoverId(item.id);
          } else if (!isHovering) {
            // Ne fermer que si la souris n'est plus dans la zone du menu
            setOpenPopoverId(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <div className="relative">
            <motion.div
              whileHover={{ scale: isParentItem ? 1.03 : 1.02 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-muted transition-all",
                isItemActive(item.path, item.children)
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-foreground/90",
                !isParentItem && "px-3 py-1.5"
              )}
              onClick={() => !hasChildren && navigate(item.path)}
              onMouseEnter={() => {
                setHoveredItem(item.id);
                setIsHovering(true);
                if (hasChildren) {
                  setOpenPopoverId(item.id);
                }
              }}
              onMouseLeave={() => {
                // Ne pas immédiatement fermer, laisser le timeout gérer
                setIsHovering(false);
              }}
            >
              <div className="flex items-center justify-center w-5 h-5">
                {item.icon}
              </div>
              <span className="text-sm">{item.title}</span>
              {hasChildren && (
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
        {hasChildren && (
          <AnimatePresence>
            <PopoverContent
              className={cn(
                "p-2 z-50 shadow-lg bg-background/95 backdrop-blur border border-border/50",
                level === 0 ? "w-56" : "w-48",
                level > 0 ? "ml-1" : ""
              )}
              align={level === 0 ? "start" : "end"}
              sideOffset={5}
              side={level === 0 ? "bottom" : "right"}
              onMouseEnter={() => {
                setIsHovering(true);
                setOpenPopoverId(item.id);
              }}
              onMouseLeave={() => {
                setIsHovering(false);
              }}
              forceMount
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex flex-col gap-1">
                  {item.children?.map((child) => (
                    <MenuItemComponent
                      key={child.id}
                      item={child}
                      level={level + 1}
                    />
                  ))}
                </div>
              </motion.div>
            </PopoverContent>
          </AnimatePresence>
        )}
      </Popover>
    );
  };

  if (!shouldShowMenu()) {
    return null;
  }

  return (
    <Card className="w-full px-4 py-3 rounded-lg shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-center gap-4">
        {currentMenuItems.map((item) => (
          <MenuItemComponent key={item.id} item={item} />
        ))}
      </div>
    </Card>
  );
}
