"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CashRegisterSession } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export function LastOpenSessionPopover({ sessions }: { sessions: CashRegisterSession[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userOnline , cashRegisterSessionCurrent } = useSchoolStore();

  // Trouver la dernière session ouverte
  const lastOpenSession = sessions
    .filter((session) => session.status === "open" && session.user.id === userOnline?.id)
    .sort((a, b) => new Date(b.opening_date).getTime() - new Date(a.opening_date).getTime())[0];

  // Formater le montant en FCFA
  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: fr });
  };

  const handleNavigate = () => {
    setIsLoading(true);
    router.push(`/cash-registers/${cashRegisterSessionCurrent?.cash_register.id}`);
  };

  if (!cashRegisterSessionCurrent) {
    return (
      <Badge variant="outline" className="flex items-center gap-2 py-1 text-xs">
        <AlertCircle className="h-3 w-3" />
        <span>Aucune session active</span>
      </Badge>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 px-3 text-xs font-medium hover:bg-primary/10"
        >
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mr-2 h-2 w-2 rounded-full bg-green-500"
          />
          Session active
        </Button>
      </PopoverTrigger>

      <AnimatePresence>
        {open && (
          <PopoverContent 
            className="w-72 p-3 sm:w-80"
            align="end"
            asChild
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Session en cours</h4>
                  <Badge variant="outline" className="text-xs">
                    {cashRegisterSessionCurrent.cash_register.cash_register_number}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ouverture:</span>
                    <span className="font-medium">
                      {formatDate(cashRegisterSessionCurrent.opening_date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Montant initial:</span>
                    <span className="font-medium">
                      {formatAmount(cashRegisterSessionCurrent.opening_amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Caissier:</span>
                    <span className="font-medium">
                      {cashRegisterSessionCurrent.user.name.split(' ')[0]} {/* Prénom seulement */}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full mt-2 text-xs h-8"
                  onClick={handleNavigate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      Accéder à la caisse
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}