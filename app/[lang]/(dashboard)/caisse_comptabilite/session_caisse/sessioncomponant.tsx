"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// Types
interface User {
  id: number
  hierarchical_id: number | null
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface CashRegister {
  id: number
  cash_register_number: string
  active: number
  created_at: string
  updated_at: string
}

interface CashRegisterSession {
  id: number
  user_id: number
  cash_register_id: number
  opening_date: string
  closing_date: string | null
  opening_amount: string
  closing_amount: string | null
  status: "open" | "closed"
  created_at: string
  updated_at: string
  user?: User
  cash_register?: CashRegister
}

// Mock data for demonstration
const mockSessions: CashRegisterSession[] = [
  {
    id: 1,
    user_id: 1,
    cash_register_id: 4,
    opening_date: "2025-05-13 07:30:00",
    closing_date: "2025-05-13 17:30:00",
    opening_amount: "0",
    closing_amount: "200000",
    status: "closed",
    created_at: "2025-05-13T13:03:54.000000Z",
    updated_at: "2025-05-13T13:11:50.000000Z",
    user: {
      id: 1,
      hierarchical_id: null,
      name: "Tania",
      email: "k@gmail.com",
      email_verified_at: null,
      created_at: "2025-02-20T05:42:54.000000Z",
      updated_at: "2025-02-20T09:21:47.000000Z",
    },
    cash_register: {
      id: 4,
      cash_register_number: "5",
      active: 1,
      created_at: "2025-02-20T03:37:19.000000Z",
      updated_at: "2025-02-20T03:39:11.000000Z",
    },
  },
  {
    id: 2,
    user_id: 2,
    cash_register_id: 1,
    opening_date: "2025-05-14 08:00:00",
    closing_date: "2025-05-14 18:00:00",
    opening_amount: "5000",
    closing_amount: "150000",
    status: "closed",
    created_at: "2025-05-14T08:00:00.000000Z",
    updated_at: "2025-05-14T18:00:00.000000Z",
    user: {
      id: 2,
      hierarchical_id: null,
      name: "Marc Dupont",
      email: "marc@example.com",
      email_verified_at: null,
      created_at: "2025-02-20T05:42:54.000000Z",
      updated_at: "2025-02-20T09:21:47.000000Z",
    },
    cash_register: {
      id: 1,
      cash_register_number: "1",
      active: 1,
      created_at: "2025-02-20T03:37:19.000000Z",
      updated_at: "2025-02-20T03:39:11.000000Z",
    },
  },
  {
    id: 3,
    user_id: 1,
    cash_register_id: 2,
    opening_date: "2025-05-15 07:45:00",
    closing_date: null,
    opening_amount: "10000",
    closing_amount: null,
    status: "open",
    created_at: "2025-05-15T07:45:00.000000Z",
    updated_at: "2025-05-15T07:45:00.000000Z",
    user: {
      id: 1,
      hierarchical_id: null,
      name: "Tania",
      email: "k@gmail.com",
      email_verified_at: null,
      created_at: "2025-02-20T05:42:54.000000Z",
      updated_at: "2025-02-20T09:21:47.000000Z",
    },
    cash_register: {
      id: 2,
      cash_register_number: "2",
      active: 1,
      created_at: "2025-02-20T03:37:19.000000Z",
      updated_at: "2025-02-20T03:39:11.000000Z",
    },
  },
  {
    id: 4,
    user_id: 3,
    cash_register_id: 3,
    opening_date: "2025-05-15 08:30:00",
    closing_date: null,
    opening_amount: "7500",
    closing_amount: null,
    status: "open",
    created_at: "2025-05-15T08:30:00.000000Z",
    updated_at: "2025-05-15T08:30:00.000000Z",
    user: {
      id: 3,
      hierarchical_id: null,
      name: "Sophie Martin",
      email: "sophie@example.com",
      email_verified_at: null,
      created_at: "2025-02-20T05:42:54.000000Z",
      updated_at: "2025-02-20T09:21:47.000000Z",
    },
    cash_register: {
      id: 3,
      cash_register_number: "3",
      active: 1,
      created_at: "2025-02-20T03:37:19.000000Z",
      updated_at: "2025-02-20T03:39:11.000000Z",
    },
  },
  {
    id: 5,
    user_id: 4,
    cash_register_id: 1,
    opening_date: "2025-05-12 08:15:00",
    closing_date: "2025-05-12 17:45:00",
    opening_amount: "2000",
    closing_amount: "175000",
    status: "closed",
    created_at: "2025-05-12T08:15:00.000000Z",
    updated_at: "2025-05-12T17:45:00.000000Z",
    user: {
      id: 4,
      hierarchical_id: null,
      name: "Jean Durand",
      email: "jean@example.com",
      email_verified_at: null,
      created_at: "2025-02-20T05:42:54.000000Z",
      updated_at: "2025-02-20T09:21:47.000000Z",
    },
    cash_register: {
      id: 1,
      cash_register_number: "1",
      active: 1,
      created_at: "2025-02-20T03:37:19.000000Z",
      updated_at: "2025-02-20T03:39:11.000000Z",
    },
  },
]

// Get unique users from sessions
const getUniqueUsers = (sessions: CashRegisterSession[]) => {
  const usersMap = new Map<number, User>()
  sessions.forEach((session) => {
    if (session.user) {
      usersMap.set(session.user.id, session.user)
    }
  })
  return Array.from(usersMap.values())
}

// Get unique cash registers from sessions
const getUniqueCashRegisters = (sessions: CashRegisterSession[]) => {
  const registersMap = new Map<number, CashRegister>()
  sessions.forEach((session) => {
    if (session.cash_register) {
      registersMap.set(session.cash_register.id, session.cash_register)
    }
  })
  return Array.from(registersMap.values())
}

export default function CashRegisterSessionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for filters
  const [sessions, setSessions] = useState<CashRegisterSession[]>(mockSessions)
  const [filteredSessions, setFilteredSessions] = useState<CashRegisterSession[]>(mockSessions)
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Get unique users and cash registers for filters
  const uniqueUsers = getUniqueUsers(sessions)
  const uniqueCashRegisters = getUniqueCashRegisters(sessions)

