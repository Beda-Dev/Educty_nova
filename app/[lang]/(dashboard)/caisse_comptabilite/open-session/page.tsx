"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Wallet,
  Banknote,
  CreditCard,
  FileText,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSchoolStore } from "@/store";
import { CashRegisterSession, CashRegister, User } from "@/lib/interface";
import { fetchCashRegisterSessions, fetchTransactions, fetchPayment } from "@/store/schoolservice"

const formSchema = z.object({
  cash_register_id: z.string().min(1, "Veuillez sélectionner une caisse"),
  opening_amount: z.string().min(1, "Veuillez entrer un montant d'ouverture"),
  comment: z.string().optional(),
});

export default function OpenCashRegisterSession() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastClosedSession, setLastClosedSession] = useState<CashRegisterSession | null>(null);
  const [showAmountWarning, setShowAmountWarning] = useState(false);
  const {
    userOnline,
    cashRegisters,
    setCashRegisterSessionCurrent,
    cashRegisterCurrent,
    cashRegisterSessions,
    setCashRegisterSessions
  } = useSchoolStore();

  // Get last closed session by the current user
  useEffect(() => {
    if (userOnline && cashRegisterSessions.length > 0) {
      const userSessions = cashRegisterSessions.filter(
        (s) => s.user_id === userOnline.id && s.status === "closed"
      );
      if (userSessions.length > 0) {
        const lastSession = userSessions.reduce((latest, session) => 
          new Date(session.closing_date) > new Date(latest.closing_date) ? session : latest
        );
        setLastClosedSession(lastSession);
      }
    }
  }, [userOnline, cashRegisterSessions]);

  const caissesDisponibles = useMemo(() => {
    const idsCaissesOccupees = new Set(
      cashRegisterSessions
        .filter((s) => s.status === "open")
        .map((s) => s.cash_register_id)
    );
    return cashRegisters.filter(
      (cr) => cr.active === 1 && !idsCaissesOccupees.has(cr.id)
    );
  }, [cashRegisters, cashRegisterSessions]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cash_register_id: "",
      opening_amount: "",
    },
  });

  // Watch opening amount changes to compare with last closed session
  const openingAmount = form.watch("opening_amount");
  useEffect(() => {
    if (lastClosedSession && openingAmount) {
      const currentAmount = parseAmount(openingAmount);
      const lastAmount = parseFloat(lastClosedSession.closing_amount);
      setShowAmountWarning(currentAmount !== lastAmount);
    } else {
      setShowAmountWarning(false);
    }
  }, [openingAmount, lastClosedSession]);

  // Format amount with spaces as thousand separators
  const formatAmount = (amount: number | string): string => {
    try {
      const num = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount;
      if (isNaN(num)) return '0';
      return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
    } catch {
      return '0';
    }
  };

  // Parse formatted amount back to number
  const parseAmount = (formattedAmount: string): number => {
    try {
      return parseFloat(formattedAmount.replace(/\s/g, '')) || 0;
    } catch {
      return 0;
    }
  };

  // Get currency from settings
  const currency = useSchoolStore.getState().settings?.[0]?.currency || 'FCFA';

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userOnline) return;

    setIsSubmitting(true);

    try {
      const now = new Date();
      // Format date for API (Y-m-d H:i:s)
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      // Validate amount
      const openingAmount = parseAmount(values.opening_amount);
      if (isNaN(openingAmount) || openingAmount <= 0) {
        toast({
          title: "Montant invalide",
          description: "Veuillez entrer un montant d'ouverture valide.",
          color: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const newSession = {
        user_id: userOnline.id,
        cash_register_id: Number(values.cash_register_id),
        opening_date: formattedDate,
        closing_date: formattedDate, // Required but not actually used
        opening_amount: openingAmount.toString(),
        closing_amount: "0", // Required but not actually used
        status: "open" as const,
        comment: values.comment || undefined,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/cashRegisterSession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSession),
      });

      const data = await response.json();
      setCashRegisterSessionCurrent(data.session as CashRegisterSession);

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'ouverture de la session");
      }

      toast({
        title: "✅ Session ouverte",
        description: (
          <div className="mt-2">
            <p>
              La caisse <span className="font-semibold">{caissesDisponibles.find(c => c.id === Number(values.cash_register_id))?.cash_register_number || values.cash_register_id}</span> a été ouverte avec succès.
            </p>
            <p className="font-semibold mt-1">
              Montant : {formatAmount(openingAmount)} {currency}
            </p>
            {values.comment && (
              <p className="text-xs mt-1 text-muted-foreground">Commentaire : {values.comment}</p>
            )}
          </div>
        ),
        color: "success",
        duration: 500
      });

      const update = await fetchCashRegisterSessions()
      setCashRegisterSessions(update)

      router.push("/caisse_comptabilite/session_caisse");
    } catch (error) {
      console.error(error);
      toast({
        title: "❌ Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (cashRegisterCurrent) {
      // router.push("/caisse_comptabilite/session_caisse");
    }
  }, [cashRegisterCurrent, router]);

  if (!userOnline) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert color="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Vous devez être connecté pour ouvrir une session de caisse
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-primary" />
                  Ouvrir une session de caisse
                </CardTitle>
                <CardDescription>
                  Remplissez les informations pour ouvrir une nouvelle session
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* User information */}
              <div className="p-5 rounded-lg bg-gray-50 dark:bg-gray-800 border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Utilisateur</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nom</p>
                        <p className="font-medium">{userOnline.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium">{userOnline.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Cash Register Selection */}
                  <FormField
                    control={form.control}
                    name="cash_register_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          <span>Caisses disponibles</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Sélectionner une caisse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {caissesDisponibles.map((register) => (
                              <SelectItem
                                key={register.id}
                                value={register.id.toString()}
                                className="hover:bg-primary/5"
                              >
                                Caisse {register.cash_register_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Sélectionnez la caisse que vous souhaitez ouvrir
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Opening Date */}
                  <div>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Date d'ouverture</span>
                    </FormLabel>
                    <Input
                      value={format(new Date(), "dd MMMM yyyy 'à' HH'h'mm", {
                        locale: fr,
                      })}
                      disabled
                      className="h-11 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Opening Amount */}
                  <FormField
                    control={form.control}
                    name="opening_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span>Montant d'ouverture</span>
                        </FormLabel>
                        <FormControl>
                          <div>
                            <div className="relative">
                              <Input
                                placeholder={`0 ${currency}`}
                                inputMode="numeric"
                                autoComplete="off"
                                onChange={(e) => {
                                  let raw = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                                  const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                  field.onChange(formatted);
                                }}
                                value={field.value}
                                className="h-11 focus-visible:ring-primary/50 border-gray-300 text-base"
                              />
                            </div>
                            {field.value && (
                              <p className="text-sm text-gray-500 mt-1">
                                {formatAmount(field.value)} {currency} (affiché)
                              </p>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Entrez le montant d'ouverture de la caisse
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Warning if amount differs from last closed session */}
                  {showAmountWarning && lastClosedSession && (
                    <Alert color="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Attention</AlertTitle>
                      <AlertDescription>
                        Le montant saisi ({formatAmount(openingAmount)} {currency}) est différent du montant de fermeture de votre dernière session ({formatAmount(lastClosedSession.closing_amount)} {currency}). Vérifiez que c'est bien intentionnel.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Comment */}
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Commentaire (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ajoutez un commentaire si nécessaire..."
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormDescription>
                          Vous pouvez ajouter une remarque sur cette session
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="flex justify-between pt-2">
                    <Button
                      color="destructive"
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Annuler
                    </Button>
                    <Button
                      color="indigodye"
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Ouverture en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Confirmer l'ouverture
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}