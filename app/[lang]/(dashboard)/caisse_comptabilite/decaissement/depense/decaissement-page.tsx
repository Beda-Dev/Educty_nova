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
import type { ValidationExpense, Transaction, Expense, User, Role, Setting } from "@/lib/interface"
import { toast } from "sonner"
import { generatePDFfromRef } from "@/lib/utils"
import { generationNumero } from "@/lib/fonction";
import { ProxiedImage } from "@/components/ImagesLogO/imageProxy";

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
    users,
    roles
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

  // Format currency
  const currency = settings[0]?.currency || "FCFA"

  // Format number with spaces
  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(num) ? '0' : num.toLocaleString('fr-FR')
  }

  // Parse formatted number
  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\s/g, '')
  }

  // Find user by id - returns undefined if not found
  const findUser = (userId: number | null | undefined): User | undefined => {
    if (!userId) return undefined;
    return users.find(user => user.id === userId);
  };

  // Find user role - handles null/undefined user
  const findUserRole = (user: User | null | undefined): string => {
    if (!user) return "N/A";
    const role = roles.find(role => role.id === user.roles[0]?.id);
    return role?.name || "N/A";
  };

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
      const amount = Number.parseFloat(parseFormattedNumber(formData.amount))
      const demandAmount = validation?.demand?.amount || 0

      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Le montant doit être un nombre positif."
      } else if (amount > demandAmount) {
        newErrors.amount = `Le montant ne peut pas être supérieur au montant de la demande (${formatNumber(demandAmount)} ${currency}).`
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
        total_amount: parseFormattedNumber(formData.amount),
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
        amount: parseFormattedNumber(formData.amount),
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
      <Card className="border-0">
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p>Chargement en cours...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!validation) {
    return (
      <Card className="border-0">
        <CardContent>
          <Alert color="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Validation non trouvée. Vérifiez l'ID de validation.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (success && createdTransaction && createdExpense) {
    return (
      <Card className="border-0">
        <CardContent className="max-w-4xl mx-auto p-4">
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
              users={users}
              roles={roles}
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
        </CardContent>
      </Card>
    )
  }

  // Get applicant and validator info from store
  const applicant = validation.demand?.applicant_id ? findUser(validation.demand.applicant_id) : null
  const applicantRole = findUserRole(applicant)
  
  const validator = validation.user_id ? findUser(validation.user_id) : null
  const validatorRole = findUserRole(validator)

  return (
    <Card className="border-0">
      <CardContent className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
            Effectuer un Décaissement
          </h1>
          <p className="text-gray-500 mt-1 text-base">
            Remplissez le formulaire ci-dessous pour enregistrer un décaissement suite à une demande validée.
          </p>
          {/* <p className="text-gray-600">Validation ID: {validationId}</p> */}
        </div>

        {/* Informations de la demande (non modifiable) */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Informations de la Demande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Demandeur</Label>
                <Input 
                  value={`${applicant?.name || "N/A"} (${applicantRole})`} 
                  readOnly 
                  className="bg-gray-100" 
                />
              </div>
              <div>
                <Label>Montant de la demande</Label>
                <Input 
                  value={`${formatNumber(validation.demand?.amount || 0)} ${currency}`} 
                  readOnly 
                  className="bg-gray-100" 
                />
              </div>
              <div>
                <Label>Motif</Label>
                <Input value={validation.demand?.pattern || "N/A"} readOnly className="bg-gray-100" />
              </div>
              <div>
                <Label>Statut</Label>
                <div className="flex items-center">
                  <Badge color={validation.demand?.status === "approuvée" ? "success" : "destructive"} className="mt-2">
                    {validation.demand?.status || "N/A"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de la validation (non modifiable) */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Informations de la Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Validaté par </Label>
                <Input 
                  value={`${validator?.name || "N/A"} (${validatorRole})`} 
                  readOnly 
                  className="bg-gray-100" 
                />
              </div>
              <div>
                <Label>Date de validation</Label>
                <Input
                  value={new Date(validation.validation_date).toLocaleDateString("fr-FR")}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label>Statut de validation</Label>
                <div className="flex items-center">
                  <Badge
                    color={validation.validation_status === "approuvée" ? "success" : "secondary"}
                    className="mt-2"
                  >
                    {validation.validation_status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Ordre de validation</Label>
                <Input value={validation.validation_order.toString()} readOnly className="bg-gray-100" />
              </div>
            </div>
            <div>
              <Label>Commentaire du validateur</Label>
              <Textarea value={validation.comment || "Aucun commentaire"} readOnly className="bg-gray-100" />
            </div>
          </CardContent>
        </Card>

        {/* Vérifications préalables */}
        {Object.keys(errors).length > 0 && (
          <Card className="border">
            <CardContent>
              <Alert color="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Message explicatif pour l'utilisateur */}
        <div className="mb-2 px-2 py-2 bg-blue-50 border border-blue-100 rounded text-blue-900 text-sm">
          <span>
            <strong>Note&nbsp;:</strong> Les champs ci-dessous sont à remplir pour effectuer le décaissement. Les autres informations sont affichées à titre indicatif et ne sont pas modifiables.
          </span>
        </div>

        {/* Formulaire de décaissement */}
        <Card className="border">
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
                  <Label htmlFor="amount">Montant ({currency}) *</Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    value={formData.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      const formattedValue = formatNumber(value)
                      setFormData((prev) => ({ ...prev, amount: formattedValue }))
                    }}
                    placeholder="Entrer le montant"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum: {formatNumber(validation.demand?.amount || 0)} {currency}
                  </p>
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
                    className={`bg-gray-100 ${!cashRegisterSessionCurrent ? "border-red-300" : ""}`}
                  />
                  {errors.session && <p className="text-sm text-red-600 mt-1">{errors.session}</p>}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button 
                  type="submit" 
                  disabled={submitting || !cashRegisterSessionCurrent} 
                  className="min-w-[120px]"
                  color="indigodye"
                >
                  {submitting ? "Traitement..." : "Effectuer le Décaissement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

// Composant pour le reçu de décaissement
interface DecaissementReceiptProps {
  validation: ValidationExpense
  transaction: Transaction
  expense: Expense
  settings: Setting[]
  users: User[]
  roles: Role[]
}

// Ajout utilitaire pour le matricule
  function getMatricule(applicant: any) {
    // Récupère les employés et professeurs depuis le store
    const employees = useSchoolStore.getState().employees || [];
    const professors = useSchoolStore.getState().professor || [];
    // Cherche dans les employés
    const emp = employees.find(e => e.user_id === applicant?.id);
    if (emp && emp.registration_number) return emp.registration_number;
    // Cherche dans les professeurs
    const prof = professors.find(p => p.user_id === applicant?.id);
    if (prof && prof.matricule) return prof.matricule;
    // Sinon, matricule généré
    const year = new Date().getFullYear();
    return `MAT${year}-${applicant?.id || "N/A"}`;
  }

// Nouveau composant Info pour affichage ligne
const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start">
    <span className="font-semibold min-w-[80px] text-[10px]">{label}:</span>
    <span className="text-gray-800 ml-1 text-[10px]">{value || "N/A"}</span>
  </div>
);


// Nouveau reçu compact
const ReceiptCopy = ({
  expense,
  validation,
  demand,
  cashier,
  schoolInfo,
  employees,
  professors,
  users, // Ajout du paramètre users
}: any) => {
  const isSamePerson = validation?.user_id === demand?.applicant_id;

  // Recherche du demandeur/bénéficiaire dans users
  const applicantUser = users?.find((u: any) => u.id === demand?.applicant_id);

  return (
    <div className="p-2 bg-white rounded-lg" style={{ fontSize: "12px" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-2 mb-2">
        <div className="flex items-start gap-2">
          {schoolInfo.logo ? (
            <ProxiedImage
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${schoolInfo.logo}`}
            alt="Logo"
            width={60}
            height={60}
            className="school-logo object-contain"
            style={{ maxWidth: '80px', maxHeight: '80px' }}
            fallbackComponent={
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                
              </div>
            }
          />
          ) : (
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
             
            </div>
          )}
          <div className="space-y-0">
            <h1 className="text-xs font-bold leading-snug">{schoolInfo.name}</h1>
            <p className="text-[10px] text-gray-600 leading-snug">
              {schoolInfo.address} | Tél: {schoolInfo.phone}
            </p>
            {schoolInfo.email && (
              <p className="text-[10px] text-gray-600 leading-snug">
                Email: {schoolInfo.email}
              </p>
            )}
          </div>
        </div>
        <div className="text-right space-y-0">
          <h2 className="text-xs font-semibold leading-snug">REÇU DE DÉCAISSEMENT</h2>
          <p className="text-[10px] text-gray-600 leading-snug">
            {generationNumero(expense.id.toString(), expense.created_at, "decaissement")}
          </p>
          <p className="text-[10px] text-gray-600 leading-snug">
            Date: {new Date(expense.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      <Card className="print:shadow-none border-0">
        <CardContent className="p-2 space-y-2">
          {/* Expense Info */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-blue-800 mb-1">INFORMATIONS DU DÉCAISSEMENT</h3>
            <div className="grid grid-cols-2 gap-x-1">
              <Info label="Motif" value={expense.label} />
              <Info label="Type de dépense" value={expense.expense_type.name} />
              <Info label="Montant" value={`${Number(expense.amount).toLocaleString()} ${schoolInfo.currency}`} />
              <Info label="Caisse" value={expense.cash_register.cash_register_number} />
              <Info label="Caissier" value={cashier?.name || ""} />
              <Info label="Demandeur" value={applicantUser?.name || demand?.applicant?.name || ""} />
              <Info label="Matricule Demandeur" value={getMatricule(demand?.applicant)} />
              <Info label="Bénéficiaire" value={applicantUser?.name || demand?.applicant?.name || ""} />
            </div>
          </div>

          <Separator className="my-1" />

          {/* Demand Info */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-blue-800 mb-1">DEMANDE</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <Info label="Motif" value={demand?.pattern || ""} />
              <Info label="Date demande" value={demand?.created_at ? new Date(demand.created_at).toLocaleDateString("fr-FR") : ""} />
              <Info label="Statut" value={demand?.status || ""} />
            </div>
          </div>

          <Separator className="my-1" />

          {/* Validation Info - Only show if not same person */}
          {!isSamePerson && (
            <>
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-blue-800 mb-1">VALIDATION</h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <Info label="Approuvée par" value={validation.user?.name || ""} />
                  <Info label="Date validation" value={validation.validation_date ? new Date(validation.validation_date).toLocaleDateString("fr-FR") : ""} />
                  <Info label="Commentaire" value={validation.comment || "Aucun"} />
                </div>
              </div>
              <Separator className="my-1" />
            </>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-[10px] text-gray-700 text-center space-y-1">
              <div className="border-t border-gray-400 h-8 w-32 mx-auto"></div>
              <span>Signature du bénéficiaire</span>
            </div>
            <div className="text-[10px] text-gray-700 text-center space-y-1">
              <div className="border-t border-gray-400 h-8 w-32 mx-auto"></div>
              <span>Cachet et signature de l'établissement</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-600 mt-2 pt-2 border-t">
            <p className="mb-0">Document officiel de {schoolInfo.name}</p>
            <p>
              Émis le {expense.created_at ? new Date(expense.created_at).toLocaleDateString("fr-FR") : ""} à {expense.created_at ? new Date(expense.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Remplacement du composant DecaissementReceipt
const DecaissementReceipt = ({
  validation,
  transaction,
  expense,
  settings,
  users,
  roles,
}: DecaissementReceiptProps) => {
  // const applicant = validation.demand && validation.demand.applicant_id ? users.find(user => user.id === validation.demand.applicant_id) : null;
  const demand = validation.demand;
  const cashier = transaction.user_id ? users.find(user => user.id === transaction.user_id) : null;
  const employees = useSchoolStore.getState().employees || [];
  const professors = useSchoolStore.getState().professor || [];
  const schoolInfo = {
    logo: settings?.[0]?.establishment_logo || "",
    name: settings?.[0]?.establishment_name || "Nom Établissement",
    address: settings?.[0]?.address || "Adresse établissement",
    phone:
      `${settings?.[0]?.establishment_phone_1 || ""} ${settings?.[0]?.establishment_phone_2 ? "/ " + settings?.[0]?.establishment_phone_2 : ""}`.trim(),
    currency: settings?.[0]?.currency || "FCFA",
    email: settings?.[0]?.email || "",
  };

  // Affiche deux exemplaires du reçu, séparés
  return (
    <div>
      <ReceiptCopy
        expense={expense}
        validation={validation}
        demand={demand}
        cashier={cashier}
        schoolInfo={schoolInfo}
        employees={employees}
        professors={professors}
        users={users}
      />
      <div className="text-[10px] text-center text-gray-500 my-2">
        ---------------------------- ----------------------------
      </div>
      <ReceiptCopy
        expense={expense}
        validation={validation}
        demand={demand}
        cashier={cashier}
        schoolInfo={schoolInfo}
        employees={employees}
        professors={professors}
        users={users}
      />
    </div>
  );
};