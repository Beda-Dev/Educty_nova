"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

// Import des composants UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CashRegisterSession } from "@/lib/interface";
import { useSchoolStore } from "@/store";

const formatCurrency = (amount: string | number) => {
  // On accepte string ou number pour compatibilité
  const numericAmount =
    typeof amount === "string" ? parseInt(amount, 10) : amount;
  if (isNaN(numericAmount)) return "";
  // Format avec espaces pour les milliers, pas de décimales
  return numericAmount.toLocaleString("fr-FR");
};

const formatSessionDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: fr });
};

export default function CashRegisterSessionsPage({
  data,
}: {
  data: CashRegisterSession[];
}) {
  const { userOnline, users, cashRegisters, settings } = useSchoolStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<CashRegisterSession[]>(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [registerFilter, setRegisterFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrage des sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch = searchTerm
        ? session.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.cash_register?.cash_register_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      const matchesStatus =
        statusFilter && statusFilter !== "all"
          ? session.status === statusFilter
          : true;

      const matchesUser =
        userFilter && userFilter !== "all"
          ? session.user_id === Number(userFilter)
          : true;

      const matchesRegister =
        registerFilter && registerFilter !== "all"
          ? session.cash_register_id === Number(registerFilter)
          : true;

      const openingDate = new Date(session.opening_date);
      const matchesDateFrom = dateRange.from
        ? openingDate >= dateRange.from
        : true;
      const matchesDateTo = dateRange.to
        ? openingDate <= new Date(dateRange.to.setHours(23, 59, 59, 999))
        : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesUser &&
        matchesRegister &&
        matchesDateFrom &&
        matchesDateTo
      );
    })
        .sort(
      (a, b) =>
        new Date(b.opening_date).getTime() - new Date(a.opening_date).getTime()
    );
  }, [
    sessions,
    searchTerm,
    statusFilter,
    userFilter,
    registerFilter,
    dateRange,
  ]);

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter(null);
    setUserFilter(null);
    setRegisterFilter(null);
    setDateRange({ from: undefined, to: undefined });
    setCurrentPage(1);
  }, []);

  const handleAddSession = () => {
    const hasOpenSession = sessions.some(
      (session) =>
        session.user_id === userOnline?.id && session.status === "open"
    );
    hasOpenSession
      ? setShowModal(true)
      : router.push("/caisse_comptabilite/open-session");
  };

  const navigateToSessionDetails = (sessionId: number) => {
    router.push(`/caisse_comptabilite/session_caisse/${sessionId}`);
  };

  const navigateToCloseSession = (sessionId: number) => {
    router.push(`/caisse_comptabilite/close-session/${sessionId}`);
  };

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-skyblue" />
              <div>
                <CardTitle className="text-2xl font-semibold">
                  Sessions de caisse
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gestion et consultation des sessions de caisse
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-sm">
              {filteredSessions.length} session
              {filteredSessions.length !== 1 ? "s" : ""}
            </Badge>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {/* Barre d'actions et badge */}
            <div className="flex justify-end items-center mb-4">
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="h-9 px-3"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="ml-2">Réinitialiser</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Réinitialiser tous les filtres
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    onClick={handleAddSession}
                    size="sm"
                    className="h-9 px-3"
                    color="indigodye"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">Nouvelle session</span>
                  </Button>
                </TooltipProvider>
              </div>
            </div>

            {/* Filtres avec labels */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Recherche */}
              <div className="md:col-span-2">
                <Label
                  htmlFor="search"
                  className="mb-2 block text-sm font-medium"
                >
                  Recherche
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Caisse ou utilisateur..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Filtre Statut */}
              <div>
                <Label
                  htmlFor="status-filter"
                  className="mb-2 block text-sm font-medium"
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
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="open">Ouvert</SelectItem>
                    <SelectItem value="closed">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre Utilisateur */}
              <div>
                <Label
                  htmlFor="user-filter"
                  className="mb-2 block text-sm font-medium"
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
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous utilisateurs</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre Caisse */}
              <div>
                <Label
                  htmlFor="register-filter"
                  className="mb-2 block text-sm font-medium"
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
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes caisses</SelectItem>
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
            </div>

            {/* Tableau */}
            <div className="r">
              <Table>
                <TableHeader className="">
                  <TableRow>
                    <TableHead className="w-[120px]">Caisse</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Ouverture</TableHead>
                    <TableHead>Fermeture</TableHead>
                    <TableHead className="text-right">
                      Montant initial
                    </TableHead>
                    <TableHead className="text-right">Montant final</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Aucune session trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {paginatedSessions.map((session) => (
                        <motion.tr
                          key={session.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t-muted-foreground/20"
                        >
                          <TableCell className="font-medium">
                            Caisse {session.cash_register?.cash_register_number}
                          </TableCell>
                          <TableCell>{session.user?.name}</TableCell>
                          <TableCell>
                            {formatSessionDate(session.opening_date)}
                          </TableCell>
                          <TableCell>
                            {session.status === "open"
                              ? "—"
                              : formatSessionDate(session.closing_date)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(session.opening_amount)}{" "}
                            {settings?.[0]?.currency || "FCFA"}
                          </TableCell>
                          <TableCell className="text-right">
                            {session.status === "open" ? (
                              "—"
                            ) : (
                              <>
                                {formatCurrency(session.closing_amount)}{" "}
                                {settings?.[0]?.currency || "FCFA"}
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                color={
                                  session.status === "open"
                                    ? "success"
                                    : "secondary"
                                }
                                className={cn(
                                  "capitalize",
                                  session.status === "open" && "bg-success"
                                )}
                              >
                                {session.status === "open"
                                  ? "Ouverte"
                                  : "Fermée"}
                              </Badge>
                              {session.status === "open" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        color="success"
                                        size="icon"
                                        variant="outline"
                                        onClick={() =>
                                          navigateToSessionDetails(session.id)
                                        }
                                        className="ml-1"
                                      >
                                        <CalendarIcon className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Accéder à la caisse
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
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
                                      className="text-red-600 focus:text-red-600"
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
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredSessions.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages} •{" "}
                  {filteredSessions.length} résultats
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={
                              currentPage === pageNum ? "outline" : "ghost"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">
                      Session déjà ouverte
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vous avez déjà une session active. Veuillez la clôturer
                      avant d'en ouvrir une nouvelle.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      color="destructive"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      Fermer
                    </Button>
                    <Button
                      onClick={() => {
                        const openSession = sessions.find(
                          (session) =>
                            session.user_id === userOnline?.id &&
                            session.status === "open"
                        );
                        if (openSession) {
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
  );
}
