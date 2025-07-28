"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Expense, ValidationExpense, Demand } from "@/lib/interface"
import { useSchoolStore } from "@/store"
import { useRouter } from "next/navigation"
import { verificationPermission } from "@/lib/fonction"
import ErrorPage from "@/app/[lang]/non-Autoriser"
import { format } from "date-fns"
import { DatePickerInput } from "./datePicker"
import { RefreshCw, FileText, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DecaissementPage from "./decaissement-page"


const TableExpense = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCashRegister, setSelectedCashRegister] = useState<string>("")
  const [selectedValidator, setSelectedValidator] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [showDemandsModal, setShowDemandsModal] = useState(false)
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null)
  const [showDecaissementPage, setShowDecaissementPage] = useState(false)
  const [selectedValidationId, setSelectedValidationId] = useState<number | null>(null)
  const [demandSearchTerm, setDemandSearchTerm] = useState("")



  const { userOnline, settings, users , expenses , demands , validationExpenses } = useSchoolStore()
  const router = useRouter()

  // Vérification des permissions
  const hasAdminAccessVoir = verificationPermission({ permissionNames: userOnline?.permissionNames || [] }, [
    "voir depenses",
  ])
  const hasAdminAccessCreer = verificationPermission({ permissionNames: userOnline?.permissionNames || [] }, [
    "creer depenses",
  ])

  // if (!hasAdminAccessVoir) {
  //   return (
  //     <Card>
  //       <ErrorPage />
  //     </Card>
  //   )
  // }

  // Formatage des montants avec devise
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " " + (settings[0]?.currency || "FCFA")
  }

  // Filtrage des dépenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesDate =
        !selectedDate || format(new Date(expense.expense_date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")

      const matchesSearch = expense.label.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCashRegister = selectedCashRegister
        ? expense.cash_register?.cash_register_number === selectedCashRegister
        : true

      const matchesValidator = selectedValidator
        ? validationExpenses.some((v) => expense?.validation_expense_id === v.id && v.user?.name === selectedValidator)
        : true

      const matchesStatus = selectedStatus
        ? validationExpenses.some((v) => expense.validation_expense_id === v.id && v.validation_status === selectedStatus)
        : true

      return matchesDate && matchesSearch && matchesCashRegister && matchesValidator && matchesStatus
    })
  }, [expenses, selectedDate, searchTerm, selectedCashRegister, selectedValidator, selectedStatus, validationExpenses])



  const approvedDemandsWithValidators = useMemo(() => {
    // je verifie si un decaissement a deja et effectuer pour les validation 
    const filteredValidation = validationExpenses.filter(va => !expenses.some(ex => Number(ex.validation_expense_id) === Number(va.id))  )
    // 1. Filtrer les validations approuvées et ayant une demande associée
    const approvedValidations = filteredValidation.filter(v =>
      v.validation_status === "approuvée" &&
      v.demand_id &&
      v.demand // Vérifier que la demande existe dans la validation
    );

    // 2. Créer un tableau unique de demandes (éviter les doublons)
    const uniqueDemands = new Map<number, {
      demand: Demand;
      validators: Array<{
        name: string;
        status: string;
        date: string;
      }>;
      validationId: number;
    }>();

    approvedValidations.forEach(validation => {
      if (!validation.demand) return;

      const existing = uniqueDemands.get(validation.demand.id);

      if (existing) {
        // Ajouter le validateur si pas déjà présent
        if (!existing.validators.some(v => v.name === validation.user?.name)) {
          existing.validators.push({
            name: validation.user?.name || "Inconnu",
            status: validation.validation_status,
            date: validation.validation_date
          });
        }
      } else {
        uniqueDemands.set(validation.demand.id, {
          demand: validation.demand,
          validators: [{
            name: validation.user?.name || "Inconnu",
            status: validation.validation_status,
            date: validation.validation_date
          }],
          validationId: validation.id
        });
      }
    });

    // 3. Convertir en tableau et appliquer le filtre de recherche
    return Array.from(uniqueDemands.values())
      .filter(item => {
        if (!demandSearchTerm) return true;
        const searchLower = demandSearchTerm.toLowerCase();
        return (
          item.demand.applicant?.name?.toLowerCase().includes(searchLower) ||
          item.demand.pattern?.toLowerCase().includes(searchLower) ||
          String(item.demand.amount).includes(demandSearchTerm)
        );
      });
  }, [validationExpenses, demandSearchTerm]);

  // Pagination
  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1)
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1)

  const resetFilters = () => {
    setSelectedDate(null)
    setSelectedCashRegister("")
    setSelectedValidator("")
    setSelectedStatus("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handleCreateExpense = () => {
    if (approvedDemandsWithValidators.length > 0) {
      setShowDemandsModal(true)
    } else {
      toast.error("Aucune demande de décaissement disponible.")
    }

  }

  const handleDemandSelect = (demand: Demand) => {
    // Trouver la validation correspondante à cette demande
    const demandValidation = validationExpenses.find((v) => v.demand_id === demand.id && v.validation_status === "approuvée")

    if (demandValidation) {
      setSelectedValidationId(demandValidation.id)
      setShowDemandsModal(false)
      setShowDecaissementPage(true)
    } else {
      toast.error("Aucune validation trouvée pour cette demande.")
    }
  }

  const handleBackToSelection = () => {
    setShowDecaissementPage(false)
    setSelectedValidationId(null)
    setShowDemandsModal(true)
  }

  const handleNewDecaissement = () => {
    setShowDecaissementPage(false)
    setSelectedValidationId(null)
    setShowDemandsModal(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {showDecaissementPage && selectedValidationId ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToSelection} className="flex items-center gap-2">
              <Icon icon="heroicons:arrow-left" className="h-4 w-4" />
              Retour à la sélection
            </Button>
          </div>
          <DecaissementPage validationId={selectedValidationId} onNewDecaissement={handleNewDecaissement} />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Décaissements</CardTitle>
              </div>
              <Badge variant="outline">
                {filteredExpenses.length} {filteredExpenses.length > 1 ? "décaissements" : "décaissement"}
              </Badge>
            </CardHeader>

            <CardContent>
              {true && (
                <div className="flex justify-end my-2">
                  <Button color="indigodye" onClick={handleCreateExpense}>
                    <Icon icon="heroicons:plus" className="mr-2 h-4 w-4" />
                    Faire un décaissement
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center mb-4">
                <Input
                  placeholder="Rechercher..."
                  className="w-[180px]"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />

                <Select value={selectedCashRegister} onValueChange={setSelectedCashRegister}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Caisse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">caisses</SelectItem>
                    {Array.from(
                      new Set(expenses.map((e) => e.cash_register?.cash_register_number).filter(Boolean) as string[]),
                    ).map((num) => (
                      <SelectItem key={num} value={num}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedValidator} onValueChange={setSelectedValidator}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Validateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">validateurs</SelectItem>
                    {Array.from(new Set(validationExpenses.map((v) => v.user?.name).filter(Boolean) as string[])).map(
                      (name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>


                <DatePickerInput
                  date={selectedDate}
                  setDateAction={setSelectedDate}
                  placeholder="Sélectionner une date"
                />

                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Caisse</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.length > 0 ? (
                    <AnimatePresence>
                      {paginatedExpenses.map((expense) => {
                        const validation = validationExpenses.find((v) => v.id === expense.validation_expense_id)

                        return (
                          <motion.tr
                            key={expense.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-muted-foreground/20"
                          >
                            <TableCell>{expense.label}</TableCell>
                            <TableCell className="font-medium">{formatAmount(Number(expense.amount))}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {expense.expense_type?.name || "Inconnu"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge color="skyblue" className="text-xs">
                                {expense.cash_register?.cash_register_number || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge color="skyblue" className="text-xs">
                                  {validation?.user?.name || "Non validé"}
                                </Badge>
                                {validation?.validation_date && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(validation.validation_date), "dd/MM/yyyy")}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="text-sm">{format(new Date(expense.expense_date), "dd/MM/yyyy")}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(expense.created_at), "HH:mm")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>


                              <Button
                                color="tyrian"
                                onClick={() => {
                                  router.push(`/caisse_comptabilite/decaissement/depense/${expense.id}`)

                                }}
                              >
                                <FileText className="w-5 h-5 " />

                              </Button>


                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                        {searchTerm || selectedDate
                          ? "Aucun décaissement ne correspond à votre recherche."
                          : "Aucun décaissement enregistré."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={handlePreviousPage}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
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
                              onClick={() => setCurrentPage(pageNum)}
                              size="sm"
                            >
                              {pageNum}
                            </Button>
                          </PaginationItem>
                        )
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={handleNextPage}
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

          {/* Modale pour les demandes de décaissement approuvées */}
          <Dialog open={showDemandsModal} onOpenChange={setShowDemandsModal}>
            <DialogContent size="5xl" className="w-screen h-screen max-w-none max-h-none rounded-none sm:rounded-none">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon icon="heroicons:document-currency-dollar" className="h-5 w-5" />
                  Demandes approuvées disponibles
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    placeholder="Rechercher par demandeur, motif ou montant..."
                    value={demandSearchTerm}
                    onChange={(e) => setDemandSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="self-center">
                    {approvedDemandsWithValidators.length} demande(s) trouvée(s)
                  </Badge>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[200px]">Demandeur</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedDemandsWithValidators.length > 0 ? (
                        approvedDemandsWithValidators.map((item) => (
                          <TableRow key={item.demand.id} className="hover:bg-gray-50/50">
                            <TableCell>
                              <div className="font-medium">{users.find((user) => Number(user.id) === Number(item.demand.applicant_id))?.name || "inconnu"}  { }</div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatAmount(item.demand.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="line-clamp-2" title={item.demand.pattern}>
                                {item.demand.pattern}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {format(new Date(item.demand.created_at), "dd/MM/yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(item.demand.created_at), "HH:mm")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {item.validators.map((validator, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {validator.name}
                                    </Badge>
                                    <Badge
                                      color={validator.status === "approuvée" ? "success" : "destructive"}
                                      className="text-xs"
                                    >
                                      {validator.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleDemandSelect(item.demand)}
                                className="gap-2"
                              >
                                Sélectionner
                                <Icon icon="heroicons:arrow-right" className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                              <Icon icon="heroicons:inbox" className="h-8 w-8" />
                              {demandSearchTerm
                                ? "Aucune demande ne correspond à votre recherche"
                                : "Aucune demande approuvée disponible"}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </motion.div>
  )
}

export default TableExpense
