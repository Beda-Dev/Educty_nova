"use client";
import { useState, useEffect, useCallback } from "react";
import { useSchoolStore } from "@/store";
import { Classe, Student, Registration, AcademicYear } from "@/lib/interface";
import ClassDetailsPage from "./componant";
import { 
  fetchClasses, 
  fetchStudents,
  fetchRegistration,
  fetchAcademicYears,
  fetchLevels,
  fetchSeries,
  fetchTimetable,
  fetchMatters,
  fetchEvaluations,
  fetchNotes,
  fetchProfessor,
  fetchPeriods,
  fetchHomeroomTeachers
} from "@/store/schoolservice";

// shadcn components
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon } from "lucide-react";

export interface Props {
  params: { 
    id: string;
  };
}

export default function Page({ params }: Props) {
  const { 
    classes, 
    students, 
    registrations, 
    academicYears,
    setClasses,
    setStudents,
    setRegistration,
    setAcademicYears,
    setLevels,
    setTimetables,
    setMatters,
    setEvaluations,
    setNotes,
    setProfessor,
    setPeriods,
    setSeries,
    setHomeroomTeachers
  } = useSchoolStore();
  
  const [classe, setClasse] = useState<Classe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  const loadClassData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        classesData, 
        studentsData, 
        registrationsData, 
        academicYearsData,
        levelsData,
        seriesData,
        timetablesData,
        mattersData,
        evaluationsData,
        notesData,
        professorData,
        periodsData,
        homeroomTeachersData
      ] = await Promise.all([
        fetchClasses(),
        fetchStudents(),
        fetchRegistration(),
        fetchAcademicYears(),
        fetchLevels(),
        fetchSeries(),
        fetchTimetable(),
        fetchMatters(),
        fetchEvaluations(),
        fetchNotes(),
        fetchProfessor(),
        fetchPeriods(),
        fetchHomeroomTeachers()
      ]);

      setClasses(classesData);
      setStudents(studentsData);
      setRegistration(registrationsData);
      setAcademicYears(academicYearsData);
      setLevels(levelsData);
      setSeries(seriesData);
      setTimetables(timetablesData);
      setMatters(mattersData);
      setEvaluations(evaluationsData);
      setNotes(notesData);
      setProfessor(professorData);
      setPeriods(periodsData);
      setHomeroomTeachers(homeroomTeachersData);

      const foundClass = classesData.find((c: Classe) => c.id === Number(id));
      if (!foundClass) {
        setError("Classe non trouvée");
      } else {
        setClasse(foundClass);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
      setError("Erreur lors du chargement des données de la classe");
      
      const foundClass = classes.find((c) => c.id === Number(id));
      if (foundClass) {
        setClasse(foundClass);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !classe) {
    return (
      <div className="p-6">
        <Alert color="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error || "Une erreur inconnue est survenue"}
          </AlertDescription>
          <Button 
            onClick={loadClassData}
            className="mt-4"
            variant="outline"
          >
            <LoaderIcon className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <ClassDetailsPage classe={classe} />
  );
}