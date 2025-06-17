"use client";

import { Fragment, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Expense, ValidationExpense, Demand } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { format } from "date-fns";
import { DatePickerInput } from "./datePicker";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableExpenseProps {
  expenses: Expense[];
  validations: ValidationExpense[];
  demands: Demand[];
}

const TableExpense = ({ expenses, validations, demands }: TableExpenseProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCashRegister, setSelectedCashRegister] = useState<string>("");
  const [selectedValidator, setSelectedValidator] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showDemandsModal, setShowDemandsModal] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);

  const { userOnline, settings } = useSchoolStore();
  const router = useRouter();

  // Vérification des permissions
  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    ["voir depenses"]
  );
  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    ["creer depenses"]
  );

  if (!hasAdminAccessVoir) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  // Formatage des montants avec devise
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " " + (settings[0]?.currency || "FCFA");
  };

  // Filtrage des dépenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesDate = !selectedDate || 
        format(new Date(expense.expense_date), "yyyy-MM-dd") === 
        format(selectedDate, "yyyy-MM-dd");
      
      const matchesSearch = expense.label.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCashRegister = selectedCashRegister ? 
        expense.cash_register?.cash_register_number === selectedCashRegister : true;
      
      const matchesValidator = selectedValidator ? 
        validations.some(v => 
          expense?.validation_expense_id === v.id && 
          v.user?.name === selectedValidator
        ) : true;
      
      const matchesStatus = selectedStatus ? 
        validations.some(v => 
          expense.validation_expense_id === v.id && 
          v.validation_status === selectedStatus
        ) : true;

      return matchesDate && matchesSearch && matchesCashRegister && 
             matchesValidator && matchesStatus;
    });
  }, [expenses, selectedDate, searchTerm, selectedCashRegister, selectedValidator, selectedStatus, validations]);

  // Filtrage des demandes approuvées avec leurs validateurs
  const approvedDemandsWithValidators = useMemo(() => {
    return demands
      .filter(demand => demand.status === "approuvée")
      .map(demand => {
        const demandValidations = validations.filter(v => v.demand_id === demand.id);
        const orderedValidations = [...demandValidations].sort((a, b) => a.validation_order - b.validation_order);

        return {
          ...demand,
          validators: orderedValidations.map(v => ({
            name: v.user?.name || "Inconnu",
            status: v.validation_status,
            date: v.validation_date,
            order: v.validation_order
          }))
        };
      });
  }, [demands, validations]);

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const resetFilters = () => {
    setSelectedDate(null);
    setSelectedCashRegister("");
    setSelectedValidator("");
    setSelectedStatus("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleCreateExpense = () => {
    if (approvedDemandsWithValidators.length > 0) {
      setShowDemandsModal(true);
    } else {
      toast.error("Aucune demande de décaissement disponible.");
    }
  };


  const handleDemandSelect = (demand: Demand) => {
    setSelectedDemand(demand);
    setShowDemandsModal(false);
    router.push(`/depense/addDepense?demandId=${demand.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Décaissements</CardTitle>
          </div>
          <Badge variant="outline">
            {filteredExpenses.length} {filteredExpenses.length > 1 ? "décaissements" : "décaissement"}
          </Badge>
        </CardHeader>

        <CardContent>
          {hasAdminAccessCreer && (
            <div className="flex justify-end my-2">
              <Button color="indigodye" onClick={handleCreateExpense}>
                <Icon icon="heroicons:plus" className="mr-2 h-4 w-4" />
                Faire un décaissement
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center mb-4">
            <Input
              placeholder="Rechercher..."
              className="w-[180px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            
            <Select
              value={selectedCashRegister}
              onValueChange={setSelectedCashRegister}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Caisse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes caisses</SelectItem>
                {Array.from(
                  new Set(
                    expenses
                      .map(e => e.cash_register?.cash_register_number)
                      .filter(Boolean) as string[]
                  )
                ).map(num => (
                  <SelectItem key={num} value={num}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedValidator}
              onValueChange={setSelectedValidator}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Validateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous validateurs</SelectItem>
                {Array.from(
                  new Set(
                    validations
                      .map(v => v.user?.name)
                      .filter(Boolean) as string[]
                  )
                ).map(name => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous statuts</SelectItem>
                <SelectItem value="en attente">En attente</SelectItem>
                <SelectItem value="validée">Validée</SelectItem>
                <SelectItem value="rejetée">Rejetée</SelectItem>
              </SelectContent>
            </Select>

            <DatePickerInput
              date={selectedDate}
              setDateAction={setSelectedDate}
              placeholder="Sélectionner une date"
            />

            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libellé</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Caisse</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExpenses.length > 0 ? (
                <AnimatePresence>
                  {paginatedExpenses.map(expense => {
                    const validation = validations.find(v => v.id === expense.validation_expense_id);
                    
                    return (
                      <motion.tr
                        key={expense.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-muted-foreground/20"
                      >
                        <TableCell>{expense.label}</TableCell>
                        <TableCell>{formatAmount(Number(expense.amount))}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {expense.expense_type?.name || "Inconnu"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expense.cash_register?.cash_register_number || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge color="secondary" className="text-xs">
                            {validation?.user?.name || "Non validé"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            color={
                              validation?.validation_status === "validée" 
                                ? "success" 
                                : validation?.validation_status === "rejetée" 
                                  ? "destructive" 
                                  : "warning"
                            }
                            className="text-xs"
                          >
                            {validation?.validation_status || "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(expense.expense_date), "dd/MM/yyyy")}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                    {searchTerm || selectedDate
                      ? "Aucun décaissement ne correspond à votre recherche."
                      : "Aucun décaissement enregistré."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={handlePreviousPage}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <Button
                        variant={currentPage === i + 1 ? "outline" : "ghost"}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={handleNextPage}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale pour les demandes de décaissement approuvées */}
      <Dialog open={showDemandsModal} onOpenChange={setShowDemandsModal}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Demandes de décaissement approuvées</DialogTitle>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Demandeur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Date demande</TableHead>
                <TableHead>Validateurs (ordre de validation)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedDemandsWithValidators.length > 0 ? (
                approvedDemandsWithValidators.map(demand => (
                  <TableRow key={demand.id}>
                    <TableCell>{demand.applicant?.name || "Inconnu"}</TableCell>
                    <TableCell>{formatAmount(demand.amount)}</TableCell>
                    <TableCell>{demand.pattern}</TableCell>
                    <TableCell>
                      {format(new Date(demand.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {demand.validators.map((validator, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {validator.order}. {validator.name}
                            </Badge>
                            <Badge
                              color={
                                validator.status === "validée" 
                                  ? "success" 
                                  : validator.status === "rejetée" 
                                    ? "destructive" 
                                    : "default"
                              }
                              className="text-xs"
                            >
                              {validator.status}
                            </Badge>
                            {validator.date && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(validator.date), "dd/MM HH:mm")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => handleDemandSelect(demand)}
                      >
                        Sélectionner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    Aucune demande approuvée disponible.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default TableExpense;