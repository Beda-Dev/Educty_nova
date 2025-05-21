"use client";

import { useState } from "react";
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

import DatePickerForm from "./date-picker";
import { columns, ColumnProps } from "./data";
import { AcademicYear } from "@/lib/interface";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import EditModal from "./edit-modal";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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

interface Props {
  data: AcademicYear[];
}

const AcademicYearPage = ({ data }: Props) => {
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const { userOnline } = useSchoolStore();
  const [filtered, setFiltered] = useState(data);

  const permissionRequisCreer = ["creer annee_Academique"];
  const permissionRequisSupprimer = ["supprimer annee_Academique"];
  const permissionRequisModifier = ["modifier annee_Academique"];
  const permissionRequisVoir = ["voir annee_Academique"];

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
  const hasAdminAccessSupprimer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisSupprimer
  );

  const handleUpdate = () => {
    setIsModalOpen(false);
  };

  const filteredData = filtered;

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (hasAdminAccessVoir === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Dialog open={isModalOpenAdd} onOpenChange={setIsModalOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une année académique</DialogTitle>
          </DialogHeader>
          <DatePickerForm onSuccess={() => setIsModalOpenAdd(false)} />
        </DialogContent>
      </Dialog>

      <div className="">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Année académique</CardTitle>
            <Badge variant="outline">
              {data.length}{" "}
              {data.length > 1 ? "année académique" : "années académiques"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              {/* Filtres à gauche */}
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                <Input
                  placeholder="Rechercher..."
                  className="w-full sm:w-64"
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setCurrentPage(1);
                    setFiltered(
                      data.filter((item) =>
                        item.label.toLowerCase().includes(value)
                      )
                    );
                  }}
                />
                <Select
                  onValueChange={(value) => {
                    setCurrentPage(1);
                    setFiltered(
                      data.filter((item) =>
                        value === "all"
                          ? true
                          : String(item.isCurrent) === value
                      )
                    );
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="1">Actif</SelectItem>
                    <SelectItem value="0">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton à droite */}
              {hasAdminAccessCreer && (
                <Button
                  color="indigodye"
                  onClick={() => setIsModalOpenAdd(true)}
                >
                  Créer une année académique
                </Button>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column: ColumnProps) => (
                    <TableHead key={`simple-table-${column.key}`}>
                      {column.label}
                    </TableHead>
                  ))}
                  {hasAdminAccessModifier ? (
                    <TableHead>Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item: AcademicYear) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>
                      {" "}
                      {new Date(item.start_date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {" "}
                      {new Date(item.end_date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {item.isCurrent === 1 ? (
                        <Badge color="success">Actif</Badge>
                      ) : (
                        <Badge color="destructive">Inactif</Badge>
                      )}
                    </TableCell>

                    {hasAdminAccessModifier ? (
                      <TableCell>
                        <Button
                          color="tyrian"
                          size="icon"
                          onClick={() => {
                            setSelectedYear(item);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm px-2">
                      Page {currentPage} sur {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedYear && (
        <EditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          academicYear={selectedYear}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default AcademicYearPage;
