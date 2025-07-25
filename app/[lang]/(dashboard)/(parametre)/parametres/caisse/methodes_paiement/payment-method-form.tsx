"use client";
import { useState } from "react";
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store";
import { fetchPaymentMethods } from "@/store/schoolservice";

interface PaymentMethodFormProps {
  onSuccess: () => void;
}

export default function PaymentMethodForm({
  onSuccess,
}: PaymentMethodFormProps) {
  const [newMethodLabel, setNewMethodLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrincipal, setIsPrincipal] = useState(false);
  const { setmethodPayment, methodPayment } = useSchoolStore();
  const { toast } = useToast();

  // Vérifie s'il existe déjà une méthode principale
  const alreadyPrincipal = methodPayment.some((m) => m.isPrincipal === 1);

  const addPaymentMethod = async () => {
    if (!newMethodLabel.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour la méthode de paiement",
        color: "destructive",
      });
      return;
    }
    if (isPrincipal && alreadyPrincipal) {
      toast({
        title: "Erreur",
        description: "Il existe déjà une méthode de paiement prioritaire.",
        color: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newMethodLabel.trim(), isPrincipal: isPrincipal ? 1 : 0 }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout");

      const updatedMethods = await fetchPaymentMethods();
      setmethodPayment(updatedMethods);
      setNewMethodLabel("");
      setIsPrincipal(false);
      onSuccess();

      toast({
        title: "Succès",
        description: `La méthode "${newMethodLabel}" a été ajoutée.`,
      });
    } catch (error) {
      onSuccess();
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {alreadyPrincipal && (
        <Alert color="warning" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <div>
            <AlertTitle>Méthode prioritaire déjà définie</AlertTitle>
            <AlertDescription>
              Vous ne pouvez définir qu'une seule méthode de paiement prioritaire.
            </AlertDescription>
          </div>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Nom de la méthode </Label>
        <Input
          id="name"
          placeholder="Ex: Carte Bancaire, Virement, etc."
          value={newMethodLabel}
          onChange={(e) => setNewMethodLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPaymentMethod()}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="isPrincipal"
          checked={isPrincipal}
          onCheckedChange={(checked) => setIsPrincipal(!!checked)}
          disabled={alreadyPrincipal}
        />
        <Label htmlFor="isPrincipal" className="cursor-pointer">
          Définir comme méthode de paiement prioritaire
        </Label>
      </div>
      <div className="flex items-center justify-around">
        <Button
          color="destructive"
          onClick={onSuccess}
          className=""
          disabled={isSubmitting}
        >
          annuler
        </Button>
        <Button
          color="indigodye"
          onClick={addPaymentMethod}
          className=""
          disabled={isSubmitting || (isPrincipal && alreadyPrincipal)}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Ajouter
        </Button>
      </div>
    </div>
  );
}
