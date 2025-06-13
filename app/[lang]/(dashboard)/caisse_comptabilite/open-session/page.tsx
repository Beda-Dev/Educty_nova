"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Loader2,
  ArrowLeft,
  Euro,
  AlertTriangle,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { CashRegisterSession, CashRegister, User } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  cash_register_id: z.string().min(1, "Veuillez sélectionner une caisse"),
  opening_amount: z.string().min(1, "Veuillez entrer un montant d'ouverture"),
});

export default function OpenCashRegisterSession() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    userOnline,
    cashRegisters,
    setCashRegisterSessionCurrent,
    cashRegisterCurrent,
    cashRegisterSessions,
  } = useSchoolStore();

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userOnline) return;

    setIsSubmitting(true);

    try {
      const now = new Date();
      // Formatage pour l'API (Y-m-d H:i:s)
      const formattedDate = format(now, "yyyy-MM-dd HH:mm:ss");

      const newSession = {
        user_id: userOnline.id,
        cash_register_id: Number(values.cash_register_id),
        opening_date: formattedDate,
        closing_date: formattedDate, // Requis mais pas utilisé réellement
        opening_amount: values.opening_amount,
        closing_amount: "0", // Requis mais pas utilisé réellement
        status: "open" as const,
      };

      const response = await fetch("/api/cashRegisterSession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSession),
      });

      const data = await response.json();
      setCashRegisterSessionCurrent(data.session as CashRegisterSession);

      console.log("Response:", data.message);

      if (!response.ok) {
        throw new Error("Erreur lors de l'ouverture de la session");
      }

      toast({
        title: "✅ Session ouverte",
        description: (
          <div className="mt-2">
            <p>
              La caisse {values.cash_register_id} a été ouverte avec succès.
            </p>
            <p className="font-semibold mt-1">
              Montant: {formatFCFA(values.opening_amount)}
            </p>
          </div>
        ),
      });

      // router.push("/caisse_comptabilite/session_caisse");
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

  const formatFCFA = (value: string) => {
    if (!value) return "";
    const amount = Number(value) / 100;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("CFA", "FCFA");
  };

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    onChange(value);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-skyblue"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <Card className="border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl font-bold text-gray-800">
                Ouvrir une session de caisse
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Remplissez les informations pour ouvrir une nouvelle session
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                  >
                    <h3 className="font-medium text-gray-700 mb-3">
                      Utilisateur
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-gray-500">Nom:</div>
                      <div className="font-medium">{userOnline.name}</div>
                      <div className="text-gray-500">Email:</div>
                      <div className="font-medium">{userOnline.email}</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="cash_register_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Caisses disponibles
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
                          <FormDescription className="text-gray-500">
                            Sélectionnez la caisse que vous souhaitez ouvrir
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <div>
                    <FormLabel className="text-gray-700">
                      Date d'ouverture
                    </FormLabel>
                    <Input
                      value={format(new Date(), "dd MMMM yyyy HH:mm", {
                        locale: fr,
                      })}
                      disabled
                      className="h-11 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <FormField
                      control={form.control}
                      name="opening_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Montant d'ouverture
                          </FormLabel>
                          <FormControl>
                            <div>
                              <div className="relative">
                                <Input
                                  placeholder="0"
                                  inputMode="numeric"
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    field.onChange(raw);
                                  }}
                                  value={field.value}
                                  className="pl-9 h-11 focus-visible:ring-primary/50 border-gray-300"
                                />
                              </div>
                              {field.value && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {formatFCFA(field.value)} (affiché)
                                </p>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Entrez le montant d'ouverture de la caisse en FCFA
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                    disabled={isSubmitting}
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ouverture en cours...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Ouvrir la session de caisse
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="p-6 border-t border-gray-200 flex justify-end">
            <Button
              color="destructive"
              variant="outline"
              onClick={() => router.back()}
              className=""
            >
              Annuler
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
