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
import CustomSelect from "../common/CustomSelect"
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
  sexe: z.enum(["Masculin", "Feminin"]),
  is_tutor_legal: z.boolean()
})

type TutorFormValues = z.infer<typeof TutorFormSchema>

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
        type_tutor: ""
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
            <CustomSelect
              options={[
                {
                  label: (
                    <span className="flex items-center gap-2"><Mars className="w-4 h-4 text-blue-500" /><span>Masculin</span></span>
                  ), value: 'Masculin'
                },
                {
                  label: (
                    <span className="flex items-center gap-2"><Venus className="w-4 h-4 text-pink-500" /><span>Féminin</span></span>
                  ), value: 'Feminin'
                },
              ]}
              value={sexe ?? ''}
              onChange={(val) => {
                setValue('sexe', val as 'Masculin' | 'Feminin');
                // console.log('[TutorModal] Sexe sélectionné:', val);
              }}
              placeholder="Sélectionner le sexe"
            />
            <ErrorMessage message={errors.sexe?.message} />
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