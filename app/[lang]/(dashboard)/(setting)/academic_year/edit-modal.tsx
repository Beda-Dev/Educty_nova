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

const FormSchema = z.object({
  label: z.string().min(1, "Le label est requis"),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
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
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: academicYear.label,
      start_date: academicYear.start_date,
      end_date: academicYear.end_date,
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(academicYear.start_date)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(academicYear.end_date)
  );

  async function onSubmit(data: FormSchemaType) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/academic_year?id=${academicYear.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Année académique mise à jour avec succès");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier l'année académique</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <DialogFooter>
              <div className="flex justify-around space-x-3">
                <DialogClose asChild>
                  <Button type="button" color="bittersweet" disabled={isLoading}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button color="indigodye" type="submit" disabled={isLoading} className="">
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
