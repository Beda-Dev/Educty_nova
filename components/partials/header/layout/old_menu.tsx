"use client";

import { useRouter } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Users,
  Calendar,
  BarChart2,
  School,
  DollarSign,
  FileText,
  Briefcase,
  UserSquare2,
  Warehouse,
  Package,
  RefreshCw,
  BookOpen,
  Bookmark,
  Clock,
  FileArchive,
  ArrowDownToLine,
  ArrowUpToLine,
  NotebookText,
  CheckSquare,
  Library,
  CreditCard,
  Landmark,
  Wallet,
  Tag,
  Coins,
  CalendarClock
} from "lucide-react";

const itemColors = [
  "bg-blue-100/80 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300",
  "bg-purple-100/80 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-300",
  "bg-green-100/80 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-300",
  "bg-yellow-100/80 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300",
];

const iconComponents = {
  users: Users,
  "academic-year": Calendar,
  levels: BarChart2,
  classes: School,
  fees: DollarSign,
  documents: FileText,
  roles: Briefcase,
  employees: UserSquare2,
  entrepots: Warehouse,
  produits: Package,
  operations: RefreshCw,
  inscription: BookOpen,
  "eleves-inscrits": Bookmark,
  "Historique-inscription": Clock,
  "Historique-documents": FileArchive,
  encaissement: ArrowDownToLine,
  decaissement: ArrowUpToLine,
  grades: NotebookText,
  schedule: CalendarClock,
  "cahier-text": NotebookText,
  presence: CheckSquare,
  library: Library,
  paiement: CreditCard,
  historique_paiement: BarChart2,
  caisses: Landmark,
  depense: Wallet,
  type_depense: Tag,
  fees_type: Coins,
  pricing: DollarSign,
  schedule_teach: UserSquare2,
  schedule_stud: School
};

const menuDefinitions = {
  parametre: [
    { id: "users", title: "Utilisateurs", path: "users", icon: "users" },
    { id: "academic-year", title: "Année Académique", path: "academic_year", icon: "academic-year" },
    { id: "levels", title: "Niveaux", path: "level", icon: "levels" },
    { id: "classes", title: "Classes", path: "classe", icon: "classes" },
    { id: "fees", title: "Frais Scolaires", path: "frais-scolaires", icon: "fees" },
    { id: "documents", title: "Documents", path: "type_document", icon: "documents" },
    { id: "roles", title: "Fonctions", path: "fonctions", icon: "roles" },
    { id: "employees", title: "Employés", path: "employes", icon: "employees" }
  ],
  inventaire: [
    { id: "entrepots", title: "Entrepôts", path: "entrepots", icon: "entrepots" },
    { id: "produits", title: "Produits", path: "produits", icon: "produits" },
    { id: "operations", title: "Opérations", path: "operations", icon: "operations" },
  ],
  eleves: [
    { id: "inscription", title: "Inscription", path: "registration", icon: "inscription" },
    { id: "eleves-inscrits", title: "Élèves inscrits", path: "students", icon: "eleves-inscrits" },
    { id: "Historique-inscription", title: "Historique inscription", path: "historique", icon: "Historique-inscription" },
    { id: "Historique-documents", title: "Historique documents", path: "documents", icon: "Historique-documents" },
  ],
  caisse_comptabilite: [
    { id: "encaissement", title: "Encaissement", path: "encaissement", icon: "encaissement" },
    { id: "decaissement", title: "Décaissement", path: "decaissement", icon: "decaissement" }
  ],
  pedagogie: [
    { id: "grades", title: "Notes", path: "notes", icon: "grades" },
    { id: "schedule", title: "Emploi du temps", path: "emploi_du_temps", icon: "schedule" },
    { id: "cahier-text", title: "Cahier de text", path: "cahier-text", icon: "cahier-text" },
    { id: "presence", title: "Liste de présence", path: "liste-presence", icon: "presence" },
    { id: "library", title: "Bibliothèque", path: "bibliotheque", icon: "library" }
  ],
  paiements: [
    { id: "paiement", title: "Paiement", path: "paiement", icon: "paiement" },
    { id: "historique_paiement", title: "Historique Paiement", path: "historique_paiement", icon: "historique_paiement" },
    { id: "caisses", title: "Caisses", path: "caisses", icon: "caisses" }
  ],
  decaissement: [
    { id: "depense", title: "Dépense", path: "depense", icon: "depense" },
    { id: "type_depense", title: "Type de dépense", path: "type_depense", icon: "type_depense" }
  ],
  frais: [
    { id: "fees_type", title: "Type de frais", path: "fees_type", icon: "fees_type" },
    { id: "pricing", title: "Tarification", path: "pricing", icon: "pricing" }
  ],
  schedule: [ 
    { id: "schedule_teach", title: "horaire enseignant", path: "emploi_du_temps_professeur", icon: "schedule_teach" }, 
    { id: "schedule_stud", title: "horaire classes", path: "emploi_du_temps_classe", icon: "schedule_stud" }
  ]
};

export default function DynamicMenu() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;
  const lastPathSegment = pathname.split('/').pop() || '';

  const getMenuType = () => {
    if (['paiement', 'historique_paiement', 'caisses'].includes(lastPathSegment)) {
      return 'paiements';
    }

    if (['depense', 'type_depense'].includes(lastPathSegment)) {
      return 'decaissement';
    }

    if (['fees_type', 'pricing'].includes(lastPathSegment)) {
      return 'frais';
    }

    if (['emploi_du_temps_professeur', 'emploi_du_temps_classe'].includes(lastPathSegment)) {
      return 'schedule';
    }

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
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      scale: 1.05,
      opacity: 1,
      transition: { duration: 0.2 }
    },
    inactive: {
      opacity: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const menuTitles: Record<string, string> = {
    parametre: "Paramètres",
    inventaire: "Inventaire",
    eleves: "Élèves",
    caisse_comptabilite: "Caisse & Comptabilité",
    pedagogie: "Pédagogie",
    paiements: "Paiements",
    decaissement: "Décaissements",
    frais: "Frais Scolaires",
    schedule: "Horaires"
  };

  return (
    <Card className="w-full">
      <Accordion type="single" collapsible defaultValue={menuType}>
        <AccordionItem value={menuType} className="border-b-0">
          <AccordionTrigger className="py-1 hover:no-underline">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                className="w-4 h-4"
              >
                <div className="w-full h-full rounded-full bg-primary/50"></div>
              </motion.div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0 pt-2">
            <motion.div
              className="flex flex-wrap gap-2 overflow-x-auto py-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {menuItems.map((item, index) => {
                const IconComponent = iconComponents[item.icon as keyof typeof iconComponents] || Package;
                return (
                  <TooltipProvider key={item.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          variants={itemVariants}
                          whileHover="hover"
                          whileTap={{ scale: 0.95 }}
                          animate={lastPathSegment === item.path ? "hover" : "inactive"}
                          onClick={() => router.push(getLocalizedPath(item.path))}
                          className={cn(
                            "px-3 py-2 rounded-md border cursor-pointer transition-all flex items-center gap-2 min-w-fit",
                            itemColors[index % itemColors.length],
                            "hover:shadow-sm",
                            lastPathSegment === item.path && "ring-2 ring-primary/80 dark:ring-primary/60 shadow-sm"
                          )}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-xs font-medium whitespace-nowrap">
                            {item.title}
                          </span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-primary text-white text-xs">
                        <p>Aller à {item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}