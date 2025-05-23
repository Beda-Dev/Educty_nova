"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CashRegisterSession, UserSingle, CashRegister } from "@/lib/interface";
import { useSchoolStore } from "@/store";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ModalWithAnimation } from "./modal";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Memoized currency formatter
const formatCurrency = (amount: string) => {
  const numericAmount = Number.parseInt(amount) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(numericAmount)
    .replace("CFA", "FCFA");
};

// Memoized date formatter
const formatSessionDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
};

export default function CashRegisterSessionsPage({
  data,
}: {
  data: CashRegisterSession[];
}) {
  const { userOnline, users, cashRegisters } = useSchoolStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<CashRegisterSession[]>(data);
  const [selectedSession, setSelectedSession] =
    useState<CashRegisterSession | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [registerFilter, setRegisterFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Search term filter
      if (
        searchTerm &&
        !(
          session.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.cash_register?.cash_register_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }

      // Status filter
      if (
        statusFilter &&
        statusFilter !== "all" &&
        session.status !== statusFilter
      ) {
        return false;
      }

      // User filter
      if (
        userFilter &&
        userFilter !== "all" &&
        session.user_id !== Number(userFilter)
      ) {
        return false;
      }

      // Register filter
      if (
        registerFilter &&
        registerFilter !== "all" &&
        session.cash_register_id !== Number(registerFilter)
      ) {
        return false;
      }

      // Date range filter
      const openingDate = new Date(session.opening_date);
      if (dateRange.from && openingDate < dateRange.from) {
        return false;
      }
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (openingDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [
    sessions,
    searchTerm,
    statusFilter,
    userFilter,
    registerFilter,
    dateRange,
  ]);

  // Pagination calculations
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredSessions.slice(start, end);
  }, [filteredSessions, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter(null);
    setUserFilter(null);
    setRegisterFilter(null);
    setDateRange({ from: undefined, to: undefined });
    setCurrentPage(1);
  }, []);

  // Handle page navigation
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  // Handle session close navigation
  const navigateToCloseSession = useCallback(
    (sessionId: number) => {
      router.push(`/caisse_comptabilite/close-session/${sessionId}`);
    },
    [router]
  );

  // Handle session details navigation
  const navigateToSessionDetails = useCallback(
    (sessionId: number) => {
      router.push(`/cash-register/sessions/${sessionId}`);
    },
    [router]
  );

  // verification de la session ouverte
  const handleAddSession = () => {
    const hasOpenSession = sessions.some(
      (session) =>
        session.user_id === userOnline?.id && session.status === "open"
    );

    if (hasOpenSession) {
      setShowModal(true);
    } else {
      router.push("/caisse_comptabilite/open-session");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>
              Sessions de caisse
              <Badge className="ml-2" color="secondary">
                {sessions.length}
              </Badge>
            </CardTitle>

            <CardDescription>
              Gérez et consultez les sessions de caisse
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="flex gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Réinitialiser
            </Button>
            <Button
              onClick={handleAddSession}
              color="indigodye"
              size="sm"
              className="flex gap-1"
            >
              <Plus className="h-4 w-4" />
              Nouvelle session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 mt-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Status filter */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="statusFilter"
                    className="mb-1 text-sm font-medium"
                  >
                    Statut
                  </Label>

                  <Select
                    value={statusFilter || ""}
                    onValueChange={(value) => {
                      setStatusFilter(value === "all" ? null : value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="open">Ouvert</SelectItem>
                      <SelectItem value="closed">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User filter */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="userFilter"
                    className="mb-1 text-sm font-medium"
                  >
                    Utilisateur
                  </Label>
                  <Select
                    value={userFilter || ""}
                    onValueChange={(value) => {
                      setUserFilter(value === "all" ? null : value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cash register filter */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="registerFilter"
                    className="mb-1 text-sm font-medium"
                  >
                    Caisse
                  </Label>
                  <Select
                    value={registerFilter || ""}
                    onValueChange={(value) => {
                      setRegisterFilter(value === "all" ? null : value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Caisse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les caisses</SelectItem>
                      {cashRegisters.map((register) => (
                        <SelectItem
                          key={register.id}
                          value={register.id.toString()}
                        >
                          Caisse {register.cash_register_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date range filter */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="dateRange"
                    className="mb-1 text-sm font-medium"
                  >
                    Période
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !dateRange.from &&
                            !dateRange.to &&
                            "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          "Sélectionner une période"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange({
                            from: range?.from,
                            to: range?.to,
                          });
                          setCurrentPage(1);
                        }}
                        numberOfMonths={2}
                        locale={fr}
                      />
                      <div className="flex items-center justify-between p-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDateRange({ from: undefined, to: undefined });
                            setCurrentPage(1);
                          }}
                        >
                          Réinitialiser
                        </Button>
                        <Button size="sm" onClick={() => document.body.click()}>
                          Appliquer
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Sessions table */}
            <div className="rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caisse</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Ouverture</TableHead>
                    <TableHead>Fermeture</TableHead>
                    <TableHead>Montant initial</TableHead>
                    <TableHead>Montant final</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSessions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Aucune session trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          Caisse {session.cash_register?.cash_register_number}
                        </TableCell>
                        <TableCell>{session.user?.name}</TableCell>
                        <TableCell>
                          {formatSessionDate(session.opening_date)}
                        </TableCell>
                        <TableCell>
                          {formatSessionDate(session.closing_date)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(session.opening_amount)}
                        </TableCell>
                        <TableCell>
                          {session.closing_amount
                            ? formatCurrency(session.closing_amount)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            color={
                              session.status === "open"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {session.status === "open" ? "Ouvert" : "Fermé"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                color="tyrian"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigateToSessionDetails(session.id)
                                }
                              >
                                Voir les détails
                              </DropdownMenuItem>
                              {session.status === "open" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigateToCloseSession(session.id)
                                    }
                                  >
                                    Fermer la session
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredSessions.length > ITEMS_PER_PAGE && (
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
                          currentPage === totalPages
                            ? undefined
                            : handleNextPage
                        }
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : 0}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50 text-muted-foreground"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <AnimatePresence>
              {showModal && (
                <Dialog
                  open={showModal}
                  onOpenChange={() => setShowModal(false)}
                >
                  <DialogContent>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-center">
                        <h2 className="text-lg font-semibold">
                          Session déjà ouverte
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                          Vous avez déjà une session ouverte. Veuillez la
                          clôturer avant d'en créer une nouvelle.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                          <Button
                            color="destructive"
                            variant="outline"
                            onClick={() => setShowModal(false)}
                          >
                            Fermer
                          </Button>
                          <Button
                            onClick={() => {
                              // Trouver la session ouverte de l'utilisateur
                              const openSession = sessions.find(
                                (session) =>
                                  session.user_id === userOnline?.id &&
                                  session.status === "open"
                              );

                              if (openSession) {
                                // Rediriger vers la page de la session
                                router.push(
                                  `/caisse_comptabilite/session_caisse/${openSession.id}`
                                );
                              }
                              setShowModal(false);
                            }}
                          >
                            Voir la session
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </DialogContent>
                </Dialog>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
