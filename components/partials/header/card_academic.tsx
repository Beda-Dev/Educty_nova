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
import dayjs from "dayjs";
import { FULL_ACCESS_ROLES } from "@/config/menus";

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
  // Vérifie si l'utilisateur a un rôle dans FULL_ACCESS_ROLES (comparaison insensible à la casse)
  const hasFullAccess = user?.roles?.some(userRole => 
    FULL_ACCESS_ROLES.some(role => 
      role.toLowerCase() === userRole.name.toLowerCase()
    )
  );
    
  // L'utilisateur a accès s'il a un rôle admin OU les permissions requises
  const hasAdminAccess = hasFullAccess || verificationPermission(
    { permissionNames: user.permissionNames || [] },
    permissionRequis
  );
  const currentAcademicYear = academicYearCurrent as AcademicYear;
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
        await updateStudentCountByClass(registrations, updatedYear, classes);
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

  // Trouver la période en cours pour l'année sélectionnée
  const getCurrentPeriodLabel = (): string | null => {
    const year = data.find(y => y.id.toString() === selectedYear);
    if (!year || !year.periods || year.periods.length === 0) return null;
    const now = dayjs();
    const current = year.periods.find(
      (p) =>
        (dayjs(p.pivot.start_date).isSame(now, "day") || dayjs(p.pivot.start_date).isBefore(now, "day")) &&
        (dayjs(p.pivot.end_date).isSame(now, "day") || dayjs(p.pivot.end_date).isAfter(now, "day"))
    );
    return current ? current.label : null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-2 bg-background">
        <p className="text-xs text-muted-foreground">
          Aucune année académique disponible
        </p>
      </Card>
    );
  }

  return (
    <div className="bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs hidden sm:inline text-muted-foreground">Année académique</h3>
          {!hasAdminAccess && (
            <p className="text-sm font-medium">
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
                  <>
                    <SelectValue placeholder="Sélectionnez une année" />
                    {/* Affiche la période en cours si disponible */}
                    {selectedYear && getCurrentPeriodLabel() && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({getCurrentPeriodLabel()})
                      </span>
                    )}
                  </>
                )}
              </SelectTrigger>

              <SelectContent>
                {activeAcademicYears.map((year) => (
                  <SelectItem
                    key={year.id}
                    value={year.id.toString()}
                    className="text-xs"
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