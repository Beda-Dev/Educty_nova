"use client"
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSchoolStore } from "@/store";
import ProfesseurComposant from "./composant";
import { fetchProfessor, fetchTimetable } from "@/store/schoolservice";
import { Professor, Timetable } from "@/lib/interface";

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
        const [profList, timetableList] = await Promise.all([
          fetchProfessor(),
          fetchTimetable(),
        ]);
        if (Array.isArray(profList)) setProfessor(profList);
        if (Array.isArray(timetableList)) setTimetables(timetableList);
      } catch (e) {
        // Optionnel: gestion d'erreur
        console.error("Erreur lors de la mise à jour du store professeur/timetable", e);
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
    return timetables.filter((tt) => Number(tt.professeur_id) === profId);
  }, [timetables, id]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <ProfesseurComposant professeur={professeur} timeTables={professeurTimeTables} />
  );
}
