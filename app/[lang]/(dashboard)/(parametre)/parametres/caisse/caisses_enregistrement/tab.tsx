"use client";
import * as React from "react";
import { Pencil, Plus, Search } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CashRegister } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { fetchCashRegister } from "@/store/schoolservice";
import { DataTablePagination } from "./data-table-pagination";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const cashRegisterSchema = z.object({
  cash_register_number: z.string().trim().min(1, "Le numéro est requis"),
});

type CashRegisterFormValues = z.infer<typeof cashRegisterSchema>;

const AddCashRegisterSheet = ({
  isLoading,
  errors,
  register,
  handleSubmit,
  onSubmit,
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
            disabled={isLoading}
          />
          {errors.cash_register_number && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500"
            >
              {errors.cash_register_number.message}
            </motion.p>
          )}
        </div>
        
        <SheetFooter className="flex justify-end gap-2 pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </SheetClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Enregistrement...
              </span>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
};

const EditCashRegisterSheet = ({
  cashRegister,
  isLoading,
  errors,
  register,
  handleSubmit,
  onSubmit,
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
        <SheetTitle>
          <span className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Modifier la caisse {cashRegister.cash_register_number}
          </span>
        </SheetTitle>
      </SheetHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="cash_register_number">Numéro de caisse</Label>
          <Input
            id="cash_register_number"
            {...register("cash_register_number")}
            placeholder="Ex: CAISSE-001"
            disabled={isLoading}
          />
          {errors.cash_register_number && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500"
            >
              {errors.cash_register_number.message}
            </motion.p>
          )}
        </div>
        
        <SheetFooter className="flex justify-end gap-2 pt-4">
          <SheetClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </SheetClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Enregistrement...
              </span>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
};

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell colSpan={2} className="text-center">
      <div className="flex items-center justify-center space-x-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </TableCell>
  </TableRow>
);

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

  const handleSearchChange = React.useMemo(
    () => debounce((value: string) => {
      setGlobalFilter(value);
    }, 300),
    []
  );

  React.useEffect(() => {
    return () => {
      handleSearchChange.cancel();
    };
  }, [handleSearchChange]);

  const handleCashRegisterOperation = async (
    method: "POST" | "PUT",
    formData: CashRegisterFormValues,
    id?: number
  ) => {
    try {
      const url = id 
        ? `/api/cashRegister?id=${id}`
        : "/api/cashRegister";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 400 
            ? "Données invalides" 
            : method === "POST"
              ? "Erreur lors de la création"
              : "Erreur lors de la mise à jour"
        );
      }

      const updatedCashRegisters = await fetchCashRegister();
      setCashRegisters(updatedCashRegisters);
      
      toast.success(
        method === "POST" 
          ? "Caisse créée avec succès" 
          : "Caisse mise à jour avec succès",
        {
          position: "top-right",
          duration: 3000,
        }
      );
      
      router.refresh();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite",
        {
          position: "top-right",
          duration: 5000,
        }
      );
      throw error;
    }
  };

  const onSubmit = async (formData: CashRegisterFormValues) => {
    setIsLoading(true);
    try {
      const success = editingId
        ? await handleCashRegisterOperation("PUT", formData, editingId)
        : await handleCashRegisterOperation("POST", formData);
      
      if (success) {
        setEditingId(null);
        reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cashRegister: CashRegister) => {
    setEditingId(cashRegister.id);
    setValue("cash_register_number", cashRegister.cash_register_number);
  };

  const columns: ColumnDef<CashRegister>[] = [
    {
      accessorKey: "cash_register_number",
      header: () => <span className="font-semibold">Numéro de caisse</span>,
      cell: ({ row }) => (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium text-center"
        >
          {row.getValue("cash_register_number")}
        </motion.div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="font-semibold">Actions</span>,
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
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 shadow-sm">
        <CardHeader className="p-0 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                Gestion des caisses
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Liste et gestion des caisses enregistrées
              </p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  color="default"
                  onClick={() => {
                    setEditingId(null);
                    reset();
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" /> 
                  <span>Ajouter une caisse</span>
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
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro..."
              defaultValue={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:w-64 pl-9"
            />
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id} 
                        className="text-center hover:bg-muted/75 transition-colors"
                      >
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
                      className="hover:bg-muted/25 transition-colors"
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
                      {globalFilter ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-muted-foreground"
                        >
                          Aucune caisse ne correspond à votre recherche.
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-muted-foreground"
                        >
                          Aucune caisse enregistrée pour le moment.
                        </motion.div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4">
            <DataTablePagination table={table} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CashRegisterTable;