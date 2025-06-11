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
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSchoolStore } from "@/store";
import { fetchAcademicYears } from "@/store/schoolservice";
import { Loader2, PlusCircle } from "lucide-react"


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
  const { setAcademicYears } = useSchoolStore();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const closed = () => {
    if (onSuccess) {
      onSuccess();
    }
  }

  async function onSubmit(data: FormSchemaType) {
    setIsLoading(true);
    const response = await fetch("/api/academic_year", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success("Dates ajoutées avec succès");
      const updatedAcademicYears = await fetchAcademicYears();
      setAcademicYears(updatedAcademicYears);

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
    form.reset();
  }

  useEffect(() => {
    if (startDate && endDate) {
      const label = `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
      form.setValue("label", label);
      form.setValue("start_date", format(startDate, "yyyy-MM-dd"));
      form.setValue("end_date", format(endDate, "yyyy-MM-dd"))
    }
  }, [startDate, endDate, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
        <div className="flex flex-wrap gap-2 text-center items-center justify-center">
          <FormItem className="flex flex-col">
            <FormLabel className="mb-1">Date de début</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn("w-[180px] ltr:pl-3 rtl:pr-3 text-left text-sm", !startDate && "text-muted-foreground")}
                  >
                    {startDate ? format(startDate, "PP", { locale: fr }) : "Choisir une date"}
                    <CalendarIcon className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" side="left" align="start" sideOffset={4} avoidCollisions={false}>
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
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
                    className={cn("w-[180px] ltr:pl-3 rtl:pr-3 text-left text-sm", !endDate && "text-muted-foreground")}
                  >
                    {endDate ? format(endDate, "PP", { locale: fr }) : "Choisir une date"}
                    <CalendarIcon className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" side="right" align="start" sideOffset={4} avoidCollisions={false}>
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </div>

        <input type="hidden" {...form.register("label")} />
        <input type="hidden" {...form.register("start_date")} />
        <input type="hidden" {...form.register("end_date")} />

        <div className="flex justify-around">
          <Button color="destructive" onClick={closed} disabled={!startDate || !endDate || isLoading} className="">
            Annuler
          </Button>
          <Button color="indigodye" type="submit" disabled={!startDate || !endDate || isLoading} className="">
            {isLoading ? (
              <>
                <span className="animate-spin mr-2"><Loader2 className="h-4 w-4" /></span>
                Ajout en cours...
              </>) :
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter
              </>
            }

          </Button>

        </div>


      </form>
    </Form>
  );
};

export default DatePickerForm;
