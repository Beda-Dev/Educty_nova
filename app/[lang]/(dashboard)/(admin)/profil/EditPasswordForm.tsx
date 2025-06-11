'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { User } from "@/lib/interface"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ToastAction } from "@/components/ui/toast"

interface EditPasswordFormProps {
  user: User
  onCloseAction: () => void
  onSuccess?: () => void
}

export function EditPasswordForm({ user, onCloseAction, onSuccess }: EditPasswordFormProps) {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validation
    if (formData.new_password !== formData.new_password_confirmation) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        color: "destructive",
        action: <ToastAction altText="Fermer">Fermer</ToastAction>
      })
      setIsLoading(false)
      return
    }

    if (formData.new_password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        color: "destructive",
        action: <ToastAction altText="Fermer">Fermer</ToastAction>
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user.id}/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de la mise à jour du mot de passe")
      }

      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour avec succès",
        action: <ToastAction altText="OK">OK</ToastAction>
      })

      if (onSuccess) onSuccess()
      onCloseAction()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue",
        color: "destructive",
        action: <ToastAction altText="Fermer">Fermer</ToastAction>
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="current_password" className="mb-2 block">
            Mot de passe actuel
          </Label>
          <Input
            id="current_password"
            type="password"
            value={formData.current_password}
            onChange={handleChange}
            required
            className="focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div>
          <Label htmlFor="new_password" className="mb-2 block">
            Nouveau mot de passe
          </Label>
          <Input
            id="new_password"
            type="password"
            value={formData.new_password}
            onChange={handleChange}
            required
            minLength={8}
            className="focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Minimum 8 caractères
          </p>
        </div>

        <div>
          <Label htmlFor="new_password_confirmation" className="mb-2 block">
            Confirmer le nouveau mot de passe
          </Label>
          <Input
            id="new_password_confirmation"
            type="password"
            value={formData.new_password_confirmation}
            onChange={handleChange}
            required
            minLength={8}
            className="focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          color="bittersweet"
          onClick={onCloseAction}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="outline"
          color="skyblue"
          disabled={isLoading}
          className="min-w-32 bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Mettre à jour"
          )}
        </Button>
      </div>
    </form>
  )
}