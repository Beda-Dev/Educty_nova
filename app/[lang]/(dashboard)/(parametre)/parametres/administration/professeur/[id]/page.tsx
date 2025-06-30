"use client"
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSchoolStore } from "@/store";
import ProfessorTimetable from "./composant";
import { fetchProfessor, fetchTimetable } from "@/store/schoolservice";
import { Professor, Timetable } from "@/lib/interface";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";

export default function ProfesseurPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    professor,
    timetables,
    setProfessor,
    setTimetables,
  } = useSchoolStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mise à jour du store au montage
  useEffect(() => {
    async function updateStore() {
      try {
        const [profList, timetableList, mattersList] = await Promise.all([
          fetchProfessor(),
          fetchTimetable(),
          import("@/store/schoolservice").then(mod => mod.fetchMatters()),
        ]);
        if (Array.isArray(profList)) setProfessor(profList);
        if (Array.isArray(timetableList)) setTimetables(timetableList);
        if (Array.isArray(mattersList)) {
          // setMatters est dans le store
          useSchoolStore.getState().setMatters(mattersList);
        }
      } catch (e) {
        // Optionnel: gestion d'erreur
        console.error("Erreur lors de la mise à jour du store professeur/timetable/matières", e);
      } finally {
        setIsLoading(false);
      }
    }
    updateStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recherche du professeur par id (robuste)
  const professeur: Professor | null = useMemo(() => {
    if (!Array.isArray(professor)) return null;
    const profId = Number(id);
    if (isNaN(profId)) return null;
    return professor.find((p) => Number(p.id) === profId) || null;
  }, [professor, id]);

  // Recherche des timeTables liés à ce professeur (robuste)
  const professeurTimeTables: Timetable[] = useMemo(() => {
    if (!Array.isArray(timetables)) return [];
    const profId = Number(id);
    if (isNaN(profId)) return [];
    return timetables.filter((tt) => Number(tt.professor_id) === profId);
  }, [timetables, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="flex flex-row items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" />
            <CardTitle>Chargement</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Veuillez patienter pendant le chargement des données du professeur...
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!professeur) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Alert color="destructive" className="w-full max-w-md mx-auto">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertDescription>
            Professeur introuvable. Vérifiez l'identifiant ou réessayez plus tard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProfessorTimetable professor={professeur} timetables={professeurTimeTables} />
  );
}
