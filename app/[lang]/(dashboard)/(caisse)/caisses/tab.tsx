"use client";
import * as React from "react";
import { Pencil, Plus } from "lucide-react";
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
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CashRegister } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { fetchCashRegister } from "@/store/schoolservice";
import { DataTablePagination } from "./data-table-pagination";
import { debounce } from "lodash";

const cashRegisterSchema = z.object({
  cash_register_number: z.string().trim().min(1, "Le numéro est requis"),
});

type CashRegisterFormValues = z.infer<typeof cashRegisterSchema>;

// Composant séparé pour l'ajout d'une caisse
const AddCashRegisterSheet = ({ 
  isLoading,
  errors,
  register,
  handleSubmit,
  onSubmit
}: {
  isLoading: boolean;
  errors: any;
  register: any;
  handleSubmit: any;
  onSubmit: (data: CashRegisterFormValues) => Promise<void>;
}) => {
  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Ajouter une caisse</SheetTitle>
      </SheetHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="cash_register_number">Numéro de caisse</Label>
          <Input
            id="cash_register_number"
            {...register("cash_register_number")}
            placeholder="Ex: CAISSE-001"
          />
          {errors.cash_register_number && (
            <p className="text-sm text-red-500">
              {errors.cash_register_number.message}
            </p>
          )}
        </div>
        
        <SheetFooter className="flex justify-end gap-2 pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </SheetClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "En cours..." : "Enregistrer"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
};

// Composant séparé pour la modification d'une caisse
const EditCashRegisterSheet = ({ 
  cashRegister,
  isLoading,
  errors,
  register,
  handleSubmit,
  onSubmit
}: {
  cashRegister: CashRegister;
  isLoading: boolean;
  errors: any;
  register: any;
  handleSubmit: any;
  onSubmit: (data: CashRegisterFormValues) => Promise<void>;
}) => {
  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Modifier la caisse {cashRegister.cash_register_number}</SheetTitle>
      </SheetHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="cash_register_number">Numéro de caisse</Label>
          <Input
            id="cash_register_number"
            {...register("cash_register_number")}
            placeholder="Ex: CAISSE-001"
          />
          {errors.cash_register_number && (
            <p className="text-sm text-red-500">
              {errors.cash_register_number.message}
            </p>
          )}
        </div>
        
        <SheetFooter className="flex justify-end gap-2 pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </SheetClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "En cours..." : "Enregistrer"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
};

export function CashRegisterTable({ data }: { data: CashRegister[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const router = useRouter();
  const { cashRegisters, setCashRegisters } = useSchoolStore();

  const formMethods = useForm<CashRegisterFormValues>({
    resolver: zodResolver(cashRegisterSchema),
    defaultValues: {
      cash_register_number: "",
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = formMethods;

  const handleSearchChange = debounce((value: string) => {
    setGlobalFilter(value);
  }, 300);

  const createCashRegister = async (formData: CashRegisterFormValues) => {
    try {
      const response = await fetch("/api/cashRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 400 
            ? "Données invalides" 
            : "Erreur lors de la création"
        );
      }

      const updatedCashRegisters = await fetchCashRegister();
      setCashRegisters(updatedCashRegisters);
      toast.success("Caisse créée avec succès");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite"
      );
      throw error;
    }
  };

  const updateCashRegister = async (id: number, formData: CashRegisterFormValues) => {
    try {
      const response = await fetch(`/api/cashRegister?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 400
            ? "Données invalides"
            : "Erreur lors de la mise à jour"
        );
      }

      const updatedCashRegisters = await fetchCashRegister();
      setCashRegisters(updatedCashRegisters);
      toast.success("Caisse mise à jour avec succès");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite"
      );
      throw error;
    }
  };

  const onSubmit = async (formData: CashRegisterFormValues) => {
    setIsLoading(true);
    try {
      if (editingId) {
        await updateCashRegister(editingId, formData);
      } else {
        await createCashRegister(formData);
      }
    } finally {
      setIsLoading(false);
      setEditingId(null);
      reset();
    }
  };

  const handleEdit = (cashRegister: CashRegister) => {
    setEditingId(cashRegister.id);
    setValue("cash_register_number", cashRegister.cash_register_number);
  };

  const columns: ColumnDef<CashRegister>[] = [
    {
      accessorKey: "cash_register_number",
      header: "Numéro de caisse",
      cell: ({ row }) => (
        <div className="font-medium text-center">
          {row.getValue("cash_register_number")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const cashRegister = row.original;
        return (
          <div className="flex justify-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(cashRegister)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <EditCashRegisterSheet
                cashRegister={cashRegister}
                isLoading={isLoading}
                errors={errors}
                register={register}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
              />
            </Sheet>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { 
      sorting, 
      columnFilters,
      globalFilter 
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <Input
          placeholder="Rechercher par numéro..."
          defaultValue={globalFilter}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:w-64"
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                reset();
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter une caisse
            </Button>
          </SheetTrigger>
          <AddCashRegisterSheet
            isLoading={isLoading}
            errors={errors}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
          />
        </Sheet>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
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
      
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </Card>
  );
}

export default CashRegisterTable;