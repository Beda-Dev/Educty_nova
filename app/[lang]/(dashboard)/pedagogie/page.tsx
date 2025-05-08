"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Clock,
  Notebook,
  ClipboardList,
  Library,
  Bookmark
} from "lucide-react";
import { useParams } from "next/navigation";

// Couleurs personnalisées pour chaque item
const itemColors = [
  "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300",
  "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300",
  "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300",
  "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300",
  "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300"
];

export default function PedagogiePage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  const getLocalizedPath = (path: string) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/${lang}/${cleanPath}`;
  };

  const menuItems = [
    {
      id: "grades",
      title: "Notes",
      description: "Gestion des notes et évaluations",
      icon: <BookOpen className="w-6 h-6" />,
      path: "notes",
      color: itemColors[0]
    },
    {
      id: "schedule",
      title: "Emploi du temps",
      description: "Planning des cours et activités",
      icon: <Clock className="w-6 h-6" />,
      path: "emploi_du_temps",
      color: itemColors[1]
    },
    {
      id: "cahier-text",
      title: "Cahier de text",
      description: "Travaux et devoirs à faire",
      icon: <Notebook className="w-6 h-6" />,
      path: "cahier-text",
      color: itemColors[2]
    },
    {
      id: "presence",
      title: "Liste de présence",
      description: "Suivi des absences et présences",
      icon: <ClipboardList className="w-6 h-6" />,
      path: "liste-presence",
      color: itemColors[3]
    },
    {
      id: "library",
      title: "Bibliothèque",
      description: "Ressources pédagogiques",
      icon: <Library className="w-6 h-6" />,
      path: "bibliotheque",
      color: itemColors[4]
    }
  ];

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
            <div className="p-3 rounded-full bg-primary/10">
              <Bookmark className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Pédagogie
              </h1>
              <p className="text-sm text-muted-foreground">
                Outils pédagogiques pour l'enseignement et l'apprentissage
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
                    <p>Cliquez pour accéder à {item.title.toLowerCase()}</p>
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