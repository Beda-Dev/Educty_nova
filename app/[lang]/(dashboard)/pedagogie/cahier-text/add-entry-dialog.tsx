"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EntryType, type Entry } from "./types"

const formSchema = z.object({
  title: z.string().min(2, { message: "Le titre doit contenir au moins 2 caractères" }),
  subject: z.string().min(2, { message: "La matière doit contenir au moins 2 caractères" }),
  content: z.string().min(5, { message: "Le contenu doit contenir au moins 5 caractères" }),
  date: z.date(),
  type: z.nativeEnum(EntryType),
  class: z.string().min(2, { message: "La classe doit contenir au moins 2 caractères" }),
  academicYear: z.string().min(4, { message: "L'année académique doit être valide" }),
})

type FormValues = z.infer<typeof formSchema>

interface AddEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEntry: (entry: Omit<Entry, "id">) => void
  existingSubjects: string[]
  existingClasses: string[]
  existingAcademicYears: string[]
}

export function AddEntryDialog({
  open,
  onOpenChange,
  onAddEntry,
  existingSubjects,
  existingClasses,
  existingAcademicYears,
}: AddEntryDialogProps) {
  const [customSubject, setCustomSubject] = useState("")
  const [customClass, setCustomClass] = useState("")
  const [customAcademicYear, setCustomAcademicYear] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      content: "",
      date: new Date(),
      type: EntryType.LESSON,
      class: "",
      academicYear: "",
    },
  })

  const onSubmit = (values: FormValues) => {
    onAddEntry(values)
    form.reset()
  }

  const handleSubjectChange = (value: string) => {
    if (value === "custom") {
      form.setValue("subject", customSubject)
    } else {
      form.setValue("subject", value)
    }
  }

  const handleClassChange = (value: string) => {
    if (value === "custom") {
      form.setValue("class", customClass)
    } else {
      form.setValue("class", value)
    }
  }

  const handleAcademicYearChange = (value: string) => {
    if (value === "custom") {
      form.setValue("academicYear", customAcademicYear)
    } else {
      form.setValue("academicYear", value)
    }
  }

  // Generate current and next academic years if none exist
  const suggestedAcademicYears =
    existingAcademicYears.length > 0
      ? existingAcademicYears
      : (() => {
          const currentYear = new Date().getFullYear()
          return [`${currentYear - 1}-${currentYear}`, `${currentYear}-${currentYear + 1}`]
        })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter une entrée au cahier de texte</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de l'entrée" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full pl-3 text-left font-normal">
                            {field.value ? (
                              format(field.value, "EEEE d MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={fr} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={handleClassChange} defaultValue="">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999]"  >
                          {existingClasses.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Autre...</SelectItem>
                        </SelectContent>
                      </Select>

                      {form.watch("class") === "custom" && (
                        <Input
                          placeholder="Nouvelle classe"
                          value={customClass}
                          onChange={(e) => {
                            setCustomClass(e.target.value)
                            form.setValue("class", e.target.value)
                          }}
                        />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année académique</FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={handleAcademicYearChange} defaultValue="">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une année" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999]" >
                          {suggestedAcademicYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Autre...</SelectItem>
                        </SelectContent>
                      </Select>

                      {form.watch("academicYear") === "custom" && (
                        <Input
                          placeholder="Nouvelle année (ex: 2023-2024)"
                          value={customAcademicYear}
                          onChange={(e) => {
                            setCustomAcademicYear(e.target.value)
                            form.setValue("academicYear", e.target.value)
                          }}
                        />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matière</FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={handleSubjectChange} defaultValue="">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une matière" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999]">
                          {existingSubjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Autre...</SelectItem>
                        </SelectContent>
                      </Select>

                      {form.watch("subject") === "custom" && (
                        <Input
                          placeholder="Nouvelle matière"
                          value={customSubject}
                          onChange={(e) => {
                            setCustomSubject(e.target.value)
                            form.setValue("subject", e.target.value)
                          }}
                        />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EntryType.LESSON}>Cours</SelectItem>
                        <SelectItem value={EntryType.HOMEWORK}>Devoir</SelectItem>
                        <SelectItem value={EntryType.EXAM}>Examen</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contenu de l'entrée..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
