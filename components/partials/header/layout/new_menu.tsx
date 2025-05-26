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

type MenuItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
  children?: MenuItem[]; // peut être récursif
};

type MenuCategory = {
  parametres: MenuItem[];
  inventaire: MenuItem[];
  eleves: MenuItem[];
  caisse_comptabilite: MenuItem[];
  pedagogie: MenuItem[];
  vie_scolaire: MenuItem[];
};

type MenuKey =
  | "caisse_comptabilite"
  | "eleves"
  | "parametres"
  | "pedagogie"
  | "inventaire"
  | "vie_scolaire";

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
          title: "Année",
          description: "Année scolaire",
          icon: <Calendar className="w-4 h-4" />,
          path: "/academic_year",
        },
        {
          id: "levels",
          title: "Niveaux",
          description: "Niveaux d'études",
          icon: <Layers className="w-4 h-4" />,
          path: "/level",
        },
        {
          id: "classes",
          title: "Classes",
          description: "Gérer les classes",
          icon: <School className="w-4 h-4" />,
          path: "/classe",
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
          id: "fees",
          title: "Frais scolaires",
          icon: <DollarSign className="w-4 h-4" />,
          path: "/parametres/scolarite/frais-scolaires",
          children: [
            {
              id: "fees_type",
              title: "Types de frais",
              description: "Gérer les différents types de frais scolaires",
              icon: <List className="w-6 h-6" />,
              path: "parametres/scolarite/frais-scolaires/fees_type",
            },
            {
              id: "pricing",
              title: "Tarification",
              description: "Configurer les tarifs et montants des frais",
              icon: <Tags className="w-6 h-6" />,
              path: "parametres/scolarite/frais-scolaires/pricing",
            },
          ],
        },
        {
          id: "documents",
          title: "Documents",
          description: "Modèles de documents",
          icon: <FileText className="w-4 h-4" />,
          path: "/parametres/scolarite/type_document",
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
        },
        {
          id: "payment-schedules",
          title: "Échéanciers de Paiement",
          icon: <CalendarCheck className="w-6 h-6" />,
          path: "/parametres/caisse/echeanciers_paiement",
        },
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
      children: [],
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
      path: "/encaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "paiement",
          title: "Paiement",
          path: "/paiement",
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "historique_paiement",
          title: "Historique Paiement",
          path: "/historique_paiement",
          icon: <Clock className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "decaissement",
      title: "Décaissement",
      path: "/decaissement",
      icon: <DollarSign className="w-4 h-4" />,
      children: [
        {
          id: "depense",
          title: "Dépense",
          path: "/depense",
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

  // Mémoïsation de la fonction de navigation
  const navigate = React.useCallback(
    (path: string) => {
      router.push(`/${lang}/${path}`);
    },
    [router, lang]
  );

  // Fonction récursive améliorée pour vérifier les chemins actifs
  const isPathActive = React.useCallback(
    (path: string, children?: MenuItem[]): boolean => {
      // Normalisation des chemins
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      const normalizedCurrent = pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;

      // Vérification du chemin principal
      if (
        normalizedCurrent === `/${lang}${normalizedPath}` ||
        normalizedCurrent.endsWith(normalizedPath)
      ) {
        return true;
      }

      // Vérification récursive des enfants
      if (children) {
        return children.some((child) =>
          isPathActive(child.path, child.children)
        );
      }

      return false;
    },
    [pathname, lang]
  );

  // Fonction optimisée pour déterminer si le menu doit être affiché
  const shouldShowMenu = React.useCallback(() => {
    // Chemins où le menu ne doit pas apparaître
    const excludedPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/error",
    ];

    if (excludedPaths.some((path) => pathname.includes(path))) {
      return false;
    }

    // Toujours afficher sur la page d'accueil
    if (pathname === `/${lang}` || pathname === `/${lang}/`) {
      return true;
    }

    // Vérifier si le chemin correspond à un élément de menu
    const checkPathInMenu = (items: MenuItem[]): boolean => {
      return items.some((item) => {
        if (isPathActive(item.path, item.children)) return true;
        return item.children ? checkPathInMenu(item.children) : false;
      });
    };

    return Object.values(menuItems).some((category) =>
      checkPathInMenu(category)
    );
  }, [pathname, lang, isPathActive]);

  // Détection optimisée du menu actif
  const getActiveMenu = React.useCallback((): MenuKey => {
    const pathSegments = pathname.split("/").filter(Boolean);

    // 1. Vérification des routes spéciales prioritaires
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
    };

    // 2. Vérification des segments clés de menu
    const menuKeys = Object.keys(menuItems) as MenuKey[];

    // Parcours des segments du chemin
    for (const segment of pathSegments) {
      // Priorité aux routes spéciales
      if (specialRoutes[segment]) {
        return specialRoutes[segment];
      }

      // Ensuite vérification des clés de menu principales
      if (menuKeys.includes(segment as MenuKey)) {
        return segment as MenuKey;
      }
    }

    // 3. Vérification des préfixes de chemin pour les cas complexes
    if (pathname.includes("/parametres/")) {
      return "parametres";
    }
    if (pathname.includes("/eleves/")) {
      return "eleves";
    }
    if (
      pathname.includes("/caisse_comptabilite/") ||
      pathname.includes("/encaissement") ||
      pathname.includes("/decaissement")
    ) {
      return "caisse_comptabilite";
    }
    if (pathname.includes("/pedagogie/")) {
      return "pedagogie";
    }
    if (pathname.includes("/inventaire/")) {
      return "inventaire";
    }
    if (pathname.includes("/vie_scolaire/")) {
      return "vie_scolaire";
    }

    // 4. Fallback par défaut
    return "parametres";
  }, [pathname]);

  const activeMenu = getActiveMenu();
  // console.log('Active menu:', getActiveMenu());
  const currentMenuItems = menuItems[activeMenu] || [];

  // Gestion améliorée des popovers
  useEffect(() => {
    if (!isHovering && openPopoverId) {
      const timer = setTimeout(() => {
        setOpenPopoverId(null);
      }, 500); // Augmentez ce délai à 500ms (au lieu de 200ms)
      return () => clearTimeout(timer);
    }
  }, [isHovering, openPopoverId]);

  // Composant mémoïsé pour les items de menu
  const MenuItemComponent = React.useCallback(
    ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
      const hasChildren = item.children && item.children.length > 0;
      const isActive = isPathActive(item.path, item.children);

      const handleMouseEnter = () => {
        setHoveredItem(item.id);
        setIsHovering(true);
        // Toujours ouvrir le popover si on a des enfants, quel que soit le niveau
        if (hasChildren) {
          setOpenPopoverId(item.id);
        }
      };

      const handleMouseLeave = () => {
        setIsHovering(false);
        // Ne pas fermer immédiatement, la fermeture est gérée par le timeout dans useEffect
      };

      const handleClick = () => {
        if (!hasChildren) {
          navigate(item.path);
        }
      };

      return (
        <Popover
          open={openPopoverId === item.id}
          onOpenChange={(open) => {
            if (!open) {
              // Ajoutez un délai avant de fermer
              setTimeout(() => {
                setOpenPopoverId(null);
              }, 300);
            } else {
              setOpenPopoverId(item.id);
            }
          }}
        >
          <PopoverTrigger asChild>
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                whileHover={{ scale: level === 0 ? 1.03 : 1.02 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-muted transition-all",
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/90",
                  level > 0 && "px-3 py-1.5"
                )}
                onClick={handleClick}
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
                  level > 0 && "ml-1"
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
                  // Délai avant fermeture géré par le useEffect
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
    },
    [hoveredItem, isHovering, openPopoverId, isPathActive, navigate]
  );

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
