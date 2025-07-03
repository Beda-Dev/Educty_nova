"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { AcademicYear } from "@/lib/interface";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {Loader2} from "lucide-react"
import { useSchoolStore } from "@/store";
import { fetchAcademicYears } from "@/store/schoolservice";

const FormSchema = z.object({
  label: z.string().min(1, "Le label est requis"),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
  periods: z.array(
    z.object({
      id: z.number(),
      start_date: z.string().min(1, "Date de début requise"),
      end_date: z.string().min(1, "Date de fin requise"),
    })
  ),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  academicYear: AcademicYear;
  onUpdate: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  academicYear,
  onUpdate,
}) => {
  console.log("EditModal", academicYear);
  // Préparation des périodes pour le formulaire
  const initialPeriods =
    academicYear.periods?.map((p) => ({
      id: p.id,
      start_date: p.pivot?.start_date || "",
      end_date: p.pivot?.end_date || "",
      label: p.label,
    })) || [];

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: academicYear.label,
      start_date: academicYear.start_date,
      end_date: academicYear.end_date,
      periods: initialPeriods.map(({ id, start_date, end_date }) => ({
        id,
        start_date,
        end_date,
      })),
    },
  });

  const { setAcademicYears } = useSchoolStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(academicYear.start_date)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(academicYear.end_date)
  );
  const [periods, setPeriods] = useState(
    initialPeriods.map((p) => ({
      ...p,
      start_date: p.start_date,
      end_date: p.end_date,
    }))
  );
  const [periodsError, setPeriodsError] = useState<string | null>(null);

  // Vérifications avancées sur les périodes
  useEffect(() => {
    let error = null;
    // Vérifier dates vides
    if (periods.some(p => !p.start_date || !p.end_date)) {
      error = "Toutes les périodes doivent avoir une date de début et de fin.";
    }
    // Vérifier date début < date fin pour chaque période
    else if (periods.some(p => p.start_date > p.end_date)) {
      error = "La date de début d'une période ne peut pas être après sa date de fin.";
    }
    // Vérifier que chaque période est dans l'année académique
    else if (
      periods.some(
        p =>
          (p.start_date < format(new Date(startDate ?? academicYear.start_date), "yyyy-MM-dd")) ||
          (p.end_date > format(new Date(endDate ?? academicYear.end_date), "yyyy-MM-dd"))
      )
    ) {
      error = "Les périodes doivent être comprises dans l'année académique.";
    }
    // Vérifier chevauchement
    else {
      const sorted = [...periods].sort((a, b) =>
        a.start_date.localeCompare(b.start_date)
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        if (
          sorted[i].end_date &&
          sorted[i + 1].start_date &&
          sorted[i].end_date >= sorted[i + 1].start_date
        ) {
          error = "Les dates des périodes se chevauchent. Veuillez corriger.";
          break;
        }
      }
    }
    setPeriodsError(error);
  }, [periods, academicYear.start_date, academicYear.end_date, startDate, endDate]);

  async function onSubmit(data: FormSchemaType) {
    if (periodsError) return;
    setIsLoading(true);
    try {
      // Utilise les valeurs du state local pour start_date et end_date
      const start_date = startDate ? format(startDate, "yyyy-MM-dd") : data.start_date;
      const end_date = endDate ? format(endDate, "yyyy-MM-dd") : data.end_date;

      // Utilise les périodes modifiées du state local
      const periodsPayload = periods.map((p) => ({
        id: p.id,
        start_date: p.start_date,
        end_date: p.end_date,
      }));

      const response = await fetch(`/api/academic_year?id=${academicYear.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: data.label,
          start_date,
          end_date,
          periods: periodsPayload,
        }),
      });

      if (response.ok) {
        toast.success("Année académique mise à jour avec succès");
        // Mise à jour du store et de la table
        const updatedAcademicYears = await fetchAcademicYears();
        setAcademicYears(updatedAcademicYears);
        onUpdate();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      const label = `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
      form.setValue("label", label);
      form.setValue("start_date", format(startDate, "yyyy-MM-dd"));
      form.setValue("end_date", format(endDate, "yyyy-MM-dd"));
    }
  }, [startDate, endDate, form]);

  // Gestion du changement de date pour une période
  const handlePeriodDateChange = (
    idx: number,
    field: "start_date" | "end_date",
    value: string
  ) => {
    setPeriods((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="5xl" className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>Modifier l'année académique</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
            {/* ...existing label and date pickers... */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: 2023-2024"
                      className="w-full text-center"
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélecteur de date de début */}
              <FormField
                control={form.control}
                name="start_date"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? (
                              format(startDate, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-[9999]"
                        side="left" align="start" sideOffset={4} avoidCollisions={false}
                      >
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sélecteur de date de fin */}
              <FormField
                control={form.control}
                name="end_date"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? (
                              format(endDate, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-[9999]"
                        side="right" align="start" sideOffset={4} avoidCollisions={false}
                      >
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Affichage et édition des périodes */}
            {periods.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold mt-2 mb-1 text-center">Périodes de l'année</div>
                <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2 justify-center">
                  {periods.map((period, idx) => (
                    <div
                      key={period.id}
                      className="flex flex-col border p-2 rounded items-center w-80 mx-auto"
                    >
                      <span className="w-full font-medium text-center mb-2">
                        {period.label || `Période ${idx + 1}`}
                      </span>
                      <div className="flex flex-row gap-2 w-full justify-center">
                        <div className="flex flex-col items-center w-full">
                          <label className="text-xs text-center mb-1">Début</label>
                          <Input
                            type="date"
                            value={period.start_date || ""}
                            onChange={(e) =>
                              handlePeriodDateChange(idx, "start_date", e.target.value)
                            }
                            className="text-center"
                          />
                        </div>
                        <div className="flex flex-col items-center w-full">
                          <label className="text-xs text-center mb-1">Fin</label>
                          <Input
                            type="date"
                            value={period.end_date || ""}
                            onChange={(e) =>
                              handlePeriodDateChange(idx, "end_date", e.target.value)
                            }
                            className="text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {periodsError && (
                  <div className="text-red-600 text-sm text-center">{periodsError}</div>
                )}
              </div>
            )}
            <DialogFooter>
              <div className="flex justify-around space-x-3">

                <DialogClose asChild>
                  <Button type="button" color="bittersweet">
                    Annuler
                  </Button>
                </DialogClose>
                <Button
                  color="indigodye"
                  type="submit"
                  disabled={isLoading || !!periodsError}
                  className=""
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2"><Loader2 className="h-4 w-4" /></span>
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
