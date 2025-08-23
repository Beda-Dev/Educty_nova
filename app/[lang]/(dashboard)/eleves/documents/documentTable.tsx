"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw, Download } from "lucide-react";
import { Document , StudentOnly } from "@/lib/interface";
import {toast} from 'react-hot-toast'

const DocumentTable = ({
  documents,
}: {
  documents: Document[];
}) => {
  const { classes, assignmentTypes , documentTypes } = useSchoolStore();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<StudentOnly | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fonction pour télécharger un document
  const handleDownload = async (doc: Document) => {
    try {
      if (!doc.path) {
        throw new Error("Aucun chemin de document disponible");
      }
  
      // Construire l'URL complète si nécessaire
      const fullPath = doc.path.startsWith('http') 
        ? doc.path 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://educty.digifaz.com'}/${doc.path.replace(/^\//, '')}`;


  
      // Créer un nom de fichier par défaut si label est vide
      const fileName = doc.label || 
                      `${doc.document_type.name.replace(/\s+/g, '_')}_${doc.student.registration_number}.${doc.path.split('.').pop()}`;
  
      // Option 1: Téléchargement direct (si le serveur autorise CORS)
      const link = document.createElement('a');
      link.href = fullPath;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
  
      // Option 2: Téléchargement via API (si nécessaire pour l'authentification)
      /*
      const response = await fetch(fullPath, {
        headers: {
          'Authorization': `Bearer ${yourAuthToken}` // Si nécessaire
        }
      });
      
      if (!response.ok) throw new Error('Échec du téléchargement');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      */
  
      // Notification de succès
      toast(`Téléchargement réussi Le document ${fileName}" a été téléchargé`);
  
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast(`Erreur, ${error instanceof Error ? `${error.message}` : `Une erreur est survenue lors du téléchargement`} `);
    }
  };

  // Fonction de filtrage personnalisée pour les données imbriquées
  const nestedFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    const value = getNestedValue(row.original, columnId);
    if (!value) return false;
    return String(value)
      .toLowerCase()
      .includes(String(filterValue).toLowerCase());
  };

  // Helper pour accéder aux valeurs imbriquées
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part] ?? "", obj);
  };

  const columns: ColumnDef<Document>[] = [
    {
        id: "document_type.name",
        accessorFn: (row) => row.document_type.name,
        header: "document",
        filterFn: nestedFilterFn,

    },
    {
        id: "label",
        accessorKey: "label",
        header: "Libellé",
        cell: ({ row }) => {
            const label = row.original.label;
            return (
              <div className="flex items-center gap-3">
                <span className="truncate">
                <Badge>{label}</Badge>
                </span>
              </div>
            );
          },
    },
    {
      id: "student.name",
      accessorFn: (row) => row.student.name,
      header: "Élève",
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div className="flex items-center gap-3">
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
    // {
    //   id: "student.birth_date",
    //   accessorFn: (row) => row.student.birth_date,
    //   header: "Date de naissance",
    //   filterFn: nestedFilterFn,
    // },
    {
      id: "student.sexe",
      accessorFn: (row) => row.student.sexe,
      header: "Sexe",
      filterFn: nestedFilterFn,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div className="flex gap-3 justify-end">
            {/* <Button
              size="icon"
              variant="outline"
              
              className="h-7 w-7"
              onClick={() => openEditModal(document.student)}
            >
              <Icon icon="heroicons:pencil" className="h-4 w-4" />
            </Button> */}
            <Button
              size="icon"
              variant="outline"
              color="success"
              className="h-7 w-7"
              onClick={() => handleDownload(document)}
              disabled={!document.path}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: documents,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 50,
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

  // Gestion des filtres
  const [statusFilter, setStatusFilter] = useState("");
  const [sexeFilter, setSexeFilter] = useState("");
  const [typeDocumentFilter, setTypeDocumentFilter] = useState("");

  useEffect(() => {
    const newFilters: ColumnFiltersState = [];

    if (statusFilter) {
      newFilters.push({
        id: "student.status",
        value: statusFilter,
      });
    }

    if (sexeFilter) {
      newFilters.push({
        id: "student.sexe",
        value: sexeFilter,
      });
    }

    if (typeDocumentFilter) {
      newFilters.push({
        id: "document_type.name",
        value: typeDocumentFilter,
      });
    }

    setColumnFilters(newFilters);
  }, [statusFilter, sexeFilter, typeDocumentFilter]);

  const openEditModal = (student: StudentOnly) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  // useEffect(() => {
  //   console.log("Filtres appliqués :", table.getState().columnFilters);
  // }, [table.getState().columnFilters]);

  return (
    <>
      <div className={`grid gap-4 mb-4 ${table?.getPageCount() > 10 ? `grid-cols-6`:`grid-cols-5`}`}>
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
        {/* <div className="">
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
        </div> */}
        {/* <div className="">
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
        </div> */}
        <div className="">
          <label className="block text-sm font-medium text-gray-700">
            Type de document :
          </label>
          <Select value={typeDocumentFilter} onValueChange={setTypeDocumentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {Array.from(new Set(documents.map(doc => doc.document_type.name))).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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
              setTypeDocumentFilter("");
            }}
          >
            <RefreshCw color="blue" className="h-4 w-4" />
          </Button>
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

      {/* {selectedStudent && (
        <EditStudentModal
          isOpen={isEditOpen}
          onOpenChangeAction={setIsEditOpen}
          selectedStudent={selectedStudent}
        />
      )} */}
    </>
  );
};

export default DocumentTable;