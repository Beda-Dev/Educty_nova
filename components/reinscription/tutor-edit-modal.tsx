"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CustomSelect from "../common/CustomSelect"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-hot-toast"
import type { Tutor, TutorFormData } from "@/lib/interface"
import { useReinscriptionStore } from "@/hooks/use-reinscription-store"
import { Edit, Plus, User, User2, Phone, Mars, Venus, ShieldAlert, Info, X, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TutorEditModalProps {
  tutor?: Tutor & { is_tutor_legal: boolean }
  isNew?: boolean
}

export function TutorEditModal({ tutor, isNew = false }: TutorEditModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<TutorFormData>({
    name: "",
    first_name: "",
    phone_number: "",
    sexe: "",
    type_tutor: "",
    is_tutor_legal: false,
  })

  const { addNewTutor, updateExistingTutor, existingTutors, newTutors } = useReinscriptionStore()

  useEffect(() => {
    if (tutor && !isNew) {
      setFormData({
        name: tutor.name,
        first_name: tutor.first_name,
        phone_number: tutor.phone_number,
        sexe: tutor.sexe,
        type_tutor: tutor.type_tutor,
        is_tutor_legal: tutor.is_tutor_legal,
      })
    }
  }, [tutor, isNew])

  const getTutorTypeOptions = (sexe: string) => {
    if (sexe === "Masculin") {
      return ["Père", "Tuteur"]
    } else if (sexe === "Feminin") {
      return ["Mère", "Tuteur"]
    }
    return ["Tuteur"]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if trying to add second legal tutor
    const hasLegalTutor = [...existingTutors, ...newTutors]
      .filter((t) => isNew || !tutor || ("id" in t ? t.id !== tutor.id : true))
      .some((t) => t.is_tutor_legal)

    if (formData.is_tutor_legal && hasLegalTutor) {
      toast.error("Un tuteur légal existe déjà. Il ne peut y avoir qu'un seul tuteur légal.")
      return
    }

    const processedData = {
      ...formData,
      name: formData.name.toUpperCase(),
      first_name: formData.first_name.toUpperCase(),
      phone_number: formData.phone_number.toUpperCase(),
    }

    if (isNew) {
      addNewTutor(processedData)
    } else if (tutor) {
      updateExistingTutor(tutor.id, processedData)
    }

    if (isNew) {
      setFormData({
        name: "",
        first_name: "",
        phone_number: "",
        sexe: "",
        type_tutor: "",
        is_tutor_legal: false,
      })
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isNew ? (
          <Button color="indigodye" variant="outline" className="w-full group">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Ajouter un tuteur</span>
            </motion.span>
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
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
              <User2 className="w-5 h-5 text-skyblue" />
              <span>{isNew ? "Nouveau tuteur" : "Modifier le tuteur"}</span>
            </DialogTitle>
            <DialogDescription>
              {isNew ? "Remplissez les informations du tuteur" : "Modifiez les informations du tuteur"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="DUPONT"
                  className="pl-10"
                  required
                />
              </div>
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
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="JEAN"
                  className="pl-10"
                  required
                />
              </div>
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
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="0612345678"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sexe</Label>
              <CustomSelect
                options={[
                  { label: (
                    <span className="flex items-center gap-2"><Mars className="w-4 h-4 text-blue-500" /><span>Masculin</span></span>
                  ), value: 'Masculin' },
                  { label: (
                    <span className="flex items-center gap-2"><Venus className="w-4 h-4 text-pink-500" /><span>Féminin</span></span>
                  ), value: 'Feminin' },
                ]}
                value={formData.sexe}
                onChange={(val) => setFormData({ ...formData, sexe: val as string })}
                placeholder="Sélectionner le sexe"
              />
              <div className="flex justify-around gap-2 pt-4">
                <Button
                  color="destructive"
                  type="button"
                  className="gap-2"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  color={isNew ? "indigodye" : "tyrian"}
                  type="submit"
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isNew ? "Ajouter" : "Modifier"} le tuteur</span>
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}