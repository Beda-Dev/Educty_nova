"use client";
import * as React from "react";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye } from "lucide-react";
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
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { Payment } from "@/lib/interface";



export function PaymentTable({ data }: { data: Payment[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<Date | null>(null);
  const router = useRouter();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);



  const columns: ColumnDef<Payment>[] = [
    {
      accessorFn: (row) => row.student.registration_number,
      id:"matricule",
      header: "Matricule",
    },
    {
      accessorFn: (row) => `${row.student.name} ${row.student.first_name}`,
      id:"eleve",
      header: "Éleve",
    },
    {
      accessorFn: (row) => row.amount,
      header: "Montant",
      id:"montant",
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.amount}</span>;
      },
    },
    {
      accessorFn: (row) => row.cash_register.cash_register_number,
      header: "Numéro de caisse",
    },
    {
      accessorFn: (row) => new Date(row.created_at),
      id: "created_at",
      header: "Date de paiement",
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return date.toLocaleDateString();
      },
      filterFn: (row, columnId, filterValue: string) => {
        const rowDate = new Date(row.getValue(columnId) as Date)
          .toISOString()
          .split("T")[0];
        return rowDate === filterValue;
      },
    },
    {
      accessorFn: (row) => new Date(row.created_at).toLocaleDateString(),
      header: "Date de paiement",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          className="p-2"
          onClick={() => router.push(`/caisse_comptabilite/encaissement/historique_paiement/${row.original.id}`)}
        >
          <Eye className="h-5 w-5" />
        </Button>
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
    onColumnFiltersChange: setColumnFilters,    
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      const paymentDate = new Date(row.original.created_at);

      // Filtre global (recherche textuelle)
      const matchesGlobalFilter =
        typeof value === "string"
          ? value.toLowerCase().includes(filterValue.toLowerCase())
          : false;

      // Filtre par date
      const matchesDateFilter = dateFilter
        ? paymentDate.toLocaleDateString() === dateFilter.toLocaleDateString()
        : true;

      return matchesGlobalFilter && matchesDateFilter;
    },
  });

  React.useEffect(() => {
    const newFilters: ColumnFiltersState = [];
  
    if (dateFilter) {
      newFilters.push({
        id: "created_at",
        value: dateFilter.toISOString().split("T")[0],
      });
    }
  
    setColumnFilters(newFilters);
  }, [dateFilter]);
  

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <Input
          placeholder="Rechercher..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-64"
        />
        <DatePicker
          selected={dateFilter}
          onChange={(date) => setDateFilter(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Filtrer par date"
          className="w-48 p-2 border rounded"
          isClearable
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : typeof header.column.columnDef.header === "function"
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {typeof cell.column.columnDef.cell === "function"
                      ? cell.column.columnDef.cell(cell.getContext())
                      : cell.getContext().renderValue()}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                Aucun résultat trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()}
        </span>
        <div className="flex gap-2">
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
        </div>
      </div>
    </Card>
  );
}

export default PaymentTable;