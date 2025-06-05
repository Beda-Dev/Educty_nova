"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    if (sexe === "Homme") {
      return ["Père", "Oncle", "Frère", "Grand-Père", "Autres"]
    } else if (sexe === "Femme") {
      return ["Mère", "Tante", "Soeur", "Grande-Mère", "Autres"]
    }
    return ["Autres"]
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
              <User2 className="w-5 h-5 text-primary" />
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
              <Select
                value={formData.sexe}
                onValueChange={(value) => setFormData({ ...formData, sexe: value, type_tutor: "" })}
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
            </div>

            {formData.sexe && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label>Type de tuteur</Label>
                <Select
                  value={formData.type_tutor}
                  onValueChange={(value) => setFormData({ ...formData, type_tutor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {getTutorTypeOptions(formData.sexe).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="is_tutor_legal"
                checked={formData.is_tutor_legal}
                onCheckedChange={(checked) => setFormData({ ...formData, is_tutor_legal: checked as boolean })}
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
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}