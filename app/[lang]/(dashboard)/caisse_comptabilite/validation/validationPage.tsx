"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, Filter, Search, CheckCircle2, XCircle, Clock, ArrowUpDown, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSchoolStore } from "@/store"
import { toast } from "@/components/ui/use-toast"
// Types
import { ValidationExpense } from "@/lib/interface"

const mockData: ValidationExpense[] = [
  {
    id: 1,
    user_id: 101,
    expense_id: 201,
    validation_date: "2025-05-10T10:00:00Z",
    comment: "Fournitures de bureau urgentes pour la rentrée",
    validation_order: 1,
    validation_status: "validée",
    created_at: "2025-05-09T14:30:00Z",
    updated_at: "2025-05-10T10:05:00Z",
    user: {
      id: 101,
      name: "Sophie Martin",
      email: "sophie.martin@ecole.fr",
      email_verified_at: null,
      created_at: "2024-09-01T08:00:00Z",
      updated_at: "2025-04-15T16:20:00Z",
      roles: [
        {
          id: 2,
          name: "Comptable",
          guard_name: "web",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          pivot: {
            model_type: "App\\Models\\User",
            model_id: 101,
            role_id: 2
          }
        }
      ]
    },
    expense: {
      id: 201,
      expense_type_id: 3,
      cash_register_id: 5,
      label: "Achat fournitures scolaires",
      amount: "450.00",
      expense_date: "2025-05-08T00:00:00Z",
      created_at: "2025-05-08T09:15:00Z",
      updated_at: "2025-05-10T10:05:00Z",
      expense_type: {
        id: 3,
        name: "Fournitures",
        slug: "fournitures",
        active: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      cash_register: {
        id: 5,
        cash_register_number: "CAISSE-2025-05",
        active: 1,
        created_at: "2025-05-01T08:00:00Z",
        updated_at: "2025-05-01T08:00:00Z"
      }
    }
  },
  {
    id: 2,
    user_id: 102,
    expense_id: 202,
    validation_date: "2025-05-12T14:30:00Z",
    comment: "Réparation photocopieuse salle des profs",
    validation_order: 2,
    validation_status: "en attente",
    created_at: "2025-05-12T10:00:00Z",
    updated_at: "2025-05-12T10:00:00Z",
    user: {
      id: 102,
      name: "Pierre Lambert",
      email: "pierre.lambert@ecole.fr",
      email_verified_at: null,
      created_at: "2024-09-01T08:00:00Z",
      updated_at: "2025-04-15T16:20:00Z",
      roles: [
        {
          id: 3,
          name: "Directeur",
          guard_name: "web",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          pivot: {
            model_type: "App\\Models\\User",
            model_id: 102,
            role_id: 3
          }
        }
      ]
    },
    expense: {
      id: 202,
      expense_type_id: 5,
      cash_register_id: 5,
      label: "Maintenance équipement",
      amount: "320.50",
      expense_date: "2025-05-11T00:00:00Z",
      created_at: "2025-05-11T16:00:00Z",
      updated_at: "2025-05-11T16:00:00Z",
      expense_type: {
        id: 5,
        name: "Maintenance",
        slug: "maintenance",
        active: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      cash_register: {
        id: 5,
        cash_register_number: "CAISSE-2025-05",
        active: 1,
        created_at: "2025-05-01T08:00:00Z",
        updated_at: "2025-05-01T08:00:00Z"
      }
    }
  },
  {
    id: 3,
    user_id: 103,
    expense_id: 203,
    validation_date: "2025-05-14T11:15:00Z",
    comment: "Montant non justifié - demande de précisions",
    validation_order: 3,
    validation_status: "refusée",
    created_at: "2025-05-14T09:00:00Z",
    updated_at: "2025-05-14T11:20:00Z",
    user: {
      id: 103,
      name: "Élodie Dubois",
      email: "elodie.dubois@ecole.fr",
      email_verified_at: null,
      created_at: "2024-09-01T08:00:00Z",
      updated_at: "2025-04-15T16:20:00Z",
      roles: [
        {
          id: 4,
          name: "Contrôleur",
          guard_name: "web",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          pivot: {
            model_type: "App\\Models\\User",
            model_id: 103,
            role_id: 4
          }
        }
      ]
    },
    expense: {
      id: 203,
      expense_type_id: 7,
      cash_register_id: 5,
      label: "Frais de représentation",
      amount: "180.00",
      expense_date: "2025-05-13T00:00:00Z",
      created_at: "2025-05-13T18:00:00Z",
      updated_at: "2025-05-14T11:20:00Z",
      expense_type: {
        id: 7,
        name: "Représentation",
        slug: "representation",
        active: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      cash_register: {
        id: 5,
        cash_register_number: "CAISSE-2025-05",
        active: 1,
        created_at: "2025-05-01T08:00:00Z",
        updated_at: "2025-05-01T08:00:00Z"
      }
    }
  },
  {
    id: 4,
    user_id: 101,
    expense_id: 204,
    validation_date: "2025-05-15T09:45:00Z",
    comment: "Abonnement logiciel éducatif",
    validation_order: 1,
    validation_status: "validée",
    created_at: "2025-05-14T16:30:00Z",
    updated_at: "2025-05-15T09:50:00Z",
    user: {
      id: 101,
      name: "Sophie Martin",
      email: "sophie.martin@ecole.fr",
      email_verified_at: null,
      created_at: "2024-09-01T08:00:00Z",
      updated_at: "2025-04-15T16:20:00Z",
      roles: [
        {
          id: 2,
          name: "Comptable",
          guard_name: "web",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          pivot: {
            model_type: "App\\Models\\User",
            model_id: 101,
            role_id: 2
          }
        }
      ]
    },
    expense: {
      id: 204,
      expense_type_id: 8,
      cash_register_id: 5,
      label: "Abonnement annuel EduSoft",
      amount: "1200.00",
      expense_date: "2025-05-14T00:00:00Z",
      created_at: "2025-05-14T15:00:00Z",
      updated_at: "2025-05-15T09:50:00Z",
      expense_type: {
        id: 8,
        name: "Logiciels",
        slug: "logiciels",
        active: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      cash_register: {
        id: 5,
        cash_register_number: "CAISSE-2025-05",
        active: 1,
        created_at: "2025-05-01T08:00:00Z",
        updated_at: "2025-05-01T08:00:00Z"
      }
    }
  },
  {
    id: 5,
    user_id: 104,
    expense_id: 205,
    validation_date: "2025-05-16T14:00:00Z",
    comment: "Achat matériel sportif - en attente devis complémentaire",
    validation_order: 2,
    validation_status: "en attente",
    created_at: "2025-05-16T10:30:00Z",
    updated_at: "2025-05-16T10:30:00Z",
    user: {
      id: 104,
      name: "Thomas Leroy",
      email: "thomas.leroy@ecole.fr",
      email_verified_at: null,
      created_at: "2024-09-01T08:00:00Z",
      updated_at: "2025-04-15T16:20:00Z",
      roles: [
        {
          id: 5,
          name: "Responsable Sport",
          guard_name: "web",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          pivot: {
            model_type: "App\\Models\\User",
            model_id: 104,
            role_id: 5
          }
        }
      ]
    },
    expense: {
      id: 205,
      expense_type_id: 4,
      cash_register_id: 5,
      label: "Matériel éducation physique",
      amount: "650.00",
      expense_date: "2025-05-15T00:00:00Z",
      created_at: "2025-05-15T17:45:00Z",
      updated_at: "2025-05-16T10:30:00Z",
      expense_type: {
        id: 4,
        name: "Sport",
        slug: "sport",
        active: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      cash_register: {
        id: 5,
        cash_register_number: "CAISSE-2025-05",
        active: 1,
        created_at: "2025-05-01T08:00:00Z",
        updated_at: "2025-05-01T08:00:00Z"
      }
    }
  }
]

export default function ExpenseValidationsPage() {
  const [validations, setValidations] = useState<ValidationExpense[]>(mockData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedValidation, setSelectedValidation] = useState<ValidationExpense | null>(null)
  const [comment, setComment] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null)

  // Fonction de tri
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  // Filtrer et trier les validations
  const filteredValidations = validations
    .filter((validation) => {
      const matchesSearch =
        validation.expense?.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        validation.user?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter ? validation.validation_status === statusFilter : true

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (!sortConfig) return 0

      const key = sortConfig.key as keyof ValidationExpense
      const aValue = a[key]
      const bValue = b[key]

      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1
      }
      return 0
    })

  // Mettre à jour le statut d'une validation
  const updateValidationStatus = (id: number, newStatus: string) => {
    setValidations((prev) =>
      prev.map((validation) =>
        validation.id === id
          ? {
              ...validation,
              validation_status: newStatus,
              updated_at: new Date().toISOString(),
              validation_date: newStatus !== "en attente" ? new Date().toISOString() : validation.validation_date,
              comment: comment || validation.comment,
            }
          : validation,
      ),
    )

    toast({
      title: "Statut mis à jour",
      description: `La validation #${id} a été marquée comme ${newStatus}.`,
      color: newStatus === "validée" ? "success" : newStatus === "refusée" ? "destructive" : "default",
    })

    setIsDialogOpen(false)
    setComment("")
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Obtenir l'icône et la couleur en fonction du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "validée":
        return { 
          icon: <CheckCircle2 className="h-4 w-4" />, 
          color: "bg-green-100 text-green-800",
          textColor: "text-green-800"
        }
      case "refusée":
        return { 
          icon: <XCircle className="h-4 w-4" />, 
          color: "bg-red-100 text-red-800",
          textColor: "text-red-800"
        }
      default:
        return { 
          icon: <Clock className="h-4 w-4" />, 
          color: "bg-blue-100 text-blue-800",
          textColor: "text-blue-800"
        }
    }
  }

  // Vérifier si une validation peut être modifiée
  const canEditValidation = (validation: ValidationExpense) => {
    return validation.validation_status === "en attente"
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Validation des Dépenses</CardTitle>
                <CardDescription className="text-gray-600">
                  Gestion et suivi des demandes de validation
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex gap-2 shadow-sm">
                      <Filter className="h-4 w-4" />
                      <span>Filtrer</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[180px]">
                    <DropdownMenuItem onClick={() => setStatusFilter(null)} className="flex items-center gap-2">
                      Tous les statuts
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("en attente")} 
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-blue-500" />
                      En attente
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("validée")} 
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Validée
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("refusée")} 
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                      Refusée
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou description..."
                className="pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="px-6 py-3">
                      <button 
                        onClick={() => requestSort('id')} 
                        className="flex items-center gap-1 font-medium text-gray-700"
                      >
                        ID
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="px-6 py-3 font-medium text-gray-700">Dépense</TableHead>
                    <TableHead className="px-6 py-3">
                      <button 
                        onClick={() => requestSort('amount')} 
                        className="flex items-center gap-1 font-medium text-gray-700"
                      >
                        Montant
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="px-6 py-3 font-medium text-gray-700">Demandeur</TableHead>
                    <TableHead className="px-6 py-3">
                      <button 
                        onClick={() => requestSort('validation_date')} 
                        className="flex items-center gap-1 font-medium text-gray-700"
                      >
                        Date
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="px-6 py-3 font-medium text-gray-700">Statut</TableHead>
                    <TableHead className="px-6 py-3 font-medium text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredValidations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          Aucune validation trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredValidations.map((validation) => {
                        const statusInfo = getStatusInfo(validation.validation_status)
                        return (
                          <motion.tr
                            key={validation.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="px-6 py-4 font-medium text-gray-900">
                              #{validation.id}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="font-medium">{validation.expense?.label}</div>
                              {validation.comment && (
                                <div className="text-sm text-gray-500 mt-1">{validation.comment}</div>
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-4 font-medium">
                              {validation.expense?.amount} €
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="font-medium">{validation.user?.name}</div>
                              <div className="text-sm text-gray-500">{validation.user?.email}</div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              {formatDate(validation.validation_date)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                                statusInfo.color
                              )}>
                                {statusInfo.icon}
                                <span className="ml-1.5 capitalize text-xs">{validation.validation_status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <Dialog
                                open={isDialogOpen && selectedValidation?.id === validation.id}
                                onOpenChange={(open) => {
                                  setIsDialogOpen(open)
                                  if (!open) setSelectedValidation(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant={canEditValidation(validation) ? "outline" : "ghost"}
                                    size="sm"
                                    className={cn(
                                      "shadow-sm",
                                      !canEditValidation(validation) && "text-gray-600 hover:bg-transparent"
                                    )}
                                    onClick={() => {
                                      setSelectedValidation(validation)
                                      setComment(validation.comment)
                                    }}
                                  >
                                    {canEditValidation(validation) ? (
                                      "Modifier"
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        <span>Voir</span>
                                      </div>
                                    )}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl">
                                      {canEditValidation(validation) ? "Modifier la validation" : "Détails de la validation"}
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-600">
                                      Dépense: <span className="font-medium">{validation.expense?.label}</span>
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="status" className="text-gray-700">Statut</Label>
                                      {canEditValidation(validation) ? (
                                        <Select
                                          defaultValue={validation.validation_status}
                                          onValueChange={(value) => {
                                            if (selectedValidation) {
                                              setSelectedValidation({
                                                ...selectedValidation,
                                                validation_status: value,
                                              })
                                            }
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner un statut" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="en attente" className="flex items-center gap-2">
                                              <Clock className="h-4 w-4 text-blue-500" />
                                              En attente
                                            </SelectItem>
                                            <SelectItem value="validée" className="flex items-center gap-2">
                                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                                              Validée
                                            </SelectItem>
                                            <SelectItem value="refusée" className="flex items-center gap-2">
                                              <XCircle className="h-4 w-4 text-red-500" />
                                              Refusée
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <div className="flex items-center gap-2 p-2">
                                          {statusInfo.icon}
                                          <span className={statusInfo.textColor}>
                                            {validation.validation_status}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="comment" className="text-gray-700">Commentaire</Label>
                                      {canEditValidation(validation) ? (
                                        <Input 
                                          id="comment" 
                                          value={comment} 
                                          onChange={(e) => setComment(e.target.value)}
                                          className="w-full"
                                          placeholder="Ajouter un commentaire..."
                                        />
                                      ) : (
                                        <div className="p-2 text-gray-700">
                                          {validation.comment || "Aucun commentaire"}
                                        </div>
                                      )}
                                    </div>
                                    {!canEditValidation(validation) && (
                                      <div className="grid gap-2">
                                        <Label className="text-gray-700">Date de validation</Label>
                                        <div className="p-2 text-gray-700">
                                          {formatDate(validation.validation_date)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setIsDialogOpen(false)
                                        setSelectedValidation(null)
                                      }}
                                    >
                                      Fermer
                                    </Button>
                                    {canEditValidation(validation) && (
                                      <Button
                                        onClick={() => {
                                          if (selectedValidation) {
                                            updateValidationStatus(selectedValidation.id, selectedValidation.validation_status)
                                          }
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        Enregistrer les modifications
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </motion.tr>
                        )
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}