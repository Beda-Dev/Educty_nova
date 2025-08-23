"use client"

import { useState, useEffect, useMemo } from "react"
import { useSchoolStore } from "@/store"
import { filterDemandsByUserRole } from "./fonction"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import type { ValidationExpense, Demand } from "@/lib/interface"
import { PlusCircle, FileText, AlertCircle, CheckCircle, Clock, Ban, Loader2 } from "lucide-react"
import { fetchDemands , fetchValidationExpenses } from "@/store/schoolservice"

const disbursementFormSchema = z.object({
  pattern: z.string().min(5, {
    message: "Le motif doit contenir au moins 5 caractères.",
  }),
  amount: z.string().min(1, {
    message: "Le montant est requis.",
  }).refine((val) => !isNaN(Number(val.replace(/\s/g, ''))) && Number(val.replace(/\s/g, '')) > 0, {
    message: "Le montant doit être un nombre positif.",
  }),
})

export default function DisbursementRequestsPage() {
  const { userOnline, settings, demands, setDemands , users , setValidationExpenses } = useSchoolStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredRequests, setFilteredRequests] = useState<Demand[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requests = demands || []
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setFilteredRequests(requests)
  }, [requests])

  const form = useForm<z.infer<typeof disbursementFormSchema>>({
    resolver: zodResolver(disbursementFormSchema),
    defaultValues: {
      pattern: "",
      amount: "",
    },
  })

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? Number(amount.replace(/\s/g, '')) : amount
    const currency = settings[0]?.currency || "FCFA"
    return new Intl.NumberFormat("fr-FR").format(numAmount) + ` ${currency}`
  }

  const formatInputAmount = (value: string) => {
    const num = value.replace(/\s/g, '')
    if (num === '') return ''
    return new Intl.NumberFormat("fr-FR").format(Number(num))
  }

  const filteredByRole = useMemo(() => {
    return filterDemandsByUserRole(requests, userOnline)
  }, [requests, userOnline])

  const handleFilter = () => {
    let filtered = [...filteredByRole] // Utiliser la liste déjà filtrée par rôle

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.pattern.toLowerCase().includes(term) ||
          request.amount.toString().includes(term) ||
          request.applicant?.name.toLowerCase().includes(term),
      )
    }

    setFilteredRequests(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    handleFilter()
  }, [statusFilter, searchTerm, filteredByRole])

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approuvée": return "success"
      case "refusée": return "destructive"
      case "en attente": return "secondary"
      default: return "skyblue"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approuvée": return <CheckCircle className="h-4 w-4" />
      case "refusée": return <Ban className="h-4 w-4" />
      case "en attente": return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const onSubmit = async (values: z.infer<typeof disbursementFormSchema>) => {
    if (!userOnline) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande.",
        color: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const amountValue = Number(values.amount.replace(/\s/g, ''))
      const demandData = {
        applicant_id: userOnline.id,
        pattern: values.pattern,
        amount: amountValue,
        status: "en attente",
      }

      const demandResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/demand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(demandData),
      })

      if (!demandResponse.ok) {
        const errorData = await demandResponse.json()
        throw new Error(errorData.message || "Erreur lors de la création de la demande")
      }

      const newDemand = await demandResponse.json()

      let validatorId: number | null = null
      if (settings && Array.isArray(settings) && settings[0]?.expense_approval_level === 0) {
        // Si le niveau d'approbation est 0, l'utilisateur courant est le validateur
        validatorId = userOnline.id
      } else if (
        settings &&
        Array.isArray(settings) &&
        typeof settings[0]?.primary_validator === "string" &&
        settings[0]?.primary_validator.trim() !== ""
      ) {
        // Recherche du validateur principal par nom (insensible à la casse et aux accents)
        const normalizedPrimaryValidator = settings[0].primary_validator.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const usersValidator = users.find((user) =>
          typeof user.name === "string" &&
          user.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedPrimaryValidator
        )
        if (usersValidator) {
          validatorId = usersValidator.id
        }
      } else if (userOnline && userOnline.hierarchical_id) {
        // Sinon, on prend le supérieur hiérarchique s'il existe
        validatorId = userOnline.hierarchical_id
      }

      if (validatorId) {
        const validationData = {
          user_id: validatorId,
          demand_id: newDemand.id,
          validation_date: new Date().toISOString().split('T')[0],
          comment: "aucun",
          validation_order: 1,
          validation_status: "en attente",
        }

        const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/validationExpense`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validationData),
        })

        if (!validationResponse.ok) {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/demand/${newDemand.id}`, {
            method: 'DELETE',
          })
          
          const errorData = await validationResponse.json()
          throw new Error(errorData.message || "Erreur lors de la création de la validation")
        }

        const newValidation = await validationResponse.json()
        newDemand.validations = [newValidation]
      } else {
        // Aucun validateur trouvé: on annule la demande créée et on informe l'utilisateur
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/demand/${newDemand.id}`, {
          method: 'DELETE',
        })
        toast({
          title: "Aucun validateur",
          description: "Aucun validateur n'a été trouvé. Veuillez contacter l'administrateur ou vérifier les paramètres d'approbation.",
          color: "destructive",
        })
        return
      }

      const updatedDemands = await fetchDemands()
      setDemands(updatedDemands)
      const updateValidation = await fetchValidationExpenses()
      setValidationExpenses(updateValidation)

      
      toast({
        title: "Succès",
        description: "Votre demande de décaissement a été soumise avec succès.",
      })

      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        color: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle demande</DialogTitle>
            <DialogDescription>
              Remplissez les détails de votre demande de décaissement
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détaillez le motif de votre demande"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant ({settings[0]?.currency || "FCFA"})</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="0"
                          className="pl-2 pr-8"
                          {...field}
                          value={formatInputAmount(field.value)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '')
                            if (value === '' || /^\d+$/.test(value)) {
                              field.onChange(value)
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <div className="flex justify-around gap-2 w-full">
                <Button 
                 color="destructive"
                  type="button" 
                   
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button color="indigodye" type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Soumettre
                </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Demandes de décaissement</CardTitle>
          <Badge variant="outline">
            {filteredRequests.length} demande{filteredRequests.length !== 1 ? "s" : ""}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
              <Input
                placeholder="Rechercher..."
                className="w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="approuvée">Approuvée</SelectItem>
                  <SelectItem value="refusé">Refusée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              color="indigodye"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Button>
          </div>

          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell>{request.applicant?.name || "Inconnu"}</TableCell>
                      <TableCell className="max-w-xs truncate" title={request.pattern}>
                        {request.pattern}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(request.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          color={getStatusBadgeVariant(request.status)} 
                          className="capitalize"
                        >{request.status} {" "}
                          {getStatusIcon(request.status)}
                          
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={currentPage === 1 ? undefined : () => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-disabled={currentPage === 1}
                      tabIndex={currentPage === 1 ? -1 : 0}
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
                      onClick={currentPage === totalPages ? undefined : () => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-disabled={currentPage === totalPages}
                      tabIndex={currentPage === totalPages ? -1 : 0}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}