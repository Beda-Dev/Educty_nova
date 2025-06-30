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
import { Tabs as ShadTabs, TabsList as ShadTabsList, TabsTrigger as ShadTabsTrigger, TabsContent as ShadTabsContent } from "@/components/ui/tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, BookOpen, Users, Plus, Edit, Trash2, User, Phone, Mail, AlertCircle, CheckCircle2, Loader2, Briefcase, School, Building2, Home, ClipboardList } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store/index";
import { useTimetableStore } from "@/store/timetable";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { fetchTimetable } from "@/store/schoolservice";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfessorTimetableProps {
  professor: Professor;
  timetables: Timetable[];
}

const DAYS_OF_WEEK = [
  { value: "lundi", label: "Lundi" },
  { value: "mardi", label: "Mardi" },
  { value: "mercredi", label: "Mercredi" },
  { value: "jeudi", label: "Jeudi" },
  { value: "vendredi", label: "Vendredi" },
  { value: "samedi", label: "Samedi" }
  // Dimanche retiré
];

export default function ProfessorTimetable({ professor, timetables: initialTimetables }: ProfessorTimetableProps) {
  const { toast } = useToast();
  const { 
    academicYears, 
    classes, 
    matters, 
    periods,
    settings,
    setTimetables 
  } = useSchoolStore();

  const {
    toCreate,
    toUpdate,
    toDelete,
    reset,
    setToCreate,
    setToUpdate,
    setToDelete,
    addToCreate,
    addToUpdate,
    addToDelete,
    removeFromCreate,
    removeFromUpdate,
    removeFromDelete,
  } = useTimetableStore();

  const [timetables, setLocalTimetables] = useState<Timetable[]>(initialTimetables);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const [isSaving, setIsSaving] = React.useState(false);
  const [view, setView] = useState<"timetable" | "profile">("timetable");

  // Filtrer les périodes selon l'année académique sélectionnée
  const periodsForSelectedYear = React.useMemo(() => {
    const year = academicYears.find(y => y.id.toString() === formData.academic_year_id);
    if (year && Array.isArray(year.periods)) {
      return year.periods;
    }
    return [];
  }, [formData.academic_year_id, academicYears]);

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

      // Restriction : cours entre 07:00 et 20:00
      const minTime = new Date(`2000-01-01T07:00`);
      const maxTime = new Date(`2000-01-01T20:00`);
      if (startTime < minTime || endTime > maxTime) {
        newErrors.start_time = "Les cours doivent être entre 07h00 et 20h00";
        newErrors.end_time = "Les cours doivent être entre 07h00 et 20h00";
      } else if (startTime >= endTime) {
        newErrors.end_time = "L'heure de fin doit être après l'heure de début";
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
    return timetables.some(existing => {
      if (excludeId && existing.id === excludeId) return false;
      
      return (
        existing.day === newTimetable.day &&
        existing.academic_year_id === newTimetable.academic_year_id &&
        existing.professor_id === newTimetable.professor_id &&
        // Vérification du chevauchement des heures
        ((newTimetable.start_time >= existing.start_time && newTimetable.start_time < existing.end_time) ||
         (newTimetable.end_time > existing.start_time && newTimetable.end_time <= existing.end_time) ||
         (newTimetable.start_time <= existing.start_time && newTimetable.end_time >= existing.end_time))
      );
    });
  };

  // Synchronise la vue locale avec les modifications du store
  useEffect(() => {
    // Applique les suppressions
    let updated = initialTimetables.filter(t => !toDelete.includes(t.id));
    // Applique les updates
    updated = updated.map(t => {
      const upd = toUpdate.find(u => u.id === t.id);
      return upd ? { ...t, ...upd } : t;
    });
    // Ajoute les créations (sans id, donc on simule un id temporaire négatif)
    const created = toCreate.map((c, idx) => ({
      ...c,
      id: -(idx + 1), // id temporaire négatif
      created_at: "", // valeur factice
      updated_at: "", // valeur factice
      academic_year: academicYears.find(y => y.id.toString() === c.academic_year_id) || {} as any,
      professor: professor,
      class: classes.find(cl => cl.id.toString() === c.class_id) || {} as any,
      matter: matters.find(m => m.id.toString() === c.matter_id) || {} as any,
      period: periods.find(p => p.id.toString() === c.period_id) || {} as any,
    }));
    setLocalTimetables([...updated, ...created]);
  }, [toCreate, toUpdate, toDelete, initialTimetables, matters, periods, academicYears, classes, professor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification que les listes nécessaires sont chargées
    if (
      !academicYears?.length ||
      !classes?.length ||
      !matters?.length ||
      !periods?.length
    ) {
      toast({
        title: "Données manquantes",
        description: "Veuillez patienter pendant le chargement des données nécessaires.",
        color: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        color: "destructive"
      });
      return;
    }

    // Vérification des conflits (sur la vue locale)
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
        // Si c'est une création temporaire (id négatif), on modifie dans toCreate
        if (typeof editingTimetable.id === "number" && editingTimetable.id < 0) {
          // Remplace dans toCreate
          setToCreate(
            toCreate.map(t =>
              t === editingTimetable ? { ...formData, id: editingTimetable.id } : t
            )
          );
        } else {
          // Ajoute ou remplace dans toUpdate
          addToUpdate({ ...formData, id: editingTimetable.id });
        }
        toast({
          title: "Créneau modifié localement",
          description: "Les modifications seront enregistrées lors de la sauvegarde globale."
        });
      } else {
        // Ajoute dans toCreate
        addToCreate(formData);
        toast({
          title: "Créneau ajouté localement",
          description: "Le créneau sera créé lors de la sauvegarde globale."
        });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur inattendue",
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue.",
        color: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (timetableId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?")) return;
    setIsLoading(true);
    try {
      // Si c'est une création locale (id négatif), on l'enlève de toCreate
      if (timetableId < 0) {
        setToCreate(toCreate.filter(t => t.id !== timetableId));
      } else {
        addToDelete(timetableId);
        // On retire aussi de toUpdate si présent
        removeFromUpdate(timetableId);
      }
      toast({
        title: "Créneau supprimé localement",
        description: "La suppression sera effective lors de la sauvegarde globale."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le créneau localement",
        color: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  // Animation pour le bouton d'enregistrement
  const renderSaveButton = () => (
    <Button
      onClick={handleSaveAll}
      disabled={isSaving || (toCreate.length === 0 && toUpdate.length === 0 && toDelete.length === 0)}
      className={`mb-4 transition-all duration-300 ${isSaving ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
    >
      {isSaving ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin h-4 w-4" />
          Enregistrement en cours...
        </span>
      ) : (
        "Enregistrer les modifications"
      )}
    </Button>
  );

  const handleSaveAll = async () => {
    setIsSaving(true);
    toast({
      title: "Traitement en cours",
      description: "Nous enregistrons vos modifications. Merci de patienter...",
      color: "info",
      duration: 4000,
    });
    try {
      // Création
      for (const data of toCreate) {
        try {
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
            const err = await res.json().catch(() => ({}));
            console.error("Erreur création:", err);
            toast({
              title: "Erreur lors de la création",
              description: err.message || "Impossible de créer un créneau.",
              color: "destructive",
            });
          } else {
            toast({
              title: "Créneau ajouté",
              description: "Un créneau a été ajouté avec succès.",
              color: "success",
              duration: 2500,
            });
          }
        } catch (err) {
          console.error("Erreur fetch création:", err);
          toast({
            title: "Erreur réseau",
            description: "Impossible de contacter le serveur pour la création.",
            color: "destructive",
          });
        }
      }
      // Modification
      for (const data of toUpdate) {
        try {
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
            const err = await res.json().catch(() => ({}));
            console.error("Erreur modification:", err);
            toast({
              title: "Erreur lors de la modification",
              description: err.message || "Impossible de modifier le créneau.",
              color: "destructive",
            });
          } else {
            toast({
              title: "Créneau modifié",
              description: "Le créneau a été modifié avec succès.",
              color: "success",
              duration: 2500,
            });
          }
        } catch (err) {
          console.error("Erreur fetch modification:", err);
          toast({
            title: "Erreur réseau",
            description: "Impossible de contacter le serveur pour la modification.",
            color: "destructive",
          });
        }
      }
      // Suppression
      for (const id of toDelete) {
        try {
          const res = await fetch(`/api/timeTable/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("Erreur suppression:", err);
            toast({
              title: "Erreur lors de la suppression",
              description: err.message || "Impossible de supprimer le créneau.",
              color: "destructive",
            });
          } else {
            toast({
              title: "Créneau supprimé",
              description: "Le créneau a été supprimé avec succès.",
              color: "success",
              duration: 2500,
            });
          }
        } catch (err) {
          console.error("Erreur fetch suppression:", err);
          toast({
            title: "Erreur réseau",
            description: "Impossible de contacter le serveur pour la suppression.",
            color: "destructive",
          });
        }
      }
      reset();
      // Rafraîchir les emplois du temps
      toast({
        title: "Mise à jour",
        description: "Rafraîchissement des emplois du temps...",
        color: "info",
        duration: 2000,
      });
      const refreshed : Timetable[] = await fetchTimetable();
      if (refreshed) {
        const Time = refreshed.filter(t => Number(t.professor_id) === Number(professor.id));
        setLocalTimetables(Time);
        setTimetables(refreshed);
        toast({
          title: "Modifications enregistrées",
          description: "Toutes les modifications ont été enregistrées et synchronisées avec succès.",
          color: "success",
          duration: 3500,
        });
      } else {
        toast({
          title: "Avertissement",
          description: "Les modifications sont enregistrées mais le rafraîchissement a échoué.",
          color: "warning",
        });
      }
    } catch (error) {
      console.error("Erreur globale lors de l'enregistrement:", error);
      toast({
        title: "Erreur lors de l'enregistrement",
        description: "Une erreur est survenue lors de l'enregistrement des modifications.",
        color: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Grouper les emplois du temps par année académique
  const timetablesByYear: Record<string, Timetable[]> = React.useMemo(() => {
    const grouped: Record<string, Timetable[]> = {};
    for (const t of timetables) {
      if (!grouped[t.academic_year_id]) grouped[t.academic_year_id] = [];
      grouped[t.academic_year_id].push(t);
    }
    return grouped;
  }, [timetables]);

  // Statistiques globales
  const totalHours = timetables.reduce((total, t) => {
    const start = new Date(`2000-01-01T${t.start_time}`);
    const end = new Date(`2000-01-01T${t.end_time}`);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  const uniqueClasses = Array.from(new Set(timetables.map(t => t.class_id)));
  const uniqueMatters = Array.from(new Set(timetables.map(t => t.matter_id)));

  // Effectif par classe
  const classStats = uniqueClasses.map(classId => {
    const classe = classes.find(c => c.id.toString() === classId);
    return {
      id: classId,
      label: classe?.label || classId,
      // Utilise student_number (nombre d'élèves) si disponible, sinon 0
      count: classe?.student_number ? Number(classe.student_number) : 0
    };
  });

  // Statistiques par année académique
  const yearStats = Object.entries(timetablesByYear).map(([yearId, tts]) => {
    const year = academicYears.find(y => y.id.toString() === yearId);
    const hours = tts.reduce((total, t) => {
      const start = new Date(`2000-01-01T${t.start_time}`);
      const end = new Date(`2000-01-01T${t.end_time}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    return {
      id: yearId,
      label: year?.label || yearId,
      count: tts.length,
      hours: hours,
      matters: Array.from(new Set(tts.map(t => t.matter_id))).length,
      classes: Array.from(new Set(tts.map(t => t.class_id))).length,
    };
  });

  // Grouper les créneaux par jour
  const timetablesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.value] = timetables
      .filter(t => t.day === day.value)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<string, Timetable[]>);

  return (
    <Card>
      <CardHeader>

        <CardTitle className="text-2xl font-bold">Emploi du temps de {professor.name} {professor.first_name}</CardTitle>
        <CardDescription className="text-gray-600">
          Gérez les créneaux d'enseignement pour ce professeur.
        </CardDescription>
      </CardHeader>
      <CardContent>
    <div className="container mx-auto p-6 space-y-8">
      {/* En-tête avec informations du professeur */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={professor?.user?.avatar || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                  {(professor?.name?.charAt(0) || "") + (professor?.first_name?.charAt(0) || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {professor?.name || "-"} {professor?.first_name || ""}
                </CardTitle>
                <CardDescription className="text-lg">
                  Professeur {professor?.type === "permanent" ? "permanent" : professor?.type === "vacataire" ? "vacataire" : "-"}
                </CardDescription>
              </div>
            </div>
            <Badge color={professor?.type === "permanent" ? "default" : "secondary"} className="text-sm px-3 py-1">
              {professor?.type === "permanent" ? "Permanent" : professor?.type === "vacataire" ? "Vacataire" : "Type inconnu"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Numéro d'identification ou matricule */}
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>
                {professor?.number
                  ? `N° ${professor.number}`
                  : <span className="italic text-gray-400">Numéro non renseigné</span>
                }
              </span>
            </div>
            {/* CNI */}
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm font-medium">CNI:</span>
              <span>{professor?.cni || <span className="italic text-gray-400">Non renseigné</span>}</span>
            </div>
            {/* Email */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{professor?.user?.email || <span className="italic text-gray-400">Non renseigné</span>}</span>
            </div>
          
            {/* Type */}
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm font-medium">Type:</span>
              <span>
                {professor?.type === "permanent"
                  ? "Permanent"
                  : professor?.type === "vacataire"
                  ? "Vacataire"
                  : <span className="italic text-gray-400">Non renseigné</span>
                }
              </span>
            </div>
            {/* User ID */}
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm font-medium">ID utilisateur:</span>
              <span>{professor?.user_id ?? <span className="italic text-gray-400">Non renseigné</span>}</span>
            </div>
            {/* Dates de création et modification */}
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm font-medium">Créé le:</span>
              <span>
                {professor?.created_at
                  ? format(parseISO(professor.created_at), 'dd/MM/yyyy', { locale: fr })
                  : <span className="italic text-gray-400">-</span>
                }
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm font-medium">Modifié le:</span>
              <span>
                {professor?.updated_at
                  ? format(parseISO(professor.updated_at), 'dd/MM/yyyy', { locale: fr })
                  : <span className="italic text-gray-400">-</span>
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{timetables.length}</p>
                <p className="text-sm text-gray-600">Créneaux total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{uniqueMatters.length}</p>
                <p className="text-sm text-gray-600">Disciplines enseignées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{uniqueClasses.length}</p>
                <p className="text-sm text-gray-600">Classes</p>
                <ul className="text-xs text-gray-500 mt-1">
                  {classStats.map(c => (
                    <li key={c.id}>
                      {c.label} : {c.count} élève{c.count > 1 ? "s" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Heures d'enseignement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par année académique */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {yearStats.map(stat => (
          <Card key={stat.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="font-semibold">{stat.label}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span><b>{stat.count}</b> créneau{stat.count > 1 ? "x" : ""}</span>
                <span><b>{stat.hours.toFixed(1)}h</b> enseignées</span>
                <span><b>{stat.classes}</b> classe{stat.classes > 1 ? "s" : ""}</span>
                <span><b>{stat.matters}</b> discipline{stat.matters > 1 ? "s" : ""}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emploi du temps groupé par année académique */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Emploi du temps</span>
              </CardTitle>
              <CardDescription>
                Gestion des créneaux horaires du professeur par année académique
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={openCreateDialog}
                  color="indigodye"
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un créneau</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTimetable ? "Modifier le créneau" : "Ajouter un créneau"}
                  </DialogTitle>
                  <DialogDescription>
                    Définissez les détails du créneau horaire
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="academic_year_id">Année académique *</Label>
                      <Select
                        value={formData.academic_year_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: value }))}
                      >
                        <SelectTrigger className={errors.academic_year_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner l'année" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {academicYears && academicYears.length > 0 ? (
                            academicYears.map((year) => (
                              <SelectItem key={year.id} value={year.id.toString()}>
                                {year.label}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-gray-400">Aucune année disponible</div>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.academic_year_id && (
                        <p className="text-sm text-red-500">{errors.academic_year_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class_id">Classe *</Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}
                      >
                        <SelectTrigger className={errors.class_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner la classe" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {classes && classes.length > 0 ? (
                            classes.map((classe) => (
                              <SelectItem key={classe.id} value={classe.id.toString()}>
                                {classe.label}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-gray-400">Aucune classe disponible</div>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.class_id && (
                        <p className="text-sm text-red-500">{errors.class_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="matter_id">Matière *</Label>
                      <Select
                        value={formData.matter_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, matter_id: value }))}
                      >
                        <SelectTrigger className={errors.matter_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner la matière" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {matters && matters.length > 0 ? (
                            matters.map((matter) => (
                              <SelectItem key={matter.id} value={matter.id.toString()}>
                                {matter.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-gray-400">Aucune matière disponible</div>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.matter_id && (
                        <p className="text-sm text-red-500">{errors.matter_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="period_id">Période *</Label>
                      <Select
                        value={formData.period_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, period_id: value }))}
                        disabled={!formData.academic_year_id}
                      >
                        <SelectTrigger className={errors.period_id ? "border-red-500" : ""}>
                          <SelectValue placeholder={formData.academic_year_id ? "Sélectionner la période" : "Sélectionnez d'abord l'année"} />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {formData.academic_year_id && periodsForSelectedYear.length > 0 ? (
                            periodsForSelectedYear.map((period) => (
                              <SelectItem key={period.id} value={period.id.toString()}>
                                {period.label}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-gray-400">
                              {formData.academic_year_id ? "Aucune période disponible" : "Sélectionnez d'abord l'année"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.period_id && (
                        <p className="text-sm text-red-500">{errors.period_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="day">Jour *</Label>
                      <Select
                        value={formData.day}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}
                      >
                        <SelectTrigger className={errors.day ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionner le jour" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.day && (
                        <p className="text-sm text-red-500">{errors.day}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room">Salle *</Label>
                      <Input
                        id="room"
                        value={formData.room}
                        onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                        placeholder="Ex: Salle 101"
                        className={errors.room ? "border-red-500" : ""}
                      />
                      {errors.room && (
                        <p className="text-sm text-red-500">{errors.room}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start_date">Date de début *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        className={errors.start_date ? "border-red-500" : ""}
                      />
                      {errors.start_date && (
                        <p className="text-sm text-red-500">{errors.start_date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">Date de fin *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        className={errors.end_date ? "border-red-500" : ""}
                      />
                      {errors.end_date && (
                        <p className="text-sm text-red-500">{errors.end_date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start_time">Heure de début *</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        className={errors.start_time ? "border-red-500" : ""}
                      />
                      {errors.start_time && (
                        <p className="text-sm text-red-500">{errors.start_time}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_time">Heure de fin *</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                        className={errors.end_time ? "border-red-500" : ""}
                      />
                      {errors.end_time && (
                        <p className="text-sm text-red-500">{errors.end_time}</p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Sauvegarde..." : editingTimetable ? "Modifier" : "Créer"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ShadTabs defaultValue={academicYears[0]?.id?.toString() || ""} className="w-full">
            <ShadTabsList className="overflow-x-auto flex">
              {academicYears.map((year) => (
                <ShadTabsTrigger key={year.id} value={year.id.toString()}>
                  {year.label}
                </ShadTabsTrigger>
              ))}
            </ShadTabsList>
            {academicYears.map((year) => (
              <ShadTabsContent key={year.id} value={year.id.toString()} className="space-y-4">
                {/* Vue hebdomadaire et liste pour cette année */}
                <Tabs defaultValue="weekly" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="weekly">Vue hebdomadaire</TabsTrigger>
                    <TabsTrigger value="list">Vue liste</TabsTrigger>
                  </TabsList>
                  <TabsContent value="weekly" className="space-y-4">
                    {DAYS_OF_WEEK.map((day) => {
                      const tts = (timetablesByYear[year.id.toString()] || []).filter(t => t.day === day.value);
                      return (
                        <Card key={day.value} className="border-l-4 border-l-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-gray-800">
                              {day.label}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {tts.length === 0 ? (
                              <p className="text-gray-500 italic">Aucun cours programmé</p>
                            ) : (
                              <div className="space-y-3">
                                {tts.map((timetable) => (
                                  <div
                                    key={timetable.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center space-x-4">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                          {timetable.start_time} - {timetable.end_time}
                                          {timetable.start_time > "18:30" && (
                                            <span className="ml-2 text-xs text-orange-600 font-semibold">(du soir)</span>
                                          )}
                                        </Badge>
                                        <span className="font-medium text-gray-900">
                                          {timetable.matter.name}
                                        </span>
                                        <Badge color="secondary">
                                          {classes.find(c => c.id.toString() === timetable.class_id)?.label}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="h-3 w-3" />
                                          <span>{timetable.room}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>
                                            {format(parseISO(timetable.start_date), 'dd/MM/yyyy', { locale: fr })} - {format(parseISO(timetable.end_date), 'dd/MM/yyyy', { locale: fr })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        color="tyrian"
                                        size="sm"
                                        onClick={() => openEditDialog(timetable)}
                                        disabled={isLoading}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        color="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(timetable.id)}
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </TabsContent>
                  <TabsContent value="list">
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
                          {(timetablesByYear[year.id.toString()] || []).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                Aucun créneau programmé
                              </TableCell>
                            </TableRow>
                          ) : (
                            (timetablesByYear[year.id.toString()] || [])
                              .sort((a, b) => {
                                const dayOrder = DAYS_OF_WEEK.findIndex(d => d.value === a.day) - 
                                                DAYS_OF_WEEK.findIndex(d => d.value === b.day);
                                if (dayOrder !== 0) return dayOrder;
                                return a.start_time.localeCompare(b.start_time);
                              })
                              .map((timetable) => (
                                <TableRow key={timetable.id}>
                                  <TableCell className="font-medium">
                                    {DAYS_OF_WEEK.find(d => d.value === timetable.day)?.label}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {timetable.start_time} - {timetable.end_time}
                                      {timetable.start_time > "18:30" && (
                                        <span className="ml-2 text-xs text-orange-600 font-semibold">(du soir)</span>
                                      )}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{timetable.matter.name}</TableCell>
                                  <TableCell>
                                    <Badge color="secondary">
                                      {classes.find(c => c.id.toString() === timetable.class_id)?.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3 text-gray-400" />
                                      <span>{timetable.room}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{timetable.period.label}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(timetable)}
                                        disabled={isLoading}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(timetable.id)}
                                        disabled={isLoading}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </ShadTabsContent>
            ))}
          </ShadTabs>
        </CardContent>
      </Card>

      {renderSaveButton()}

      <p className="text-sm text-gray-600 mb-4">
        <b>Note :</b> Les ajouts, modifications et suppressions ne seront effectifs qu'après avoir appuyé sur le bouton <b>« Enregistrer les modifications »</b> en bas de page.
      </p>

      {/* Alertes et informations */}
      {timetables.length === 0 && (
        <Alert className="animate-fade-in">
          <AlertCircle className="h-4 w-4 animate-bounce text-blue-500" />
          <AlertDescription>
            Aucun emploi du temps n'est défini pour ce professeur.<br />
            <span className="text-gray-700">Cliquez sur <b>« Ajouter un créneau »</b> pour commencer à planifier ses interventions.<br />
            Toutes les modifications sont enregistrées de façon temporaire et ne seront effectives qu'après validation.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Vue professionnelle */}
      {view === "profile" && (
        <div className="mt-8 flex justify-center">
          <Card className="w-full max-w-4xl shadow-lg bg-white print:w-[210mm] print:h-[297mm] print:shadow-none print:bg-white">
            {/* En-tête établissement */}
            <CardHeader className="border-b pb-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <School className="h-6 w-6 text-blue-600" />
                    <span className="font-bold text-xl">{settings[0]?.establishment_name || "Établissement"}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {settings[0]?.address && <span>{settings[0].address} <span className="mx-2">|</span></span>}
                    {settings[0]?.email && <span>{settings[0].email} <span className="mx-2">|</span></span>}
                    {settings[0]?.establishment_phone_1 && (
                      <span>
                        {settings[0].establishment_phone_1}
                        {settings[0].establishment_phone_2 ? ` / ${settings[0].establishment_phone_2}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                {settings[0]?.establishment_logo && (
                  <img
                    src={settings[0].establishment_logo}
                    alt="Logo établissement"
                    className="h-16 w-auto object-contain"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Informations du professeur */}
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={professor?.user?.avatar || ""} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                    {(professor?.name?.charAt(0) || "") + (professor?.first_name?.charAt(0) || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{professor.name} {professor.first_name}</h2>
                  <div className="text-gray-700">
                    <span className="mr-4">Type : <b>{professor.type === "permanent" ? "Permanent" : "Vacataire"}</b></span>
                    <span className="mr-4">N° : <b>{professor.number || "-"}</b></span>
                    <span className="mr-4">CNI : <b>{professor.cni || "-"}</b></span>
                  </div>
                  <div className="text-gray-700 mt-1">
                    <span className="mr-4">Email : <b>{professor.user?.email || "-"}</b></span>
                    <span className="mr-4">Téléphone : +225 <b>{professor.number || "-"}</b></span>
                  </div>
                  <div className="text-gray-700 mt-1">
                    <span className="mr-4">Créé le : <b>{professor.created_at ? format(parseISO(professor.created_at), 'dd/MM/yyyy', { locale: fr }) : "-"}</b></span>
                    <span>Modifié le : <b>{professor.updated_at ? format(parseISO(professor.updated_at), 'dd/MM/yyyy', { locale: fr }) : "-"}</b></span>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="text-lg font-bold">{timetables.length}</div>
                    <div className="text-sm text-gray-600">Créneaux total</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="text-lg font-bold">{uniqueMatters.length}</div>
                    <div className="text-sm text-gray-600">Disciplines enseignées</div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="text-lg font-bold">{uniqueClasses.length}</div>
                    <div className="text-sm text-gray-600">Classes</div>
                  </div>
                </div>
              </div>

              {/* Emploi du temps sous forme de tableau */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Emploi du temps détaillé
                </h3>
                <div className="rounded-md border overflow-x-auto bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jour</TableHead>
                        <TableHead>Horaire</TableHead>
                        <TableHead>Matière</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Année</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetables.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Aucun créneau programmé
                          </TableCell>
                        </TableRow>
                      ) : (
                        timetables
                          .sort((a, b) => {
                            const dayOrder = DAYS_OF_WEEK.findIndex(d => d.value === a.day) - DAYS_OF_WEEK.findIndex(d => d.value === b.day);
                            if (dayOrder !== 0) return dayOrder;
                            return a.start_time.localeCompare(b.start_time);
                          })
                          .map((timetable) => (
                            <TableRow key={timetable.id}>
                              <TableCell className="font-medium">
                                {DAYS_OF_WEEK.find(d => d.value === timetable.day)?.label}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {timetable.start_time} - {timetable.end_time}
                                  {timetable.start_time > "18:30" && (
                                    <span className="ml-2 text-xs text-orange-600 font-semibold">(du soir)</span>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell>{timetable.matter.name}</TableCell>
                              <TableCell>
                                <Badge color="secondary">
                                  {classes.find(c => c.id.toString() === timetable.class_id)?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  <span>{timetable.room}</span>
                                </div>
                              </TableCell>
                              <TableCell>{timetable.period.label}</TableCell>
                              <TableCell>
                                {academicYears.find(y => y.id.toString() === timetable.academic_year_id)?.label}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Boutons de navigation entre les vues */}
      <div className="flex justify-between mt-4">
        <Button
          variant={view === "timetable" ? undefined : "outline"}
          onClick={() => setView("timetable")}
          className="flex-1 mr-2"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Emploi du temps
        </Button>
        <Button
          variant={view === "profile" ? undefined : "outline"}
          onClick={() => setView("profile")}
          className="flex-1 ml-2"
        >
          <User className="h-4 w-4 mr-2" />
          Fiche professionnelle
        </Button>
      </div>

      {/* Animation de chargement */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
              <p className="text-white text-lg font-semibold">Chargement en cours...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
      </CardContent>
    </Card>
  );
}
