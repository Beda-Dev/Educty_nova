"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/store";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegistrationMerge } from "@/lib/interface";
import { EditStudentModal } from "./editModalStudent";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { exportToExcel } from "./exportToExcel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ExportModal from "./modalColumn";
import { ProxiedImage } from "@/components/ImagesLogO/imageProxy";

interface ColumnConfig {
  id: string;
  header: string;
  enabled: boolean;
}

const StudentTableStatus = ({
  Register,
}: {
  Register: RegistrationMerge[];
}) => {
  const { classes, assignmentTypes, academicYearCurrent , series } = useSchoolStore();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] =
    useState<RegistrationMerge | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [exportConfig, setExportConfig] = useState<{
    isOpen: boolean;
    columns: ColumnConfig[];
  }>({
    isOpen: false,
    columns: [],
  });

  const prepareExportModal = () => {
    const exportColumns = [
      { id: "student.name", header: "Élève", enabled: true },
      { id: "student.registration_number", header: "Matricule", enabled: true },
      { id: "classe.label", header: "Classe", enabled: true },
      { id: "student.birth_date", header: "Date de naissance", enabled: true },
      { id: "student.sexe", header: "Sexe", enabled: true },
      { id: "student.assignment_type.label", header: "Statut", enabled: true },
    ];

    setExportConfig({
      isOpen: true,
      columns: exportColumns,
    });
  };

  const handleExportWithConfig = (selectedColumns: string[]) => {
    exportToExcel({
      table,
      fileName: `Liste_des_élèves_${
        academicYearCurrent ? `${academicYearCurrent.label}` : ``
      }.xlsx`,
      formatRow: (row) => {
        const formattedRow: Record<string, any> = {};

        selectedColumns.forEach((col) => {
          if (col === "student.name") {
            formattedRow[
              "Élève"
            ] = `${row.student.name} ${row.student.first_name}`;
          } else if (col === "student.registration_number") {
            formattedRow["Matricule"] = row.student.registration_number;
          } else if (col === "classe.label") {
            formattedRow["Classe"] = `${row.classe.label} ${row.classe.serie_id ? `(${series.find((serie) => Number(serie.id) === Number(row.classe.serie_id))?.label})` : ""}`;
          } else if (col === "student.birth_date") {
            formattedRow["Date de naissance"] = row.student.birth_date;
          } else if (col === "student.sexe") {
            formattedRow["Sexe"] = row.student.sexe;
          } else if (col === "student.assignment_type.label") {
            formattedRow["Statut"] = row.student.assignment_type.label;
          }
        });

        return formattedRow;
      },
    });
  };

  // Fonction de filtrage personnalisée pour les données imbriquées
  const nestedFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    if (filterValue === undefined || filterValue === null || filterValue === "") {
      return true;
    }
    
    const value = getNestedValue(row.original, columnId);
    if (value === undefined || value === null) {
      return false;
    }
    
    // Si c'est un nombre, comparer en tant que nombre
    const numValue = Number(value);
    const numFilter = Number(filterValue);
    if (!isNaN(numValue) && !isNaN(numFilter)) {
      return numValue === numFilter;
    }
    
    // Sinon, comparer en tant que chaîne
    return String(value).trim().toLowerCase() === String(filterValue).trim().toLowerCase();
  };

  // Helper pour accéder aux valeurs imbriquées
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part] ?? "", obj);
  };

  const columns: ColumnDef<RegistrationMerge>[] = [
    {
      id: "student.name",
      accessorFn: (row) => row.student.name,
      header: "Élève",
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div className="flex items-center gap-3">
            {student.photo ? (
              (() => {
                const raw = typeof student.photo === 'string' ? student.photo : '';
                const src = raw
                  ? (/^https?:\/\//i.test(raw)
                      ? raw
                      : `${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${raw}`)
                  : '';
                return (
                  <ProxiedImage
                    src={src}
                    alt={`${student.name} ${student.first_name}`}
                    className="h-[30px] w-[30px] rounded-full border border-gray-200 object-cover"
                  />
                );
              })()
            ) : (
              <Avatar className="h-9 w-9">
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
      id: "student.registration_number",
      accessorFn: (row) => row.student.registration_number,
      header: "Matricule",
      filterFn: nestedFilterFn,
    },
    {
      id: "classe.id",
      accessorFn: (row) => {
        const serie = series.find(s => s?.id?.toString() === row.classe.serie_id?.toString());
        return `${row.classe.label}${serie?.label ? ` (${serie.label})` : ''}`;
      },
      header: "Classe",
      cell: ({ row }) => {
        try {
          const serie = series.find(s => s?.id?.toString() === row.original.classe.serie_id?.toString());
          return `${row.original.classe.label}${serie?.label ? ` (${serie.label})` : ''}`;
        } catch (error) {
          console.error('Erreur lors de l\'affichage de la classe :', error);
          return row.original.classe.label; // Retourne au moins le libellé de la classe en cas d'erreur
        }
      },
      filterFn: nestedFilterFn,
    },
    {
      id: "student.birth_date",
      accessorFn: (row) => row.student.birth_date,
      header: "Date de naissance",
      filterFn: nestedFilterFn,
    },
    {
      id: "student.sexe",
      accessorFn: (row) => row.student.sexe,
      header: "Sexe",
      filterFn: nestedFilterFn,
    },
    {
      id: "student.assignment_type.label",
      accessorFn: (row) => row.student.assignment_type.label,
      header: "Statut",
      cell: ({ row }) => {
        const student = row.original;
        return <Badge>{student.student.assignment_type.label}</Badge>;
      },
      filterFn: nestedFilterFn,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex gap-3 justify-end">
            <Button
              size="icon"
              color='tyrian'
              className="h-7 w-7"
              onClick={() => openEditModal(student)}
            >
              <Icon icon="heroicons:pencil" className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => handleViewStudent(student.student)}
            >
              <Icon icon="heroicons:eye" className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: Register,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 15,
        pageIndex: 0,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Gestion des filtres avec useEffect comme dans l'exemple fonctionnel
  const [statusFilter, setStatusFilter] = useState("");
  const [sexeFilter, setSexeFilter] = useState("");
  const [classeFilter, setClasseFilter] = useState(0);

  useEffect(() => {
    const newFilters: ColumnFiltersState = [];

    if (statusFilter) {
      newFilters.push({
        id: "student.assignment_type.label",
        value: statusFilter,
      });
    }

    if (sexeFilter) {
      newFilters.push({
        id: "student.sexe",
        value: sexeFilter,
      });
    }

    if (classeFilter) {
      newFilters.push({
        id: "classe.id",
        value: classeFilter,
      });
    }

    setColumnFilters(newFilters);
  }, [statusFilter, sexeFilter, classeFilter]);

  const openEditModal = (student: RegistrationMerge) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const handleViewStudent = (student: RegistrationMerge["student"]) => {
    if (student?.registration_number) {
      router.push(`students/${student.registration_number}`);
    }
  };

  // useEffect(() => {
  //   console.log("Filtres appliqués :", table.getState().columnFilters);
  // }, [table.getState().columnFilters]);

  const handleExport = () => {
    exportToExcel({
      table,
      fileName: `Liste_des_élèves_${
        academicYearCurrent ? `${academicYearCurrent.label}` : ``
      }.xlsx`,
      formatRow: (row) => ({
        Élève: `${row.student.name} ${row.student.first_name}`,
        Matricule: row.student.registration_number,
        Classe: row.classe.label,
        "Date de naissance": row.student.birth_date,
        Sexe: row.student.sexe,
        Statut: row.student.assignment_type.label,
      }),
    });
  };


  return (
    <>
      <div
        className={`grid  gap-4 mb-4 ${
          table.getPageCount() > 10 ? `grid-cols-7` : `grid-cols-6`
        }`}
      >
        <div className="">
          <label className="block text-sm font-medium text-gray-700">
            Recherche :
          </label>
          <Input
            placeholder="Rechercher..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="">
          <label className="text-sm font-medium text-gray-700">Sexe :</label>
          <Select value={sexeFilter} onValueChange={setSexeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Sexe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              <SelectItem value="Masculin">Masculin</SelectItem>
              <SelectItem value="Feminin">Feminin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <label className="block text-sm font-medium text-gray-700">
            Statut :
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {assignmentTypes
                .filter((type) => type.label)
                .map((type) => (
                  <SelectItem key={type.id} value={type.label}>
                    {type.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <label className="block text-sm font-medium text-gray-700">
            Classe :
          </label>
          <Select value={classeFilter.toString()} onValueChange={(value) => setClasseFilter(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {classes.map((classe) => (
                <SelectItem key={classe.id} value={classe.id.toString()}>
                  {classe.label} {classe.serie ? `(${classe.serie.label})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700"></label>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => {
              setGlobalFilter("");
              setStatusFilter("");
              setSexeFilter("");
              setClasseFilter(0);
            }}
          >
            <RefreshCw color="blue" className="h-4 w-4" />
          </Button>
        </div>


        <div className="flex items-end justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="mt-5"
                color="success"
                onClick={prepareExportModal}
              >
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Exporter
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cliquer ici pour exporter vos données dans un tableau excel</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {table.getPageCount() > 10 && (
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
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
        )}
      </div>

      <div className="rounded-md overflow-x-auto ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="cursor-pointer select-none"
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
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-100 hover:shadow-sm cursor-pointer transition"
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>

      <EditStudentModal
        isOpen={isEditOpen}
        onOpenChangeAction={setIsEditOpen}
        selectedStudent={selectedStudent}
      />

      {exportConfig.isOpen && (
        <ExportModal
          isOpen={exportConfig.isOpen}
          columns={exportConfig.columns}
          onExport={handleExportWithConfig}
          onCloseAction={() =>
            setExportConfig((prev) => ({ ...prev, isOpen: false }))
          }
        />
      )}
    </>
  );
};

export default StudentTableStatus;