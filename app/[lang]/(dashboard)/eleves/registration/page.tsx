"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLastMatchingRegistration } from "./searchStudents";
import { useSchoolStore } from "@/store";
import { toast } from "sonner";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { 
  Book, 
  UserPlus, 
  SearchCheck, 
  ArrowRight,
  BadgeCheck,
  BadgeAlert,
  Loader2
} from "lucide-react";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { registrations, setReRegistrations, userOnline } = useSchoolStore();
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

  const handleReinscriptionClick = () => setIsModalOpen(true);

  const handleValidation = async () => {
    if (!userInput.trim()) {
      toast.error("Veuillez entrer un matricule valide.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulation d'un délai pour le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundRegistration = getLastMatchingRegistration(
        userInput,
        registrations
      );

      if (!foundRegistration) {
        toast.error(
          <div className="flex items-center gap-2">
            <BadgeAlert className="w-5 h-5 text-red-500" />
            <span>Aucun élève trouvé avec ce matricule</span>
          </div>,
          {
            description: "Vérifiez le matricule et réessayez."
          }
        );
        setReRegistrations(null);
        return;
      }

      setReRegistrations(foundRegistration);
      toast.success(
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-green-500" />
          <span>Élève trouvé avec succès</span>
        </div>,
        {
          description: "Redirection en cours..."
        }
      );
      
      setIsModalOpen(false);
      router.push(`/eleves/registration/re-registration`);
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2">
          <BadgeAlert className="w-5 h-5 text-red-500" />
          <span>Erreur lors de la recherche</span>
        </div>,
        {
          description: "Une erreur s'est produite. Veuillez réessayer."
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (hasAdminAccessInscrire === false) {
    return (
      <Card className="w-full min-h-[80vh] flex items-center justify-center p-6">
        <ErrorPage />
      </Card>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-lg border-0 rounded-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Book className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des inscriptions</h2>
          <p className="text-gray-600">
            Sélectionnez le type d'inscription à effectuer
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="w-full sm:w-auto justify-start gap-2 h-14" 
            onClick={handleReinscriptionClick}
          >
            <SearchCheck className="w-5 h-5" />
            <span className="flex-1 text-left">Réinscription</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            className="w-full sm:w-auto justify-start gap-2 h-14"
            variant="outline"
            onClick={() => router.push("/eleves/registration/new_registration")}
          >
            <UserPlus className="w-5 h-5" />
            <span className="flex-1 text-left">Nouvelle inscription</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Modale pour la réinscription */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <SearchCheck className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-center">Vérification du matricule</DialogTitle>
            <DialogDescription className="text-center">
              Entrez le matricule de l'élève à réinscrire
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Matricule de l'élève</Label>
              <Input
                id="userId"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ex: MAT-2023-001"
                className="py-2 h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleValidation()}
              />
            </div>
            
            <Button 
              onClick={handleValidation} 
              disabled={!userInput.trim() || isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recherche en cours...</span>
                </>
              ) : (
                <>
                  <SearchCheck className="w-4 h-4" />
                  <span>Valider et rechercher</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}