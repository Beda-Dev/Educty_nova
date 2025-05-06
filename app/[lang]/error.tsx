"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Error({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-4">
      <Alert color="destructive" variant="soft">
        <Info className="h-5 w-5" />
        <AlertDescription>Quelque chose s’est mal passé !</AlertDescription>
      </Alert>
      <Button onClick={() => reset()} color="destructive" size="sm">
      Réessayez
      </Button>
      <Alert color="destructive" variant="soft">
        <AlertTitle>{error.message}</AlertTitle>
        <AlertDescription>{error.name}</AlertDescription>
      </Alert>
    </div>
  );
}

