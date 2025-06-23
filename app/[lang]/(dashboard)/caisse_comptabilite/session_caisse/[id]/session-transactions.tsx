"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  Pagination,
} from "@/components/ui/pagination"
import { TrendingUp, TrendingDown, FileSpreadsheet, CalendarIcon, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSchoolStore } from "@/store"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { universalExportToExcel } from "@/lib/utils"

interface TransactionDetail {
  id: number
  type: "encaissement" | "decaissement"
  amount: number
  date: string
  description: string
  reference: string
  details: any
  paymentMethods?: string[]
}

interface SessionTransactionsProps {
  sessionTransactions: TransactionDetail[]
  statistics: {
    totalTransactions: number
    nombreEncaissements: number
    nombreDecaissements: number
  }
  formatDateTime: (dateString: string) => string
  formatAmount: (amount: number | string) => string
  sessionId: number
}

export default function SessionTransactions({
  sessionTransactions,
  statistics,
  formatDateTime,
  formatAmount,
  sessionId,
}: SessionTransactionsProps) {
  const router = useRouter()
  const { methodPayment, payments } = useSchoolStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Enrichir les transactions avec les méthodes de paiement
  const enrichedTransactions = useMemo(() => {
    return sessionTransactions.map((transaction) => {
      let paymentMethods: string[] = []

      if (transaction.type === "encaissement") {
        // Correction : utiliser payment.payment_methods (avec "s") et non payment.payment_method
        const payment = payments.find(
          (p) =>
            p.transaction_id === transaction.id &&
            p.transaction &&
            p.transaction.cash_register_session_id === sessionId
        )
        if (payment && payment.payment_methods && Array.isArray(payment.payment_methods)) {
          paymentMethods = payment.payment_methods.map((pm: any) => {
            // pm.name est déjà le nom de la méthode de paiement
            return pm.name || "Inconnu"
          })
        }
      }

      // Pour les décaissements, rien à faire (pas de méthode de paiement)

      return {
        ...transaction,
        paymentMethods,
      }
    }).filter(Boolean)
  }, [sessionTransactions, payments, methodPayment, sessionId])

  // Filtrage des transactions
  const filteredTransactions = useMemo(() => {
    let filtered = enrichedTransactions.filter((t) => t !== null)

    if (activeTab !== "all") {
      filtered = filtered.filter((t) => t && t.type === activeTab)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t && t.type === typeFilter)
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter((t) => {
        if (!t) return false
        if (t.type === "decaissement") return true // Les décaissements n'ont pas de méthode de paiement
        return t.paymentMethods?.some((method) => method === paymentMethodFilter)
      })
    }

    if (dateFilter) {
      const filterDate = format(dateFilter, "yyyy-MM-dd")
      filtered = filtered.filter((t) => {
        if (!t) return false
        const transactionDate = format(new Date(t.date), "yyyy-MM-dd")
        return transactionDate === filterDate
      })
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t &&
          (t.description?.toLowerCase().includes(term) ||
            t.reference?.toLowerCase().includes(term) ||
            t.amount?.toString().includes(term)),
      )
    }

    return filtered
  }, [enrichedTransactions, activeTab, typeFilter, paymentMethodFilter, dateFilter, searchTerm])

  // Pagination
  const ITEMS_PER_PAGE = 15
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.filter((t) => t !== null).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredTransactions, currentPage])

  // Reset de la pagination lors des changements de filtre
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, typeFilter, paymentMethodFilter, dateFilter, searchTerm])

  // Type pour l'export Excel
  type ExportData = {
    "Date/Heure": string;
    "Référence": string;
    "Type": string;
    "Description": string;
    "Méthodes de paiement": string;
    "Montant": number;
    "Montant formaté": string;
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportData: ExportData[] = filteredTransactions.map((transaction) => ({
      "Date/Heure": formatDateTime(transaction.date),
      "Référence": transaction.reference,
      "Type": transaction.type === "encaissement" ? "Encaissement" : "Décaissement",
      "Description": transaction.description || "-",
      "Méthodes de paiement": transaction.paymentMethods?.join(", ") || "-",
      "Montant": transaction.amount,
      "Montant formaté": formatAmount(transaction.amount),
    }));

    

    // @ts-ignore - TypeScript a du mal avec l'inférence ici
    universalExportToExcel<ExportData>({
      source: {
        type: "array",
        data: exportData,
      },
      fileName: `transactions_session_${sessionId}_${format(new Date(), "yyyy-MM-dd")}.xlsx`,
    });
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setPaymentMethodFilter("all")
    setDateFilter(undefined)
    setActiveTab("all")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transactions de la session</CardTitle>
            <CardDescription>Toutes les transactions effectuées pendant cette session de caisse</CardDescription>
          </div>
          <Button color="success" onClick={handleExportExcel} className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exporter Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres et onglets */}
        <div className="space-y-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Toutes ({statistics.totalTransactions})</TabsTrigger>
              <TabsTrigger value="encaissement">Encaissements ({statistics.nombreEncaissements})</TabsTrigger>
              <TabsTrigger value="decaissement">Décaissements ({statistics.nombreDecaissements})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Rechercher une transaction..."
              className="lg:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Type de transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="encaissement">Encaissements</SelectItem>
                <SelectItem value="decaissement">Décaissements</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Méthode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les méthodes</SelectItem>
                {methodPayment.map((method) => (
                  <SelectItem key={method.id} value={method.name}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("lg:w-48 justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus locale={fr} />
              </PopoverContent>
            </Popover>

            {(searchTerm || typeFilter !== "all" || paymentMethodFilter !== "all" || dateFilter) && (
              <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Indicateurs de filtres actifs */}
          <div className="flex flex-wrap gap-2">
            {dateFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                Date: {format(dateFilter, "dd/MM/yyyy")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFilter(undefined)} />
              </Badge>
            )}
            {paymentMethodFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Méthode: {paymentMethodFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setPaymentMethodFilter("all")} />
              </Badge>
            )}
          </div>
        </div>

        {/* Tableau des transactions */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Heure</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Méthodes de paiement</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.filter((transaction) => transaction !== null).map((transaction) => (
                  <TableRow key={`${transaction.type}-${transaction.id}`}>
                    <TableCell>{formatDateTime(transaction.date)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="p-0 h-auto"
                        onClick={() =>
                          router.push(`/cash-register-sessions/${sessionId}/transactions/${transaction.id}`)
                        }
                      >
                        <code className="text-xs bg-muted px-2 py-1 rounded hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                          {transaction.reference}
                        </code>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={transaction.type === "encaissement" ? "success" : "destructive"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {transaction.type === "encaissement" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {transaction.type === "encaissement" ? "Encaissement" : "Décaissement"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={transaction.description}>
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {transaction.paymentMethods && transaction.paymentMethods.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {transaction.paymentMethods.map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={` font-medium ${
                        transaction.type === "encaissement" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "encaissement" ? "+" : "-"}
                      {formatAmount(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > ITEMS_PER_PAGE && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <Button variant={currentPage === i + 1 ? "outline" : "ghost"} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </Button>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
