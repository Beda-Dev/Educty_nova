"use client"

import { useState, useEffect, memo, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Plus, User, User2, Phone, Venus, Mars, ShieldAlert, Info, X, Check, Edit } from "lucide-react"
import type { TutorFormData } from "@/lib/interface"
import { useSchoolStore } from "@/store/index"
import { UseFormTrigger } from "react-hook-form"
import { useRegistrationStore } from "@/hooks/use-registration-store"

const TutorFormSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  first_name: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  phone_number: z.string()
    .min(10, "Le numéro doit contenir au moins 10 chiffres")
    .max(10, "Le numéro ne peut pas dépasser 15 chiffres")
    .regex(/^[0-9]+$/, "Le numéro ne doit contenir que des chiffres"),
  sexe: z.enum(["Homme", "Femme"]),
  type_tutor: z.string().min(1, "Veuillez sélectionner un type"),
  is_tutor_legal: z.boolean()
})

type TutorFormValues = z.infer<typeof TutorFormSchema>



const TutorTypeOptions = memo(({ sexe }: { sexe?: string }) => {
  // Sécurisation : toujours retourner un fragment React
  let types: string[] = ["Tuteur"];
  if (sexe === "Homme") types = ["Père", "Tuteur"];
  if (sexe === "Femme") types = ["Mère", "Tuteur"];
  // Debug : vérifier les rendus
  // console.log("TutorTypeOptions rendered", sexe, types);
  return (
    <>
      {types.map(type => (
        <SelectItem key={type} value={type}>{type}</SelectItem>
      ))}
    </>
  );
});

const ErrorMessage = memo(({ message }: { message?: string }) => {
  if (!message) return null
  return (
    <p className="text-sm text-destructive flex items-center gap-1">
      <X className="w-4 h-4" />
      {message}
    </p>
  )
})

export const TutorModal = memo(({ isNew = true }: { isNew?: boolean }) => {
  const [open, setOpen] = useState(false);
  const { tutors } = useSchoolStore()
  const { addNewTutor, selectedTutors, newTutors } = useRegistrationStore()
  const {
    register,
    handleSubmit, 
    watch,
    reset,
    trigger,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TutorFormValues>({
    resolver: zodResolver(TutorFormSchema),
    defaultValues: {
      name: "",
      first_name: "",
      phone_number: "",
      sexe: undefined,
      type_tutor: "",
      is_tutor_legal: false
    }
  })

  // OPTIMISATION : indexation des tuteurs par numéro de téléphone
  const tutorsByPhone = useMemo(() => {
    const map: Record<string, any> = {}
    tutors.forEach(t => { if (t.phone_number) map[t.phone_number] = t })
    return map
  }, [tutors])

  const sexe = watch("sexe")
  const isTutorLegal = watch("is_tutor_legal")
  // Nouvelle liste statique des types de tuteur
  const tutorTypes = ["Père", "Mère", "Tuteur"];
  const typeTutorValue = watch("type_tutor");

  

  // OPTIMISATION : handler mémoïsé
  const onSubmit = useCallback(async (data: TutorFormValues) => {
    try {
      // Utilisation de l'index pour la vérification
      const verify = tutorsByPhone[data.phone_number]
      if (verify) {
        toast.error("Un tuteur avec ce numéro de téléphone existe déjà", {
          description: "Veuillez choisir un autre numéro de téléphone."
        })
        return
      }

      const hasLegalTutor = [...selectedTutors, ...newTutors].some(tutor => tutor.is_tutor_legal)
      if (data.is_tutor_legal && hasLegalTutor) {
        toast.error("Un tuteur légal existe déjà", {
          description: "Un seul tuteur légal peut être désigné."
        })
        return
      }

      addNewTutor({
        ...data,
        name: data.name.toUpperCase(),
        first_name: data.first_name.toUpperCase(),
        phone_number: data.phone_number.toUpperCase(),
      })

      toast.success("Tuteur ajouté avec succès", {
        description: `${data.first_name} ${data.name} a été ajouté comme tuteur.`
      })

      reset()
      setOpen(false)
    } catch (error) {
      toast.error("Erreur lors de la création", {
        description: "Une erreur est survenue lors de la création du tuteur."
      })
    }
  }, [addNewTutor, newTutors, reset, selectedTutors, toast, tutorsByPhone]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button color="indigodye" variant="outline" className="w-full group" onClick={() => setOpen(true)}>
          <span className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            <span>Ajouter un tuteur</span>
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User2 className="w-5 h-5 text-skyblue" />
            <span>Nouveau tuteur</span>
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations du tuteur. Tous les champs sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="name">Nom</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Le nom de famille du tuteur (en majuscules)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                {...register("name")}
                placeholder="DUPONT"
                className="pl-10"
                onBlur={() => trigger("name")}
              />
            </div>
            <ErrorMessage message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="first_name">Prénom</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Le prénom du tuteur (en majuscules)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="JEAN"
                className="pl-10"
                onBlur={() => trigger("first_name")}
              />
            </div>
            <ErrorMessage message={errors.first_name?.message} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="phone_number">Téléphone</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Numéro à 10 chiffres (sans espaces ni caractères spéciaux)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone_number"
                {...register("phone_number")}
                placeholder="0612345678"
                className="pl-10"
                onBlur={() => trigger("phone_number")}
              />
            </div>
            <ErrorMessage message={errors.phone_number?.message} />
          </div>

          <div className="space-y-2">
            <Label>Sexe</Label>
            <div className="relative w-full">
  <select
    value={sexe ?? ""}
    onChange={e => {
      setValue("sexe", e.target.value as "Homme" | "Femme");
      console.log("[TutorModal] Sexe sélectionné:", e.target.value);
    }}
    className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
  >
    <option value="">Sélectionner le sexe</option>
    <option value="Homme">
      ♂ Homme
    </option>
    <option value="Femme">
      ♀ Femme
    </option>
  </select>
  {/* Chevron icon for dropdown effect */}
  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
  </span>
</div>
            <ErrorMessage message={errors.sexe?.message} />
          </div>

          <div className="space-y-2">
  <Label>Type de tuteur</Label>
  <select
  value={typeTutorValue ?? ""}
  onChange={e => {
    setValue("type_tutor", e.target.value);
    console.log("[TutorModal] type_tutor changé:", e.target.value);
  }}
  className="w-full border rounded p-2"
>
  <option value="">Sélectionner le type</option>
  <option value="Père">Père</option>
  <option value="Mère">Mère</option>
  <option value="Tuteur">Tuteur</option>
</select>
  <ErrorMessage message={errors.type_tutor?.message} />
</div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="is_tutor_legal"
              checked={isTutorLegal}
              onCheckedChange={(checked) => {
                setValue("is_tutor_legal", checked as boolean)
                trigger("is_tutor_legal")
              }}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="is_tutor_legal">Tuteur légal</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>Le tuteur légal est responsable légal de l'élève. Un seul tuteur légal peut être désigné.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex justify-around gap-2 pt-4">
            <Button
              type="button"
              color="destructive"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
            color="indigodye"
              type="submit"
              className="gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Ajout en cours...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ajouter le tuteur</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})