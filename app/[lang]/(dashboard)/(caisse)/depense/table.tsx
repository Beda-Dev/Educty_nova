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
import { Card } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import ExpenseFormModal from "./modal";
import { Expense } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { fetchExpenses } from "@/store/schoolservice";
import { useRouter } from "next/navigation";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { format } from "date-fns";
import { DatePickerInput } from "./datePicker";
import { RotateCcw } from "lucide-react";

interface TableExpenseProps {
  expenses: Expense[];
}

const TableExpense = ({ expenses }: TableExpenseProps) => {
  const [collapsedRows, setCollapsedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

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

  const toggleRow = (id: number) => {
    setCollapsedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

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
    setSelectedExpense(null);
    setIsModalOpen(true);
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
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.expense_type.active === 1 &&
      expense.cash_register.active === 1 &&
      (!dateRange[0] || new Date(expense.expense_date) >= dateRange[0]) &&
      (!dateRange[1] || new Date(expense.expense_date) <= dateRange[1])
  );

  const columns = [
    { key: "label", label: "Libellé" },
    { key: "amount", label: "Montant" },
    { key: "type", label: "Type de dépense" },
    { key: "register", label: "Caisse" },
    { key: "action", label: "" },
  ];

  if (!hasAdminAccessModifier) columns.pop();

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold">Gestion des Dépenses</h2>
        {hasAdminAccessCreer && (
          <Button onClick={handleCreate} variant="outline">
            <Icon icon="heroicons:plus" className="mr-2 h-4 w-4" />
            Ajouter une dépense
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <label className="text-sm font-medium">Filtrer par date :</label>
        <DatePickerInput
          date={dateRange[0]}
          setDateAction={(date: Date | null) =>
            setDateRange([date, dateRange[1]])
          }
          placeholder="Date début"
        />
        <span>au</span>
        <DatePickerInput
          date={dateRange[1]}
          setDateAction={(date: Date | null) =>
            setDateRange([dateRange[0], date])
          }
          placeholder="Date fin"
        />
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="text-red-500 hover:text-red-600"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <Fragment key={expense.id}>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => toggleRow(expense.id)}
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-none rounded-full"
                      >
                        <Icon
                          icon="heroicons:chevron-down"
                          className={cn(
                            "h-5 w-5 transition-transform duration-300",
                            {
                              "rotate-180": collapsedRows.includes(expense.id),
                            }
                          )}
                        />
                      </Button>
                      <span>{expense.label}</span>
                    </div>
                  </TableCell>

                  <TableCell>{formatAmount(Number(expense.amount))}</TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {expense.expense_type.name}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {expense.cash_register.cash_register_number}
                  </TableCell>

                  {hasAdminAccessModifier && (
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleEdit(expense)}
                      >
                        <Icon icon="heroicons:pencil" className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>

                {collapsedRows.includes(expense.id) && (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="pl-12 space-y-2">
                        <p>
                          <strong>Date:</strong>{" "}
                          {format(new Date(expense.expense_date), "dd/MM/yyyy")}
                        </p>
                        <p>
                          <strong>modifié le:</strong>{" "}
                          {format(
                            new Date(expense.updated_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucune dépense trouvée pour cette période
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        expense={selectedExpense}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default TableExpense;
