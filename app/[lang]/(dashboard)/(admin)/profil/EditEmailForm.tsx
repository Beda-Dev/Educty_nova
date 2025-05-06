'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { User } from "@/lib/interface";

interface EditEmailFormProps {
  user: User;
  onCloseAction: () => void;
  onSuccess?: () => void;
}

export function EditEmailForm({ user, onCloseAction, onSuccess }: EditEmailFormProps) {
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implémenter l'appel API pour mettre à jour l'email
      // Exemple: await updateUserEmail(user.id, email);
      
      // Après succès
      if (onSuccess) onSuccess();
      onCloseAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Nouvel email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCloseAction}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "En cours..." : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
}