"use client";
import { useState, useEffect } from "react";
import { useSchoolStore } from "@/store";
import {
  CashRegisterSession,
  ValidationExpense,
  Expense,
  Transaction,
} from "@/lib/interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Check, X, Edit, Save, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { fetchValidationExpenses } from "@/store/schoolservice";

interface Props {
  params: {
    id: string;
  };
}

const DetailSessionPage = ({ params }: Props) => {
  const { toast } = useToast();
  const [currentValidation, setCurrentValidation] =
    useState<ValidationExpense | null>(null);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [currentSession, setCurrentSession] =
    useState<CashRegisterSession | null>(null);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>("");
  const {
    validationExpenses,
    expenses,
    cashRegisterSessions,
    transactions,
    setValidationExpenses,
    settings,
  } = useSchoolStore();
  const { id } = params;

  useEffect(() => {
    const validation = validationExpenses.find((val) => val.id === Number(id));
    if (validation) {
      setCurrentValidation(validation);
      setTempStatus(validation.validation_status);
      const expense = expenses.find((exp) => exp.validation_expense_id === validation.id);
      if (expense) {
        setCurrentExpense(expense);
        const transaction = transactions.find(
          (trans) => trans.id === expense.transaction_id
        );
        if (transaction) {
          setCurrentTransaction(transaction);
          const session = cashRegisterSessions.find(
            (sess) => sess.id === transaction.cash_register_session_id
          );
          if (session) {
            setCurrentSession(session);
          }
        }
      }
    }
  }, [id, validationExpenses, expenses, transactions, cashRegisterSessions]);

  const handleStatusUpdate = async () => {
    if (!currentValidation) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/validationExpense?id=${currentValidation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...currentValidation,
            validation_status: tempStatus,
          }),
        }
      );

      if (!response.ok) throw new Error("Échec de la mise à jour");

      const updatedValidation = await response.json();
      setCurrentValidation(updatedValidation);
      setIsEditing(false);

      toast({
        title: "Succès",
        description: "Le statut a été mis à jour avec succès",
        color: "success",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        color: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (
    !currentValidation ||
    !currentExpense ||
    !currentTransaction ||
    !currentSession
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-6xl mx-auto p-4"
    >
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-tyrian to-skyblue rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white text-2xl">
                Détails de la Transaction
              </CardTitle>
              <CardDescription className="text-blue-100">
                Informations complètes sur le Validation du décaissement
              </CardDescription>
            </div>
            <Badge
              color={
                currentValidation.validation_status === "validée"
                  ? "default"
                  : currentValidation.validation_status === "rejetée"
                  ? "destructive"
                  : "secondary"
              }
              className="px-4 py-1 text-sm"
            >
              {currentValidation.validation_status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Section Validation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-800">
                <Check className="w-5 h-5" />
                Validation
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  {isEditing ? (
                    <Select
                      value={tempStatus}
                      onValueChange={(value) => setTempStatus(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en attente">En attente</SelectItem>
                        <SelectItem value="validée">Validée</SelectItem>
                        <SelectItem value="rejetée">Rejetée</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      color={
                        currentValidation.validation_status === "validée"
                          ? "default"
                          : currentValidation.validation_status === "rejetée"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {currentValidation.validation_status}
                    </Badge>
                  )}
                </div>
                <div>
                  {!(currentValidation.validation_status === "en attente") && (
                    <>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p>
                        {format(
                          new Date(currentValidation.validation_date),
                          "PPP",
                          {
                            locale: fr,
                          }
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    décisionnaire
                  </p>
                  <p>{currentValidation.user?.name || "Inconnu"}</p>
                </div>
              </div>
              {currentValidation.validation_status === "en attente" && (
                <div className="pt-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        color="indigodye"
                        onClick={handleStatusUpdate}
                        disabled={isLoading}
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Enregistrer
                      </Button>
                      <Button
                        color="destructive"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        size="sm"
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      color="tyrian"
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier le statut
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Section Dépense */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-800">
                <ChevronDown className="w-5 h-5" />
                Dépense
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Libellé</p>
                  <p>{currentExpense.label}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Montant</p>
                  <p className="font-semibold">
                    {parseFloat(currentExpense.amount).toLocaleString("fr-FR")}{" "}
                    {settings[0].currency? settings[0].currency : "FCFA"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>
                    {format(new Date(currentExpense.expense_date), "PPP", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Transaction */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-800">
                <ChevronDown className="w-5 h-5" />
                Transaction
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Type de transaction
                  </p>
                  <p>{currentTransaction.transaction_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Montant total
                  </p>
                  <p>
                    {parseFloat(currentExpense.amount).toLocaleString("fr-FR")}{" "}
                    {settings[0].currency? settings[0].currency : "FCFA"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Type de décaissement
                  </p>
                  <p>{currentExpense.expense_type.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>
                    {format(
                      new Date(currentTransaction.transaction_date),
                      "PPP",
                      {
                        locale: fr,
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    initiée par
                  </p>
                  <p>{currentTransaction.user?.name || "Inconnu"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section Session de Caisse */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pt-6 border-t"
          >
            <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-800 mb-4">
              <ChevronDown className="w-5 h-5" />
              Session de Caisse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <Badge
                  color={
                    currentSession.status === "open" ? "success" : "destructive"
                  }
                >
                  {currentSession.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Montant d'ouverture
                </p>
                <p>
                  {parseFloat(currentSession.opening_amount).toLocaleString(
                    "fr-FR"
                  )}{" "}
                  {settings[0].currency? settings[0].currency : "FCFA"}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(currentSession.opening_date), "PPPp", {
                    locale: fr,
                  })}
                </p>
              </div>
              {currentSession.status === "closed" && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Fermeture</p>
                  <p>
                    {parseFloat(currentSession.closing_amount).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    {settings[0].currency? settings[0].currency : "FCFA"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(currentSession.closing_date), "PPPp", {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Caisse</p>
                <p className="text-sm text-gray-500">
                  {currentSession.cash_register.cash_register_number}
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DetailSessionPage;
