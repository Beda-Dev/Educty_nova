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
import { CreditCard, History } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";

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
  "bg-whitesmoke-200 dark:bg-whitesmoke-800/50 text-whitesmoke-800 dark:text-whitesmoke-100"
];


export default function EncaissementPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  const getLocalizedPath = (path: string) => {
    return `/${lang}/${path}`;
  };

  const menuItems = [
    {
      id: "paiement",
      title: "Paiement",
      description: "Enregistrer un nouveau paiement",
      icon: <CreditCard className="w-6 h-6" />,
      path: "caisse_comptabilite/encaissement/paiement",
      color: itemColors[0]
    },
    {
      id: "historique",
      title: "Historique des paiements",
      description: "Consulter les paiements enregistrés",
      icon: <History className="w-6 h-6" />,
      path: "caisse_comptabilite/encaissement/historique_paiement",
      color: itemColors[1]
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
    }
  };


  return (
    <div className="p-4 md:p-6">
      <Card className="h-full border-none shadow-lg dark:shadow-none dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <CreditCard className="w-8 h-8 text-skyblue" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Encaissements
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestion des entrées financières de l'établissement
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
            {menuItems.map((item) => (
              <TooltipProvider key={item.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      whileHover="hover"
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
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-primary text-white">
                    <p>Accéder à {item.title.toLowerCase()}</p>
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