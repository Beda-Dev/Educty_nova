"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, RotateCcw, GraduationCap, BookOpen, ShieldCheck, Clock, ChevronRight } from "lucide-react";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function HomePage() {
  const { userOnline } = useSchoolStore();
  const router = useRouter();

  const permissionRequisInscrire = ["inscrire eleve"];
  const permissionRequisCreer = ["creer eleve"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
  );

  const hasAdminAccessInscrire = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisInscrire
  );

  if (hasAdminAccessInscrire === false) {
    return (
      <Card className="w-full min-h-[80vh] flex items-center justify-center p-6">
        <ErrorPage />
      </Card>
    );
  }

  const handleReinscriptionClick = () => {
    router.push("/eleves/registration/re-registration");
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-full mb-6">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Gestion du type d'inscription
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gérer les inscriptions et réinscriptions des élèves avec efficacité
          </p>
        </motion.div>

        {/* Main Cards Grid */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {/* New Registration Card */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Nouvelle Inscription
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Inscrire un nouvel élève dans l'établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Informations personnelles et tuteurs</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Choix de la classe et tarification</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Gestion des paiements par échéances</span>
                  </div>
                </div>
                <Button 
                  color="indigodye"
                  size="lg" 
                  className="w-full group"
                  onClick={() => router.push("/eleves/registration/new_registration")}
                >
                  Commencer l'inscription
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Re-registration Card */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <RotateCcw className="w-10 h-10 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Réinscription
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Réinscrire un élève existant pour une nouvelle année
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-secondary-foreground" />
                    <span>Recherche d'élève existant</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-secondary-foreground" />
                    <span>Sélection de la nouvelle classe</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-secondary-foreground" />
                    <span>Calcul automatique des frais</span>
                  </div>
                </div>
                <Button 
                  color="indigodye"
                  variant="outline"
                  size="lg" 
                  className="w-full group"
                  onClick={handleReinscriptionClick}
                >
                  Procéder à la réinscription
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0 shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-center mb-8 text-gray-900 dark:text-white">
                Fonctionnalités du système
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Gestion complète",
                    description: "Suivi des élèves, tuteurs, classes et paiements en temps réel",
                    icon: <ShieldCheck className="w-6 h-6 text-primary" />
                  },
                  {
                    title: "Interface intuitive",
                    description: "Processus guidé étape par étape pour une prise en main facile",
                    icon: <BookOpen className="w-6 h-6 text-primary" />
                  },
                  {
                    title: "Sécurisé et fiable",
                    description: "Validation des données et sauvegarde automatique des informations",
                    icon: <Clock className="w-6 h-6 text-primary" />
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}