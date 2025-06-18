"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Download, Printer, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchoolStore } from "@/store"
import { fetchExpenses, fetchTransactions } from "@/store/schoolservice"
import type { ValidationExpense, Transaction, Expense } from "@/lib/interface"
import { toast } from "sonner"
import { generatePDFfromRef } from "@/lib/utils"
import Image from "next/image"

interface DecaissementPageProps {
  validationId: number
  onNewDecaissement?: () => void
}

export default function DecaissementPage({ validationId, onNewDecaissement }: DecaissementPageProps) {
  const {
    validationExpenses,
    expenseTypes,
    cashRegisterSessionCurrent,
    userOnline,
    settings,
    setExpenses,
    setTransactions,
  } = useSchoolStore()

  const [validation, setValidation] = useState<ValidationExpense | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null)
  const [createdExpense, setCreatedExpense] = useState<Expense | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    expense_type_id: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const printRef = useRef<HTMLDivElement>(null)

  // Recherche de la validation dans le store
  useEffect(() => {
    if (validationExpenses.length > 0) {
      const foundValidation = validationExpenses.find((v) => v.id === validationId)
      if (foundValidation) {
        setValidation(foundValidation)
      }
      setLoading(false)
    }
  }, [validationId, validationExpenses])

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Vérification de la session de caisse
    if (!cashRegisterSessionCurrent) {
      newErrors.session = "Aucune session de caisse active. Veuillez ouvrir une session de caisse."
    }

    // Vérification du type de dépense
    if (!formData.expense_type_id) {
      newErrors.expense_type_id = "Le type de dépense est requis."
    }

    // Vérification du montant
    if (!formData.amount) {
      newErrors.amount = "Le montant est requis."
    } else {
      const amount = Number.parseFloat(formData.amount)
      const demandAmount = validation?.demand?.amount || 0

      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Le montant doit être un nombre positif."
      } else if (amount > demandAmount) {
        newErrors.amount = `Le montant ne peut pas être supérieur au montant de la demande (${demandAmount} FCFA).`
      }
    }

    // Vérification de la date
    if (!formData.expense_date) {
      newErrors.expense_date = "La date de dépense est requise."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !validation || !userOnline || !cashRegisterSessionCurrent) {
      return
    }

    setSubmitting(true)
    let transactionId: number | null = null

    try {
      // 1. Créer la transaction
      const transactionData = {
        user_id: userOnline.id,
        cash_register_session_id: cashRegisterSessionCurrent.id,
        transaction_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        total_amount: formData.amount,
        transaction_type: "decaissement",
      }

      const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      if (!transactionResponse.ok) {
        throw new Error("Erreur lors de la création de la transaction")
      }

      const transactionResult = await transactionResponse.json()
      transactionId = transactionResult.id
      setCreatedTransaction(transactionResult)

      // 2. Créer la dépense
      const expenseData = {
        expense_type_id: Number.parseInt(formData.expense_type_id),
        cash_register_id: cashRegisterSessionCurrent.cash_register_id,
        label: expenseTypes.find((et) => et.id === Number.parseInt(formData.expense_type_id))?.name || "Décaissement",
        amount: formData.amount,
        expense_date: formData.expense_date,
        transaction_id: transactionId,
        validation_expense_id: validation.id,
      }

      const expenseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      })

      if (!expenseResponse.ok) {
        // Si la création de la dépense échoue, supprimer la transaction
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transaction/${transactionId}`, {
          method: "DELETE",
        })
        throw new Error("Erreur lors de la création de la dépense")
      }

      const expenseResult = await expenseResponse.json()
      setCreatedExpense(expenseResult)

      // 3. Mettre à jour le store
      const [expensesData, transactionsData] = await Promise.all([fetchExpenses(), fetchTransactions()])

      setExpenses(expensesData)
      setTransactions(transactionsData)

      setSuccess(true)
      toast.success("Décaissement effectué avec succès")
    } catch (error) {
      console.error("Erreur lors du décaissement:", error)
      toast.error("Erreur lors du décaissement")
    } finally {
      setSubmitting(false)
    }
  }

  const generatePDF = async (action: "download" | "print") => {
    if (!printRef.current) return

    try {
      generatePDFfromRef(printRef, `recu_decaissement_${validation?.id}`, action)
    } catch (error) {
      console.error("Erreur PDF:", error)
      toast.error("Erreur lors de la génération du PDF")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!validation) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Validation non trouvée. Vérifiez l'ID de validation.</AlertDescription>
      </Alert>
    )
  }

  if (success && createdTransaction && createdExpense) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-green-600">Décaissement Réussi</h1>
          </div>
          <p className="text-gray-600">Le décaissement a été effectué avec succès</p>
        </div>

        <div ref={printRef}>
          <DecaissementReceipt
            validation={validation}
            transaction={createdTransaction}
            expense={createdExpense}
            settings={settings}
          />
        </div>

        <div className="flex justify-center gap-3 mt-6 print:hidden">
          <Button onClick={() => generatePDF("print")} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={() => generatePDF("download")} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button
            onClick={() => {
              if (onNewDecaissement) {
                onNewDecaissement()
              } else {
                setSuccess(false)
                setFormData({
                  expense_type_id: "",
                  amount: "",
                  expense_date: new Date().toISOString().split("T")[0],
                })
              }
            }}
            color="indigodye"
          >
            Nouveau Décaissement
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Page de Décaissement</h1>
        <p className="text-gray-600">Validation ID: {validationId}</p>
      </div>

      {/* Informations de la demande (non modifiable) */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la Demande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Demandeur</Label>
              <Input value={validation.demand?.applicant?.name || "N/A"} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Montant de la demande</Label>
              <Input value={`${validation.demand?.amount || 0} FCFA`} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Motif</Label>
              <Input value={validation.demand?.pattern || "N/A"} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Statut</Label>
              <div className="flex items-center">
                <Badge color={validation.demand?.status === "approuvée" ? "skyblue" : "secondary"} className="mt-2">
                  {validation.demand?.status || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations de la validation (non modifiable) */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Validateur</Label>
              <Input value={validation.user?.name || "N/A"} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Date de validation</Label>
              <Input
                value={new Date(validation.validation_date).toLocaleDateString("fr-FR")}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Statut de validation</Label>
              <div className="flex items-center">
                <Badge
                  color={validation.validation_status === "approuvée" ? "skyblue" : "secondary"}
                  className="mt-2"
                >
                  {validation.validation_status}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Ordre de validation</Label>
              <Input value={validation.validation_order.toString()} readOnly className="bg-gray-50" />
            </div>
          </div>
          <div>
            <Label>Commentaire du validateur</Label>
            <Textarea value={validation.comment || "Aucun commentaire"} readOnly className="bg-gray-50" />
          </div>
        </CardContent>
      </Card>

      {/* Vérifications préalables */}
      {Object.keys(errors).length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Formulaire de décaissement */}
      <Card>
        <CardHeader>
          <CardTitle>Formulaire de Décaissement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense_type_id">Type de dépense *</Label>
                <Select
                  value={formData.expense_type_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, expense_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de dépense" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.expense_type_id && <p className="text-sm text-red-600 mt-1">{errors.expense_type_id}</p>}
              </div>

              <div>
                <Label htmlFor="amount">Montant (FCFA) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={validation.demand?.amount || 0}
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="Entrer le montant"
                />
                <p className="text-sm text-gray-500 mt-1">Maximum: {validation.demand?.amount || 0} FCFA</p>
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
              </div>

              <div>
                <Label htmlFor="expense_date">Date de dépense *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expense_date: e.target.value }))}
                />
                {errors.expense_date && <p className="text-sm text-red-600 mt-1">{errors.expense_date}</p>}
              </div>

              <div>
                <Label>Session de caisse actuelle</Label>
                <Input
                  value={
                    cashRegisterSessionCurrent
                      ? `${cashRegisterSessionCurrent.cash_register.cash_register_number} - ${cashRegisterSessionCurrent.user.name}`
                      : "Aucune session active"
                  }
                  readOnly
                  className={`bg-gray-50 ${!cashRegisterSessionCurrent ? "border-red-300" : ""}`}
                />
                {errors.session && <p className="text-sm text-red-600 mt-1">{errors.session}</p>}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={submitting || !cashRegisterSessionCurrent} className="min-w-[120px]">
                {submitting ? "Traitement..." : "Effectuer le Décaissement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant pour le reçu de décaissement
interface DecaissementReceiptProps {
  validation: ValidationExpense
  transaction: Transaction
  expense: Expense
  settings: any[]
}

const DecaissementReceipt = ({ validation, transaction, expense, settings }: DecaissementReceiptProps) => {
  const schoolInfo = {
    logo: settings?.[0]?.establishment_logo || "",
    name: settings?.[0]?.establishment_name || "Nom Établissement",
    address: settings?.[0]?.address || "Adresse établissement",
    phone:
      `${settings?.[0]?.establishment_phone_1 || ""} ${settings?.[0]?.establishment_phone_2 ? "/ " + settings?.[0]?.establishment_phone_2 : ""}`.trim(),
    currency: settings?.[0]?.currency || "FCFA",
  }

  const generateReceiptNumber = (id: number) => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    return `DEC${year}${month}${id.toString().padStart(4, "0")}`
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-6">
        <div className="flex items-start gap-4">
          {schoolInfo.logo ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
              alt="Logo"
              width={80}
              height={80}
              className="school-logo"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              Logo
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-lg font-bold">{schoolInfo.name}</h1>
            <p className="text-sm text-gray-600">{schoolInfo.address}</p>
            <p className="text-sm text-gray-600">Tél: {schoolInfo.phone}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-lg font-semibold text-red-600">REÇU DE DÉCAISSEMENT</h2>
          <p className="text-sm text-gray-600">N° {generateReceiptNumber(transaction.id)}</p>
          <p className="text-sm text-gray-600">
            Date: {new Date(transaction.transaction_date).toLocaleDateString("fr-FR")}
          </p>
          <p className="text-sm text-gray-600">
            Heure: {new Date(transaction.transaction_date).toLocaleTimeString("fr-FR")}
          </p>
        </div>
      </div>

      {/* Informations principales */}
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-blue-800 mb-3">DÉTAILS DU DÉCAISSEMENT</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Demandeur:</span>
              <p className="text-gray-800">{validation.demand?.applicant?.name}</p>
            </div>
            <div>
              <span className="font-medium">Validateur:</span>
              <p className="text-gray-800">{validation.user?.name}</p>
            </div>
            <div>
              <span className="font-medium">Motif:</span>
              <p className="text-gray-800">{validation.demand?.pattern}</p>
            </div>
            <div>
              <span className="font-medium">Type de dépense:</span>
              <p className="text-gray-800">{expense.expense_type?.name}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Montants */}
        <div>
          <h3 className="text-md font-semibold text-blue-800 mb-3">MONTANTS</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Montant demandé:</span>
              <span className="font-medium">
                {validation.demand?.amount?.toLocaleString()} {schoolInfo.currency}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-red-600">
              <span>Montant décaissé:</span>
              <span>
                {Number.parseFloat(expense.amount).toLocaleString()} {schoolInfo.currency}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Informations de transaction */}
        <div>
          <h3 className="text-md font-semibold text-blue-800 mb-3">INFORMATIONS DE TRANSACTION</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">ID Transaction:</span>
              <p className="text-gray-800">{transaction.id}</p>
            </div>
            <div>
              <span className="font-medium">ID Dépense:</span>
              <p className="text-gray-800">{expense.id}</p>
            </div>
            <div>
              <span className="font-medium">Caissier:</span>
              <p className="text-gray-800">{transaction.user?.name}</p>
            </div>
            <div>
              <span className="font-medium">Date de dépense:</span>
              <p className="text-gray-800">{new Date(expense.expense_date).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="text-center space-y-4">
            <div className="border-t border-gray-400 h-12"></div>
            <span className="text-sm text-gray-700">Signature du bénéficiaire</span>
          </div>
          <div className="text-center space-y-4">
            <div className="border-t border-gray-400 h-12"></div>
            <span className="text-sm text-gray-700">Cachet et signature de l'établissement</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 mt-8 pt-4 border-t">
          <p className="mb-1">Document officiel de {schoolInfo.name}</p>
          <p>
            Émis le {new Date().toLocaleDateString("fr-FR")} à{" "}
            {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-2 text-red-600 font-medium">⚠️ Ce reçu fait foi de décaissement</p>
        </div>
      </div>
    </div>
  )
}
