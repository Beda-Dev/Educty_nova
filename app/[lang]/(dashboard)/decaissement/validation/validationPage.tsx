"use client";

import { useState, Fragment } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ValidationExpense } from "@/lib/interface";
import { generationNumero } from "@/lib/fonction";

export default function ExpenseValidationsPage() {
  const { validationExpenses, userOnline, setValidationExpenses } =
    useSchoolStore();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedValidator, setSelectedValidator] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);

  // Fonction de tri
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filtrer et trier les validations
  const filteredValidations = validationExpenses
    .filter((validation) => {
      const matchesSearch =
        validation.demand?.applicant?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        validation.user?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus
        ? validation.validation_status === selectedStatus
        : true;
      const matchesValidator = selectedValidator
        ? validation.user?.name === selectedValidator
        : true;
      const matchesDate = selectedDate
        ? format(new Date(validation.validation_date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
        : true;

      return matchesSearch && matchesStatus && matchesValidator && matchesDate;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const key = sortConfig.key as keyof ValidationExpense;
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredValidations.length / ITEMS_PER_PAGE);
  const paginatedValidations = filteredValidations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
  };

  // Formater le montant
  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat("fr-FR").format(parseFloat(amount)) + " FCFA";
  };

  // Obtenir les infos du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "validée":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: "bg-green-100 text-green-800",
          variant: "success" as const,
        };
      case "refusée":
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800",
          variant: "destructive" as const,
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800",
          variant: "warning" as const,
        };
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedValidator("");
    setSelectedDate(null);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-skyblue" />
            <CardTitle>Validations des Dépenses</CardTitle>
          </div>
          <Badge variant="outline">
            {filteredValidations.length}{" "}
            {filteredValidations.length > 1 ? "validations" : "validation"}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <Input
              placeholder="Rechercher..."
              className="w-[180px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Select
              value={selectedValidator}
              onValueChange={setSelectedValidator}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="demandeurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">demandeurs</SelectItem>
                {Array.from(
                  new Set(
                    validationExpenses
                      .map((v) => v.user?.name)
                      .filter((n): n is string => !!n)
                  )
                ).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Statuts</SelectItem>
                <SelectItem value="en attente">En attente</SelectItem>
                <SelectItem value="validée">Validée</SelectItem>
                <SelectItem value="refusée">Refusée</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              className="w-[150px]"
              value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setSelectedDate(date);
              }}
            />

            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-1" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => requestSort("id")}
                    className="flex items-center gap-1"
                  >
                    Numero
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Dépense</TableHead>
                <TableHead>
                  <button
                    onClick={() => requestSort("amount")}
                    className="flex items-center gap-1"
                  >
                    Montant
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Demandeur</TableHead>
                <TableHead>
                  <button
                    onClick={() => requestSort("validation_date")}
                    className="flex items-center gap-1"
                  >
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredValidations.length > 0 ? (
                <AnimatePresence>
                  {paginatedValidations.map((validation) => {
                    const statusInfo = getStatusInfo(
                      validation.validation_status
                    );
                    return (
                      <Fragment key={validation.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-muted-foreground/20"
                        >
                          <TableCell className="text-xs">
                            {generationNumero(
                              validation.id,
                              validation?.demand?.created_at ?? "",
                              "encaissement"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {validation.demand?.applicant?.name}
                            </div>
                            {validation.comment && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {validation.comment}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {validation.demand?.amount
                              ? formatAmount(validation.demand.amount.toString())
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {validation.user?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {validation.user?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(validation.validation_date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              color={statusInfo.variant}
                              className="capitalize"
                            >
                              {statusInfo.icon}
                              <span className="ml-1.5">
                                {validation.validation_status}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    color="tyrian"
                                    size="sm"
                                    onClick={() =>
                                      router.push(
                                        `/decaissement/validation/${validation.id}`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {validation.validation_status ===
                                    "en attente"
                                      ? "Valider cette dépense"
                                      : "Voir les détails"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </motion.tr>
                      </Fragment>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground h-24"
                  >
                    {searchTerm ||
                    selectedStatus ||
                    selectedValidator ||
                    selectedDate
                      ? "Aucune validation ne correspond à votre recherche."
                      : "Aucune validation enregistrée."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredValidations.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={
                        currentPage === 1 ? undefined : handlePreviousPage
                      }
                      aria-disabled={currentPage === 1}
                      tabIndex={currentPage === 1 ? -1 : 0}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <Button
                        variant={currentPage === i + 1 ? "outline" : "ghost"}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={
                        currentPage === totalPages ? undefined : handleNextPage
                      }
                      aria-disabled={currentPage === totalPages}
                      tabIndex={currentPage === totalPages ? -1 : 0}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
