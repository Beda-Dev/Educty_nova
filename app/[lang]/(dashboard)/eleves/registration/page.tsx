"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, RotateCcw, GraduationCap, BookOpen, ShieldCheck, Clock } from "lucide-react";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
            <GraduationCap className="w-10 h-10 " />
            <span>Système de Gestion Scolaire</span>
          </h1>
          <p className="text-xl">Gérez facilement les inscriptions et réinscriptions des élèves</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl ">Nouvelle Inscription</CardTitle>
              <CardDescription className="text-base">
                Inscrire un nouvel élève dans l'établissement avec toutes les informations nécessaires
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-6">
                <div className="text-sm">
                  <p className="flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4 " />Informations personnelles et tuteurs</p>
                  <p className="flex items-center justify-center gap-2"><BookOpen className="w-4 h-4 " />Choix de la classe et tarification</p>
                  <p className="flex items-center justify-center gap-2"><Clock className="w-4 h-4 " />Gestion des paiements par échéances</p>
                </div>
              </div>
              <Button 
                color="indigodye"
                size="lg" 
                onClick={() => router.push("/eleves/registration/new_registration")}
              >
                Commencer l'inscription
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl ">Réinscription</CardTitle>
              <CardDescription className="text-base ">
                Réinscrire un élève existant pour une nouvelle année académique
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-6">
                <div className="text-sm ">
                  <p className="flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4 text-tyrian" />Recherche d'élève existant</p>
                  <p className="flex items-center justify-center gap-2"><BookOpen className="w-4 h-4 text-tyrian" />Sélection de la nouvelle classe</p>
                  <p className="flex items-center justify-center gap-2"><Clock className="w-4 h-4 text-tyrian" />Calcul automatique des frais</p>
                </div>
              </div>
              <Button 
                size="lg" 
                color="indigodye"
                variant="outline" 
                className="w-full"
                onClick={handleReinscriptionClick}
              >
                Procéder à la réinscription
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2 text-indigodye">Fonctionnalités du système</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-skyblue">
                <div>
                  <p className="font-medium mb-1 text-indigodye">Gestion complète</p>
                  <p>Suivi des élèves, tuteurs, classes et paiements</p>
                </div>
                <div>
                  <p className="font-medium mb-1 text-indigodye">Interface intuitive</p>
                  <p>Processus guidé étape par étape</p>
                </div>
                <div>
                  <p className="font-medium mb-1 text-indigodye">Sécurisé</p>
                  <p>Validation des données et sauvegarde automatique</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}