  // Apply filters
  useEffect(() => {
    let result = [...sessions]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (session) =>
          session.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.cash_register?.cash_register_number.includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((session) => session.status === statusFilter)
    }

    // Apply user filter
    if (userFilter) {
      result = result.filter((session) => session.user_id === Number.parseInt(userFilter))
    }

    // Apply cash register filter
    if (registerFilter) {
      result = result.filter((session) => session.cash_register_id === Number.parseInt(registerFilter))
    }

    // Apply date range filter
    if (dateRange.from) {
      result = result.filter((session) => {
        const openingDate = new Date(session.opening_date)
        return openingDate >= dateRange.from!
      })
    }

    if (dateRange.to) {
      result = result.filter((session) => {
        const openingDate = new Date(session.opening_date)
        return openingDate <= dateRange.to!
      })
    }

    setFilteredSessions(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [sessions, searchTerm, statusFilter, userFilter, registerFilter, dateRange])

  // Format currency
const formatCurrency = (amount: string) => {
  const numericAmount = Number.parseInt(amount) / 100

  return numericAmount.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + ' FCFA'
}


  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr })
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter(null)
    setUserFilter(null)
    setRegisterFilter(null)
    setDateRange({ from: undefined, to: undefined })
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Sessions de caisse</CardTitle>
            <CardDescription>Gérez et consultez les sessions de caisse</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters} className="flex gap-1">
              <RefreshCw className="h-4 w-4" />
              Réinitialiser
            </Button>
            <Button asChild size="sm" className="flex gap-1">
              <Link href="/caisse_comptabilite/open-session">
                <Plus className="h-4 w-4" />
                Nouvelle session
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Status filter */}
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="closed">Fermé</SelectItem>
                </SelectContent>
              </Select>

              {/* User filter */}
              <Select value={userFilter || ""} onValueChange={(value) => setUserFilter(value || null)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Cash register filter */}
              <Select value={registerFilter || ""} onValueChange={(value) => setRegisterFilter(value || null)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Caisse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les caisses</SelectItem>
                  {uniqueCashRegisters.map((register) => (
                    <SelectItem key={register.id} value={register.id.toString()}>
                      Caisse {register.cash_register_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date range filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.from && !dateRange.to && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
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
                    onSelect={(range) =>
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }
                    numberOfMonths={2}
                    locale={fr}
                  />
                  <div className="flex items-center justify-between p-3 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                      Réinitialiser
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Close popover
                        document.body.click()
                      }}
                    >
                      Appliquer
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Sessions table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      Aucune session trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.id}</TableCell>
                      <TableCell>Caisse {session.cash_register?.cash_register_number}</TableCell>
                      <TableCell>{session.user?.name}</TableCell>
                      <TableCell>{formatDate(session.opening_date)}</TableCell>
                      <TableCell>{formatDate(session.closing_date)}</TableCell>
                      <TableCell>{formatCurrency(session.opening_amount)}</TableCell>
                      <TableCell>{session.closing_amount ? formatCurrency(session.closing_amount) : "—"}</TableCell>
                      <TableCell>
                        <Badge color={session.status === "open" ? "success" : "secondary"}>
                          {session.status === "open" ? "Ouvert" : "Fermé"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <SlidersHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/cash-register/sessions/${session.id}`)}>
                              Voir les détails
                            </DropdownMenuItem>
                            {session.status === "open" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => router.push(`/caisse_comptabilite/close-session/${session.id}`)}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, filteredSessions.length)} sur {filteredSessions.length} sessions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
