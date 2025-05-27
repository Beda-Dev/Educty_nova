"use client";

import { Fragment, useState } from "react";
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
import ExpenseFormModal from "./modal";
import { Expense, ValidationExpense } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { fetchExpenses } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { format } from "date-fns";
import { DatePickerInput } from "./datePicker";
import { Pencil, RefreshCw } from "lucide-react";
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
}

const TableExpense = ({ expenses, validations }: TableExpenseProps) => {
  const [collapsedRows, setCollapsedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCashRegister, setSelectedCashRegister] = useState<string>("");
  const [selectedValidator, setSelectedValidator] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { setExpenses, userOnline } = useSchoolStore();
  const router = useRouter();

  const permissionRequisCreer = ["creer depenses"];
  const permissionRequisVoir = ["voir depenses"];
  const permissionRequisModifier = ["modifier depenses"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );
  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
  );
  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
  );

  if (hasAdminAccessVoir === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  const update = async () => {
    try {
      const response = await fetchExpenses();
      setExpenses(response);
    } catch (error) {
      toast.error("Erreur lors du chargement des dépenses");
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    router.push("/depense/addDepense");
    // setSelectedExpense(null);
    // setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const url = selectedExpense
        ? `/api/expense?id=${selectedExpense.id}`
        : "/api/expense";
      const method = selectedExpense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok)
        throw new Error(
          selectedExpense ? "Échec de la mise à jour" : "Échec de la création"
        );

      await update();
      toast.success(selectedExpense ? "Dépense mise à jour" : "Dépense créée");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const resetFilters = () => {
    setDateRange([null, null]);
    setSelectedCashRegister("");
    setSelectedValidator("");
    setSelectedStatus("");
    setSearchTerm("");
  };

  const filteredExpenses = expenses
    .filter(
      (expense) =>
        !selectedDate ||
        format(new Date(expense.expense_date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
    )
    .filter((expense) =>
      expense.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((expense) =>
      selectedCashRegister
        ? expense.cash_register.cash_register_number === selectedCashRegister
        : true
    )
    .filter((expense) =>
      selectedValidator
        ? validations.some(
            (v) =>
              v.expense_id === expense.id && v.user?.name === selectedValidator
          )
        : true
    )
    .filter((expense) =>
      selectedStatus
        ? validations.some(
            (v) =>
              v.expense_id === expense.id &&
              v.validation_status === selectedStatus
          )
        : true
    );
  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
            <Pencil className="h-5 w-5 text-primary" />
            <CardTitle>Dépenses</CardTitle>
          </div>
          <Badge variant="outline">
            {filteredExpenses.length}{" "}
            {filteredExpenses.length > 1 ? "dépenses" : "dépense"}
          </Badge>
        </CardHeader>

        <CardContent>
          {hasAdminAccessCreer && (
            <div className="flex justify-end mb-2">
              <Button color="indigodye" onClick={handleCreate}>
                <Icon icon="heroicons:plus" className="mr-2 h-4 w-4" />
                Faire une dépense
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
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
                <SelectItem value="">caisses</SelectItem>
                {Array.from(
                  new Set(
                    expenses.map((e) => e.cash_register.cash_register_number)
                  )
                ).map((num) => (
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
                <SelectItem value="">validateurs</SelectItem>
                {Array.from(
                  new Set(
                    validations
                      .map((v) => v.user?.name)
                      .filter((n): n is string => typeof n === "string")
                  )
                ).map((name) => (
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
                <SelectItem value="">Tous les status</SelectItem>
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
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libellé</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Caisse</TableHead>
                <TableHead>validation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>date</TableHead>
                {/* {hasAdminAccessModifier && <TableHead>Action</TableHead>} */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                <AnimatePresence>
                  {paginatedExpenses.map((expense) => (
                    <Fragment key={expense.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-muted-foreground/20"
                      >
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <span>{expense.label}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {formatAmount(Number(expense.amount))}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {expense.expense_type.name}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {expense.cash_register.cash_register_number}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {validations
                              .filter((v) => v.expense_id === expense.id)
                              .map((v) => (
                                <Badge
                                  key={v.id}
                                  color="secondary"
                                  className="text-xs"
                                >
                                  {v.user?.name || "Utilisateur inconnu"}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {validations
                              .filter((v) => v.expense_id === expense.id)
                              .map((v) => (
                                <Badge
                                  key={v.id}
                                  color={`${
                                    v.validation_status === "validée"
                                      ? "success"
                                      : v.validation_status === "rejetée"
                                      ? "destructive"
                                      : "warning"
                                  }`}
                                  className="text-xs"
                                >
                                  {v.validation_status || "statut inconnu"}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          {format(new Date(expense.expense_date), "dd/MM/yyyy")}
                        </TableCell>

                        {/* {hasAdminAccessModifier && (
                          <TableCell className="flex justify-end">
                            <Button
                              color="tyrian"
                              size="icon"
                              onClick={() => handleEdit(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )} */}
                      </motion.tr>
                    </Fragment>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={hasAdminAccessModifier ? 5 : 4}
                    className="text-center text-muted-foreground h-24"
                  >
                    {searchTerm || dateRange[0] || dateRange[1]
                      ? "Aucune dépense ne correspond à votre recherche."
                      : "Aucune dépense enregistrée."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredExpenses.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={
                        currentPage === 1 ? undefined : handlePreviousPage
                      }
                      aria-disabled={currentPage === 1}
                      tabIndex={currentPage === 1 ? -1 : 0}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
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
                      onClick={
                        currentPage === totalPages ? undefined : handleNextPage
                      }
                      aria-disabled={currentPage === totalPages}
                      tabIndex={currentPage === totalPages ? -1 : 0}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50 text-muted-foreground"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        expense={selectedExpense}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default TableExpense;
