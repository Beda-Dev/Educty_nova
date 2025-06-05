"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog"
import { 
  Button 
} from "@/components/ui/button"
import { 
  Input 
} from "@/components/ui/input"
import { 
  Label 
} from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Checkbox 
} from "@/components/ui/checkbox"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { 
  Plus, 
  User, 
  User2, 
  Phone, 
  Venus, 
  Mars, 
  ShieldAlert,
  Info,
  X,
  Check
} from "lucide-react"
import type { TutorFormData } from "@/lib/interface"
import { useSchoolStore } from "@/store/index"
import { UseFormTrigger } from "react-hook-form"
import { useRegistrationStore } from "@/hooks/use-registration-store"

interface TutorModalProps {
  triggerButton?: (trigger: UseFormTrigger<TutorFormValues>) => React.ReactNode;
}

// Schéma de validation
const tutorFormSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  first_name: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  phone_number: z.string()
    .min(10, "Le numéro doit contenir au moins 10 chiffres")
    .max(15, "Le numéro ne peut pas dépasser 15 chiffres")
    .regex(/^[0-9]+$/, "Le numéro ne doit contenir que des chiffres"),
  sexe: z.enum(["Homme", "Femme"]),
  type_tutor: z.string().min(1, "Veuillez sélectionner un type"),
  is_tutor_legal: z.boolean()
})

type TutorFormValues = z.infer<typeof tutorFormSchema>

interface TutorModalProps {
  triggerButton?: (trigger: UseFormTrigger<TutorFormValues>) => React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TutorModal({ triggerButton, open, onOpenChange }: TutorModalProps) {
  const { tutors } = useSchoolStore()
  const { addNewTutor , selectedTutors, newTutors } = useRegistrationStore()

  const {
    register,
    handleSubmit, 
    watch,
    reset,
    trigger,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TutorFormValues>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      name: "",
      first_name: "",
      phone_number: "",
      sexe: undefined,
      type_tutor: "",
      is_tutor_legal: false
    }
  })

  const sexe = watch("sexe")
  const isTutorLegal = watch("is_tutor_legal")

  const getTutorTypeOptions = (sexe: string) => {
    if (sexe === "Homme") {
      return ["Père", "Oncle", "Frère", "Grand-Père", "Autres"]
    } else if (sexe === "Femme") {
      return ["Mère", "Tante", "Soeur", "Grande-Mère", "Autres"]
    }
    return ["Autres"]
  }

  useEffect(() => {
    if (!sexe) {
      setValue("type_tutor", "")
    }
  }, [sexe, setValue])

  const onSubmit = async (data: TutorFormValues) => {
    try {
      const verify = tutors.find(tutor => tutor.phone_number === data.phone_number)
      if (verify) {
        toast.error("Un tuteur avec ce numéro de téléphone existe déjà", {
          description: "Veuillez choisir un autre numéro de téléphone.",
          action: {
            label: "Compris",
            onClick: () => {}
          },
        })
        return
      }
      // Vérification du tuteur légal
      const hasLegalTutor = [...selectedTutors, ...newTutors].some(tutor => tutor.is_tutor_legal)
      if (data.is_tutor_legal && hasLegalTutor) {
        toast.error("Un tuteur légal existe déjà", {
          description: "Il ne peut y avoir qu'un seul tuteur légal par élève.",
          action: {
            label: "Compris",
            onClick: () => {}
          },
        })
        return
      }

      addNewTutor({
        ...data,
        name: data.name.toUpperCase(),
        first_name: data.first_name.toUpperCase(),
        phone_number: data.phone_number.toUpperCase(),
      })

      toast.success("Tuteur ajouter avec succès", {
        description: `${data.first_name} ${data.name} a été ajouté comme tuteur.`,
      })

      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error("Erreur lors de la création", {
        description: "Une erreur est survenue lors de la création du tuteur.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton ? (
          triggerButton(trigger)
        ) : (
          <Button variant="outline" className="w-full group">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              <span>Ajouter un tuteur</span>
            </motion.span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-primary" />
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
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {errors.name.message}
                </motion.p>
              )}
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
              {errors.first_name && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {errors.first_name.message}
                </motion.p>
              )}
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
              {errors.phone_number && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {errors.phone_number.message}
                </motion.p>
              )}
            </div>
          </div>

            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select
                value={sexe}
                onValueChange={(value) => {
                  setValue("sexe", value as "Homme" | "Femme")
                  trigger("sexe")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="Homme">
                    <div className="flex items-center gap-2">
                      <Mars className="w-4 h-4 text-blue-500" />
                      <span>Masculin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Femme">
                    <div className="flex items-center gap-2">
                      <Venus className="w-4 h-4 text-pink-500" />
                      <span>Féminin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.sexe && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {errors.sexe.message}
                </motion.p>
              )}
            </div>

            {sexe && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label>Type de tuteur</Label>
                <Select
                  value={watch("type_tutor")}
                  onValueChange={(value) => {
                    setValue("type_tutor", value)
                    trigger("type_tutor")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {getTutorTypeOptions(sexe).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type_tutor && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    {errors.type_tutor.message}
                  </motion.p>
                )}
              </motion.div>
            )}

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
                onClick={() => onOpenChange(false)}
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
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
                        />
                      </svg>
                    </motion.span>
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ajouter le tuteur</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}