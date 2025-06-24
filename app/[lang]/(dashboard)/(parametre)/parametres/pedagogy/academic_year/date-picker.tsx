"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, PlusCircle } from "lucide-react";
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
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { fetchAcademicYears, fetchPeriods } from "@/store/schoolservice";
import { Period, TypePeriod } from "@/lib/interface";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatePickerFormProps {
  onSuccess?: () => void;
}

// Schéma de validation avec Zod
const FormSchema = z.object({
  label: z.string().nonempty("Le label est requis."),
  start_date: z.string().nonempty("La date de début est requise."),
  end_date: z.string().nonempty("La date de fin est requise."),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const DatePickerForm = ({ onSuccess }: DatePickerFormProps) => {
  const { setAcademicYears, setPeriods, periods, typePeriods } =
    useSchoolStore();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTypePeriod, setSelectedTypePeriod] =
    useState<TypePeriod | null>(null);
  const [periodDates, setPeriodDates] = useState<
    Record<number, { start_date?: Date; end_date?: Date }>
  >({});

  // Filtrer les périodes selon le typePeriod sélectionné
  const filteredPeriods = selectedTypePeriod
    ? periods.filter((p) => p.type_period_id === selectedTypePeriod.id)
    : [];

  const closed = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      const label = `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
      form.setValue("label", label);
      form.setValue("start_date", format(startDate, "yyyy-MM-dd"));
      form.setValue("end_date", format(endDate, "yyyy-MM-dd"));
    }
  }, [startDate, endDate, form]);

  // Réinitialiser les dates des périodes quand le typePeriod change
  useEffect(() => {
    setPeriodDates({});
  }, [selectedTypePeriod]);

  // Vérification des bornes pour la première et la dernière période + chevauchement
  const isPeriodDatesValid = () => {
    if (!startDate || !endDate || filteredPeriods.length === 0) return false;
    const firstPeriod = filteredPeriods[0];
    const lastPeriod = filteredPeriods[filteredPeriods.length - 1];
    const firstStart = periodDates[firstPeriod?.id]?.start_date;
    const lastEnd = periodDates[lastPeriod?.id]?.end_date;
    if (!firstStart || !lastEnd) return false;

    // Vérifier que chaque période ne chevauche pas la suivante
    for (let i = 0; i < filteredPeriods.length - 1; i++) {
      const currentEnd = periodDates[filteredPeriods[i]?.id]?.end_date;
      const nextStart = periodDates[filteredPeriods[i + 1]?.id]?.start_date;
      if (currentEnd && nextStart && currentEnd >= nextStart) {
        return false;
      }
    }

    return (
      firstStart >= startDate &&
      lastEnd <= endDate &&
      firstStart <= lastEnd
    );
  };

  // Feedback utilisateur pour erreurs de chevauchement ou de bornes
  let periodErrorMsg = "";
  if (filteredPeriods.length > 0) {
    const firstPeriod = filteredPeriods[0];
    const lastPeriod = filteredPeriods[filteredPeriods.length - 1];
    const firstStart = periodDates[firstPeriod?.id]?.start_date;
    const lastEnd = periodDates[lastPeriod?.id]?.end_date;
    if (firstStart && startDate && firstStart < startDate) {
      periodErrorMsg = "La date de début de la première période doit être après ou égale à la date de début de l'année académique.";
    } else if (lastEnd && endDate && lastEnd > endDate) {
      periodErrorMsg = "La date de fin de la dernière période doit être avant ou égale à la date de fin de l'année académique.";
    } else {
      for (let i = 0; i < filteredPeriods.length - 1; i++) {
        const currentEnd = periodDates[filteredPeriods[i]?.id]?.end_date;
        const nextStart = periodDates[filteredPeriods[i + 1]?.id]?.start_date;
        if (currentEnd && nextStart && currentEnd >= nextStart) {
          periodErrorMsg = `La date de fin de la période "${filteredPeriods[i].label}" doit être avant la date de début de la période "${filteredPeriods[i + 1].label}".`;
          break;
        }
      }
    }
  }

  async function onSubmit(data: FormSchemaType) {
    setIsLoading(true);

    const selectedPeriods = filteredPeriods.filter(
      (p) => periodDates[p.id]?.start_date && periodDates[p.id]?.end_date
    );

    const periodsPayload = selectedPeriods.map((p) => ({
      id: p.id,
      start_date: format(periodDates[p.id].start_date!, "yyyy-MM-dd"),
      end_date: format(periodDates[p.id].end_date!, "yyyy-MM-dd"),
    }));

    const payload = {
      ...data,
      periods: periodsPayload,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/academicYear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast.success("Dates ajoutées avec succès");
      const updatedAcademicYears = await fetchAcademicYears();
      setAcademicYears(updatedAcademicYears);
      const updatedPeriods = await fetchPeriods();
      setPeriods(updatedPeriods);
      if (onSuccess) {
        onSuccess();
      }
    } else {
      console.error("Erreur lors de l'envoi des dates", response);
      toast.error("Une erreur est survenue");
    }

    setIsLoading(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedTypePeriod(null);
    setPeriodDates({});
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-md mx-auto"
      >
        <div className="flex flex-wrap gap-2 text-center items-center justify-center">
          <FormItem className="flex flex-col">
            <FormLabel className="mb-1">Date de début</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] ltr:pl-3 rtl:pr-3 text-left text-sm",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate
                      ? format(startDate, "PP", { locale: fr })
                      : "Choisir une date"}
                    <CalendarIcon className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-[9999]"
                side="left"
                align="start"
                sideOffset={4}
                avoidCollisions={false}
              >
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>

          <FormItem className="flex flex-col">
            <FormLabel className="mb-1">Date de fin</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] ltr:pl-3 rtl:pr-3 text-left text-sm",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate
                      ? format(endDate, "PP", { locale: fr })
                      : "Choisir une date"}
                    <CalendarIcon className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-[9999]"
                side="right"
                align="start"
                sideOffset={4}
                avoidCollisions={false}
              >
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </div>

        <input type="hidden" {...form.register("label")} />
        <input type="hidden" {...form.register("start_date")} />
        <input type="hidden" {...form.register("end_date")} />

        {/* Type de période dynamique */}
        <div className="flex justify-center gap-4 pt-4 flex-wrap">
          {typePeriods.map((tp) => (
            <Button
              key={tp.id}
              type="button"
              variant={selectedTypePeriod?.id === tp.id ? "ghost" : "outline"}
              onClick={() => setSelectedTypePeriod(tp)}
            >
              {tp.label}
            </Button>
          ))}
        </div>

        {/* Périodes dynamiques */}
        {filteredPeriods.length > 0 && (
          <>
            <ScrollArea className="max-h-[350px] w-full">
              <div className="space-y-4 pt-4">
                {filteredPeriods.map((period, idx) => (
                  <div
                    key={period.id}
                    className="border rounded-md p-4 space-y-2 shadow-sm"
                  >
                    <p className="font-medium">{period.label}</p>
                    <div className="flex gap-4">
                      {/* Date de début */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[160px] justify-start text-left"
                          >
                            {periodDates[period.id]?.start_date
                              ? format(periodDates[period.id].start_date!, "PP", {
                                  locale: fr,
                                })
                              : "Début"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-[9999]"
                          side="top"
                          align="start"
                          sideOffset={4}
                        >
                          <Calendar
                            mode="single"
                            selected={periodDates[period.id]?.start_date}
                            onSelect={(date) =>
                              setPeriodDates((prev) => ({
                                ...prev,
                                [period.id]: {
                                  ...prev[period.id],
                                  start_date: date!,
                                },
                              }))
                            }
                            // Restreindre la première période à >= startDate
                            disabled={
                              idx === 0 && startDate
                                ? (date) => date < startDate
                                : undefined
                            }
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Date de fin */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[160px] justify-start text-left"
                          >
                            {periodDates[period.id]?.end_date
                              ? format(periodDates[period.id].end_date!, "PP", {
                                  locale: fr,
                                })
                              : "Fin"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-[9999]"
                          side="top"
                          align="start"
                          sideOffset={4}
                          avoidCollisions={false}
                        >
                          <Calendar
                            mode="single"
                            selected={periodDates[period.id]?.end_date}
                            onSelect={(date) =>
                              setPeriodDates((prev) => ({
                                ...prev,
                                [period.id]: {
                                  ...prev[period.id],
                                  end_date: date!,
                                },
                              }))
                            }
                            // Restreindre la dernière période à <= endDate
                            disabled={
                              idx === filteredPeriods.length - 1 && endDate
                                ? (date) => date > endDate
                                : undefined
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {periodErrorMsg && (
              <div className="text-sm text-destructive text-center mt-2">
                {periodErrorMsg}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-around">
          <Button
            color="destructive"
            onClick={closed}
            type="button"
            disabled={!startDate || !endDate || isLoading}
          >
            Annuler
          </Button>
          <Button
            color="indigodye"
            type="submit"
            disabled={
              !startDate ||
              !endDate ||
              !selectedTypePeriod ||
              !isPeriodDatesValid() ||
              isLoading
            }
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">
                  <Loader2 className="h-4 w-4" />
                </span>
                Ajout en cours...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DatePickerForm;
