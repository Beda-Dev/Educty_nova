"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react"

// Import des composants UI
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { CashRegisterSession } from "@/lib/interface"
import { useSchoolStore } from "@/store"
import { universalExportToExcel } from "@/lib/utils"
import { FULL_ACCESS_ROLES_LOWERCASE } from "../RoleFullAcess"

const formatCurrency = (amount: string | number) => {
  const numericAmount = typeof amount === "string" ? Number.parseInt(amount, 10) : amount
  if (isNaN(numericAmount)) return ""
  return numericAmount.toLocaleString("fr-FR")
}

const formatSessionDate = (dateString: string | null) => {
  if (!dateString) return "—"
  return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: fr })
}

// Ajoutez cette fonction utilitaire avant le composant principal
function splitDateTime(dateTimeStr: string | null): { date: string, time: string } {
  if (!dateTimeStr) return { date: "—", time: "—" }
  const [date, time] = dateTimeStr.split(" ")
  return {
    date: date || "—",
    time: time ? time.slice(0, 5) : "—", // HH:mm
  }
}

export default function CashRegisterSessionsPage({
  data,
}: {
  data: CashRegisterSession[]
}) {
  const { userOnline, users, cashRegisters, settings, transactions } = useSchoolStore()
  const router = useRouter()
  const [sessions, setSessions] = useState<CashRegisterSession[]>(data)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [registerFilter, setRegisterFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Ajout d'un état pour le modale d'heure d'ouverture
  const [showLoginTimeModal, setShowLoginTimeModal] = useState(false)

  // Vérifier si l'utilisateur a les permissions d'export
  const hasExportPermission = useMemo(() => {
    if (!userOnline || !userOnline.roles) return false
    return userOnline.roles.some(role => 
      FULL_ACCESS_ROLES_LOWERCASE.includes(role.name.toLowerCase())
    )
  }, [userOnline])

  // Calculer l'encaissement pour chaque session
  const getSessionEncaissement = useCallback((sessionId: number) => {
    const sessionTransactions = transactions.filter(
      transaction => 
        transaction.cash_register_session_id === sessionId && 
        transaction.transaction_type === "encaissement"
    )
    
    return sessionTransactions.reduce((total, transaction) => {
      return total + Number(transaction.total_amount)
    }, 0)
  }, [transactions])

  // Map pour retrouver la dernière session fermée par utilisateur
  const lastClosedSessionByUser = useMemo(() => {
    const map = new Map<number, CashRegisterSession>()
    ;[...sessions]
      .filter((s) => s.status === "closed")
      .sort((a, b) => new Date(b.closing_date).getTime() - new Date(a.closing_date).getTime())
      .forEach((session) => {
        if (!map.has(session.user_id)) {
          map.set(session.user_id, session)
        }
      })
    return map
  }, [sessions])

  // Fonction pour analyser les incohérences d'ouverture
  const getOpeningAmountStatus = (session: CashRegisterSession) => {
    const lastClosed = lastClosedSessionByUser.get(session.user_id)
    if (!lastClosed) return null

    // Vérifier que la session ouverte est postérieure à la session fermée
    if (new Date(session.opening_date) > new Date(lastClosed.closing_date)) {
      const openingAmount = Number(session.opening_amount)
      const lastClosingAmount = Number(lastClosed.closing_amount)

      if (openingAmount > lastClosingAmount) {
        return {
          type: "higher",
          difference: openingAmount - lastClosingAmount,
          lastSession: lastClosed,
        }
      } else if (openingAmount < lastClosingAmount) {
        return {
          type: "lower",
          difference: lastClosingAmount - openingAmount,
          lastSession: lastClosed,
        }
      } else {
        return {
          type: "equal",
          difference: 0,
          lastSession: lastClosed,
        }
      }
    }
    return null
  }

  // Fonction pour analyser les incohérences de fermeture
  const getClosingAmountStatus = (session: CashRegisterSession) => {
    if (session.status !== "closed") return null

    const nextOpen = sessions
      .filter(
        (s) =>
          s.user_id === session.user_id &&
          s.status === "open" &&
          new Date(s.opening_date) > new Date(session.closing_date),
      )
      .sort((a, b) => new Date(a.opening_date).getTime() - new Date(b.opening_date).getTime())[0]

    if (!nextOpen) return null

    const closingAmount = Number(session.closing_amount)
    const nextOpeningAmount = Number(nextOpen.opening_amount)

    if (closingAmount > nextOpeningAmount) {
      return {
        type: "higher",
        difference: closingAmount - nextOpeningAmount,
        nextSession: nextOpen,
      }
    } else if (closingAmount < nextOpeningAmount) {
      return {
        type: "lower",
        difference: nextOpeningAmount - closingAmount,
        nextSession: nextOpen,
      }
    } else {
      return {
        type: "equal",
        difference: 0,
        nextSession: nextOpen,
      }
    }
  }

  // Composant pour l'indicateur d'incohérence
  const AmountInconsistencyIndicator = ({
    status,
    type,
  }: {
    status: any
    type: "opening" | "closing"
  }) => {
    if (!status) return null

    const getIcon = () => {
      switch (status.type) {
        case "higher":
          return <TrendingUp className="h-4 w-4" />
        case "lower":
          return <TrendingDown className="h-4 w-4" />
        case "equal":
          return <CheckCircle className="h-4 w-4" />
        default:
          return null
      }
    }

    const getColor = () => {
      switch (status.type) {
        case "higher":
          return "text-green-600"
        case "lower":
          return "text-red-600"
        case "equal":
          return "text-green-600"
        default:
          return ""
      }
    }

    const getTooltipText = () => {
      const typeText = type === "opening" ? "d'ouverture" : "de fermeture"
      const comparisonText = type === "opening" ? "fermeture précédente" : "ouverture suivante"

      switch (status.type) {
        case "higher":
          return `Montant ${typeText} supérieur de ${formatCurrency(status.difference)} ${settings?.[0]?.currency || "FCFA"} par rapport à la ${comparisonText}`
        case "lower":
          return `Montant ${typeText} inférieur de ${formatCurrency(status.difference)} ${settings?.[0]?.currency || "FCFA"} par rapport à la ${comparisonText}`
        case "equal":
          return `Montant ${typeText} cohérent avec la ${comparisonText}`
        default:
          return ""
      }
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("inline-flex items-center ml-2", getColor())}>{getIcon()}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Fonction d'export
  const handleExport = () => {
    if (!hasExportPermission) return

    const exportData = filteredSessions.map((session) => {
      const opening = splitDateTime(session.opening_date)
      const closing = session.status === "open" ? { date: "—", time: "—" } : splitDateTime(session.closing_date)
      return {
        "Caisse": `Caisse ${session.cash_register?.cash_register_number}`,
        "Utilisateur": session.user?.name,
        "Date d'ouverture": opening.date,
        "Heure d'ouverture": opening.time,
        "Date de fermeture": closing.date,
        "Heure de fermeture": closing.time,
        "Encaissement": `${formatCurrency(getSessionEncaissement(session.id))}`,
        "Statut": session.status === "open" ? "Ouverte" : "Fermée",
      }
    })

    universalExportToExcel({
      source: {
        type: "array",
        data: exportData,
      },
      fileName: `sessions_caisse_${format(new Date(), "yyyy-MM-dd")}.xlsx`,
    })
  }

  // Filtrage des sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const matchesSearch = searchTerm
          ? session.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.cash_register?.cash_register_number.toLowerCase().includes(searchTerm.toLowerCase())
          : true

        const matchesStatus = statusFilter && statusFilter !== "all" ? session.status === statusFilter : true

        const matchesUser = userFilter && userFilter !== "all" ? session.user_id === Number(userFilter) : true

        const matchesRegister =
          registerFilter && registerFilter !== "all" ? session.cash_register_id === Number(registerFilter) : true

        const openingDate = new Date(session.opening_date)
        const matchesDateFrom = dateRange.from ? openingDate >= dateRange.from : true
        const matchesDateTo = dateRange.to ? openingDate <= new Date(dateRange.to.setHours(23, 59, 59, 999)) : true

        return matchesSearch && matchesStatus && matchesUser && matchesRegister && matchesDateFrom && matchesDateTo
      })
      .sort((a, b) => new Date(b.opening_date).getTime() - new Date(a.opening_date).getTime())
  }, [sessions, searchTerm, statusFilter, userFilter, registerFilter, dateRange])

  // Pagination
  const ITEMS_PER_PAGE = 20
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE)
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSessions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSessions, currentPage])

  // Statistiques des incohérences
  const inconsistencyStats = useMemo(() => {
    let openingInconsistencies = 0
    let closingInconsistencies = 0

    filteredSessions.forEach((session) => {
      const openingStatus = getOpeningAmountStatus(session)
      const closingStatus = getClosingAmountStatus(session)

      if (openingStatus && openingStatus.type !== "equal") {
        openingInconsistencies++
      }
      if (closingStatus && closingStatus.type !== "equal") {
        closingInconsistencies++
      }
    })

    return { openingInconsistencies, closingInconsistencies }
  }, [filteredSessions])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setStatusFilter(null)
    setUserFilter(null)
    setRegisterFilter(null)
    setDateRange({ from: undefined, to: undefined })
    setCurrentPage(1)
  }, [])

  const handleAddSession = () => {
    // Vérification de l'heure d'ouverture
    const loginTime = settings?.[0]?.login_time ?? null
    if (loginTime && isBeforeLoginTime(loginTime)) {
      setShowLoginTimeModal(true)
      return
    }
    const hasOpenSession = sessions.some((session) => session.user_id === userOnline?.id && session.status === "open")
    hasOpenSession ? setShowModal(true) : router.push("/caisse_comptabilite/open-session")
  }

  const navigateToSessionDetails = (sessionId: number) => {
    router.push(`/caisse_comptabilite/session_caisse/${sessionId}`)
  }

  const navigateToCloseSession = (sessionId: number) => {
    router.push(`/caisse_comptabilite/close-session/${sessionId}`)
  }

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  // Fonction utilitaire pour comparer l'heure actuelle à l'heure d'ouverture
  function isBeforeLoginTime(loginTime: string | null): boolean {
    if (!loginTime) return false
    const [loginHour, loginMinute] = loginTime.split(":").map(Number)
    const now = new Date()
    const nowHour = now.getHours()
    const nowMinute = now.getMinutes()
    if (nowHour < loginHour) return true
    if (nowHour === loginHour && nowMinute < loginMinute) return true
    return false
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-skyblue" />
              <div>
                <CardTitle className="text-2xl font-semibold">Sessions de caisse</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Gestion et consultation des sessions de caisse</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {filteredSessions.length} session
                {filteredSessions.length !== 1 ? "s" : ""}
              </Badge>

              {/* Indicateurs d'incohérences */}
              {(inconsistencyStats.openingInconsistencies > 0 || inconsistencyStats.closingInconsistencies > 0) && (
                <div className="flex items-center gap-2">
                  {inconsistencyStats.openingInconsistencies > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge color="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {inconsistencyStats.openingInconsistencies}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{inconsistencyStats.openingInconsistencies} incohérence(s) d'ouverture</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {inconsistencyStats.closingInconsistencies > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600">
                            <XCircle className="h-3 w-3" />
                            {inconsistencyStats.closingInconsistencies}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{inconsistencyStats.closingInconsistencies} incohérence(s) de fermeture</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {/* Barre d'actions */}
            <div className="flex justify-end items-center mb-4">
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={resetFilters} className="h-9 px-3 bg-transparent">
                        <RefreshCw className="h-4 w-4" />
                        <span className="ml-2">Réinitialiser</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Réinitialiser tous les filtres</TooltipContent>
                  </Tooltip>

                  {hasExportPermission && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button color="success" size="sm" onClick={handleExport} className="h-9 px-3">
                          <Download className="h-4 w-4" />
                          <span className="ml-2">Exporter</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Exporter vers Excel</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Ajout du Badge pour l'heure d'ouverture */}
                  {settings?.[0]?.login_time && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Heure d'ouverture : {settings[0].login_time}
                    </Badge>
                  )}

                  <Button onClick={handleAddSession} size="sm" className="h-9 px-3" color="indigodye">
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">Nouvelle session</span>
                  </Button>
                </TooltipProvider>
              </div>
            </div>

            {/* Filtres */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Recherche */}
              <div className="md:col-span-2">
                <Label htmlFor="search" className="mb-2 block text-sm font-medium">
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
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
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
                <Label htmlFor="status-filter" className="mb-2 block text-sm font-medium">
                  Statut
                </Label>
                <Select
                  value={statusFilter || ""}
                  onValueChange={(value) => {
                    setStatusFilter(value === "all" ? null : value)
                    setCurrentPage(1)
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
                <Label htmlFor="user-filter" className="mb-2 block text-sm font-medium">
                  Utilisateur
                </Label>
                <Select
                  value={userFilter || ""}
                  onValueChange={(value) => {
                    setUserFilter(value === "all" ? null : value)
                    setCurrentPage(1)
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
                <Label htmlFor="register-filter" className="mb-2 block text-sm font-medium">
                  Caisse
                </Label>
                <Select
                  value={registerFilter || ""}
                  onValueChange={(value) => {
                    setRegisterFilter(value === "all" ? null : value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes caisses</SelectItem>
                    {cashRegisters.map((register) => (
                      <SelectItem key={register.id} value={register.id.toString()}>
                        Caisse {register.cash_register_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tableau */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Caisse</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Ouverture</TableHead>
                    <TableHead>Fermeture</TableHead>
                    <TableHead>Encaissement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Aucune session trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {paginatedSessions.map((session) => {
                        const openingStatus = getOpeningAmountStatus(session)
                        const closingStatus = getClosingAmountStatus(session)
                        const encaissement = getSessionEncaissement(session.id)

                        return (
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
                            <TableCell className="text-xs">{formatSessionDate(session.opening_date)}</TableCell>
                            <TableCell className="text-xs" >
                              {session.status === "open" ? "—" : formatSessionDate(session.closing_date)}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-green-600">
                              {formatCurrency(encaissement)} {settings?.[0]?.currency || "FCFA"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  color={session.status === "open" ? "success" : "secondary"}
                                  className={cn("capitalize", session.status === "open" && "bg-success")}
                                >
                                  {session.status === "open" ? "Ouverte" : "Fermée"}
                                </Badge>
                                {session.status === "open" && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          color="success"
                                          size="icon"
                                          variant="outline"
                                          onClick={() => navigateToSessionDetails(session.id)}
                                          className="ml-1"
                                        >
                                          <CalendarIcon className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Accéder à la caisse</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button color="tyrian" size="icon" className="h-8 w-8">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => navigateToSessionDetails(session.id)}>
                                    Voir les détails
                                  </DropdownMenuItem>
                                  {session.status === "open" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => navigateToCloseSession(session.id)}
                                      >
                                        Fermer la session
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredSessions.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages} • {filteredSessions.length} résultats
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button variant="ghost" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={currentPage === pageNum ? "outline" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <Button variant="ghost" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
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

      {/* Modal session déjà ouverte */}
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
                    <h3 className="text-lg font-semibold">Session déjà ouverte</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous avez déjà une session active. Veuillez la clôturer avant d'en ouvrir une nouvelle.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button color="destructive" variant="outline" onClick={() => setShowModal(false)}>
                      Fermer
                    </Button>
                    <Button
                      onClick={() => {
                        const openSession = sessions.find(
                          (session) => session.user_id === userOnline?.id && session.status === "open",
                        )
                        if (openSession) {
                          router.push(`/caisse_comptabilite/session_caisse/${openSession.id}`)
                        }
                        setShowModal(false)
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

      {/* Modal heure d'ouverture non atteinte */}
      <AnimatePresence>
        {showLoginTimeModal && (
          <Dialog open={showLoginTimeModal} onOpenChange={setShowLoginTimeModal}>
            <DialogContent className="sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-orange-600">Ouverture non autorisée</h3>
                    <p className="text-sm text-muted-foreground">
                      L'ouverture de la session de caisse n'est autorisée qu'à partir de {settings?.[0]?.login_time}.<br />
                      Veuillez patienter avant d'ouvrir une nouvelle session.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button color="destructive" variant="outline" onClick={() => setShowLoginTimeModal(false)}>
                      Fermer
                    </Button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}