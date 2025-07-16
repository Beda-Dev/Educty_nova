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
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Clock,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useSchoolStore } from "@/store"; // ⬅️ import du store pour accès à userOnline & validationExpenses
import { ValidationExpense } from "@/lib/interface";

// Rôles disposant d'un accès complet (casse & espaces ignorés)
const FULL_ACCESS_ROLES = [
  "administrateur",
  "directeur",
  "caisse",
  "caissier",
  "comptable",
];

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
  "bg-indigodye-200 dark:bg-indigodye-800/50 text-indigodye-800 dark:text-indigodye-100",
  "bg-whitesmoke-200 dark:bg-whitesmoke-800/50 text-whitesmoke-800 dark:text-whitesmoke-100",
];

export default function CaissePage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  // ——————————— store
  const { userOnline, validationExpenses } = useSchoolStore();

  // Helpers ————————————————————————————————————
  const normalize = (str?: string) =>
    str?.toLowerCase().replace(/\s+/g, "") ?? "";

  const hasFullAccess = userOnline?.roles?.some((role: any) =>
    FULL_ACCESS_ROLES.includes(normalize(role.name))
  );

  const hasPendingValidation = validationExpenses?.some(
    (v: ValidationExpense) =>
      normalize(v.validation_status) === "en attente" || normalize(v.validation_status) === "refusée" || normalize(v.validation_status) === "approuvée" && v.user_id === userOnline?.id
  );

  const getLocalizedPath = (path: string) => {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `/${lang}/${cleanPath}`;
  };

  // Définition du menu complet
  const menuItems = [
    {
      id: "encaissement",
      title: "Encaissement",
      description: "Gestion des entrées d'argent",
      icon: <ArrowDownCircle className="w-6 h-6" />,
      path: "/caisse_comptabilite/encaissement",
      color: itemColors[0],
    },
    {
      id: "decaissement",
      title: "Décaissement",
      description: "Gestion des sorties d'argent",
      icon: <ArrowUpCircle className="w-6 h-6" />,
      path: "/caisse_comptabilite/decaissement",
      color: itemColors[1],
    },
    {
      id: "sessions",
      title: "Sessions de caisse",
      description: "Historique et gestion des sessions",
      icon: <Clock className="w-6 h-6" />,
      path: "/caisse_comptabilite/session_caisse",
      color: itemColors[2],
    },
    {
      id: "demandes",
      title: "Demandes de décaissement",
      description: "Gestion des demandes de décaissement",
      icon: <FileText className="w-6 h-6" />,
      path: "/caisse_comptabilite/demandes",
      color: itemColors[3],
    },
    {
      id: "validation",
      title: "Validation des demandes de décaissement",
      description: "Gestion de la validation des décaissements",
      icon: <CheckCircle className="w-6 h-6" />,
      path: "/caisse_comptabilite/validation",
      color: itemColors[4],
    },
    {
      id: "resume",
      title: "Résumé financier des élèves",
      description: "Gestion et visualisation des paiements des élèves",
      icon: <CheckCircle className="w-6 h-6" />,
      path: "/caisse_comptabilite/resume_financie",
      color: itemColors[5],
    },
  ];

  // Filtrage selon les droits de l'utilisateur
  const filteredItems = menuItems.filter((item) => {
    if (hasFullAccess) return true; // Accès total

    if (item.id === "demandes") return true; // Demandes de décaissement tjs visible

    if (item.id === "validation" && hasPendingValidation) return true; // Validation visible si en attente

    return false; // Tout le reste masqué
  });

  // Variants animation ——————————————————
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

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
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  } as const;

  // ——————————— Render
  return (
    <div className="p-4 md:p-6">
      <Card className="h-full border-none shadow-lg dark:shadow-none dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-skyblue/10">
              <Wallet className="w-8 h-8 text-skyblue" />
            </div>
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, skyblue, #ff6f61, #66023c)",
                }}
              >
                Gestion de Caisse
              </h1>
              <p className="text-sm text-muted-foreground">
                Suivi des flux financiers de l'établissement
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item) => (
              <TooltipProvider key={item.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className={cn(
                        "relative p-6 rounded-xl border cursor-pointer transition-all h-full",
                        "flex flex-col items-start gap-4",
                        "bg-white dark:bg-gray-800/70",
                        "hover:shadow-md dark:hover:shadow-primary/10",
                        item.color,
                      )}
                      onClick={() => router.push(getLocalizedPath(item.path))}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-full flex items-center justify-center",
                          item.color.replace("text-", "bg-").split(" ")[0] + "/20",
                        )}
                      >
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
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
