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
import { cn } from "@/lib/utils";

export function LastOpenSessionPopover({ sessions }: { sessions: CashRegisterSession[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userOnline, cashRegisterSessionCurrent, settings } = useSchoolStore();

  const formatAmount = (amount: string | number) => {
    const currency = settings?.[0]?.currency || 'FCFA';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount;
    if (isNaN(num)) return `0 ${currency}`;
    return `${num.toLocaleString('fr-FR').replace(/,/g, ' ')} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: fr });
  };

  const handleNavigate = () => {
    setIsLoading(true);
    router.push(`/caisse_comptabilite/session_caisse/${cashRegisterSessionCurrent?.id}`);
    setIsLoading(false);
  };

  if (!cashRegisterSessionCurrent) {
    return (
      <Badge variant="outline" className="flex items-center gap-2 py-1 text-xs">
        <AlertCircle className="h-3 w-3 text-yellow-600" />
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
          className={cn(
            "h-8 px-3 text-xs font-medium",
            "hover:bg-primary/10 hover:text-primary",
            "focus-visible:ring-2 focus-visible:ring-primary/50",
            "transition-colors duration-200"
          )}
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mr-2 h-2 w-2 rounded-full bg-green-500"
          />
          Session active
        </Button>
      </PopoverTrigger>

      <AnimatePresence>
        {open && (
          <PopoverContent 
            className="w-[280px] p-4 sm:w-[320px]"
            align="end"
            forceMount
            sideOffset={8}
          >
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Session en cours</h4>
                  <Badge 
                    color="secondary" 
                    className="text-xs font-medium px-2 py-0.5"
                  >
                    N°{cashRegisterSessionCurrent.cash_register.cash_register_number}
                  </Badge>
                </div>

                <div className="grid gap-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ouverture:</span>
                    <span className="font-medium text-right">
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
                    <span className="font-medium truncate max-w-[120px]">
                      {cashRegisterSessionCurrent.user.name.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className={cn(
                    "w-full mt-2 text-xs h-8",
                    "transition-all duration-150",
                    "hover:bg-primary/90 hover:shadow-sm",
                    "focus-visible:ring-2 focus-visible:ring-primary/50"
                  )}
                  onClick={handleNavigate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      Accéder à la caisse
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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