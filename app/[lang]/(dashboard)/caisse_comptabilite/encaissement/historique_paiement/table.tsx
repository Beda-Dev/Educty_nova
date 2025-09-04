"use client";
import * as React from "react";
import { 
  ArrowUpDown, 
  Eye, 
  FileSpreadsheet, 
  RefreshCw,
  ArrowUp,
  ArrowDown 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  flexRender,
  FilterFn,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn, universalExportToExcel } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { Payment } from "@/lib/interface";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSchoolStore } from "@/store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface ColumnConfig {
  id: string;
  header: string;
  enabled: boolean;
}

export function PaymentTable({ data }: { data: Payment[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<Date | null>(null);
  const [amountFilter, setAmountFilter] = React.useState("");
  const [cashRegisterFilter, setCashRegisterFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const router = useRouter();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const { academicYearCurrent , settings , assignmentTypes , pricing   } = useSchoolStore();

  // Export modal state
  const [exportConfig, setExportConfig] = React.useState<{
    isOpen: boolean;
    columns: ColumnConfig[];
  }>({
    isOpen: false,
    columns: [],
  });

  // Custom filter function for nested data
  const nestedFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    if (filterValue === undefined || filterValue === null || filterValue === "") {
      return true;
    }
    
    const value = getNestedValue(row.original, columnId);
    if (value === undefined || value === null) {
      return false;
    }
    
    // If it's a number, compare as number
    const numValue = Number(value);
    const numFilter = Number(filterValue);
    if (!isNaN(numValue) && !isNaN(numFilter)) {
      return numValue === numFilter;
    }
    
    // Otherwise, compare as string
    return String(value).trim().toLowerCase().includes(String(filterValue).trim().toLowerCase());
  };

  // Helper to access nested values
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part] ?? "", obj);
  };

  const columns: ColumnDef<Payment>[] = [
    {
      id: "student.registration_number",
      accessorFn: (row) => row.student.registration_number,
      header: "Matricule",
      filterFn: nestedFilterFn,
    },
    {
      id: "student.name",
      accessorFn: (row) => `${row.student.name} ${row.student.first_name}`,
      header: "Élève",
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div className="flex items-center gap-3">
            {student.photo && student.photo !== "null" ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${student.photo}`}
                alt={`${student.name} ${student.first_name}`}
                width={30}
                height={30}
                className="rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-100 text-sm font-medium">
                  {student.name[0]?.toUpperCase()}
                  {student.first_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="truncate">
              {student.name} {student.first_name}
            </span>
          </div>
        );
      },
      filterFn: nestedFilterFn,
    },
    {
      id: "student.assignment_type_id",
      accessorFn: (row) => studentStatusMap[row.student.assignment_type_id as keyof typeof studentStatusMap] || `Statut ${row.student.assignment_type_id}`,
      header: "Statut",
      cell: ({ row }) => {
        const statusId = row.original.student.assignment_type_id;
        const statusLabel = studentStatusMap[statusId as keyof typeof studentStatusMap] || `Statut ${statusId}`;
        return (
          <Badge color="secondary" className="text-xs">{statusLabel}</Badge>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const statusId = row.original.student.assignment_type_id;
        return statusId.toString() === filterValue;
      },
    },
    {
      id: "amount",
      accessorFn: (row) => parseFloat(row.amount),
      header: "Montant",
      cell: ({ row }) => {
        const amount = parseFloat(row.original.amount);
        return (
          <span className="text-xs font-medium text-green-600">
            {amount.toLocaleString()} {settings[0]?.currency || "FCFA"}
          </span>
        );
      },
    },
    {
      id: "installment.pricing.label",
      accessorFn: (row) => row.installment?.pricing_id ? pricing.find(p => Number(p.id) === Number(row.installment.pricing_id))?.label : "N/A",
      header: "Frais",
      cell: ({ row }) => {
        const label = row.original.installment?.pricing_id ? pricing.find(p => Number(p.id) === Number(row.original.installment.pricing_id))?.label : "N/A";
        return label ? (
          <Badge variant="outline" className="text-xs">{label}</Badge>
        ) : (
          <span className="text-gray-400 text-xs">N/A</span>
        );
      },
      filterFn: nestedFilterFn,
    },
    {
      id: "installment.amount_due",
      accessorFn: (row) => parseFloat(row.installment?.amount_due || "0"),
      header: "Montant dû",
      cell: ({ row }) => {
        const amountDue = parseFloat(row.original.installment?.amount_due || "0");
        return (
          <span className=" text-orange-600 text-xs">
            {amountDue.toLocaleString()} {settings[0]?.currency || "FCFA"}
          </span>
        );
      },
    },
    {
      id: "installment.due_date",
      accessorFn: (row) => row.installment?.due_date,
      header: "Date d'échéance",
      cell: ({ row }) => {
        const dueDate = row.original.installment?.due_date;
        return dueDate ? new Date(dueDate).toLocaleDateString() : "N/A";
      },
      filterFn: nestedFilterFn,
    },
    {
      id: "cash_register.cash_register_number",
      accessorFn: (row) => row.cash_register.cash_register_number,
      header: "Caisse",
      filterFn: nestedFilterFn,
    },
    {
      id: "cashier.name",
      accessorFn: (row) => `${row.cashier.name}`,
      header: "Caissier",
      cell: ({ row }) => {
        const cashier = row.original.cashier;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-100 text-xs">
                {cashier.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{cashier.name}</span>
          </div>
        );
      },
      filterFn: nestedFilterFn,
    },
    {
      id: "payment_methods",
      accessorFn: (row) => row.payment_methods?.map(pm => pm.name).join(", ") || "N/A",
      header: "Méthodes de paiement",
      cell: ({ row }) => {
        const methods = row.original.payment_methods;
        return methods && methods.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {methods.map((method, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {method.name}: {parseFloat(method.pivot.montant).toLocaleString()} {settings[0]?.currency || "FCFA"}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">N/A</span>
        );
      },
    },
    {
      id: "created_at",
      accessorFn: (row) => new Date(row.created_at),
      header: "Date paiement",
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-xs">{date.toLocaleDateString()}</span>
            <span className="text-xs text-gray-500">{date.toLocaleTimeString()}</span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue: string) => {
        const rowDate = new Date(row.getValue(columnId) as Date)
          .toISOString()
          .split("T")[0];
        return rowDate === filterValue;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/caisse_comptabilite/encaissement/historique_paiement/${row.original.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voir les détails du paiement</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 15,
        pageIndex: 0,
      },
    },
    onColumnFiltersChange: setColumnFilters,    
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Apply filters with useEffect
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = [];
  
    if (dateFilter) {
      newFilters.push({
        id: "created_at",
        value: dateFilter.toISOString().split("T")[0],
      });
    }

    if (amountFilter) {
      newFilters.push({
        id: "amount",
        value: amountFilter,
      });
    }

    if (cashRegisterFilter) {
      newFilters.push({
        id: "cash_register.cash_register_number",
        value: cashRegisterFilter,
      });
    }

    if (statusFilter) {
      newFilters.push({
        id: "student.assignment_type.label",
        value: statusFilter,
      });
    }
  
    setColumnFilters(newFilters);
  }, [dateFilter, amountFilter, cashRegisterFilter, statusFilter]);

  // Prepare export modal
  const prepareExportModal = () => {
    const exportColumns = [
      { id: "student.registration_number", header: "Matricule", enabled: true },
      { id: "student.name", header: "Élève", enabled: true },
      { id: "student.assignment_type.label", header: "Statut élève", enabled: true },
      { id: "amount", header: "Montant", enabled: true },
      { id: "installment.pricing.label", header: "Type de frais", enabled: true },
      { id: "installment.amount_due", header: "Montant dû", enabled: true },
      { id: "installment.due_date", header: "Date d'échéance", enabled: true },
      { id: "cash_register.cash_register_number", header: "Numéro de caisse", enabled: true },
      { id: "cashier.name", header: "Caissier", enabled: true },
      { id: "payment_methods", header: "Méthodes de paiement", enabled: true },
      { id: "created_at", header: "Date de paiement", enabled: true },
    ];

    setExportConfig({
      isOpen: true,
      columns: exportColumns,
    });
  };

  // Handle export with selected columns
  const handleExportWithConfig = (selectedColumns: string[]) => {
    universalExportToExcel({
      source: {
        type: "tanstack",
        table,
        formatRow: (row) => {
          const formattedRow: Record<string, any> = {};

          selectedColumns.forEach((col) => {
            switch (col) {
              case "student.registration_number":
                formattedRow["Matricule"] = row.student.registration_number;
                break;
              case "student.name":
                formattedRow["Élève"] = `${row.student.name} ${row.student.first_name}`;
                break;
              case "student.assignment_type.label":
                formattedRow["Statut élève"] = row.student.assignment_type_id ? assignmentTypes.find(at => Number(at.id) === Number(row.student.assignment_type_id))?.label : "N/A";
                break;
              case "amount":
                formattedRow["Montant"] = `${parseFloat(row.amount).toLocaleString()} ${settings[0]?.currency || "FCFA"}`;
                break;
              case "installment.pricing.label":
                formattedRow["Type de frais"] = row.installment?.pricing_id ? pricing.find(p => Number(p.id) === Number(row.installment.pricing_id))?.label : "N/A";
                break;
              case "installment.amount_due":
                formattedRow["Montant dû"] = `${parseFloat(row.installment?.amount_due || "0").toLocaleString()} ${settings[0]?.currency || "FCFA"}`;
                break;
              case "installment.due_date":
                formattedRow["Date d'échéance"] = row.installment?.due_date ? new Date(row.installment.due_date).toLocaleDateString() : "N/A";
                break;
              case "cash_register.cash_register_number":
                formattedRow["Numéro de caisse"] = row.cash_register.cash_register_number;
                break;
              case "cashier.name":
                formattedRow["Caissier"] = row.cashier.name;
                break;
              case "payment_methods":
                formattedRow["Méthodes de paiement"] = row.payment_methods?.map(pm => `${pm.name}: ${parseFloat(pm.pivot.montant).toLocaleString()} ${settings[0]?.currency || "FCFA"}`).join("; ") || "N/A";
                break;
              case "created_at":
                formattedRow["Date de paiement"] = new Date(row.created_at).toLocaleDateString();
                break;
            }
          });

          return formattedRow;
        },
      },
      fileName: `Historique_paiements_${new Date().toISOString().split('T')[0]}.xlsx`,
    });
  };

  // Quick export function
  const handleQuickExport = () => {
    universalExportToExcel({
      source: {
        type: "tanstack",
        table,
        formatRow: (row) => ({
          "Matricule": row.student.registration_number,
          "Élève": `${row.student.name} ${row.student.first_name}`,
          "Statut élève": row.student.assignment_type_id ? assignmentTypes.find(at => Number(at.id) === Number(row.student.assignment_type_id))?.label : "N/A",
          "Montant": `${parseFloat(row.amount).toLocaleString()} ${settings[0]?.currency || "FCFA"}`,
          "Type de frais": row.installment.pricing_id ? pricing.find(p => Number(p.id) === Number(row.installment.pricing_id))?.label : "N/A",
          "Montant dû": `${parseFloat(row.installment?.amount_due || "0").toLocaleString()} ${settings[0]?.currency || "FCFA"}`,
          "Date d'échéance": row.installment?.due_date ? new Date(row.installment.due_date).toLocaleDateString() : "N/A",
          "Numéro de caisse": row.cash_register.cash_register_number,
          "Caissier": row.cashier.name,
          "Méthodes de paiement": row.payment_methods?.map(pm => `${pm.name}: ${parseFloat(pm.pivot.montant).toLocaleString()} ${settings[0]?.currency || "FCFA"}`).join("; ") || "N/A",
          "Date de paiement": new Date(row.created_at).toLocaleDateString(),
        }),
      },
      fileName: `Historique_paiements_${new Date().toISOString().split('T')[0]}.xlsx`,
    });
  };

  // Get unique values for filters
  const uniqueCashRegisters = React.useMemo(() => {
    const registers = data.map(payment => payment.cash_register.cash_register_number);
    return [...new Set(registers)];
  }, [data]);

  // Map des statuts d'étudiants basé sur assignmentTypes
  const studentStatusMap = React.useMemo(() => {
    return assignmentTypes?.reduce((acc, type) => {
      acc[type.id] = type.label;
      return acc;
    }, {} as Record<number, string>) || {};
  }, [assignmentTypes]);

  const statusOptions = React.useMemo(() => {
    const statuses = data.map(payment => payment.student.assignment_type_id);
    return [...new Set(statuses)].map(id => ({
      id,
      label: studentStatusMap[id] || `Statut ${id}`
    }));
  }, [data, studentStatusMap]);

  return (
    <Card className="p-4">
      {/* Filters Section */}
      <div className={`grid gap-4 mb-4 ${table.getPageCount() > 10 ? 'grid-cols-7' : 'grid-cols-6'}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recherche :
          </label>
          <Input
            placeholder="Rechercher..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date :
          </label>
          <DatePicker
            selected={dateFilter}
            onChange={(date) => setDateFilter(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Filtrer par date"
            className="w-full p-2 border rounded"
            isClearable
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant :
          </label>
          <Input
            placeholder="Montant..."
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            type="number"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caisse :
          </label>
          <Select value={cashRegisterFilter} onValueChange={setCashRegisterFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Caisse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes</SelectItem>
              {uniqueCashRegisters.map((register) => (
                <SelectItem key={register} value={register}>
                  {register}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut :
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGlobalFilter("");
                    setDateFilter(null);
                    setAmountFilter("");
                    setCashRegisterFilter("");
                    setStatusFilter("");
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Réinitialiser les filtres</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {table.getPageCount() > 10 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lignes :
            </label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} lignes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleQuickExport}
                color="success"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exporter l'historique des paiements en Excel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-3">
          <div className="text-sm text-gray-600">Total paiements</div>
          <div className="text-2xl font-bold text-blue-600">
            {table.getFilteredRowModel().rows.length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-gray-600">Montant total</div>
          <div className="text-2xl font-bold text-green-600">
            {table.getFilteredRowModel().rows
              .reduce((sum, row) => sum + parseFloat(row.original.amount), 0)
              .toLocaleString()} {settings[0]?.currency || "FCFA"}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-gray-600">Étudiants uniques</div>
          <div className="text-2xl font-bold text-purple-600">
            {new Set(table.getFilteredRowModel().rows.map(row => row.original.student.id)).size}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-gray-600">Caisses utilisées</div>
          <div className="text-2xl font-bold text-orange-600">
            {new Set(table.getFilteredRowModel().rows.map(row => row.original.cash_register.cash_register_number)).size}
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md overflow-x-auto text-xs">
        <Table className="text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none text-xs"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {{
                        asc: <ArrowUp className="w-4 h-4" />,
                        desc: <ArrowDown className="w-4 h-4" />,
                      }[header.column.getIsSorted() as string] ?? (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 hover:shadow-sm cursor-pointer transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Icon icon="heroicons:document-text" className="h-8 w-8 text-gray-400" />
                    <span className="text-gray-500">Aucun paiement trouvé</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Affichage de {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} à{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          sur {table.getFilteredRowModel().rows.length} paiements
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </span>
          <div className="flex gap-1">
            <Button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              <Icon icon="heroicons:chevron-double-left" className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              <Icon icon="heroicons:chevron-left" className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              <Icon icon="heroicons:chevron-double-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default PaymentTable;