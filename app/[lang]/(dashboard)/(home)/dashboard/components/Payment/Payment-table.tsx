"use client";
import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils"
import { Payment } from "@/lib/interface";



interface PaymentTableProps {
  data: Payment[];
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span>#{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "student",
    header: "Étudiant",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.student.name} {row.original.student.first_name}
      </span>
    ),
  },
  {
    accessorKey: "student.registration_number",
    header: "Matricule",
    cell: ({ row }) => (
      <span>{row.original.student.registration_number}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Montant",
    cell: ({ row }) => (
      <span>{row.getValue("amount")} FCFA</span>
    ),
  },
  {
    accessorKey: "installment.due_date",
    header: "Date d'échéance",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {new Date(row.original.installment.due_date).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date de paiement",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {new Date(row.getValue("created_at")).toLocaleDateString()}
      </span>
    ),
  }
];

const PaymentTable = ({ data }: PaymentTableProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="overflow-x-auto">
        <div className="h-full w-full overflow-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-default-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-sm font-semibold text-default-600 h-12 last:text-end whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-1">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-default-50 border-default-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-sm text-default-600 py-3 last:text-end"
                      >
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Aucun résultat trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 mt-5">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="w-7 h-7 p-0 bg-default-100 hover:bg-default-200 text-default-600"
        >
          <Icon icon="heroicons:chevron-left" className="w-3.5 h-3.5 rtl:rotate-180" />
        </Button>

        {table.getPageOptions().map((page, pageIdx) => (
          <Button
            onClick={() => table.setPageIndex(pageIdx)}
            key={`orders-table-${pageIdx}`}
            className={cn("w-7 h-7 p-0 bg-default-100 hover:bg-default-200 text-default-600", {
              "bg-primary text-skyblue-foreground": pageIdx === table.getState().pagination.pageIndex
            })}
          >
            {page + 1}
          </Button>
        ))}

        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="w-7 h-7 p-0 bg-default-100 hover:bg-default-200 text-default-600"
        >
          <Icon icon="heroicons:chevron-right" className="w-3.5 h-3.5 rtl:rotate-180" />
        </Button>
      </div>
    </>
  );
}

export default PaymentTable;