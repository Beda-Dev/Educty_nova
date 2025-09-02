"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion , Variants } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Calendar,
  Layers,
  School,
  DollarSign,
  FileText,
  Briefcase,
  UserCog,
  Settings,
  Clock,
  BookOpen,
  Calculator,
  Mail
} from "lucide-react";
import { useParams } from "next/navigation";

// Couleurs personnalisées pour chaque item
const itemColors = [
  "bg-tyrian-100 dark:bg-tyrian-900/50 text-tyrian-700 dark:text-tyrian-200",
  "bg-bittersweet-100 dark:bg-bittersweet-900/50 text-bittersweet-700 dark:text-bittersweet-200",
  "bg-whitesmoke-100 dark:bg-whitesmoke-900/50 text-whitesmoke-700 dark:text-whitesmoke-200",
  "bg-skyblue-100 dark:bg-skyblue-900/50 text-skyblue-700 dark:text-skyblue-200",
  "bg-indigodye-100 dark:bg-indigodye-900/50 text-indigodye-700 dark:text-indigodye-200",
  "bg-tyrian-200 dark:bg-tyrian-800/50 text-tyrian-800 dark:text-tyrian-100",
  "bg-bittersweet-200 dark:bg-bittersweet-800/50 text-bittersweet-800 dark:text-bittersweet-100",
  "bg-skyblue-200 dark:bg-skyblue-800/50 text-skyblue-800 dark:text-skyblue-100",
  "bg-indigodye-200 dark:bg-indigodye-800/50 text-indigodye-800 dark:text-indigodye-100"
];


export default function Page() {
  const router = useRouter();
  const { theme: config } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);
  const params = useParams();
  const lang = params.lang as string;

  const getLocalizedPath = (path: string) => {
    // Supprime le slash initial s'il existe pour éviter les doubles slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/${lang}/${cleanPath}`;
  };

  const menuItems = [
    {
      id: "users",
      title: "Utilisateurs",
      description: "Gérer les comptes utilisateurs et permissions",
      icon: <Users className="w-6 h-6" />,
      path: "/users",
      color: itemColors[0]
    },
    {
      id: "academic-year",
      title: "Année Académique",
      description: "Configurer les années scolaires et périodes",
      icon: <Calendar className="w-6 h-6" />,
      path: "/academic_year",
      color: itemColors[1]
    },
    {
      id: "levels",
      title: "Niveaux",
      description: "Gérer les niveaux d'études",
      icon: <Layers className="w-6 h-6" />,
      path: "/level",
      color: itemColors[2]
    },
    {
      id: "classes",
      title: "Classes",
      description: "Gérer les classes et sections",
      icon: <School className="w-6 h-6" />,
      path: "/classe",
      color: itemColors[3]
    },
    {
      id: "fees",
      title: "Frais Scolaires",
      description: "Configurer les frais et paiements",
      icon: <DollarSign className="w-6 h-6" />,
      path: "/frais-scolaires",
      color: itemColors[4]
    },
    {
      id: "documents",
      title: "Documents",
      description: "Gérer les modèles de documents",
      icon: <FileText className="w-6 h-6" />,
      path: "/type_document",
      color: itemColors[5]
    },
    {
      id: "roles",
      title: "Fonctions",
      description: "Gérer les rôles et fonctions du personnel",
      icon: <Briefcase className="w-6 h-6" />,
      path: "/fonctions",
      color: itemColors[6]
    },
    {
      id: "employees",
      title: "Employés",
      description: "Gérer le personnel administratif et enseignant",
      icon: <UserCog className="w-6 h-6" />,
      path: "/employes",
      color: itemColors[7]
    }
  ];

  const containerVariants : Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants : Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      },
    },
    tap: {
      scale: 0.98,
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card className="h-full border-none shadow-lg dark:shadow-none dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-skyblue/10">
              <Settings className="w-8 h-8 text-skyblue" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Paramètres
              </h1>
              <p className="text-sm text-muted-foreground">
                Configurez les paramètres du système selon vos besoins
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {menuItems.map((item) => (
              <TooltipProvider key={item.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className={cn(
                        "p-6 rounded-xl border cursor-pointer transition-all",
                        "flex flex-col items-start gap-4",
                        "bg-white dark:bg-gray-800/70",
                        "hover:shadow-md dark:hover:shadow-primary/10",
                        item.color
                      )}
                      onClick={() => router.push(getLocalizedPath(item.path))}
                    >
                      <div className={cn(
                        "p-3 rounded-full flex items-center justify-center",
                        item.color.replace('text-', 'bg-').split(' ')[0] + '/20'
                      )}>
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.description}
                        </p>
                      </div>
                      <motion.div 
                        className="absolute bottom-4 right-4 text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        →
                      </motion.div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-primary text-white">
                    <p>Cliquez pour gérer {item.title.toLowerCase()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}