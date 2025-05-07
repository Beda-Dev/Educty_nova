"use client";

import { useRouter } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const itemColors = [
  "bg-blue-100/80 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300",
  "bg-purple-100/80 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-300",
  "bg-green-100/80 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-300",
  "bg-yellow-100/80 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300",
];

const menuDefinitions = {
  parametre: [
    { id: "users", title: "Utilisateurs", path: "users", icon: "👥" },
    { id: "academic-year", title: "Année Académique", path: "academic_year", icon: "📅" },
    { id: "levels", title: "Niveaux", path: "level", icon: "📊" },
    { id: "classes", title: "Classes", path: "classe", icon: "🏫" },
    { id: "fees", title: "Frais Scolaires", path: "frais-scolaires", icon: "💰" },
    { id: "documents", title: "Documents", path: "type_document", icon: "📄" },
    { id: "roles", title: "Fonctions", path: "fonctions", icon: "👔" },
    { id: "employees", title: "Employés", path: "employes", icon: "🧑‍💼" }
  ],
  inventaire: [
    { id: "entrepots", title: "Entrepôts", path: "entrepots", icon: "🏭" },
    { id: "produits", title: "Produits", path: "produits", icon: "📦" },
    { id: "operations", title: "Opérations", path: "operations", icon: "🔄" },
  ],
  eleves: [
    { id: "inscription", title: "Inscription", path: "registration", icon: "✍️" },
    { id: "eleves-inscrits", title: "Élèves inscrits", path: "students", icon: "👨‍🎓" },
    { id: "Historique-inscription", title: "Historique inscription", path: "historique", icon: "🕰️" },
    { id: "Historique-documents", title: "Historique documents", path: "documents", icon: "🗃️" },
  ],
  caisse_comptabilite: [
    { id: "encaissement", title: "Encaissement", path: "encaissement", icon: "⬇️" },
    { id: "decaissement", title: "Décaissement", path: "decaissement", icon: "⬆️" }
  ],
  pedagogie: [
    { id: "grades", title: "Notes", path: "notes", icon: "📝" },
    { id: "schedule", title: "Emploi du temps", path: "emploi-du-temps", icon: "⏰" },
    { id: "cahier-text", title: "Cahier de text", path: "cahier-text", icon: "📓" },
    { id: "presence", title: "Liste de présence", path: "liste-presence", icon: "✅" },
    { id: "library", title: "Bibliothèque", path: "bibliotheque", icon: "📚" }
  ],
  paiements: [
    { id: "paiement", title: "Paiement", path: "paiement", icon: "💳" },
    { id: "historique_paiement", title: "Historique Paiement", path: "historique_paiement", icon: "📊" },
    { id: "caisses", title: "Caisses", path: "caisses", icon: "💰" }
  ],
  decaissement: [
    { id: "depense", title: "Dépense", path: "depense", icon: "💸" },
    { id: "type_depense", title: "Type de dépense", path: "type_depenses", icon: "🏷️" }
  ]
};

export default function DynamicMenu() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;
  const lastPathSegment = pathname.split('/').pop() || '';

  const getMenuType = () => {
    // Vérifie d'abord si l'URL correspond au menu des paiements
    if (['paiement', 'historique_paiement', 'caisses'].includes(lastPathSegment)) {
      return 'paiements';
    }

    if (['depense', 'type_depense'].includes(lastPathSegment)) {
      return 'decaissement';
    }
    

    // Sinon, vérifie les autres menus comme avant
    for (const [menuType, items] of Object.entries(menuDefinitions)) {
      if (items.some(item => item.path === lastPathSegment)) {
        return menuType;
      }
    }
    return null;
  };

  const menuType = getMenuType();
  if (!menuType) return null;

  const menuItems = menuDefinitions[menuType as keyof typeof menuDefinitions];
  const getLocalizedPath = (path: string) => `/${lang}/${path}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      scale: 1.03,
      opacity: 1,
      transition: { duration: 0.2 }
    },
    inactive: {
      opacity: 0.7,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="p-2">
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuItems.map((item, index) => (
          <TooltipProvider key={item.id} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  animate={lastPathSegment === item.path ? "hover" : "inactive"}
                  onClick={() => router.push(getLocalizedPath(item.path))}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all",
                    itemColors[index % itemColors.length],
                    "hover:shadow-sm",
                    lastPathSegment === item.path && "ring-2 ring-primary/80 dark:ring-primary/60 shadow-md"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div className="font-medium text-sm truncate">
                      {item.title}
                    </div>
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-primary text-white text-xs">
                <p>Aller à {item.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </motion.div>
    </div>
  );
}