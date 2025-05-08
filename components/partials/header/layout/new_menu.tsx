"use client";

import { useRouter, useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, BookOpen, School, Users, Calendar, Layers,
  DollarSign, FileText, Briefcase, UserCog, Warehouse,
  Package, RefreshCw, User, Book, Clock, ClipboardList,
  ChevronDown,
  Calculator,
  Mail
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Types
type MenuItemChild = {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  path: string;
  children?: never;
};

type MenuItemParent = {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  children: MenuItemChild[];
  description?: never; // Les parents n'ont pas de description
};

type MenuItem = MenuItemParent | (Omit<MenuItemParent, 'children'> & { children?: never });

type MenuCategory = {
  parametres: MenuItem[];
  inventaire: MenuItem[];
  eleves: MenuItem[];
  caisse_comptabilite: MenuItem[];
  pedagogie: MenuItem[];
  vie_scolaire : MenuItem[];
};

type MenuKey = keyof MenuCategory;


const menuItems: MenuCategory ={
  parametres: [
    {
      id: "general",
      title: "Général",
      icon: <Settings className="w-4 h-4" />,
      path: "parametres/general",
      children: [
        {
          id: "users",
          title: "Utilisateurs",
          description: "Gérer les utilisateurs",
          icon: <Users className="w-4 h-4" />,
          path: "parametres/users"
        }
      ]
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
          path: "parametres/academic_year"
        },
        {
          id: "levels",
          title: "Niveaux",
          description: "Niveaux d'études",
          icon: <Layers className="w-4 h-4" />,
          path: "parametres/level"
        },
        {
          id: "classes",
          title: "Classes",
          description: "Gérer les classes",
          icon: <School className="w-4 h-4" />,
          path: "parametres/classe"
        }
      ]
    },
    {
      id: "scolarite",
      title: "Scolarité",
      icon: <School className="w-4 h-4" />,
      path: "parametres/scolarite",
      children: [
        {
          id: "fees",
          title: "Frais",
          description: "Frais et paiements",
          icon: <DollarSign className="w-4 h-4" />,
          path: "parametres/frais-scolaires"
        },
        {
          id: "documents",
          title: "Documents",
          description: "Modèles de documents",
          icon: <FileText className="w-4 h-4" />,
          path: "parametres/type_document"
        }
      ]
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
          path: "parametres/fonctions"
        },
        {
          id: "employees",
          title: "Employés",
          description: "Gérer le personnel",
          icon: <UserCog className="w-4 h-4" />,
          path: "employes"
        }
      ]
    }
  ],
  inventaire: [
    { 
      id: "entrepots", 
      title: "Entrepôts", 
      path: "entrepots", 
      icon: <Warehouse className="w-4 h-4" />,
      children: [] 
    },
    { 
      id: "produits", 
      title: "Produits", 
      path: "produits", 
      icon: <Package className="w-4 h-4" />,
      children: [] 
    },
    { 
      id: "operations", 
      title: "Opérations", 
      path: "operations", 
      icon: <RefreshCw className="w-4 h-4" />,
      children: [] 
    },
  ],
  eleves: [
    { 
      id: "inscription", 
      title: "Inscription", 
      path: "registration", 
      icon: <User className="w-4 h-4" />,
      children: [] 
    },
    { 
      id: "eleves-inscrits", 
      title: "Élèves inscrits", 
      path: "students", 
      icon: <Users className="w-4 h-4" />,
      children: []
    },
    { 
      id: "Historique-inscription", 
      title: "Historique inscription", 
      path: "historique", 
      icon: <Book className="w-4 h-4" />,
      children: []
    },
    { 
      id: "Historique-documents", 
      title: "Historique documents", 
      path: "documents", 
      icon: <FileText className="w-4 h-4" />,
      children: [] 
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
          icon: <DollarSign className="w-4 h-4" /> 
        },
        { 
          id: "historique_paiement", 
          title: "Historique Paiement", 
          path: "historique_paiement", 
          icon: <Clock className="w-4 h-4" /> 
        },
        { 
          id: "caisses", 
          title: "Caisses", 
          path: "caisses", 
          icon: <Warehouse className="w-4 h-4" /> 
        }
      ] 
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
          icon: <DollarSign className="w-4 h-4" /> 
        },
        { 
          id: "type_depense", 
          title: "Type de dépense", 
          path: "type_depense", 
          icon: <ClipboardList className="w-4 h-4" /> 
        }
      ]
    }
  ],
  pedagogie: [
    { 
      id: "grades", 
      title: "Notes", 
      path: "pedagogie/notes", 
      icon: <FileText className="w-4 h-4" />,
      children: [] 
    },
    { 
      id: "schedule", 
      title: "Emploi du temps", 
      path: "pedagogie/emploi_du_temps", 
      icon: <Calendar className="w-4 h-4" />,
      children: [] 
    },
    { 
      id: "cahier-text", 
      title: "Cahier de text", 
      path: "pedagogie/cahier-text", 
      icon: <Book className="w-4 h-4" />,
      children: []
    },
    { 
      id: "presence", 
      title: "Liste de présence", 
      path: "pedagogie/liste-presence", 
      icon: <ClipboardList className="w-4 h-4" />,
      children: []
    },
    { 
      id: "library", 
      title: "Bibliothèque", 
      path: "pedagogie/bibliotheque", 
      icon: <BookOpen className="w-4 h-4" />,
      children: [] 
    }
  ],
  vie_scolaire: [
    { 
      id: "grades", 
      title: "Notes", 
      path: "pedagogie/notes", 
      icon: <FileText className="w-4 h-4" />,
      children: [] 
    },
    { 
      id: "schedule", 
      title: "Emploi du temps", 
      path: "/emploi_du_temps", 
      icon: <Calendar className="w-4 h-4" />,
      children: [] 
    },
    { 
      id: "cahier-text", 
      title: "Cahier de text", 
      path: "pedagogie/cahier-text", 
      icon: <Book className="w-4 h-4" />,
      children: []
    },
    {
          id: "averages",
          title: "Moyennes",
          path: "/moyennes",
          icon: <Calculator className="w-6 h-6" />,
          children: []

    },
    {
          id: "correspondence",
          title: "Carnet de correspondance",
          path: "/carnet-correspondance",
          icon: <Mail className="w-6 h-6" />,
          children: []
    }
    
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

  // Détecter le menu actif basé sur l'URL
  const currentPath = pathname.split('/').filter(Boolean);
  let activeMenu: MenuKey = 'parametres';
  
  if (currentPath.length >= 2) {
    const pathSegment = currentPath[1];
    if (Object.keys(menuItems).includes(pathSegment)) {
      activeMenu = pathSegment as MenuKey;
    }
  }

  // Condition pour cacher le menu si le dernier segment correspond au menu actif
  const lastPathSegment = currentPath[currentPath.length - 1];
  const shouldHideMenu = Object.keys(menuItems).includes(lastPathSegment);

  const currentMenuItems = menuItems[activeMenu] || menuItems.parametres;

  // Vérifier si un élément est actif
  const isItemActive = (path: string): boolean => {
    return pathname.includes(path);
  };

  // Gestion de l'ouverture/fermeture des popovers
  useEffect(() => {
    if (!isHovering && openPopoverId) {
      const timer = setTimeout(() => {
        setOpenPopoverId(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isHovering, openPopoverId]);

  // Composant pour un item de menu
  const MenuItemComponent = ({ item }: { item: MenuItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <Popover 
        open={openPopoverId === item.id} 
        onOpenChange={(open) => setOpenPopoverId(open ? item.id : null)}
      >
        <PopoverTrigger asChild>
          <motion.div
            className="relative"
            onMouseEnter={() => {
              setHoveredItem(item.id);
              setIsHovering(true);
              if (hasChildren) {
                setOpenPopoverId(item.id);
              }
            }}
            onMouseLeave={() => {
              setIsHovering(false);
              setHoveredItem(null);
            }}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-muted transition-all",
                isItemActive(item.path) ? "bg-primary/10 text-primary font-medium" : "text-foreground/90"
              )}
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
          </motion.div>
        </PopoverTrigger>
        
        <AnimatePresence>
          {hasChildren && (
            <PopoverContent 
              className="p-2 w-56 z-50 shadow-lg border-none" 
              align="start"
              sideOffset={5}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              forceMount
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="overflow-hidden">
                  <div className="flex flex-col gap-1">
                    {item.children?.map((child) => (
                      <motion.div
                        key={child.id}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
                          isItemActive(child.path) ? "bg-primary/10 text-primary" : "text-foreground/80"
                        )}
                        onClick={() => navigate(child.path)}
                      >
                        <div className="flex items-center justify-center w-5 h-5">
                          {child.icon}
                        </div>
                        <span className="text-sm">{child.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </PopoverContent>
          )}
        </AnimatePresence>
      </Popover>
    );
  };

  if (shouldHideMenu) {
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
