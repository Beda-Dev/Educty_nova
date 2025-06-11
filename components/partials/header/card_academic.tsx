"use client";

import { useState, useEffect } from "react";
import { AcademicYear, User } from "@/lib/interface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchoolStore } from "@/store";
import { fetchAcademicYears } from "@/store/schoolservice";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { updateStudentCountByClass, verificationPermission } from "@/lib/fonction";
import { Card } from "@/components/ui/card";

interface AcademicYearsDisplayProps {
  data: AcademicYear[];
  user: User;
  Mobile?: boolean; 
}

const AcademicYearsDisplay: React.FC<AcademicYearsDisplayProps> = ({ 
  data, 
  user
}) => {
  const permissionRequis = ["activer annee_Academique", "creer annee_Academique", "modifier annee_Academique"];
  const { setAcademicYearCurrent, academicYearCurrent, setAcademicYears, classes, registrations } = useSchoolStore();
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/academicYear/set-current/${value}`, {
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
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Erreur:", err);
      // Revert selection on error
      setSelectedYear(currentAcademicYear?.id.toString() || "");
    } finally {
      setIsLoading(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 bg-background">
        <p className="text-sm text-muted-foreground">
          Aucune année académique disponible
        </p>
      </Card>
    );
  }

  return (
    <div className="bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Année académique</h3>
          {!hasAdminAccess && (
            <p className="text-sm">
              {currentAcademicYear?.label || "Non définie"}
            </p>
          )}
        </div>

        {hasAdminAccess && (
          <div className="flex-1 sm:max-w-[250px]">
            <Select 
              value={selectedYear} 
              onValueChange={handleYearChange}
              disabled={isLoading}
            >
              <SelectTrigger>
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
                    className="text-sm"
                  >
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {error && (
              <p className="mt-1 text-xs text-destructive">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicYearsDisplay;