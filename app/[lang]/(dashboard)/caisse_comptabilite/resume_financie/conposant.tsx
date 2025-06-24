"use client"

import { useState, useMemo } from "react"
import { useSchoolStore } from "@/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Search, User, Calendar, CreditCard, AlertCircle, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Student, Pricing, Installment, Payment , Registration} from "@/lib/interface"
import { useRouter } from "next/navigation"


interface StudentFinancialData {
  student: Student
  applicablePricing: Pricing[]
  totalDue: number
  totalPaid: number
  totalRemaining: number
  overdueAmount: number
  registration: Registration
  installmentDetails: {
    installment: Installment
    pricing: Pricing
    payments: Payment[]
    amountPaid: number
    remainingAmount: number
    isOverdue: boolean
  }[]
}

export default function FinancialSummaryPage() {
  const { registrations, students, pricing, installements, payments, academicYearCurrent, settings, levels , classes } =
    useSchoolStore()
  const router = useRouter()  

  // Fonction utilitaire pour formater les montants avec devise
  function formatAmount(amount: number | string) {
    const currency = settings[0]?.currency || "FCFA"
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount;
    if (isNaN(num)) return `0 ${currency}`;
    return `${num.toLocaleString('fr-FR').replace(/,/g, ' ')} ${currency}`;
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [open, setOpen] = useState(false)
  const [currentClass, setCurrentClass] = useState("")
  const [currentLevel, setCurrentLevel] = useState("")

  // Filtrer les élèves inscrits pour l'année académique courante
  const currentYearStudents = useMemo(() => {
    const currentRegistrations = registrations.filter((reg) => reg.academic_year_id === academicYearCurrent.id)

    return currentRegistrations
      .map((reg) => {
        const student = students.find((s) => s.id === reg.student_id)
        return student ? { ...student, registration: reg } : null
      })
      .filter(Boolean) as (Student & { registration: any })[]
  }, [registrations, students, academicYearCurrent])

  // Filtrer les élèves selon le terme de recherche
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return []

    return currentYearStudents.filter(
      (student) =>
        student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.first_name} ${student.name}`.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [currentYearStudents, searchTerm])

  // Calculer les données financières de l'élève sélectionné
  const financialData = useMemo((): StudentFinancialData | null => {
    if (!selectedStudent) return null

    const studentRegistration = registrations.find(
      (reg) => reg.student_id === selectedStudent.id && reg.academic_year_id === academicYearCurrent.id,
    )
    setCurrentClass(studentRegistration?.classe.label || "")
    const niveauCurrent = levels.find((level) => Number(level.id) === Number(studentRegistration?.classe.level_id))
    setCurrentLevel(niveauCurrent?.label || "")

    if (!studentRegistration) return null

    // Trouver les pricing applicables
    const applicablePricing = pricing.filter(
      (p) =>
        p.assignment_type_id === selectedStudent.assignment_type_id &&
        p.academic_years_id === academicYearCurrent.id &&
        p.level_id === studentRegistration.classe.level_id,
    )

    // Calculer les détails des échéances
    const installmentDetails = []
    let totalDue = 0
    let totalPaid = 0
    let overdueAmount = 0

    for (const pricingItem of applicablePricing) {
      const pricingInstallments = installements.filter((inst) => inst.pricing_id === pricingItem.id)

      for (const installment of pricingInstallments) {
        const installmentPayments = payments.filter(
          (p) => p.installment_id === installment.id && p.student_id === selectedStudent.id,
        )

        const amountPaid = installmentPayments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount), 0)
        const amountDue = Number.parseFloat(installment.amount_due)
        const remainingAmount = amountDue - amountPaid
        const isOverdue = new Date(installment.due_date) < new Date() && remainingAmount > 0

        totalDue += amountDue
        totalPaid += amountPaid

        if (isOverdue) {
          overdueAmount += remainingAmount
        }

        installmentDetails.push({
          installment,
          pricing: pricingItem,
          payments: installmentPayments,
          amountPaid,
          remainingAmount,
          isOverdue,
        })
      }
    }

    return {
      student: selectedStudent,
      applicablePricing,
      totalDue,
      totalPaid,
      totalRemaining: totalDue - totalPaid,
      overdueAmount,
      registration: studentRegistration,
      installmentDetails,
    }
  }, [selectedStudent, registrations, academicYearCurrent, pricing, installements, payments])


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">


      {/* Recherche d'élève */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher un élève
          </CardTitle>
          <CardDescription>Recherchez par matricule, nom ou prénom</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    {selectedStudent
                      ? `${selectedStudent.registration_number} - ${selectedStudent.first_name} ${selectedStudent.name}`
                      : "Sélectionner un élève..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Rechercher un élève..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun élève trouvé.</CommandEmpty>
                      <CommandGroup>
                        {filteredStudents.map((student) => (
                          <CommandItem
                            key={student.id}
                            value={`${student.registration_number} ${student.first_name} ${student.name}`}
                            onSelect={() => {
                              setSelectedStudent(student)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedStudent?.id === student.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {student.first_name} {student.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {student.registration_number} - {student.assignment_type.label}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      {financialData && (
        <div className="space-y-6">
          {/* Informations de l'élève */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations de l'élève
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nom complet</Label>
                  <p className="text-lg font-semibold">
                    {financialData.student.first_name} {financialData.student.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Matricule</Label>
                  <p className="text-lg font-semibold">{financialData.student.registration_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type d'affectation</Label>
                  <p className="text-lg font-semibold">{financialData.student.assignment_type.label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Classe</Label>
                  <p className="text-lg font-semibold">{financialData.registration?.classe?.label ?? "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Niveau</Label>
                  <p className="text-lg font-semibold">
                    {levels.find(
                      (level) =>
                        level.id ===
                        classes.find((classe) => classe.id === financialData.registration?.class_id)?.level_id,
                    )?.label ?? "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date d'inscription</Label>
                  <p className="text-lg font-semibold">{financialData.registration?.registration_date ?? "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Résumé des montants */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total dû</p>
                    <p className="text-2xl font-bold">{formatAmount(financialData.totalDue)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total payé</p>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(financialData.totalPaid)}</p>
                  </div>
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reste à payer</p>
                    <p className="text-2xl font-bold text-orange-600">{formatAmount(financialData.totalRemaining)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En retard</p>
                    <p className="text-2xl font-bold text-red-600">{formatAmount(financialData.overdueAmount)}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détail des échéances */}
          <Card>
            <CardHeader>
              <CardTitle>Détail des échéances</CardTitle>
              <CardDescription>Liste complète des frais, échéances et paiements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type de frais</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant dû</TableHead>
                    <TableHead>Montant payé</TableHead>
                    <TableHead>Reste</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.installmentDetails.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{detail.pricing.label}</p>
                          <p className="text-sm text-muted-foreground">{detail.pricing.fee_type.label}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(detail.installment.due_date)}</TableCell>
                      <TableCell>{formatAmount(Number.parseFloat(detail.installment.amount_due))}</TableCell>
                      <TableCell className="text-green-600">{formatAmount(detail.amountPaid)}</TableCell>
                      <TableCell className={detail.remainingAmount > 0 ? "text-orange-600" : "text-green-600"}>
                        {formatAmount(detail.remainingAmount)}
                      </TableCell>
                      <TableCell>
                        {detail.remainingAmount === 0 ? (
                          <Badge color="default" className="bg-green-100 text-green-800">
                            Payé
                          </Badge>
                        ) : detail.isOverdue ? (
                          <Badge color="destructive">En retard</Badge>
                        ) : (
                          <Badge color="warning">En attente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Liste des paiements effectués */}
          {financialData.installmentDetails.some((detail) => detail.payments.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des paiements</CardTitle>
                <CardDescription>Tous les paiements effectués par l'élève</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type de frais</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Caissier</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.installmentDetails
                      .flatMap((detail) =>
                        detail.payments.map((payment) => ({
                          ...payment,
                          pricingLabel: detail.pricing.label,
                        })),
                      )
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(payment.created_at)}</TableCell>
                          <TableCell>{payment.pricingLabel}</TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {formatAmount(Number.parseFloat(payment.amount))}
                          </TableCell>
                          <TableCell>{payment.cashier.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/caisse_comptabilite/encaissement/historique_paiement/${payment.id}`)}
                              
                            >
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Boutons d'impression pour les paiements existants */}
          {/* {financialData.installmentDetails.some((detail) => detail.payments.length > 0) && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Imprimer les reçus</h4>
              <div className="flex flex-wrap gap-2">
                {financialData.installmentDetails
                  .flatMap((detail) => detail.payments)
                  .filter((payment, index, self) =>
                    // Filtrer les paiements uniques par transaction_id s'il existe
                    payment.transaction_id
                      ? self.findIndex((p) => p.transaction_id === payment.transaction_id) === index
                      : true,
                  )
                  .map((payment, index) => {
                    // Regrouper les paiements par transaction si possible
                    const relatedPayments = payment.transaction_id
                      ? financialData.installmentDetails
                        .flatMap((detail) => detail.payments)
                        .filter((p) => p.transaction_id === payment.transaction_id)
                      : [payment]

                    const transaction = {
                      id: payment.transaction_id || payment.id,
                      user_id: payment.cashier_id,
                      cash_register_session_id: payment.cash_register_id,
                      transaction_date: payment.created_at,
                      total_amount: relatedPayments.reduce((sum, p) => sum + Number(p.amount), 0).toString(),
                      transaction_type: "encaissement",
                      created_at: payment.created_at,
                      updated_at: payment.updated_at,
                    }



                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => { router.push(`/caisse_comptabilite/encaissement/historique_paiement/${payment.id}`) }}
                      >
                        Reçu #{payment.transaction_id || payment.id}
                      </Button>
                    )
                  })}
              </div>
            </div>
          )} */}
        </div>
      )}

      {!selectedStudent && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun élève sélectionné</h3>
            <p className="text-muted-foreground">
              Utilisez la barre de recherche ci-dessus pour trouver et sélectionner un élève
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
