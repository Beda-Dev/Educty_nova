"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSchoolStore } from "@/store";
import { CashRegisterSession } from "@/lib/interface";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, Pagination } from "@/components/ui/pagination";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link, ArrowLeft, Badge, Calculator, Calendar, Clock, Banknote, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {generationNumero} from "@/lib/fonction"

interface Props {
  params: { 
    id: string;
  };
}

interface TransactionDetail {
  id: number;
  type: "encaissement" | "decaissement";
  amount: number;
  date: string;
  description: string;
  reference: string;
  details: any;
}

const DetailSessionPage = ({ params }: Props) => {
  const router = useRouter();
  const [sessionCurrent, setSessionCurrent] = useState<CashRegisterSession[] | null>(null);
  const { cashRegisterSessions, transactions, payments, expenses, settings } = useSchoolStore();
  const { id } = params;

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  // Validation de l'ID de session
  const sessionId = useMemo(() => {
    const numId = Number(id);
    return isNaN(numId) ? null : numId;
  }, [id]);

  // Récupération de la session
  useEffect(() => {
    if (!sessionId) return;
    
    const session = cashRegisterSessions.find((s) => s.id === sessionId);
    if (session) {
      setSessionCurrent([session]);
    } else {
      setSessionCurrent(null);
    }
  }, [cashRegisterSessions, sessionId]);

  // Vérification des données
  const currentSession = useMemo(() => {
    if (!sessionCurrent || sessionCurrent.length === 0) return null;
    return sessionCurrent[0];
  }, [sessionCurrent]);

  const currency = useMemo(() => settings[0]?.currency || "FCFA", [settings]);

  // Formatage des données
  const formatDateTime = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  }, []);

  const formatAmount = useCallback((amount: number | string) => {
    try {
      const num = typeof amount === "string" ? parseFloat(amount.replace(/\s/g, "")) : amount;
      if (isNaN(num)) return `0 ${currency}`;
      return `${num.toLocaleString("fr-FR").replace(/,/g, " ")} ${currency}`;
    } catch {
      return `0 ${currency}`;
    }
  }, [currency]);

  // Consolidation des transactions
  const sessionTransactions = useMemo<TransactionDetail[]>(() => {
    if (!currentSession || !sessionId) return [];
    const details: TransactionDetail[] = [];

    // Transactions générales
    transactions
      .filter((t) => t.cash_register_session_id === sessionId)
      .forEach((t) => {
        details.push({
          id: t.id,
          type: t.transaction_type?.toLowerCase().includes("encaissement") ? "encaissement" : "decaissement",
          amount: Number(t.total_amount),
          date: t.transaction_date,
          description: `Transaction ${t.transaction_type}`,
          reference: `${generationNumero(t.id, t.transaction_date, t.transaction_type?.toLowerCase().includes("encaissement") ? "encaissement" : "decaissement")}`,
          details: t,
        });
      });

    // Paiements
    payments
      .filter((p) => 
        p.transaction_id && 
        transactions.some((t) => t.id === p.transaction_id && t.cash_register_session_id === sessionId)
      )
      .forEach((p) => {
        details.push({
          id: p.id,
          type: "encaissement",
          amount: Number(p.amount),
          date: p.created_at,
          description: p.student ? `Paiement - ${p.student.first_name} ${p.student.name}` : "Paiement",
          reference: `${generationNumero(p.id, p.created_at, "encaissement")}`,
          details: p,
        });
      }); 

    // Dépenses
    expenses
      ?.filter((e) => 
        e.transaction_id && 
        transactions.some((t) => t.id === e.transaction_id && t.cash_register_session_id === sessionId)
      )
      .forEach((e) => {
        details.push({
          id: e.id,
          type: "decaissement",
          amount: Number(e.amount),
          date: e.expense_date,
          description: e.label,
          reference: `${generationNumero(e.id, e.expense_date, "decaissement")}`,
          details: e,
        });
      });

    return details.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentSession, transactions, payments, expenses, sessionId]);

  // Filtrage des transactions
  const filteredTransactions = useMemo(() => {
    let filtered = sessionTransactions;
    
    if (activeTab !== "all") {
      filtered = filtered.filter((t) => t.type === activeTab);
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(term) ||
          t.reference?.toLowerCase().includes(term) ||
          t.amount?.toString().includes(term)
      );
    }
    
    return filtered;
  }, [sessionTransactions, activeTab, typeFilter, searchTerm]);

  // Pagination
  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredTransactions, currentPage]);

  // Statistiques
  const statistics = useMemo(() => {
    const encaissements = sessionTransactions.filter((t) => t.type === "encaissement");
    const decaissements = sessionTransactions.filter((t) => t.type === "decaissement");
    const totalEncaissements = encaissements.reduce((sum, t) => sum + t.amount, 0);
    const totalDecaissements = decaissements.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalTransactions: sessionTransactions.length,
      totalEncaissements,
      totalDecaissements,
      nombreEncaissements: encaissements.length,
      nombreDecaissements: decaissements.length,
      soldeNet: totalEncaissements - totalDecaissements,
    };
  }, [sessionTransactions]);

  // Reset de la pagination lors des changements de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, typeFilter, searchTerm]);

  if (!sessionId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">ID de session invalide</h3>
          <p className="text-muted-foreground mb-4">L'identifiant de session fourni n'est pas valide.</p>
          <Button variant="outline" onClick={() => router.push("/caisse_comptabilite/session_caisse")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sessions
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentSession) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Session non trouvée</h3>
          <p className="text-muted-foreground mb-4">La session de caisse demandée n'existe pas ou a été supprimée.</p>
          <Button variant="outline" onClick={() => router.push("/caisse_comptabilite/session_caisse")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sessions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/caisse_comptabilite/session_caisse")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-4">
                Session de Caisse #{currentSession.id}
                {currentSession.status === "open" && (
                  <Button
                    color="destructive"
                    size="sm"
                    className="ml-2"
                    onClick={() => router.push(`/caisse_comptabilite/close-session/${currentSession.id}`)}
                  >
                    Fermer la session
                  </Button>
                )}
              </h1>
              <p className="text-muted-foreground">
                {currentSession.cash_register?.cash_register_number} - {currentSession.user?.name}
              </p>
            </div>
          </div>
          <Badge color={currentSession.status === "open" ? "default" : "secondary"} className="text-sm">
            {currentSession.status === "open" ? "Ouverte" : "Fermée"}
          </Badge>
        </div>

        {/* Informations de la session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Informations de la session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Date d'ouverture
                </div>
                <p className="font-semibold">{formatDateTime(currentSession.opening_date)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Date de fermeture
                </div>
                <p className="font-semibold">
                  {currentSession.status === "closed" && currentSession.closing_date
                    ? formatDateTime(currentSession.closing_date)
                    : "En cours"}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Solde d'ouverture
                </div>
                <p className="font-semibold">{formatAmount(currentSession.opening_amount)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Banknote className="h-4 w-4" />
                  Solde de fermeture
                </div>
                <p className="font-semibold">
                  {currentSession.status === "closed" && currentSession.closing_amount
                    ? formatAmount(currentSession.closing_amount)
                    : "En cours"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{statistics.totalTransactions}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Encaissements</p>
                  <p className="text-2xl font-bold text-green-600">{formatAmount(statistics.totalEncaissements)}</p>
                  <p className="text-xs text-muted-foreground">{statistics.nombreEncaissements} transaction(s)</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Décaissements</p>
                  <p className="text-2xl font-bold text-red-600">{formatAmount(statistics.totalDecaissements)}</p>
                  <p className="text-xs text-muted-foreground">{statistics.nombreDecaissements} transaction(s)</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde Net</p>
                  <p className={`text-2xl font-bold ${statistics.soldeNet >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatAmount(statistics.soldeNet)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions de la session</CardTitle>
            <CardDescription>Toutes les transactions effectuées pendant cette session de caisse</CardDescription>
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
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Rechercher une transaction..."
                  className="md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue placeholder="Type de transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="encaissement">Encaissements</SelectItem>
                    <SelectItem value="decaissement">Décaissements</SelectItem>
                  </SelectContent>
                </Select>
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
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={`${transaction.type}-${transaction.id}`}>
                        <TableCell>{formatDateTime(transaction.date)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline"
                            className="p-0 h-auto" 
                            onClick={() => router.push(`/cash-register-sessions/${sessionId}/transactions/${transaction.id}`)}
                          >
                            <code className="text-xs bg-muted px-2 py-1 rounded hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                              {transaction.reference}
                            </code>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge
                            color={transaction.type === "encaissement" ? "default" : "destructive"}
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
                        <TableCell
                          className={`text-right font-medium ${
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
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
      </CardContent>
    </Card>
  );
};

export default DetailSessionPage;