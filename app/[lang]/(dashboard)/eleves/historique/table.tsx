"use client";
import * as React from "react";
import { Eye } from "lucide-react";
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
import { Registration } from "@/lib/interface";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

export function AdvancedDataTable({ data }: { data: Registration[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const router = useRouter();

  const columns: ColumnDef<Registration>[] = [
    {
      accessorFn: (row) => row.student.registration_number,
      id: "registration_number",
      header: "Matricule",
    },
    {
      accessorFn: (row) => row.student.name,
      id: "name",
      header: "Nom",
    },
    {
      accessorFn: (row) => row.student.first_name,
      id: "first_name",
      header: "Prénom",
    },
    {
      accessorFn: (row) => row.classe.label,
      id: "classe",
      header: "Classe",
    },
    {
      accessorFn: (row) => row.academic_year.label,
      id: "academic_year",
      header: "Année Académique",
    },
    {
      accessorFn: (row) => new Date(row.created_at),
      id: "created_at",
      header: "Date d'inscription",
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return date.toLocaleDateString();
      },
      filterFn: (row, columnId, filterValue: string) => {
        const rowDate = new Date(row.getValue(columnId) as string)
          .toISOString()
          .split("T")[0];
        return rowDate === filterValue;
      },
    },
    {
      accessorFn: (row) => row.academic_year.isCurrent,
      id: "status",
      header: "Statut",
      cell: ({ row }) => {
        const isCurrent = row.original.academic_year.isCurrent;
        return (
          <span
            className={cn("px-2 py-1 rounded", {
              "bg-green-100 text-green-800": isCurrent === 1,
              "bg-red-100 text-red-800": isCurrent === 0,
            })}
          >
            {isCurrent === 1 ? "Actif" : "Inactif"}
          </span>
        );
      },
      filterFn: (row, columnId, filterValue: string) => {
        return String(row.getValue(columnId)) === filterValue;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          className="p-2"
          onClick={() => router.push(`/eleves/historique/${row.original.id}`)}
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
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  React.useEffect(() => {
    const newFilters: ColumnFiltersState = [];
  
    if (statusFilter) {
      newFilters.push({
        id: "status",
        value: statusFilter,
      });
    }
  
    if (dateFilter) {
      newFilters.push({
        id: "created_at",
        value: dateFilter.toISOString().split("T")[0],
      });
    }
  
    setColumnFilters(newFilters);
  }, [statusFilter, dateFilter]);
  

  return (
    <Card className="p-4">
      <CardTitle className="text-2xl font-semibold">
        Historique des inscriptions
      </CardTitle>
      <CardContent>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Input
          placeholder="Rechercher..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-64"
        />

        <div className="">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous</SelectItem>
            <SelectItem value="1">Actif</SelectItem>
            <SelectItem value="0">Inactif</SelectItem>
          </SelectContent>
        </Select>
        </div>

        <DatePicker
          selected={dateFilter}
          onChange={(date) => setDateFilter(date || null)}
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
      </CardContent>
    </Card>
  );
}

export default AdvancedDataTable;