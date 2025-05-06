"use client";

import { useState, useEffect } from "react";
import { AcademicYear, User } from "@/lib/interface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchoolStore } from "@/store";
import { fetchAcademicYears } from "@/store/schoolservice";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {updateStudentCountByClass , verificationPermission } from "@/lib/fonction";

interface AcademicYearsDisplayProps {
  data: AcademicYear[];
  user: User;
  Mobile: boolean;
}

const AcademicYearsDisplay: React.FC<AcademicYearsDisplayProps> = ({ 
  data, 
  user, 
  Mobile 
}) => {
  const permissionRequis = ["activer annee_Academique", "creer annee_Academique", "modifier annee_Academique"];
  const { setAcademicYearCurrent, academicYearCurrent, setAcademicYears , classes , registrations , roles , permissions } = useSchoolStore();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentAcademicYear = academicYearCurrent as AcademicYear;
  const hasAdminAccess = verificationPermission(
    { permissionNames: user.permissionNames || [] },
    permissionRequis
  );
  const activeAcademicYears = data?.filter(year => year.active === 1) || [];

  // Initialize selected year
  useEffect(() => {
    if (currentAcademicYear?.id) {
      setSelectedYear(currentAcademicYear.id.toString());
    }
  }, [currentAcademicYear]);

  const handleYearChange = async (value: string) => {
    if (!value) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://educty.digifaz.com/api/academicYear/set-current/${value}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour de l'année académique");
      }

      const updatedYears = await fetchAcademicYears();
      if (updatedYears) {
        setAcademicYears(updatedYears);
      }

      const updatedYear = activeAcademicYears.find(year => year.id.toString() === value);
      if (updatedYear) {
        setAcademicYearCurrent(updatedYear);
        updateStudentCountByClass(registrations, updatedYear, classes);
        toast.success("Année académique mise à jour avec succès");
      } else {
        throw new Error("Année académique non trouvée");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue");
      toast.error(error || "Erreur lors de la mise à jour");
      console.error("Erreur:", err);
      // Revert selection on error
      setSelectedYear(currentAcademicYear?.id.toString() || "");
    } finally {
      setIsLoading(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <p className={`text-${Mobile ? "xs" : "sm"} text-muted-foreground`}>
        Aucune année académique disponible
      </p>
    );
  }

  return (
    <div className={`text-${Mobile ? "xs" : "sm"} text-muted-foreground p-${Mobile ? "1" : "2"}`}>
      {hasAdminAccess ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="whitespace-nowrap">
            Année académique :
          </span>
          
          <Select 
            value={selectedYear} 
            onValueChange={handleYearChange}
            disabled={isLoading}
          >
            <SelectTrigger className={`w-[${Mobile ? "120px" : "180px"}]`}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <SelectValue placeholder="Sélectionnez une année" />
              )}
            </SelectTrigger>
            
            <SelectContent>
              {activeAcademicYears.map((year) => (
                <SelectItem 
                  key={year.id} 
                  value={year.id.toString()}
                  className={Mobile ? "text-xs" : "text-sm"}
                >
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <p className={Mobile ? "text-xs" : "text-sm"}>
          Année académique : {currentAcademicYear?.label || "Non définie"}
        </p>
      )}
    </div>
  );
};

export default AcademicYearsDisplay;