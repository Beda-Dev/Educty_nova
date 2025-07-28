"use client";

import React, { useState, useEffect } from "react";
import { Professor, Timetable, TimetableFormData, AcademicYear, Classe, Matter, Period, Setting } from "@/lib/interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Briefcase, 
  School, 
  Building2, 
  Home, 
  ClipboardList,
  Save,
  Eye,
  GraduationCap,
  UserCheck,
  Calendar as CalendarIcon,
  Info,
  Star,
  Award,
  Target
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store/index";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { fetchTimetable } from "@/store/schoolservice";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfessorTimetableProps {
  professor: Professor;
  timetables: Timetable[];
}

const DAYS_OF_WEEK = [
  { value: "lundi", label: "Lundi", short: "Lun" },
  { value: "mardi", label: "Mardi", short: "Mar" },
  { value: "mercredi", label: "Mercredi", short: "Mer" },
  { value: "jeudi", label: "Jeudi", short: "Jeu" },
  { value: "vendredi", label: "Vendredi", short: "Ven" },
  { value: "samedi", label: "Samedi", short: "Sam" }
];

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00"
];

export default function ProfessorTimetable({ professor, timetables: initialTimetables }: ProfessorTimetableProps) {
  const { toast } = useToast();
  const { 
    academicYears, 
    classes, 
    matters, 
    periods,
    settings,
    students,
    setTimetables 
  } = useSchoolStore();

  // État local pour gérer les modifications
  const [localTimetables, setLocalTimetables] = useState<Timetable[]>(initialTimetables);
  const [pendingChanges, setPendingChanges] = useState({
    toCreate: [] as TimetableFormData[],
    toUpdate: [] as (TimetableFormData & { id: number })[],
    toDelete: [] as number[]
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<"timetable" | "profile" | "grid">("grid");
  const [selectedYear, setSelectedYear] = useState<string>(academicYears[0]?.id?.toString() || "");

  const [formData, setFormData] = useState<TimetableFormData>({
    academic_year_id: "",
    class_id: "",
    professor_id: professor.id.toString(),
    matter_id: "",
    period_id: "",
    day: "",
    start_date: "",
    end_date: "",
    room: "",
    start_time: "",
    end_time: ""
  });

  const [errors, setErrors] = useState<Partial<TimetableFormData>>({});

  // Filtrer les périodes selon l'année académique sélectionnée
  const periodsForSelectedYear = React.useMemo(() => {
    const year = academicYears.find(y => y.id.toString() === formData.academic_year_id);
    if (year && Array.isArray(year.periods)) {
      return year.periods;
    }
    return [];
  }, [formData.academic_year_id, academicYears]);

  // Synchroniser les modifications locales
  useEffect(() => {
    let updated = [...initialTimetables];
    
    // Appliquer les suppressions
    updated = updated.filter(t => !pendingChanges.toDelete.includes(t.id));
    
    // Appliquer les modifications
    updated = updated.map(t => {
      const upd = pendingChanges.toUpdate.find(u => u.id === t.id);
      return upd ? { ...t, ...upd } : t;
    });
    
    // Ajouter les créations (avec des IDs temporaires négatifs)
    const created = pendingChanges.toCreate.map((c, idx) => ({
      ...c,
      id: -(idx + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      academic_year: academicYears.find(y => y.id.toString() === c.academic_year_id) || {} as any,
      professor: professor,
      class: classes.find(cl => cl.id.toString() === c.class_id) || {} as any,
      matter: matters.find(m => m.id.toString() === c.matter_id) || {} as any,
      period: periods.find(p => p.id.toString() === c.period_id) || {} as any,
    }));
    
    setLocalTimetables([...updated, ...created]);
  }, [pendingChanges, initialTimetables, academicYears, classes, matters, periods, professor]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Partial<TimetableFormData> = {};

    if (!formData.academic_year_id) newErrors.academic_year_id = "Année académique requise";
    if (!formData.class_id) newErrors.class_id = "Classe requise";
    if (!formData.matter_id) newErrors.matter_id = "Matière requise";
    if (!formData.period_id) newErrors.period_id = "Période requise";
    if (!formData.day) newErrors.day = "Jour requis";
    if (!formData.start_date) newErrors.start_date = "Date de début requise";
    if (!formData.end_date) newErrors.end_date = "Date de fin requise";
    if (!formData.room) newErrors.room = "Salle requise";
    if (!formData.start_time) newErrors.start_time = "Heure de début requise";
    if (!formData.end_time) newErrors.end_time = "Heure de fin requise";

    // Validation des heures
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(`2000-01-01T${formData.start_time}`);
      const endTime = new Date(`2000-01-01T${formData.end_time}`);

      if (startTime >= endTime) {
        newErrors.end_time = "L'heure de fin doit être après l'heure de début";
      }

      // Vérification des créneaux interdits
      const recreationStart = new Date(`2000-01-01T10:15`);
      const recreationEnd = new Date(`2000-01-01T10:30`);
      const pauseStart = new Date(`2000-01-01T12:05`);
      const pauseEnd = new Date(`2000-01-01T13:00`);

      if ((startTime < recreationEnd && endTime > recreationStart) ||
          (startTime < pauseEnd && endTime > pauseStart)) {
        newErrors.start_time = "Créneau en conflit avec les pauses";
        newErrors.end_time = "Créneau en conflit avec les pauses";
      }
    }

    // Validation des dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate > endDate) {
        newErrors.end_date = "La date de fin doit être après la date de début";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Vérification des conflits d'horaires
  const checkTimeConflict = (newTimetable: TimetableFormData, excludeId?: number): boolean => {
    return localTimetables.some(existing => {
      if (excludeId && existing.id === excludeId) return false;
      
      return (
        existing.day === newTimetable.day &&
        existing.academic_year_id === newTimetable.academic_year_id &&
        existing.professor_id === newTimetable.professor_id &&
        ((newTimetable.start_time >= existing.start_time && newTimetable.start_time < existing.end_time) ||
         (newTimetable.end_time > existing.start_time && newTimetable.end_time <= existing.end_time) ||
         (newTimetable.start_time <= existing.start_time && newTimetable.end_time >= existing.end_time))
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        color: "destructive"
      });
      return;
    }

    if (checkTimeConflict(formData, editingTimetable?.id)) {
      toast({
        title: "Conflit d'horaire",
        description: "Ce créneau horaire est déjà occupé pour ce professeur.",
        color: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingTimetable) {
        if (editingTimetable.id < 0) {
          // Modification d'une création en attente
          setPendingChanges(prev => ({
            ...prev,
            toCreate: prev.toCreate.map(t => 
              t === editingTimetable ? { ...formData, id: editingTimetable.id } : t
            )
          }));
        } else {
          // Modification d'un élément existant
          setPendingChanges(prev => ({
            ...prev,
            toUpdate: [...prev.toUpdate.filter(u => u.id !== editingTimetable.id), 
                      { ...formData, id: editingTimetable.id }]
          }));
        }
        toast({
          title: "Créneau modifié",
          description: "Les modifications seront enregistrées lors de la sauvegarde.",
        });
      } else {
        // Nouvelle création
        setPendingChanges(prev => ({
          ...prev,
          toCreate: [...prev.toCreate, formData]
        }));
        toast({
          title: "Créneau ajouté",
          description: "Le créneau sera créé lors de la sauvegarde.",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification.",
        color: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (timetableId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?")) return;

    if (timetableId < 0) {
      // Suppression d'une création en attente
      setPendingChanges(prev => ({
        ...prev,
        toCreate: prev.toCreate.filter((t, idx) => -(idx + 1) !== timetableId)
      }));
    } else {
      // Suppression d'un élément existant
      setPendingChanges(prev => ({
        ...prev,
        toDelete: [...prev.toDelete, timetableId],
        toUpdate: prev.toUpdate.filter(u => u.id !== timetableId)
      }));
    }

    toast({
      title: "Créneau supprimé",
      description: "La suppression sera effective lors de la sauvegarde.",
    });
  };

  const resetForm = () => {
    setFormData({
      academic_year_id: "",
      class_id: "",
      professor_id: professor.id.toString(),
      matter_id: "",
      period_id: "",
      day: "",
      start_date: "",
      end_date: "",
      room: "",
      start_time: "",
      end_time: ""
    });
    setErrors({});
    setEditingTimetable(null);
  };

  const openEditDialog = (timetable: Timetable) => {
    setFormData({
      academic_year_id: timetable.academic_year_id,
      class_id: timetable.class_id,
      professor_id: timetable.professor_id,
      matter_id: timetable.matter_id,
      period_id: timetable.period_id,
      day: timetable.day,
      start_date: timetable.start_date,
      end_date: timetable.end_date,
      room: timetable.room,
      start_time: timetable.start_time,
      end_time: timetable.end_time
    });
    setEditingTimetable(timetable);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    
    try {
      // Créations
      for (const data of pendingChanges.toCreate) {
        const res = await fetch("/api/timeTable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            academic_year_id: Number(data.academic_year_id),
            class_id: Number(data.class_id),
            professor_id: Number(data.professor_id),
            matter_id: Number(data.matter_id),
            period_id: Number(data.period_id),
          }),
        });
        
        if (!res.ok) {
          throw new Error("Erreur lors de la création");
        }
      }

      // Modifications
      for (const data of pendingChanges.toUpdate) {
        const res = await fetch(`/api/timeTable/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            academic_year_id: Number(data.academic_year_id),
            class_id: Number(data.class_id),
            professor_id: Number(data.professor_id),
            matter_id: Number(data.matter_id),
            period_id: Number(data.period_id),
          }),
        });
        
        if (!res.ok) {
          throw new Error("Erreur lors de la modification");
        }
      }

      // Suppressions
      for (const id of pendingChanges.toDelete) {
        const res = await fetch(`/api/timeTable/${id}`, {
          method: "DELETE",
        });
        
        if (!res.ok) {
          throw new Error("Erreur lors de la suppression");
        }
      }

      // Réinitialiser les modifications en attente
      setPendingChanges({
        toCreate: [],
        toUpdate: [],
        toDelete: []
      });

      // Rafraîchir les données
      const refreshed: Timetable[] = await fetchTimetable();
      if (refreshed) {
        const professorTimetables = refreshed.filter(t => Number(t.professor_id) === Number(professor.id));
        setLocalTimetables(professorTimetables);
        setTimetables(refreshed);
      }

      toast({
        title: "Modifications enregistrées",
        description: "Toutes les modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur lors de l'enregistrement",
        description: "Une erreur est survenue lors de l'enregistrement des modifications.",
        color: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Statistiques
  const totalHours = localTimetables.reduce((total, t) => {
    const start = new Date(`2000-01-01T${t.start_time}`);
    const end = new Date(`2000-01-01T${t.end_time}`);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  const uniqueClasses = Array.from(new Set(localTimetables.map(t => t.class_id)));
  const uniqueMatters = Array.from(new Set(localTimetables.map(t => t.matter_id)));

  // Calculer le nombre total d'étudiants
  const totalStudents = uniqueClasses.reduce((total, classId) => {
    const classe = classes.find(c => c.id.toString() === classId);
    return total + (classe?.student_number ? Number(classe.student_number) : 0);
  }, 0);

  // Grouper les emplois du temps par année académique
  const timetablesByYear = React.useMemo(() => {
    const grouped: Record<string, Timetable[]> = {};
    for (const t of localTimetables) {
      const yearId = Number(t.academic_year_id);
      if (!grouped[yearId]) grouped[yearId] = [];
      grouped[yearId].push(t);
    }
    return grouped;
  }, [localTimetables]);

  // Créer la grille d'emploi du temps
  const createTimetableGrid = (yearTimetables: Timetable[]) => {
    const grid: Record<string, Record<string, Timetable[]>> = {};
    
    DAYS_OF_WEEK.forEach(day => {
      grid[day.value] = {};
      TIME_SLOTS.forEach(time => {
        grid[day.value][time] = [];
      });
    });

    yearTimetables.forEach(timetable => {
      const startTime = timetable.start_time.substring(0, 5);
      if (grid[timetable.day] && grid[timetable.day][startTime]) {
        grid[timetable.day][startTime].push(timetable);
      }
    });

    return grid;
  };

  const hasPendingChanges = pendingChanges.toCreate.length > 0 || 
                          pendingChanges.toUpdate.length > 0 || 
                          pendingChanges.toDelete.length > 0;

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* En-tête avec informations du professeur */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={professor?.user?.avatar || ""} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                    {(professor?.name?.charAt(0) || "") + (professor?.first_name?.charAt(0) || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl text-gray-900 flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                    {professor?.name || "-"} {professor?.first_name || ""}
                  </CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2 mt-2">
                    <UserCheck className="h-5 w-5" />
                    Professeur {professor?.type === "permanent" ? "permanent" : professor?.type === "vacataire" ? "vacataire" : "-"}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {professor?.user?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{professor.user.email}</span>
                      </div>
                    )}
                    {professor?.number && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>N° {professor.number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  color={professor?.type === "permanent" ? "default" : "secondary"} 
                  className="text-sm px-4 py-2 mb-2"
                >
                  {professor?.type === "permanent" ? "Permanent" : professor?.type === "vacataire" ? "Vacataire" : "Type inconnu"}
                </Badge>
                <div className="text-sm text-gray-600">
                  <div>Matricule: {professor?.matricule || "Non renseigné"}</div>
                  <div>CNI: {professor?.cni || "Non renseigné"}</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{localTimetables.length}</p>
                  <p className="text-sm text-gray-600 font-medium">Créneaux total</p>
                </div>
                <Calendar className="h-10 w-10 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{uniqueMatters.length}</p>
                  <p className="text-sm text-gray-600 font-medium">Disciplines</p>
                </div>
                <BookOpen className="h-10 w-10 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-600">{uniqueClasses.length}</p>
                  <p className="text-sm text-gray-600 font-medium">Classes</p>
                </div>
                <Users className="h-10 w-10 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-orange-600">{totalHours.toFixed(1)}h</p>
                  <p className="text-sm text-gray-600 font-medium">Heures/semaine</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Classes enseignées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uniqueClasses.map(classId => {
                  const classe = classes.find(c => Number(c.id) === Number(classId));
                  const classeTimetables = localTimetables.filter(t => Number(t.class_id) === Number(classId));
                  const hoursForClass = classeTimetables.reduce((total, t) => {
                    const start = new Date(`2000-01-01T${t.start_time}`);
                    const end = new Date(`2000-01-01T${t.end_time}`);
                    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }, 0);
                  
                  return (
                    <div key={classId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{classe?.label || classId}</Badge>
                        <span className="text-sm text-gray-600">
                          {classe?.student_number || 0} élève{( Number(classe?.student_number) || 0) > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        {hoursForClass.toFixed(1)}h/sem
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Matières enseignées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uniqueMatters.map(matterId => {
                  const matter = matters.find(m => m.id.toString() === matterId);
                  const matterTimetables = localTimetables.filter(t => t.matter_id === matterId);
                  const hoursForMatter = matterTimetables.reduce((total, t) => {
                    const start = new Date(`2000-01-01T${t.start_time}`);
                    const end = new Date(`2000-01-01T${t.end_time}`);
                    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }, 0);
                  
                  return (
                    <div key={matterId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{matter?.name || matterId}</span>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {hoursForMatter.toFixed(1)}h/sem
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation des vues */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                  Emploi du temps
                </CardTitle>
                <CardDescription>
                  Gestion des créneaux horaires du professeur
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {hasPendingChanges && (
                  <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer ({pendingChanges.toCreate.length + pendingChanges.toUpdate.length + pendingChanges.toDelete.length})
                      </>
                    )}
                  </Button>
                )}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un créneau
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {editingTimetable ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        {editingTimetable ? "Modifier le créneau" : "Ajouter un créneau"}
                      </DialogTitle>
                      <DialogDescription>
                        Définissez les détails du créneau horaire pour {professor.name} {professor.first_name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="academic_year_id" className="text-sm font-medium">
                            Année académique *
                          </Label>
                          <Select
                            value={formData.academic_year_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: value }))}
                          >
                            <SelectTrigger className={cn("h-11", errors.academic_year_id && "border-red-500")}>
                              <SelectValue placeholder="Sélectionner l'année académique" />
                            </SelectTrigger>
                            <SelectContent>
                              {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id.toString()}>
                                  {year.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.academic_year_id && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.academic_year_id}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="class_id" className="text-sm font-medium">
                            Classe *
                          </Label>
                          <Select
                            value={formData.class_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}
                          >
                            <SelectTrigger className={cn("h-11", errors.class_id && "border-red-500")}>
                              <SelectValue placeholder="Sélectionner la classe" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classe) => (
                                <SelectItem key={classe.id} value={classe.id.toString()}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{classe.label}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {classe.student_number || 0} élèves
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.class_id && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.class_id}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="matter_id" className="text-sm font-medium">
                            Matière *
                          </Label>
                          <Select
                            value={formData.matter_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, matter_id: value }))}
                          >
                            <SelectTrigger className={cn("h-11", errors.matter_id && "border-red-500")}>
                              <SelectValue placeholder="Sélectionner la matière" />
                            </SelectTrigger>
                            <SelectContent>
                              {matters.map((matter) => (
                                <SelectItem key={matter.id} value={matter.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {matter.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.matter_id && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.matter_id}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="period_id" className="text-sm font-medium">
                            Période *
                          </Label>
                          <Select
                            value={formData.period_id}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, period_id: value }))}
                            disabled={!formData.academic_year_id}
                          >
                            <SelectTrigger className={cn("h-11", errors.period_id && "border-red-500")}>
                              <SelectValue placeholder={formData.academic_year_id ? "Sélectionner la période" : "Sélectionnez d'abord l'année"} />
                            </SelectTrigger>
                            <SelectContent>
                              {periodsForSelectedYear.map((period) => (
                                <SelectItem key={period.id} value={period.id.toString()}>
                                  {period.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.period_id && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.period_id}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="day" className="text-sm font-medium">
                            Jour *
                          </Label>
                          <Select
                            value={formData.day}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}
                          >
                            <SelectTrigger className={cn("h-11", errors.day && "border-red-500")}>
                              <SelectValue placeholder="Sélectionner le jour" />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.day && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.day}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="room" className="text-sm font-medium">
                            Salle *
                          </Label>
                          <Input
                            id="room"
                            value={formData.room}
                            onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                            placeholder="Ex: Salle 101, Laboratoire..."
                            className={cn("h-11", errors.room && "border-red-500")}
                          />
                          {errors.room && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.room}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="start_date" className="text-sm font-medium">
                            Date de début *
                          </Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                            className={cn("h-11", errors.start_date && "border-red-500")}
                          />
                          {errors.start_date && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.start_date}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end_date" className="text-sm font-medium">
                            Date de fin *
                          </Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                            className={cn("h-11", errors.end_date && "border-red-500")}
                          />
                          {errors.end_date && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.end_date}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="start_time" className="text-sm font-medium">
                            Heure de début *
                          </Label>
                          <Input
                            id="start_time"
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                            className={cn("h-11", errors.start_time && "border-red-500")}
                          />
                          {errors.start_time && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.start_time}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end_time" className="text-sm font-medium">
                            Heure de fin *
                          </Label>
                          <Input
                            id="end_time"
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                            className={cn("h-11", errors.end_time && "border-red-500")}
                          />
                          {errors.end_time && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.end_time}
                            </p>
                          )}
                        </div>
                      </div>

                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Rappel :</strong> Les créneaux ne peuvent pas être programmés pendant les pauses (10h15-10h30 et 12h05-13h00).
                          Les cours doivent se dérouler entre 07h00 et 20h00.
                        </AlertDescription>
                      </Alert>

                      <DialogFooter className="gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isLoading}
                        >
                          Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              {editingTimetable ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                              {editingTimetable ? "Modifier" : "Créer"}
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={view} onValueChange={(value) => setView(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Vue grille
                </TabsTrigger>
                <TabsTrigger value="timetable" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Vue liste
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Fiche professeur
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Label htmlFor="year-select" className="text-sm font-medium">
                    Année académique :
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedYear && (
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="grid grid-cols-8 bg-gray-50">
                      <div className="p-3 border-r font-medium text-center">Horaires</div>
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day.value} className="p-3 border-r font-medium text-center">
                          <div className="font-semibold">{day.short}</div>
                          <div className="text-xs text-gray-500">{day.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    <ScrollArea className="h-[600px]">
                      {(() => {
                        const yearTimetables = timetablesByYear[Number(selectedYear)] || [];
                        const grid = createTimetableGrid(yearTimetables);
                        
                        return TIME_SLOTS.map(time => (
                          <div key={time} className="grid grid-cols-8 border-b hover:bg-gray-50">
                            <div className="p-3 border-r text-sm font-medium text-center bg-gray-50">
                              {time}
                            </div>
                            {DAYS_OF_WEEK.map(day => (
                              <div key={day.value} className="p-2 border-r min-h-[60px]">
                                {grid[day.value][time]?.map(timetable => (
                                  <Tooltip key={timetable.id}>
                                    <TooltipTrigger asChild>
                                      <div className="bg-blue-100 border-l-4 border-l-blue-500 p-2 rounded text-xs mb-1 cursor-pointer hover:bg-blue-200 transition-colors">
                                        <div className="font-medium text-blue-800">
                                          {matters.find(m => Number(m.id) === Number(timetable.matter_id))?.name}
                                        </div>
                                        <div className="text-blue-600">
                                          {classes.find(c => Number(c.id) === Number(timetable.class_id))?.label}
                                        </div>
                                        <div className="text-blue-500 flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {timetable.room}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 hover:bg-blue-300"
                                            onClick={() => openEditDialog(timetable)}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 hover:bg-red-300 text-red-600"
                                            onClick={() => handleDelete(timetable.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-sm">
                                        <div className="font-medium">{matters.find(m => Number(m.id) === Number(timetable.matter_id))?.name}</div>
                                        <div>Classe: {classes.find(c => Number(c.id) === Number(timetable.class_id))?.label}</div>
                                        <div>Salle: {timetable.room}</div>
                                        <div>Horaire: {timetable.start_time} - {timetable.end_time}</div>
                                        <div>Période: {periods.find(p => Number(p.id) === Number(timetable.period_id))?.label}</div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timetable" className="space-y-4">
                <Tabs defaultValue={academicYears[0]?.id?.toString() || ""} className="w-full">
                  <TabsList className="overflow-x-auto flex">
                    {academicYears.map((year) => (
                      <TabsTrigger key={year.id} value={year.id.toString()}>
                        {year.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {academicYears.map((year) => (
                    <TabsContent key={year.id} value={year.id.toString()}>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Jour</TableHead>
                              <TableHead>Horaire</TableHead>
                              <TableHead>Matière</TableHead>
                              <TableHead>Classe</TableHead>
                              <TableHead>Salle</TableHead>
                              <TableHead>Période</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(timetablesByYear[Number(year.id)] || []).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                  <div className="flex flex-col items-center gap-2">
                                    <Calendar className="h-8 w-8 text-gray-400" />
                                    <span>Aucun créneau programmé pour cette année</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              (timetablesByYear[Number(year.id)] || [])
                                .sort((a, b) => {
                                  const dayOrder = DAYS_OF_WEEK.findIndex(d => d.value === a.day) - 
                                                  DAYS_OF_WEEK.findIndex(d => d.value === b.day);
                                  if (dayOrder !== 0) return dayOrder;
                                  return a.start_time.localeCompare(b.start_time);
                                })
                                .map((timetable) => (
                                  <TableRow key={timetable.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                      {DAYS_OF_WEEK.find(d => d.value === timetable.day)?.label}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="font-mono">
                                        {timetable.start_time} - {timetable.end_time}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-green-600" />
                                        {matters.find(m => Number(m.id) === Number(timetable.matter_id))?.name}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge color="secondary">
                                        {classes.find(c => Number(c.id) === Number(timetable.class_id))?.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-gray-400" />
                                        <span>{timetable.room}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {periods.find(p => Number(p.id) === Number(timetable.period_id))?.label}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => openEditDialog(timetable)}
                                              disabled={isLoading}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Modifier ce créneau</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleDelete(timetable.id)}
                                              disabled={isLoading}
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Supprimer ce créneau</TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>

              <TabsContent value="profile">
                <Card className="max-w-4xl mx-auto shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <School className="h-8 w-8 text-blue-600" />
                        <div>
                          <CardTitle className="text-xl">
                            {settings[0]?.establishment_name || "Établissement scolaire"}
                          </CardTitle>
                          <CardDescription>
                            Fiche professeur - {professor.name} {professor.first_name}
                          </CardDescription>
                        </div>
                      </div>
                      {settings[0]?.establishment_logo && (
                        <img
                          src={settings[0].establishment_logo}
                          alt="Logo"
                          className="h-16 w-auto object-contain"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    {/* Informations personnelles */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                      <div className="lg:col-span-1">
                        <div className="text-center">
                          <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-blue-200">
                            <AvatarImage src={professor?.user?.avatar || ""} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-bold">
                              {(professor?.name?.charAt(0) || "") + (professor?.first_name?.charAt(0) || "")}
                            </AvatarFallback>
                          </Avatar>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {professor.name} {professor.first_name}
                          </h2>
                          <Badge 
                            color={professor?.type === "permanent" ? "default" : "secondary"}
                            className="text-sm px-4 py-2"
                          >
                            {professor?.type === "permanent" ? "Professeur permanent" : "Professeur vacataire"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                              Informations personnelles
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Matricule:</span>
                                <span className="font-medium">{professor?.matricule || "Non renseigné"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">CNI:</span>
                                <span className="font-medium">{professor?.cni || "Non renseigné"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Sexe:</span>
                                <span className="font-medium">
                                  {professor?.sexe ? professor.sexe.charAt(0).toUpperCase() + professor.sexe.slice(1) : "Non renseigné"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Téléphone:</span>
                                <span className="font-medium">{professor?.number || "Non renseigné"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="font-medium">{professor?.user?.email || "Non renseigné"}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                              Statistiques d'enseignement
                            </h3>
                            <div className="space-y-3">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-blue-600">Créneaux total</span>
                                  <span className="font-bold text-blue-800">{localTimetables.length}</span>
                                </div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-green-600">Disciplines</span>
                                  <span className="font-bold text-green-800">{uniqueMatters.length}</span>
                                </div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-purple-600">Classes</span>
                                  <span className="font-bold text-purple-800">{uniqueClasses.length}</span>
                                </div>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-orange-600">Heures/semaine</span>
                                  <span className="font-bold text-orange-800">{totalHours.toFixed(1)}h</span>
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Total étudiants</span>
                                  <span className="font-bold text-gray-800">{totalStudents}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Emploi du temps détaillé */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                        Emploi du temps détaillé
                      </h3>
                      
                      {localTimetables.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">Aucun créneau programmé</p>
                          <p className="text-sm">Ajoutez des créneaux pour voir l'emploi du temps</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {DAYS_OF_WEEK.map(day => {
                            const dayTimetables = localTimetables
                              .filter(t => t.day === day.value)
                              .sort((a, b) => a.start_time.localeCompare(b.start_time));
                            
                            if (dayTimetables.length === 0) return null;
                            
                            return (
                              <div key={day.value} className="border rounded-lg p-4">
                                <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                  <Calendar className="h-5 w-5 text-blue-600" />
                                  {day.label}
                                </h4>
                                <div className="grid gap-3">
                                  {dayTimetables.map(timetable => (
                                    <div key={timetable.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-l-blue-500">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <Badge variant="outline" className="font-mono">
                                            {timetable.start_time} - {timetable.end_time}
                                          </Badge>
                                          <div>
                                            <div className="font-medium text-gray-900">
                                              {matters.find(m => Number(m.id) === Number(timetable.matter_id))?.name}
                                            </div>
                                            <div className="text-sm text-gray-600 flex items-center gap-4">
                                              <span>Classe: {classes.find(c => Number(c.id) === Number(timetable.class_id))?.label}</span>
                                              <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {timetable.room}
                                              </span>
                                              <span>Période: {periods.find(p => Number(p.id) === Number(timetable.period_id))?.label}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <Badge color="secondary">
                                          {academicYears.find(y => Number(y.id) === Number(timetable.academic_year_id))?.label}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Alertes et informations */}
        {hasPendingChanges && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Modifications en attente :</strong> Vous avez {pendingChanges.toCreate.length + pendingChanges.toUpdate.length + pendingChanges.toDelete.length} modification(s) non enregistrée(s).
              Cliquez sur "Enregistrer\" pour les sauvegarder définitivement.
            </AlertDescription>
          </Alert>
        )}

        {localTimetables.length === 0 && !hasPendingChanges && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Aucun emploi du temps défini</strong><br />
              Commencez par ajouter des créneaux pour planifier les interventions de ce professeur.
              Utilisez le bouton "Ajouter un créneau\" pour commencer.
            </AlertDescription>
          </Alert>
        )}

        {/* Animation de chargement */}
        <AnimatePresence>
          {(isLoading || isSaving) && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-lg font-semibold text-gray-900">
                  {isSaving ? "Enregistrement en cours..." : "Chargement..."}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Veuillez patienter
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}